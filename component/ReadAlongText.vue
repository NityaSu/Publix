<script setup lang="ts">
import { computed, nextTick, watch } from 'vue';
import type { StoryRenderBlock, StoryWord } from '~/data/story';

export interface AlignmentWord {
  word: string;
  start: number;
  end: number;
  phraseId?: number;
}

export interface AlignmentPhrase {
  id: number;
  startIndex: number;
  endIndex: number;
  start: number;
  end: number;
}

const props = withDefaults(
  defineProps<{
    blocks: StoryRenderBlock[];
    words: AlignmentWord[];
    phrases?: AlignmentPhrase[];
    currentTime: number;
    active: boolean;
    /** Seconds to lag highlight behind audio (feels more natural). */
    highlightDelaySec?: number;
  }>(),
  {
    phrases: () => [],
    highlightDelaySec: 0.18,
  },
);

const wordEls = new Map<number, HTMLElement>();

function setWordRef(index: number, el: Element | null) {
  if (el instanceof HTMLElement) wordEls.set(index, el);
  else wordEls.delete(index);
}

/** Active phrase from timeline — stays lit across pauses inside the phrase. */
const activePhraseId = computed(() => {
  if (!props.active || !props.words.length) return -1;
  const t = Math.max(0, props.currentTime - props.highlightDelaySec);

  const phrases = props.phrases;
  if (phrases.length) {
    let lo = 0;
    let hi = phrases.length - 1;
    let best = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const p = phrases[mid]!;
      if (p.start <= t) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    if (best < 0) return -1;

    const phrase = phrases[best]!;
    const next = phrases[best + 1];
    // Hold through mid-phrase pauses until the next phrase starts.
    if (!next && t > phrase.end + 0.6) return -1;
    return phrase.id;
  }

  // Fallback without phrases: last word whose start <= t (no mid-gap clear).
  let lo = 0;
  let hi = props.words.length - 1;
  let best = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (props.words[mid]!.start <= t) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  if (best < 0) return -1;
  const word = props.words[best]!;
  if (typeof word.phraseId === 'number') return word.phraseId;
  return best;
});

watch(activePhraseId, async (id, prev) => {
  if (id < 0 || id === prev) return;
  await nextTick();
  const first = props.words.findIndex((w) => w.phraseId === id);
  const el = wordEls.get(first >= 0 ? first : 0);
  el?.scrollIntoView({
    block: 'nearest',
    behavior: 'smooth',
    inline: 'nearest',
  });
});

function lineHasActivePhrase(line: StoryWord[]) {
  if (activePhraseId.value < 0) return false;
  return line.some((w) => {
    if (w.alignIndex == null) return false;
    const timed = props.words[w.alignIndex];
    return timed?.phraseId === activePhraseId.value;
  });
}

function isWordActive(word: StoryWord, line?: StoryWord[]) {
  if (activePhraseId.value < 0) return false;

  // Quote marks / parentheses inherit highlight from their quote line.
  if (word.alignIndex == null) {
    if (!line) return false;
    if (word.role === 'quote-mark' || word.role === 'paren') {
      return lineHasActivePhrase(line);
    }
    return false;
  }

  const timed = props.words[word.alignIndex];
  if (!timed) return false;
  if (typeof timed.phraseId === 'number') {
    return timed.phraseId === activePhraseId.value;
  }
  return word.alignIndex === activePhraseId.value;
}

function wordClass(word: StoryWord, line?: StoryWord[]) {
  const isActive = isWordActive(word, line);

  if (word.role === 'chinese' || word.role === 'quote-mark') {
    return isActive
      ? 'text-accent font-medium transition-colors duration-200'
      : 'text-white font-medium transition-colors duration-200';
  }

  if (word.role === 'paren') {
    return isActive
      ? 'text-accent transition-colors duration-200'
      : 'text-muted transition-colors duration-200';
  }

  if (isActive) {
    return 'text-accent font-semibold transition-colors duration-200';
  }

  if (word.emphasize) {
    return 'text-white font-semibold transition-colors duration-200';
  }

  return 'text-muted transition-colors duration-200';
}

/** Insert a space between tokens only when both are regular/translation words. */
function needsSpace(curr: StoryWord, next: StoryWord | undefined) {
  if (!next) return false;
  if (curr.role === 'quote-mark' || next.role === 'quote-mark') return false;
  if (curr.role === 'paren' || next.role === 'paren') return false;
  if (curr.role === 'chinese' || next.role === 'chinese') return false;
  return true;
}
</script>

<template>
  <div class="space-y-5">
    <template v-for="(block, blockIndex) in blocks" :key="blockIndex">
      <p
        v-if="block.type === 'paragraph'"
        class="text-sm md:text-base leading-relaxed"
      >
        <template v-for="(word, wordIndex) in block.lines[0]" :key="`${blockIndex}-${wordIndex}`">
          <span
            v-if="word.alignIndex != null"
            :ref="(el) => setWordRef(word.alignIndex!, el as Element | null)"
            :class="wordClass(word)"
          >{{ word.text }}</span>
          <span v-else :class="wordClass(word)">{{ word.text }}</span>
          <template v-if="needsSpace(word, block.lines[0]![wordIndex + 1])">{{ ' ' }}</template>
        </template>
      </p>

      <blockquote
        v-else
        class="my-2 space-y-1.5 border-l-2 border-accent/50 pl-4"
      >
        <p
          v-for="(line, lineIndex) in block.lines"
          :key="`${blockIndex}-q-${lineIndex}`"
          class="text-sm md:text-base leading-relaxed"
        >
          <template v-for="(word, wordIndex) in line" :key="`${blockIndex}-q-${lineIndex}-${wordIndex}`">
            <span
              v-if="word.alignIndex != null"
              :ref="(el) => setWordRef(word.alignIndex!, el as Element | null)"
              :class="wordClass(word, line)"
            >{{ word.text }}</span>
            <span v-else :class="wordClass(word, line)">{{ word.text }}</span>
            <template v-if="needsSpace(word, line[wordIndex + 1])">{{ ' ' }}</template>
          </template>
        </p>
      </blockquote>
    </template>
  </div>
</template>
