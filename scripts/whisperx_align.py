#!/usr/bin/env python3
"""
Force-align story narration audio to the known script with WhisperX,
then map timings onto the exact spoken-token list used by the Nuxt app.

Usage (from repo root, with .venv active):
  python scripts/whisperx_align.py \
    --audio /tmp/publix-audio/narration.mp3 \
    --out data/alignments/moment-that-sparked-everything-2.json
"""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

import whisperx
from whisperx.audio import SAMPLE_RATE


# Keep in sync with data/story.ts spoken-word order from buildStoryTimeline().
STORY_SPOKEN: list[str] = []


def _tokenize(text: str) -> list[str]:
    return re.findall(r"\S+", text)


def build_spoken_words() -> list[str]:
    spoken, _ranges = build_spoken_and_phrase_ranges()
    return spoken


def build_spoken_and_phrase_ranges() -> tuple[list[str], list[tuple[int, int]]]:
    """
    Keep in sync with data/story.ts buildStoryTimeline() + buildPhraseRanges().
    Quote lines are one phrase each (Chinese + full translation).
    """
    blocks = [
        "In the winter of 2022, during the COVID lockdown, Beijing was unusually quiet. Most students had already left campus. My friend and I were among the few who remained in the dormitories.",
        "One afternoon, I was asleep when I heard something outside. The sound of machines moving along the road below my window. They kept passing by, again and again. Curious, I wondered what they were.",
        "I went downstairs and called my friend to join me.",
        "What we saw was unforgettable.",
        "A fleet of twelve autonomous Meituan delivery robots was moving across the empty campus. Twelve robots. No drivers. No remote controls. Just machines navigating on their own.",
        "As they moved, they spoke to people in Chinese.",
    ]
    quotes = [
        ("请让一让，谢谢", "Please make way. Thank you."),
        ("您的外卖已到达", "Your delivery has arrived"),
        ("请注意避让", "Please watch out"),
    ]
    tail = [
        "I decided to test one. I stood directly in front of it. The robot stopped immediately. It detected me, adjusted its route, and continued on its way. I took a photo to remember the moment.",
        "That experience stayed with me. I kept asking myself the same questions: How can a machine see? How can it understand the world around it? How can it communicate with people?",
        "The search for those answers eventually led me into Natural Language Processing and Computer Vision.",
        "It didn't begin with a textbook or a classroom lecture. It began with a delivery robot carrying lunch through a silent university campus, speaking Chinese to students like us during a time when the world seemed to stand still.",
    ]

    spoken: list[str] = []
    ranges: list[tuple[int, int]] = []

    def add_prose(text: str) -> None:
        tokens = _tokenize(text)
        start = None
        last = None
        for token in tokens:
            idx = len(spoken)
            spoken.append(token)
            if start is None:
                start = idx
            last = idx
            if re.search(r"[.!?…]['\"”']?$", token):
                ranges.append((start, last))
                start = None
                last = None
        if start is not None and last is not None:
            ranges.append((start, last))

    for b in blocks:
        add_prose(b)
    for chinese, translation in quotes:
        start = len(spoken)
        spoken.append(chinese)
        spoken.extend(_tokenize(translation))
        ranges.append((start, len(spoken) - 1))
    for b in tail:
        add_prose(b)

    return spoken, ranges


def assign_phrases(words: list[dict], ranges: list[tuple[int, int]]) -> list[dict]:
    phrases = []
    for phrase_id, (start_i, end_i) in enumerate(ranges):
        phrases.append(
            {
                "id": phrase_id,
                "startIndex": start_i,
                "endIndex": end_i,
                "start": words[start_i]["start"],
                "end": words[end_i]["end"],
            }
        )
        for idx in range(start_i, end_i + 1):
            words[idx]["phraseId"] = phrase_id
    return phrases


def normalize_token(token: str) -> str:
    t = unicodedata.normalize("NFKC", token).lower()
    t = t.replace("\u2019", "'").replace("\u2018", "'")
    t = re.sub(r"[^\w\u3400-\u9fff']+", "", t, flags=re.UNICODE)
    return t


