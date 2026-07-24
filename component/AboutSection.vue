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
    <div class="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
      <div class="lg:col-span-3">
        <p class="text-xs md:text-sm font-display font-semibold uppercase tracking-[0.3em] text-accent">
          The Journey
        </p>

        <h2 class="mt-4 font-display font-extrabold uppercase text-white text-3xl sm:text-4xl md:text-5xl leading-tight">
          From Bronze Medal to Breakthrough Code
        </h2>

        <div class="mt-10 space-y-5">
          <div v-for="point in journeyPoints" :key="point" class="flex gap-3">
            <span class="mt-2 h-1.5 w-1.5 rounded-full bg-accent shrink-0"></span>
            <p class="text-muted text-sm md:text-base leading-relaxed">
              {{ point }}
            </p>
          </div>
        </div>
      </div>

      <div class="lg:col-span-2">
        <div class="grid grid-cols-2 gap-5 md:gap-6">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="border border-white/10 rounded-xl p-6 hover:border-accent/40 transition-colors duration-300"
          >
            <p class="font-display font-extrabold text-accent text-3xl md:text-4xl">
              {{ stat.value }}
            </p>
            <p class="mt-2 text-xs md:text-sm uppercase tracking-wide text-muted">
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
