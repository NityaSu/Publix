<script setup lang="ts">
import InsightsReadingShell from '~/component/InsightsReadingShell.vue';
import DatabaseDesignLesson from '~/component/DatabaseDesignLesson.vue';

useHead({
  title: 'Schema Design for Backends',
  meta: [
    {
      name: 'description',
      content:
        'Private review: turn product questions into tables, foreign keys, uniqueness constraints, and indexes.',
    },
    { name: 'robots', content: 'noindex, nofollow, noarchive' },
  ],
});
</script>

<template>
  <InsightsReadingShell>
    <DatabaseDesignLesson />
  </InsightsReadingShell>
</template>
