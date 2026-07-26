<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useMediaQuery } from '@vueuse/core';

interface Props {
  /** 32px navbar size; default is 48px. */
  small?: boolean;
}

withDefaults(defineProps<Props>(), {
  small: false,
});

const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
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
    }"
    role="img"
    aria-label="Kimi logo"
    @click="handleClick"
  >
    <div
      class="kimi-eye"
      :class="{ 'kimi-eye--static': prefersReducedMotion }"
    />
    <div
      class="kimi-eye"
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
  transition: transform 0.2s ease;
  position: relative;
  flex-shrink: 0;
}

.kimi-logo.is-small {
  width: 38px;
  height: 38px;
  gap: 4px;
  padding-top: 10px;
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
  animation: eyeBlink 3.5s ease-in-out infinite;
  transform-origin: center;
}

.kimi-logo.is-small .kimi-eye {
  width: 6px;
  height: 10px;
  border-radius: 3px;
}

.kimi-eye--static {
  animation: none;
}

@keyframes eyeBlink {
  0%,
  48%,
  52%,
  100% {
    transform: scaleY(1);
    opacity: 1;
  }
  50% {
    transform: scaleY(0.08);
    opacity: 0.7;
  }
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
    animation: none;
  }
}
</style>
