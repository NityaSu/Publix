<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import MoonDot from '~/component/MoonDot.vue';

type Phase = 'thinking' | 'typing' | 'flashing' | 'done';

const FULL_TEXT = 'SOFTWARE ENGINEER';
const THINKING_LABEL = 'Thinking';
const THINKING_MS = 10000;
const FLASH_MS = 3600;

const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

const currentText = ref('');
const phase = ref<Phase>('thinking');
const showMoon = ref(false);

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

const getDelay = () => Math.random() * 200 + 60;

const showFinal = () => {
  clearTimers();
  currentText.value = FULL_TEXT;
  phase.value = 'done';
  showMoon.value = false;
};

const typeText = () => {
  currentText.value = '';
  phase.value = 'typing';
  showMoon.value = true;

  let i = 0;
  const type = () => {
    if (i < FULL_TEXT.length) {
      currentText.value += FULL_TEXT.charAt(i);
      i += 1;
      later(type, getDelay());
      return;
    }

    // Phase 3: same text, white gradient sweep ×3
    showMoon.value = false;
    phase.value = 'flashing';

    // Phase 4: pure white
    later(() => {
      phase.value = 'done';
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

  // Phase 1: Thinking with gradient sweep + moon (10s)
  currentText.value = THINKING_LABEL;
  phase.value = 'thinking';
  showMoon.value = true;

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
    <span
      class="dynamic-text"
      :class="{
        'thinking-sweep': phase === 'thinking',
        typing: phase === 'typing',
        'flash-sweep': phase === 'flashing',
        'final-white': phase === 'done',
      }"
    >{{ currentText }}</span>
    <MoonDot v-if="showMoon" />
  </div>
</template>

<style scoped>
.subtitle {
  display: block;
  line-height: 0.95;
}

.dynamic-text {
  font-weight: inherit;
}

/* Keep "Thinking" title-case inside the uppercase hero heading */
.thinking-sweep {
  text-transform: none;
  background: linear-gradient(
    90deg,
    #555555 0%,
    #555555 30%,
    #cccccc 50%,
    #555555 70%,
    #555555 100%
  );
  background-size: 250% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: thinkingSweep 2s ease-in-out infinite;
}

@keyframes thinkingSweep {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: 0% 0;
  }
}

.typing {
  color: #888888;
  -webkit-text-fill-color: #888888;
}

.flash-sweep {
  background: linear-gradient(
    90deg,
    #888888 0%,
    #888888 30%,
    #ffffff 50%,
    #888888 70%,
    #888888 100%
  );
  background-size: 250% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: softwareSweep 1.2s ease-in-out 3;
}

@keyframes softwareSweep {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: 0% 0;
  }
}

.final-white {
  color: #ffffff;
  -webkit-text-fill-color: #ffffff;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.15);
}

@media (prefers-reduced-motion: reduce) {
  .thinking-sweep,
  .flash-sweep {
    animation: none;
    background: none;
    -webkit-text-fill-color: #ffffff;
    color: #ffffff;
  }
}
</style>
