<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { ChevronLeft, ChevronRight, Film, Image as ImageIcon, Play, Volume2, VolumeX } from 'lucide-vue-next';
import { useIntersectionObserver } from '@vueuse/core';
import { useNavigationStore, type MediaFilter } from '~/stores/navigationStore';
import ImageCarousel from '~/component/ImageCarousel.vue';
import AudioPlayer from '~/component/AudioPlayer.vue';
import ReadAlongText from '~/component/ReadAlongText.vue';
import { STORY_SLUG, buildStoryTimeline } from '~/data/story';
import alignment from '~/data/alignments/moment-that-sparked-everything-2.json';
import { mediaUrl } from '~/utils/media';

interface FilterOption {
  label: string;
  value: MediaFilter;
  icon: typeof Film;
}

const filterOptions: FilterOption[] = [
  { label: 'Photo', value: 'photo', icon: ImageIcon },
  { label: 'Watch Reel', value: 'video', icon: Film },
];

interface PhotoSlide {
  src: string;
  alt: string;
  caption: string;
}

const { renderBlocks } = buildStoryTimeline();
const alignmentWords = alignment.words;
const alignmentPhrases = alignment.phrases ?? [];
const highlightDelaySec = alignment.highlightDelaySec ?? 0.18;

const audioTime = ref(0);
const isAudioPlaying = ref(false);
const hasAudioStarted = ref(false);
const audioPlayerRef = ref<{ seekTo: (time: number) => Promise<void> } | null>(null);

function onAudioTime(time: number) {
  audioTime.value = time;
}

function onPlayingChange(playing: boolean) {
  isAudioPlaying.value = playing;
  if (playing) hasAudioStarted.value = true;
}

function onAudioEnded() {
  isAudioPlaying.value = false;
  hasAudioStarted.value = false;
  audioTime.value = 0;
}

async function onSeek(time: number) {
  hasAudioStarted.value = true;
  audioTime.value = time;
  await audioPlayerRef.value?.seekTo(time);
}

const readAlongActive = computed(() => hasAudioStarted.value);

const navigationStore = useNavigationStore();

const showPhoto = computed(
  () => navigationStore.mediaFilter === 'all' || navigationStore.mediaFilter === 'photo',
);
const showVideo = computed(
  () => navigationStore.mediaFilter === 'all' || navigationStore.mediaFilter === 'video',
);

// Bound dynamically (not literal template strings) so Vite treats these as
// runtime public-folder URLs instead of trying to statically resolve/bundle them.
const photos: PhotoSlide[] = [
  {
    src: mediaUrl('images/meituan-robot.jpg'),
    alt: 'Standing with the Meituan autonomous delivery robot, BJUT campus, 2022',
    caption: 'Standing with the Meituan autonomous delivery robot, BJUT campus, 2022',
  },
  {
    src: mediaUrl('images/meituan-robot2.jpg'),
    alt: 'Meituan autonomous delivery robot up close, BJUT campus, 2022',
    caption: 'Up close with the Meituan delivery robot, BJUT campus, 2022',
  },
];

const photoIndex = ref(0);
const currentPhoto = computed(() => photos[photoIndex.value]!);

interface ReelSlide {
  src: string;
  caption: string;
}

/** Portrait reels (464×848) — frame is reserved via aspect-[9/16] so layout never collapses. */
const reels: ReelSlide[] = [
  {
    src: mediaUrl('videos/meituan-reel.mp4'),
    caption:
      "Me and my civil engineering friends trying to test the robot's intelligence by disrupting it.",
  },
  {
    src: mediaUrl('videos/meituan-reel-2.mp4'),
    caption: 'Stopped messing with the robot and rushed to the canteen instead.',
  },
];

const reelIndex = ref(0);
const currentReel = computed(() => reels[reelIndex.value]!);
const videoFailed = ref<Record<string, boolean>>({});
/** Both reels stay mounted — switching only changes opacity/playback. */
const videoEls: (HTMLVideoElement | null)[] = [];
/** Which reel is actually painted on screen (lags until next frame is ready). */
const visibleReelIndex = ref(0);
const soundUnlocked = ref(false);
const isVideoPlaying = ref(false);
const isMuted = ref(false);
let handoffToken = 0;

const hasMultipleReels = computed(() => reels.length > 1);

