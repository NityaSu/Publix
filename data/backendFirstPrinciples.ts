export type ClusterId = 'wire' | 'gate' | 'surface' | 'core' | 'async' | 'keep';

export interface Cluster {
  id: ClusterId;
  label: string;
  blurb: string;
  x: number;
  y: number;
  rx: number;
  ry: number;
}

export interface LessonExample {
  method: string;
  path: string;
  goesTo: string;
  purpose: string;
  note?: string;
}

export type LessonBlock =
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'pre'; lines: string }
  | { type: 'table'; columns: string[]; rows: string[][] }
  | { type: 'hr' }
  | { type: 'kid'; text?: string; items?: string[] }
  | { type: 'callout'; lines: string[] };

export interface LessonSection {
  heading: string;
  body?: string[];
  kid?: string;
  table?: { term: string; here: string; kid: string }[];
  code?: { caption?: string; lines: string };
  examples?: LessonExample[];
  bullets?: string[];
  footer?: string[];
  blocks?: LessonBlock[];
}

export interface TopicNode {
  id: string;
  n: number;
  title: string;
  label: string;
  cluster: ClusterId;
  x: number;
  y: number;
  gist: string;
  remember: string[];
  sections?: LessonSection[];
}

export interface GraphEdge {
  from: string;
  to: string;
}

export const clusters: Cluster[] = [
  {
    id: 'wire',
    label: 'The wire',
    blurb: 'How a request even arrives, and how bytes become something I can work with.',
    x: 250,
    y: 210,
    rx: 250,
    ry: 175,
  },
  {
    id: 'gate',
    label: 'The gate',
    blurb: 'Who is this, is the input sane, and what am I allowed to do with it.',
    x: 720,
    y: 200,
    rx: 210,
    ry: 165,
  },
  {
    id: 'surface',
    label: 'The surface',
    blurb: 'The contract the rest of the world sees: resources, verbs, docs, callbacks.',
    x: 1180,
    y: 210,
    rx: 240,
    ry: 175,
  },
  {
    id: 'core',
    label: 'The core',
    blurb: 'Business rules and the places truth lives — plus the shortcuts around them.',
    x: 280,
    y: 680,
    rx: 260,
    ry: 185,
  },
  {
    id: 'async',
    label: 'The wait',
    blurb: 'Work that must not block the request: jobs, mail, live push.',
    x: 720,
    y: 690,
    rx: 200,
    ry: 165,
  },
  {
    id: 'keep',
    label: 'Keep-alive',
    blurb: 'Everything that keeps a backend honest after it ships.',
    x: 1180,
    y: 690,
    rx: 250,
    ry: 200,
  },
];

