<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';
import { useNavigationStore } from '~/stores/navigationStore';

interface Stat {
  value: string;
  label: string;
}

const journeyPoints: string[] = [
  "Born in Cambodia, in a society that didn't put much value on technology or engineering as a career path.",
  'Won a bronze medal at the National Math Olympiad in 2017 — the first real lesson in discipline and deep, sustained focus.',
  'Studied Computer Science at Beijing University of Technology (BJUT), Built foundation in programming, algorithms, NLP, Computer Vision, and Pattern Recognition coursework at the same time.',
  'Wrote a thesis on Semi-Supervised Object Detection — designed and implemented the model from scratch.',
  'Spent years reading business and economics on the side, which shaped how I think about systems, not just code.',
  'Currently rebuilding: back to AI/ML fundamentals, shipping code daily.',
];

const stats: Stat[] = [
  { value: '2017', label: 'Math Olympiad Bronze' },
  { value: 'BJUT', label: 'CS Degree, Beijing' },
  { value: '1.5', label: 'Years Professional Experience' },
  { value: '3', label: 'AI Specializations Studied' },
];

const sectionRef = ref<HTMLElement | null>(null);
const navigationStore = useNavigationStore();

useIntersectionObserver(
  sectionRef,
  ([entry]) => {
    navigationStore.isAboutInView = entry?.isIntersecting ?? false;
  },
  { threshold: 0.35 },
);

onUnmounted(() => {
  navigationStore.isAboutInView = false;
});
</script>

<template>
  <section
    id="about"
    ref="sectionRef"
    class="bg-background py-24 md:py-32 scroll-mt-20 md:scroll-mt-24"
  >
    <div class="w-full px-6 md:px-20 lg:px-[160px] grid grid-cols-1 xl:grid-cols-12 gap-12 xl:gap-16">
      <div class="xl:col-span-7">
        <p class="text-xs md:text-sm font-display font-semibold uppercase tracking-[0.3em] text-accent">
          The Journey
        </p>

        <h2 class="mt-4 font-display font-extrabold uppercase text-white text-3xl sm:text-4xl md:text-5xl leading-tight">
          From Bronze Medal to Breakthrough Code
        </h2>

        <div class="mt-10 space-y-5">
          <div v-for="point in journeyPoints" :key="point" class="flex gap-3">
            <img
              src="/supermemory_bullet_split.svg"
              alt=""
              class="mt-1.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            <p class="text-muted text-sm md:text-base leading-relaxed">
              {{ point }}
            </p>
          </div>
        </div>
      </div>

      <div class="xl:col-span-5 min-w-0">
        <div class="grid grid-cols-2 gap-5 md:gap-6">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="stat-card"
          >
            <span class="stat-card-label">{{ stat.label }}</span>
            <span class="stat-card-value">{{ stat.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stat-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  padding: clamp(16px, 4cqi, 22px) clamp(18px, 5cqi, 28px);
  min-height: clamp(120px, 16cqi, 160px);
  overflow: hidden;
  background-color: #1450e8;
  color: #fff;
  border-radius: 8px;
  container-type: inline-size;
  min-width: 0;
}

.stat-card-label {
  font-size: clamp(10px, 2.5cqi, 11.5px);
  font-weight: 500;
  letter-spacing: 0.1em;
  line-height: 1.2;
  color: #ffffffd9;
  text-transform: uppercase;
  position: relative;
  z-index: 2;
}

.stat-card-value {
  font-size: clamp(24px, 12cqi, 48px);
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1;
  color: #fff;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  z-index: 2;
}

.stat-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(120% 160% at 0% 0%, #5eb8ff 0%, #3e86f5 22%, transparent 55%),
    linear-gradient(115deg, #1450e8 0%, #0e2fdd 55%, #0a1fd8 100%);
  pointer-events: none;
  z-index: 0;
}

.stat-card::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.25' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='gamma' amplitude='1' exponent='1.6' offset='0'/></feComponentTransfer></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  background-size: 220px 220px;
  mix-blend-mode: overlay;
  opacity: 0.9;
  -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 30%, black 75%);
  mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 30%, black 75%);
  pointer-events: none;
  z-index: 1;
}
</style>
