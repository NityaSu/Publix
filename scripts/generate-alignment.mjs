/**
 * Generate word-level alignment JSON for read-along highlighting.
 *
 * Default: character-weighted timings with punctuation/paragraph pauses
 * matched to the MP3 duration (works well for even TTS narration).
 *
 * Optional: set ELEVENLABS_API_KEY to use ElevenLabs Forced Alignment instead.
 *
 * Usage:
 *   node --env-file=.env scripts/generate-alignment.mjs \
 *     [--slug moment-that-sparked-everything-2] \
 *     [--audio /path/to.mp3] \
 *     [--duration 114.76]
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFile } from 'music-metadata';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const SLUG_DEFAULT = 'moment-that-sparked-everything-2';

/** Keep in sync with data/story.ts spoken word order. */
const STORY_SPOKEN = buildSpokenWords();

function tokenizeText(text) {
  return text.match(/[^\s]+/g) ?? [];
}

function buildSpokenWords() {
  const spoken = [];
  const blocks = [
    {
      type: 'text',
      parts: [
        'In the winter of 2022, during the COVID lockdown, Beijing was unusually quiet. Most students had already left campus. My friend and I were among the few who remained in the dormitories.',
      ],
    },
    {
      type: 'text',
      parts: [
        'One afternoon, I was asleep when I heard something outside. The sound of machines moving along the road below my window. They kept passing by, again and again. Curious, I wondered what they were.',
      ],
    },
    { type: 'text', parts: ['I went downstairs and called my friend to join me.'] },
    { type: 'text', parts: ['What we saw was unforgettable.'] },
    {
      type: 'text',
      parts: [
        'A fleet of ',
        'twelve autonomous Meituan delivery robots',
        ' was moving across the empty campus. Twelve robots. No drivers. No remote controls. Just machines navigating on their own.',
      ],
    },
    { type: 'text', parts: ['As they moved, they spoke to people in Chinese.'] },
    {
      type: 'quote',
      lines: [
        { chinese: '请让一让，谢谢', translation: 'Please make way. Thank you.' },
        { chinese: '您的外卖已到达', translation: 'Your delivery has arrived' },
        { chinese: '请注意避让', translation: 'Please watch out' },
      ],
    },
    {
      type: 'text',
      parts: [
        'I decided to test one. I stood directly in front of it. The robot stopped immediately. It detected me, adjusted its route, and continued on its way. I took a photo to remember the moment.',
      ],
    },
    {
      type: 'text',
      parts: [
        'That experience stayed with me. I kept asking myself the same questions: ',
        'How can a machine see? How can it understand the world around it? How can it communicate with people?',
      ],
    },
    {
      type: 'text',
      parts: [
        'The search for those answers eventually led me into Natural Language Processing and Computer Vision.',
      ],
    },
    {
      type: 'text',
      parts: [
        "It didn't begin with a textbook or a classroom lecture. It began with a delivery robot carrying lunch through a silent university campus, speaking Chinese to students like us during a time when the world seemed to stand still.",
      ],
    },
  ];

  for (const block of blocks) {
    if (block.type === 'text') {
      for (const part of block.parts) {
        spoken.push(...tokenizeText(part));
      }
      spoken.push('¶'); // paragraph boundary marker (not spoken)
      continue;
    }
    for (const line of block.lines) {
      spoken.push(line.chinese);
      spoken.push(...tokenizeText(line.translation));
      spoken.push('¶');
    }
  }

  // Drop trailing paragraph marker
  while (spoken.at(-1) === '¶') spoken.pop();
  return spoken;
}