export const topics: TopicNode[] = [
  {
    id: 'high-level',
    n: 1,
    title: 'High-level understanding',
    label: 'High-level',
    cluster: 'wire',
    x: 110,
    y: 95,
    gist: 'A backend is not “CRUD in a framework.” It is a machine that takes a request from somewhere in the world, does work without lying, and answers in a way another machine can trust.',
    remember: [
      'Browser → DNS → edge/WAF → load balancer → app → data stores → response.',
      'The job is reliable, scalable, fault-tolerant, maintainable — not just “it returned 200 once.”',
      'Language and framework are clothes. The hops and failure modes are the body.',
    ],
  },
  {
    id: 'http',
    n: 2,
    title: 'HTTP protocol',
    label: 'HTTP',
    cluster: 'wire',
    x: 270,
    y: 70,
    gist: 'HTTP is the shared language. If I do not know the message shape, I am guessing at APIs.',
    remember: [
      'Raw message: start line, headers, optional body. Methods carry meaning (GET safe, POST not).',
      'Header families: request, representation, general, security. CORS preflight is a real extra round trip.',
      'Status codes are a contract. Caching (ETag, max-age), compression, HTTP/1.1 vs 2 vs 3, TLS — all HTTP-shaped.',
    ],
  },
  {
    id: 'routing',
    n: 3,
    title: 'What is Routing in Backend? How Requests Find Their Way Home',
    label: 'Routing',
    cluster: 'wire',
    x: 400,
    y: 140,
    gist: 'Routing = map (method + path) → one handler method (business logic). Method is the what. Path is the where.',
    remember: [
      'HTTP method = intent. URL path = resource. Together they pick one handler.',
      'Static route when the target never changes. Dynamic route when it changes per request.',
      'Controller owns the routes. Handler is one route’s method. Fetch is just the job of a GET /{id} handler.',
    ],
    sections: [
      {
        heading: '1. What is Routing?',
        blocks: [
          { type: 'h3', text: 'Core idea' },
          {
            type: 'ul',
            items: [
              '**HTTP method** = the *what* (intent): read, create, update, delete. The `method` tells the server your *purpose*: “I want to read,” “I want to create,” “I want to change,” or “I want to delete.”',
              '**URL path** = the *where* (resource), **Resource** = the *thing* you care about (addresses, bids, products…).',
              '**Routing** = map `(method + path)` → one **handler method** (business logic)',
            ],
          },
          { type: 'p', text: 'In backend talk, “**intent**” just means:' },
          { type: 'quote', text: 'What is the client *trying* to do with this request?' },
          { type: 'p', text: 'So in:' },
          { type: 'quote', text: 'HTTP method = the what (**intent**)' },
          { type: 'p', text: 'it means the method shows the request’s **intention**: read, create, update, or delete.' },
          {
            type: 'pre',
            lines: 'GET  /api/books     → `intent` = "show me all books"     (read)\nPOST /api/books     → `intent` = "add a new book"         (create)\nDELETE /api/books/5 → `intent` = "remove book #5"         (remove)',
          },
        ],
      },
      {
        heading: '2. Types of routes',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Static Routes — use when the target never changes.**',
              '**Dynamic Routes — use when the target changes per request**',
            ],
          },
          { type: 'p', text: 'Example:' },
          {
            type: 'pre',
            lines: 'Static:  kimichat.com/settings      → same page, everyone sees their own settings\nStatic:  kimichat.com/pricing       → same marketing page for all visitors\nDynamic: kimichat.com/chat/abc123   → YOUR conversation about backend engineering\nDynamic: kimichat.com/chat/def456   → YOUR conversation about cooking recipes',
          },
          {
            type: 'table',
            columns: ['Route type', 'Example URL', 'What happens'],
            rows: [
              ['**Static**', '`/settings`', 'Same page for everyone — your profile settings'],
              ['**Static**', '`/help`', 'Same help center for every user'],
              ['**Dynamic**', '`/chat/abc123xyz`', '**This specific conversation** — the `:id` part changes per chat'],
              ['**Dynamic**', '`/chat/def456uvw`', '**A different conversation** — different ID, different messages'],
            ],
          },
          { type: 'hr' },
          { type: 'p', text: '`GET /p/biding/price/88` means:' },
          { type: 'quote', text: '“Please **read** the **bid record whose id is 88**.”' },
          { type: 'p', text: 'It does **not** place a bid. It only **fetches details** of one existing bid.' },
          { type: 'h3', text: 'Break the URL into pieces' },
          {
            type: 'table',
            columns: ['Part', 'Meaning'],
            rows: [
              ['`GET`', 'Intent = read / look up'],
              ['`/p/biding/price`', 'Go to the bidding-price area'],
              ['`/88`', 'The specific bid row id is `88`'],
            ],
          },
          { type: 'p', text: 'So `88` is like a ticket number for one bid in the database.' },
          { type: 'hr' },
          { type: 'h3', text: 'Quick decision tree' },
          {
            type: 'pre',
            lines: "Is the resource you're targeting the same for every request?\n│\n├── YES → Static route  (/health, /about, /login)\n│\n└── NO  → Dynamic route (/users/:id, /books/:bookId)",
          },
          { type: 'hr' },
          { type: 'p', text: '**Handler = in One word: fetch** (or **lookup**)' },
          {
            type: 'kid',
            items: [
              '**Controller** = the whole room (example: `BiddingPriceController`)',
              '**Handler** = one worker in that room (example: `getInfo(...)`)',
              '**Fetch / lookup** = what *that one worker* is doing right now',
            ],
          },
          {
            type: 'callout',
            lines: [
              '**Controller** owns the routes.',
              '**Handler** is one route’s method.',
              '**Fetch** is just the job of this specific GET /{id} handler.',
            ],
          },
          { type: 'p', text: 'This project is a **Gin (Go)** API. The map lives in `routers/`, the work lives in `handlers/`.' },
        ],
      },
    ],
  },

  {
    id: 'serde',
    n: 4,
    title: 'Serialization and deserialization',
    label: 'Serde',
    cluster: 'wire',
    x: 95,
    y: 250,
    gist: 'Native types ↔ bytes on the wire. This is where dates, nulls, and extra fields quietly corrupt truth.',
    remember: [
      'JSON is readable; Protobuf/binary is faster. Choose on inspectability vs size/CPU.',
      'Validate before you deserialize into domain objects — untrusted bytes are an attack surface.',
      'Dates, timezones, missing vs null vs omitted fields need an explicit policy, not luck.',
    ],
  },
  {
    id: 'middleware',
    n: 7,
    title: 'Middleware',
    label: 'Middleware',
    cluster: 'wire',
    x: 250,
    y: 355,
    gist: 'A pipeline around every request. Order is behavior. Fat middleware is a hidden god object.',
    remember: [
      'Typical order: log → auth → validate → handler → error. Swap it and you ship bugs.',
      'Use it for CORS, security headers, request IDs — not for core business rules.',
      'Keep each layer small. If it needs the whole domain, it is not middleware.',
    ],
  },
  {
    id: 'context',
    n: 8,
    title: 'Request context',
    label: 'Context',
    cluster: 'wire',
    x: 400,
    y: 280,
    gist: 'Per-request memory: who, what, which request. Not a global. Not a leftover from the previous caller.',
    remember: [
      'Carry method, path, headers, body, user, request ID through the stack.',
      'Request ID is how I stitch logs, traces, and errors into one story.',
      'Never stash request state on a singleton. Two concurrent requests will lie to each other.',
    ],
  },
  {
    id: 'auth',
    n: 5,
    title: 'Authentication and authorization',
    label: 'Auth',
    cluster: 'gate',
    x: 600,
    y: 85,
    gist: 'Authentication is who. Authorization is what they may do. Mixing them is how I accidentally ship admin to everyone.',
    remember: [
      'Stateful session vs stateless token (JWT). Cookies vs bearer. API keys for machines. MFA when the blast radius is high.',
      'Authz is resource + action + actor — not “they logged in.”',
      'Audit failed logins. CSRF, XSS, MITM are not optional footnotes.',
    ],
  },
  {
    id: 'validation',
    n: 6,
    title: 'Validation and transformation',
    label: 'Validation',
    cluster: 'gate',
    x: 840,
    y: 90,
    gist: 'The outside world sends strings. I decide what is legal, then I normalize it so the domain never sees garbage.',
    remember: [
      'Syntactic (shape), type (int not "abc"), semantic (age ≥ 0). All three, server-side.',
      'Client checks are UX. Server checks are security. Never skip the second.',
      'Transform: trim, lowercase email, parse numbers. Conditional rules (if married, partner name). Clear errors, no stack traces.',
    ],
  },
  {
    id: 'security',
    n: 22,
    title: 'Security',
    label: 'Security',
    cluster: 'gate',
    x: 720,
    y: 345,
    gist: 'Assume hostile input. Least privilege. Defense in depth — one missed check should not be the whole castle.',
    remember: [
      'Injection (SQL and NoSQL), XSS, CSRF. Validate, then deserialize, then query with binds.',
      'Secrets in config, not in git. HTTPS everywhere that leaves the box.',
      'Least privilege on DB roles, cloud IAM, and admin endpoints.',
    ],
  },
  {
    id: 'handlers',
    n: 9,
    title: 'Handlers, controllers, and services',
    label: 'Handlers',
    cluster: 'surface',
    x: 1040,
    y: 90,
    gist: 'The HTTP adapter is thin. The service owns the use-case. If the route file is 400 lines, the design already leaked.',
    remember: [
      'Handler: parse HTTP, call service, map result to status + body.',
      'Service/controller: the use-case. Domain stays here or below, not in Express/FastAPI decorators.',
      'Middleware can strip duplication (auth, IDs) so handlers stay boring.',
    ],
  },
  {
    id: 'crud',
    n: 10,
    title: 'CRUD',
    label: 'CRUD',
    cluster: 'surface',
    x: 1185,
    y: 70,
    gist: 'Create, read, update, delete mapped onto HTTP so clients can predict the machine.',
    remember: [
      'POST → 201 + Location. GET → 200. PUT/PATCH for replace vs partial. DELETE → 204 or 200.',
      'CRUD is the skeleton, not the product. Real backends have workflows, not just tables.',
      'Idempotency matters on writes that money or email can double.',
    ],
  },
  {
    id: 'rest',
    n: 11,
    title: 'REST and API shape',
    label: 'REST',
    cluster: 'surface',
    x: 1325,
    y: 125,
    gist: 'Resources and HTTP semantics, not “POST /doThing for everything.” Filtering, pagination, and versioning are part of the design.',
    remember: [
      'Nouns in paths, verbs in methods. Honor GET safety and cacheability.',
      'List endpoints need filter, sort, page/cursor. Unbounded lists are an outage.',
      'Versioning keeps old clients alive while the resource model evolves.',
    ],
  },
  {
    id: 'openapi',
    n: 29,
    title: 'OpenAPI',
    label: 'OpenAPI',
    cluster: 'surface',
    x: 1055,
    y: 330,
    gist: 'The contract written down: paths, schemas, auth, errors. Spec first, then code — or the docs will lie.',
    remember: [
      'Document request/response, params, components, security. Generate clients and UIs from it.',
      'API-first: agree the spec, then implement. Drift is the failure mode.',
      'Swagger/Postman are views of the same truth, not a second source.',
    ],
  },
  {
    id: 'webhooks',
    n: 30,
    title: 'Webhooks',
    label: 'Webhooks',
    cluster: 'surface',
    x: 1310,
    y: 325,
    gist: 'They call me. I do not poll them. That inverts trust: now I am the server on the other end of someone else’s retry loop.',
    remember: [
      'Push vs poll. URL + event + payload + signature. Answer 2xx fast, work later.',
      'Verify signatures. HTTPS. Retry with backoff. Make handlers idempotent — retries will happen.',
      'Log deliveries. A missed webhook is a silent business bug.',
    ],
  },
  {
    id: 'databases',
    n: 12,
    title: 'Databases',
    label: 'Databases',
    cluster: 'core',
    x: 280,
    y: 515,
    gist: 'Where truth is supposed to live. ACID vs “available and partitioned.” Schema, indexes, and migrations are the craft.',
    remember: [
      'Relational: transactions, joins, constraints. Document/KV: flexibility, different consistency story. CAP is a trade, not a slogan.',
      'Index what you query. Migrations are how schema changes without folklore.',
      'ORMs speed CRUD and hide N+1. Know the SQL. N+1 is a default bug.',
    ],
  },
  {
    id: 'bll',
    n: 13,
    title: 'Business logic layer',
    label: 'BLL',
    cluster: 'core',
    x: 120,
    y: 580,
    gist: 'Rules about the world (refunds, inventory, who may publish) do not belong in the route or the SQL string.',
    remember: [
      'Three layers: presentation (HTTP) → business → data access.',
      'SoC, SRP, open/closed, depend on abstractions — so I can test rules without spinning a server.',
      'Domain models (User, Order) plus services. Validation of meaning lives here; format checks can live at the gate.',
    ],
  },
  {
    id: 'caching',
    n: 14,
    title: 'Caching',
    label: 'Caching',
    cluster: 'core',
    x: 445,
    y: 575,
    gist: 'A cache is a lie I tell on purpose because the database is too slow or too hot. The hard part is when the lie goes stale.',
    remember: [
      'Layers: browser/HTTP, in-process memory, Redis, DB buffer. Different TTLs, different dangers.',
      'Patterns: cache-aside, write-through, write-behind. Evict with TTL, LRU, LFU.',
      'If I cannot name the invalidation rule, I should not cache it.',
    ],
  },
  {
    id: 'search',
    n: 17,
    title: 'Search indexes',
    label: 'Search',
    cluster: 'core',
    x: 145,
    y: 810,
    gist: 'Full-text and typeahead are a different data structure (inverted index), not `LIKE %foo%` on the primary DB.',
    remember: [
      'Inverted index: terms → documents. Good for search, logs, autocomplete — not the source of truth.',
      'Keep the primary store authoritative; the search cluster is a projection that can lag.',
      'If I treat search as my database, I will lose ACID and then a lawsuit.',
    ],
  },
  {
    id: 'objects',
    n: 25,
    title: 'Object storage and large files',
    label: 'Objects',
    cluster: 'core',
    x: 430,
    y: 815,
    gist: 'Blobs do not belong in Postgres. Stream them, sign the URL, process them off the request thread.',
    remember: [
      'Object store for images, video, dumps. DB holds metadata and keys.',
      'Signed URLs, content-type, size limits. Do not buffer a 2GB upload in RAM.',
      'Virus scan / transcode / thumbnail = background job, not the POST handler.',
    ],
  },
  {
    id: 'email',
    n: 15,
    title: 'Transactional email',
    label: 'Email',
    cluster: 'async',
    x: 600,
    y: 560,
    gist: 'Receipts, resets, “you signed up.” These are part of the product, but they are I/O to a flaky third party.',
    remember: [
      'Subject, body, CTA, unsubscribe/footer where required. Templates, not string soup.',
      'Send from a queue. A slow SMTP should not hold the HTTP connection.',
      'Idempotent sends. Bounce handling. Never log the full token in the reset link.',
    ],
  },
  {
    id: 'queue',
    n: 16,
    title: 'Task queuing and scheduling',
    label: 'Queues',
    cluster: 'async',
    x: 720,
    y: 830,
    gist: 'If it can fail, retry, or take more than a blink, it is a job. The request returns “accepted,” not “done.”',
    remember: [
      'Workers pull work. Retries + backoff. Dead-letter when poison.',
      'Idempotency keys so a double-publish does not double-charge.',
      'Schedulers (cron-like) for periodic work. Visibility timeout so a crashed worker does not lose the job forever.',
    ],
  },
  {
    id: 'realtime',
    n: 26,
    title: 'Realtime systems',
    label: 'Realtime',
    cluster: 'async',
    x: 850,
    y: 570,
    gist: 'Push when waiting for the next poll would feel like the product is dead. Different transport, same need for auth and fan-out.',
    remember: [
      'WebSockets, SSE, SSE vs WS: one-way stream vs duplex. Pub/sub behind them.',
      'Still authenticate. Still authorize per channel. Presence and fan-out are the expensive parts.',
      'Fall back to poll if the network is hostile. Do not pretend every client can hold a socket.',
    ],
  },
  {
    id: 'errors',
    n: 18,
    title: 'Error handling',
    label: 'Errors',
    cluster: 'keep',
    x: 1000,
    y: 525,
    gist: 'Fail in a way a human and a machine can both use. Swallowing an error is how production becomes folklore.',
    remember: [
      'Syntax vs runtime vs logic. Fail-fast when continuing would corrupt data; fail-safe when the user can continue.',
      'Typed errors. Map to HTTP statuses. Messages for users ≠ stack traces.',
      'Catch early, log with request ID, never empty `except:` / catch-all that returns 200.',
    ],
  },
  {
    id: 'config',
    n: 19,
    title: 'Config management',
    label: 'Config',
    cluster: 'keep',
    x: 1180,
    y: 500,
    gist: 'Code is the same in every environment. Config is what changes. Secrets are config that must not leak.',
    remember: [
      'Env for host-specific values. Feature flags for behavior I want to flip without a deploy.',
      'Static (DB URL) vs dynamic (rate limit, flag). Secrets from a vault/.env, never hardcoded.',
      'If I need a rebuild to change a URL, config leaked into code.',
    ],
  },
  {
    id: 'observe',
    n: 20,
    title: 'Logging, monitoring, observability',
    label: 'Observe',
    cluster: 'keep',
    x: 1355,
    y: 530,
    gist: 'Logs say what happened. Metrics say how it is doing. Traces say where the time went. Together they are how I debug a machine I cannot sit next to.',
    remember: [
      'Structured logs, levels, rotation. No passwords, tokens, or PII in log lines.',
      'RED/USE-ish metrics. Alerts on symptoms users feel — not on every blip (alert fatigue).',
      'Trace a request across services with one ID. Three pillars: logs, metrics, traces.',
    ],
  },
  {
    id: 'shutdown',
    n: 21,
    title: 'Graceful shutdown',
    label: 'Shutdown',
    cluster: 'keep',
    x: 1005,
    y: 670,
    gist: 'Deploys and scale-in kill processes. A rude kill drops in-flight writes. A polite one finishes them.',
    remember: [
      'SIGTERM → stop accepting → drain in-flight → close pools → exit.',
      'Load balancer health check must go unhealthy before the drain, or it keeps sending.',
      'Jobs: nack/return the message if you die mid-work.',
    ],
  },
  {
    id: 'scale',
    n: 23,
    title: 'Scaling and performance',
    label: 'Scale',
    cluster: 'keep',
    x: 1355,
    y: 670,
    gist: 'Measure first. Vertical until you cannot; horizontal when you must. Most “slow” is N+1, locks, or unbounded work.',
    remember: [
      'Latency, throughput, CPU, memory, IO. Find the bottleneck; do not sprinkle caches blindly.',
      'Horizontal: more instances behind a balancer. Stateless app servers make this possible.',
      'Fix N+1, add indexes, bound lists, lazy-load what you can. Then cache. Then shard.',
    ],
  },
  {
    id: 'concurrency',
    n: 24,
    title: 'Concurrency and parallelism',
    label: 'Concurrency',
    cluster: 'keep',
    x: 1015,
    y: 820,
    gist: 'Concurrency is many tasks in flight (good for I/O). Parallelism is many cores at once (good for CPU). Races do not care that I meant well.',
    remember: [
      'I/O-bound: async/await, event loop, connection pools. CPU-bound: workers/processes.',
      'Shared mutable state needs locks, queues, or immutability. Transactions are a concurrency tool.',
      'Idempotency + isolation levels: two requests, one row, one truth.',
    ],
  },
  {
    id: 'testing',
    n: 27,
    title: 'Testing and code quality',
    label: 'Testing',
    cluster: 'keep',
    x: 1180,
    y: 860,
    gist: 'Tests are how I change the system without being afraid. CI is how I refuse to merge hope.',
    remember: [
      'Unit (rules), integration (DB/HTTP), e2e (the product), plus load and security when the risk is real.',
      'TDD is a discipline, not a religion. Coverage is a hint, not a trophy.',
      'Automate in CI. A test that cannot run in the pipeline does not exist.',
    ],
  },
  {
    id: 'twelve',
    n: 28,
    title: 'Twelve-factor discipline',
    label: '12-factor',
    cluster: 'keep',
    x: 1310,
    y: 810,
    gist: 'A checklist for apps that must run in more than one place: one codebase, explicit deps, config in the environment, logs as streams.',
    remember: [
      'Config in env. Backing services as attached resources. Processes are disposable.',
      'Logs to stdout — the platform ships them. No snowflake servers.',
      'Dev/prod parity. Admin tasks as one-off processes, not hidden SSH.',
    ],
  },
  {
    id: 'devops',
    n: 31,
    title: 'DevOps for the backend',
    label: 'DevOps',
    cluster: 'keep',
    x: 1355,
    y: 760,
    gist: 'If I can write it but cannot ship, observe, and roll it back, I do not own it yet.',
    remember: [
      'CI builds and tests. CD ships. Prefer small, reversible deploys.',
      'Containers + orchestration when the unit of deploy is more than one box. IaC for the rest.',
      'You run what you ship: dashboards, on-call, rollback path.',
    ],
  },
];

