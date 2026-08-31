<script setup lang="ts">
import FrontendKnowledgeGraph from '~/component/FrontendKnowledgeGraph.vue';
import InsightsReadingShell from '~/component/InsightsReadingShell.vue';

useHead({
  title: 'Frontend From First Principle',
  meta: [
    {
      name: 'description',
      content:
        'A 24-node map of how a frontend is actually built — picture, state, the wire, performance, reuse, and middleware.',
    },
  ],
});
</script>

<template>
  <InsightsReadingShell>
    <FrontendKnowledgeGraph />
  </InsightsReadingShell>
</template>
