<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useMediaQuery } from '@vueuse/core';

interface Props {
  profileSrc?: string;
  profileAlt?: string;
  logoSrc?: string;
  fallbackInitial?: string;
  loadingDurationMs?: number;
}

const props = withDefaults(defineProps<Props>(), {
  profileSrc: '/assets/images/profile.jpg',
  profileAlt: 'Profile photo',
  logoSrc: '/assets/images/logo.png',
  fallbackInitial: 'S',
  loadingDurationMs: 2500,
});

const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

const isLoading = ref(true);
const profileFailed = ref(false);
const logoFailed = ref(false);

let revealTimer: ReturnType<typeof setTimeout> | undefined;

onMounted(() => {
  if (prefersReducedMotion.value) {
    isLoading.value = false;
    return;
  }
  revealTimer = setTimeout(() => {
    isLoading.value = false;
  }, props.loadingDurationMs);
});

onUnmounted(() => {
  if (revealTimer) clearTimeout(revealTimer);
});
</script>

<template>
  <div class="relative w-[250px] h-[250px] md:w-[320px] md:h-[320px] shrink-0">
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
          :src="logoSrc"
          alt="Loading"
          class="w-[75%] h-[75%] object-contain"
          :class="prefersReducedMotion ? '' : 'animate-spin-left'"
          @error="logoFailed = true"
        />
        <div
          v-else
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
          :src="profileSrc"
          :alt="profileAlt"
          class="w-full h-full object-cover"
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
  </div>
</template>
