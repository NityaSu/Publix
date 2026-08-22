export interface BuildNote {
  slug: string;
  title: string;
  summary: string;
  tag: string;
  /** ISO date string for ordering / display */
  date: string;
  stack?: string[];
  /** Hidden from public listings; URL is gated by DRAFT_SECRET. */
  draft?: boolean;
}

/**
 * Registry of Build notes. Add a new entry here when you publish
 * `pages/insights/notes/<slug>.vue`.
 */
export const buildNotes: BuildNote[] = [
  {
    slug: 'redis-views',
    title: 'How This Site Counts Views with Redis',
    summary:
      'FROM→TO walkthrough of the live view counter — hard words in kid version (slug, HINCRBY, HASH…), then the real files.',
    tag: 'Personal Learning',
    date: '2026-08-22',
    stack: ['Redis', 'Upstash', 'HINCRBY', 'Nuxt'],
  },
  {
    slug: 'database-lab',
    title: 'Database Lab',
    summary:
      'Coffee shop SQL from SELECT through transactions — plus the original join lab.',
    tag: 'Personal Learning',
    date: '2026-08-21',
    stack: ['SQL', 'Joins', 'GROUP BY', 'Indexes', 'Transactions'],
  },
  {
    slug: 'docker-for-kids',
    title: 'Docker in Kid Version',
    summary:
      'Image is the recipe, Docker is the kitchen, container is the cookie — map on the left, lesson on the right.',
    tag: 'Personal Learning',
    date: '2026-08-19',
    stack: ['Docker', 'Containers', 'Kid version'],
  },
  {
    slug: 'state-in-visualization',
    title: 'State in Visualization',
    summary:
      'A chart is several clocks on one picture — hover, selection, filter, camera, derived. Mixing them is why it feels haunted.',
    tag: 'Private review',
    date: '2026-08-19',
    stack: ['State', 'Visualization', 'Interaction'],
    draft: true,
  },
  {
    slug: 'backend-from-first-principle',
    title: 'Backend From First Principle',
    summary:
      'A 31-node map of how a backend is actually built — request path, data, async work, and what keeps it alive.',
    tag: 'Personal Learning',
    date: '2026-08-18',
    stack: ['HTTP', 'REST', 'Databases', 'Systems'],
  },
  {
    slug: 'supercage',
    title: 'Building supercage: caging an AI coding agent',
    summary:
      'Unsafe agent first → Docker cage → live dashboard. Screenshots and Phase 4 demos inside.',
    tag: 'Personal Learning',
    date: '2026-08-08',
    stack: ['Sandbox', 'Docker', 'Python', 'Ollama', 'FastAPI', 'React'],
  },
];

export const publicBuildNotes = buildNotes.filter((note) => !note.draft);

export function noteBySlug(slug: string) {
  return buildNotes.find((note) => note.slug === slug);
}

export function isBuildNoteSlug(slug: string) {
  return buildNotes.some((note) => note.slug === slug);
}

export function isDraftNote(slug: string) {
  return buildNotes.some((note) => note.slug === slug && note.draft);
}

export function buildNotePath(slug: string) {
  return `/insights/notes/${slug}`;
}
