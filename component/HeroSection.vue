<script setup lang="ts">
import { computed, ref } from 'vue';
import { Play } from 'lucide-vue-next';
import { useElementSize, useIntersectionObserver } from '@vueuse/core';
import ProfileReveal from '~/component/ProfileReveal.vue';
import HeroSubtitle from '~/component/HeroSubtitle.vue';

interface WordCloudWord {
  text: string;
  class: string;
  style: string;
}

interface WordCloudRow {
  words: WordCloudWord[];
}

interface HeightMatchedWord {
  text: string;
  tone: string;
}

/**
 * Estimates a font size (in container-query width units) that makes a
 * whitespace-nowrap uppercase word roughly span a target share of its
 * container's width. Middle-band rows use a slightly higher fill so the
 * 3-row "inner rectangle" is tall enough for the vertical side words.
 */
const fluidSize = (text: string, floorPx: number, ceilPx: number, fill: number, factor = 0.72): string => {
  const cqw = (100 * fill) / (text.length * factor);
  return `font-size: clamp(${floorPx}px, ${cqw.toFixed(2)}cqw, ${ceilPx}px); line-height: 0.95;`;
};

const wordClass = (tone: string) =>
  `${tone} transition-colors duration-300 hover:text-accent`;

const topPhrase: WordCloudWord = {
  text: 'TRY TO BECOME SYSTEM THINKER',
  class: wordClass('text-white/20 font-extrabold'),
  style: fluidSize('TRY TO BECOME SYSTEM THINKER', 10, 52, 0.96),
};

const bottomPhrase: WordCloudWord = {
  text: 'BRING IMPOSSIBLE IDEAS TO LIFE',
  class: wordClass('text-white/20 font-extrabold'),
  style: fluidSize('BRING IMPOSSIBLE IDEAS TO LIFE', 10, 52, 0.96),
};

/** Middle 3 rows — sit between the vertical words in the inner band. */
const middleRows: WordCloudRow[] = [
  {
    words: [{
      text: 'ARTIFICIAL INTELLIGENCE',
      class: wordClass('text-white/45 font-extrabold'),
      style: fluidSize('ARTIFICIAL INTELLIGENCE', 11, 44, 0.9),
    }],
  },
  {
    words: [
      {
        text: 'INNOVATION',
        class: wordClass('text-white/20 font-bold'),
        style: fluidSize('INNOVATION', 10, 36, 0.4),
      },
      {
        text: 'PERSISTENCE',
        class: wordClass('text-white/55 font-extrabold'),
        style: fluidSize('PERSISTENCE', 10, 36, 0.44),
      },
    ],
  },
  {
    words: [
      {
        text: 'CURIOSITY',
        class: wordClass('text-white/55 font-extrabold'),
        style: fluidSize('CURIOSITY', 10, 36, 0.42),
      },
      {
        text: 'TECHNOLOGY',
        class: wordClass('text-white/20 font-bold'),
        style: fluidSize('TECHNOLOGY', 10, 36, 0.42),
      },
    ],
  },
];

const leftVerticalLines: HeightMatchedWord[] = [
  { text: 'ELIMINATE', tone: 'text-white/40 font-bold' },
  { text: 'FRICTION', tone: 'text-white/40 font-bold' },
];
const entrepreneurshipWord: HeightMatchedWord = { text: 'ENTREPRENEURSHIP', tone: 'text-white/30 font-semibold' };
const resilienceWord: HeightMatchedWord = { text: 'RESILIENCE', tone: 'text-white/50 font-bold' };

/** Measured height of the middle 3-row band (inner rectangle). */
const middleBandRef = ref<HTMLElement | null>(null);
const { height: middleBandHeight } = useElementSize(middleBandRef);

/** Fit a vertical word exactly to the middle-band height. */
const fitVerticalToBand = (text: string, trackingEm = 0.06): string => {
  const available = middleBandHeight.value;
  const n = text.length;
  const lineHeight = 1;
  if (!available) {
    return `font-size: 8px; line-height: ${lineHeight}; letter-spacing: ${trackingEm}em;`;
  }
  const size = available / (n * lineHeight + trackingEm * Math.max(n - 1, 0));
  return `font-size: ${size.toFixed(2)}px; line-height: ${lineHeight}; letter-spacing: ${trackingEm}em;`;
};

