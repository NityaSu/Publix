<script setup lang="ts">
import { ref } from 'vue';
import ProjectBot from '~/component/ProjectBot.vue';
import AsciiWaveCanvas from '~/component/AsciiWaveCanvas.vue';

useHead({
  title: 'Projects',
});

const mode = ref<'normal' | 'sleepy'>('normal');

const toggleMode = () => {
  mode.value = mode.value === 'normal' ? 'sleepy' : 'normal';
};
</script>

<template>
  <main class="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0d0d0d] project-hero">
    <!-- Animated ASCII wave background -->
    <AsciiWaveCanvas class="z-0" color="231, 76, 60" />

    <!-- Content -->
    <div class="relative z-10 flex flex-col items-center text-center px-6 project-tagline">
      <!-- Bot: click to toggle expression -->
      <ProjectBot
        :mode="mode"
        class="mb-6 cursor-pointer"
        role="button"
        tabindex="0"
        aria-label="Toggle bot expression"
        @click="toggleMode"
        @keydown.enter="toggleMode"
      />

      <!-- Sub-heading -->
      <p class="project-sub">
        Coming Soon · Building in Public
      </p>

      <!-- Headline -->
      <h1 class="project-headline">
        Projects are <em class="project-emphasis">currently</em><br />in development.
      </h1>

      <!-- Mode toggles -->
      <div class="mt-8 md:mt-10 flex items-center gap-2">
        <button
          type="button"
          class="oc-btn"
          :class="{ active: mode === 'normal' }"
          @click="mode = 'normal'"
        >
          Normal
        </button>
        <button
          type="button"
          class="oc-btn"
          :class="{ active: mode === 'sleepy' }"
          @click="mode = 'sleepy'"
        >
          Sleepy
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.project-hero {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.project-tagline {
  pointer-events: none;
}

.project-tagline > * {
  pointer-events: auto;
}

.project-sub {
  font-size: 11px;
  font-weight: 500;
  color: #e74c3c;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.project-headline {
  font-size: 36px;
  font-weight: 500;
  color: #fff;
  letter-spacing: -0.5px;
  line-height: 1.2;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.project-headline em,
.project-emphasis {
  color: #e74c3c;
  font-style: italic;
  font-family: Georgia, serif;
  font-weight: 500;
}

.oc-btn {
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.oc-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.oc-btn.active {
  background: #3a7bd5;
  color: #fff;
  border-color: #3a7bd5;
}
</style>
