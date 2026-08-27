<script setup lang="ts">
import InsightsReadingShell from '~/component/InsightsReadingShell.vue';
import RedisLab from '~/component/RedisLab.vue';

useHead({
  title: 'How This Site Counts Views with Redis',
  meta: [
    {
      name: 'description',
      content:
        'Why Redis for view counts, then one page: Upstash → env → API → HINCRBY — how this site does it.',
    },
  ],
});
</script>

<template>
  <InsightsReadingShell>
    <RedisLab />
  </InsightsReadingShell>
</template>
