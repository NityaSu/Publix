import { publicBuildNotes } from '~/data/buildNotes';

export type RedisLessonId =
  | 'why'
  | 'words'
  | 'hash'
  | 'write'
  | 'read'
  | 'files'
  | 'upstash';

export interface FlowHop {
  from: string;
  to: string;
  via: string;
  detail: string;
}

/** Hard keyword → kid version (same spirit as Docker in Kid Version). */
export interface RedisWord {
  term: string;
  kid: string;
  meaning: string;
}

export interface RedisLesson {
  id: RedisLessonId;
  n: number;
  label: string;
  title: string;
  tag: string;
  lead: string;
  paragraphs: string[];
  remember: string[];
  /** Terms from redisWords to highlight in this lesson */
  wordIds: string[];
  command?: string;
  code?: { file: string; lines: string };
  mode: 'overview' | 'words' | 'hash' | 'write' | 'read' | 'files' | 'upstash';
  hops?: FlowHop[];
}

export const redisWords: Record<string, RedisWord> = {
  redis: {
    term: 'Redis',
    kid: 'A super-fast notebook that only remembers short facts',
    meaning:
      'An in-memory database. Great at tiny values you change all the time (like counters), not at storing big files.',
  },
  hash: {
    term: 'HASH',
    kid: 'One folder with many labeled stickers inside',
    meaning:
      'A Redis type: one key holds many field→value pairs. Here the key is views; each field is a note.',
  },
  key: {
    term: 'key',
    kid: 'The name on the folder',
    meaning: 'The outer name in Redis. Ours is the string views — the whole hash lives under that name.',
  },
  field: {
    term: 'field',
    kid: 'The label on one sticker inside the folder',
    meaning: 'A name inside a HASH. For us, each field is a note slug like supercage.',
  },
  value: {
    term: 'value',
    kid: 'The number written on that sticker',
    meaning: 'What the field stores. For views, it is an integer count (11, 12, …).',
  },
  slug: {
    term: 'slug',
    kid: 'The short URL nickname of a note',
    meaning:
      'The URL-safe id of a Build Note. supercage means /insights/notes/supercage. Same string is the Redis field name.',
  },
  hincrby: {
    term: 'HINCRBY',
    kid: '“Add one to this sticker’s number”',
    meaning:
      'Redis command: Hash INCrement BY. HINCRBY views supercage 1 means: in hash views, add 1 to field supercage (create it at 1 if missing). Atomic — safe if two people visit at once.',
  },
  hget: {
    term: 'HGET',
    kid: '“Read one sticker”',
    meaning: 'Hash GET. HGET views supercage returns only that note’s count.',
  },
  hgetall: {
    term: 'HGETALL',
    kid: '“Show me every sticker in the folder”',
    meaning:
      'Hash GET ALL. Returns every field in views — perfect for the Build Notes list page.',
  },
  post: {
    term: 'POST',
    kid: '“Please change something”',
    meaning:
      'HTTP method that usually means write/update. We POST /api/views/supercage to bump the counter.',
  },
  get: {
    term: 'GET',
    kid: '“Please just tell me”',
    meaning:
      'HTTP method that usually means read-only. GET /api/views asks for all counts without adding +1.',
  },
  api: {
    term: 'API route',
    kid: 'A door on our server browsers knock on',
    meaning:
      'Server endpoints like /api/views. The browser never talks to Redis directly — only through these doors.',
  },
  upstash: {
    term: 'Upstash',
    kid: 'Redis that answers over the web (HTTPS)',
    meaning:
      'Hosted Redis with a REST API. Fits Vercel serverless. Same commands (HINCRBY…), called with @upstash/redis.',
  },
  atomic: {
    term: 'atomic',
    kid: 'One clean step — nobody cuts in line mid-count',
    meaning:
      'The +1 finishes as a single Redis operation. Two visitors cannot both read 10 and both write 11.',
  },
  production: {
    term: 'production',
    kid: 'The real live website (not your laptop)',
    meaning:
      'The deployed site. Auto view counting runs only there; npm run dev skips +1 so writing notes does not fake traffic.',
  },
};

/** Seed fields for the demo hash — real Build Note slugs from this site. */
export const demoSlugs = publicBuildNotes.map((n) => n.slug);

export const demoSeed: Record<string, number> = Object.fromEntries(
  demoSlugs.map((slug, i) => [slug, [1, 11, 7, 2, 5, 3][i] ?? 1]),
);

