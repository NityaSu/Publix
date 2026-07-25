<script setup lang="ts">
import { computed, ref } from 'vue';
import { Play } from 'lucide-vue-next';
import { useElementSize, useIntersectionObserver } from '@vueuse/core';
import ProfileReveal from '~/component/ProfileReveal.vue';

interface WordCloudItem {
  text: string;
  class: string;
  style: string;
}

interface VerticalWordItem {
  text: string;
  class: string;
}

interface HeightMatchedWord {
  text: string;
  tone: string;
}

/**
 * Estimates a font size (in container-query width units) that makes a
 * whitespace-nowrap uppercase word roughly span a target share of its
 * container's width, regardless of character count — short words end up
 * bigger, long phrases end up smaller, so every row reaches a similar
 * visual width. `fill` controls how much of the row a tier is allowed to
 * claim: core words fill almost the whole row (dominant), filler words
 * only claim a fraction of it, which is what creates the "3-4 big words
 * standing out above smaller surrounding ones" hierarchy.
 */
const fluidSize = (text: string, floorPx: number, ceilPx: number, fill: number, factor = 0.72): string => {
  const cqw = (100 * fill) / (text.length * factor);
  return `font-size: clamp(${floorPx}px, ${cqw.toFixed(2)}cqw, ${ceilPx}px); line-height: 0.95;`;
};

const CORE_WORDS = new Set([
  'TRY TO BECOME SYSTEM THINKER',
  'ARTIFICIAL INTELLIGENCE',
  'INNOVATION',
  'TECHNOLOGY',
  'PERSISTENCE',
  'CURIOSITY',
  'BRING IMPOSSIBLE IDEAS TO LIFE',
]);

// These three share one identical size/weight/color so they read as a
// matched, deliberately muted trio — greyer than the brighter words
// around them, rather than each scaling to its own character count.
const MUTED_TRIO = new Set(['INNOVATION', 'CURIOSITY', 'TECHNOLOGY']);
const MUTED_TRIO_TONE = 'text-white/20 font-bold';
const MUTED_TRIO_STYLE = 'font-size: clamp(22px, 7.5cqw, 42px); line-height: 0.95;';

// Words that should visually match another word's size (computed from that
// other word's character count, not their own) and color/weight.
const MATCHED_TONE = 'text-white/45 font-extrabold';
const SIZE_MATCHES: Record<string, string> = { PERSISTENCE: 'ARTIFICIAL INTELLIGENCE' };

const wordCloud: WordCloudItem[] = [
  { text: 'TRY TO BECOME SYSTEM THINKER', tone: 'text-white/40 font-extrabold' },
  { text: 'ARTIFICIAL INTELLIGENCE', tone: 'text-white/45 font-extrabold' },
  { text: 'INNOVATION', tone: 'text-white/25 font-semibold' },
  { text: 'CURIOSITY', tone: 'text-white/55 font-extrabold' },
  { text: 'TECHNOLOGY', tone: 'text-white/40 font-extrabold' },
  { text: 'PERSISTENCE', tone: 'text-white/55 font-extrabold' },
  { text: 'BRING IMPOSSIBLE IDEAS TO LIFE', tone: 'text-white/30 font-extrabold' },
].map(({ text, tone }) => {
  if (MUTED_TRIO.has(text)) {
    return {
      text,
      class: `${MUTED_TRIO_TONE} font-display transition-colors duration-300 hover:text-accent`,
      style: MUTED_TRIO_STYLE,
    };
  }
  if (SIZE_MATCHES[text]) {
    return {
      text,
      class: `${MATCHED_TONE} font-display transition-colors duration-300 hover:text-accent`,
      style: fluidSize(SIZE_MATCHES[text], 24, 52, 0.85),
    };
  }
  const isCore = CORE_WORDS.has(text);
  return {
    text,
    class: `${tone} font-display transition-colors duration-300 hover:text-accent`,
    style: isCore ? fluidSize(text, 24, 52, 0.85) : fluidSize(text, 11, 24, 0.48),
  };
});

// ELIMINATE FRICTION (left) and RESILIENCE (right) are meant to read top-to-
// bottom exactly as tall as the horizontal word block, so the three columns
// form a clean rectangle. Rather than a fixed Tailwind size, their font size
// is derived from the word block's *measured* rendered height — analogous
// to the cqw trick used for the horizontal words, but for vertical length.
const leftVerticalWord: HeightMatchedWord = { text: 'ELIMINATE FRICTION', tone: 'text-white/40 font-bold' };
const resilienceWord: HeightMatchedWord = { text: 'RESILIENCE', tone: 'text-white/50 font-bold' };

const entrepreneurshipWord: VerticalWordItem = {
  text: 'ENTREPRENEURSHIP',
  class: 'text-base md:text-xl text-white/30 font-semibold',
};

const wordCloudRef = ref<HTMLElement | null>(null);
const { height: wordCloudHeight } = useElementSize(wordCloudRef);

