<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next';
import { useInsightsReadingMode } from '~/composables/useInsightsReadingMode';

const { mode, toggle, isLight } = useInsightsReadingMode();
</script>

<template>
  <button
    type="button"
    class="insights-reading-toggle inline-flex items-center gap-2 rounded-none border px-3 py-2 font-dm text-xs uppercase tracking-[0.14em] transition-colors duration-300"
    :aria-label="isLight ? 'Switch to dark reading mode' : 'Switch to light reading mode'"
    :title="isLight ? 'Dark mode' : 'Light mode'"
    @click="toggle"
  >
    <Sun v-if="!isLight" :size="14" aria-hidden="true" />
    <Moon v-else :size="14" aria-hidden="true" />
    <span>{{ mode === 'light' ? 'Dark' : 'Light' }}</span>
  </button>
</template>
