<script setup lang="ts">
import { ref } from 'vue';
import ProjectBot from '~/component/ProjectBot.vue';
import AsciiWaveCanvas from '~/component/AsciiWaveCanvas.vue';

useHead({
  title: 'Projects',
});

const mode = ref<'normal' | 'sleepy'>('normal');
</script>

<template>
  <main class="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">
    <!-- Animated ASCII wave background -->
    <AsciiWaveCanvas class="z-0" color="#e74c3c" />

    <!-- Content -->
    <div class="relative z-10 flex flex-col items-center text-center px-6 py-20 max-w-2xl mx-auto">
      <!-- Bot -->
      <ProjectBot :mode="mode" class="mb-8 md:mb-10" />

      <!-- Sub-heading -->
      <p class="text-xs sm:text-sm uppercase tracking-[0.25em] font-semibold text-[#e74c3c]">
        Coming Soon · Building in Public
      </p>

      <!-- Headline -->
      <h1 class="mt-4 font-display font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-tight">
        Projects are <em class="not-italic font-display font-extrabold text-[#e74c3c]">currently</em><br />in development.
      </h1>

      <!-- Mode toggles -->
      <div class="mt-10 md:mt-12 flex items-center gap-3">
        <button
          type="button"
          class="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
          :class="mode === 'normal'
            ? 'bg-[#4A9EFF] text-white shadow-[0_0_20px_rgba(74,158,255,0.4)]'
            : 'bg-white/10 text-white border border-white/20 hover:bg-white/15'"
          @click="mode = 'normal'"
        >
          Normal
        </button>
        <button
          type="button"
          class="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
          :class="mode === 'sleepy'
            ? 'bg-[#4A9EFF] text-white shadow-[0_0_20px_rgba(74,158,255,0.4)]'
            : 'bg-white/10 text-white border border-white/20 hover:bg-white/15'"
          @click="mode = 'sleepy'"
        >
          Sleepy
        </button>
      </div>
    </div>
  </main>
</template>