function setVideoRef(index: number, el: Element | null) {
  const node = el instanceof HTMLVideoElement ? el : null;
  // Guard: function :ref runs every render — never write reactive state here.
  if (videoEls[index] === node) return;
  videoEls[index] = node;
}

function videoAt(index: number): HTMLVideoElement | null {
  return videoEls[index] ?? null;
}

const applyMuteState = () => {
  for (const el of videoEls) {
    if (el) el.muted = isMuted.value;
  }
};

function waitForEvent(el: HTMLVideoElement, event: string, timeoutMs = 800): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      el.removeEventListener(event, finish);
      resolve();
    };
    el.addEventListener(event, finish);
    window.setTimeout(finish, timeoutMs);
  });
}

/** Ensure a paused reel has a decoded first frame (call only while hidden). */
async function ensureFirstFrame(el: HTMLVideoElement) {
  if (el.readyState < 1) {
    el.load();
    await waitForEvent(el, 'loadedmetadata');
  }
  const nearStart = el.currentTime < 0.05;
  const atEnd = el.ended || (el.duration > 0 && el.currentTime >= el.duration - 0.25);
  if (!nearStart || atEnd) {
    const seeked = waitForEvent(el, 'seeked');
    try {
      el.currentTime = 0.001;
    } catch {
      return;
    }
    await seeked;
  } else if (el.readyState < 2) {
    await waitForEvent(el, 'loadeddata');
  }
}

async function playElement(el: HTMLVideoElement) {
  applyMuteState();
  try {
    await el.play();
    isVideoPlaying.value = true;
  } catch {
    if (!el.muted) {
      isMuted.value = true;
      applyMuteState();
      try {
        await el.play();
        isVideoPlaying.value = true;
        return;
      } catch {
        /* fall through */
      }
    }
    isVideoPlaying.value = false;
  }
}

const pauseAllReels = () => {
  for (const el of videoEls) el?.pause();
  isVideoPlaying.value = false;
};

/** Start/resume the currently visible reel (tap-to-play, filter select). */
const playVisible = async () => {
  await nextTick();
  if (navigationStore.mediaFilter !== 'video') return;
  const el = videoAt(visibleReelIndex.value);
  if (!el) return;
  await playElement(el);
};

/**
 * Switch reels without blank flash:
 * 1) Prepare next video while still hidden (seek/decode first frame)
 * 2) Only then flip visibleReelIndex
 * 3) Play next; rewind previous after it's hidden
 */
const goToReel = async (index: number) => {
  if (index < 0 || index >= reels.length) return;

  if (index === reelIndex.value) {
    void playVisible();
    return;
  }

  const prev = visibleReelIndex.value;
  const token = ++handoffToken;

  await nextTick();
  if (token !== handoffToken) return;
  if (navigationStore.mediaFilter !== 'video') return;

  const incoming = videoAt(index);
  if (!incoming || videoFailed.value[reels[index]!.src]) {
    reelIndex.value = index;
    visibleReelIndex.value = index;
    return;
  }

  // Decode first frame WHILE still opacity-0 — previous reel stays visible.
  await ensureFirstFrame(incoming);
  if (token !== handoffToken) return;

  reelIndex.value = index;
  visibleReelIndex.value = index;
  await playElement(incoming);
  if (token !== handoffToken) return;

  const outgoing = videoAt(prev);
  outgoing?.pause();
  requestAnimationFrame(() => {
    if (prev === visibleReelIndex.value) return;
    const hidden = videoAt(prev);
    if (!hidden) return;
    void ensureFirstFrame(hidden);
  });
};

const nextReel = () => {
  if (!hasMultipleReels.value) {
    const el = videoAt(visibleReelIndex.value);
    if (el) {
      void (async () => {
        await ensureFirstFrame(el);
        await playElement(el);
      })();
    }
    return;
  }
  void goToReel((reelIndex.value + 1) % reels.length);
};

const prevReel = () => {
  if (!hasMultipleReels.value) return;
  void goToReel((reelIndex.value - 1 + reels.length) % reels.length);
};

const toggleReelPlayback = () => {
  soundUnlocked.value = true;
  const el = videoAt(visibleReelIndex.value);
  if (!el) return;
  if (isVideoPlaying.value) {
    el.pause();
    isVideoPlaying.value = false;
  } else {
    void playVisible();
  }
};

