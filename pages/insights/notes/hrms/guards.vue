<script setup lang="ts">
import InsightsReadingShell from '~/component/InsightsReadingShell.vue';
import HrmsDeepStudio from '~/component/HrmsDeepStudio.vue';
import { hrmsGuardsStudio } from '~/data/hrmsGuardsStudio';

useHead({
  title: 'HRMS · Guards Studio',
  meta: [
    {
      name: 'description',
      content:
        'Route protection in hrms-admin and hrms_api: Vue beforeEach, localStorage JWT, Axios interceptors, Gin AuthN/AuthZ.',
    },
    { name: 'robots', content: 'noindex, nofollow, noarchive' },
  ],
});
</script>

<template>
  <InsightsReadingShell>
    <HrmsDeepStudio :studio="hrmsGuardsStudio" />
  </InsightsReadingShell>
</template>
