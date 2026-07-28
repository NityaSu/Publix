<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Play } from 'lucide-vue-next';
import { useElementSize, useIntersectionObserver } from '@vueuse/core';
import ProfileReveal from '~/component/ProfileReveal.vue';
import HeroSubtitle from '~/component/HeroSubtitle.vue';

interface MeasuredWord {
  text: string;
  /** numeric font-weight used when measuring the real glyph widths */
  weight: number;
  class: string;
}

interface MeasuredRow {
  words: MeasuredWord[];
}

interface HeightMatchedWord {
  text: string;
  tone: string;
}

const wordClass = (tone: string) =>
  `${tone} transition-colors duration-300 hover:text-accent`;

const topPhrase = {
  text: 'TRY TO BECOME SYSTEM THINKER',
  weight: 800,
  class: wordClass('text-white/20 font-extrabold'),
};

const bottomPhrase = {
  text: 'BRING IMPOSSIBLE IDEAS TO LIFE',
  weight: 800,
  class: wordClass('text-white/20 font-extrabold'),
};

/** Outer box — width target so top/bottom phrases end on the same edge as E/E/Y. */
const wordCloudBoxRef = ref<HTMLElement | null>(null);
const { width: wordCloudBoxWidth } = useElementSize(wordCloudBoxRef);

/** Middle band element — measured for both row-width and side-word fitting. */
const middleBandRef = ref<HTMLElement | null>(null);
const { width: middleBandWidth, height: middleBandHeight } = useElementSize(middleBandRef);

/**
 * Middle 3 rows — every row is sized from the *measured* pixel width of
 * its text (canvas measureText with the real font), so all rows start at
 * the exact same left edge AND end at the exact same right edge.
 */
const middleRows: MeasuredRow[] = [
  {
    words: [{
      text: 'ARTIFICIAL INTELLIGENCE',
      weight: 800,
      class: wordClass('text-white/45 font-extrabold'),
    }],
  },
  {
    words: [
      { text: 'INNOVATION', weight: 700, class: wordClass('text-white/20 font-bold') },
      { text: 'PERSISTENCE', weight: 800, class: wordClass('text-white/55 font-extrabold') },
    ],
  },
  {
    words: [
      { text: 'CURIOSITY', weight: 800, class: wordClass('text-white/55 font-extrabold') },
      { text: 'TECHNOLOGY', weight: 700, class: wordClass('text-white/20 font-bold') },
    ],
  },
];

// Re-measure once webfonts finish loading (metrics differ from fallback).
const fontsReady = ref(false);
onMounted(() => {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    document.fonts.ready.then(() => { fontsReady.value = true; });
  } else {
    fontsReady.value = true;
  }
});

const MEASURE_PX = 100;
const BRAND_FONT = "'Montserrat', 'Inter', sans-serif";
let measureCtx: CanvasRenderingContext2D | null = null;

const measureText = (text: string, weight: number): number => {
  if (typeof document === 'undefined') return text.length * MEASURE_PX * 0.7;
  if (!measureCtx) {
    measureCtx = document.createElement('canvas').getContext('2d');
  }
  if (!measureCtx) return text.length * MEASURE_PX * 0.7;
  measureCtx.font = `${weight} ${MEASURE_PX}px ${BRAND_FONT}`;
  return measureCtx.measureText(text).width;
};

const fitPhraseToWidth = (text: string, weight: number, targetWidth: number): string => {
  if (!targetWidth) return 'font-size: 12px; line-height: 0.95;';
  const totalAt100 = measureText(text, weight);
  if (!totalAt100) return 'font-size: 12px; line-height: 0.95;';
  // Slight under-fill avoids sub-pixel clipping on the last glyph
  const size = (targetWidth / totalAt100) * MEASURE_PX * 0.995;
  return `font-size: ${size.toFixed(2)}px; line-height: 0.95;`;
};

/** Top / bottom fill the full box so R (THINKER) and E (LIFE) share the middle band's right edge. */
const topPhraseStyle = computed(() => {
  void fontsReady.value;
  return fitPhraseToWidth(topPhrase.text, topPhrase.weight, wordCloudBoxWidth.value);
});

const bottomPhraseStyle = computed(() => {
  void fontsReady.value;
  return fitPhraseToWidth(bottomPhrase.text, bottomPhrase.weight, wordCloudBoxWidth.value);
});

/** font-size that makes the row's total text width equal the band width. */
const middleRowStyles = computed<string[]>(() => {
  const bandWidth = middleBandWidth.value;
  void fontsReady.value;
  return middleRows.map((row) => {
    if (!bandWidth) return 'font-size: 12px; line-height: 0.95;';
    const spaceWidth = measureText(' ', 700) * Math.max(row.words.length - 1, 0);
    const totalAt100 = row.words.reduce((sum, w) => sum + measureText(w.text, w.weight), 0) + spaceWidth;
    if (!totalAt100) return 'font-size: 12px; line-height: 0.95;';
    const size = (bandWidth / totalAt100) * MEASURE_PX * 0.995;
    return `font-size: ${size.toFixed(2)}px; line-height: 0.95;`;
  });
});