const toggleReelSound = async () => {
  soundUnlocked.value = true;
  isMuted.value = !isMuted.value;
  applyMuteState();
  const el = videoAt(visibleReelIndex.value);
  if (!isMuted.value && el) {
    try {
      if (el.paused) await el.play();
      isVideoPlaying.value = !el.paused;
    } catch {
      isMuted.value = true;
      applyMuteState();
    }
  }
};

const onReelLoadedMetadata = (index: number, event: Event) => {
  const el = event.target as HTMLVideoElement;
  // Prefetch a painted first frame for inactive (and initial) reels.
  if (index === visibleReelIndex.value && isVideoPlaying.value) return;
  void ensureFirstFrame(el);
};

const onReelEnded = (index: number) => {
  if (index !== visibleReelIndex.value) return;
  nextReel();
};

const onReelPlay = (index: number) => {
  if (index === visibleReelIndex.value) isVideoPlaying.value = true;
};

const onReelPause = (index: number) => {
  if (index === visibleReelIndex.value) isVideoPlaying.value = false;
};

const selectMediaFilter = (filter: MediaFilter) => {
  if (filter === 'video') {
    soundUnlocked.value = true;
    isMuted.value = false;
  }
  navigationStore.setMediaFilter(filter);
};

watch(
  () => navigationStore.mediaFilter,
  async (filter) => {
    if (filter === 'video') {
      soundUnlocked.value = true;
      isMuted.value = false;
      await nextTick();
      // Warm first frames for all reels, then play the visible one.
      await Promise.all(
        videoEls.map(async (el, index) => {
          if (!el || videoFailed.value[reels[index]?.src ?? '']) return;
          await ensureFirstFrame(el);
        }),
      );
      visibleReelIndex.value = reelIndex.value;
      await playVisible();
    } else {
      pauseAllReels();
    }
  },
);

const sectionRef = ref<HTMLElement | null>(null);

useIntersectionObserver(
  sectionRef,
  ([entry]) => {
    navigationStore.isMediaInView = entry?.isIntersecting ?? false;
  },
  { threshold: 0.35 },
);
</script>

