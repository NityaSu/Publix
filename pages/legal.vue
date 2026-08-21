<script setup lang="ts">
useHead({
  title: 'Legal',
});
</script>

<template>
  <main class="w-full px-6 md:px-20 lg:px-[160px] py-16 md:py-24">
    <h1 class="font-display font-extrabold uppercase text-white text-4xl sm:text-5xl md:text-6xl">
      Legal
    </h1>
    <div class="mt-6 h-[2px] w-full bg-accent" />

    <div class="mt-12 max-w-2xl space-y-5 text-sm md:text-base text-muted leading-relaxed">
      <p>
        This is a personal portfolio site. Content is provided as-is for informational purposes.
      </p>
      <p>© 2026 Nitya Suon. All rights reserved.</p>
      <p>
        <NuxtLink to="/contact" class="text-accent hover:underline">Back to Contact</NuxtLink>
      </p>
    </div>
  </main>
</template>
