<script setup lang="ts">
import DatabaseLab from '~/component/DatabaseLab.vue';
import InsightsReadingShell from '~/component/InsightsReadingShell.vue';

useHead({
  title: 'Database Lab',
  meta: [
    {
      name: 'description',
      content:
        'Coffee shop SQL: SELECT, JOIN, GROUP BY, subqueries, indexes, and transactions.',
    },
  ],
});
</script>

<template>
  <InsightsReadingShell>
    <DatabaseLab />
  </InsightsReadingShell>
</template>
