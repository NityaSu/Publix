<script setup lang="ts">
import SlashRollLoader from '~/component/SlashRollLoader.vue';

useHead({
  title: 'Slash roll loader (preview)',
  meta: [{ name: 'robots', content: 'noindex, nofollow, noarchive' }],
});
</script>

<template>
  <main class="min-h-screen bg-background px-6 py-16 md:px-20">
    <p class="font-display text-xs font-semibold uppercase tracking-[0.3em] text-accent">
      Preview only
    </p>
    <h1 class="mt-3 font-display text-3xl font-extrabold uppercase text-white md:text-4xl">
      Slash roll loader
    </h1>
    <p class="mt-4 max-w-xl text-sm leading-relaxed text-muted md:text-base">
      Same slash and cage as the Supercage mark. It rushes into the box, rolls to
      the right twice, then the third roll stays in the middle of the square.
      Nothing on the site uses this yet.
    </p>

    <div class="mt-14 flex flex-wrap items-end gap-12 md:gap-16">
      <figure class="flex flex-col items-center gap-3">
        <SlashRollLoader :size="160" />
        <figcaption class="font-dm text-xs uppercase tracking-widest text-white/50">
          160px
        </figcaption>
      </figure>
      <figure class="flex flex-col items-center gap-3">
        <SlashRollLoader :size="96" />
        <figcaption class="font-dm text-xs uppercase tracking-widest text-white/50">
          96px
        </figcaption>
      </figure>
      <figure class="flex flex-col items-center gap-3">
        <SlashRollLoader :size="48" />
        <figcaption class="font-dm text-xs uppercase tracking-widest text-white/50">
          48px
        </figcaption>
      </figure>
    </div>
  </main>
</template>