export const writeHops: FlowHop[] = [
  {
    from: 'Reader',
    to: 'Note page',
    via: 'opens URL',
    detail:
      'Kid version: someone opens the storybook page. Adult: /insights/notes/supercage loads; InsightsReadingShell mounts.',
  },
  {
    from: 'InsightsReadingShell',
    to: 'useRecordNoteView()',
    via: 'route watch',
    detail:
      'Kid version: the page quietly raises a hand “count me.” Adult: composable runs only in production, once per slug.',
  },
  {
    from: 'Browser',
    to: 'Nuxt API door',
    via: 'POST /api/views/supercage',
    detail:
      'Kid version: browser knocks on the “please +1” door. Adult: HTTP POST; slug travels in the path, not a big JSON body.',
  },
  {
    from: 'API handler',
    to: 'incrementViewCount()',
    via: 'check slug',
    detail:
      'Kid version: only real note nicknames allowed. Adult: assertNoteSlug rejects junk so the HASH cannot fill with garbage fields.',
  },
  {
    from: 'server/utils/views.ts',
    to: 'Upstash Redis',
    via: 'HINCRBY views supercage 1',
    detail:
      'Kid version: add one to that sticker. Adult: atomic hash increment; returns the new total.',
  },
  {
    from: 'Redis',
    to: 'Screen (“N views”)',
    via: 'JSON then useState',
    detail:
      'Kid version: the number on the wall updates. Adult: { slug, views, viewsFormatted } merges into note-views state; NoteViews re-renders.',
  },
];

export const readHops: FlowHop[] = [
  {
    from: 'Reader',
    to: 'Build Notes list',
    via: 'refresh / visit',
    detail:
      'Kid version: open the shelf of all stories — do not add a visit yet. Adult: GET only; no HINCRBY.',
  },
  {
    from: 'Many NoteViews',
    to: 'one shared fetch',
    via: 'useAllNoteViews()',
    detail:
      'Kid version: ask once for the whole scoreboard. Adult: one GET /api/views, not one request per card.',
  },
  {
    from: 'Browser',
    to: 'Nuxt API door',
    via: 'GET /api/views',
    detail: 'Kid version: “show me every sticker.” Adult: index.get.ts → getViewCounts().',
  },
  {
    from: 'getViewCounts()',
    to: 'Redis',
    via: 'HGETALL views',
    detail:
      'Kid version: dump the whole folder. Adult: returns { supercage: 11, database-lab: 7, … }.',
  },
  {
    from: 'JSON map',
    to: 'Each card',
    via: 'counts[slug]',
    detail:
      'Kid version: each book finds its own number. Adult: NoteViews looks up props.slug in the shared map.',
  },
];

