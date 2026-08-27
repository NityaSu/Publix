<script setup lang="ts">
import InsightsReadingShell from '~/component/InsightsReadingShell.vue';
import HrmsDeepStudio from '~/component/HrmsDeepStudio.vue';
import { hrmsStatusStudio } from '~/data/hrmsStatusStudio';

useHead({
  title: 'HRMS · Status Studio',
  meta: [
    {
      name: 'description',
      content:
        'Deep status codes from hrms_api: ResponseDTO, Resp helpers, 401 vs 403 vs login 500 quirks.',
    },
    { name: 'robots', content: 'noindex, nofollow, noarchive' },
  ],
});
</script>

<template>
  <InsightsReadingShell>
    <HrmsDeepStudio :studio="hrmsStatusStudio" />
  </InsightsReadingShell>
</template>
