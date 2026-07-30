export interface QuoteLine {
  chinese: string;
  translation: string;
}

export type StoryBlock =
  | { type: 'text'; parts: Array<{ text: string; emphasize?: boolean }> }
  | { type: 'quote'; lines: QuoteLine[] };

export interface StoryWord {
  text: string;
  emphasize?: boolean;
  /** Visual role when rendering quote lines. */
  role?: 'chinese' | 'translation' | 'paren' | 'quote-mark';
  /** Index into the flat alignment timeline (spoken words only). */
  alignIndex: number | null;
}

export interface StoryRenderBlock {
  type: 'paragraph' | 'quote';
  /** For quote blocks, words are grouped per line. */
  lines: StoryWord[][];
}

export const STORY_SLUG = 'moment-that-sparked-everything-2';

export const storyBlocks: StoryBlock[] = [
  {
    type: 'text',
    parts: [
      {
        text: 'In the winter of 2022, during the COVID lockdown, Beijing was unusually quiet. Most students had already left campus. My friend and I were among the few who remained in the dormitories.',
      },
    ],
  },
  {
    type: 'text',
    parts: [
      {
        text: 'One afternoon, I was asleep when I heard something outside. The sound of machines moving along the road below my window. They kept passing by, again and again. Curious, I wondered what they were.',
      },
    ],
  },
  {
    type: 'text',
    parts: [{ text: 'I went downstairs and called my friend to join me.' }],
  },
  {
    type: 'text',
    parts: [{ text: 'What we saw was unforgettable.' }],
  },
  {
    type: 'text',
    parts: [
      { text: 'A fleet of ' },
      {
        text: 'twelve autonomous Meituan delivery robots',
        emphasize: true,
      },
      {
        text: ' was moving across the empty campus. Twelve robots. No drivers. No remote controls. Just machines navigating on their own.',
      },
    ],
  },
  {
    type: 'text',
    parts: [{ text: 'As they moved, they spoke to people in Chinese.' }],
  },
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
      {
        text: 'I decided to test one. I stood directly in front of it. The robot stopped immediately. It detected me, adjusted its route, and continued on its way. I took a photo to remember the moment.',
      },
    ],
  },
  {
    type: 'text',
    parts: [
      { text: 'That experience stayed with me. I kept asking myself the same questions: ' },
      {
        text: 'How can a machine see? How can it understand the world around it? How can it communicate with people?',
        emphasize: true,
      },
    ],
  },
  {
    type: 'text',
    parts: [
      {
        text: 'The search for those answers eventually led me into Natural Language Processing and Computer Vision.',
      },
    ],
  },
  {
    type: 'text',
    parts: [
      {
        text: "It didn't begin with a textbook or a classroom lecture. It began with a delivery robot carrying lunch through a silent university campus, speaking Chinese to students like us during a time when the world seemed to stand still.",
      },
    ],
  },
];

/** Split English (or mixed) text into display tokens, keeping trailing punctuation. */
export function tokenizeText(text: string): string[] {
  return text.match(/[^\s]+/g) ?? [];
}

/**
 * Build renderable blocks + flat spoken-word list used for alignment.
 * Quote marks and parentheses are display-only (no alignIndex).
 * Chinese phrases are one spoken token each; translation words are spoken.
 */
export function buildStoryTimeline(blocks: StoryBlock[] = storyBlocks) {
  const spoken: string[] = [];
  const renderBlocks: StoryRenderBlock[] = [];

  const pushSpoken = (text: string, meta: Omit<StoryWord, 'alignIndex' | 'text'> = {}): StoryWord => {
    const alignIndex = spoken.length;
    spoken.push(text);
    return { text, alignIndex, ...meta };
  };

  const pushDisplay = (text: string, meta: Omit<StoryWord, 'alignIndex' | 'text'> = {}): StoryWord => ({
    text,
    alignIndex: null,
    ...meta,
  });

  for (const block of blocks) {
    if (block.type === 'text') {
      const line: StoryWord[] = [];
      for (const part of block.parts) {
        for (const token of tokenizeText(part.text)) {
          line.push(pushSpoken(token, { emphasize: part.emphasize }));
        }
      }
      renderBlocks.push({ type: 'paragraph', lines: [line] });
      continue;
    }

    const quoteLines: StoryWord[][] = [];
    for (const q of block.lines) {
      const line: StoryWord[] = [
        pushDisplay('“', { role: 'quote-mark' }),
        pushSpoken(q.chinese, { role: 'chinese' }),
        pushDisplay('”', { role: 'quote-mark' }),
        pushDisplay(' (', { role: 'paren' }),
      ];
      for (const token of tokenizeText(q.translation)) {
        line.push(pushSpoken(token, { role: 'translation' }));
      }
      line.push(pushDisplay(')', { role: 'paren' }));
      quoteLines.push(line);
    }
    renderBlocks.push({ type: 'quote', lines: quoteLines });
  }

  return { spoken, renderBlocks };
}

export interface PhraseRange {
  startIndex: number;
  endIndex: number;
}

/**
 * Phrase ranges for read-along highlight.
 * - Normal prose: split on sentence-ending punctuation.
 * - Quote lines: one phrase per full quote line (Chinese + full translation).
 */
export function buildPhraseRanges(blocks: StoryBlock[] = storyBlocks): PhraseRange[] {
  const { renderBlocks } = buildStoryTimeline(blocks);
  const ranges: PhraseRange[] = [];

  for (const block of renderBlocks) {
    if (block.type === 'quote') {
      for (const line of block.lines) {
        const idxs = line
          .map((w) => w.alignIndex)
          .filter((i): i is number => i != null);
        if (!idxs.length) continue;
        ranges.push({ startIndex: idxs[0]!, endIndex: idxs[idxs.length - 1]! });
      }
      continue;
    }

    const words = block.lines[0] ?? [];
    let start: number | null = null;
    let last: number | null = null;
    for (const word of words) {
      if (word.alignIndex == null) continue;
      if (start == null) start = word.alignIndex;
      last = word.alignIndex;
      if (/[.!?…]['"”']?$/.test(word.text)) {
        ranges.push({ startIndex: start, endIndex: last });
        start = null;
        last = null;
      }
    }
    if (start != null && last != null) {
      ranges.push({ startIndex: start, endIndex: last });
    }
  }

  return ranges;
}
