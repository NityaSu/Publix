<script setup lang="ts">
import { ref } from 'vue';
import ProjectBot from '~/component/ProjectBot.vue';
import AsciiWaveCanvas from '~/component/AsciiWaveCanvas.vue';
import ProjectCard from '~/component/ProjectCard.vue';
import { projects } from '~/data/projects';

useHead({
  title: 'Projects',
});

const mode = ref<'normal' | 'sleepy'>('normal');
const showProjects = ref(false);

const toggleMode = () => {
  mode.value = mode.value === 'normal' ? 'sleepy' : 'normal';
};

const enterProjects = () => {
  showProjects.value = true;
};

const backToHero = () => {
  showProjects.value = false;
};
</script>

<template>
  <main class="relative min-h-screen w-full overflow-hidden bg-[#0d0d0d] project-page">
    <!-- Animated ASCII wave background (always visible) -->
    <AsciiWaveCanvas class="fixed inset-0 z-0" color="231, 76, 60" />

    <!-- Intro view -->
    <section
      v-show="!showProjects"
      class="relative z-10 flex min-h-screen w-full items-center justify-center px-6"
    >
      <div class="relative z-10 flex flex-col items-center text-center project-tagline">
        <!-- Bot -->
        <ProjectBot
          :mode="mode"
          class="mb-6 cursor-pointer"
          role="button"
          tabindex="0"
          aria-label="Toggle bot expression"
          @click="toggleMode"
          @keydown.enter="toggleMode"
        />

        <p class="project-sub">Coming Soon · Building in Public</p>

        <h1 class="project-headline">
          Projects are <em class="project-emphasis">currently</em><br />in development.
        </h1>

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

        <button
          type="button"
          class="mt-10 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white shadow-glow-sm transition-all duration-300 hover:bg-accent/90 hover:scale-105"
          @click="enterProjects"
        >
          View Projects
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>

    <!-- Project list view -->
    <section
      v-show="showProjects"
      class="relative z-10 w-full px-6 py-24 md:px-12 lg:px-20 xl:px-[120px]"
    >
      <div class="mx-auto max-w-6xl">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="project-sub">Selected Work</p>
            <h2 class="font-display font-extrabold text-3xl md:text-5xl text-white">
              Projects
            </h2>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-white/10"
            @click="backToHero"
          >
            ← Back
          </button>
        </div>

        <div class="mt-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <ProjectCard
            v-for="project in projects"
            :key="project.id"
            :project="project"
          />
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.project-page {
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
