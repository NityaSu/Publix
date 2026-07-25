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
    id: 'campus',
    titleHtml: 'The Empty Campus',
    body:
      'An empty campus. Twelve autonomous robots. No drivers. Just machines navigating silence, speaking in Chinese, sensing obstacles. I stood in front of one. It stopped. Adjusted. Spoke again. That curiosity — how can it see? how can it understand? — led me straight into NLP and Computer Vision. Not from a textbook. From a robot delivering lunch in an empty university.',
    variant: 'campus',
  },
  {
    id: 'persistence',
    quoteHtml:
      'The number one determinant of <span class="text-accent">technical growth</span> is persistence.',
    body:
      'From math olympiad to production code. The path is never linear. What matters is staying in the game.',
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
