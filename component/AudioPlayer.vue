<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { Pause, Play } from 'lucide-vue-next';

const props = defineProps<{
  slug: string;
}>();

/** Minimum time to show "Generating audio..." before playback starts. */
const MIN_LOADING_MS = 1400;

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

const progressPercent = computed(() => {
  if (!duration.value) return 0;
  return Math.min(100, (currentTime.value / duration.value) * 100);
});

const statusLabel = computed(() => {
  if (isLoading.value) return 'Generating audio...';
  if (isPlaying.value || hasStarted.value) return 'Now playing';
  return 'Listen to this post';
});

const timeLabel = computed(() => {
  if (!hasStarted.value && !isLoading.value) return formatTime(0);
  if (isLoading.value && !duration.value) return formatTime(0);
  return `${formatTime(currentTime.value)} / ${formatTime(duration.value)}`;
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
  if (!isPlaying.value) isLoading.value = false;
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
    class="flex w-full max-w-2xl items-center gap-4 rounded-full border border-gray-200 bg-white px-5 py-3 shadow-sm"
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

    <!-- Play / pause / loading button -->
    <button
      type="button"
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-80"
      :disabled="isLoading"
      :aria-label="isPlaying ? 'Pause' : 'Play'"
      @click="toggle"
    >
      <span
        v-if="isLoading"
        class="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
        aria-hidden="true"
      />
      <Pause v-else-if="isPlaying" class="h-4 w-4" fill="currentColor" />
      <Play v-else class="h-4 w-4 translate-x-px" fill="currentColor" />
    </button>

    <!-- Label + progress -->
    <div class="min-w-0 flex-1">
      <p class="text-sm font-medium text-gray-900 leading-tight">
        {{ statusLabel }}
      </p>

      <div class="mt-1.5 flex items-center gap-3">
        <div
          class="relative h-1 flex-1 rounded-full bg-gray-200"
          role="progressbar"
          :aria-valuenow="progressPercent"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            class="absolute inset-y-0 left-0 rounded-full bg-blue-600 transition-[width] duration-150 ease-linear"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>
        <span class="shrink-0 text-xs tabular-nums text-gray-500">
          {{ timeLabel }}
        </span>
      </div>
    </div>

    <!-- Playback speed -->
    <button
      type="button"
      class="shrink-0 text-sm font-medium text-gray-500 transition hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      :aria-label="`Playback speed ${playbackRate}x`"
      @click="cycleSpeed"
    >
      {{ playbackRate === 1 ? '1x' : `${playbackRate}x` }}
    </button>
  </div>
</template>
