<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { Pause, Play } from 'lucide-vue-next';

const props = defineProps<{
  slug: string;
}>();

/** Minimum time to show "Generating audio..." before playback starts. */
const MIN_LOADING_MS = 5600;

const SPEEDS = [1, 1.5, 2] as const;

const audioRef = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const isLoading = ref(false);
const hasStarted = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const loadingStartedAt = ref(0);
const speedIndex = ref(0);

const src = computed(() => `/api/listen/${props.slug}.mp3`);
const playbackRate = computed(() => SPEEDS[speedIndex.value]);
const waveformHeights = [
  32, 46, 56, 48, 60, 50, 58, 52, 61, 55, 63, 57, 64, 59, 62, 54,
  60, 51, 58, 49, 55, 46, 52, 44, 38, 50, 58, 47, 61, 53, 59, 48,
  62, 56, 64, 51, 57, 45, 53, 42, 49, 38, 46, 40, 54, 47, 60, 44,
] as const;

const statusLabel = computed(() => {
  if (isLoading.value) return 'Generating audio...';
  if (isPlaying.value || hasStarted.value) return 'Now playing';
  return '';
});

const progressPercent = computed(() => {
  if (!duration.value) return 0;
  return Math.min(100, (currentTime.value / duration.value) * 100);
});

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function applyPlaybackRate() {
  const el = audioRef.value;
  if (el) el.playbackRate = SPEEDS[speedIndex.value] ?? 1;
}

function onLoadedMetadata() {
  const el = audioRef.value;
  if (!el) return;
  duration.value = el.duration;
  applyPlaybackRate();
}

function onTimeUpdate() {
  const el = audioRef.value;
  if (!el) return;
  currentTime.value = el.currentTime;
}

function onWaiting() {
  if (!isPlaying.value && hasStarted.value) isLoading.value = true;
}

function onCanPlay() {
  if (hasStarted.value && isPlaying.value) isLoading.value = false;
}

function onPlay() {
  isPlaying.value = true;
  isLoading.value = false;
  hasStarted.value = true;
}

function onPause() {
  isPlaying.value = false;
}

function onEnded() {
  isPlaying.value = false;
  hasStarted.value = false;
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
    applyPlaybackRate();
    await el.play();
  } catch {
    isLoading.value = false;
    isPlaying.value = false;
  }
}

function cycleSpeed() {
  speedIndex.value = (speedIndex.value + 1) % SPEEDS.length;
  applyPlaybackRate();
}

watch(
  () => props.slug,
  () => {
    isPlaying.value = false;
    isLoading.value = false;
    hasStarted.value = false;
    currentTime.value = 0;
    duration.value = 0;
    speedIndex.value = 0;
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
    class="relative w-full rounded-[20px] border border-white/15 bg-background px-4"
    :class="statusLabel ? 'pb-4 pt-5' : 'py-4'"
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

    <div
      v-if="statusLabel"
      class="absolute left-4 right-4 top-0 flex -translate-y-1/2 items-center gap-3"
    >
      <span class="shrink-0 bg-background pr-3 text-sm font-medium leading-none text-muted">
        {{ statusLabel }}
      </span>
      <div class="h-px flex-1 bg-white/15" />
    </div>

    <div class="flex items-center gap-4">
      <button
        type="button"
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-background transition hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-80"
        :aria-label="isPlaying ? 'Pause' : 'Play'"
        @click="toggle"
      >
        <span
          v-if="isLoading"
          class="h-6 w-6 animate-spin rounded-full border-2 border-background/25 border-t-background"
          aria-hidden="true"
        />
        <Pause v-else-if="isPlaying" class="h-6 w-6" fill="currentColor" />
        <Play v-else class="ml-1 h-6 w-6" fill="currentColor" />
      </button>

      <div
        class="flex h-12 min-w-0 flex-1 items-center gap-[3px]"
        role="progressbar"
        :aria-valuenow="progressPercent"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          v-for="(height, index) in waveformHeights"
          :key="index"
          class="audio-wave-bar min-w-0 flex-1 rounded-full transition-colors duration-150"
          :class="index / (waveformHeights.length - 1) < progressPercent / 100 ? 'bg-white' : 'bg-white/35'"
          :style="{
            height: `${height}%`,
            opacity: isLoading ? 0.55 : 1,
            animationDelay: `${index * 70}ms`,
            animationDuration: `${900 + (index % 5) * 140}ms`,
            animationPlayState: isPlaying || isLoading ? 'running' : 'paused',
          }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.audio-wave-bar {
  transform-origin: center;
  animation-name: wavePulse;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

@keyframes wavePulse {
  0%,
  100% {
    transform: scaleY(0.72);
  }

  35% {
    transform: scaleY(1);
  }

  65% {
    transform: scaleY(0.82);
  }
}
</style>
