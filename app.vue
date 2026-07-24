<script setup lang="ts">
import NavbarHeader from '~/component/NavbarHeader.vue';
</script>

<template>
  <div class="min-h-screen bg-background">
    <NavbarHeader />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
