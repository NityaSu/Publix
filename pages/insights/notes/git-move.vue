<script setup lang="ts">
import GitMovePipeline from '~/component/GitMovePipeline.vue';
import InsightsReadingShell from '~/component/InsightsReadingShell.vue';

useHead({
  title: 'How moving code from X to Y works',
  meta: [
    {
      name: 'description',
      content:
        'Each environment runs a git branch. Moving code is merging one branch into another — every git step stays on screen while the merge animates.',
    },
  ],
});
</script>

<template>
  <InsightsReadingShell>
    <GitMovePipeline />
  </InsightsReadingShell>
</template>
