<script setup lang="ts">
import InsightsReadingShell from '~/component/InsightsReadingShell.vue';
import HrmsDeepStudio from '~/component/HrmsDeepStudio.vue';
import { hrmsAuthnStudio } from '~/data/hrmsAuthnStudio';

useHead({
  title: 'HRMS · AuthN Studio',
  meta: [
    {
      name: 'description',
      content:
        'Deep AuthN from hrms_api: session vs JWT vs API key, two login doors, claims, Bearer validation.',
    },
    { name: 'robots', content: 'noindex, nofollow, noarchive' },
  ],
});
</script>

<template>
  <InsightsReadingShell>
    <HrmsDeepStudio :studio="hrmsAuthnStudio" />
  </InsightsReadingShell>
</template>
