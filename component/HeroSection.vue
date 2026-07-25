<script setup lang="ts">
import { ref } from 'vue';
import { Play } from 'lucide-vue-next';
import { useIntersectionObserver } from '@vueuse/core';
import ProfileReveal from '~/component/ProfileReveal.vue';

interface WordCloudItem {
  text: string;
  class: string;
}

const wordCloud: WordCloudItem[] = [
  { text: 'INNOVATION', class: 'text-4xl md:text-6xl text-white/30 font-display font-extrabold' },
  { text: 'DEEP LEARNING', class: 'text-3xl md:text-5xl text-white/40 font-display font-bold' },
  { text: 'OBJECT DETECTION', class: 'text-2xl md:text-4xl text-white/35 font-display font-bold' },
  { text: 'SEMI-SUPERVISED', class: 'text-xl md:text-3xl text-white/25 font-display font-semibold' },
  { text: 'MATHEMATICS', class: 'text-3xl md:text-5xl text-white/40 font-display font-bold' },
  { text: 'PERSISTENCE', class: 'text-4xl md:text-6xl text-white/50 font-display font-extrabold' },
  { text: 'REBUILDING', class: 'text-4xl md:text-6xl text-accent/90 font-display font-extrabold' },
].map((item) => ({
  ...item,
  class: `${item.class} transition-colors duration-300 hover:text-accent`,
}));

const leftVerticalWords: string[] = ['CROSS-CULTURAL'];
const rightVerticalWords: string[] = ['ENTREPRENEURSHIP', 'RESILIENCE'];

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
        <h1 class="font-display font-extrabold uppercase leading-[0.95] tracking-tight text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
          <span class="block text-white">Bronze Medalist</span>
          <span class="block text-accent">National Math Olympiad</span>
        </h1>

        <div class="mt-6 h-1 w-40 md:w-56 rounded-full bg-gradient-to-r from-accent to-transparent"></div>

        <div class="mt-10 md:mt-14 flex items-start gap-3 md:gap-6 select-none">
          <div class="hidden sm:flex flex-col items-center justify-end gap-2 pb-2">
            <span
              v-for="word in leftVerticalWords"
              :key="word"
              class="text-xs md:text-sm font-display font-semibold uppercase tracking-[0.3em] text-white/25 rotate-180 transition-colors duration-300 hover:text-accent"
              style="writing-mode: vertical-rl"
            >
              {{ word }}
            </span>
          </div>

          <div class="flex-1 flex flex-col gap-1 md:gap-2 min-w-0">
            <span
              v-for="word in wordCloud"
              :key="word.text"
              class="leading-none whitespace-nowrap"
              :class="word.class"
            >
              {{ word.text }}
            </span>
          </div>

          <div class="hidden sm:flex flex-col items-center justify-end gap-3 pb-2">
            <span
              v-for="word in rightVerticalWords"
              :key="word"
              class="text-xs md:text-sm font-display font-semibold uppercase tracking-[0.3em] text-white/25 transition-colors duration-300 hover:text-accent"
              style="writing-mode: vertical-rl"
            >
              {{ word }}
            </span>
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
