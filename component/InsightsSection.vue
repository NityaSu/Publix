<script setup lang="ts">
import InsightCard, { type InsightVariant } from '~/component/InsightCard.vue';
import { buildNotes, buildNotePath } from '~/data/buildNotes';

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
  {
    id: 'bureaucracy',
    titleHtml: 'Reducing Complex Bureaucracy',
    body:
      'Bureaucracy is the silent killer on speed and momentum. High-performing organizations stay agile by continuously reducing complex process, unnecessary approvals, and administrative friction.',
    backBody:
      'Amazon established its "Two-Pizza Rule" for teams and decentralized decision-making so small units could launch ideas without waiting for corporate approvals.\n\nSony had many of the technologies and assets needed to lead the digital music and smartphone revolutions, but internal organizational silos and slow decision-making made it difficult to coordinate across divisions. Combined with strong competition from Apple and Samsung, this contributed to Sony missing major opportunities in the MP3 player and smartphone eras.\n\nSo the core idea—that internal bureaucracy and silos hurt Sony\'s ability to respond quickly—is widely accepted and based on real events. The claim that this was the sole reason Apple and Samsung overtook Sony is an oversimplification.',
    variant: 'curiosity',
  },
  {
    id: 'ship-early',
    titleHtml: 'Done Is Better Than Perfect',
    body:
      'Perfection delays learning. High-performing teams ship early, gather real-world feedback, and improve through iteration. The goal is not a flawless launch—it is a faster learning cycle than the competition.',
    backBody:
      'Amazon built "Bias for Action" into its culture. Jeff Bezos argued that most decisions are reversible and should be made quickly rather than waiting for perfect information. AWS launched with only a handful of basic services and evolved into a cloud-computing giant through continuous customer feedback.\n\nDropbox validated demand before building a finished product. Drew Houston released a simple demo video showing how Dropbox would work and attracted tens of thousands of signups. Instead of perfecting the software first, he proved that users wanted the solution.\n\nLesson: Ship early, learn quickly, and let reality guide improvement. Feedback from users is often more valuable than months of internal debate.',
    variant: 'campus',
  },
];

const latestNotes = buildNotes.slice(0, 2);
</script>

<template>
  <section class="w-full px-6 md:px-20 lg:px-[160px] py-16 md:py-24">
    <h1 class="font-display font-extrabold uppercase text-white text-4xl sm:text-5xl md:text-6xl">
      My Thoughts
    </h1>
    <div class="mt-6 h-[2px] w-full bg-accent"></div>

    <div class="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <InsightCard
        v-for="(insight, index) in insights"
        :key="insight.id"
        :number="`${String(index + 1).padStart(2, '0')}.`"
        :title-html="insight.titleHtml"
        :quote-html="insight.quoteHtml"
        :body="insight.body"
        :back-title="insight.backTitle"
        :back-body="insight.backBody"
        :variant="insight.variant"
      />
    </div>

    <div class="mt-20 md:mt-28">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 class="font-display font-extrabold uppercase text-white text-2xl sm:text-3xl md:text-4xl">
            Build notes
          </h2>
          <p class="mt-3 max-w-2xl text-sm md:text-base text-muted leading-relaxed">
            Longer write-ups about learning projects — optional, separate from the project cards.
          </p>
        </div>
        <NuxtLink
          to="/insights/notes"
          class="font-dm text-xs uppercase tracking-[0.14em] text-muted hover:text-accent transition-colors"
        >
          View all →
        </NuxtLink>
      </div>
      <div class="mt-6 h-[2px] w-full bg-accent/40" />

      <ul class="mt-8 space-y-4 max-w-2xl" role="list">
        <li v-for="note in latestNotes" :key="note.slug">
          <NuxtLink
            :to="buildNotePath(note.slug)"
            class="group block border border-white/10 bg-surface px-6 py-5 transition-colors hover:border-accent/40"
          >
            <p class="font-dm text-xs uppercase tracking-[0.16em] text-accent">
              {{ note.tag }}
            </p>
            <h3 class="mt-2 font-display font-bold text-white text-lg md:text-xl group-hover:text-accent transition-colors">
              {{ note.title }}
            </h3>
            <p class="mt-2 text-sm text-muted leading-relaxed">
              {{ note.summary }}
            </p>
            <p class="mt-4 font-dm text-xs uppercase tracking-[0.14em] text-muted group-hover:text-accent transition-colors">
              Read note →
            </p>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>
