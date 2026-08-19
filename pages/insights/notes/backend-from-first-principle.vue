<script setup lang="ts">
import BackendKnowledgeGraph from '~/component/BackendKnowledgeGraph.vue';
import InsightsReadingShell from '~/component/InsightsReadingShell.vue';

useHead({
  title: 'Backend From First Principle',
  meta: [
    {
      name: 'description',
      content:
        'A 31-node map of how a backend is actually built — request path, data, async work, and what keeps it alive.',
    },
  ],
});
</script>

<template>
  <InsightsReadingShell>
    <BackendKnowledgeGraph />
  </InsightsReadingShell>
</template>
