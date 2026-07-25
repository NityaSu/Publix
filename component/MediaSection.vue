<script setup lang="ts">
import { ref, computed } from 'vue';
import { Film, Image as ImageIcon, Play } from 'lucide-vue-next';
import { useIntersectionObserver } from '@vueuse/core';
import { useNavigationStore, type MediaFilter } from '~/stores/navigationStore';

interface FilterOption {
  label: string;
  value: MediaFilter;
  icon: typeof Film;
}

const filterOptions: FilterOption[] = [
  { label: 'Photo', value: 'photo', icon: ImageIcon },
  { label: 'Watch Reel', value: 'video', icon: Film },
];

interface QuoteLine {
  chinese: string;
  translation: string;
}

type StoryBlock =
  | { type: 'text'; html: string }
  | { type: 'quote'; lines: QuoteLine[] };

const storyBlocks: StoryBlock[] = [
  {
    type: 'text',
    html: 'In the winter of 2022, during COVID lockdown, Beijing was silent. All students had left campus. My friend and I were among the few still in the dorms.',
  },
  {
    type: 'text',
    html: 'I was sleeping. Then I heard it — the sound of driving machines, rolling past the window. Again and again. I wondered... what is that? I really want to see.',
  },
  {
    type: 'text',
    html: 'I went down. I called my friend to come down and watch with me.',
  },
  {
    type: 'text',
    html: 'There they were — a <strong class="text-white font-semibold">batch of twelve</strong> autonomous Meituan delivery robots. Twelve of them. No drivers. No remote controls. Just machines navigating the empty campus, speaking to people in Chinese:',
  },
  {
    type: 'quote',
    lines: [
      { chinese: '请让一让，谢谢', translation: 'Please make way, thank you' },
      { chinese: '您的外卖已到达', translation: 'Your delivery has arrived' },
      { chinese: '请注意避让', translation: 'Please watch out' },
    ],
  },
  {
    type: 'text',
    html: 'I tried to pause one by standing directly in front of it. It stopped. Sensed me. Adjusted its path. Spoke again. I took a photo as a memory.',
  },
  {
    type: 'text',
    html: 'That curiosity — <strong class="text-white font-semibold">how can it see? how can it understand? how can it speak?</strong> — led me straight into NLP and Computer Vision. Not from a textbook. From a robot delivering lunch in an empty university, speaking Chinese to students like us who had nowhere else to go.',
  },
];

const navigationStore = useNavigationStore();

const showPhoto = computed(
  () => navigationStore.mediaFilter === 'all' || navigationStore.mediaFilter === 'photo',
);
const showVideo = computed(
  () => navigationStore.mediaFilter === 'all' || navigationStore.mediaFilter === 'video',
);

// Bound dynamically (not literal template strings) so Vite treats these as
// runtime public-folder URLs instead of trying to statically resolve/bundle them.
const photoSrc = ref('/assets/images/meituan-robot.jpg');
const videoSrc = ref('/assets/videos/meituan-reel.mp4');

const photoFailed = ref(false);
const videoFailed = ref(false);

const videoRef = ref<HTMLVideoElement | null>(null);
const isVideoPlaying = ref(false);

const playVideo = () => {
  videoRef.value?.play();
  isVideoPlaying.value = true;
};

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
        <p class="text-xs md:text-sm font-display font-semibold uppercase tracking-[0.3em] text-accent">
          Curiosity in Action
        </p>

        <h2 class="mt-4 max-w-4xl font-display font-extrabold uppercase text-white text-3xl sm:text-4xl md:text-5xl leading-tight">
          The Moment That Sparked Everything
        </h2>

        <div class="mt-8 md:mt-10 space-y-5">
          <template v-for="(block, index) in storyBlocks" :key="index">
            <p
              v-if="block.type === 'text'"
              class="text-muted text-sm md:text-base leading-relaxed"
              v-html="block.html"
            />

            <blockquote
              v-else
              class="border-l-2 border-accent/50 pl-4 space-y-1.5 my-2"
            >
              <p
                v-for="line in block.lines"
                :key="line.chinese"
                class="text-sm md:text-base leading-relaxed"
              >
                <span class="text-white font-medium">“{{ line.chinese }}”</span>
                <span class="text-muted"> ({{ line.translation }})</span>
              </p>
            </blockquote>
          </template>
        </div>
      </div>

      <div class="lg:col-span-2">
        <div class="flex items-center gap-2 mb-6">
          <button
            v-for="option in filterOptions"
            :key="option.value"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs uppercase tracking-wide transition-colors duration-300"
            :class="
              navigationStore.mediaFilter === option.value
                ? 'border-accent text-accent'
                : 'border-white/10 text-muted hover:border-white/30'
            "
            @click="navigationStore.setMediaFilter(option.value)"
          >
            <component :is="option.icon" :size="12" />
            {{ option.label }}
          </button>
        </div>

        <div class="flex flex-col gap-8">
          <div v-if="showPhoto">
            <div class="group relative rounded-xl overflow-hidden border border-white/10 hover:border-accent/50 transition-colors duration-300 bg-surface">
              <img
                v-if="!photoFailed"
                :src="photoSrc"
                alt="Standing with the Meituan autonomous delivery robot, BJUT campus, 2020"
                class="w-full h-auto max-h-[520px] object-contain"
                @error="photoFailed = true"
              />
              <div
                v-else
                class="w-full aspect-video flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-accent/20 via-surface to-background"
              >
                <ImageIcon :size="32" class="text-accent/60" />
                <span class="text-xs uppercase tracking-widest text-muted">Photo</span>
              </div>
            </div>
            <p class="mt-3 text-xs md:text-sm text-muted leading-relaxed">
              Standing with the Meituan autonomous delivery robot, BJUT campus, 2020
            </p>
          </div>

          <div v-if="showVideo">
            <div class="group relative rounded-xl overflow-hidden border border-white/10 hover:border-accent/50 transition-colors duration-300 bg-surface">
              <video
                v-if="!videoFailed"
                ref="videoRef"
                :src="videoSrc"
                class="w-full h-auto max-h-[520px] object-contain"
                :controls="isVideoPlaying"
                playsinline
                @error="videoFailed = true"
                @ended="isVideoPlaying = false"
              />
              <div
                v-else
                class="w-full aspect-video flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-accent/20 via-surface to-background"
              >
                <Film :size="32" class="text-accent/60" />
                <span class="text-xs uppercase tracking-widest text-muted">Video</span>
              </div>

              <button
                v-if="!isVideoPlaying"
                type="button"
                aria-label="Play video"
                class="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                @click="playVideo"
              >
                <span class="h-14 w-14 rounded-full bg-accent/90 flex items-center justify-center shadow-glow-sm">
                  <Play :size="22" class="text-white ml-1" fill="white" />
                </span>
              </button>
            </div>
            <p class="mt-3 text-xs md:text-sm text-muted leading-relaxed">
              The morning fleet — 12 robots navigating an empty campus
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
