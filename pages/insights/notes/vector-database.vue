<script setup lang="ts">
import InsightsReadingShell from '~/component/InsightsReadingShell.vue';
import VectorDatabaseLesson from '~/component/VectorDatabaseLesson.vue';

useHead({
  title: 'Vector Database — Similarity Search',
  meta: [
    {
      name: 'description',
      content:
        'Private review: documents as points in vector space, distance as similarity, and why HNSW indexes beat brute force.',
    },
    { name: 'robots', content: 'noindex, nofollow, noarchive' },
  ],
});
</script>

<template>
  <InsightsReadingShell>
    <VectorDatabaseLesson />
  </InsightsReadingShell>
</template>
