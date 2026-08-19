<script setup lang="ts">
import { useInsightsReadingMode } from '~/composables/useInsightsReadingMode';

const { mode } = useInsightsReadingMode();
</script>

<template>
  <div class="insights-shell insights-shell-fill" :data-mode="mode">
    <slot />
  </div>
</template>
