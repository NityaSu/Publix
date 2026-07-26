<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useMediaQuery } from '@vueuse/core';

interface Props {
  text: string;
  /** Delay before typing begins (ms). */
  startDelayMs?: number;
}

const props = withDefaults(defineProps<Props>(), {
  startDelayMs: 1000,
});

const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

const displayedText = ref('');
const isThinking = ref(false);

let startTimer: ReturnType<typeof setTimeout> | undefined;
let typeTimer: ReturnType<typeof setTimeout> | undefined;
let hideDotsTimer: ReturnType<typeof setTimeout> | undefined;

const clearTimers = () => {
  if (startTimer) {
    clearTimeout(startTimer);
    startTimer = undefined;
  }
  if (typeTimer) {
    clearTimeout(typeTimer);
    typeTimer = undefined;
  }
  if (hideDotsTimer) {
    clearTimeout(hideDotsTimer);
    hideDotsTimer = undefined;
  }
};

/** Random 80–350ms — deliberate, uneven pacing. */
const getDelay = () => Math.random() * 270 + 80;

const showFullText = () => {
  clearTimers();
  displayedText.value = props.text;
  isThinking.value = false;
};

const startTyping = () => {
  clearTimers();

  if (prefersReducedMotion.value) {
    showFullText();
    return;
  }

  displayedText.value = '';
  isThinking.value = true;
  let i = 0;

  const type = () => {
    if (i < props.text.length) {
      displayedText.value += props.text.charAt(i);
      i += 1;
      typeTimer = setTimeout(type, getDelay());
      return;
    }

    hideDotsTimer = setTimeout(() => {
      isThinking.value = false;
    }, 600);
  };

  startTimer = setTimeout(type, props.startDelayMs);
};

onMounted(() => {
  startTyping();
});

watch(prefersReducedMotion, (reduced) => {
  if (reduced) showFullText();
});

onUnmounted(() => {
  clearTimers();
});
</script>

<template>
  <span class="typing-wrapper">
    <span class="typing-text">{{ displayedText }}</span>
    <span
      v-if="isThinking"
      class="thinking-dots"
      aria-hidden="true"
    >
      <span class="dot" />
      <span class="dot" />
      <span class="dot" />
    </span>
  </span>
</template>

<style scoped>
.typing-wrapper {
  display: inline;
}

.thinking-dots {
  display: inline;
  white-space: nowrap;
  margin-left: 0.2em;
}

.dot {
  display: inline-block;
  width: 0.14em;
  height: 0.14em;
  min-width: 5px;
  min-height: 5px;
  margin-right: 0.1em;
  border-radius: 50%;
  background: #4a9eff;
  opacity: 0.3;
  vertical-align: middle;
  animation: thinkPulse 1.2s ease-in-out infinite;
}

.dot:last-child {
  margin-right: 0;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes thinkPulse {
  0%,
  100% {
    opacity: 0.2;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.3);
  }
}

@media (prefers-reduced-motion: reduce) {
  .dot {
    animation: none;
  }
}
</style>
