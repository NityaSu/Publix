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
  loadingDurationMs: 1500,
});

const ROLL_DELAY_MS = 300;
const ROLL_DURATION_MS = 2400;

const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

const wrapperRef = ref<HTMLElement | null>(null);
const isLoading = ref(true);
const isRolling = ref(false);
const hasSettled = ref(false);
const profileFailed = ref(false);
const logoFailed = ref(false);
/** Bumps on each replay so the CSS spin animation restarts cleanly. */
const spinKey = ref(0);
/** 0 = profileSrc, 1 = profileAltSrc — toggles on each click. */
const photoIndex = ref(0);

/** Pixels to translate from off-screen right into the layout slot. */
const rollDistancePx = ref(420);
/** Whole-turn rotation so the photo ends upright (negative = leftward roll). */
const rollRotationDeg = ref(-720);

const activeProfileSrc = computed(() =>
  photoIndex.value === 0 ? props.profileSrc : props.profileAltSrc,
);

const rollStyle = computed(() => ({
  '--roll-x': `${rollDistancePx.value}px`,
  '--roll-rot': `${rollRotationDeg.value}deg`,
  '--roll-duration': `${ROLL_DURATION_MS}ms`,
}));

let revealTimer: ReturnType<typeof setTimeout> | undefined;
let rollStartTimer: ReturnType<typeof setTimeout> | undefined;
let rollEndTimer: ReturnType<typeof setTimeout> | undefined;

const clearTimers = () => {
  if (revealTimer) {
    clearTimeout(revealTimer);
    revealTimer = undefined;
  }
  if (rollStartTimer) {
    clearTimeout(rollStartTimer);
    rollStartTimer = undefined;
  }
  if (rollEndTimer) {
    clearTimeout(rollEndTimer);
    rollEndTimer = undefined;
  }
};

/**
 * Measure the wrapper (layout slot — not the transformed circle) so we know
 * how far to travel from just past the viewport right edge into the original
 * resting place. Whole spins keep the face upright at the end.
 */
const measureRoll = () => {
  const el = wrapperRef.value;
  if (!el || typeof window === 'undefined') return;

  const rect = el.getBoundingClientRect();
  const offscreenPad = 48;
  const distance = Math.max(
    Math.round(window.innerWidth - rect.left + offscreenPad),
    Math.round(rect.width * 1.75),
  );

  const circumference = Math.PI * Math.max(rect.width, 1);
  const spins = Math.max(2, Math.round(distance / circumference));

  rollDistancePx.value = distance;
  rollRotationDeg.value = -(spins * 360);
};

const startLogoReveal = () => {
  clearTimers();
  if (prefersReducedMotion.value) {
    isLoading.value = false;
    hasSettled.value = true;
    isRolling.value = false;
    return;
  }
  isLoading.value = true;
  spinKey.value += 1;
  profileFailed.value = false;
  revealTimer = setTimeout(() => {
    isLoading.value = false;
  }, props.loadingDurationMs);
};

const startEntrance = () => {
  clearTimers();
  if (prefersReducedMotion.value) {
    isRolling.value = false;
    hasSettled.value = true;
    isLoading.value = false;
    return;
  }

  measureRoll();
  isLoading.value = true;
  isRolling.value = false;
  hasSettled.value = false;
  spinKey.value += 1;
  profileFailed.value = false;

  rollStartTimer = setTimeout(() => {
    isRolling.value = true;
  }, ROLL_DELAY_MS);

  rollEndTimer = setTimeout(() => {
    isRolling.value = false;
    hasSettled.value = true;
    startLogoReveal();
  }, ROLL_DELAY_MS + ROLL_DURATION_MS);
};

const replayReveal = () => {
  if (prefersReducedMotion.value) {
    photoIndex.value = photoIndex.value === 0 ? 1 : 0;
    profileFailed.value = false;
    return;
  }
  photoIndex.value = photoIndex.value === 0 ? 1 : 0;
  // Replays keep the settled slot — only the inner logo/photo reveal runs.
  hasSettled.value = true;
  isRolling.value = false;
  startLogoReveal();
};

onMounted(() => {
  startEntrance();
});

onUnmounted(() => {
  clearTimers();
});
</script>

<template>
  <div
    ref="wrapperRef"
    class="profile-wrapper relative shrink-0 w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] md:w-[260px] md:h-[260px] lg:w-[300px] lg:h-[300px] xl:w-[320px] xl:h-[320px]"
    :style="rollStyle"
  >
    <!-- Subtle ground line so the roll reads as a wheel on a floor -->
    <div
      class="profile-ground pointer-events-none absolute left-[-12%] right-[-12%] bottom-[6%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent transition-opacity duration-500"
      :class="hasSettled ? 'opacity-0' : 'opacity-100'"
      aria-hidden="true"
    />

    <button
      type="button"
      class="profile-circle absolute inset-0 cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      :class="{
        'is-pre-roll': !prefersReducedMotion && !isRolling && !hasSettled,
        'is-rolling': isRolling,
        'has-settled': hasSettled || prefersReducedMotion,
      }"
      :aria-label="isLoading ? 'Profile loading' : `Switch photo and replay ${profileAlt} reveal`"
      :disabled="isRolling || (!hasSettled && !prefersReducedMotion)"
      @click="replayReveal"
    >
      <!-- Marker so continuous rotation is visible while rolling -->
      <span
        class="profile-marker pointer-events-none absolute top-3 left-1/2 z-20 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_8px_rgba(74,158,255,0.7)] transition-opacity duration-500"
        :class="hasSettled ? 'opacity-0' : 'opacity-100'"
        aria-hidden="true"
      />

      <div
        class="profile-face absolute inset-0 rounded-full transition-transform duration-300"
        :class="hasSettled ? 'hover:scale-[1.02] active:scale-[0.98]' : ''"
      >
        <div class="absolute inset-0 rounded-full border-2 border-accent shadow-glow"></div>

        <div class="absolute inset-[6px] rounded-full overflow-hidden bg-surface">
          <!-- Loading state: spinning logo (after the roll settles) -->
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
              :class="prefersReducedMotion || !hasSettled ? '' : 'animate-spin-left'"
              @error="logoFailed = true"
            />
            <div
              v-else
              :key="`fallback-${spinKey}`"
              class="w-[55%] h-[55%] rounded-full border-4 border-accent/25 border-t-accent"
              :class="prefersReducedMotion || !hasSettled ? '' : 'animate-spin-left'"
            ></div>
          </div>

          <!-- Revealed state: profile photo -->
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
      </div>
    </button>
  </div>
</template>

<style scoped>
.profile-circle {
  transform-origin: center center;
  will-change: transform;
}

/* Hold the off-screen start pose until the roll class applies */
.profile-circle.is-pre-roll {
  transform: translateX(var(--roll-x)) rotate(0deg);
}

.profile-circle.is-rolling {
  animation: longRoll var(--roll-duration) cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.profile-circle.has-settled {
  transform: translateX(0) rotate(0deg);
  will-change: auto;
}

@keyframes longRoll {
  0% {
    transform: translateX(var(--roll-x)) rotate(0deg);
  }
  100% {
    transform: translateX(0) rotate(var(--roll-rot));
  }
}

@media (prefers-reduced-motion: reduce) {
  .profile-circle.is-pre-roll,
  .profile-circle.is-rolling,
  .profile-circle.has-settled {
    animation: none;
    transform: none;
  }
}
</style>