export const graphEdges: GraphEdge[] = [
  ...topics.map((topic) => ({ from: topic.cluster, to: topic.id })),
  { from: 'http', to: 'routing' },
  { from: 'http', to: 'serde' },
  { from: 'http', to: 'rest' },
  { from: 'routing', to: 'handlers' },
  { from: 'middleware', to: 'auth' },
  { from: 'middleware', to: 'validation' },
  { from: 'context', to: 'handlers' },
  { from: 'auth', to: 'security' },
  { from: 'validation', to: 'security' },
  { from: 'handlers', to: 'bll' },
  { from: 'crud', to: 'rest' },
  { from: 'rest', to: 'openapi' },
  { from: 'webhooks', to: 'realtime' },
  { from: 'bll', to: 'databases' },
  { from: 'databases', to: 'caching' },
  { from: 'databases', to: 'search' },
  { from: 'objects', to: 'queue' },
  { from: 'email', to: 'queue' },
  { from: 'queue', to: 'realtime' },
  { from: 'errors', to: 'observe' },
  { from: 'config', to: 'twelve' },
  { from: 'scale', to: 'concurrency' },
  { from: 'scale', to: 'devops' },
  { from: 'testing', to: 'devops' },
  { from: 'shutdown', to: 'devops' },
];

export function topicById(id: string) {
  return topics.find((topic) => topic.id === id);
}

export const topicsInOrder = [...topics].sort((a, b) => a.n - b.n);

export function neighborTopics(id: string) {
  const index = topicsInOrder.findIndex((topic) => topic.id === id);
  return {
    prev: index > 0 ? topicsInOrder[index - 1] : null,
    next: index >= 0 && index < topicsInOrder.length - 1 ? topicsInOrder[index + 1] : null,
  };
}
