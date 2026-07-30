#!/usr/bin/env bash
# Force-align narration audio to the known story script with WhisperX.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

AUDIO="${1:-/tmp/publix-audio/narration.mp3}"
OUT="${2:-data/alignments/moment-that-sparked-everything-2.json}"

if [[ ! -f "$AUDIO" ]]; then
  echo "Audio not found: $AUDIO"
  echo "Download first, e.g.:"
  echo "  curl -L http://localhost:3000/api/listen/moment-that-sparked-everything-2.mp3 -o /tmp/publix-audio/narration.mp3"
  exit 1
fi

if [[ ! -d .venv ]]; then
  echo "Missing .venv — create it and install whisperx first (see scripts/whisperx_align.py)."
  exit 1
fi

# shellcheck disable=SC1091
source .venv/bin/activate
python scripts/whisperx_align.py --audio "$AUDIO" --out "$OUT" --device cpu --model base
