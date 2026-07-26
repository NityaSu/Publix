<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useMediaQuery } from '@vueuse/core';

interface Props {
  /** Navbar size; default is the larger face. */
  small?: boolean;
}

withDefaults(defineProps<Props>(), {
  small: false,
});

const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
const { isLookingDown } = useHeroSequence();
const isScaled = ref(false);

let scaleTimer: ReturnType<typeof setTimeout> | undefined;

const handleClick = () => {
  if (prefersReducedMotion.value) return;
  isScaled.value = true;
  if (scaleTimer) clearTimeout(scaleTimer);
  scaleTimer = setTimeout(() => {
    isScaled.value = false;
  }, 200);
};

onUnmounted(() => {
  if (scaleTimer) clearTimeout(scaleTimer);
});
</script>

<template>
  <div
    class="kimi-logo"
    :class="{
      'is-small': small,
      'is-scaled': isScaled,
      'is-looking-down': isLookingDown && !prefersReducedMotion,
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

.kimi-logo:active,
.kimi-logo.is-scaled {
  transform: scale(1.15);
}

.kimi-eye {
  width: 8px;
  height: 14px;
  background: white;
  border-radius: 4px;
  transform-origin: center;
  transition: height 0.4s ease, transform 0.4s ease;
}

.kimi-logo.is-small .kimi-eye {
  width: 6px;
  height: 10px;
  border-radius: 3px;
}

/* Normal blink — both eyes equal */
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

/* Look-down pose — first 10s, peeking at THINKING below */
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

.kimi-eye--static {
  animation: none !important;
}

@media (prefers-reduced-motion: reduce) {
  .kimi-logo,
  .kimi-logo:hover,
  .kimi-logo:active,
  .kimi-logo.is-scaled {
    transition: none;
    transform: none;
  }

  .kimi-eye {
    animation: none !important;
    transition: none;
  }
}
</style>
