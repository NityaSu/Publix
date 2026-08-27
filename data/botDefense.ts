export type BotKind = 'human' | 'goodbot' | 'scraper' | 'stuffing' | 'ai_crawler';

export interface BotRequest {
  id: string;
  kind: BotKind;
  path: string;
  ip: string;
  ua: string;
  rps: number;
  score: number;
  note: string;
}

export interface BotStep {
  label: string;
  title: string;
  text: string;
  sql: string;
  insight: string;
  hint: string;
  nextLabel: string;
  /** Which request ids pulse this step */
  focus: string[];
}

export interface BotDefense {
  id: 'waf' | 'rate' | 'botmg' | 'turnstile';
  label: string;
  blurb: string;
}

export interface BotQuiz {
  q: string;
  options: string[];
  answer: string;
  explain: string;
}

export const BOT_KIND_META: Record<
  BotKind,
  { label: string; color: string; action: 'allow' | 'challenge' | 'block' }
> = {
  human: { label: 'Human', color: '#4A9EFF', action: 'allow' },
  goodbot: { label: 'Good bot', color: '#10b981', action: 'allow' },
  scraper: { label: 'Scraper', color: '#e6a817', action: 'block' },
  stuffing: { label: 'Credential stuffing', color: '#c0392b', action: 'block' },
  ai_crawler: { label: 'Aggressive AI crawl', color: '#7B2D8E', action: 'challenge' },
};

export const botRequests: BotRequest[] = [
  {
    id: 'r1',
    kind: 'human',
    path: 'GET /events/jazz',
    ip: '203.0.113.10',
    ua: 'Chrome/128',
    rps: 0.4,
    score: 4,
    note: 'Steady browsing, cookies, TLS fingerprint looks like a real browser.',
  },
  {
    id: 'r2',
    kind: 'goodbot',
    path: 'GET /robots.txt',
    ip: '66.249.66.1',
    ua: 'Googlebot',
    rps: 1.2,
    score: 8,
    note: 'Verified search crawler. You usually want this allowed (or gently rate-limited).',
  },
  {
    id: 'r3',
    kind: 'scraper',
    path: 'GET /api/prices',
    ip: '198.51.100.44',
    ua: 'python-requests/2.31',
    rps: 40,
    score: 92,
    note: 'Scripted UA, high RPS, hits only the money endpoint.',
  },
  {
    id: 'r4',
    kind: 'stuffing',
    path: 'POST /login',
    ip: '198.51.100.88',
    ua: 'Go-http-client/1.1',
    rps: 120,
    score: 98,
    note: 'Password spray across many emails from one subnet.',
  },
  {
    id: 'r5',
    kind: 'ai_crawler',
    path: 'GET /docs/*',
    ip: '203.0.113.200',
    ua: 'FriendlyAI/1.0',
    rps: 25,
    score: 70,
    note: 'Claims to be helpful; ignores crawl-delay; drains bandwidth.',
  },
  {
    id: 'r6',
    kind: 'human',
    path: 'POST /checkout',
    ip: '203.0.113.11',
    ua: 'Safari/17',
    rps: 0.2,
    score: 6,
    note: 'Low rate, prior session, completes Turnstile if asked.',
  },
];

export const botSteps: BotStep[] = [
  {
    label: 'Step 1: Not all traffic is a customer',
    title: 'The public edge sees humans and machines',
    text: 'Your site receives real users, search crawlers, scrapers, credential-stuffing bots, and AI fetchers. “Bots fighting the site” is already true — volume and sophistication keep rising, especially around logins, inventory, and content APIs.',
    sql: `<span class="sql-kw">-- traffic mix (typical public site)</span>
humans          ~ allow
verified crawlers ~ allow / soft limit
scrapers        ~ block or challenge
stuffing        ~ block + alert
ai crawlers     ~ policy (allow / challenge / block)`,
    insight:
      '<strong>You were right:</strong> more automation hits the edge every year. Strong backends design for abuse the same day they design the happy path.',
    hint: 'Look at the request cards. Sort them by intent before you reach for a tool.',
    nextLabel: 'Read the signals',
    focus: ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'],
  },
  {
    label: 'Step 2: Signals, not vibes',
    title: 'How the edge scores a request',
    text: 'Bot systems combine signals: IP reputation, ASN, TLS/JA3 fingerprints, User-Agent, cookie/js challenges, path sensitivity, and request rate. A single header lie is cheap. A stack of weak signals is expensive to fake.',
    sql: `<span class="sql-kw">score</span> ≈ reputation
       + fingerprint oddity
       + rate on sensitive paths
       + challenge failure
<span class="sql-kw">action</span> = allow | challenge | block`,
    insight:
      '<strong>Cloudflare-shaped stack:</strong> WAF rules, rate limiting, Bot Management scores, Turnstile challenges — layered, not one magic toggle.',
    hint: 'Compare python-requests at 40 rps on /api/prices vs Chrome at 0.4 rps on /events.',
    nextLabel: 'Pick an action',
    focus: ['r3', 'r4'],
  },
  {
    label: 'Step 3: Allow / Challenge / Block',
    title: 'Match the tool to the risk',
    text: 'Allow good traffic. Challenge suspicious browsers (Turnstile / JS). Block clear abuse (WAF + rate limit + bot score). Over-blocking search bots hurts SEO; under-blocking stuffing burns accounts.',
    sql: `<span class="sql-kw"># mental model (Cloudflare)</span>
WAF            → known bad patterns
Rate limiting  → burst control on /login, /api/*
Bot Management → score + verified bots
Turnstile      → prove “likely human” on forms`,
    insight:
      '<strong>Backend tie-in:</strong> even with Cloudflare, your API still needs idempotency, lockouts, and audit logs. Edge filters volume; app logic protects truth.',
    hint: 'In Practice, toggle defenses and watch allow/challenge/block counts change.',
    nextLabel: 'Good bots matter',
    focus: ['r2', 'r5', 'r6'],
  },
  {
    label: 'Step 4: Policy for “friendly” machines',
    title: 'Verified bots vs noisy AI crawlers',
    text: 'Googlebot verified by reverse DNS is usually welcome. Random “FriendlyAI” hammering /docs may need robots.txt, crawl rules, authentication on private docs, or a challenge. The future is not “no bots” — it is explicit policy per bot class.',
    sql: `<span class="sql-kw">User-agent:</span> *
<span class="sql-kw">Crawl-delay:</span> 10
<span class="sql-kw">Disallow:</span> /api/
<span class="sql-kw">Disallow:</span> /admin/

<span class="sql-com"># + edge rules for unverified high-rate crawlers</span>`,
    insight:
      '<strong>Career angle:</strong> edge/security instincts (Cloudflare, rate limits, auth abuse) pair well with backend + DB design. Few juniors practice both.',
    hint: 'Practice mode: turn defenses on/off and classify each request yourself.',
    nextLabel: 'Go to Practice',
    focus: ['r2', 'r5'],
  },
];

