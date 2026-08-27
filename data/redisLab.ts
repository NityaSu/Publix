/**
 * Redis view counts — two pages only.
 * 1) Why Redis for views (Rauch-style reasons)
 * 2) One-page path: how this site wires Upstash → API → UI
 */

export type RedisPageId = 'why' | 'path';

export type RedisBlock =
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'pre'; lines: string; caption?: string }
  | { type: 'table'; columns: string[]; rows: string[][] }
  | { type: 'callout'; lines: string[] }
  | { type: 'viz'; kind: 'speed' | 'race' | 'hash' | 'pipe' | 'steps' };

export interface RedisPage {
  id: RedisPageId;
  n: number;
  label: string;
  title: string;
  lead: string;
  blocks: RedisBlock[];
}

export const redisPathSteps: { n: number; title: string; file: string; detail: string; code?: string }[] = [
  {
    n: 1,
    title: 'Create Upstash Redis',
    file: 'Upstash console',
    detail: 'New database → copy REST URL + token.',
  },
  {
    n: 2,
    title: 'Env vars',
    file: '.env',
    detail: 'Same names work for Vercel KV.',
    code: `UPSTASH_REDIS_REST_URL=…
UPSTASH_REDIS_REST_TOKEN=…`,
  },
  {
    n: 3,
    title: 'Runtime config',
    file: 'nuxt.config.ts',
    detail: 'Expose URL/token to the server only.',
    code: `kvRestApiUrl: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
kvRestApiToken: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN`,
  },
  {
    n: 4,
    title: 'Redis client',
    file: 'server/utils/redis.ts',
    detail: 'Missing env → null (site still works, counts = 0).',
    code: `export function useRedis(): Redis | null {
  const { kvRestApiUrl: url, kvRestApiToken: token } = useRuntimeConfig();
  if (!url || !token) return null;
  return new Redis({ url, token });
}`,
  },
  {
    n: 5,
    title: 'View commands',
    file: 'server/utils/views.ts',
    detail: 'One HASH named views. Field = note slug.',
    code: `const VIEWS_HASH = 'views';
redis.hgetall(VIEWS_HASH)           // list
redis.hget(VIEWS_HASH, slug)        // one
redis.hincrby(VIEWS_HASH, slug, 1)  // +1`,
  },
  {
    n: 6,
    title: 'API doors',
    file: 'server/api/views/*',
    detail: 'Browser never talks to Redis directly.',
    code: `GET  /api/views        → all counts
GET  /api/views/:slug  → one count
POST /api/views/:slug  → +1 (slug must be in buildNotes)`,
  },
  {
    n: 7,
    title: 'UI composable',
    file: 'composables/useNoteViews.ts',
    detail: 'Fetch map for the list; POST when a note opens (production).',
    code: `useFetch('/api/views')
$fetch('/api/views/' + slug, { method: 'POST' })`,
  },
  {
    n: 8,
    title: 'Show the number',
    file: 'component/NoteViews.vue',
    detail: 'Reads counts[slug] from shared state.',
  },
];

