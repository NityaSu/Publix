<script setup lang="ts">
import InsightsReadingShell from '~/component/InsightsReadingShell.vue';
import VizStatePlayground from '~/component/VizStatePlayground.vue';

useHead({
  title: 'State in Visualization',
  meta: [
    {
      name: 'description',
      content:
        'Private review: a visualization is several clocks on one picture — hover, selection, filter, camera, derived.',
    },
    { name: 'robots', content: 'noindex, nofollow, noarchive' },
  ],
});
</script>

<template>
  <InsightsReadingShell>
    <VizStatePlayground />
  </InsightsReadingShell>
</template>