export const botDefenses: BotDefense[] = [
  { id: 'waf', label: 'WAF rules', blurb: 'Block known bad patterns & paths' },
  { id: 'rate', label: 'Rate limit', blurb: 'Cap bursts on /login and /api/*' },
  { id: 'botmg', label: 'Bot score', blurb: 'Score automation; block high risk' },
  { id: 'turnstile', label: 'Turnstile', blurb: 'Challenge suspicious form posts' },
];

export const botQuizzes: BotQuiz[] = [
  {
    q: 'Why will “bots vs sites” keep growing?',
    options: [
      'Browsers will disappear',
      'Automation is cheap; scrapers, stuffing, and AI crawlers scale',
      'DNS no longer works',
      'SQL cannot store bots',
    ],
    answer: 'Automation is cheap; scrapers, stuffing, and AI crawlers scale',
    explain: 'Attackers and crawlers automate. Defenses must become policy, not one-off bans.',
  },
  {
    q: 'Best first action on credential stuffing against /login?',
    options: [
      'Delete the users table',
      'Rate limit + bot score/block + app lockouts',
      'Allow all and hope',
      'Only change the button color',
    ],
    answer: 'Rate limit + bot score/block + app lockouts',
    explain: 'Edge slows/stops the spray; the app still must lock accounts and alert.',
  },
  {
    q: 'Why not block every bot?',
    options: [
      'Bots are illegal to block',
      'Verified crawlers (search, monitors) are often wanted',
      'WAF cannot block POST',
      'Humans never use APIs',
    ],
    answer: 'Verified crawlers (search, monitors) are often wanted',
    explain: 'Policy is allow / challenge / block by class — not a blanket ban.',
  },
  {
    q: 'Turnstile is mainly for…',
    options: [
      'Replacing your database',
      'Challenging likely-automated clients on sensitive actions',
      'Speeding up Postgres joins',
      'Storing JWT secrets',
    ],
    answer: 'Challenging likely-automated clients on sensitive actions',
    explain: 'It raises the cost of automation on forms/checkouts without a hard block of every visitor.',
  },
];

/** Decide edge action given active defenses. */
export function decideBotAction(
  req: BotRequest,
  on: Record<BotDefense['id'], boolean>,
): 'allow' | 'challenge' | 'block' {
  const meta = BOT_KIND_META[req.kind];

  if (req.kind === 'human') {
    if (on.turnstile && req.path.startsWith('POST') && req.score > 5) return 'challenge';
    return 'allow';
  }
  if (req.kind === 'goodbot') {
    if (on.rate && req.rps > 50) return 'challenge';
    return 'allow';
  }
  if (req.kind === 'stuffing') {
    if (on.botmg || on.rate || on.waf) return 'block';
    return 'allow';
  }
  if (req.kind === 'scraper') {
    if (on.botmg || on.waf) return 'block';
    if (on.rate && req.rps > 10) return 'challenge';
    return 'allow';
  }
  // ai_crawler
  if (on.botmg && req.score >= 60) return 'challenge';
  if (on.rate && req.rps > 15) return 'challenge';
  if (on.waf && req.path.includes('/docs')) return 'challenge';
  return meta.action === 'block' ? 'allow' : 'allow';
}