def is_cjk(token: str) -> bool:
    return bool(re.search(r"[\u3400-\u9fff]", token))


def script_for_alignment(spoken: list[str]) -> str:
    """
    Build alignment text. Keep Chinese phrases — WhisperX English aligner
    may skip them; we interpolate those slots afterward.
    """
    return " ".join(spoken)


def extract_aligned_words(aligned: dict) -> list[dict]:
    words: list[dict] = []
    # Prefer word_segments when present
    if aligned.get("word_segments"):
        for w in aligned["word_segments"]:
            text = (w.get("word") or w.get("text") or "").strip()
            if not text or w.get("start") is None or w.get("end") is None:
                continue
            words.append({"word": text, "start": float(w["start"]), "end": float(w["end"])})
        return words

    for seg in aligned.get("segments") or []:
        for w in seg.get("words") or []:
            text = (w.get("word") or w.get("text") or "").strip()
            if not text or w.get("start") is None or w.get("end") is None:
                continue
            words.append({"word": text, "start": float(w["start"]), "end": float(w["end"])})
    return words


def tokens_compatible(script_tok: str, align_tok: str) -> bool:
    sn = normalize_token(script_tok)
    an = normalize_token(align_tok)
    if not sn or not an:
        return False
    if sn == an:
        return True
    if sn in an or an in sn:
        return True
    # Ignore pure CJK vs latin mismatches
    if is_cjk(script_tok) != is_cjk(align_tok):
        return False
    return False


