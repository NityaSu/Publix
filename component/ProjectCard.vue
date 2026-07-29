<script setup lang="ts">
import { ref } from 'vue';
import { Github, ExternalLink, AlertCircle, Clock } from 'lucide-vue-next';
import type { Project } from '~/data/projects';
import ImageCarousel from '~/component/ImageCarousel.vue';

interface Props {
  project: Project;
}

const props = defineProps<Props>();

const activeImage = ref(0);
const showLightbox = ref(false);
const lightboxIndex = ref(0);

const openLightbox = (index: number) => {
  if (props.project.images.length === 0) return;
  lightboxIndex.value = index;
  showLightbox.value = true;
};

const closeLightbox = () => {
  showLightbox.value = false;
};

const statusLabel = () => {
  if (props.project.status === 'placeholder') return { text: 'Coming Soon', icon: Clock };
  if (props.project.status === 'lost') return { text: 'Code Unavailable', icon: AlertCircle };
  return { text: 'Shipped', icon: null };
};
</script>

<template>
  <div
    class="group relative flex flex-col rounded-2xl border border-white/10 bg-[#151515] overflow-hidden transition-all duration-300 hover:border-accent/40 hover:shadow-glow-sm"
  >
    <!-- Status badge -->
    <div class="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/80 backdrop-blur-sm">
      <component :is="statusLabel().icon" v-if="statusLabel().icon" :size="12" />
      <span>{{ statusLabel().text }}</span>
    </div>

    <!-- Image gallery / placeholder -->
    <ImageCarousel
      v-if="project.images.length > 0"
      v-model="activeImage"
      :images="project.images"
      :aria-label="`${project.title} image gallery`"
      fit="cover"
      arrow-size="sm"
      clickable
      frame-class="aspect-video w-full bg-[#0d0d0d]"
      image-class="h-full"
      @select="openLightbox"
    />
    <div
      v-else
      class="relative aspect-video w-full bg-[#0d0d0d] flex flex-col items-center justify-center gap-2 text-white/40"
    >
      <Clock :size="32" />
      <span class="text-xs uppercase tracking-widest">Coming Soon</span>
    </div>

    <!-- Content -->
    <div class="flex flex-1 flex-col p-5 md:p-6">
      <div class="flex items-center justify-between gap-3">
        <span class="text-[10px] uppercase tracking-[0.2em] text-accent">{{ project.category }}</span>
        <span class="text-[10px] uppercase tracking-wider text-white/40">{{ project.year }}</span>
      </div>

      <h3 class="mt-2 font-display font-bold text-lg md:text-xl text-white">
        {{ project.title }}
      </h3>
      <p class="mt-1 text-sm text-white/60">{{ project.tagline }}</p>
      <p class="mt-3 text-sm text-white/50 leading-relaxed flex-1">
        {{ project.description }}
      </p>

      <!-- Stack -->
      <div v-if="project.stack.length > 0" class="mt-4 flex flex-wrap gap-2">
        <span
          v-for="tech in project.stack"
          :key="tech"
          class="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/70"
        >
          {{ tech }}
        </span>
      </div>

      <!-- Links -->
      <div class="mt-5 flex flex-wrap items-center gap-3">
        <a
          v-if="project.github"
          :href="project.github"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-white hover:bg-accent/20 hover:text-accent transition-colors"
        >
          <Github :size="14" />
          View Code
        </a>
        <a
          v-if="project.demo"
          :href="project.demo"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-white hover:bg-accent/20 hover:text-accent transition-colors"
        >
          <ExternalLink :size="14" />
          Live Demo
        </a>
      </div>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <div
        v-if="showLightbox"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6"
        @click.self="closeLightbox"
      >
        <button
          type="button"
          class="absolute right-4 top-4 z-20 h-11 w-11 rounded-full border border-white/20 bg-black/50 text-white flex items-center justify-center hover:bg-black/70 hover:border-accent/50 transition-colors"
          aria-label="Close lightbox"
          @click="closeLightbox"
        >
          ✕
        </button>

        <div class="w-full max-w-5xl" @click.stop>
          <ImageCarousel
            v-model="lightboxIndex"
            :images="project.images"
            :aria-label="`${project.title} full preview`"
            fit="contain"
            arrow-size="lg"
            arrows-always-visible
            frame-class="rounded-xl border border-white/10 bg-surface"
            image-class="max-h-[80vh]"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>
