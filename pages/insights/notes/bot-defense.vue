<script setup lang="ts">
import InsightsReadingShell from '~/component/InsightsReadingShell.vue';
import BotDefenseLesson from '~/component/BotDefenseLesson.vue';

useHead({
  title: 'Bots at the Edge',
  meta: [
    {
      name: 'description',
      content:
        'Private review: humans vs scrapers vs stuffing vs AI crawlers — Cloudflare-shaped allow / challenge / block policy.',
    },
    { name: 'robots', content: 'noindex, nofollow, noarchive' },
  ],
});
</script>

<template>
  <InsightsReadingShell>
    <BotDefenseLesson />
  </InsightsReadingShell>
</template>
