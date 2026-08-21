<script setup lang="ts">
useHead({
  title: 'Privacy Policy',
});
</script>

<template>
  <main class="w-full px-6 md:px-20 lg:px-[160px] py-16 md:py-24">
    <h1 class="font-display font-extrabold uppercase text-white text-4xl sm:text-5xl md:text-6xl">
      Privacy Policy
    </h1>
    <div class="mt-6 h-[2px] w-full bg-accent" />

    <div class="mt-12 max-w-2xl space-y-5 text-sm md:text-base text-muted leading-relaxed">
      <p>
        The contact form collects your name, email, optional phone number, and message so I can
        reply. I do not sell that information.
      </p>
      <p>
        Messages are sent through the site’s email service and kept only as long as needed to
        respond.
      </p>
      <p>
        <NuxtLink to="/contact" class="text-accent hover:underline">Back to Contact</NuxtLink>
      </p>
    </div>
  </main>
</template>
