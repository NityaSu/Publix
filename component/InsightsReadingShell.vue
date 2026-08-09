<script setup lang="ts">
import { useInsightsReadingMode } from '~/composables/useInsightsReadingMode';

const { mode } = useInsightsReadingMode();
</script>

<template>
  <div class="insights-shell min-h-screen" :data-mode="mode">
    <slot />
  </div>
</template>
