<script setup lang="ts">
import HeroSection from '~/component/HeroSection.vue';
import AboutSection from '~/component/AboutSection.vue';
import MediaSection from '~/component/MediaSection.vue';

useHead({
  title: 'Home',
});
</script>

<template>
  <main class="min-h-screen bg-background">
    <HeroSection />
    <AboutSection />
    <MediaSection />
  </main>
</template>
