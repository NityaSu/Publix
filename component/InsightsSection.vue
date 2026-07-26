<script setup lang="ts">
import InsightCard, { type InsightVariant } from '~/component/InsightCard.vue';

interface InsightItem {
  id: string;
  titleHtml?: string;
  quoteHtml?: string;
  body?: string;
  backTitle?: string;
  backBody?: string;
  variant: InsightVariant;
}

const insights: InsightItem[] = [
  {
    id: 'desert',
    titleHtml: 'Wandering in the desert?',
    body:
      'Sometimes the path feels unclear. The odds feel low. The loneliness feels heavy.',
    backBody:
      "There are nights I almost quit. The odds feel impossibly low, the path impossibly lonely. But something still triggers — a quiet, stubborn hope that knows I want this. That believes there's still a way. Sometimes I take time to rethink. But I still choose it. If I stop, who takes this on? If I keep going, maybe it matters. Maybe it helps someone. That 'maybe' is enough.",
    variant: 'curiosity',
  },
  {
    id: 'focus',
    titleHtml: 'Focus on what keeps users coming back.',
    backBody:
      'Shazam focused on music recognition.\nInstagram focused on photos.\nUber focused on convenience.\nAnthropic focused on accuracy.\nPolymarket focused on prediction markets.\n\nSuccess rarely comes from doing everything at once. The strongest builders identify the behavior or value that matters most to users and concentrate their efforts there. Find the core loop, then strengthen it relentlessly.',
    variant: 'campus',
  },
  {
    id: 'resilience',
    titleHtml: 'Resilience and Courage',
    backBody:
      "Hyundai's founder survived 3–4 major failures before building an industrial giant.\n\nShell's founder started from nothing, but with a big vision and the courage to challenge Rockefeller, the oil giant of his era.",
    variant: 'persistence',
  },
];
</script>

<template>
  <section class="w-full px-6 md:px-20 lg:px-[160px] py-16 md:py-24">
    <h1 class="font-display font-extrabold uppercase text-white text-4xl sm:text-5xl md:text-6xl">
      My Thoughts
    </h1>
    <div class="mt-6 h-[2px] w-full bg-accent"></div>

    <div class="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <InsightCard
        v-for="insight in insights"
        :key="insight.id"
        :title-html="insight.titleHtml"
        :quote-html="insight.quoteHtml"
        :body="insight.body"
        :back-title="insight.backTitle"
        :back-body="insight.backBody"
        :variant="insight.variant"
      />
    </div>
  </section>
</template>
