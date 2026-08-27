<script setup lang="ts">
import InsightsReadingShell from '~/component/InsightsReadingShell.vue';
import HrmsKnowledgeGraph from '~/component/HrmsKnowledgeGraph.vue';

useHead({
  title: 'HRMS · First Principles',
  meta: [
    {
      name: 'description',
      content:
        'Private map of your hrms_api — click AuthN, AuthZ, Status, Redis, or Schema to open a deep studio.',
    },
    { name: 'robots', content: 'noindex, nofollow, noarchive' },
  ],
});
</script>

<template>
  <InsightsReadingShell>
    <HrmsKnowledgeGraph />
  </InsightsReadingShell>
</template>
