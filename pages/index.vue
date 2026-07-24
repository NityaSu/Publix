<script setup lang="ts">
import HeroSection from '~/component/HeroSection.vue';
import AboutSection from '~/component/AboutSection.vue';

useHead({
  title: 'Home',
});
</script>

<template>
  <main class="min-h-screen bg-background">
    <HeroSection />
    <AboutSection />
  </main>
</template>