def map_to_script(spoken: list[str], aligned_words: list[dict], duration: float) -> list[dict]:
    """
    Needleman–Wunsch mapping of WhisperX words onto exact story tokens.
    Unmatched script tokens (often CJK) are interpolated between neighbors.
    """
    n = len(spoken)
    m = len(aligned_words)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    bt: list[list[tuple[str, int, int] | None]] = [[None] * (m + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        dp[i][0] = -i
        bt[i][0] = ("skip_s", i - 1, 0)
    for j in range(1, m + 1):
        dp[0][j] = -j
        bt[0][j] = ("skip_a", 0, j - 1)

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            compatible = tokens_compatible(spoken[i - 1], aligned_words[j - 1]["word"])
            sn = normalize_token(spoken[i - 1])
            an = normalize_token(aligned_words[j - 1]["word"])
            if compatible and sn == an:
                match_score = 3
            elif compatible:
                match_score = 1
            else:
                match_score = -3
            candidates = [
                (dp[i - 1][j - 1] + match_score, "match", i - 1, j - 1),
                (dp[i - 1][j] - 1, "skip_s", i - 1, j),
                (dp[i][j - 1] - 1, "skip_a", i, j - 1),
            ]
            best = max(candidates, key=lambda x: x[0])
            dp[i][j] = best[0]
            bt[i][j] = (best[1], best[2], best[3])

    assignment: list[dict | None] = [None] * n
    i, j = n, m
    while i > 0 or j > 0:
        cell = bt[i][j]
        if cell is None:
            break
        op, pi, pj = cell
        if op == "match":
            if tokens_compatible(spoken[i - 1], aligned_words[j - 1]["word"]):
                assignment[i - 1] = {
                    "start": float(aligned_words[j - 1]["start"]),
                    "end": float(aligned_words[j - 1]["end"]),
                }
            i, j = pi, pj
        else:
            i, j = pi, pj

    # Fill missing ranges once
    idx = 0
    while idx < n:
        if assignment[idx] is not None:
            idx += 1
            continue
        start_miss = idx
        while idx < n and assignment[idx] is None:
            idx += 1
        end_miss = idx - 1
        prev_i = start_miss - 1
        next_i = end_miss + 1
        left = assignment[prev_i]["end"] if prev_i >= 0 and assignment[prev_i] else 0.0
        right = (
            assignment[next_i]["start"]
            if next_i < n and assignment[next_i]
            else duration
        )
        gap = max(0.08, float(right) - float(left))
        weights = [1.6 if is_cjk(spoken[k]) else 1.0 for k in range(start_miss, end_miss + 1)]
        total_w = sum(weights) or 1.0
        t0 = float(left)
        for offset, w in enumerate(weights):
            dur = gap * (w / total_w)
            assignment[start_miss + offset] = {
                "start": t0,
                "end": t0 + max(0.05, dur * 0.9),
            }
            t0 += dur

    result: list[dict] = []
    for token, timing in zip(spoken, assignment):
        assert timing is not None
        result.append(
            {
                "word": token,
                "start": round(float(timing["start"]), 3),
                "end": round(float(timing["end"]), 3),
            }
        )

    for i in range(1, len(result)):
        if result[i]["start"] < result[i - 1]["end"]:
            result[i]["start"] = result[i - 1]["end"]
        if result[i]["end"] <= result[i]["start"]:
            result[i]["end"] = round(result[i]["start"] + 0.08, 3)

    return result


def run_whisperx(audio_path: Path, spoken: list[str], device: str, model_size: str) -> tuple[list[dict], float]:
    # PyTorch 2.6+ defaults weights_only=True which breaks some HF checkpoints.
    import torch

    _torch_load = torch.load

    def _patched_load(*args, **kwargs):
        kwargs.setdefault("weights_only", False)
        return _torch_load(*args, **kwargs)

    torch.load = _patched_load

    audio = whisperx.load_audio(str(audio_path))
    duration = len(audio) / float(SAMPLE_RATE)
    known_text = script_for_alignment(spoken)
    known_segments = [{"text": known_text, "start": 0.0, "end": duration}]

    print(f"Loading alignment model (en) on {device}…")
    align_model, metadata = whisperx.load_align_model(language_code="en", device=device)

    print("Force-aligning known script to audio…")
    aligned_known = whisperx.align(
        known_segments,
        align_model,
        metadata,
        audio,
        device,
        return_char_alignments=False,
    )
    known_words = extract_aligned_words(aligned_known)
    print(f"aligned words={len(known_words)}, script={len(spoken)}, duration={duration:.2f}s")

    # Optional: also run ASR for denser timings if alignment under-produced.
    asr_words: list[dict] = []
    if len(known_words) < len(spoken) * 0.7:
        print(f"Loading Whisper ASR ({model_size}) as fallback densifier…")
        try:
            model = whisperx.load_model(
                model_size,
                device,
                compute_type="int8" if device == "cpu" else "float16",
                language="en",
                vad_method="silero",
            )
            print("Transcribing…")
            transcript = model.transcribe(audio, language="en", batch_size=8)
            print("Aligning ASR segments…")
            aligned_asr = whisperx.align(
                transcript["segments"],
                align_model,
                metadata,
                audio,
                device,
                return_char_alignments=False,
            )
            asr_words = extract_aligned_words(aligned_asr)
            print(f"asr-align words={len(asr_words)}")
        except Exception as exc:
            print(f"ASR fallback skipped: {exc}")

    if asr_words and abs(len(asr_words) - len(spoken)) < abs(len(known_words) - len(spoken)):
        primary = asr_words
        print("Using ASR-aligned timings as primary")
    else:
        primary = known_words
        print("Using known-script forced-alignment timings as primary")

    mapped = map_to_script(spoken, primary, duration)
    return mapped, duration


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--audio", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--slug", default="moment-that-sparked-everything-2")
    parser.add_argument("--device", default="cpu")
    parser.add_argument("--model", default="base")
    args = parser.parse_args()

    spoken, phrase_ranges = build_spoken_and_phrase_ranges()
    words, duration = run_whisperx(Path(args.audio), spoken, args.device, args.model)
    phrases = assign_phrases(words, phrase_ranges)

    payload = {
        "slug": args.slug,
        "method": "whisperx-forced-align",
        "duration": round(duration, 3),
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "highlightDelaySec": 0.18,
        "words": words,
        "phrases": phrases,
    }

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {out} ({len(words)} words, {len(phrases)} phrases, {payload['duration']}s)")


if __name__ == "__main__":
    main()
