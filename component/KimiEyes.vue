<script setup lang="ts">
import { computed } from 'vue';
import { useMediaQuery } from '@vueuse/core';

type KimiSize = 'sm' | 'nav' | 'md' | 'lg';

interface Props {
  size?: KimiSize;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
});

const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

const sizeClass = computed(() => `kimi-face--${props.size}`);
</script>

<template>
  <div
    class="kimi-face"
    :class="sizeClass"
    role="img"
    aria-label="Blinking face"
  >
    <div
      class="eye"
      :class="{ 'eye--static': prefersReducedMotion }"
    />
    <div
      class="eye"
      :class="{ 'eye--static': prefersReducedMotion }"
    />
  </div>
</template>

<style scoped>
.kimi-face {
  border-radius: 50%;
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
  flex-shrink: 0;
}

.kimi-face--sm {
  width: 24px;
  height: 24px;
  gap: 3px;
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.35);
}

/* Scales with the parent title font-size so it matches NITYA SUON */
.kimi-face--nav {
  width: 1.05em;
  height: 1.05em;
  gap: 0.14em;
  box-shadow: 0 0 16px rgba(59, 130, 246, 0.4);
}

.kimi-face--md {
  width: 48px;
  height: 48px;
  gap: 6px;
}

.kimi-face--lg {
  width: 64px;
  height: 64px;
  gap: 8px;
}

.eye {
  background: white;
  border-radius: 50%;
  transform-origin: center;
  animation: eyeBlink 3s ease-in-out infinite;
}

.kimi-face--sm .eye {
  width: 4px;
  height: 5px;
}

.kimi-face--nav .eye {
  width: 0.2em;
  height: 0.26em;
}

.kimi-face--md .eye {
  width: 8px;
  height: 10px;
}

.kimi-face--lg .eye {
  width: 10px;
  height: 12px;
}

.eye--static {
  animation: none;
}

@keyframes eyeBlink {
  0%,
  45%,
  55%,
  100% {
    transform: scaleY(1);
    opacity: 1;
  }
  50% {
    transform: scaleY(0.1);
    opacity: 0.6;
  }
}

@media (prefers-reduced-motion: reduce) {
  .eye {
    animation: none;
  }
}
</style>