<template>
  <section
    id="media"
    ref="sectionRef"
    class="bg-background py-24 md:py-32 scroll-mt-20 md:scroll-mt-24"
  >
    <div class="w-full px-6 md:px-20 lg:px-[160px] grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">
      <div class="lg:col-span-3">
        <p class="flex items-center gap-2 text-xs md:text-sm font-display font-semibold uppercase tracking-[0.3em] text-accent">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 80 200"
            class="h-5 w-auto shrink-0"
            aria-hidden="true"
          >
            <path
              d="M 10 10 L 70 100 L 10 190"
              fill="none"
              stroke="currentColor"
              stroke-width="16"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Curiosity in Action
        </p>

        <h2 class="mt-4 max-w-4xl font-display font-extrabold uppercase text-white text-3xl sm:text-4xl md:text-5xl leading-tight">
          The Moment That Sparked Everything
        </h2>

        <div class="mt-5">
          <AudioPlayer
            ref="audioPlayerRef"
            :slug="STORY_SLUG"
            @timeupdate="onAudioTime"
            @playingchange="onPlayingChange"
            @ended="onAudioEnded"
          />
        </div>

        <div class="mt-8 md:mt-10">
          <ReadAlongText
            :blocks="renderBlocks"
            :words="alignmentWords"
            :phrases="alignmentPhrases"
            :current-time="audioTime"
            :active="readAlongActive"
            :highlight-delay-sec="highlightDelaySec"
            @seek="onSeek"
          />
        </div>
      </div>

      <div class="lg:col-span-2">
        <div class="flex items-center gap-2 mb-6">
          <button
            v-for="option in filterOptions"
            :key="option.value"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-none border px-3 py-1.5 font-dm font-bold text-xs uppercase tracking-[0.14em] transition-colors duration-300"
            :class="
              navigationStore.mediaFilter === option.value
                ? 'border-accent text-accent'
                : 'border-white/10 text-muted hover:border-white/30'
            "
            @click="selectMediaFilter(option.value)"
          >
            <component :is="option.icon" :size="12" />
            {{ option.label }}
          </button>
        </div>

        <div class="flex flex-col gap-8">
          <div v-if="showPhoto">
            <ImageCarousel
              v-model="photoIndex"
              :images="photos"
              :aria-label="currentPhoto.alt"
              fit="contain"
              arrow-size="md"
              show-error-fallback
              frame-class="rounded-xl border border-white/10 bg-surface"
              image-class="max-h-[520px]"
            />
            <p class="mt-3 text-xs md:text-sm text-muted leading-relaxed">
              {{ currentPhoto.caption }}
            </p>
          </div>

          <div v-if="showVideo">
            <div
              class="group relative overflow-hidden rounded-xl border border-white/10 bg-surface select-none"
              role="region"
              aria-roledescription="carousel"
              :aria-label="`Reel ${reelIndex + 1} of ${reels.length}`"
            >
              <div class="relative flex w-full min-h-[200px] items-center justify-center bg-surface">
                <div class="relative aspect-[9/16] w-full max-w-[min(100%,292px)] max-h-[520px] bg-black/40">
                  <video
                    v-for="(reel, index) in reels"
                    :key="reel.src"
                    :ref="(el) => setVideoRef(index, el as Element | null)"
                    :src="reel.src"
                    class="absolute inset-0 h-full w-full object-contain"
                    :class="
                      index === visibleReelIndex && !videoFailed[reel.src]
                        ? 'z-[1] opacity-100'
                        : 'z-0 opacity-0 pointer-events-none'
                    "
                    playsinline
                    preload="auto"
                    @loadedmetadata="onReelLoadedMetadata(index, $event)"
                    @error="videoFailed = { ...videoFailed, [reel.src]: true }"
                    @ended="onReelEnded(index)"
                    @play="onReelPlay(index)"
                    @pause="onReelPause(index)"
                  />
                  <div
                    v-if="videoFailed[currentReel.src]"
                    class="absolute inset-0 z-[2] flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-accent/20 via-surface to-background"
                  >
                    <Film :size="32" class="text-accent/60" />
                    <span class="text-xs uppercase tracking-widest text-muted">Video</span>
                  </div>

                  <!-- TikTok-style: tap toggles play/pause; white triangle only when paused -->
                  <button
                    v-if="!videoFailed[currentReel.src]"
                    type="button"
                    class="absolute inset-0 z-[1] flex items-center justify-center"
                    :aria-label="isVideoPlaying ? 'Pause reel' : 'Play reel'"
                    @click="toggleReelPlayback"
                  >
                    <Play
                      v-if="!isVideoPlaying"
                      :size="72"
                      class="text-white/90 drop-shadow-md ml-1 pointer-events-none"
                      fill="currentColor"
                      stroke-width="0"
                    />
                  </button>

                  <!-- TikTok-style mute / unmute -->
                  <button
                    v-if="!videoFailed[currentReel.src]"
                    type="button"
                    class="absolute bottom-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                    :aria-label="isMuted ? 'Unmute sound' : 'Mute sound'"
                    @click.stop="toggleReelSound"
                  >
                    <VolumeX v-if="isMuted" :size="18" />
                    <Volume2 v-else :size="18" />
                  </button>
                </div>
              </div>

              <button
                v-if="hasMultipleReels"
                type="button"
                aria-label="Previous reel"
                class="absolute left-2 top-1/2 z-10 -translate-y-1/2 h-9 w-9 rounded-full border border-white/20 bg-black/50 text-white flex items-center justify-center transition-opacity duration-300 hover:bg-black/70 hover:border-accent/50 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                @click.stop="prevReel"
              >
                <ChevronLeft :size="18" />
              </button>
              <button
                v-if="hasMultipleReels"
                type="button"
                aria-label="Next reel"
                class="absolute right-2 top-1/2 z-10 -translate-y-1/2 h-9 w-9 rounded-full border border-white/20 bg-black/50 text-white flex items-center justify-center transition-opacity duration-300 hover:bg-black/70 hover:border-accent/50 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                @click.stop="nextReel"
              >
                <ChevronRight :size="18" />
              </button>

              <div
                v-if="hasMultipleReels"
                class="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2"
              >
                <button
                  v-for="(reel, index) in reels"
                  :key="reel.src"
                  type="button"
                  class="h-1.5 rounded-full transition-all duration-300"
                  :class="index === reelIndex ? 'w-5 bg-accent' : 'w-1.5 bg-white/40 hover:bg-white/70'"
                  :aria-label="`Go to reel ${index + 1}`"
                  :aria-current="index === reelIndex ? 'true' : undefined"
                  @click.stop="goToReel(index)"
                />
              </div>
            </div>
            <p class="mt-3 text-xs md:text-sm text-muted leading-relaxed">
              {{ currentReel.caption }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
