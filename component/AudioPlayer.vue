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
  32, 46, 56, 48, 60, 50, 58, 52, 61, 55, 63, 57,
  64, 59, 62, 54, 60, 51, 58, 49, 55, 46, 52, 44,
] as const;

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
    class="w-full max-w-[490px] rounded-[20px] border border-zinc-200 bg-white px-4 py-4 shadow-[0_2px_10px_rgba(15,23,42,0.06)]"
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

    <div class="flex items-center gap-4">
      <button
        type="button"
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-white transition hover:bg-black/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-80"
        :aria-label="isPlaying ? 'Pause' : 'Play'"
        @click="toggle"
      >
        <span
          v-if="isLoading"
          class="h-6 w-6 animate-spin rounded-full border-2 border-white/25 border-t-white"
          aria-hidden="true"
        />
        <Pause v-else-if="isPlaying" class="h-6 w-6" fill="currentColor" />
        <Play v-else class="ml-1 h-6 w-6" fill="currentColor" />
      </button>

      <div class="relative min-w-0 flex-1">
        <p
          v-if="isLoading"
          class="absolute inset-x-0 top-0.5 z-10 text-center text-xs font-medium leading-none text-black/60"
        >
          Generating audio...
        </p>
        <div
          class="flex h-12 items-center gap-1 pt-3"
          role="progressbar"
          :aria-valuenow="progressPercent"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            v-for="(height, index) in waveformHeights"
            :key="index"
            class="audio-wave-bar w-1 shrink-0 rounded-full transition-colors duration-150"
            :class="index / (waveformHeights.length - 1) < progressPercent / 100 ? 'bg-black' : 'bg-black/85'"
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
