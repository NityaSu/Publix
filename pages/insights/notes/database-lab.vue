<script setup lang="ts">
import DatabaseLab from '~/component/DatabaseLab.vue';
import InsightsReadingShell from '~/component/InsightsReadingShell.vue';

useHead({
  title: 'Database Lab',
  meta: [
    {
      name: 'description',
      content:
        'Tables, keys, joins, indexes, and GROUP BY — explain, then practice, then master.',
    },
  ],
});
</script>

<template>
  <InsightsReadingShell>
    <DatabaseLab />
  </InsightsReadingShell>
</template>
