<script setup lang="ts">
import DatabaseLab from '~/component/DatabaseLab.vue';
import InsightsReadingShell from '~/component/InsightsReadingShell.vue';

useHead({
  title: 'Database Lab',
  meta: [
    {
      name: 'description',
      content:
        'Tables, keys, joins, and indexes in a stepped playground — left join is one lesson, not the whole note.',
    },
  ],
});
</script>

<template>
  <InsightsReadingShell>
    <DatabaseLab />
  </InsightsReadingShell>
</template>
