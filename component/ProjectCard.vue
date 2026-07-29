<script setup lang="ts">
import { ref } from 'vue';
import { Github, ExternalLink, AlertCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { useSwipe } from '@vueuse/core';
import type { Project } from '~/data/projects';

interface Props {
  project: Project;
}

const props = defineProps<Props>();

const activeImage = ref(0);
const showLightbox = ref(false);
const lightboxIndex = ref(0);
const galleryRef = ref<HTMLElement | null>(null);
const didSwipe = ref(false);

const imageCount = () => props.project.images.length;

const nextImage = () => {
  if (imageCount() < 2) return;
  activeImage.value = (activeImage.value + 1) % imageCount();
};

const prevImage = () => {
  if (imageCount() < 2) return;
  activeImage.value = (activeImage.value - 1 + imageCount()) % imageCount();
};

const goToImage = (index: number) => {
  if (index === activeImage.value) return;
  activeImage.value = index;
};

useSwipe(galleryRef, {
  threshold: 40,
  onSwipeEnd(_e, direction) {
    if (imageCount() < 2) return;
    didSwipe.value = true;
    if (direction === 'left') nextImage();
    if (direction === 'right') prevImage();
  },
});

const openLightbox = (index: number) => {
  if (props.project.images.length === 0) return;
  lightboxIndex.value = index;
  showLightbox.value = true;
};

const onGalleryClick = () => {
  if (didSwipe.value) {
    didSwipe.value = false;
    return;
  }
  openLightbox(activeImage.value);
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
    class="group relative flex flex-col rounded-2xl border border-white/10 bg-[#151515] overflow-hidden transition-all duration-300 hover:border-accent/40 hover:shadow-glow-sm"
  >
    <!-- Status badge -->
    <div class="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/80 backdrop-blur-sm">
      <component :is="statusLabel().icon" v-if="statusLabel().icon" :size="12" />
      <span>{{ statusLabel().text }}</span>
    </div>

    <!-- Image gallery / placeholder -->
    <div
      ref="galleryRef"
      class="relative aspect-video w-full bg-[#0d0d0d] overflow-hidden cursor-pointer touch-pan-y select-none"
      role="region"
      aria-roledescription="carousel"
      :aria-label="`${project.title} image gallery`"
      @click="onGalleryClick"
    >
      <template v-if="project.images.length > 0">
        <img
          v-for="(img, index) in project.images"
          :key="img"
          :src="img"
          alt=""
          class="h-full w-full object-cover transition-opacity duration-300"
          :class="
            index === activeImage
              ? 'relative z-[1] opacity-100'
              : 'absolute inset-0 z-0 opacity-0 pointer-events-none'
          "
          draggable="false"
        />

        <button
          v-if="project.images.length > 1"
          type="button"
          aria-label="Previous image"
          class="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full border border-white/20 bg-black/50 text-white flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70 hover:border-accent/50"
          @click.stop="prevImage"
        >
          <ChevronLeft :size="16" />
        </button>
        <button
          v-if="project.images.length > 1"
          type="button"
          aria-label="Next image"
          class="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full border border-white/20 bg-black/50 text-white flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70 hover:border-accent/50"
          @click.stop="nextImage"
        >
          <ChevronRight :size="16" />
        </button>

        <!-- Dots -->
        <div
          v-if="project.images.length > 1"
          class="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2"
        >
          <button
            v-for="(img, i) in project.images"
            :key="img"
            type="button"
            class="h-1.5 rounded-full transition-all duration-200"
            :class="i === activeImage ? 'w-5 bg-accent' : 'w-1.5 bg-white/40 hover:bg-white/70'"
            :aria-label="`Show image ${i + 1}`"
            :aria-current="i === activeImage ? 'true' : undefined"
            @click.stop="goToImage(i)"
          />
        </div>
      </template>

      <div
        v-else
        class="flex h-full w-full flex-col items-center justify-center gap-2 text-white/40"
      >
        <Clock :size="32" />
        <span class="text-xs uppercase tracking-widest">Coming Soon</span>
      </div>
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
