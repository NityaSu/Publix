<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { Github, ExternalLink, Clock, Play } from 'lucide-vue-next';
import type { Project } from '~/data/projects';
import ImageCarousel from '~/component/ImageCarousel.vue';
import AutoWalletTicketThumb from '~/component/AutoWalletTicketThumb.vue';
import SuperSynapseThumb from '~/component/SuperSynapseThumb.vue';
import BotCabThumb from '~/component/BotCabThumb.vue';
import BotCabApp from '~/component/BotCabApp.vue';
import PodsumThumb from '~/component/PodsumThumb.vue';

interface Props {
  project: Project;
}

const props = defineProps<Props>();

const activeImage = ref(0);
const showLightbox = ref(false);
const lightboxIndex = ref(0);
const showBotCab = ref(false);

const isInternalDemo = computed(() => !!props.project.demo?.startsWith('/'));
const isBotCab = computed(() => props.project.cover === 'botcab');

const openLightbox = (index: number) => {
  if (props.project.images.length === 0) return;
  lightboxIndex.value = index;
  showLightbox.value = true;
};

const closeLightbox = () => {
  showLightbox.value = false;
};

const openBotCab = () => {
  showBotCab.value = true;
};

const closeBotCab = () => {
  showBotCab.value = false;
};

const onEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeBotCab();
};

watch(showBotCab, (open) => {
  if (!import.meta.client) return;
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) window.addEventListener('keydown', onEscape);
  else window.removeEventListener('keydown', onEscape);
});

onUnmounted(() => {
  if (!import.meta.client) return;
  document.body.style.overflow = '';
  window.removeEventListener('keydown', onEscape);
});

const coverClass = computed(() => {
  if (props.project.cover === 'supersynapse') {
    return 'aspect-video w-full overflow-hidden bg-[#fafaf8]';
  }
  if (props.project.cover === 'botcab' || props.project.cover === 'podsum') {
    return 'relative aspect-video overflow-hidden bg-[#0c0e13]';
  }
  return 'relative aspect-video overflow-hidden bg-[#e9e6df]';
});

const statusLabel = computed(() => {
  if (props.project.status === 'placeholder') return 'Coming Soon';
  if (props.project.status === 'in_progress') return 'In Progress';
  if (props.project.status === 'lost') return 'Code Unavailable';
  return 'Shipped';
});
</script>

<template>
  <div
    :id="project.id"
    class="group relative flex flex-col scroll-mt-24 rounded-2xl border border-white/10 bg-[#151515] overflow-hidden transition-all duration-300 hover:border-accent/40 hover:shadow-glow-sm"
  >
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
    <button
      v-else-if="isBotCab"
      type="button"
      :class="[coverClass, 'cursor-pointer text-left transition-[filter] duration-200 hover:brightness-[1.08]']"
      aria-label="Open BotCab demo"
      @click="openBotCab"
    >
      <BotCabThumb />
    </button>
    <a
      v-else-if="project.cover && project.demo"
      :href="project.demo"
      target="_blank"
      rel="noopener noreferrer"
      :class="[coverClass, 'cursor-pointer transition-[filter] duration-200 hover:brightness-[1.08]']"
      :aria-label="`Open ${project.title}`"
    >
      <AutoWalletTicketThumb v-if="project.cover === 'autowallet'" />
      <SuperSynapseThumb v-else-if="project.cover === 'supersynapse'" />
      <PodsumThumb v-else-if="project.cover === 'podsum'" />
    </a>
    <a
      v-else-if="project.cover && project.github"
      :href="project.github"
      target="_blank"
      rel="noopener noreferrer"
      :class="[coverClass, 'cursor-pointer transition-[filter] duration-200 hover:brightness-[1.08]']"
      :aria-label="`Open ${project.title} on GitHub`"
    >
      <PodsumThumb v-if="project.cover === 'podsum'" />
      <AutoWalletTicketThumb v-else-if="project.cover === 'autowallet'" />
      <SuperSynapseThumb v-else-if="project.cover === 'supersynapse'" />
    </a>
    <div
      v-else-if="project.cover"
      :class="coverClass"
    >
      <AutoWalletTicketThumb v-if="project.cover === 'autowallet'" />
      <SuperSynapseThumb v-else-if="project.cover === 'supersynapse'" />
      <PodsumThumb v-else-if="project.cover === 'podsum'" />
    </div>
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
        <span class="text-[10px] uppercase tracking-wider text-white/40">
          {{ statusLabel }} · {{ project.year }}
        </span>
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
        <button
          v-if="isBotCab"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-white hover:bg-accent/20 hover:text-accent transition-colors"
          @click="openBotCab"
        >
          <Play :size="14" />
          Try demo
        </button>
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
        <NuxtLink
          v-if="isInternalDemo && project.demo"
          :to="project.demo"
          class="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-white hover:bg-accent/20 hover:text-accent transition-colors"
        >
          <ExternalLink :size="14" />
          Open demo
        </NuxtLink>
        <a
          v-else-if="project.demo"
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

    <Teleport v-if="isBotCab" to="body">
      <div
        v-if="showBotCab"
        class="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4 sm:p-6"
        @click.self="closeBotCab"
      >
        <button
          type="button"
          class="absolute right-4 top-4 z-[90] h-11 w-11 rounded-full border border-white/20 bg-black/50 text-white flex items-center justify-center hover:bg-black/70 hover:border-accent/50 transition-colors"
          aria-label="Close BotCab demo"
          @click="closeBotCab"
        >
          ✕
        </button>
        <div
          class="max-h-[90vh] w-full max-w-[960px] overflow-auto rounded-2xl border border-white/10 bg-[#0c0e13] p-4 sm:p-6"
          @click.stop
        >
          <BotCabApp />
        </div>
      </div>
    </Teleport>

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
