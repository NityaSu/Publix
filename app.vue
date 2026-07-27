<script setup lang="ts">
import NavbarHeader from '~/component/NavbarHeader.vue';
</script>

<template>
  <div class="min-h-screen bg-background">
    <NavbarHeader />
    <NuxtLoadingIndicator color="#3a7bd5" :height="3" :throttle="0" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
