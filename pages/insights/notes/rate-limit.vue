<script setup lang="ts">
import InsightsReadingShell from '~/component/InsightsReadingShell.vue';
import RateLimitLesson from '~/component/RateLimitLesson.vue';

useHead({
  title: 'Rate Limit — 10 req/min per IP',
  meta: [
    {
      name: 'description',
      content:
        'Private review: set a rate limit like 10 requests per minute per IP — the Minute Door, fixed window, Cloudflare/Redis-shaped examples.',
    },
    { name: 'robots', content: 'noindex, nofollow, noarchive' },
  ],
});
</script>

<template>
  <InsightsReadingShell>
    <RateLimitLesson />
  </InsightsReadingShell>
</template>
