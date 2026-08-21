<script setup lang="ts">
import InsightsReadingShell from '~/component/InsightsReadingShell.vue';
import InsightsReadingToggle from '~/component/InsightsReadingToggle.vue';
import { publicBuildNotes, buildNotePath } from '~/data/buildNotes';

useHead({
  title: 'Build notes',
  meta: [
    {
      name: 'description',
      content:
        'Simple notes on my personal learning — written for myself to review for fun, kept public anyway.',
    },
  ],
});

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
</script>

<template>
  <InsightsReadingShell>
    <main>
      <section class="w-full px-6 md:px-20 lg:px-[160px] py-16 md:py-24">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xs md:text-sm font-display font-semibold uppercase tracking-[0.3em] text-accent">
              Insights
            </p>
            <h1 class="mt-4 font-display font-extrabold uppercase ri-ink text-4xl sm:text-5xl md:text-6xl">
              Build notes
            </h1>
          </div>
          <InsightsReadingToggle />
        </div>
        <p class="mt-5 max-w-2xl text-sm md:text-base ri-ink leading-relaxed">
          Simple notes on my personal learning, written for myself just to review for fun. Not necessarily meant for others, but I’m generous enough to keep it public!
        </p>
        <div class="mt-6 h-[2px] w-full ri-rule" />

        <ul class="mt-12 md:mt-16 space-y-5 max-w-3xl" role="list">
          <li v-for="note in publicBuildNotes" :key="note.slug">
            <NuxtLink
              :to="buildNotePath(note.slug)"
              class="group block border ri-border ri-surface px-6 py-5 transition-colors hover:border-accent/40"
            >
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p class="font-dm text-xs uppercase tracking-[0.16em] text-accent">
                  {{ note.tag }}
                </p>
                <time
                  class="font-dm text-xs uppercase tracking-[0.12em] ri-sub"
                  :datetime="note.date"
                >
                  {{ formatDate(note.date) }}
                </time>
              </div>
              <h2 class="mt-2 font-display font-bold ri-ink text-lg md:text-xl group-hover:text-accent transition-colors">
                {{ note.title }}
              </h2>
              <p class="mt-2 text-sm ri-ink leading-relaxed">
                {{ note.summary }}
              </p>
              <div
                v-if="note.stack?.length"
                class="mt-4 flex flex-wrap gap-2"
              >
                <span
                  v-for="tag in note.stack"
                  :key="tag"
                  class="font-dm text-[10px] uppercase tracking-[0.12em] ri-sub border ri-border px-2 py-0.5"
                >
                  {{ tag }}
                </span>
              </div>
              <p class="mt-4 font-dm text-xs uppercase tracking-[0.14em] ri-sub group-hover:text-accent transition-colors">
                Read note →
              </p>
            </NuxtLink>
          </li>
        </ul>

        <p class="mt-12">
          <NuxtLink
            to="/insights"
            class="text-sm ri-sub hover:text-accent transition-colors"
          >
            ← Back to My Thoughts
          </NuxtLink>
        </p>
      </section>
    </main>
  </InsightsReadingShell>
</template>
