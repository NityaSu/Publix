<script setup lang="ts">
import { useInsightsImmersive } from '~/composables/useInsightsImmersive';
import { useInsightsReadingMode } from '~/composables/useInsightsReadingMode';
import { useRecordNoteView } from '~/composables/useNoteViews';

const { mode } = useInsightsReadingMode();
const { immersive } = useInsightsImmersive();
useRecordNoteView();
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