const leftVerticalLines: HeightMatchedWord[] = [
  { text: 'ELIMINATE', tone: 'text-white/40 font-bold' },
  { text: 'FRICTION', tone: 'text-white/40 font-bold' },
];
const entrepreneurshipWord: HeightMatchedWord = { text: 'ENTREPRENEURSHIP', tone: 'text-white/30 font-semibold' };
const resilienceWord: HeightMatchedWord = { text: 'RESILIENCE', tone: 'text-white/50 font-bold' };

/**
 * Fit a vertical word exactly to the middle-band height.
 * `advanceEm` is the average horizontal advance of a rotated uppercase
 * glyph (~0.7em) — without it the estimate assumes 1em per letter and the
 * word only reaches ~70% of the band. `scale` shrinks the fitted size
 * (e.g. 0.85 = a bit smaller than a full-band fit).
 */
const fitVerticalToBand = (text: string, trackingEm = 0.06, advanceEm = 0.7, scale = 1): string => {
  const available = middleBandHeight.value;
  const n = text.length;
  if (!available) {
    return `font-size: 8px; line-height: 1; letter-spacing: ${trackingEm}em;`;
  }
  const size = (available / (n * advanceEm + trackingEm * Math.max(n - 1, 0))) * scale;
  return `font-size: ${size.toFixed(2)}px; line-height: 1; letter-spacing: ${trackingEm}em;`;
};

const leftVerticalStyles = computed(() =>
  leftVerticalLines.map((line) => fitVerticalToBand(line.text)),
);
const entrepreneurshipStyle = computed(() => fitVerticalToBand(entrepreneurshipWord.text, 0.06, 0.7, 0.85));
const resilienceStyle = computed(() => fitVerticalToBand(resilienceWord.text, 0.06, 0.7, 0.85));

const headlineRef = ref<HTMLElement | null>(null);
const { width: headlineWidth } = useElementSize(headlineRef);
const wordCloudRowStyle = computed(() => {
  if (!headlineWidth.value) return { width: '100%', maxWidth: '100%' };
  return {
    width: '100%',
    // Keep the dashed rectangle compact vs. the headline
    maxWidth: `${Math.round(headlineWidth.value * 0.78)}px`,
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
          ref="wordCloudBoxRef"
          class="word-cloud-box font-brand mt-8 md:mt-12 lg:mt-14 flex flex-col gap-1 sm:gap-1.5 select-none px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 w-full max-w-full"
          :style="wordCloudRowStyle"
        >
          <span class="corner tl" aria-hidden="true"></span>
          <span class="corner tr" aria-hidden="true"></span>
          <span class="corner bl" aria-hidden="true"></span>
          <span class="corner br" aria-hidden="true"></span>

          <!-- Top phrase — fills box width so R aligns with E/E/Y -->
          <span
            class="block w-full whitespace-nowrap uppercase overflow-hidden"
            :class="topPhrase.class"
            :style="topPhraseStyle"
          >
            {{ topPhrase.text }}
          </span>

          <!-- Inner rectangle: left verticals | middle 3 rows | right verticals -->
          <div class="word-cloud-inner flex items-stretch gap-1.5 sm:gap-2 w-full min-w-0">
            <div class="hidden md:flex flex-row items-center gap-0.5 shrink-0 self-stretch">
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
                class="w-full whitespace-nowrap overflow-hidden text-left"
                :style="middleRowStyles[rowIndex]"
              >
                <template v-for="(word, wordIndex) in row.words" :key="word.text">
                  <span
                    class="uppercase"
                    :class="word.class"
                  >{{ word.text }}</span>{{ wordIndex < row.words.length - 1 ? ' ' : '' }}
                </template>
              </div>
            </div>

            <div class="hidden md:flex flex-row items-center gap-0.5 shrink-0 self-stretch">
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

          <!-- Bottom phrase — fills box width so E aligns with E/E/Y -->
          <span
            class="block w-full whitespace-nowrap uppercase overflow-hidden"
            :class="bottomPhrase.class"
            :style="bottomPhraseStyle"
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
      class="hero-cta-bar mt-12 md:mt-16 lg:mt-24 relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 px-5 sm:px-6 md:px-12 lg:px-20 xl:px-[160px] py-16 md:py-20 lg:py-28 transition-all duration-700 ease-out delay-150"
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

.word-cloud-sidebar > .word-cloud-vertical {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-cta-bar {
  background-image: url('/assets/images/bg1.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
