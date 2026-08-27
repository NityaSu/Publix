export type RateIpId = 'you' | 'bot';

export interface RateRequestEvent {
  id: string;
  ip: RateIpId;
  t: number; // seconds into the demo minute 0–60
  path: string;
}

/** Scripted minute: you browse calmly; bot sprays views. */
export const rateScript: RateRequestEvent[] = [
  { id: 'y1', ip: 'you', t: 2, path: 'POST /api/views/rate-limit' },
  { id: 'y2', ip: 'you', t: 9, path: 'GET /insights/notes/rate-limit' },
  { id: 'y3', ip: 'you', t: 18, path: 'POST /api/views/rate-limit' },
  { id: 'y4', ip: 'you', t: 31, path: 'POST /api/views/docker-for-kids' },
  { id: 'y5', ip: 'you', t: 44, path: 'GET /insights/notes' },
  { id: 'b1', ip: 'bot', t: 12, path: 'POST /api/views/rate-limit' },
  { id: 'b2', ip: 'bot', t: 12.2, path: 'POST /api/views/rate-limit' },
  { id: 'b3', ip: 'bot', t: 12.4, path: 'POST /api/views/rate-limit' },
  { id: 'b4', ip: 'bot', t: 12.6, path: 'POST /api/views/rate-limit' },
  { id: 'b5', ip: 'bot', t: 12.8, path: 'POST /api/views/rate-limit' },
  { id: 'b6', ip: 'bot', t: 13.0, path: 'POST /api/views/rate-limit' },
  { id: 'b7', ip: 'bot', t: 13.2, path: 'POST /api/views/rate-limit' },
  { id: 'b8', ip: 'bot', t: 13.4, path: 'POST /api/views/rate-limit' },
  { id: 'b9', ip: 'bot', t: 13.6, path: 'POST /api/views/rate-limit' },
  { id: 'b10', ip: 'bot', t: 13.8, path: 'POST /api/views/rate-limit' },
  { id: 'b11', ip: 'bot', t: 14.0, path: 'POST /api/views/rate-limit' },
  { id: 'b12', ip: 'bot', t: 14.2, path: 'POST /api/views/rate-limit' },
  { id: 'b13', ip: 'bot', t: 25, path: 'POST /api/views/rate-limit' },
  { id: 'b14', ip: 'bot', t: 25.15, path: 'POST /api/views/rate-limit' },
  { id: 'b15', ip: 'bot', t: 40, path: 'POST /login' },
  { id: 'b16', ip: 'bot', t: 40.1, path: 'POST /login' },
  { id: 'b17', ip: 'bot', t: 40.2, path: 'POST /login' },
];

export const rateIpMeta: Record<
  RateIpId,
  { label: string; ip: string; color: string }
> = {
  you: { label: 'You', ip: '203.0.113.10', color: '#4A9EFF' },
  bot: { label: 'Abusive bot', ip: '198.51.100.66', color: '#c0392b' },
};

export interface RateScene {
  id: string;
  kicker: string;
  title: string;
  body: string;
  tip: string;
}

export const rateScenes: RateScene[] = [
  {
    id: 'door',
    kicker: 'Scene 1 · The rule',
    title: 'A door that only stamps 10 tickets per IP each minute',
    body: 'Rate limit = “how many requests may this identity make in this window?” The classic starter rule: 10 requests per minute per IP. Under the limit → 200. Over → 429 Too Many Requests.',
    tip: 'Press Play. Watch your calm browsing vs a bot spray on the same door.',
  },
  {
    id: 'window',
    kicker: 'Scene 2 · The window',
    title: 'Fixed window: the counter resets when the minute ends',
    body: 'Imagine a stamp book that starts empty at :00. Each allowed request adds a stamp. At :60 the book is torn up and a fresh one starts. Simple to explain. (Real systems also use sliding windows / token buckets — same idea, smoother edges.)',
    tip: 'The ring is one minute. Stamps fill as requests land. When it hits your limit, new stamps bounce as 429.',
  },
  {
    id: 'per-ip',
    kicker: 'Scene 3 · Per IP',
    title: 'Limits are counted separately for each IP',
    body: 'Your laptop at 203.0.113.10 has its own 10 stamps. The bot at 198.51.100.66 has another 10. You cannot “use up” each other’s budget — that is why per-IP (or per-user) matters.',
    tip: 'Two lanes, two counters. Only the bot lane trips the alarm.',
  },
  {
    id: 'dial',
    kicker: 'Scene 4 · Set the number',
    title: 'Pick a limit that fits the endpoint',
    body: 'View counters and public GETs can be generous. Login and checkout should be strict. Too low → angry humans. Too high → stuffing still works. Start from the abuse story, then tune.',
    tip: 'Drag the dial. Replay. See how many bot hits flip to 429.',
  },
  {
    id: 'real',
    kicker: 'Scene 5 · Real config',
    title: 'Say it in English, then in code',
    body: 'English: “On POST /api/views/*, allow 10 requests per IP per 60 seconds; otherwise return 429.” Below: the same idea as a Cloudflare-style rule and a tiny Redis counter sketch — what you would put in front of this site’s view endpoint.',
    tip: 'Copy the mental model, not the exact vendor syntax. Vendors differ; the rule does not.',
  },
];

export const rateConfigs = {
  english: `On POST /api/views/*
  identity: client IP
  limit: 10
  window: 60 seconds
  over limit → HTTP 429`,
  cloudflare: `# Cloudflare Rate limiting rule (shape)
If: http.request.uri.path contains "/api/views"
And: rate(10 / 1 minute) by ip.src
Then: Block / Challenge
Response: 429`,
  redis: `key = "rl:" + ip + ":" + minuteBucket
n = INCR key
IF n == 1: EXPIRE key 60
IF n > 10: return 429
ELSE: handle request`,
};

export const rateQuiz = [
  {
    q: 'What does “10 req/min per IP” mean?',
    options: [
      'The whole site only gets 10 requests ever',
      'Each IP may send 10 requests inside a 60s window',
      'Only bots are limited to 10',
      'Postgres can store 10 rows',
    ],
    answer: 'Each IP may send 10 requests inside a 60s window',
    explain: 'Identity × window × count. Different IPs have separate budgets.',
  },
  {
    q: 'What status should you return when over the limit?',
    options: ['200 OK', '301 Redirect', '429 Too Many Requests', '500 Server Error'],
    answer: '429 Too Many Requests',
    explain: '429 tells the client (and honest bots) to slow down.',
  },
  {
    q: 'Best place for a starter limit on this personal site?',
    options: [
      'Every image file',
      'Write endpoints like POST /api/views/:slug',
      'Only the About page HTML',
      'DNS records',
    ],
    answer: 'Write endpoints like POST /api/views/:slug',
    explain: 'Public reads are cheap; increments and logins are where abuse burns quota.',
  },
];
