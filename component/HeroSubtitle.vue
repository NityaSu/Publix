<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import MoonDot from '~/component/MoonDot.vue';

const FULL_TEXT = 'SOFTWARE ENGINEER';
const THINKING_LABEL = 'Thinking';
const THINKING_MS = 3500;
const FLASH_MS = 3200;

const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

const currentText = ref('');
const showStatic = ref(false);
const showMoon = ref(false);
const isFlashing = ref(false);
const isDone = ref(false);
const isThinkingLabel = ref(false);

const timers: ReturnType<typeof setTimeout>[] = [];

const clearTimers = () => {
  while (timers.length) {
    const id = timers.pop();
    if (id) clearTimeout(id);
  }
};

const later = (fn: () => void, ms: number) => {
  timers.push(setTimeout(fn, ms));
};

const getDelay = () => Math.random() * 270 + 80;

const showFinal = () => {
  clearTimers();
  currentText.value = FULL_TEXT;
  showStatic.value = true;
  showMoon.value = false;
  isFlashing.value = false;
  isDone.value = true;
  isThinkingLabel.value = false;
};

const typeText = () => {
  currentText.value = '';
  showStatic.value = true;
  showMoon.value = true;
  isFlashing.value = false;
  isDone.value = false;
  isThinkingLabel.value = false;

  let i = 0;
  const type = () => {
    if (i < FULL_TEXT.length) {
      currentText.value += FULL_TEXT.charAt(i);
      i += 1;
      later(type, getDelay());
      return;
    }

    // Phase 3: flash the SAME element 4 times
    showMoon.value = false;
    isFlashing.value = true;

    // Phase 4: final lit state
    later(() => {
      isFlashing.value = false;
      isDone.value = true;
    }, FLASH_MS);
  };

  type();
};

const runSequence = () => {
  clearTimers();

  if (prefersReducedMotion.value) {
    showFinal();
    return;
  }

  currentText.value = THINKING_LABEL;
  showStatic.value = false;
  showMoon.value = true;
  isFlashing.value = false;
  isDone.value = false;
  isThinkingLabel.value = true;

  later(() => {
    typeText();
  }, THINKING_MS);
};

onMounted(() => {
  runSequence();
});

watch(prefersReducedMotion, (reduced) => {
  if (reduced) showFinal();
});

onUnmounted(() => {
  clearTimers();
});
</script>

<template>
  <div class="subtitle">
    <!-- Title line: ONE dynamic text element + moon (never duplicated) -->
    <div class="dynamic-row">
      <span
        class="dynamic-text"
        :class="{
          'is-flashing': isFlashing,
          'is-done': isDone,
          'is-thinking-label': isThinkingLabel,
        }"
      >{{ currentText }}</span>
      <MoonDot v-if="showMoon" />
    </div>

    <!-- Existing accent line — appears when typing begins -->
    <span
      v-if="showStatic"
      class="static-text"
    >
      Bronze Medalist · National Math Olympiad
    </span>
  </div>
</template>

<style scoped>
.subtitle {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
}

.dynamic-row {
  display: block;
  line-height: 0.95;
}

.dynamic-text {
  font-weight: inherit;
  color: #888888;
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

/* Keep "Thinking" title-case even inside the uppercase hero heading */
.dynamic-text.is-thinking-label {
  text-transform: none;
}

.dynamic-text.is-flashing {
  animation: textFlash 0.8s ease-in-out 4;
}

@keyframes textFlash {
  0%,
  100% {
    color: #888888;
    text-shadow: none;
  }
  50% {
    color: #dddddd;
    text-shadow: 0 0 25px rgba(221, 221, 221, 0.3);
  }
}

.dynamic-text.is-done {
  color: #aaaaaa;
  text-shadow: none;
}

.static-text {
  display: block;
  margin-top: 0.5rem;
  color: inherit;
  font-weight: inherit;
  font-size: clamp(0.9rem, 2.5vw, 1.875rem);
  letter-spacing: 0.025em;
  line-height: 1.25;
}

@media (min-width: 768px) {
  .static-text {
    margin-top: 0.75rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dynamic-text.is-flashing {
    animation: none;
  }
}
</style>
