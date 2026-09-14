<script setup lang="ts">
import { ref } from 'vue';
import ProjectBot from '~/component/ProjectBot.vue';
import ProjectCard from '~/component/ProjectCard.vue';
import { projects } from '~/data/projects';

useHead({
  title: 'Projects',
});

const mode = ref<'normal' | 'sleepy'>('normal');

const toggleMode = () => {
  mode.value = mode.value === 'normal' ? 'sleepy' : 'normal';
};
</script>

<template>
  <main class="relative min-h-screen w-full bg-[#0d0d0d]">
    <section class="relative z-10 w-full px-6 py-24 md:px-12 lg:px-20 xl:px-[120px]">
      <div class="mx-auto max-w-6xl">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="project-sub">Selected Work</p>
            <h1 class="font-display font-extrabold text-3xl md:text-5xl text-white">
              Projects
            </h1>
          </div>

          <ProjectBot
            :mode="mode"
            size="sm"
            class="cursor-pointer"
            role="button"
            tabindex="0"
            aria-label="Toggle bot expression"
            @click="toggleMode"
            @keydown.enter="toggleMode"
          />
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
.project-sub {
  font-size: 11px;
  font-weight: 500;
  color: #4A9EFF;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 12px;
}
</style>
