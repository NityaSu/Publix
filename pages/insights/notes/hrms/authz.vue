<script setup lang="ts">
import InsightsReadingShell from '~/component/InsightsReadingShell.vue';
import HrmsDeepStudio from '~/component/HrmsDeepStudio.vue';
import { hrmsAuthzStudio } from '~/data/hrmsAuthzStudio';

useHead({
  title: 'HRMS · AuthZ Studio',
  meta: [
    {
      name: 'description',
      content:
        'Deep AuthZ from hrms_api: RBAC SQL, RequireResourcePermission, full route gate inventory.',
    },
    { name: 'robots', content: 'noindex, nofollow, noarchive' },
  ],
});
</script>

<template>
  <InsightsReadingShell>
    <HrmsDeepStudio :studio="hrmsAuthzStudio" />
  </InsightsReadingShell>
</template>
