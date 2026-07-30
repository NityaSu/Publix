<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { Pause, Play } from 'lucide-vue-next';

const props = defineProps<{
  slug: string;
}>();

/** Minimum time to show "Generating audio..." before playback starts. */
const MIN_LOADING_MS = 1400;

const audioRef = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const isLoading = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const loadingStartedAt = ref(0);

const src = computed(() => `/api/listen/${props.slug}.mp3`);

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

const timeLabel = computed(
  () => `${formatTime(currentTime.value)} / ${formatTime(duration.value)}`,
);

function onLoadedMetadata() {
  const el = audioRef.value;
  if (!el) return;
  duration.value = el.duration;
}

function onTimeUpdate() {
  const el = audioRef.value;
  if (!el) return;
  currentTime.value = el.currentTime;
}

function onWaiting() {
  if (!isPlaying.value) isLoading.value = true;
}

function onCanPlay() {
  if (!isPlaying.value) isLoading.value = false;
}

function onPlay() {
  isPlaying.value = true;
  isLoading.value = false;
}

function onPause() {
  isPlaying.value = false;
}

function onEnded() {
  isPlaying.value = false;
  currentTime.value = 0;
  if (audioRef.value) audioRef.value.currentTime = 0;
}

function waitForCanPlay(el: HTMLAudioElement) {
  if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error('Audio failed to load'));
    };
    const cleanup = () => {
      el.removeEventListener('canplay', onReady);
      el.removeEventListener('error', onError);
    };

    el.addEventListener('canplay', onReady, { once: true });
    el.addEventListener('error', onError, { once: true });
    el.load();
  });
}

function waitForMinLoading() {
  const elapsed = Date.now() - loadingStartedAt.value;
  const remaining = MIN_LOADING_MS - elapsed;
  if (remaining <= 0) return Promise.resolve();
  return new Promise<void>((resolve) => setTimeout(resolve, remaining));
}

async function toggle() {
  const el = audioRef.value;
  if (!el) return;

  if (isPlaying.value) {
    el.pause();
    return;
  }

  isLoading.value = true;
  loadingStartedAt.value = Date.now();

  try {
    await Promise.all([waitForCanPlay(el), waitForMinLoading()]);
    await el.play();
  } catch {
    isLoading.value = false;
    isPlaying.value = false;
  }
}

watch(
  () => props.slug,
  () => {
    isPlaying.value = false;
    isLoading.value = false;
    currentTime.value = 0;
    duration.value = 0;
    const el = audioRef.value;
    if (el) {
      el.pause();
      el.load();
    }
  },
);

onBeforeUnmount(() => {
  audioRef.value?.pause();
});
</script>

<template>
  <div
    class="inline-flex items-center gap-3 rounded-full border border-white/10 bg-surface px-3 py-2 text-sm text-white"
    role="group"
    aria-label="Listen to article"
  >
    <audio
      ref="audioRef"
      :src="src"
      preload="none"
      @loadedmetadata="onLoadedMetadata"
      @timeupdate="onTimeUpdate"
      @waiting="onWaiting"
      @canplay="onCanPlay"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
    />

    <button
      type="button"
      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-background transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
      :disabled="isLoading"
      :aria-label="isPlaying ? 'Pause' : 'Play'"
      @click="toggle"
    >
      <Pause v-if="isPlaying" class="h-4 w-4" />
      <Play v-else class="h-4 w-4 translate-x-px" />
    </button>

    <div class="min-w-[9rem] font-mono text-xs tracking-wide text-muted">
      <span v-if="isLoading" class="text-white/60 animate-pulse">
        Generating audio...
      </span>
      <span v-else>{{ timeLabel }}</span>
    </div>
  </div>
</template>
