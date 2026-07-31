<script setup lang="ts">
import { ref } from 'vue';

export type InsightVariant = 'curiosity' | 'campus' | 'persistence';

interface Props {
  number?: string;
  titleHtml?: string;
  quoteHtml?: string;
  body?: string;
  variant?: InsightVariant;
  backTitle?: string;
  backBody?: string;
}

withDefaults(defineProps<Props>(), {
  number: '',
  titleHtml: '',
  quoteHtml: '',
  body: '',
  variant: 'curiosity',
  backTitle: '',
  backBody: 'Coming soon',
});

const isFlipped = ref(false);

const toggleFlip = () => {
  isFlipped.value = !isFlipped.value;
};
</script>

<template>
  <button
    type="button"
    class="insight-card group w-full text-left transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    :aria-pressed="isFlipped"
    :aria-label="isFlipped ? 'Flip card back' : 'Flip card'"
    @click="toggleFlip"
  >
    <div
      class="insight-card-inner relative min-h-[380px] w-full"
      :class="{ 'is-flipped': isFlipped }"
    >
      <!-- Front -->
      <div
        class="insight-card-face insight-card-front absolute inset-0 flex flex-col justify-between rounded-2xl border border-white/[0.06] p-8 overflow-hidden transition-[border-color,box-shadow] duration-300 group-hover:border-accent/20 group-hover:shadow-glow-sm"
        :class="{
          'insight-bg-curiosity': variant === 'curiosity',
          'insight-bg-campus': variant === 'campus',
          'insight-bg-persistence': variant === 'persistence',
        }"
        :aria-hidden="isFlipped"
      >
        <div class="relative z-[1] space-y-4">
          <h3
            v-if="titleHtml"
            class="font-display font-bold text-white text-xl md:text-2xl leading-snug"
          >
            <span
              v-if="number"
              class="font-dm font-medium text-accent mr-2"
            >{{ number }}</span><span v-html="titleHtml" />
          </h3>
          <p
            v-if="quoteHtml"
            class="font-display font-bold text-white text-xl md:text-2xl leading-snug"
          >
            <span
              v-if="number && !titleHtml"
              class="font-dm font-medium text-accent mr-2"
            >{{ number }}</span><span v-html="quoteHtml" />
          </p>
          <p
            v-if="body"
            class="text-sm md:text-[15px] leading-relaxed text-[#a0a0a0]"
          >
            {{ body }}
          </p>
        </div>

        <div class="relative z-[1] mt-8 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-[#666666]">
          <span>click to FLIP →</span>
          <span class="tracking-[0.22em]">SUONNITYA</span>
        </div>
      </div>

      <!-- Back -->
      <div
        class="insight-card-face insight-card-back absolute inset-0 flex flex-col justify-between rounded-2xl border border-accent/20 p-8 overflow-hidden"
        :aria-hidden="!isFlipped"
      >
        <div class="space-y-4 overflow-y-auto">
          <h3
            v-if="backTitle"
            class="font-display font-bold text-white text-xl md:text-2xl leading-snug"
          >
            {{ backTitle }}
          </h3>
          <p class="text-sm md:text-[15px] leading-relaxed text-[#a0a0a0] whitespace-pre-line">
            {{ backBody }}
          </p>
        </div>

        <div class="mt-6 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-[#666666]">
          <span>← click to flip back</span>
          <span class="tracking-[0.22em]">SUONNITYA</span>
        </div>
      </div>
    </div>
  </button>
</template>

<style scoped>
.insight-card {
  perspective: 1000px;
  -webkit-perspective: 1000px;
  /* Promote to its own layer — helps iOS not composite both faces */
  transform: translateZ(0);
}

.insight-card-inner {
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
  transition: transform 0.6s ease;
}

.insight-card-inner.is-flipped {
  transform: rotateY(180deg);
}

.insight-card-face {
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
  /* Fully opaque fill so text from the other face can't bleed through */
  background-color: #151515;
  background-image: linear-gradient(160deg, #1e1e1e 0%, #151515 100%);
}

.insight-card-front {
  transform: rotateY(0deg) translateZ(1px);
  -webkit-transform: rotateY(0deg) translateZ(1px);
  z-index: 2;
  /* Hide after mid-flip so iOS can't keep painting front title over the back */
  transition: opacity 0s linear 0s, visibility 0s linear 0s;
  opacity: 1;
  visibility: visible;
}

.insight-card-inner.is-flipped .insight-card-front {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0s linear 0.3s, visibility 0s linear 0.3s;
}

.insight-card-back {
  transform: rotateY(180deg) translateZ(1px);
  -webkit-transform: rotateY(180deg) translateZ(1px);
  z-index: 1;
  background-color: #151515;
  background-image: linear-gradient(160deg, #1e1e1e 0%, #151515 100%);
  transition: opacity 0s linear 0.3s, visibility 0s linear 0.3s;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.insight-card-inner.is-flipped .insight-card-back {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  z-index: 2;
  transition: opacity 0s linear 0s, visibility 0s linear 0s;
}

.insight-bg-curiosity::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    linear-gradient(160deg, rgba(30, 30, 30, 0.92) 0%, rgba(21, 21, 21, 0.96) 100%),
    radial-gradient(circle at 80% 20%, rgba(74, 158, 255, 0.18), transparent 45%),
    linear-gradient(135deg, transparent 40%, rgba(74, 158, 255, 0.06) 41%, transparent 42%),
    repeating-linear-gradient(
      -35deg,
      transparent,
      transparent 18px,
      rgba(255, 255, 255, 0.015) 18px,
      rgba(255, 255, 255, 0.015) 19px
    );
  pointer-events: none;
}

.insight-bg-campus::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    linear-gradient(160deg, rgba(30, 30, 30, 0.97) 0%, rgba(21, 21, 21, 1) 100%),
    radial-gradient(ellipse at 10% 90%, rgba(74, 158, 255, 0.08), transparent 50%);
  pointer-events: none;
}

.insight-bg-persistence::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-color: #151515;
  background-image:
    linear-gradient(160deg, rgba(30, 30, 30, 0.9) 0%, rgba(21, 21, 21, 0.95) 100%),
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.12) 0 1px, transparent 1.5px),
    radial-gradient(circle at 70% 20%, rgba(255, 255, 255, 0.1) 0 1px, transparent 1.5px),
    radial-gradient(circle at 45% 65%, rgba(255, 255, 255, 0.08) 0 1px, transparent 1.5px),
    radial-gradient(circle at 85% 55%, rgba(74, 158, 255, 0.25) 0 1px, transparent 1.5px),
    radial-gradient(circle at 30% 80%, rgba(255, 255, 255, 0.09) 0 1px, transparent 1.5px),
    radial-gradient(circle at 60% 40%, rgba(255, 255, 255, 0.07) 0 1px, transparent 1.5px);
  background-size: auto, 120px 120px, 160px 160px, 100px 100px, 140px 140px, 180px 180px, 90px 90px;
  pointer-events: none;
}
</style>
