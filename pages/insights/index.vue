<script setup lang="ts">
import InsightsSection from '~/component/InsightsSection.vue';
import InsightsReadingShell from '~/component/InsightsReadingShell.vue';

useHead({
  title: 'Insights',
});
</script>

<template>
  <InsightsReadingShell>
    <main>
      <InsightsSection />
    </main>
  </InsightsReadingShell>
</template>
