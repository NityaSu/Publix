# Publix

Personal site of Nitya Suon — a portfolio plus a set of interactive engineering notes.

The portfolio part is normal: home, about, projects, contact. The `/insights` part is the bigger half. Each note there is a small interactive app instead of a blog post, so you click, play, and change things to learn the idea. New notes get added over time.

Built with Nuxt 4, Vue 3, Tailwind, and a Nitro server on top of Supabase, Upstash Redis, and Resend. Deployed on Vercel.

## Notable pieces

- **Private media proxy** (`server/api/media/[...path].ts`, `server/api/listen/[slug].ts`) — images, video, and audio sit in private Supabase buckets. The browser only sees `/api/media/...`, never a Supabase URL or the service key. `Range` headers are passed through so audio and video can seek.
- **View counts on Redis** (`server/utils/views.ts`) — one Redis hash, `HINCRBY` per production visit. Dev visits don't count, and a missing Redis config falls back to 0 instead of erroring.
- **Draft gate** (`server/middleware/draft-notes.ts`) — unfinished notes 404 in production unless the URL has the right secret key, which then sets a cookie.
- **Read-along audio** (`component/ReadAlongText.vue`) — word timings come from forced alignment, so the text highlights in sync with the narration.
- **Contact form** (`server/api/contact.post.ts`) — honeypot field, per-IP rate limit, and input validation before sending through Resend.

## Structure

```
component/    Vue components — most are the interactive note UIs
composables/  Shared state (reading mode, split view, view counts)
data/         Content as typed TS files (note registry, lessons, projects)
pages/        Routes; /insights/notes/<slug> is one page per note
server/       API routes, draft middleware, Supabase + Redis helpers
scripts/      Media upload, audio alignment
```

To add a note: add an entry to `data/buildNotes.ts` and a page at `pages/insights/notes/<slug>.vue`.

## Running locally

Needs Node 20+.

```bash
npm install
cp .env.example .env   # fill in the values
npm run dev            # http://localhost:3000
```

It runs with no env vars, but media 404s, view counts show 0, and the contact form is off.

| Variable | Used for |
| --- | --- |
| `SUPABASE_URL`, `SUPABASE_KEY` | Images, video, audio |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | View counts |
| `DRAFT_SECRET` | Access to draft notes |
| `RESEND_API_KEY` | Contact form email |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm run preview` | Build and preview |
| `npm run upload:media` | Upload `public/assets/**` to Supabase |
| `npm run align:whisperx -- <file.mp3>` | Make word timings for read-along |

## Deployment

Vercel with the default Nuxt preset. Set the same env vars there, and create two private Supabase buckets: `blog-audio` for MP3s and `site-media` for everything else.
