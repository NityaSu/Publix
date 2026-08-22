<script setup lang="ts">
import InsightsReadingShell from '~/component/InsightsReadingShell.vue';
import RedisLab from '~/component/RedisLab.vue';

useHead({
  title: 'How This Site Counts Views with Redis',
  meta: [
    {
      name: 'description',
      content:
        'How this site counts Build Note views with Redis — kid-version keywords (slug, HINCRBY, HASH), FROM→TO process hops, and the real code path.',
    },
  ],
});
</script>

<template>
  <InsightsReadingShell>
    <RedisLab />
  </InsightsReadingShell>
</template>