export const redisLessons: RedisLesson[] = [
  {
    id: 'why',
    n: 1,
    label: 'Why',
    title: 'What we are building',
    tag: 'Motivation',
    mode: 'overview',
    wordIds: ['redis', 'slug', 'production'],
    lead: 'This site shows “11 views” on Build Notes. That number has to live somewhere — we put it in Redis.',
    paragraphs: [
      'Kid version: each storybook has a visit counter on the cover. When someone opens the book on the real shelf (the live site), the counter ticks up. When you look at the shelf list, you see every book’s number.',
      'Adult version: a view counter is one integer per page. We tried Postgres/Supabase first; writes could climb while the list still showed 0 because reads were blocked. Redis is simpler for hot tiny counters.',
      'Guillermo Rauch’s blog (rauchg.com) stores views in a Redis HASH. This site does the same idea with Upstash. Supabase still handles audio/media — Redis only counts views.',
    ],
    remember: [
      'Goal: show how many times each note was opened.',
      'Redis = fast notebook for small numbers.',
      'Live site counts; local writing usually does not auto +1.',
    ],
    hops: [
      {
        from: 'Need',
        to: 'Design',
        via: '“N views”',
        detail: 'Kid: counters on books. Adult: same number on list + post after refresh.',
      },
      {
        from: 'Design',
        to: 'Redis HASH views',
        via: 'field = slug',
        detail: 'Kid: one folder of stickers. Adult: one hash, many note fields.',
      },
      {
        from: 'Redis',
        to: 'UI',
        via: 'our API only',
        detail: 'Kid: visitors don’t touch the notebook — a librarian (API) does. Adult: browser → /api/views → Redis.',
      },
    ],
  },
  {
    id: 'words',
    n: 2,
    label: 'Words',
    title: 'Hard words in kid version',
    tag: 'Glossary',
    mode: 'words',
    wordIds: [
      'slug',
      'hash',
      'key',
      'field',
      'value',
      'hincrby',
      'hget',
      'hgetall',
      'post',
      'get',
      'api',
      'atomic',
      'upstash',
      'redis',
      'production',
    ],
    lead: 'If a word feels scary, read the kid line first — then the adult meaning. Same trick as Docker in Kid Version.',
    paragraphs: [
      'slug — Kid: the short nickname in the URL. Adult: supercage in /insights/notes/supercage. We reuse that nickname as the Redis field so URL and counter stay tied together.',
      'HASH / key / field / value — Kid: a folder (key views) full of stickers (fields) with numbers (values). Adult: Redis hash type; HGETALL dumps the folder.',
      'HINCRBY — Kid: add one to this sticker. Adult: Hash INCrement BY; atomic +1. HGET reads one sticker; HGETALL reads all.',
      'GET vs POST — Kid: GET = ask; POST = change. Adult: list page GETs counts; opening a note POSTs to bump.',
      'API / Upstash / production — Kid: a door on our server; Redis-over-HTTPS; the real website. Adult: /api/views/*, REST Redis client, import.meta.dev skips auto count.',
    ],
    remember: [
      'Always pair: scary word → kid picture → adult meaning.',
      'slug links URL ↔ Redis field.',
      'HINCRBY writes; HGETALL reads the scoreboard.',
    ],
  },
  {
    id: 'hash',
    n: 3,
    label: 'HASH',
    title: 'The views folder (HASH)',
    tag: 'Data shape',
    mode: 'hash',
    wordIds: ['hash', 'key', 'field', 'value', 'slug', 'hgetall'],
    lead: 'One Redis HASH named views. Inside: stickers labeled with each note’s slug.',
    paragraphs: [
      'Kid version: imagine a folder titled views. Inside are stickers: supercage → 11, database-lab → 7, redis-views → 1. You do not make a separate notebook per story — one folder holds every counter.',
      'Adult version: we avoid SET supercage 11. We use a HASH so one HGETALL feeds the whole Build Notes index, and one HINCRBY updates a single note. Rauch’s blog uses the same pattern: HINCRBY views <id> 1.',
      'The left board is that folder drawn as a table. field column = slug. value column = count.',
    ],
    command: 'HGETALL views',
    remember: [
      'key = views (folder name)',
      'field = slug (sticker label)',
      'value = count (number on the sticker)',
    ],
    code: {
      file: 'server/utils/views.ts',
      lines: `const VIEWS_HASH = 'views';
// HGETALL views
// HGET views supercage
// HINCRBY views supercage 1`,
    },
    hops: [
      {
        from: 'Redis',
        to: 'key “views”',
        via: 'HASH',
        detail: 'Kid: open the views folder. Adult: hash key, not a plain string key.',
      },
      {
        from: 'views',
        to: 'field “supercage”',
        via: 'slug',
        detail: 'Kid: find the sticker named supercage. Adult: must match buildNotes + the page route.',
      },
      {
        from: 'field',
        to: 'value 11',
        via: 'integer',
        detail: 'Kid: the number on the sticker. Adult: what NoteViews shows as 11 or “11 views”.',
      },
    ],
  },
  {
    id: 'write',
    n: 4,
    label: 'Write',
    title: 'Someone visited — HINCRBY',
    tag: 'Increment',
    mode: 'write',
    wordIds: ['hincrby', 'post', 'slug', 'atomic', 'production', 'api'],
    lead: 'Follow FROM → TO. Opening a note on the live site asks Redis to add one.',
    paragraphs: [
      'Kid version: open a storybook on the real shelf → librarian hears “+1 please” → finds that book’s sticker → adds one → tells the cover the new number.',
      'Adult step-through: InsightsReadingShell → useRecordNoteView() (production only) → POST /api/views/:slug → assertNoteSlug → redis.hincrby("views", slug, 1) → JSON back into useState → NoteViews updates.',
      'HINCRBY is atomic: two visitors cannot both turn 10 into 11. Local npm run dev skips the automatic POST so drafting does not fake popularity — you can still curl POST to test Redis.',
    ],
    command: 'HINCRBY views supercage 1',
    remember: [
      'POST = please change (bump).',
      'HINCRBY = add N to this field.',
      'Production auto-counts; dev does not.',
    ],
    code: {
      file: 'composables/useNoteViews.ts + server/utils/views.ts',
      lines: `await $fetch('/api/views/' + slug, { method: 'POST' });
// server:
await redis.hincrby('views', slug, 1);`,
    },
    hops: writeHops,
  },
  {
    id: 'read',
    n: 5,
    label: 'Read',
    title: 'Refresh the list — HGETALL',
    tag: 'Display',
    mode: 'read',
    wordIds: ['hgetall', 'hget', 'get', 'slug'],
    lead: 'Refresh must not invent numbers. It only asks Redis what it already knows.',
    paragraphs: [
      'Kid version: look at the shelf. Ask the librarian for every sticker’s number. Do not add a visit just by looking.',
      'Adult version: NoteViews share useAllNoteViews() → GET /api/views → HGETALL views → paint counts[slug]. Single-note GET /api/views/:slug can HGET one field; the list prefers HGETALL to avoid N trips.',
      'Old bug lesson: if writes work but reads return {}, click-into-note then back looks fine (memory) while hard refresh shows 0. Redis HGETALL keeps refresh honest.',
    ],
    command: 'HGETALL views',
    remember: [
      'GET = ask only.',
      'HGETALL = whole scoreboard.',
      'HGET = one note’s count.',
    ],
    code: {
      file: 'server/api/views/index.get.ts',
      lines: `const views = await getViewCounts(); // HGETALL
return { views, formatted };`,
    },
    hops: readHops,
  },
  {
    id: 'files',
    n: 6,
    label: 'Files',
    title: 'Which file is which hop',
    tag: 'Code tour',
    mode: 'files',
    wordIds: ['api', 'slug', 'redis'],
    lead: 'Future-you map: open these files in order when you forget.',
    paragraphs: [
      'Kid version: cover sticker UI → messenger (composable) → doors (API) → notebook helpers (views.ts) → notebook key (redis.ts).',
      'UI: NoteViews.vue shows the number. useNoteViews.ts GETs/POSTs. InsightsReadingShell.vue starts recording on note pages.',
      'Server: views/index.get.ts (HGETALL), views/[slug].post.ts (HINCRBY), views/[slug].get.ts (HGET). redis.ts builds the client; server utils/views.ts runs the commands. data/buildNotes.ts is the allow-list of slugs.',
    ],
    remember: [
      'Shell starts the visit.',
      'Composable talks to /api/views.',
      'server/utils/views.ts talks to Redis.',
    ],
    hops: [
      {
        from: 'NoteViews.vue',
        to: 'useNoteViews()',
        via: 'slug prop',
        detail: 'Kid: show the number. Adult: display only.',
      },
      {
        from: 'useNoteViews.ts',
        to: '/api/views',
        via: 'fetch',
        detail: 'Kid: knock on the door. Adult: browser/server boundary.',
      },
      {
        from: 'server/api/views/*',
        to: 'server/utils/views.ts',
        via: 'handlers',
        detail: 'Kid: librarian checks the nickname then opens the folder.',
      },
      {
        from: 'server/utils/redis.ts',
        to: 'Upstash',
        via: 'URL + token',
        detail: 'Kid: address of the magical notebook. Adult: REST Redis env.',
      },
    ],
    code: {
      file: 'project layout',
      lines: `component/NoteViews.vue
composables/useNoteViews.ts
server/api/views/*
server/utils/redis.ts
server/utils/views.ts`,
    },
  },
  {
    id: 'upstash',
    n: 7,
    label: 'Upstash',
    title: 'Redis over HTTPS',
    tag: 'Hosting',
    mode: 'upstash',
    wordIds: ['upstash', 'redis', 'hincrby', 'production'],
    lead: 'Classic Redis likes a phone line (TCP). Serverless likes short web calls (HTTPS).',
    paragraphs: [
      'Kid version: instead of a special phone to the notebook, we send letters over the normal internet. Upstash reads the letter “HINCRBY…” and updates the sticker.',
      'Adult version: @upstash/redis + UPSTASH_REDIS_REST_URL / TOKEN (or Vercel KV’s KV_REST_API_*). Same mental model as redis-cli; transport is REST.',
      'Test locally: curl -X POST http://localhost:3000/api/views/supercage then curl http://localhost:3000/api/views. Put the same env on Vercel for production.',
    ],
    remember: [
      'Upstash = Redis commands over HTTPS.',
      'Env URL + token required.',
      'curl proves the path before you trust deploy.',
    ],
    code: {
      file: 'server/utils/redis.ts',
      lines: `new Redis({
  url: config.kvRestApiUrl,
  token: config.kvRestApiToken,
});`,
    },
    hops: [
      {
        from: 'Nuxt server',
        to: 'Upstash REST',
        via: 'HTTPS',
        detail: 'Kid: send the letter. Adult: HTTP call encoding HINCRBY / HGETALL.',
      },
      {
        from: 'Upstash',
        to: 'Redis engine',
        via: 'managed',
        detail: 'Kid: the real notebook inside. Adult: still a Redis hash.',
      },
      {
        from: '.env / Vercel',
        to: 'useRedis()',
        via: 'runtimeConfig',
        detail: 'Kid: without the address, counts stay 0. Adult: missing env → null client.',
      },
    ],
  },
];

export function wordsForLesson(lesson: RedisLesson): RedisWord[] {
  return lesson.wordIds
    .map((id) => redisWords[id])
    .filter((w): w is RedisWord => Boolean(w));
}

export function lessonById(id: RedisLessonId) {
  return redisLessons.find((l) => l.id === id) ?? redisLessons[0]!;
}

export function neighborLessons(id: RedisLessonId) {
  const i = redisLessons.findIndex((l) => l.id === id);
  return {
    prev: i > 0 ? redisLessons[i - 1] : null,
    next: i >= 0 && i < redisLessons.length - 1 ? redisLessons[i + 1] : null,
  };
}
