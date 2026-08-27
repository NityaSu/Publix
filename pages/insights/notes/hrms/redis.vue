<script setup lang="ts">
import InsightsReadingShell from '~/component/InsightsReadingShell.vue';
import HrmsDeepStudio from '~/component/HrmsDeepStudio.vue';
import { hrmsRedisStudio } from '~/data/hrmsRedisStudio';

useHead({
  title: 'HRMS · Redis Studio',
  meta: [
    {
      name: 'description',
      content:
        'Deep Redis from hrms_api: permission cache keys, 15m TTL, session helpers unused by login.',
    },
    { name: 'robots', content: 'noindex, nofollow, noarchive' },
  ],
});
</script>

<template>
  <InsightsReadingShell>
    <HrmsDeepStudio :studio="hrmsRedisStudio" />
  </InsightsReadingShell>
</template>
