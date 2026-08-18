<script setup lang="ts">
import BackendKnowledgeGraph from '~/component/BackendKnowledgeGraph.vue';
import InsightsReadingShell from '~/component/InsightsReadingShell.vue';

useHead({
  title: 'Backend From First Principle',
  meta: [
    {
      name: 'description',
      content: 'Private review map of backend systems, from the request path to what keeps a machine alive.',
    },
    { name: 'robots', content: 'noindex, nofollow, noarchive' },
  ],
});
</script>

<template>
  <InsightsReadingShell>
    <BackendKnowledgeGraph />
  </InsightsReadingShell>
</template>
