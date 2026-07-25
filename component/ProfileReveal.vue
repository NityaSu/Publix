<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useMediaQuery } from '@vueuse/core';

interface Props {
  profileSrc?: string;
  profileAltSrc?: string;
  profileAlt?: string;
  logoSrc?: string;
  fallbackInitial?: string;
  loadingDurationMs?: number;
}

const props = withDefaults(defineProps<Props>(), {
  profileSrc: '/assets/images/profile.jpg',
  profileAltSrc: '/assets/images/profile2.jpg',
  profileAlt: 'Profile photo',
  logoSrc: '/assets/images/logo.png',
  fallbackInitial: 'S',
  loadingDurationMs: 2500,
});

const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

const isLoading = ref(true);
const profileFailed = ref(false);
const logoFailed = ref(false);
/** Bumps on each replay so the CSS spin animation restarts cleanly. */
const spinKey = ref(0);
/** 0 = profileSrc, 1 = profileAltSrc — toggles on each click. */
const photoIndex = ref(0);

const activeProfileSrc = computed(() =>
  photoIndex.value === 0 ? props.profileSrc : props.profileAltSrc,
);

let revealTimer: ReturnType<typeof setTimeout> | undefined;

const clearRevealTimer = () => {
  if (revealTimer) {
    clearTimeout(revealTimer);
    revealTimer = undefined;
  }
};

const startReveal = () => {
  clearRevealTimer();
  if (prefersReducedMotion.value) {
    isLoading.value = false;
    return;
  }
  isLoading.value = true;
  spinKey.value += 1;
  profileFailed.value = false;
  revealTimer = setTimeout(() => {
    isLoading.value = false;
  }, props.loadingDurationMs);
};

const replayReveal = () => {
  if (prefersReducedMotion.value) {
    photoIndex.value = photoIndex.value === 0 ? 1 : 0;
    profileFailed.value = false;
    return;
  }
  photoIndex.value = photoIndex.value === 0 ? 1 : 0;
  startReveal();
};

onMounted(() => {
  startReveal();
});

onUnmounted(() => {
  clearRevealTimer();
});
</script>

<template>
  <button
    type="button"
    class="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] md:w-[260px] md:h-[260px] lg:w-[300px] lg:h-[300px] xl:w-[320px] xl:h-[320px] shrink-0 cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
    :aria-label="isLoading ? 'Profile loading' : `Switch photo and replay ${profileAlt} reveal`"
    @click="replayReveal"
  >
    <div class="absolute inset-0 rounded-full border-2 border-accent shadow-glow"></div>

    <div class="absolute inset-[6px] rounded-full overflow-hidden bg-surface">
      <!-- Loading state: spinning logo -->
      <div
        class="absolute inset-0 flex items-center justify-center transition-opacity ease-out"
        :class="[
          isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none',
          prefersReducedMotion ? 'duration-0' : 'duration-700',
        ]"
      >
        <img
          v-if="!logoFailed"
          :key="`logo-${spinKey}`"
          :src="logoSrc"
          alt=""
          class="w-[75%] h-[75%] object-contain"
          :class="prefersReducedMotion ? '' : 'animate-spin-left'"
          @error="logoFailed = true"
        />
        <div
          v-else
          :key="`fallback-${spinKey}`"
          class="w-[55%] h-[55%] rounded-full border-4 border-accent/25 border-t-accent"
          :class="prefersReducedMotion ? '' : 'animate-spin-left'"
        ></div>
      </div>

      <!-- Revealed state: profile photo, spins in from the left as it fades/scales up -->
      <div
        class="absolute inset-0 transition-all ease-out"
        :class="[
          isLoading ? 'opacity-0 scale-90 -rotate-180' : 'opacity-100 scale-100 rotate-0',
          prefersReducedMotion ? 'duration-0' : 'duration-700',
        ]"
      >
        <img
          v-if="!profileFailed"
          :key="activeProfileSrc"
          :src="activeProfileSrc"
          :alt="profileAlt"
          class="w-full h-full object-cover pointer-events-none"
          @error="profileFailed = true"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent via-blue-700 to-background"
        >
          <span class="font-display font-extrabold text-white text-7xl md:text-8xl">{{ fallbackInitial }}</span>
        </div>
      </div>
    </div>
  </button>
</template>
