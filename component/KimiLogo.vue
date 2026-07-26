<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue';
import { useMediaQuery } from '@vueuse/core';

interface Props {
  /** Navbar size; default is the larger face. */
  small?: boolean;
}

withDefaults(defineProps<Props>(), {
  small: false,
});

const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
const { isLookingDown: sequenceLookingDown } = useHeroSequence();
const isSurprised = ref(false);

let surpriseTimer: ReturnType<typeof setTimeout> | undefined;

/** Look down only when hero is Thinking/typing and not in surprise override. */
const isLookingDown = computed(
  () => sequenceLookingDown.value && !isSurprised.value && !prefersReducedMotion.value,
);

const handleClick = () => {
  if (prefersReducedMotion.value) return;
  if (isSurprised.value) return;

  isSurprised.value = true;
  if (surpriseTimer) clearTimeout(surpriseTimer);
  surpriseTimer = setTimeout(() => {
    isSurprised.value = false;
  }, 800);
};

onUnmounted(() => {
  if (surpriseTimer) clearTimeout(surpriseTimer);
});
</script>

<template>
  <div
    class="kimi-logo"
    :class="{
      'is-small': small,
      'is-looking-down': isLookingDown,
      'is-surprised': isSurprised,
    }"
    role="img"
    aria-label="Kimi logo"
    @click="handleClick"
  >
    <div
      class="kimi-eye kimi-eye-left"
      :class="{ 'kimi-eye--static': prefersReducedMotion }"
    />
    <div
      class="kimi-eye kimi-eye-right"
      :class="{ 'kimi-eye--static': prefersReducedMotion }"
    />
  </div>
</template>

<style scoped>
.kimi-logo {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 40%, #2b8cfd 0%, #1a7aef 60%, #0d6ce0 100%);
  border: 2px solid #75b6ff;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 6px;
  padding-top: 15px;
  box-sizing: border-box;
  cursor: pointer;
  transition: transform 0.2s ease, padding 0.4s ease;
  position: relative;
  flex-shrink: 0;
  box-shadow: 0 0 12px rgba(43, 140, 253, 0.3);
}

.kimi-logo.is-small {
  width: 38px;
  height: 38px;
  gap: 4px;
  padding-top: 9px;
  padding-left: 2px;
  border-width: 1.5px;
}

.kimi-logo:hover {
  transform: scale(1.08);
}

.kimi-logo:active {
  transform: scale(0.95);
}

.kimi-eye {
  width: 8px;
  height: 14px;
  background: white;
  border-radius: 4px;
  transform-origin: center;
  transition: height 0.3s ease, transform 0.3s ease;
  position: relative;
}

.kimi-logo.is-small .kimi-eye {
  width: 6px;
  height: 10px;
  border-radius: 3px;
}

/* Tiny pupil dots — only when surprised */
.kimi-eye-left::after,
.kimi-eye-right::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 2.5px;
  height: 2.5px;
  background: #2b8cfd;
  border-radius: 50%;
  opacity: 0;
  transition: all 0.3s ease;
}

.kimi-logo.is-small .kimi-eye-left::after,
.kimi-logo.is-small .kimi-eye-right::after {
  width: 2px;
  height: 2px;
  bottom: 1px;
}

/* ===== 1. NORMAL ===== */
.kimi-eye-left:not(.kimi-eye--static) {
  animation: blinkLeftNormal 3.5s ease-in-out infinite;
}

.kimi-eye-right:not(.kimi-eye--static) {
  animation: blinkRightNormal 3.5s ease-in-out infinite;
}

@keyframes blinkLeftNormal {
  0%,
  48%,
  52%,
  100% {
    transform: translate(0, 0) rotate(0deg) scaleY(1);
  }
  50% {
    transform: translate(0, 0) rotate(0deg) scaleY(0.08);
  }
}

@keyframes blinkRightNormal {
  0%,
  48%,
  52%,
  100% {
    transform: translate(0, 0) rotate(0deg) scaleY(1);
  }
  50% {
    transform: translate(0, 0) rotate(0deg) scaleY(0.08);
  }
}

/* ===== 2. LOOK DOWN ===== */
.kimi-logo.is-looking-down .kimi-eye-left {
  height: 16px;
  animation: blinkLeftDown 3.5s ease-in-out infinite;
}

.kimi-logo.is-looking-down .kimi-eye-right {
  height: 12px;
  animation: blinkRightDown 3.5s ease-in-out infinite;
}

.kimi-logo.is-small.is-looking-down .kimi-eye-left {
  height: 11px;
}

.kimi-logo.is-small.is-looking-down .kimi-eye-right {
  height: 8px;
}

@keyframes blinkLeftDown {
  0%,
  48%,
  52%,
  100% {
    transform: translate(1px, 2px) rotate(8deg) scaleY(1);
  }
  50% {
    transform: translate(1px, 2px) rotate(8deg) scaleY(0.08);
  }
}

@keyframes blinkRightDown {
  0%,
  48%,
  52%,
  100% {
    transform: translate(1px, 2px) rotate(8deg) scaleY(1);
  }
  50% {
    transform: translate(1px, 2px) rotate(8deg) scaleY(0.08);
  }
}

/* ===== 3. SURPRISED (click) — overrides look down ===== */
.kimi-logo.is-surprised {
  animation: surprisePop 0.8s ease-in-out;
}

.kimi-logo.is-surprised:hover {
  transform: none; /* let surprisePop own the transform */
}

.kimi-logo.is-surprised .kimi-eye-left,
.kimi-logo.is-surprised .kimi-eye-right {
  height: 18px !important;
  transform: translate(0, -1px) !important;
  animation: none !important;
}

.kimi-logo.is-small.is-surprised .kimi-eye-left,
.kimi-logo.is-small.is-surprised .kimi-eye-right {
  height: 13px !important;
}

.kimi-logo.is-surprised .kimi-eye-left::after,
.kimi-logo.is-surprised .kimi-eye-right::after {
  opacity: 1;
  width: 2px;
  height: 2px;
  bottom: 3px;
}

.kimi-logo.is-small.is-surprised .kimi-eye-left::after,
.kimi-logo.is-small.is-surprised .kimi-eye-right::after {
  opacity: 1;
  width: 1.5px;
  height: 1.5px;
  bottom: 2px;
}

@keyframes surprisePop {
  0% {
    transform: translateX(0) rotate(0deg) scale(1);
  }
  15% {
    transform: translateX(-4px) rotate(-6deg) scale(1.28);
  }
  30% {
    transform: translateX(4px) rotate(6deg) scale(1.35);
  }
  45% {
    transform: translateX(-3px) rotate(-4deg) scale(1.32);
  }
  60% {
    transform: translateX(3px) rotate(4deg) scale(1.3);
  }
  75% {
    transform: translateX(-2px) rotate(-2deg) scale(1.22);
  }
  100% {
    transform: translateX(0) rotate(0deg) scale(1);
  }
}

.kimi-eye--static {
  animation: none !important;
}

@media (prefers-reduced-motion: reduce) {
  .kimi-logo,
  .kimi-logo:hover,
  .kimi-logo:active,
  .kimi-logo.is-surprised {
    transition: none;
    transform: none;
    animation: none;
  }

  .kimi-eye {
    animation: none !important;
    transition: none;
  }
}
</style>