const verticalMatchStyle = (
  text: string,
  floorPx: number,
  ceilPx: number,
  fill = 0.9,
  factor = 0.72,
): string => {
  const available = wordCloudHeight.value;
  if (!available) return `font-size: ${floorPx}px; line-height: 0.86;`;
  const size = (fill * available) / (text.length * factor);
  const clamped = Math.min(Math.max(size, floorPx), ceilPx);
  return `font-size: ${clamped.toFixed(1)}px; line-height: 0.86;`;
};

const leftVerticalStyle = computed(() => verticalMatchStyle(leftVerticalWord.text, 14, 42));
const resilienceStyle = computed(() => verticalMatchStyle(resilienceWord.text, 14, 42));

// Caps the whole word-cloud "rectangle" (both vertical columns + the
// horizontal block) to a bit more than the measured width of the
// "Software Engineer" headline above it, instead of stretching to fill
// the entire column — this is what shrinks the block and keeps it
// visually tied to the headline's width rather than the page width.
const headlineRef = ref<HTMLElement | null>(null);
const { width: headlineWidth } = useElementSize(headlineRef);
const wordCloudRowStyle = computed(() => {
  if (!headlineWidth.value) return {};
  return { width: `${Math.round(headlineWidth.value * 1.12)}px`, maxWidth: '100%' };
});

const heroRef = ref<HTMLElement | null>(null);
const isVisible = ref(false);

useIntersectionObserver(
  heroRef,
  ([entry]) => {
    if (entry?.isIntersecting) {
      isVisible.value = true;
    }
  },
  { threshold: 0.1 },
);
</script>

<template>
  <section
    ref="heroRef"
    class="w-full px-6 md:px-20 lg:px-[160px] py-14 md:py-20"
  >
    <div
      class="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 md:gap-16 items-start transition-all duration-700 ease-out"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
    >
      <div class="min-w-0">
        <h1 class="font-display font-extrabold uppercase leading-[0.95] tracking-tight">
          <span ref="headlineRef" class="block text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl">Software Engineer</span>
          <span class="block text-accent mt-2 md:mt-3 text-lg sm:text-xl md:text-2xl lg:text-3xl tracking-wide">
            Bronze Medalist &middot; National Math Olympiad
          </span>
        </h1>

        <div class="mt-6 h-1 w-40 md:w-56 rounded-full bg-gradient-to-r from-accent to-transparent"></div>

        <div
          class="mt-10 md:mt-14 flex items-start gap-3 md:gap-6 select-none"
          :style="wordCloudRowStyle"
        >
          <div class="hidden sm:flex flex-col items-center pt-1">
            <span
              class="font-display uppercase tracking-[0.15em] rotate-180 transition-colors duration-300 hover:text-accent"
              :class="leftVerticalWord.tone"
              :style="leftVerticalStyle"
              style="writing-mode: vertical-rl"
            >
              {{ leftVerticalWord.text }}
            </span>
          </div>

          <div
            ref="wordCloudRef"
            class="flex-1 flex flex-col justify-start gap-0 md:gap-0.5 min-w-0"
            style="container-type: inline-size"
          >
            <span
              v-for="word in wordCloud"
              :key="word.text"
              class="whitespace-nowrap uppercase"
              :class="word.class"
              :style="word.style"
            >
              {{ word.text }}
            </span>
          </div>

          <div class="hidden sm:flex items-start gap-3 md:gap-6">
            <div class="flex flex-col items-center pt-1">
              <span
                class="font-display uppercase tracking-[0.15em] transition-colors duration-300 hover:text-accent"
                :class="entrepreneurshipWord.class"
                style="writing-mode: vertical-rl"
              >
                {{ entrepreneurshipWord.text }}
              </span>
            </div>

            <div class="flex flex-col items-center pt-1">
              <span
                class="font-display uppercase tracking-[0.15em] transition-colors duration-300 hover:text-accent"
                :class="resilienceWord.tone"
                :style="resilienceStyle"
                style="writing-mode: vertical-rl"
              >
                {{ resilienceWord.text }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-center md:justify-end">
        <ProfileReveal
          profile-src="/assets/images/profile.jpg"
          profile-alt="NITYA SUON"
          logo-src="/assets/images/logo.png"
          fallback-initial="S"
        />
      </div>
    </div>

    <div
      class="mt-16 md:mt-24 pt-8 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-700 ease-out delay-150"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
    >
      <p class="font-display text-xs md:text-sm font-semibold tracking-[0.3em] text-muted uppercase">
        Building systems that solve real problems
      </p>

      <NuxtLink
        to="/projects"
        class="group inline-flex items-center gap-3 px-6 py-3 rounded-full border border-accent text-white text-sm uppercase tracking-widest hover:bg-accent/10 hover:shadow-glow-sm transition-all duration-300"
      >
        <Play :size="16" class="text-accent transition-transform duration-300 group-hover:scale-110" />
        <span>view projects</span>
      </NuxtLink>
    </div>
  </section>
</template>
