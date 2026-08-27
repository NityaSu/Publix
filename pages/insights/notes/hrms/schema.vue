<script setup lang="ts">
import InsightsReadingShell from '~/component/InsightsReadingShell.vue';
import HrmsSchemaLesson from '~/component/HrmsSchemaLesson.vue';

useHead({
  title: 'HRMS · Schema Studio',
  meta: [
    {
      name: 'description',
      content:
        'Interactive ERD of your hrms_api — tables, FKs, leave→pay data flow, piece-by-piece schema lessons.',
    },
    { name: 'robots', content: 'noindex, nofollow, noarchive' },
  ],
});
</script>

<template>
  <InsightsReadingShell>
    <HrmsSchemaLesson />
  </InsightsReadingShell>
</template>
