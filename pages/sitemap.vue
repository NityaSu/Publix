<script setup lang="ts">
useHead({
  title: 'Sitemap',
});

const links = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/#about' },
  { label: 'Insights', to: '/insights' },
  { label: 'Build Notes', to: '/insights/notes' },
  { label: 'Projects', to: '/projects' },
  { label: 'Thesis', to: '/thesis' },
  { label: 'Contact', to: '/contact' },
  { label: 'Legal', to: '/legal' },
  { label: 'Privacy Policy', to: '/privacy' },
];
</script>

<template>
  <main class="w-full px-6 md:px-20 lg:px-[160px] py-16 md:py-24">
    <h1 class="font-display font-extrabold uppercase text-white text-4xl sm:text-5xl md:text-6xl">
      Sitemap
    </h1>
    <div class="mt-6 h-[2px] w-full bg-accent" />

    <ul class="mt-12 max-w-2xl space-y-3 text-sm md:text-base">
      <li v-for="link in links" :key="link.to">
        <NuxtLink :to="link.to" class="text-muted hover:text-accent transition-colors">
          {{ link.label }}
        </NuxtLink>
      </li>
    </ul>
  </main>
</template>
