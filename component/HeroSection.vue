<script setup lang="ts">
import { computed, ref } from 'vue';
import { Play } from 'lucide-vue-next';
import { useElementSize, useIntersectionObserver } from '@vueuse/core';
import ProfileReveal from '~/component/ProfileReveal.vue';
import HeroSubtitle from '~/component/HeroSubtitle.vue';

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
 *
 * Floor stays low so long phrases can keep shrinking on tablet/mobile
 * instead of overflowing the bordered box.
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
// around them, rather than each scaling to its own character count. The
// shared size is still derived from the fill formula (using their average
// length) so the line reaches a consistent, predictable share of the row
// instead of an arbitrarily-chosen flat value that leaves it far short.
const MUTED_TRIO = new Set(['INNOVATION', 'CURIOSITY', 'TECHNOLOGY']);
const MUTED_TRIO_TONE = 'text-white/20 font-bold';
const MUTED_TRIO_STYLE = fluidSize('INNOVATION', 10, 48, 0.72);

// Words that should visually match another word's size (computed from that
// other word's character count, not their own) and color/weight.
const MATCHED_TONE = 'text-white/45 font-extrabold';
const SIZE_MATCHES: Record<string, string> = { PERSISTENCE: 'ARTIFICIAL INTELLIGENCE' };

const wordCloud: WordCloudItem[] = [
  { text: 'TRY TO BECOME SYSTEM THINKER', tone: 'text-white/20 font-extrabold' },
  { text: 'ARTIFICIAL INTELLIGENCE', tone: 'text-white/45 font-extrabold' },
  { text: 'INNOVATION', tone: 'text-white/25 font-semibold' },
  { text: 'CURIOSITY', tone: 'text-white/55 font-extrabold' },
  { text: 'TECHNOLOGY', tone: 'text-white/40 font-extrabold' },
  { text: 'PERSISTENCE', tone: 'text-white/55 font-extrabold' },
  { text: 'BRING IMPOSSIBLE IDEAS TO LIFE', tone: 'text-white/20 font-extrabold' },
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
      style: fluidSize(SIZE_MATCHES[text], 10, 52, 0.96),
    };
  }
  const isCore = CORE_WORDS.has(text);
  return {
    text,
    class: `${tone} font-display transition-colors duration-300 hover:text-accent`,
    style: isCore ? fluidSize(text, 10, 52, 0.96) : fluidSize(text, 8, 24, 0.48),
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
  class: 'text-[10px] md:text-xs lg:text-base xl:text-xl text-white/30 font-semibold',
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

const leftVerticalStyle = computed(() => verticalMatchStyle(leftVerticalWord.text, 8, 42));
const resilienceStyle = computed(() => verticalMatchStyle(resilienceWord.text, 8, 42));

// Caps the word-cloud block to the headline on large screens, but always
// stays within the parent column on tablet/mobile (width: 100%).
const headlineRef = ref<HTMLElement | null>(null);
const { width: headlineWidth } = useElementSize(headlineRef);
const wordCloudRowStyle = computed(() => {
  if (!headlineWidth.value) return { width: '100%', maxWidth: '100%' };
  return {
    width: '100%',
    maxWidth: `${Math.round(headlineWidth.value * 0.92)}px`,
  };
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
    class="w-full overflow-x-clip px-5 sm:px-6 md:px-12 lg:px-20 xl:px-[160px] py-10 sm:py-14 md:py-20"
  >
    <div
      class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-8 md:gap-12 lg:gap-16 items-start transition-all duration-700 ease-out"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
    >
      <div class="min-w-0 w-full">
        <h1
          ref="headlineRef"
          class="font-display font-extrabold uppercase leading-[0.95] tracking-tight text-[clamp(1.75rem,6vw,4.5rem)]"
        >
          <HeroSubtitle />
        </h1>

        <div class="mt-5 md:mt-6 h-1 w-32 sm:w-40 md:w-56 rounded-full bg-gradient-to-r from-accent to-transparent"></div>

        <div
          class="word-cloud-box mt-8 md:mt-12 lg:mt-14 flex items-start gap-1.5 sm:gap-2 select-none px-3 sm:px-4 md:px-5 py-3 sm:py-4 md:py-5 w-full max-w-full"
          :style="wordCloudRowStyle"
        >
          <span class="corner tl" aria-hidden="true"></span>
          <span class="corner tr" aria-hidden="true"></span>
          <span class="corner bl" aria-hidden="true"></span>
          <span class="corner br" aria-hidden="true"></span>

          <div class="hidden md:flex flex-col items-center pt-1 shrink-0">
            <span
              class="font-display uppercase tracking-[0.12em] rotate-180 transition-colors duration-300 hover:text-accent"
              :class="leftVerticalWord.tone"
              :style="leftVerticalStyle"
              style="writing-mode: vertical-rl"
            >
              {{ leftVerticalWord.text }}
            </span>
          </div>

          <div
            ref="wordCloudRef"
            class="flex-1 flex flex-col justify-start gap-0 md:gap-0.5 min-w-0 overflow-hidden"
            style="container-type: inline-size"
          >
            <span
              v-for="word in wordCloud"
              :key="word.text"
              class="block w-full whitespace-nowrap uppercase overflow-hidden text-ellipsis"
              :class="word.class"
              :style="word.style"
            >
              {{ word.text }}
            </span>
          </div>

          <div class="hidden md:flex items-start gap-1 lg:gap-1.5 shrink-0">
            <div class="flex flex-col items-center pt-1">
              <span
                class="font-display uppercase tracking-[0.12em] transition-colors duration-300 hover:text-accent"
                :class="entrepreneurshipWord.class"
                style="writing-mode: vertical-rl"
              >
                {{ entrepreneurshipWord.text }}
              </span>
            </div>

            <div class="flex flex-col items-center pt-1">
              <span
                class="font-display uppercase tracking-[0.12em] transition-colors duration-300 hover:text-accent"
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

      <div class="flex justify-center lg:justify-end">
        <ProfileReveal
          profile-src="/assets/images/profile.jpg"
          profile-alt-src="/assets/images/profile2.jpg"
          profile-alt="NITYA SUON"
          logo-src="/assets/images/logo.png"
          fallback-initial="S"
        />
      </div>
    </div>

    <div
      class="mt-12 md:mt-16 lg:mt-24 pt-6 md:pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 transition-all duration-700 ease-out delay-150"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
    >
      <p class="font-display text-xs md:text-sm font-semibold tracking-[0.2em] sm:tracking-[0.3em] text-muted uppercase">
        Building systems that solve real problems
      </p>

      <NuxtLink
        to="/projects"
        class="group inline-flex items-center gap-3 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full border border-accent text-white text-xs sm:text-sm uppercase tracking-widest hover:bg-accent/10 hover:shadow-glow-sm transition-all duration-300"
      >
        <Play :size="16" class="text-accent transition-transform duration-300 group-hover:scale-110" />
        <span>view projects</span>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.word-cloud-box {
  position: relative;
  border: 1px dashed rgba(255, 255, 255, 0.5);
  border-radius: 0;
  background: #111;
}

.corner {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #4a9eff;
  z-index: 2;
  pointer-events: none;
}

/* offset = -(border-width) - (square-size / 2) = -1px - 4px */
.corner.tl { top: -5px; left: -5px; }
.corner.tr { top: -5px; right: -5px; }
.corner.bl { bottom: -5px; left: -5px; }
.corner.br { bottom: -5px; right: -5px; }
</style>
