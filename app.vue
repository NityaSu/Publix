<script setup lang="ts">
import NavbarHeader from '~/component/NavbarHeader.vue';
import { useInsightsImmersive } from '~/composables/useInsightsImmersive';

const { immersive } = useInsightsImmersive();
</script>

<template>
  <div class="min-h-screen bg-background">
    <NavbarHeader v-if="!immersive" />
    <NuxtLoadingIndicator color="#3a7bd5" :height="3" :throttle="0" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
