<script setup lang="ts">
import DockerKidsExplainer from '~/component/DockerKidsExplainer.vue';
import InsightsReadingShell from '~/component/InsightsReadingShell.vue';

useHead({
  title: 'Docker in Kid Version',
  meta: [
    {
      name: 'description',
      content:
        'Private review: Docker as a cookie kitchen — image is the recipe, Docker is the kitchen, container is the cookie.',
    },
    { name: 'robots', content: 'noindex, nofollow, noarchive' },
  ],
});
</script>

<template>
  <InsightsReadingShell>
    <DockerKidsExplainer />
  </InsightsReadingShell>
</template>
