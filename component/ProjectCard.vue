<script setup lang="ts">
import { ref } from 'vue';
import { Github, ExternalLink, AlertCircle, Clock } from 'lucide-vue-next';
import type { Project } from '~/data/projects';

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

const nextLightbox = () => {
  lightboxIndex.value = (lightboxIndex.value + 1) % props.project.images.length;
};

const prevLightbox = () => {
  lightboxIndex.value = (lightboxIndex.value - 1 + props.project.images.length) % props.project.images.length;
};

const statusLabel = () => {
  if (props.project.status === 'placeholder') return { text: 'Coming Soon', icon: Clock };
  if (props.project.status === 'lost') return { text: 'Code Unavailable', icon: AlertCircle };
  return { text: 'Shipped', icon: null };
};
</script>

<template>
  <div
    class="project-card group relative flex flex-col overflow-hidden transition-all duration-300"
  >
    <!-- Color tint (above grain, below content) -->
    <div class="project-card__tint" aria-hidden="true" />

    <!-- Status badge -->
    <div class="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/80 backdrop-blur-sm">
      <component :is="statusLabel().icon" v-if="statusLabel().icon" :size="12" />
      <span>{{ statusLabel().text }}</span>
    </div>

    <!-- Image gallery / placeholder -->
    <div
      class="relative z-10 aspect-video w-full overflow-hidden cursor-pointer"
      @click="openLightbox(0)"
    >
      <template v-if="project.images.length > 0">
        <img
          :src="project.images[activeImage]"
          :alt="`${project.title} preview ${activeImage + 1}`"
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <!-- Thumbnails -->
        <div
          v-if="project.images.length > 1"
          class="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2"
        >
          <button
            v-for="(img, i) in project.images"
            :key="img"
            type="button"
            class="h-1.5 rounded-full transition-all duration-200"
            :class="i === activeImage ? 'w-5 bg-accent' : 'w-1.5 bg-black/30 hover:bg-black/50'"
            :aria-label="`Show image ${i + 1}`"
            @click.stop="activeImage = i"
          />
        </div>
      </template>

      <div
        v-else
        class="flex h-full w-full flex-col items-center justify-center gap-2 text-black/35"
      >
        <Clock :size="32" />
        <span class="text-xs uppercase tracking-widest">Coming Soon</span>
      </div>
    </div>

    <!-- Content -->
    <div class="relative z-10 flex flex-1 flex-col p-5 md:p-6">
      <div class="flex items-center justify-between gap-3">
        <span class="text-[10px] uppercase tracking-[0.2em] text-[#5b7fd4]">{{ project.category }}</span>
        <span class="text-[10px] uppercase tracking-wider text-black/40">{{ project.year }}</span>
      </div>

      <h3 class="mt-2 font-display font-bold text-lg md:text-xl text-[#1a1a2e]">
        {{ project.title }}
      </h3>
      <p class="mt-1 text-sm text-black/55">{{ project.tagline }}</p>
      <p class="mt-3 text-sm text-black/45 leading-relaxed flex-1">
        {{ project.description }}
      </p>

      <!-- Stack -->
      <div v-if="project.stack.length > 0" class="mt-4 flex flex-wrap gap-2">
        <span
          v-for="tech in project.stack"
          :key="tech"
          class="rounded-full border border-black/10 bg-white/40 px-2.5 py-1 text-[10px] uppercase tracking-wider text-black/60"
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
          class="inline-flex items-center gap-1.5 rounded-lg bg-black/5 px-3 py-2 text-xs font-medium text-[#1a1a2e] hover:bg-[#5b7fd4]/15 hover:text-[#3a5fb0] transition-colors"
        >
          <Github :size="14" />
          View Code
        </a>
        <a
          v-if="project.demo"
          :href="project.demo"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 rounded-lg bg-black/5 px-3 py-2 text-xs font-medium text-[#1a1a2e] hover:bg-[#5b7fd4]/15 hover:text-[#3a5fb0] transition-colors"
        >
          <ExternalLink :size="14" />
          Live Demo
        </a>
      </div>
    </div>

    <!-- Lightbox -->
    <div
      v-if="showLightbox"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      @click.self="closeLightbox"
    >
      <button
        type="button"
        class="absolute right-4 top-4 text-white/70 hover:text-white"
        aria-label="Close lightbox"
        @click="closeLightbox"
      >
        ✕
      </button>
      <button
        v-if="project.images.length > 1"
        type="button"
        class="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
        aria-label="Previous image"
        @click.stop="prevLightbox"
      >
        ‹
      </button>
      <img
        :src="project.images[lightboxIndex]"
        :alt="`${project.title} full preview ${lightboxIndex + 1}`"
        class="max-h-[80vh] max-w-[90vw] rounded-lg object-contain"
      />
      <button
        v-if="project.images.length > 1"
        type="button"
        class="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
        aria-label="Next image"
        @click.stop="nextLightbox"
      >
        ›
      </button>
    </div>
  </div>
</template>

<style scoped>
.project-card {
  position: relative;
  overflow: hidden;
  background-color: #fdfeff;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

/* Soft radial wash */
.project-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(90% 90% at 100% 100%, #bfe0fa 0%, #e4f1fc 35%, transparent 70%),
    #fdfeff;
  pointer-events: none;
  z-index: 0;
  border-radius: inherit;
}

/* Chunky grain — scaled tile so each speck reads as a visible pixel */
.project-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  background-size: 300px 300px;
  image-rendering: pixelated;
  mix-blend-mode: multiply;
  opacity: 0.6;
  -webkit-mask-image: radial-gradient(
    120% 120% at 100% 100%,
    black 0%,
    black 40%,
    rgba(0, 0, 0, 0.35) 75%,
    rgba(0, 0, 0, 0.2) 100%
  );
  mask-image: radial-gradient(
    120% 120% at 100% 100%,
    black 0%,
    black 40%,
    rgba(0, 0, 0, 0.35) 75%,
    rgba(0, 0, 0, 0.2) 100%
  );
  pointer-events: none;
  z-index: 1;
  border-radius: inherit;
}

.project-card__tint {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    #c9b6f2 0%,
    #b9cdf5 45%,
    #9ac3f5 75%,
    #7fb4f2 100%
  );
  mix-blend-mode: color;
  opacity: 0.55;
  pointer-events: none;
  z-index: 2;
  border-radius: inherit;
}

.project-card:hover {
  border-color: rgba(91, 127, 212, 0.35);
  box-shadow: 0 8px 32px rgba(127, 180, 242, 0.25);
}
</style>