export const redisPages: RedisPage[] = [
  {
    id: 'why',
    n: 1,
    label: 'Why Redis',
    title: 'Why use Redis for view counts?',
    lead: 'Guillermo Rauch’s blog (and this site) use Redis for views not because it is trendy — because counters need speed, correct concurrent +1, a simple shape, and serverless-friendly HTTP.',
    blocks: [
      {
        type: 'p',
        text: 'A view counter is a tiny integer that changes on almost every page open. That job is different from storing blog posts. Redis is built for hot, small values in RAM.',
      },
      { type: 'viz', kind: 'speed' },
      {
        type: 'h3',
        text: '1. Fast — in-memory',
      },
      {
        type: 'p',
        text: 'Redis keeps data in RAM. A normal SQL database reads/writes on disk. For counting a view you do not want to wait on disk I/O.',
      },
      {
        type: 'table',
        columns: ['Operation', 'Typical DB', 'Redis'],
        rows: [
          ['One read/write', '~5–20ms', '~0.1ms'],
          ['Where data lives', 'Disk', 'RAM'],
        ],
      },
      {
        type: 'h3',
        text: '2. Atomic — no lost updates',
      },
      {
        type: 'p',
        text: 'If 100 people open the same post at once, a naive SELECT then UPDATE can lose counts: two readers both see 100 and both write 101.',
      },
      { type: 'viz', kind: 'race' },
      {
        type: 'pre',
        caption: 'One Redis command — serialized for you',
        lines: `await redis.hincrby("views", "my-post", 1);`,
      },
      {
        type: 'p',
        text: 'HINCRBY is a single atomic step. Ten thousand concurrent opens still land on the correct total.',
      },
      {
        type: 'h3',
        text: '3. One HASH for every post',
      },
      { type: 'viz', kind: 'hash' },
      {
        type: 'ul',
        items: [
          'Homepage / notes list: `HGETALL "views"` once → all counts.',
          'One post: `HGET "views" "slug"` or `HINCRBY "views" "slug" 1`.',
          'No separate key per post; no 15 round-trips for 15 notes.',
        ],
      },
      {
        type: 'h3',
        text: '4. Serverless-friendly (Upstash HTTP)',
      },
      {
        type: 'p',
        text: 'On Vercel, functions start and stop quickly. Classic Redis TCP connections are awkward there. Upstash speaks HTTP/REST: request in, response out, done.',
      },
      { type: 'viz', kind: 'pipe' },
      {
        type: 'h3',
        text: '5. Degrade gracefully',
      },
      {
        type: 'pre',
        caption: 'This site — server/utils/redis.ts',
        lines: `const redis = useRedis(); // null if env missing
if (!redis) return 0;     // page still loads`,
      },
      {
        type: 'p',
        text: 'If Redis is down or env vars are missing, show 0 views. Do not crash the blog.',
      },
      {
        type: 'h3',
        text: 'Why not a normal database?',
      },
      {
        type: 'table',
        columns: ['Concern', 'SQL DB', 'Redis'],
        rows: [
          ['Speed', 'Disk I/O', 'RAM'],
          ['Concurrent +1', 'Need careful locks/tx', 'HINCRBY is atomic'],
          ['Serverless', 'Connection pooling hard', 'HTTP (Upstash) easy'],
          ['Shape for counters', 'Table/row per bump', 'One hash field per slug'],
        ],
      },
      {
        type: 'callout',
        lines: [
          '**Summary:** fast · correct under concurrency · one HASH · serverless-ready · fails soft.',
          'You *can* count views in Postgres. Redis is the better tool when the number must stay hot, tiny, and honest.',
        ],
      },
    ],
  },
  {
    id: 'path',
    n: 2,
    label: 'Apply path',
    title: 'One-page path — how this site applies Redis',
    lead: 'Install → env → client → HASH commands → API → UI. Read this once; you can rebuild the same path on another project.',
    blocks: [
      { type: 'viz', kind: 'steps' },
      {
        type: 'h3',
        text: 'Redis shape on this site',
      },
      {
        type: 'pre',
        lines: `HASH "views"
  supercage     → 11
  database-lab  → 7
  redis-views   → 3
  …`,
      },
      {
        type: 'p',
        text: 'Field name = Build Note `slug` (must exist in `data/buildNotes.ts`). Value = integer count.',
      },
      {
        type: 'h3',
        text: 'Request flow',
      },
      {
        type: 'pre',
        lines: `Open note (production)
  → POST /api/views/:slug
  → assertNoteSlug
  → redis.hincrby("views", slug, 1)
  → NoteViews shows new number

Notes list / refresh
  → GET /api/views
  → redis.hgetall("views")
  → paint every card`,
      },
      {
        type: 'callout',
        lines: [
          '**Local tip:** `npm run dev` skips auto +1 so drafting does not fake traffic. Test with:',
          '`curl -X POST http://localhost:3000/api/views/supercage`',
          '`curl http://localhost:3000/api/views`',
        ],
      },
      {
        type: 'h3',
        text: 'Files to copy mentally',
      },
      {
        type: 'ul',
        items: [
          '`server/utils/redis.ts` — client',
          '`server/utils/views.ts` — HGETALL / HGET / HINCRBY',
          '`server/api/views/index.get.ts` + `[slug].get.ts` + `[slug].post.ts`',
          '`composables/useNoteViews.ts` + `component/NoteViews.vue`',
        ],
      },
    ],
  },
];

export function redisPageById(id: RedisPageId) {
  return redisPages.find((p) => p.id === id) ?? redisPages[0]!;
}
