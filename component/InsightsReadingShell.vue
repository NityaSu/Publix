<script setup lang="ts">
import InsightsReadingToggle from '~/component/InsightsReadingToggle.vue';
import { useInsightsReadingMode } from '~/composables/useInsightsReadingMode';

const { mode } = useInsightsReadingMode();
</script>

<template>
  <div class="insights-shell min-h-screen" :data-mode="mode">
    <div
      class="sticky z-40 flex justify-end border-b px-6 md:px-20 lg:px-[160px] py-3 insights-shell-bar"
      style="top: var(--insights-nav-offset, 3.5rem)"
    >
      <InsightsReadingToggle />
    </div>
    <slot />
  </div>
</template>