const leftVerticalStyles = computed(() =>
  leftVerticalLines.map((line) => fitVerticalToBand(line.text)),
);
const entrepreneurshipStyle = computed(() => fitVerticalToBand(entrepreneurshipWord.text));
const resilienceStyle = computed(() => fitVerticalToBand(resilienceWord.text));

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
    class="w-full overflow-x-clip py-10 sm:py-14 md:py-20"
  >
    <div
      class="px-5 sm:px-6 md:px-12 lg:px-20 xl:px-[160px] grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-8 md:gap-12 lg:gap-16 items-start transition-all duration-700 ease-out"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
    >
      <div class="min-w-0 w-full">
        <h1
          ref="headlineRef"
          class="font-brand font-bold uppercase leading-[0.95] tracking-tight text-[clamp(1.75rem,6vw,4.5rem)]"
        >
          <HeroSubtitle />
        </h1>

        <div class="mt-5 md:mt-6 h-1 w-32 sm:w-40 md:w-56 rounded-full bg-gradient-to-r from-accent to-transparent"></div>

        <!-- Big rectangle -->
        <div
          class="word-cloud-box font-brand mt-8 md:mt-12 lg:mt-14 flex flex-col gap-1 sm:gap-1.5 select-none px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 w-full max-w-full"
          :style="wordCloudRowStyle"
          style="container-type: inline-size"
        >
          <span class="corner tl" aria-hidden="true"></span>
          <span class="corner tr" aria-hidden="true"></span>
          <span class="corner bl" aria-hidden="true"></span>
          <span class="corner br" aria-hidden="true"></span>

          <!-- Top phrase — full width of big rectangle -->
          <span
            class="block w-full whitespace-nowrap uppercase overflow-hidden text-ellipsis"
            :class="topPhrase.class"
            :style="topPhrase.style"
          >
            {{ topPhrase.text }}
          </span>

          <!-- Inner rectangle: verticals + middle 3 rows -->
          <div class="word-cloud-inner flex items-stretch gap-1.5 sm:gap-2 w-full min-w-0">
            <div class="hidden md:flex flex-row items-stretch gap-0.5 shrink-0 self-stretch">
              <span
                v-for="(line, i) in leftVerticalLines"
                :key="line.text"
                class="uppercase rotate-180 transition-colors duration-300 hover:text-accent"
                :class="line.tone"
                :style="leftVerticalStyles[i]"
                style="writing-mode: vertical-rl"
              >
                {{ line.text }}
              </span>
            </div>

            <div
              ref="middleBandRef"
              class="flex-1 flex flex-col justify-start gap-0 min-w-0 overflow-hidden"
            >
              <div
                v-for="(row, rowIndex) in middleRows"
                :key="rowIndex"
                class="flex w-full items-baseline gap-2 sm:gap-3 md:gap-4 whitespace-nowrap overflow-hidden"
              >
                <span
                  v-for="word in row.words"
                  :key="word.text"
                  class="uppercase overflow-hidden text-ellipsis"
                  :class="word.class"
                  :style="word.style"
                >
                  {{ word.text }}
                </span>
              </div>
            </div>

            <div class="hidden md:flex flex-row items-stretch gap-0.5 shrink-0 self-stretch">
              <span
                class="uppercase transition-colors duration-300 hover:text-accent"
                :class="entrepreneurshipWord.tone"
                :style="entrepreneurshipStyle"
                style="writing-mode: vertical-rl"
              >
                {{ entrepreneurshipWord.text }}
              </span>
              <span
                class="uppercase transition-colors duration-300 hover:text-accent"
                :class="resilienceWord.tone"
                :style="resilienceStyle"
                style="writing-mode: vertical-rl"
              >
                {{ resilienceWord.text }}
              </span>
            </div>
          </div>

          <!-- Bottom phrase — full width of big rectangle -->
          <span
            class="block w-full whitespace-nowrap uppercase overflow-hidden text-ellipsis"
            :class="bottomPhrase.class"
            :style="bottomPhrase.style"
          >
            {{ bottomPhrase.text }}
          </span>
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
      class="hero-cta-bar mt-12 md:mt-16 lg:mt-24 relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 px-5 sm:px-6 md:px-12 lg:px-20 xl:px-[160px] py-12 md:py-16 lg:py-20 transition-all duration-700 ease-out delay-150"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
    >
      <p class="relative z-10 font-display text-xs md:text-sm font-semibold tracking-[0.2em] sm:tracking-[0.3em] text-white/80 uppercase">
        Building systems that solve real problems
      </p>

      <NuxtLink
        to="/projects"
        class="relative z-10 group inline-flex items-center gap-3 px-5 sm:px-6 py-2.5 sm:py-3 rounded-none border border-accent font-dm font-bold text-white text-xs sm:text-sm uppercase tracking-[0.14em] hover:bg-accent/10 hover:shadow-glow-sm transition-all duration-300"
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

.hero-cta-bar {
  background-image: url('/assets/images/bg1.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
