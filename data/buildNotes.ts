export interface BuildNote {
  slug: string;
  title: string;
  summary: string;
  tag: string;
  /** ISO date string for ordering / display */
  date: string;
  stack?: string[];
}

/**
 * Registry of Build notes. Add a new entry here when you publish
 * `pages/insights/notes/<slug>.vue`.
 */
export const buildNotes: BuildNote[] = [
  {
    slug: 'supercage',
    title: 'Building supercage: caging an AI coding agent',
    summary:
      'Unsafe agent first → Docker cage → live dashboard. Screenshots and Phase 4 demos inside.',
    tag: 'Learning project',
    date: '2026-08-08',
    stack: ['Python', 'Ollama', 'Docker', 'FastAPI', 'React'],
  },
];

export function buildNotePath(slug: string) {
  return `/insights/notes/${slug}`;
}
