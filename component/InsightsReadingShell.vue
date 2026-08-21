<script setup lang="ts">
import { useInsightsImmersive } from '~/composables/useInsightsImmersive';
import { useInsightsReadingMode } from '~/composables/useInsightsReadingMode';

const { mode } = useInsightsReadingMode();
const { immersive } = useInsightsImmersive();
</script>

<template>
  <div
    class="insights-shell insights-shell-fill"
    :class="{ 'is-immersive': immersive }"
    :data-mode="mode"
  >
    <slot />
  </div>
</template>
