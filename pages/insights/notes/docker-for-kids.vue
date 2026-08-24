<script setup lang="ts">
import DockerKidsExplainer from '~/component/DockerKidsExplainer.vue';
import InsightsReadingShell from '~/component/InsightsReadingShell.vue';

useHead({
  title: 'Docker in Kid Version',
  meta: [
    {
      name: 'description',
      content:
        'Docker as a cookie kitchen — image is the recipe, Docker is the kitchen, container is the cookie — plus a ship game for why volumes matter.',
    },
  ],
});
</script>

<template>
  <InsightsReadingShell>
    <DockerKidsExplainer />
  </InsightsReadingShell>
</template>
