<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { Film, Image as ImageIcon } from 'lucide-vue-next';
import { useIntersectionObserver, useSwipe } from '@vueuse/core';
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
const videoRef = ref<HTMLVideoElement | null>(null);
const reelFrameRef = ref<HTMLElement | null>(null);
/** Set true after Watch Reel click — browsers allow unmuted play from that gesture. */
const soundUnlocked = ref(false);

const hasMultipleReels = computed(() => reels.length > 1);

const playReel = async () => {
  await nextTick();
  const el = videoRef.value;
  if (!el || navigationStore.mediaFilter !== 'video') return;
  el.muted = !soundUnlocked.value;
  try {
    await el.play();
  } catch {
    // If unmuted play fails, fall back to muted so the reel still plays.
    if (!el.muted) {
      el.muted = true;
      try {
        await el.play();
      } catch {
        /* ignore */
      }
    }
  }
};

const pauseReel = () => {
  videoRef.value?.pause();
};

const selectMediaFilter = (filter: MediaFilter) => {
  if (filter === 'video') soundUnlocked.value = true;
  navigationStore.setMediaFilter(filter);
};

const goToReel = (index: number) => {
  if (index < 0 || index >= reels.length) return;
  if (index === reelIndex.value) {
    void playReel();
    return;
  }
  pauseReel();
  reelIndex.value = index;
};

const nextReel = () => {
  if (!hasMultipleReels.value) {
    void playReel();
    return;
  }
  goToReel((reelIndex.value + 1) % reels.length);
};

const prevReel = () => {
  if (!hasMultipleReels.value) return;
  goToReel((reelIndex.value - 1 + reels.length) % reels.length);
};

useSwipe(reelFrameRef, {
  threshold: 40,
  onSwipeEnd(_e, direction) {
    if (direction === 'left') nextReel();
    if (direction === 'right') prevReel();
  },
});

watch(
  () => navigationStore.mediaFilter,
  (filter) => {
    if (filter === 'video') {
      // Navbar / external filter change — unlock sound if user clicked Watch Reel there.
      soundUnlocked.value = true;
      void playReel();
    } else {
      pauseReel();
    }
  },
);

watch(reelIndex, () => {
  if (navigationStore.mediaFilter === 'video') void playReel();
});

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
              ref="reelFrameRef"
              class="group relative overflow-hidden rounded-xl border border-white/10 bg-surface touch-pan-y select-none"
              role="region"
              aria-roledescription="carousel"
              :aria-label="`Reel ${reelIndex + 1} of ${reels.length}`"
            >
              <div class="relative flex w-full min-h-[200px] items-center justify-center bg-surface">
                <div class="relative aspect-[9/16] w-full max-w-[min(100%,292px)] max-h-[520px]">
                  <video
                    v-if="!videoFailed[currentReel.src]"
                    :key="currentReel.src"
                    ref="videoRef"
                    :src="currentReel.src"
                    class="absolute inset-0 h-full w-full object-contain"
                    playsinline
                    preload="auto"
                    @error="videoFailed = { ...videoFailed, [currentReel.src]: true }"
                    @ended="nextReel"
                    @click="soundUnlocked = true; playReel()"
                  />
                  <div
                    v-else
                    class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-accent/20 via-surface to-background"
                  >
                    <Film :size="32" class="text-accent/60" />
                    <span class="text-xs uppercase tracking-widest text-muted">Video</span>
                  </div>
                </div>
              </div>

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