function charWeight(token) {
  // CJK characters are spoken roughly one syllable each — weight similarly to Latin letters.
  let w = 0;
  for (const ch of token) {
    if (/[\u3400-\u9FFF]/.test(ch)) w += 1.35;
    else if (/[A-Za-z0-9]/.test(ch)) w += 1;
    else if (/[',’-]/.test(ch)) w += 0.15;
    else w += 0.05;
  }
  return Math.max(w, 0.5);
}

function trailingPause(token) {
  if (/[.!?…]["”']?$/.test(token)) return 0.38;
  if (/[,;:]["”']?$/.test(token)) return 0.16;
  if (/[，。！？；：]$/.test(token)) return 0.28;
  return 0.04;
}

function generateHeuristicAlignment(wordsWithMarkers, duration) {
  const LEAD_IN = 0.35;
  const TRAIL = 0.55;
  const PARA_PAUSE = 0.42;
  const usable = Math.max(0.5, duration - LEAD_IN - TRAIL);

  const items = [];
  let totalWeight = 0;
  let totalFixedPause = 0;

  for (let i = 0; i < wordsWithMarkers.length; i += 1) {
    const token = wordsWithMarkers[i];
    if (token === '¶') {
      totalFixedPause += PARA_PAUSE;
      items.push({ kind: 'para' });
      continue;
    }
    const weight = charWeight(token);
    const pause = trailingPause(token);
    totalWeight += weight;
    totalFixedPause += pause;
    items.push({ kind: 'word', word: token, weight, pause });
  }

  const speakBudget = Math.max(0.5, usable - totalFixedPause);
  const unit = speakBudget / totalWeight;

  const words = [];
  let t = LEAD_IN;

  for (const item of items) {
    if (item.kind === 'para') {
      t += PARA_PAUSE;
      continue;
    }
    const start = t;
    const speak = item.weight * unit;
    const end = start + speak;
    words.push({
      word: item.word,
      start: round(start),
      end: round(end),
    });
    t = end + item.pause;
  }

  return {
    method: 'heuristic-char-weight',
    duration: round(duration),
    words,
  };
}

function round(n) {
  return Math.round(n * 1000) / 1000;
}

async function elevenLabsAlign(audioPath, text, apiKey) {
  const form = new FormData();
  const buf = await readFile(audioPath);
  form.append('file', new Blob([buf], { type: 'audio/mpeg' }), 'audio.mp3');
  form.append('text', text);

  const res = await fetch('https://api.elevenlabs.io/v1/forced-alignment', {
    method: 'POST',
    headers: { 'xi-api-key': apiKey },
    body: form,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ElevenLabs alignment failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const words = (data.words ?? []).map((w) => ({
    word: w.text ?? w.word,
    start: round(w.start),
    end: round(w.end),
  }));

  return { method: 'elevenlabs-forced-alignment', words };
}

function parseArgs(argv) {
  const out = { slug: SLUG_DEFAULT, audio: null, duration: null };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--slug') out.slug = argv[++i];
    else if (a === '--audio') out.audio = argv[++i];
    else if (a === '--duration') out.duration = Number(argv[++i]);
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outPath = join(root, 'data/alignments', `${args.slug}.json`);

  let duration = args.duration;
  const audioPath = args.audio;

  if (audioPath && (duration == null || Number.isNaN(duration))) {
    const meta = await parseFile(audioPath);
    duration = meta.format.duration;
  }

  if (duration == null || Number.isNaN(duration)) {
    duration = 114.756;
    console.warn(`No --duration/--audio; using default duration ${duration}s`);
  }

  const markers = STORY_SPOKEN;
  const spokenOnly = markers.filter((w) => w !== '¶');
  const plainText = spokenOnly.join(' ');

  let result;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (apiKey && audioPath) {
    console.log('Using ElevenLabs forced alignment…');
    result = await elevenLabsAlign(audioPath, plainText, apiKey);
    result.duration = round(duration);
  } else {
    if (apiKey && !audioPath) {
      console.warn('ELEVENLABS_API_KEY set but no --audio; falling back to heuristic.');
    }
    result = generateHeuristicAlignment(markers, duration);
  }

  // Ensure word count matches spoken tokens from story.ts
  if (result.words.length !== spokenOnly.length) {
    console.warn(
      `Word count mismatch: alignment=${result.words.length}, story=${spokenOnly.length}. ` +
        'Heuristic output should match; ElevenLabs may need remapping.',
    );
  }

  const payload = {
    slug: args.slug,
    method: result.method,
    duration: result.duration ?? round(duration),
    generatedAt: new Date().toISOString(),
    words: result.words,
  };

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${outPath} (${payload.words.length} words, ${payload.duration}s, ${payload.method})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
