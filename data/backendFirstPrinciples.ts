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
    title: 'HTTP Status Codes: How the Server Answers Without Words',
    label: 'HTTP',
    cluster: 'wire',
    x: 270,
    y: 70,
    gist: 'Every request gets a 3-digit answer first. That status code tells the whole story — before the body, before the JSON. Pick the family, then the exact code.',
    remember: [
      '1xx chatter · 2xx check · 3xx change direction · 4xx client’s fault · 5xx crash.',
      'Cheat sheet: 200, 201, 301, 304, 400, 401, 403, 404, 429, 500, 502, 503.',
      'Debug tip: read the status first — it tells you who to blame before you waste hours.',
    ],
    sections: [
      {
        heading: '1. Why a number?',
        blocks: [
          {
            type: 'p',
            text: 'Every time you click a link, submit a form, or load an image, your browser sends a request to a server. The server cannot write you a paragraph back — it sends a **3-digit number** instead. That number is an **HTTP status code**, and it tells the whole story.',
          },
          {
            type: 'kid',
            items: [
              'You are at a restaurant (the **server**) and you order a burger (the **request**).',
              '**200** = “Here’s your burger, enjoy!”',
              '**404** = “Sorry, we don’t have that on the menu.”',
              '**500** = “The kitchen is on fire. Not your fault.”',
              '**301** = “We moved. The new address is…”',
            ],
          },
        ],
      },
      {
        heading: '2. The 5 families (moods)',
        blocks: [
          {
            type: 'p',
            text: 'Status codes are grouped by their **first digit**. Think of them as moods:',
          },
          {
            type: 'table',
            columns: ['Family', 'Mood', 'Means'],
            rows: [
              ['**1xx**', 'Chatter', 'Informational — hold on, I’m working on it.'],
              ['**2xx**', 'Check', 'Success — everything went great.'],
              ['**3xx**', 'Change direction', 'Redirection — go over there instead.'],
              ['**4xx**', 'Client’s fault', 'You (or your app) made a mistake.'],
              ['**5xx**', 'Crash', 'Server messed up — not your fault.'],
            ],
          },
          {
            type: 'callout',
            lines: [
              '**How to remember:** 1xx Chatter · 2xx Check · 3xx Change direction · 4xx Client’s fault · 5xx Crash.',
            ],
          },
        ],
      },
      {
        heading: '3. 1xx — Informational',
        blocks: [
          {
            type: 'p',
            text: '“Hold on, I’m working on it…” Rarely seen by users. The server says “I got your message, keep sending.”',
          },
          {
            type: 'pre',
            lines: `GET /upload  (chunk 1 of 5)
→ 100 Continue`,
          },
        ],
      },
      {
        heading: '4. 2xx — Success',
        blocks: [
          {
            type: 'p',
            text: '“Everything went great!” The golden standard. Your request worked and the server delivered.',
          },
          {
            type: 'pre',
            lines: `GET /blog/http-status-codes
→ 200 OK          (page loads perfectly)

POST /api/users   (create new account)
→ 201 Created     (new user born!)`,
          },
          {
            type: 'table',
            columns: ['Code', 'Name', 'One-liner'],
            rows: [
              ['**200**', 'OK', 'Here’s your stuff.'],
              ['**201**', 'Created', 'It’s alive! New resource exists.'],
              ['**204**', 'No Content', 'Done — empty body (often DELETE).'],
            ],
          },
          {
            type: 'kid',
            text: '200 = here’s the dish. 201 = we put a **new** dish on the menu. 204 = order handled, nothing left on the tray.',
          },
        ],
      },
      {
        heading: '5. 3xx — Redirection',
        blocks: [
          {
            type: 'p',
            text: '“Go over there instead.” The resource moved or has a new address. Your browser usually handles this automatically.',
          },
          {
            type: 'pre',
            lines: `GET /old-blog-post
→ 301 Moved Permanently → /new-blog-post

GET /temporary-sale-page
→ 302 Found   (temporary redirect)`,
          },
          {
            type: 'ul',
            items: [
              '**301** Moved Permanently — update your address book (and search engines will).',
              '**302** Found — temporary redirect.',
              '**304** Not Modified — nothing changed since last time (cache win).',
              '**308** Permanent Redirect — like 301 with stricter method rules.',
            ],
          },
        ],
      },
      {
        heading: '6. 4xx — Client error',
        blocks: [
          {
            type: 'p',
            text: '“You made a mistake.” The server understood your request, but you asked for something impossible or unauthorized.',
          },
          {
            type: 'pre',
            lines: `GET /admin-panel          (without logging in)
→ 401 Unauthorized

GET /secret-vault         (logged in, but not allowed)
→ 403 Forbidden

GET /page-that-never-existed
→ 404 Not Found`,
          },
          {
            type: 'callout',
            lines: [
              '**Important:** 4xx means the *client* (browser/app) sent a bad request. It is not always the human’s fault — sometimes the app itself sends malformed data. But it always means: **fix the request, not the server**.',
              '**401 vs 403:** 401 = “Who are you?” (need to log in). 403 = “I know who you are. You still can’t come in.”',
            ],
          },
          {
            type: 'table',
            columns: ['Code', 'Name', 'One-liner'],
            rows: [
              ['**400**', 'Bad Request', 'I can’t understand what you’re saying.'],
              ['**401**', 'Unauthorized', 'Who are you? (Need to log in.)'],
              ['**403**', 'Forbidden', 'I know you — still no.'],
              ['**404**', 'Not Found', 'I looked everywhere. It’s not here.'],
              ['**413**', 'Payload Too Large', 'That file is way too big.'],
              ['**415**', 'Unsupported Media', 'Wrong file type.'],
              ['**422**', 'Unprocessable', 'JSON is fine; the meaning is not.'],
              ['**429**', 'Too Many Requests', 'Stop spamming me.'],
            ],
          },
        ],
      },
      {
        heading: '7. 5xx — Server error',
        blocks: [
          {
            type: 'p',
            text: '“I messed up. Not your fault.” The request was fine, but the server crashed, timed out, or broke internally.',
          },
          {
            type: 'pre',
            lines: `GET /checkout     (database is down)
→ 500 Internal Server Error

GET /search       (server overloaded)
→ 503 Service Unavailable`,
          },
          {
            type: 'table',
            columns: ['Code', 'Name', 'One-liner'],
            rows: [
              ['**500**', 'Internal Server Error', 'It’s not you, it’s me.'],
              ['**502**', 'Bad Gateway', 'My friend who I asked let me down.'],
              ['**503**', 'Service Unavailable', 'Come back later, I’m napping.'],
            ],
          },
        ],
      },
      {
        heading: '8. Real-world scenes',
        blocks: [
          {
            type: 'h3',
            text: 'Online shopping — `POST /api/orders` (“Buy Now”)',
          },
          {
            type: 'table',
            columns: ['Status', 'What happened'],
            rows: [
              ['**200 OK**', 'Order placed successfully'],
              ['**400 Bad Request**', 'You forgot to enter your credit card CVV'],
              ['**401 Unauthorized**', 'Your login session expired'],
              ['**422 Unprocessable**', 'The item is out of stock'],
              ['**500 Server Error**', 'The payment gateway crashed'],
            ],
          },
          {
            type: 'h3',
            text: 'Social media — `GET /api/timeline` (open the app)',
          },
          {
            type: 'table',
            columns: ['Status', 'What happened'],
            rows: [
              ['**200 OK**', 'Fresh posts loaded'],
              ['**304 Not Modified**', 'No new posts since last check (cached)'],
              ['**429 Too Many Requests**', 'You scrolled too fast — slow down'],
              ['**503 Service Unavailable**', 'The platform is down'],
            ],
          },
          {
            type: 'h3',
            text: 'File upload — `POST /upload/avatar`',
          },
          {
            type: 'table',
            columns: ['Status', 'What happened'],
            rows: [
              ['**201 Created**', 'Image saved, profile updated'],
              ['**413 Payload Too Large**', 'Your 50MB photo exceeds the 5MB limit'],
              ['**415 Unsupported Media**', 'You tried to upload a `.exe` as an image'],
            ],
          },
        ],
      },
      {
        heading: '9. Developer’s cheat sheet',
        blocks: [
          {
            type: 'table',
            columns: ['Code', 'Meaning', 'One-liner memory'],
            rows: [
              ['**200**', 'OK', 'Here’s your stuff.'],
              ['**201**', 'Created', 'It’s alive!'],
              ['**301**', 'Moved Permanently', 'We moved. Update your address book.'],
              ['**304**', 'Not Modified', 'Nothing changed since last time.'],
              ['**400**', 'Bad Request', 'I can’t understand what you’re saying.'],
              ['**401**', 'Unauthorized', 'Who are you? (Need to log in.)'],
              ['**403**', 'Forbidden', 'I know who you are. You still can’t come in.'],
              ['**404**', 'Not Found', 'I looked everywhere. It’s not here.'],
              ['**429**', 'Too Many Requests', 'Stop spamming me.'],
              ['**500**', 'Internal Server Error', 'It’s not you, it’s me.'],
              ['**502**', 'Bad Gateway', 'My friend who I asked let me down.'],
              ['**503**', 'Service Unavailable', 'Come back later, I’m napping.'],
            ],
          },
        ],
      },
      {
        heading: '10. Quick quiz',
        blocks: [
          {
            type: 'h3',
            text: 'Q1 — Bank statement, session expired',
          },
          {
            type: 'ul',
            items: [
              '403 Forbidden',
              '**401 Unauthorized** ✅',
              '404 Not Found',
              '500 Server Error',
            ],
          },
          {
            type: 'callout',
            lines: [
              '**Answer: 401** — you need to log in again. **403** would mean you’re logged in but not allowed.',
            ],
          },
          {
            type: 'h3',
            text: 'Q2 — Upload a 100MB video to a 10MB limit',
          },
          {
            type: 'ul',
            items: [
              '400 Bad Request',
              '**413 Payload Too Large** ✅',
              '429 Too Many Requests',
              '415 Unsupported Media',
            ],
          },
          {
            type: 'callout',
            lines: [
              '**Answer: 413** — the request body is too big. **415** is for wrong file types.',
            ],
          },
          {
            type: 'h3',
            text: 'Q3 — Site moved to a new domain permanently',
          },
          {
            type: 'ul',
            items: [
              '302 Found',
              '**301 Moved Permanently** ✅',
              '304 Not Modified',
              '308 Permanent Redirect',
            ],
          },
          {
            type: 'callout',
            lines: [
              '**Answer: 301** — classic permanent redirect. Search engines will update their links. (308 is a stricter cousin.)',
            ],
          },
          {
            type: 'h3',
            text: 'Q4 — Database crashed during payment',
          },
          {
            type: 'ul',
            items: [
              '400 Bad Request',
              '404 Not Found',
              '**500 Internal Server Error** ✅',
              '503 Service Unavailable',
            ],
          },
          {
            type: 'callout',
            lines: [
              '**Answer: 500** — something broke inside the server. Not your fault, but the payment did not go through. **503** is closer to “temporarily closed / overloaded.”',
            ],
          },
          {
            type: 'quote',
            text: 'Pro tip: when debugging, always check the status code first. It tells you who to blame — yourself (4xx) or the server (5xx) — before you waste hours searching.',
          },
        ],
      },
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
    title: 'What is Serialization in Backend? How Objects Travel as Bytes',
    label: 'Serde',
    cluster: 'wire',
    x: 95,
    y: 250,
    gist: 'Serialization = object → a format that can travel or be stored. Deserialization = that format → an object your code can use.',
    remember: [
      'Serialize packs an in-memory object into JSON, XML, or bytes. Deserialize unpacks it back.',
      'Systems do not share memory or languages, so they need a common middle format.',
      'Never deserialize untrusted bytes blindly. Schema changes need defaults, or old data breaks.',
    ],
    sections: [
      {
        heading: '1. What are serialization and deserialization?',
        blocks: [
          { type: 'h3', text: 'Core idea' },
          {
            type: 'ul',
            items: [
              '**Serialization** = converting an in-memory object (a dict, a struct, a class) into a format that can be sent over a network or saved to disk (JSON, XML, or binary bytes).',
              '**Deserialization** = converting that format back into an in-memory object the program can use.',
              '**Serde** = both directions. Object ↔ travel format.',
            ],
          },
          { type: 'p', text: 'In backend talk, the object is what *your language* understands. The serialized form is what *the wire* understands.' },
          { type: 'quote', text: 'Pack it to send. Unpack it to use.' },
          { type: 'p', text: 'Example — in-memory object, then both directions:' },
          {
            type: 'pre',
            lines: `user = {
  "name": "Alice",
  "age": 30,
  "is_active": True
}

# SERIALIZE: object → JSON string
json_string = json.dumps(user)
# '{"name": "Alice", "age": 30, "is_active": true}'

# DESERIALIZE: JSON string → object
user_object = json.loads(json_string)
# {'name': 'Alice', 'age': 30, 'is_active': True}`,
          },
          {
            type: 'kid',
            items: [
              '**Serialization** = packing toys into a box. Toys are spread on the floor (object in memory). You put them in a box (JSON string) so you can carry them to a friend’s house.',
              '**Deserialization** = unpacking the box. You take the toys out and spread them on the floor again so you can play.',
            ],
          },
        ],
      },
      {
        heading: '2. Where do we use it?',
        blocks: [
          { type: 'p', text: 'Serde happens every time two systems talk to each other:' },
          {
            type: 'ul',
            items: [
              '**Web APIs** — client ↔ server',
              '**Databases** — storing objects as text or bytes',
              '**Message queues** — Kafka, RabbitMQ, SNS',
              '**Caching** — Redis',
              '**Microservices** — services talking internally',
            ],
          },
          { type: 'h3', text: 'API request / response' },
          {
            type: 'pre',
            lines: `1. Frontend creates a user object
2. SERIALIZES it to JSON  →  sends over HTTP
3. Backend receives JSON
4. DESERIALIZES it into a native object
5. Backend processes it, builds a response object
6. SERIALIZES the response to JSON  →  sends back
7. Frontend DESERIALIZES it and shows it on screen`,
          },
          {
            type: 'kid',
            items: [
              'You draw a picture for grandma far away.',
              'You fold the paper (**serialize**) and put it in an envelope.',
              'The mailman delivers it.',
              'Grandma unfolds the paper (**deserialize**) and hangs it on the fridge.',
              'Every message, picture, or game save you send is serialize → travel → deserialize.',
            ],
          },
        ],
      },
      {
        heading: '3. Why do we use it?',
        blocks: [
          { type: 'p', text: 'Different systems do **not** share memory. They often use different languages. A JavaScript frontend cannot send a JavaScript object to a Java backend and expect it to just work.' },
          { type: 'quote', text: 'They need a common language — a serialized format both sides can understand.' },
          {
            type: 'table',
            columns: ['System', 'Language', 'Native object'],
            rows: [
              ['Frontend', 'JavaScript', '`{ name: "Bob" }`'],
              ['Backend', 'Java', '`new User("Bob")`'],
              ['Database', '—', 'Stores bytes / text'],
            ],
          },
          { type: 'p', text: 'They all speak JSON as the common middle ground:' },
          {
            type: 'pre',
            lines: '{"name": "Bob"}',
          },
          {
            type: 'kid',
            items: [
              'You speak English. One friend speaks French. Another speaks Japanese. Talking directly does not work.',
              'So you all use a simple common language — drawings, or emojis.',
              '**JSON** is that common language for computers.',
            ],
          },
        ],
      },
      {
        heading: '4. Common serialization formats',
        blocks: [
          { type: 'p', text: 'Formats trade off **human readability**, **size**, and **speed**:' },
          {
            type: 'ul',
            items: [
              '**JSON** — human-readable, the usual choice for APIs',
              '**XML** — older, verbose, still used in enterprise',
              '**Binary** (Protobuf, Avro, Thrift) — smaller and faster, used between services inside a company',
            ],
          },
          { type: 'h3', text: 'Tiny comparison' },
          {
            type: 'pre',
            lines: `// JSON — human-readable, ~85 bytes
{"name":"Alice","age":30,"active":true}

// Protobuf — binary, ~10 bytes
// much smaller and faster
// not human-readable — machines love it`,
          },
          {
            type: 'kid',
            items: [
              '**JSON** = a letter with nice handwriting. Anyone can read it. It uses more paper.',
              '**Protobuf** = a secret code. Only your friend knows how to read it. The message is tiny and fast to send.',
            ],
          },
        ],
      },
      {
        heading: '5. Risks and gotchas',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Performance** — converting objects to bytes costs CPU.',
              '**Security** — deserializing untrusted data can be dangerous. Malicious bytes can exploit the unpacker.',
              '**Versioning** — if the data shape changes, old serialized data may not fit the new code.',
              '**Platform dependence** — a serialized Java object cannot be deserialized by Python directly. Use a shared format (JSON, Protobuf), not a language’s private dump.',
            ],
          },
          { type: 'h3', text: 'Versioning problem' },
          {
            type: 'pre',
            lines: `// Version 1 — old data
{"name": "Alice", "age": 30}

// Version 2 — new code expects "department"
// If you assume the field is always there, this breaks.

// Fix: a default
department = data.get("department", "General")`,
          },
          {
            type: 'kid',
            items: [
              '**Security** — do not open a box from a stranger. It might have something dangerous inside. Only unpack data from people you trust.',
              '**Versioning** — you used to pack toys in a small box. Now you have more toys and need a bigger box. If your friend still uses the old small box, things will not fit. Plan ahead.',
            ],
          },
        ],
      },
      {
        heading: '6. Quick map',
        blocks: [
          {
            type: 'table',
            columns: ['Concept', 'Real-world analogy', 'What it does'],
            rows: [
              ['Serialization', 'Packing toys in a box', 'Object → JSON / bytes'],
              ['Deserialization', 'Unpacking toys from a box', 'JSON / bytes → object'],
              ['JSON', 'A letter in plain English', 'Human-readable format'],
              ['Protobuf', 'A secret code', 'Fast, tiny, machine-only'],
              ['API call', 'Sending mail', 'Serialize → send → deserialize'],
              ['Security risk', 'Opening a stranger’s package', 'Only trust known sources'],
            ],
          },
          {
            type: 'callout',
            lines: [
              '**Serialize** packs an object so it can travel.',
              '**Deserialize** unpacks it so code can use it.',
              '**JSON** is the common language when systems do not share memory.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'middleware',
    n: 7,
    title: 'What is Middleware in Backend? The Hallway Around Every Request',
    label: 'Middleware',
    cluster: 'wire',
    x: 250,
    y: 355,
    gist: 'Middleware is code in the middle of the request lifecycle — before (and sometimes after) the handler. Order is behavior. Keep it small; it is not the product.',
    remember: [
      'A middleware gets req, res, and next(). Call next() to pass the request along — or stop and answer.',
      'Use it for CORS, auth, rate limits, logs, compression, global errors — not for core business rules.',
      'Auth before the handler. Error mapper last so it can catch everything.',
    ],
    sections: [
      {
        heading: '1. What middleware is',
        blocks: [
          { type: 'h3', text: 'Core idea' },
          { type: 'p', text: 'In the request lifecycle (see **9 · Handlers**), middleware sits **around** routing and the handler. The name is literal: it runs *in the middle*.' },
          { type: 'quote', text: 'Optional extra handlers that can change the request, change the response, call `next()`, or answer the client and stop.' },
          {
            type: 'pre',
            lines: `Request
  → middleware 1
  → middleware 2
  → route → handler → service → repository
  → (sometimes middleware after, e.g. compress / error mapper)
Response`,
          },
          { type: 'p', text: 'A typical middleware receives three things:' },
          {
            type: 'ul',
            items: [
              '**`req`** — the incoming request.',
              '**`res`** — the outgoing response.',
              '**`next`** — a function. Call it to pass control to the **next** middleware or to the handler.',
            ],
          },
          {
            type: 'pre',
            lines: `function auth(req, res, next) {
  const user = verify(req.headers.authorization)
  if (!user) return res.status(401).json({ message: "unauthorized" })
  req.context.userId = user.id   // stash for later — see Context
  next()                         // let the handler run
}`,
          },
          {
            type: 'kid',
            items: [
              'A hallway of checkpoints before reception. Each guard can stamp the envelope, send you back, or wave you to the next door.',
              '`next()` = “go to the next guard.” No `next()` = you were turned away at this door.',
            ],
          },
        ],
      },
      {
        heading: '2. Why not just a normal function in every handler?',
        blocks: [
          { type: 'p', text: 'You *could* call `log(req)` and `auth(req)` at the top of every handler. After ten routes, you have copied the same three lines ten times — and forgotten them on the eleventh.' },
          { type: 'p', text: 'Middleware **centralizes** that work. One auth check covers a whole group of routes. Handlers stay about *this* resource, not about CORS headers.' },
          {
            type: 'ul',
            items: [
              '**CORS** — is this origin allowed? If yes, add the headers.',
              '**Auth** — verify the token; put the user on context. Fail → 401, no handler.',
              '**Rate limit** — count calls per IP; too many → 429.',
              '**Logging / monitoring** — method + path on the way in.',
              '**Compression** — gzip a large body on the way out.',
              '**Parse / serde** — JSON body into an object so handlers stay clean.',
              '**Global errors** — last in the stack; catch whatever bubbled and return a structured body.',
            ],
          },
          {
            type: 'kid',
            items: [
              'Instead of every teacher checking IDs, one guard at the school gate checks once.',
              'The classroom can teach math. It does not also run security.',
            ],
          },
        ],
      },
      {
        heading: '3. Order is behavior',
        blocks: [
          { type: 'p', text: 'The order you **register** middleware is the order it **runs**. Swap it and you ship bugs.' },
          {
            type: 'pre',
            lines: `typical order
  1. log            (see the request even if later steps fail)
  2. CORS / parse
  3. auth           (before any business)
  4. validate       (optional, or in the handler)
  5. handler
  6. error mapper   LAST — so it can see every failure`,
          },
          { type: 'p', text: 'Security-related middleware should run **before** the handler. The error mapper should be **last** so a throw in auth or in the handler still becomes a clean JSON 400/500 — not a crash page.' },
          {
            type: 'kid',
            items: [
              'Check the badge *before* you let someone into the office. Do not teach the class first and ask for ID after.',
              'The principal who handles “something went wrong” letters sits at the *end* of the hallway, so every complaint reaches them.',
            ],
          },
        ],
      },
      {
        heading: '4. Quick map',
        blocks: [
          {
            type: 'table',
            columns: ['Concept', 'Real-world analogy', 'What it does'],
            rows: [
              ['Middleware', 'Checkpoint in the hallway', 'Runs around the handler'],
              ['`next()`', 'Wave to the next guard', 'Pass the request along'],
              ['Stop without `next()`', 'Turned away at the gate', '401 / 429 / CORS reject'],
              ['Error mapper last', 'Principal at the end of the hall', 'One shape for every failure'],
            ],
          },
          {
            type: 'callout',
            lines: [
              'Middleware is **shared hallway work**, not the product.',
              '**Order matters.** Auth before the handler. Errors last.',
              'Trusted facts it learns (user id) go on **request context** — node 8.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'context',
    n: 8,
    title: 'What is Request Context? The Sticky Note for This Call Only',
    label: 'Context',
    cluster: 'wire',
    x: 400,
    y: 280,
    gist: 'Per-request memory: who, which request, when to give up. Not a global. Not a leftover from the previous caller. Not a user id the client typed.',
    remember: [
      'Context is a bag attached to one request. Middleware writes; handler and service read.',
      'Put the verified user id here — never trust body.userId from the client.',
      'Request id / UUID stitches logs across services. Cancellation / deadline stops hung downstream calls.',
    ],
    sections: [
      {
        heading: '1. What context is',
        blocks: [
          { type: 'h3', text: 'Core idea' },
          { type: 'p', text: 'Middleware, handler, and service all need to share a few facts for **this one request**. A **request context** is scoped storage tied to that lifecycle — then it dies.' },
          { type: 'quote', text: 'Shared state for this call. Loose coupling: auth does not return a user object through every function argument by hand, but it also is not a process-wide global.' },
          {
            type: 'ul',
            items: [
              'Lives for **one** request. Two requests in flight at once each have their **own** bag.',
              'Never stash this on a singleton / module variable. Concurrent callers will swap identities.',
              'This is the rest of the same video as **9 · Handlers** and **7 · Middleware**.',
            ],
          },
          {
            type: 'kid',
            items: [
              'A sticky note on *this visitor’s* folder: badge number, visit id, “must leave by 3pm.”',
              'When they walk out, you throw the note away. You do not pin it on the front door for the next stranger.',
            ],
          },
        ],
      },
      {
        heading: '2. Trusted user — not the id in the body',
        blocks: [
          { type: 'p', text: 'When execution reaches the handler, you often need “who is doing this?” — user id, role — to insert a catalog row **as that user**.' },
          { type: 'p', text: 'If you read `userId` from the JSON body, a hostile client sends someone else’s id. **Auth middleware** already verified the token. It should put **that** user on context. The handler reads context, not the body, for identity.' },
          {
            type: 'pre',
            lines: `// auth middleware (earlier in the hallway)
ctx.userId = token.sub
ctx.role   = token.role
next()

// handler — identity from context, payload from body
item = {
  title:  body.title,
  owner:  ctx.userId,    // trusted
}
service.create(item)

// never
item.owner = body.userId  // attacker chooses the owner`,
          },
          {
            type: 'kid',
            items: [
              'The visitor writes “I am the principal” on their form. You do not believe the form.',
              'You believe the **badge the gate already checked**, copied onto the sticky note.',
            ],
          },
        ],
      },
      {
        heading: '3. Request id, tracing, cancel',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Request id (UUID)** — generated at the edge, stored on context, logged everywhere. One id stitches this call across services. Audit: where did it go?',
              '**Cancellation / deadline** — “give up at T.” Passed downstream so a hung vendor does not hang *you* forever.',
            ],
          },
          {
            type: 'pre',
            lines: `ctx.requestId = uuid()          // log this on every line
ctx.deadline  = now + 3s        // cancel slow downstream work

log.info("create item", { requestId: ctx.requestId, userId: ctx.userId })`,
          },
          {
            type: 'kid',
            items: [
              'Every hall pass gets a unique number. If something goes missing, you follow that number through every classroom.',
              '“Be back by 3pm” is a deadline. The library does not keep you until midnight.',
            ],
          },
        ],
      },
      {
        heading: '4. Quick map',
        blocks: [
          {
            type: 'table',
            columns: ['Concept', 'Real-world analogy', 'What it does'],
            rows: [
              ['Request context', 'Sticky note for this visit', 'State for one request only'],
              ['Verified user id', 'Badge number, not the form', 'Identity after auth middleware'],
              ['Request id', 'Hall-pass number', 'Stitch logs across services'],
              ['Deadline / cancel', 'Be back by 3pm', 'Stop hung downstream calls'],
            ],
          },
          {
            type: 'callout',
            lines: [
              'Context is **this request’s bag**. Not a global. Not the previous caller.',
              '**Write** trusted facts in middleware. **Read** them in the handler / service.',
              'Never take `userId` from the client body when you already have a token.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'auth',
    n: 5,
    title: 'What is Auth in Backend? Who You Are vs What You May Do',
    label: 'Auth',
    cluster: 'gate',
    x: 600,
    y: 85,
    gist: 'Authentication is who you are. Authorization is what you may do. Mixing them is how admin leaks to everyone.',
    remember: [
      'AuthN proves identity. AuthZ checks permission on a resource. Login is not enough.',
      'Sessions: the server remembers you. JWT: the token carries the claims; the server verifies the signature.',
      'Never store passwords in plain text. Hash them. Never put secrets in a JWT payload.',
    ],
    sections: [
      {
        heading: '1. Authentication vs authorization',
        blocks: [
          { type: 'h3', text: 'Core idea' },
          {
            type: 'ul',
            items: [
              '**Authentication (AuthN)** = *who are you?* Proving identity. Like showing your ID at the airport.',
              '**Authorization (AuthZ)** = *what are you allowed to do?* Proving permissions. Like a boarding pass that says seat 12A, not first class.',
            ],
          },
          { type: 'quote', text: 'Identity first. Permission second. A valid login does not mean “do anything.”' },
          { type: 'p', text: 'Example — prove who, then prove what:' },
          {
            type: 'pre',
            lines: `# AUTHENTICATION: checking WHO you are
def login(username, password):
    user = database.find_user(username)
    if bcrypt.checkpw(password, user.hashed_password):
        return "You are Alice!"   # identity proven
    return "Invalid credentials"

# AUTHORIZATION: checking WHAT you can do
def delete_post(user, post_id):
    post = database.find_post(post_id)
    if user.id != post.author_id and user.role != "admin":
        return "Forbidden: you can't delete this!"
    database.delete(post)
    return "Post deleted"`,
          },
          {
            type: 'kid',
            items: [
              '**Authentication** = showing your student ID. The teacher checks the photo. “Yes, you are Bob.”',
              '**Authorization** = the teacher saying: “Bob, you can use the computer lab, but you cannot go into the teacher’s lounge.”',
              'The ID proved who you are. The rules decide where you can go.',
            ],
          },
        ],
      },
      {
        heading: '2. Stateful vs stateless authentication',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Stateful (sessions)** = the server *remembers* you. It stores a session ID in memory / Redis / a database. Every request sends a cookie with that ID.',
              '**Stateless (JWT)** = the server does *not* remember you. It gives you a signed token with your claims. You send it on every request. The server verifies the signature.',
            ],
          },
          { type: 'h3', text: 'Stateful — session / cookie' },
          {
            type: 'pre',
            lines: `Server stores this in Redis / memory:
  session_id "abc123"  →  user_id: 42, role: "admin"

Client sends cookie:  session_id=abc123
Server looks it up:   "Oh, this is Alice the admin!"`,
          },
          { type: 'h3', text: 'Stateless — JWT' },
          {
            type: 'pre',
            lines: `Server gives the client a token (signed with a secret):
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Decoded:  { "user_id": 42, "role": "admin", "exp": 1234567890 }

Client sends:  Authorization: Bearer <token>
Server verifies the signature:  "Valid! This is Alice the admin!"
Server does NOT look the session up in a database.`,
          },
          {
            type: 'kid',
            items: [
              '**Stateful (session)** = coat check. You give them your coat, they give you ticket #42. Show the ticket; they look in the back. “Ah yes, the blue jacket.”',
              '**Stateless (JWT)** = a theme-park wristband. Name, photo, and which rides you may use are *printed on the band*. The ride operator just looks at your wrist. No call to the front desk.',
            ],
          },
        ],
      },
      {
        heading: '3. Password hashing',
        blocks: [
          { type: 'p', text: 'You **never** store passwords in plain text. If someone steals the database, they would get everyone’s passwords. Store a **hash** — a one-way scramble. Even you cannot reverse it.' },
          { type: 'quote', text: 'We never know the original password. We only know the new attempt matches the stored hash.' },
          {
            type: 'pre',
            lines: `import bcrypt

# SIGN UP: store the hash, not the password
password = "supersecret123"
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
# looks like: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4...

# LOGIN: check the password
entered = "supersecret123"
is_valid = bcrypt.checkpw(entered.encode(), stored_hash)
# True — it matches. The original string is still unknown.`,
          },
          {
            type: 'kid',
            items: [
              'A magic blender: apple in, applesauce out. There is no reverse button. You cannot turn sauce back into an apple.',
              'The server blends your password and stores the sauce. On login you give a new apple. They blend it and ask: does this sauce match the stored sauce?',
              'If yes, you are in. If someone steals the sauce, they still cannot make the apple.',
            ],
          },
        ],
      },
      {
        heading: '4. JWT — JSON Web Tokens',
        blocks: [
          { type: 'p', text: 'A JWT has **3 parts**, separated by dots:' },
          {
            type: 'pre',
            lines: 'header.payload.signature',
          },
          {
            type: 'table',
            columns: ['Part', 'What it is'],
            rows: [
              ['**Header**', 'How it was signed (algorithm, token type). Example: `{ "alg": "HS256", "typ": "JWT" }`'],
              ['**Payload**', 'Claims — who, what role, when it expires. Anyone can *read* this. Do not put passwords here.'],
              ['**Signature**', 'Proof the header + payload were not changed. Made with the server’s secret (or private key).'],
            ],
          },
          { type: 'p', text: 'The server does not look up a session. It checks: is the signature valid, and is `exp` still in the future?' },
          {
            type: 'pre',
            lines: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.
eyJ1c2VyX2lkIjo0Miwicm9sZSI6ImFkbWluIiwiZXhwIjoxMjM0NTY3ODkwfQ
.
signature_bytes_here`,
          },
          {
            type: 'ul',
            items: [
              'Change one character in the payload without the secret → signature check fails.',
              'Stolen token still works until it expires (or you add a denylist). That is the trade for not storing sessions.',
            ],
          },
          {
            type: 'kid',
            items: [
              'The wristband has three stickers: **how it was printed**, **your name and rides**, and a **secret stamp** only the park can make.',
              'Anyone can read the name sticker. The stamp is what stops a fake wristband.',
              'If someone copies your band, they can ride until the date on it runs out — unless the park keeps a “stolen bands” list.',
            ],
          },
        ],
      },
      {
        heading: '5. Quick map',
        blocks: [
          {
            type: 'table',
            columns: ['Concept', 'Real-world analogy', 'What it does'],
            rows: [
              ['Authentication', 'Showing your ID', 'Prove *who* you are'],
              ['Authorization', 'Boarding pass / room rules', 'Prove *what* you may do'],
              ['Session', 'Coat-check ticket', 'Server remembers you'],
              ['JWT', 'Theme-park wristband', 'Token carries claims; server verifies stamp'],
              ['Password hash', 'Applesauce from a blender', 'Store a one-way scramble, never the password'],
            ],
          },
          {
            type: 'callout',
            lines: [
              '**AuthN** answers who.',
              '**AuthZ** answers what they may do.',
              '**Hash** the password. **Sign** the token. Never mix “they logged in” with “they may delete this.”',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'validation',
    n: 6,
    title: 'What is Validation in Backend? How Garbage Stops at the Door',
    label: 'Validation',
    cluster: 'gate',
    x: 840,
    y: 90,
    gist: 'After the route matches and before any real work: check the payload, then shape it. Client checks are UX. Server checks are integrity and security.',
    remember: [
      'Validate at the entry — JSON, query, path, headers — before the service or the database.',
      'Three checks: type (string vs number), syntactic (looks like an email), semantic (birthday not in the future).',
      'Transform so the domain sees one shape: query strings become numbers, emails become lowercase.',
    ],
    sections: [
      {
        heading: '1. Where it sits — and why',
        blocks: [
          { type: 'h3', text: 'Core idea' },
          { type: 'p', text: 'A typical call goes **controller → service → repository**. HTTP status and shape live in the controller. Business rules live in the service. The database lives in the repository.' },
          { type: 'quote', text: 'Validations and transformations run after the route matches, and *before* any significant controller or service work.' },
          {
            type: 'ul',
            items: [
              'Anything from the client: **JSON body**, **query params**, **path params**, **headers**. All four are untrusted. All four get checked at the door.',
              'If the API needs a `name` string between 5 and 100 characters, prove that **at the door**.',
              'Skip the gate and bad data walks into the service and the SQL. The user gets a **500** (“something unexpected”). That is a poor form experience. Fail at the door with **400** and a field list they can fix.',
            ],
          },
          { type: 'h3', text: 'What those four look like on one request' },
          { type: 'p', text: 'One HTTP call can carry all of them at once. The path slot, the `?` extras, the headers, and the JSON body are four different bags of data:' },
          {
            type: 'pre',
            lines: `PUT /api/v1/catalog/items/88?draft=true HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
X-Request-Id: req-7f3a

{
  "title": "  Quiet Hours  ",
  "price": "12.50",
  "email": "Sam@Shop.COM"
}`,
          },
          {
            type: 'table',
            columns: ['Where', 'In this request', 'What it is'],
            rows: [
              ['**Path param**', '`/items/88` — the `:id` is `88`', '**Which** record. Required identity. In the URL path, not after `?`.'],
              ['**Query param**', '`?draft=true`', '**How** to treat this call — filter, flag, page. Optional extras after `?`.'],
              ['**Header**', '`Authorization`, `Content-Type`, `X-Request-Id`', '**Meta** about the call — who, what format, which request id. Not the resource itself.'],
              ['**JSON body**', '`{ "title", "price", "email" }`', '**The payload** — fields you are creating or updating. Only on methods that send a body (POST / PUT / PATCH).'],
            ],
          },
          { type: 'p', text: 'Tiny reads so you can picture each bag on its own:' },
          {
            type: 'pre',
            lines: `JSON body     POST /signup
              { "email": "a@b.com", "age": 30 }

Query params  GET /catalog?page=2&limit=20&q=quiet
              page="2"  limit="20"  q="quiet"     ← always strings

Path params   GET /catalog/items/88
              c.Param("id") → "88"               ← identity of one item

Headers       Authorization: Bearer <token>
              Content-Type: application/json
              X-Request-Id: req-7f3a`,
          },
          { type: 'p', text: 'Empty or junk body → **400** with fields to fix, not a 500:' },
          {
            type: 'pre',
            lines: `POST /signup   body: {}
→ 400  [
     { "field": "email", "message": "required" },
     { "field": "phone", "message": "required" },
     { "field": "date",  "message": "required" }
   ]

POST /signup   body: { "email": "not-an-email", "phone": 12345, "date": "..." }
→ 400  [
     { "field": "email", "message": "invalid email format" },
     { "field": "phone", "message": "expected string, got number" }
   ]`,
          },
          {
            type: 'kid',
            items: [
              'The coat check is *before* the party, not after someone is already on the dance floor.',
              'If the ticket is wrong, you say so at the door (400). You do not let them in and then explode the kitchen (500).',
            ],
          },
        ],
      },
      {
        heading: '2. Three kinds of validation',
        blocks: [
          { type: 'p', text: 'These are not the only kinds. They are the three you will see most while designing APIs. How strict you are is a product choice — keep the three in mind.' },
          {
            type: 'table',
            columns: ['Kind', 'Question', 'Example'],
            rows: [
              ['**Type**', 'Is this the right *kind* of value?', '`phone` must be a string, not a number. `married` a boolean.'],
              ['**Syntactic**', 'Does the *shape* match?', 'Email looks like an email. Phone matches a pattern. Date parses.'],
              ['**Semantic**', 'Does this *make sense*?', 'Birthday not in the future. Age 365 is not a person (yet).'],
            ],
          },
          { type: 'h3', text: 'Type — example' },
          { type: 'p', text: 'String, number, boolean, array, nested object. Query params arrive as **strings** even when they look like numbers — type checks and transforms often travel together.' },
          {
            type: 'pre',
            lines: `// sent
{ "phone": 855123456, "married": "yes" }

// check
phone    expected string,  got number   → 400
married  expected boolean, got string   → 400

// ok
{ "phone": "855123456", "married": true }`,
          },
          { type: 'h3', text: 'Syntactic — example' },
          { type: 'p', text: '“Does this string *look like* what we asked for?” Email regex / parser. Phone pattern. A date that can actually be read as a date.' },
          {
            type: 'pre',
            lines: `{ "email": "sam-at-shop", "date": "next friday" }
→ 400  email: invalid email format
       date:  not a date

{ "email": "sam@shop.com", "date": "1998-04-12" }
→ ok (shape is legal — meaning is a later check)`,
          },
          { type: 'h3', text: 'Semantic — example' },
          { type: 'p', text: 'The value is the right type and the right shape — and still nonsense. Date of birth in the future. Age `365`. The pipeline should reject it.' },
          {
            type: 'pre',
            lines: `today = 2025-11-01

{ "birthDate": "2026-01-13", "age": 365 }
→ 400  birthDate: cannot be in the future
       age:      not a realistic age

{ "birthDate": "1998-04-12", "age": 27 }
→ ok`,
          },
          { type: 'quote', text: 'Type = kind. Syntactic = shape. Semantic = meaning.' },
          {
            type: 'kid',
            items: [
              '**Type** = you asked for a written phone number and they handed you a brick.',
              '**Syntactic** = they wrote a phone number but it is random scribbles, not digits in a phone shape.',
              '**Semantic** = they wrote a perfect date of birth… for next year. A baby cannot be born tomorrow’s tomorrow.',
            ],
          },
        ],
      },
      {
        heading: '3. Transformation — shape it for the domain',
        blocks: [
          { type: 'p', text: 'Validation asks “is this allowed?” **Transformation** runs operations on the value so the service always sees **one** shape — often after (or as part of) the pipeline.' },
          { type: 'p', text: '**Validation** answers “reject or accept?” **Transformation** answers “rewrite it so the service always sees one shape.” You often do both on the same field: cast, then range-check.' },
          { type: 'h3', text: 'Example 1 — query strings become numbers' },
          { type: 'p', text: '`GET /bookmarks?page=2&limit=20` looks numeric in the URL. On the server, `page` and `limit` are still **strings** `"2"` and `"20"`. Cast first, then check the range. Cast fails → 400, do not crash.' },
          {
            type: 'pre',
            lines: `GET /bookmarks?page=2&limit=20

before (wire)     page = "2"      limit = "20"     // strings
transform         page = 2        limit = 20       // int()
validate          0 < page < 500  0 < limit < 10000
after (service)   page = 2        limit = 20

GET /bookmarks?page=abc
transform fails   int("abc") → 400  { "field": "page", "message": "must be a number" }`,
          },
          { type: 'h3', text: 'Example 2 — email, phone, title' },
          { type: 'p', text: 'Users type wildly. The service should not have to know every spelling. Normalize, then (if needed) validate length / format on the cleaned value.' },
          {
            type: 'pre',
            lines: `before (body)
  title  = "  Quiet Hours  "
  email  = "Sam@Shop.COM"
  phone  = "855123456"

transform
  title  = title.trim()           → "Quiet Hours"
  email  = email.lower()          → "sam@shop.com"
  phone  = "+" + phone            → "+855123456"

after (service / DB)
  { "title": "Quiet Hours", "email": "sam@shop.com", "phone": "+855123456" }`,
          },
          { type: 'p', text: 'Chain it when you must: lowercase → strip junk → then check length. Fail a bad JSON body or a date that will not parse with a **clear 400**, not a 500.' },
          {
            type: 'kid',
            items: [
              'Kids write their name as `  BoB  `. You trim and lowercase to `bob` so the name list does not have three Bobs.',
              'The permission slip says “age: 9” as words on paper. You turn it into the number 9 before you check “must be under 12.”',
            ],
          },
        ],
      },
      {
        heading: '4. Fields that depend on other fields',
        blocks: [
          { type: 'p', text: 'Some rules are not “this one field.” They are **relationships**.' },
          {
            type: 'ul',
            items: [
              '**Match:** `password` and `passwordConfirmation` must be equal. Password itself may also need a minimum length (e.g. 8).',
              '**Conditional:** if `married` is `true`, `partner` (partner name) is **required**. If `married` is `false`, skip it.',
            ],
          },
          {
            type: 'pre',
            lines: `{ "married": false }           // ok without partner
{ "married": true }            // 400  partner name is required
{ "married": true, "partner": "Sam" }  // ok`,
          },
          { type: 'p', text: 'Return **all** field errors in one response when you can, so the client can paint every broken input at once — not a painful one-field-at-a-time loop. Return **early** on cheap failures (missing required, bad JSON) so you do not burn CPU on the rest.' },
          {
            type: 'kid',
            items: [
              'If you say you have a sibling, you must write their name. If you say you do not, leave that line blank.',
              '“New locker code” and “type it again” must match. One wrong digit and the lock does not change.',
            ],
          },
        ],
      },
      {
        heading: '5. Frontend vs backend — both, for different jobs',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Frontend validation** = **UX**. Immediate “this email looks wrong” so the user is not surprised after submit.',
              '**Backend validation** = **security and data integrity**. This is the real gate.',
            ],
          },
          { type: 'quote', text: 'A browser form is one client. Postman is another. A mobile app is another. The server must not trust any of them.' },
          { type: 'p', text: 'If the API “depends” on the web form to be strict, the day someone hits the same URL from an API client with no UI, the server breaks — or worse, stores garbage. Design the API as if the client might do **zero** checks.' },
          {
            type: 'kid',
            items: [
              'The hall monitor reminding you to zip your bag is nice (frontend).',
              'The lock on the school safe is what actually protects the lunch money (backend). Do not remove the lock because a monitor exists.',
            ],
          },
        ],
      },
      {
        heading: '6. Quick map',
        blocks: [
          {
            type: 'table',
            columns: ['Concept', 'Real-world analogy', 'What it does'],
            rows: [
              ['Entry pipeline', 'Coat check before the party', 'After route match, before service / DB'],
              ['Type check', 'Asked for a ticket, got a brick', 'Right kind of value'],
              ['Syntactic', 'Ticket must look like a ticket', 'Shape / format'],
              ['Semantic', 'Ticket dated next year', 'Meaning that can be true'],
              ['Transform', 'Trim the name, lowercase the email', 'One shape for the domain'],
              ['Frontend vs backend', 'Reminder vs lock', 'UX vs security — never skip the lock'],
            ],
          },
          {
            type: 'callout',
            lines: [
              '**Validate** at the door. **Transform** into one shape. Then call the service.',
              '**400** with field errors when the client is wrong. **500** is not a form validator.',
              'The web form is optional. The server gate is not.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'security',
    n: 22,
    title: 'Backend Security: Where Did I Assume — and What Language Did That Input Become?',
    label: 'Security',
    cluster: 'gate',
    x: 720,
    y: 345,
    gist: 'Every hole starts as an assumption: clean input, our frontend, a logged-in user acting in good faith. The app speaks SQL, HTML, and shell. User text that crosses a language boundary without being treated as data is an injection.',
    remember: [
      'Separate code from data: parameterized SQL, no shell strings, sanitize before HTML. App DB user is DML only.',
      'Authn is who. Authz is this row, this function. Ownership in the query. Missing row and forbidden row both 404. Default deny.',
      'Slow salted hashes (Argon2id). Cookies: HttpOnly, Secure, SameSite. Rate-limit login in layers. Secrets never in git — rotate if they were.',
    ],
    sections: [
      {
        heading: '1. The goal is paranoia, not a checklist',
        blocks: [
          { type: 'h3', text: 'Core idea' },
          { type: 'p', text: 'Security of a backend is one of the few topics that, if you ignore it, is **destructive in money**: data gone, charges wrong, the business itself. It is also a **huge domain**. Browser cookies, TLS, the operating system the process sits in, the application code — each has its own book. This chapter stays on **the app you wrote**: the process, the queries, the sessions. Not because the rest is fake. Because stuffing every layer into one sitting is how you learn nothing and ship anyway.' },
          { type: 'p', text: 'The aim is **not** “implement these twelve tricks tomorrow.” No application is **truly** secure. Languages, libraries, and attackers move. The aim is to keep security **in the back of your head** every time you write a handler — to get **paranoid** in a useful way. Fancy technique lists rot. The question does not:' },
          { type: 'quote', text: 'Where did the developer make an assumption?' },
          { type: 'p', text: 'Attackers do not care which language you used. They poke **boundaries**. They open the network tab. They change the id. They do not walk the happy path you demoed under a deadline.' },
          {
            type: 'kid',
            items: [
              'The fire drill is not a list of pretty extinguishers. It is “what did we assume would never catch fire?”',
              'No school is unburnable. You still check the exits.',
            ],
          },
        ],
      },
      {
        heading: '2. The assumptions that feel reasonable',
        blocks: [
          {
            type: 'ul',
            items: [
              'User input will be **clean**.',
              'They will only use **our** frontend.',
              'The person who **claims** to be Maya **is** Maya.',
              'This request **came from our site**.',
              'Nobody will **edit the query string**.',
            ],
          },
          { type: 'p', text: 'Under a shipping deadline those all feel true. Users will fill the form. They will click the right button. Attackers will **not**. They guess every assumption. By the end of this map you should hear “what could go wrong **here**, in security?” in Go, Python, Node, anything — the language does not matter.' },
        ],
      },
      {
        heading: '3. The app speaks several languages',
        blocks: [
          { type: 'p', text: 'Injection is decades old and still common because of one fact: **your backend speaks more than one language**. SQL to the database. HTML/CSS/JS toward the browser. Shell toward the OS when you resize a file or call a CLI. Each language has **grammar**, **special characters**, and a line between **command** and **data**.' },
          { type: 'p', text: 'The user mostly speaks **browser**. Trouble starts when that input **crosses a boundary** and the other language treats a quote or a semicolon as **syntax**. SQL injection, command injection, XSS — same root: **data confused for code**.' },
          {
            type: 'pre',
            lines: `intended:  [SQL CODE] + [user data]
happened:  [SQL CODE] + [user data that is also SQL]
         = [different program]`,
          },
          {
            type: 'kid',
            items: [
              'You asked for a name on a nametag. They wrote a sentence that the kitchen read as a recipe.',
              'The nametag language and the recipe language both use commas. That is the hole.',
            ],
          },
        ],
      },
      {
        heading: '4. SQL injection — login, then the whole table',
        blocks: [
          { type: 'p', text: 'Login: email + password in the browser. Server asks the database for that user. **Happy path:** Alice types `alice@mail.test`. You concatenate:' },
          {
            type: 'pre',
            lines: `query = "SELECT * FROM users WHERE email = '" + userEmail + "'"`,
          },
          { type: 'p', text: 'Works for Alice. The attacker types something that is **not an email**:' },
          {
            type: 'pre',
            lines: `email field:  ' OR '1'='1' --

becomes:
SELECT * FROM users WHERE email = '' OR '1'='1' --'
                 empty      always true    rest commented`,
          },
          { type: 'p', text: 'The first quote **closes** the string the server opened. `OR 1=1` is always true. `--` comments out whatever you had for password. The database returns **every row**. Two users in the demo table, both come back — emails included — and nobody typed a real address.' },
          { type: 'p', text: 'Worse shape: close the string, then a second statement that drops the users table. Some modern drivers **refuse** stacked queries. Old drivers, or a shell that will run them, **delete the table**. UNION can pull **other** tables (payments) into the same result. This is not a party trick. It is “string plus input = a new program.”' },
          {
            type: 'kid',
            items: [
              'You asked “is this locker number Alice?” They answered “or is 1=1?” The clerk said yes to the whole hallway.',
              'Then they added “and throw the locker room away.” Some clerks still do it.',
            ],
          },
        ],
      },
      {
        heading: '5. The fix — parameters, then a poorer DB user',
        blocks: [
          { type: 'p', text: '**Parameterized queries / prepared statements:** send the **template** and the **values** as two things. `$1` (or `?`, depending on the driver) is a **slot**. The database **parses the SQL first**. Then it fills the slot as **pure data**. The malicious string is a search for a weird email, not a second command.' },
          {
            type: 'pre',
            lines: `// mashed string — the database parses user text as SQL
"SELECT * FROM users WHERE email = '" + email + "'"

// two envelopes — structure locked, then data
db.query("SELECT * FROM users WHERE email = $1", [email])`,
          },
          { type: 'p', text: 'Second door: the credential your **app** uses to talk to Postgres should be **DML** — insert, update, delete, select. **Not** DDL. No `DROP`, `ALTER`, `CREATE`. Even if injection still happens, the table does not vanish. Least privilege is not a slogan here. It is the blast radius after you already failed.' },
          { type: 'quote', text: 'The slot is data. The app user cannot drop tables. Two layers. You want both.' },
        ],
      },
      {
        heading: '6. Command injection — same trick, the OS',
        blocks: [
          { type: 'p', text: 'Same pattern, different language. Upload an image; the server shells out to a CLI (resize, compress). If the **output filename** is concatenated into `ffmpeg ... -o ` + userInput, the attacker puts a filename **and** a semicolon **and** `rm -rf /` (or whatever the shell will run). You intended one command. The OS heard two.' },
          {
            type: 'ul',
            items: [
              'Do **not** build a shell string from user text.',
              'Call a **library** (decode/resize in-process) or `execFile` with an **argv array** and an **allowlist** for names (`basename`, no `..`).',
              'If you do not need a shell, do not start one.',
            ],
          },
          { type: 'p', text: 'Template injection and LDAP filters are cousins: user text lands in **another grammar**. The prevention pattern is always: **safe API**, **escape for that context**, **allowlist**, never mash strings.' },
        ],
      },
      {
        heading: '7. Passwords — hash, then salt, then go slow',
        blocks: [
          { type: 'p', text: 'Plaintext in the table: a dump is every account, and people **reuse** passwords. Hashing is **one-way**, fixed length, same input → same output. On login you hash what they typed and **compare hashes**. A breach gives hashes, not the secret — **if** that were the whole story.' },
          { type: 'p', text: 'It is not. Fast hashes (MD5, SHA-256 as a **password** scheme) are a GPU toy: billions of guesses a second. Attackers keep **rainbow tables**: common passwords → their hashes under the popular algorithm. `password` and `12345` light up. Hashing alone is not enough.' },
          { type: 'p', text: '**Salt:** a random per-password value mixed in so the same password is a **different** hash for Maya and for Bob. Rainbow tables stop being a lookup. bcrypt / Argon2 / scrypt **salt for you** — do not invent your own mixer. **Argon2id** is the current default people mean; bcrypt was the web default for a long time. Both are **slow on purpose**. SHA-256 is a fine **integrity** hash and a bad **password** hash.' },
          {
            type: 'table',
            columns: ['Store', 'After a dump'],
            rows: [
              ['Plaintext', 'Every password, immediately.'],
              ['Fast hash, no salt', 'Rainbow + GPU. Common passwords fall.'],
              ['Slow salted (Argon2id / bcrypt)', 'Each guess is expensive. Same password, different rows.'],
            ],
          },
          { type: 'p', text: 'Building full auth (OAuth, session revoke, MFA, linking “same email, Google vs password”) is a **product**. This map already has an Auth lesson. The security extra here is: **what you store**, and that a **slow** hash also **costs your CPU** — which is why login **rate limits** exist (next).' },
        ],
      },
      {
        heading: '8. Sessions — the cookie flags are the lock',
        blocks: [
          { type: 'p', text: 'Stateful auth: server stores the session (DB and/or Redis); the browser holds a **session id**. That id must be **un-guessable** (cryptographic random, lots of bits), not `user-17`. Put it in a **cookie**, not localStorage — JS on a poisoned page can read storage.' },
          {
            type: 'ul',
            items: [
              '**HttpOnly** — JavaScript cannot read it. XSS (later) then cannot yeet the session to the attacker as easily.',
              '**Secure** — cookie only rides **HTTPS**. Cafe Wi-Fi plus HTTP is a postcard. Encrypted hops are the point.',
              '**SameSite** — **Strict**: only your own origin. **Lax**: top-level clicks (a normal link), not images/iframes. **None**: everywhere, and it **requires** Secure. For a session id you want **Strict**, or Lax if Strict breaks real links. You almost never want None.',
            ],
          },
          { type: 'p', text: 'SameSite is also how modern stacks **starve CSRF** (cookies no longer auto-attach to a stranger img or iframe). Revocation is the stateful superpower: delete the row, the id is junk. That costs Redis/DB — the Auth lesson trade.' },
        ],
      },
      {
        heading: '9. JWT — the payload is not a secret',
        blocks: [
          { type: 'p', text: 'Stateless: three base64 chunks, `header.payload.signature`. Header names the algorithm. Payload is **claims** (`sub`, `exp`, maybe a role). Signature proves **you** minted it. The middle is **encoding, not encryption**. Anyone can decode the JSON. Do not put emails, phone numbers, or “secrets” in claims. Put an **id**. Check `exp`. Enforce the algorithm **on the server** — do not let the token pick `none`.' },
          { type: 'p', text: 'The pain: you **cannot un-issue** a JWT until it expires. Stolen token works until `exp`. Workaround the industry uses: **short access** (minutes) plus **refresh** (hours/days). Access rides requests. On 401 the client spends the refresh to get a new pair. Steal the access, the window is small. Steal the refresh too, the window is the refresh TTL — still not “forever,” still not a revoke button unless you **version** refresh tokens in a store (then you are a bit stateful again).' },
          { type: 'quote', text: 'Decode is not verify. Verify is the signature plus expiry plus the algorithm you meant.' },
        ],
      },
      {
        heading: '10. Rate limits — login is a special door',
        blocks: [
          { type: 'p', text: 'Without a limit, someone tries **thousands** of passwords a second: they hit a match, or they **knock the box over** (your slow hash becomes a self-DoS). Auth endpoints should be **stingy**. The rest of the API can be looser.' },
          {
            type: 'ul',
            items: [
              '**Per IP** — e.g. 10 logins a minute. Stops dumb scripts. Fails when a campus **shares an egress IP**, and when attackers **rotate** IPs / botnets.',
              '**Per account** — e.g. five failures in fifteen minutes, then lock until a human. Stops “hammer Maya from a thousand IPs.” Fails when they try **one password across every account**.',
              '**Global** — e.g. N failed logins per minute **for the whole service**. The spray still trips a wire.',
            ],
          },
          { type: 'p', text: 'Layers, not one knob. Numbers are **examples** — measure your real traffic. Alert when the global counter spikes. This is Observe plus Security in the same hallway.' },
        ],
      },
      {
        heading: '11. BOLA — logged in is not “this invoice”',
        blocks: [
          { type: 'p', text: 'Authentication middleware at the **route**: cookie / Bearer valid → 401 if not. Role middleware: member vs admin. That is still the **door of the building**. **Broken object-level authorization** (BOLA / BA): you then fetch the invoice by id only and return it. Any logged-in user who **guesses ids** downloads every other invoice, then money, then social-engineering lists.' },
          { type: 'p', text: 'Fix: ownership **at the query**. Context already has `userId` from Auth. `WHERE id = $1 AND user_id = $2`. No row → treat it as missing. Do this on **update and delete**, not only select.' },
          {
            type: 'pre',
            lines: `// false safety: any member can fetch any id
SELECT * FROM invoices WHERE id = $1

// the row must belong to this user
SELECT * FROM invoices WHERE id = $1 AND user_id = $2`,
          },
          { type: 'h3', text: '403 vs 404' },
          { type: 'p', text: 'Fetch, then `if (invoice.userId !== ctx.userId) return 403` **confirms the id exists**. An enumerator learns which numbers are real, then phishes. Prefer **one query** with ownership. Zero rows → **404**. They cannot tell “not in the database” from “not yours.” You still **log** the miss internally with user id + request id (Errors / Observe). The client gets a boring not-found.' },
          {
            type: 'kid',
            items: [
              'The badge got them into the building. It did not get them into every locker.',
              'If you say “that locker exists but you cannot open it,” they now know which doors to pick later.',
            ],
          },
        ],
      },
      {
        heading: '12. BFLA — hiding /admin is not a lock',
        blocks: [
          { type: 'p', text: '**Broken function-level authorization:** the user should not run **admin functions** (list **all** invoices). You cannot `AND user_id = me` — the admin **must** see everyone. The bug is “the URL is secret.” Login is the same for member and admin; only the path is obscure. **Security through obscurity.** Someone finds `/admin/invoices` and the API has no role check.' },
          { type: 'p', text: 'Fix: **centralize** authorization. One layer every request walks. **Default deny:** if the layer does not **explicitly allow** this role on this action, refuse. New endpoints start closed. **Test the ugly paths** in CI: user A cannot read user B; member cannot hit admin; anonymous cannot hit authed. Happy-path tests are how BOLA ships.' },
        ],
      },
      {
        heading: '13. XSS — user HTML is a program',
        blocks: [
          { type: 'p', text: 'Comments, bios, markdown → HTML. If you inject that string into the DOM, a **script tag** the attacker smuggled in runs **as your site**. **Stored XSS:** every later viewer runs it. Cookies (if not HttpOnly), storage, phishing redirects — session stolen. Frameworks name this honestly (`dangerouslySetInnerHTML`) so you feel the heat.' },
          { type: 'p', text: '**Sanitize on the way in** (strip scripts, allow a tiny tag list). Escape on the way out. That is prevention. **Content-Security-Policy** is a header: no inline scripts, scripts only from your origin. CSP is **not** the fix. It is the last net if sanitizing missed. Defense in depth, same as SQL parameters plus a DML-only user.' },
        ],
      },
      {
        heading: '14. CSRF — cookies that tag along',
        blocks: [
          { type: 'p', text: 'The browser **attaches cookies** to requests to that site, even when the **page** is some other origin. Classic trick: `<img src="https://your.api/transfer?...">` while the user is still logged in. Your server sees a real session. **SameSite=Lax/Strict** stops most of this on modern browsers. CSRF tokens (random field the attacker cannot read) are the old belt. The chapter treats CSRF as **smaller** on current stacks **if** cookies are SameSite and you are not living in 2012. Legacy apps still die here. Know the picture; do not skip SameSite because “CSRF is over.”' },
        ],
      },
      {
        heading: '15. Misconfiguration — git and debug',
        blocks: [
          { type: 'p', text: 'Secrets in source: DB passwords, JWT keys, vendor keys. They go to the remote, then to everyone with repo access. **Deleting the file does not delete history.** Rotate **immediately**. Live in env / a vault (Config lesson).' },
          { type: 'p', text: '**Debug in production:** stack traces name files and functions. SQL and pool internals print. Local wants that. Prod wants **info** (Observe). Clients get **boring** 500s (Errors). Debug mode is a guided tour of your internals.' },
        ],
      },
      {
        heading: '16. Keep reading — the map is not the territory',
        blocks: [
          { type: 'p', text: 'OWASP Top 10 and the cheat-sheet series are the shared vocabulary. Hands-on labs (the usual web-security academies) train the attacker question until it is a reflex. Session-id randomness, cookie flags, injection — you will meet them again under different names. This chapter is **awareness plus the moves that show up in backend code**. The rest is homework on purpose.' },
        ],
      },
      {
        heading: '17. Quick map',
        blocks: [
          {
            type: 'table',
            columns: ['Hole', 'Assumption', 'Close it'],
            rows: [
              ['SQLi', 'Email is data', 'Parameters. DML-only DB user.'],
              ['Cmd inject', 'Filename is a name', 'No shell strings. Allowlist. Libraries.'],
              ['Rainbow', 'Hash is enough', 'Slow + salt (Argon2id).'],
              ['XSS steal', 'JS will not read the cookie', 'HttpOnly + sanitize + CSP last.'],
              ['Cafe Wi-Fi', 'HTTP is fine', 'Secure cookie. HTTPS.'],
              ['CSRF', 'Only our page sends cookies', 'SameSite. Tokens if you must.'],
              ['JWT dump', 'Payload is secret', 'It is base64. Short access + refresh.'],
              ['BOLA', 'Logged in = this row', '`AND user_id`. 404 not 403.'],
              ['BFLA', 'Hidden URL = admin', 'Role at the function. Default deny.'],
              ['Stuffing', 'Login can be unbounded', 'IP + account + global limits.'],
              ['Git', 'We will not commit .env', 'Vault. Rotate history leaks.'],
            ],
          },
          {
            type: 'callout',
            lines: [
              '**Ask where you assumed.** Then ask which language that string will be parsed as.',
              '**Authn is the building. Authz is the locker.** Query both.',
              'No stack is finished. Layer the doors anyway.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'handlers',
    n: 9,
    title: 'What is the Request Lifecycle? Controllers, Services, Repositories',
    label: 'Handlers',
    cluster: 'surface',
    x: 1040,
    y: 90,
    gist: 'Inside the server, a request is not “hit the database.” It is handler → service → repository — HTTP at the edge, rules in the middle, SQL at the bottom.',
    remember: [
      'Handler / controller: req + res. Bind, validate, call the service, pick the status code.',
      'Service: business rules. No HTTP. Usable from a job or a CLI, not only from a route.',
      'Repository: one focused DB move. Service orchestrates; repo does not invent the product.',
    ],
    sections: [
      {
        heading: '1. The request lifecycle inside the server',
        blocks: [
          { type: 'h3', text: 'Core idea' },
          { type: 'p', text: 'A client sends HTTP. The OS forwards that packet to your port (`3000`, `4000`, …). From **entry** until a **response** leaves, that is the **request lifecycle inside the server** — not the DNS/TLS hops outside.' },
          { type: 'quote', text: 'These layers were going to be separate lessons. They only make sense **together**, so they live as one picture — then Middleware and Context zoom in.' },
          {
            type: 'pre',
            lines: `Request
  → middleware (optional, around everything)
  → route match
  → handler / controller     HTTP boundary
  → service                  business rules
  → repository               database
  → database
Response  (handler picks the status + body)`,
          },
          {
            type: 'table',
            columns: ['Layer', 'Job', 'Knows about'],
            rows: [
              ['**Handler / controller**', 'In and out of HTTP', '`req`, `res`, status codes, JSON'],
              ['**Service**', 'What the product *means*', 'Rules, workflows — **not** status codes'],
              ['**Repository**', 'Talk to the store', 'SQL / queries — one job per method'],
              ['**Middleware**', 'Shared work around every call', 'Auth, CORS, logs, errors — see node 7'],
              ['**Request context**', 'Trusted bag for *this* call only', 'User id, request id — see node 8'],
            ],
          },
          {
            type: 'kid',
            items: [
              'A letter arrives at a building. **Reception** (handler) reads the envelope and writes the reply.',
              '**Office** (service) decides what the letter *means*. **Filing cabinet** (repository) is the only one who opens the drawers.',
            ],
          },
        ],
      },
      {
        heading: '2. Handler / controller — the HTTP door',
        blocks: [
          { type: 'p', text: 'After routing picks a function, that function is the **handler** (many teams say **controller**). Same job: it is the first code that *owns* HTTP for this route.' },
          { type: 'p', text: 'It receives two objects from the runtime:' },
          {
            type: 'ul',
            items: [
              '**Request (`req`)** — headers, query, path params, body, cookies. Everything the client sent.',
              '**Response (`res`)** — how you send data and a status back.',
            ],
          },
          { type: 'h3', text: 'What you pull depends on the method' },
          {
            type: 'pre',
            lines: `GET     → query params + path params     (list / one record)
POST    → JSON body                      (create)
PUT/PATCH → JSON body + path id          (update)
DELETE  → path id (sometimes body)       (remove)`,
          },
          { type: 'p', text: 'Then, still at this door — **before** the service:' },
          {
            type: 'ul',
            items: [
              '**Deserialize** JSON into a native object / struct. Fail → **400**, do not enter the service.',
              '**Validate** required fields and types (the gate from lesson 6).',
              '**Transform** — defaults if the client omitted a sort, lowercase an email, cast `page` from `"2"` to `2`.',
            ],
          },
          { type: 'p', text: 'The controller **controls the data flow**: client → server → client. It does **not** invent the product. It calls the service, then picks **200 / 201 / 204** on success, **400** on a client mistake, **500** on a crash, plus the body.' },
          {
            type: 'pre',
            lines: `GET /catalog
handler
  1. (nothing to bind — GET list)
  2. catalogService.list()
  3. 200 + array of items

POST /catalog
handler
  1. JSON → object   (fail → 400)
  2. validate + transform
  3. catalogService.create(input)
  4. 201 + created item`,
          },
          {
            type: 'kid',
            items: [
              'Reception opens the envelope, checks the form is filled in, stamps the date, hands it to the office, and later puts the answer in a return envelope with a stamp (200 vs 400).',
              'Reception does not rewrite the company’s prices. That is the office.',
            ],
          },
        ],
      },
      {
        heading: '3. Service — the brain (no HTTP)',
        blocks: [
          { type: 'p', text: 'The **service** is business logic. It should not know JSON, status codes, or that a browser exists. A good service is a function you could also call from a **background job** or a **CLI**.' },
          {
            type: 'ul',
            items: [
              'What operations should happen.',
              'Which rules apply (unique title? enough stock?).',
              'How to **orchestrate** — maybe two repository calls, then send mail.',
            ],
          },
          { type: 'quote', text: 'The service does not format the response. The handler does. Swap them and SQL leaks into the route, and HTTP leaks into the rules.' },
          {
            type: 'pre',
            lines: `// service — no req, no res
func createItem(input) {
  if repo.existsTitle(input.title) { return error "title taken" }
  row = repo.insert(input)
  return row
}`,
          },
          {
            type: 'kid',
            items: [
              'The office decides: “We already have a book with that name — refuse.” or “File it, then mail a receipt.”',
              'The office never writes “HTTP 409” on the form. Reception picks the stamp.',
            ],
          },
        ],
      },
      {
        heading: '4. Repository — one drawer at a time',
        blocks: [
          { type: 'p', text: 'The **repository** is the only layer that speaks database. It builds the query from parameters the service passed, runs it, returns rows or an error.' },
          { type: 'p', text: 'Each method should do **one** thing: fetch all, fetch one, insert, update, delete. Not “fetch plus send email plus charge a card.”' },
          {
            type: 'pre',
            lines: `repo.list()              → SELECT * FROM items
repo.getById(88)         → SELECT * FROM items WHERE id = 88
repo.insert(row)         → INSERT INTO items ...
repo.update(88, patch)   → UPDATE items SET ... WHERE id = 88`,
          },
          { type: 'p', text: 'Swap Postgres for another store later and you want to rewrite **this** layer — not the service rules, and not the HTTP door.' },
          {
            type: 'kid',
            items: [
              'The filing cabinet only files and fetches. It does not decide prices and it does not talk to the mailman.',
              'One drawer, one job: “get folder 88,” not “get folder 88 and also rewrite the company handbook.”',
            ],
          },
        ],
      },
      {
        heading: '5. Where middleware and context sit',
        blocks: [
          { type: 'p', text: 'The three layers above are the **spine**. Two more pieces wrap that spine. They are the rest of this video — and their own nodes on the map.' },
          {
            type: 'ul',
            items: [
              '**Middleware (node 7)** — optional handlers *in the middle*. `req`, `res`, `next()`. Auth, CORS, rate limit, logs, compression, global errors. Order is behavior. Auth before the handler; error mapper last.',
              '**Request context (node 8)** — a bag that lives only for **this** request. Auth middleware puts a verified user id in it. The handler must **not** trust `body.userId` from the client.',
            ],
          },
          {
            type: 'pre',
            lines: `// wrong — client can send someone else's id
createItem({ ...body, userId: body.userId })

// right — id came from the token, stored on context
createItem({ ...body, userId: ctx.userId })`,
          },
          {
            type: 'kid',
            items: [
              'Security at the gate (middleware) checks the badge **before** reception.',
              'The badge number is written on a sticky note for *this visit only* (context). Do not believe the number the visitor wrote on their own form.',
            ],
          },
        ],
      },
      {
        heading: '6. Quick map',
        blocks: [
          {
            type: 'table',
            columns: ['Concept', 'Real-world analogy', 'What it does'],
            rows: [
              ['Handler / controller', 'Reception', 'HTTP in/out, status, JSON'],
              ['Service', 'The office', 'Rules and orchestration — no HTTP'],
              ['Repository', 'Filing cabinet', 'One focused database move'],
              ['Middleware', 'Guards and stamps in the hallway', 'Shared work before/after the handler'],
              ['Request context', 'Sticky note for this visit', 'Trusted state for this request only'],
            ],
          },
          {
            type: 'callout',
            lines: [
              '**Handler** talks HTTP. **Service** talks product. **Repository** talks SQL.',
              'Middleware is the hallway. Context is the sticky note — never a global.',
              'Open **7 · Middleware** and **8 · Context** for the rest of this same video.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'crud',
    n: 10,
    title: 'CRUD: Four Moves on a Resource — Create, Read, Update, Delete',
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
    sections: [
      {
        heading: '1. Why this lesson exists',
        blocks: [
          { type: 'h3', text: 'Core idea' },
          { type: 'p', text: 'Most first backends are a table with four buttons: add a row, show a row, change a row, remove a row. Tutorials call that “an API.” It is not a product. It is the **skeleton** every persistence layer already understands — **CRUD**: create, read, update, delete.' },
          { type: 'p', text: 'HTTP already had verbs for those moves. This lesson is the mapping so a client can **guess** what happens without reading your source. The next lesson (REST) is the full contract: paths, pagination, custom actions. Stay here until the four letters are boring.' },
          { type: 'quote', text: 'CRUD is how you touch a resource. It is not why the resource exists.' },
          {
            type: 'kid',
            items: [
              'A locker has four jobs: put something in, look inside, swap what is there, empty it. That is CRUD. The locker is not the school.',
              'If every kitchen invented a fifth button that meant “maybe soup,” dinner would be an argument. Four moves. Then recipes.',
            ],
          },
        ],
      },
      {
        heading: '2. The four letters',
        blocks: [
          { type: 'p', text: 'Say them as **operations on one kind of thing** (a user, a note, a book) — not as framework methods. The thing is the **resource**. CRUD is what you are allowed to do to it.' },
          {
            type: 'table',
            columns: ['Letter', 'Operation', 'What changed in the world'],
            rows: [
              ['**C**', 'Create', 'A new record exists that did not exist before.'],
              ['**R**', 'Read', 'Nothing. You looked. The store is the same.'],
              ['**U**', 'Update', 'An existing record is different now.'],
              ['**D**', 'Delete', 'That record is gone (or marked gone).'],
            ],
          },
          { type: 'p', text: 'Read splits in two shapes you will use every day: **list** (many) and **get one**. Both are R. Create / update / delete usually target **one** record. List is the collection; the others punch a hole in it.' },
        ],
      },
      {
        heading: '3. Map onto HTTP',
        blocks: [
          { type: 'p', text: 'The browser and every HTTP client already speak verbs. Do not invent `POST /getUser`. The method **is** the verb. The path **is** the noun.' },
          {
            type: 'table',
            columns: ['CRUD', 'HTTP method', 'Typical path'],
            rows: [
              ['Create', '**POST**', '`/notes`'],
              ['Read list', '**GET**', '`/notes`'],
              ['Read one', '**GET**', '`/notes/:id`'],
              ['Update', '**PUT** or **PATCH**', '`/notes/:id`'],
              ['Delete', '**DELETE**', '`/notes/:id`'],
            ],
          },
          { type: 'p', text: 'Same path `/notes` — **method** decides list vs create. Same path `/notes/:id` — method decides read vs change vs remove. That split is the whole trick. REST will name it collection vs item. You already have it.' },
          {
            type: 'pre',
            lines: `POST   /notes           // create
GET    /notes           // list
GET    /notes/42        // one
PATCH  /notes/42        // change some fields
PUT    /notes/42        // replace the whole record
DELETE /notes/42        // remove`,
          },
          {
            type: 'kid',
            items: [
              'The drawer is labeled **notes**. Opening it (GET) is not the same as dropping a new page in (POST).',
              'You do not write “please delete” on a GET. The verb on the envelope is the instruction.',
            ],
          },
        ],
      },
      {
        heading: '4. Status codes that match the move',
        blocks: [
          { type: 'p', text: 'CRUD without honest status codes is a shrug. The client should know **what happened** before it parses JSON. You already have the HTTP lesson. Here is the cheat sheet for these four moves.' },
          {
            type: 'table',
            columns: ['Move', 'Success', 'Gone / missing'],
            rows: [
              ['Create (POST)', '**201** Created — body is the new row. Send **Location** with the new URL.', '409 if a unique rule blocked you.'],
              ['Read (GET)', '**200** — list or one item. Empty list is still **200** + `[]`, not 404.', '**404** if that id does not exist.'],
              ['Update (PUT/PATCH)', '**200** with the new representation, or **204** if you send no body.', '**404** if there is nothing to change.'],
              ['Delete (DELETE)', '**204** No Content (usual). **200** if you return a leftover payload.', '**404** if it is already gone — still fine; delete is idempotent.'],
            ],
          },
          { type: 'p', text: '**Location** on create is the polite part people skip: `Location: /notes/42` so the client does not have to guess the id you just minted. 201 without Location still works. 201 with Location is the contract adults use.' },
          { type: 'quote', text: 'Do not 200 everything. Create is 201. Empty list is 200. Missing id is 404. The number is the sentence.' },
        ],
      },
      {
        heading: '5. PUT vs PATCH — replace vs a few fields',
        blocks: [
          { type: 'p', text: '**PUT** = send the **whole** record and replace what the server has. Miss a field, and a strict PUT may wipe it. **PATCH** = send **only what changed**. JSON APIs almost always PATCH. PUT was more natural when a full HTML form posted every input.' },
          { type: 'p', text: 'Internally, your service may “read, merge, write” for both. On the **wire**, pick one and keep it. Mixing them on a public API is how integrators open Slack at 2am. REST will push PATCH for SPAs. Remember both names so you can read other people’s code.' },
          {
            type: 'pre',
            lines: `PATCH /notes/42
{ "title": "New title" }          // only title changes

PUT /notes/42
{ "id": 42, "title": "New title", "body": "...", "createdAt": "..." }
                                   // the whole representation`,
          },
        ],
      },
      {
        heading: '6. Idempotency — same call, same world',
        blocks: [
          { type: 'p', text: '**Idempotent** = doing it **N times** has the same effect as doing it once. Reads are easy: GET does not write. PUT and PATCH that set `title` to `"B"` stay `"B"` if you send them again. DELETE: first call removes the row; second call, there is nothing left to remove.' },
          { type: 'p', text: '**POST is not idempotent.** Same body twice can mean **two rows**. A double-click on “Pay” or “Send email” is how you charge a card twice. Unique constraints save you sometimes. They are not a design. For money and mail, you want an **idempotency key** (client sends a token; you store “already did this”) — REST and queues will meet that again.' },
          {
            type: 'table',
            columns: ['Method', 'Idempotent?', 'If they retry'],
            rows: [
              ['GET', 'Yes', 'Same read. No extra rows.'],
              ['PUT / PATCH', 'Yes', 'Same fields, same result.'],
              ['DELETE', 'Yes', 'Still gone. Often 404 the second time.'],
              ['POST', 'No', 'A second create / charge / email unless you guard it.'],
            ],
          },
          {
            type: 'kid',
            items: [
              'Putting the same sticker on the locker a hundred times still leaves **one** sticker. PUT.',
              'Dropping a new marble in the jar every time you press the button is POST. The jar grows.',
            ],
          },
        ],
      },
      {
        heading: '7. Delete is a product decision',
        blocks: [
          { type: 'p', text: '**Hard delete** = `DELETE FROM notes WHERE id = 42`. The row is gone. Recovering it is backups or luck. **Soft delete** = set `deleted_at` and hide it from normal reads. Undo is a PATCH that clears the stamp. Lists must remember to filter `deleted_at IS NULL` or you “deleted” nothing anyone notices.' },
          { type: 'p', text: 'GDPR-style “forget this person” is often **hard** (or anonymize). “User hit undo for 30 days” is **soft**. Pick one per resource. Do not mix them in the same table without a rule.' },
          { type: 'p', text: 'From the client, both are still **DELETE /notes/:id**. The service decides how gone is gone. The handler still only speaks HTTP.' },
        ],
      },
      {
        heading: '8. CRUD is the skeleton, not the product',
        blocks: [
          { type: 'p', text: 'Archive, publish, invite, charge the card, “mark as spam” — those are **workflows**. They are not a fifth letter. They do not fit cleanly in C, R, U, or D. HTTP’s leftover verb for that is **POST** on a **verb path**: `POST /notes/42/publish`. Status follows **what happened** (often 200), not “POST always means 201.”' },
          { type: 'p', text: 'A backend that is only CRUD on tables will still need auth, validation, a service layer, and a repository — the handlers lesson. CRUD is the **shape of the routes**, not a substitute for rules. If the product is “a spreadsheet on the internet,” CRUD may be most of the surface. If the product is “checkout,” CRUD is the easy third of the work.' },
          { type: 'quote', text: 'Four buttons on a table are how you start. Workflows are why anyone stays.' },
          {
            type: 'kid',
            items: [
              'The locker operations are still four. “Lend this book to Maya until Friday” is a story, not a fifth button on the metal.',
              'You can have a perfect CRUD API and still have no product — just a database with extra steps.',
            ],
          },
        ],
      },
      {
        heading: '9. Quick map',
        blocks: [
          {
            type: 'table',
            columns: ['Idea', 'On the wire', 'Do not confuse with'],
            rows: [
              ['Create', 'POST + 201 + Location', 'GET with a body'],
              ['Read', 'GET 200. Empty list is 200 + []', '404 on an empty collection'],
              ['Update', 'PATCH some fields, PUT the whole row', 'POST /updateNote'],
              ['Delete', 'DELETE → 204. Soft vs hard is a service choice', 'GET /notes/42/delete'],
              ['Workflow', 'POST on a verb path', 'A fifth CRUD letter'],
            ],
          },
          {
            type: 'callout',
            lines: [
              '**Method is the verb. Path is the noun.** That is CRUD on HTTP.',
              '**201** create. **200** read. **204** delete. **404** that id is missing.',
              'Open **11 · REST** when you want the full contract: plural paths, pagination, and custom actions.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'rest',
    n: 11,
    title: 'Complete REST API Design: Resources Clients Can Guess Without Reading Your Code',
    label: 'REST',
    cluster: 'surface',
    x: 1325,
    y: 125,
    gist: 'REST is a contract: plural nouns in the path, verbs in the method, JSON in camelCase. Design the interface first — then code. Pagination, sort, filter, and sane defaults are part of that contract, not extras.',
    remember: [
      'Collection `GET/POST /books`. Item `GET/PATCH/DELETE /books/:id`. Same path, different method.',
      'POST is not idempotent (custom actions live here). Money/mail: Idempotency-Key so a retry is not a second charge.',
      'List: 200 + empty array, never 404. Create: 201. Delete: 204. Missing item: 404. Defaults: page 1, limit 10, sort createdAt desc.',
    ],
    sections: [
      {
        heading: '1. Why this video exists',
        blocks: [
          { type: 'h3', text: 'Core idea' },
          { type: 'p', text: 'API design is a huge slice of backend work. This lesson is **REST only** — not RPC, not GraphQL. The standards already exist. Juniors still stall on the same questions: **plural or singular?** **PATCH or PUT?** **What method for a custom action** that is not create/read/update/delete? **Which status code?**' },
          { type: 'p', text: 'Those questions feel eternal because the web they were written for was **multi-page**: every click was a full HTML round-trip. Today the client is often a **single-page app** — one download of JS, routing in the browser, JSON back and forth. The HTTP verbs did not change. The **payloads** did.' },
          { type: 'quote', text: 'Extract rules from the existing standard. Stick to them so you can stop arguing about REST and start writing the product.' },
          { type: 'p', text: 'Scope of this lesson: resources, routes, success and error shapes, status codes, what to accept. After this, **business logic**. Not a new standard — a consistent style so nobody has to guess.' },
          {
            type: 'kid',
            items: [
              'The class already agreed: homework goes in the blue tray. You do not invent a red tray every week.',
              'If every kitchen numbered the spoons differently, dinner would be an argument. Pick the numbering everyone already knows.',
            ],
          },
        ],
      },
      {
        heading: '2. Where REST came from (short history)',
        blocks: [
          { type: 'p', text: 'Around 1990 the web was invented to **share knowledge**: URI, HTTP, HTML, a server, a browser, a WYSIWYG editor in the browser. Those pieces still exist (HTTP/2, HTTP/3, many servers, many browsers). The user base then **exploded**. The original plan had not budgeted for that scale.' },
          { type: 'p', text: 'In the mid-90s, to keep the web from collapsing under its own traffic, a set of **constraints** was proposed. Those constraints later got a name in a 2000 PhD dissertation: **REST — Representational State Transfer**. HTTP/1.1 was standardized in that same era. You do not need to memorize the paper. You do need the six constraints, because they are why REST looks the way it does.' },
        ],
      },
      {
        heading: '3. Six constraints — why the web scales',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Client–server** — UI on the client, data and rules on the server. Each side can change without rewriting the other. Frontend / backend is this constraint with job titles.',
              '**Uniform interface** — one way to talk. Four sub-rules: identify resources (URIs); change them through **representations**; messages that describe themselves; **hypermedia as the engine of application state** (links that tell you what you can do next). Consistency beats a special protocol per service.',
              '**Layered system** — a layer only sees the layer below it. Load balancers and proxies can sit in the middle **without** the app changing.',
              '**Cache** — the server must **label** a response cacheable or not. Clients that cache cut load and feel faster. (The caching lesson is this constraint in production.)',
              '**Stateless** — each request carries **everything** needed to process it. The server does not remember your last call. Any replica behind a load balancer can serve you. (Covered with HTTP earlier.)',
              '**Code on demand** (optional) — the server may send executable code (JavaScript) to extend the client. Optional; not the daily REST you design.',
            ],
          },
          {
            type: 'kid',
            items: [
              'The kitchen (server) does not remember your last order. Every ticket has the full order on it — so any cook can make it.',
              'A uniform menu: you do not invent a secret handshake for the soup station.',
            ],
          },
        ],
      },
      {
        heading: '4. What the name REST actually means',
        blocks: [
          { type: 'p', text: '**Representational** — a resource (a user, a cart) is shown in a **format**: JSON for API clients, HTML for a browser, sometimes XML. Same user row, different clothes. Server-to-server is usually JSON; a classic page load is HTML.' },
          { type: 'p', text: '**State** — the current attributes of that resource. A cart’s state is the line items, quantities, total. That state rides in the representation.' },
          { type: 'p', text: '**Transfer** — client and server **move** those representations over HTTP (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, plus `HEAD` / `OPTIONS`). Fetching a page with GET is transferring an HTML representation.' },
          { type: 'quote', text: 'REST: resources have formats; their state can move; clients and servers share representations; the six constraints keep that scalable. You do not need the dissertation in your pocket — you need this picture.' },
        ],
      },
      {
        heading: '5. Anatomy of an API URL',
        blocks: [
          { type: 'p', text: 'A normal website URL: **scheme** (`http` / `https`) + **authority** (domain, maybe subdomain) + **path** (resource; `/` means hierarchy) + **query** (key–value filters on GET) + optional **fragment** (`#section` — browser scroll, not the server).' },
          { type: 'p', text: 'An API URL, as most companies ship it: `https://api.example.com/v1/books`. Subdomain **`api`**. Path version **`/v1`** (or `/v2`) so old clients can live. Then the resource. Industry habit, not a law — but if you skip versioning in a demo, remember production usually has it.' },
          {
            type: 'pre',
            lines: `https://api.example.com/v1/books
https://api.example.com/v1/books/harry-potter

scheme      https
host        api.example.com     // api. subdomain
version     /v1
collection  /books              // always plural
item        /books/:id-or-slug`,
          },
        ],
      },
      {
        heading: '6. Paths — plural, slug, hierarchy',
        blocks: [
          { type: 'p', text: '**Always plural** in the path, even for one book. The resource is the **collection** `books`. `GET /book/123` is the classic mistake: you are still talking about the books resource.' },
          { type: 'p', text: '**Readable URLs.** No spaces, no underscores in the path. A human slug: lowercase (URLs travel across OS and servers; case fights are not worth it), spaces become **hyphens**: `Harry Potter` → `harry-potter`. `GET /books/harry-potter`.' },
          { type: 'p', text: 'Each `/` is a **level**: `/books` is the collection; `/books/:id` is one member of that collection. Custom actions continue the tree: `/organizations/:id/archive` = among organizations → this one → the archive action.' },
          {
            type: 'kid',
            items: [
              'The drawer is labeled **books**, not book — even when you take out one.',
              'A hyphen is a space that survives being shouted across the playground. An underscore gets eaten.',
            ],
          },
        ],
      },
      {
        heading: '7. Idempotency — same call, same world',
        blocks: [
          { type: 'p', text: '**Idempotent** = doing the action **N times** has the **same effect** as doing it once. The side effect on the **server**, caused by **this client’s request**, does not keep changing. Someone else inserting a row while you GET is **not** a failure of GET’s idempotency — you did not write.' },
          {
            type: 'table',
            columns: ['Method', 'Idempotent?', 'Why'],
            rows: [
              ['**GET**', 'Yes', 'Read only. A thousand fetches do not create a thousand books.'],
              ['**PUT / PATCH**', 'Yes', 'Set name to B. Call again: still B. Same payload → same state.'],
              ['**DELETE**', 'Yes', 'First call removes the row. Second call: nothing left to change (often **404**). No extra delete happened.'],
              ['**POST**', '**No**', 'Each call can **insert**. Same body a thousand times → a thousand rows (ids differ). Unique-name errors are a special case, not the rule.'],
            ],
          },
          { type: 'p', text: '`HEAD` (headers only) and `OPTIONS` (CORS: is this origin allowed?) exist. Daily CRUD is the five methods above.' },
          { type: 'p', text: 'POST is still allowed to create twice. Networks time out. The user does not know if Pay succeeded, so they click again. Without a guard: two charges. **$94.50** becomes **$189**.' },
          { type: 'p', text: 'For money and mail, the client sends a token the server has never seen for **this** intent. First request: charge, store the key with the response. Second request with the **same** key: do not charge again; **replay the first response** (same status, same body). Ten clicks, one charge. A **new** purchase needs a **new** key — reuse `pay_abc123` for a second ticket and you correctly refuse to charge again, which is also how a client that mints keys wrong shoots itself.' },
          {
            type: 'pre',
            lines: `POST /v1/payments
Idempotency-Key: pay_abc123

{ "orderId": "...", "amount": 94.50 }

// first  → charge, store key + response
// retry  → same key → replay. no second charge`,
          },
          { type: 'p', text: 'A unique constraint on the key is the last line of defense when two retries land at once. It is not a substitute for the header. CRUD named this; this is the meeting. Queues will meet it again: a **job** retry is recovery, not a double-click — the worker itself must be safe to run twice.' },
          {
            type: 'kid',
            items: [
              'Putting the same sticker on the locker a hundred times still leaves **one** sticker. That is PUT.',
              'Dropping a new marble in the jar every time you press the button is POST. The jar grows.',
              'The lunch ticket has a serial number. Showing the same ticket twice still gets **one** tray. That is the key.',
            ],
          },
        ],
      },
      {
        heading: '8. PUT vs PATCH — and POST as the open method',
        blocks: [
          { type: 'p', text: '**PATCH** = change **some** fields (`{ "name": "B" }`). **PUT** = send the **whole** representation and **replace** the server’s copy (id, name, createdAt, …). Internally, teams often mix them. On a **public** API, mixing them **confuses integrators** who assumed the spec. Prefer PATCH in SPA/JSON land: you almost never replace the entire row from the client. PUT was more natural when a form posted every field of an MPA page.' },
          { type: 'p', text: '**Custom actions** (not create, not read, not update, not delete): **POST** is specified as **open-ended**. `POST /send-email` with `{ "target": "a@b.com" }` is not a fetch and not a row replace. Archive, clone, “charge the card” — if it does not fit CRUD, it is POST on a **verb path** under the resource (next sections).' },
          { type: 'quote', text: 'Do not assume every POST is 201 Created. Archive is POST and often **200**. Clone is POST and often **201** because a new row appeared. Status follows **what happened**, not the method mascot.' },
        ],
      },
      {
        heading: '9. Design the interface first',
        blocks: [
          { type: 'p', text: 'Before business logic, before a framework: **design the contract**. Intuitive, not vague, mostly on-standard. If you invent `POST` for reads and `DELETE` for fetches, integrators have two options: read your source, or poke methods until something works. That is how you get Slack threads and bugs.' },
          { type: 'p', text: 'Start from **wireframes / user stories** (Figma, whatever the product team uses). The **end user** touches data through the UI; the frontend consumes **your** API; you touch the database. Nouns in those screens are your **resources**.' },
          { type: 'p', text: 'Example: a **project-management** product (think issue tracker). Nouns: **projects, users, organizations, tasks, tags**. Write them down. Next you would design tables (that is the databases lesson). Then you design **routes**. This video skips schema on purpose: interface only. Use an API client (Postman-class) to **sketch requests** — not to write Go or Node yet.' },
          {
            type: 'kid',
            items: [
              'Draw the menu **before** you cook. Guests should not have to tour the kitchen to order soup.',
              'Circle the nouns in the story: those are the drawers. Verbs are what you do to a drawer.',
            ],
          },
        ],
      },
      {
        heading: '10. Collection vs item — one URL, two jobs',
        blocks: [
          { type: 'p', text: 'For each resource, list the **actions**: list, get one, create, update, delete — then extras. Sketch **organizations**, then **projects**, then **tasks**. The pattern does not change.' },
          {
            type: 'pre',
            lines: `GET    /organizations          // list
POST   /organizations          // create   (same path, method decides)

GET    /organizations/:id      // one
PATCH  /organizations/:id      // update some fields
DELETE /organizations/:id      // remove`,
          },
          { type: 'p', text: 'The server splits list vs create by **method**, not by a `/create` suffix. Path stays lowercase. Demo servers may skip `/v1`; production usually does not. **Do not send** `id` / `createdAt` / `updatedAt` on create — the server owns those. Client body: name, status, description, …' },
        ],
      },
      {
        heading: '11. Create 201, list 200, pagination envelope',
        blocks: [
          { type: 'p', text: '**POST** success: status **201 Created**, body = the **new** row (server ids and timestamps filled in). **GET list** success: **200**, not 201 — you did not create.' },
          { type: 'p', text: 'A list is **paginated**. Returning every organization serializes a huge JSON blob, delays the API, and the UI only shows 10–20 until the user scrolls anyway. First response: a **slice** (often latest by `createdAt`). Page 2 / infinite scroll asks for the **next** slice.' },
          {
            type: 'pre',
            lines: `{
  "data": [ { "id": "...", "name": "Org 5" } ],
  "total": 5,
  "page": 1,
  "totalPages": 3
}`,
          },
          {
            type: 'ul',
            items: [
              '**data** — this page’s rows.',
              '**total** — count in the database (for “10 of 50” in the UI), independent of page size.',
              '**page** — which slice this is.',
              '**totalPages** — so infinite scroll can **stop** when `page === totalPages`.',
            ],
          },
        ],
      },
      {
        heading: '12. Query params — page, limit, sort, filter',
        blocks: [
          { type: 'p', text: 'GET has no JSON body. Control the list with **query params**. **limit** = page size. **page** = which slice (**1-based** in this design — page 1 is the first slice). Five orgs, `limit=2` → three pages (2 + 2 + 1). `page=3` returns the last leftover row.' },
          { type: 'p', text: '**Sane defaults** if the client sends nothing: `page=1`, `limit=10` or `20`. Do **not** 400 “missing page.” The first request should already be a usable list.' },
          { type: 'p', text: '**sortBy** + **sortOrder**. Default even when they omit both: **createdAt descending** (newest first). Databases do not store a stable “natural” order — unsorted lists **shuffle** between calls. If they send `sortBy=name` but no order, still default **desc**. `sortOrder=asc` when they ask. Whitelist fields (name, status, id, …) — do not sort by arbitrary strings.' },
          { type: 'p', text: '**Filter** = query keys named like fields: `?status=archived`, `?name=Org4`. Combine filters. The UI’s “active / archived” switch is this.' },
          {
            type: 'pre',
            lines: `GET /organizations
GET /organizations?limit=2&page=2
GET /organizations?sortBy=name&sortOrder=asc
GET /organizations?status=archived`,
          },
          {
            type: 'kid',
            items: [
              'Do not mail the whole yearbook. Mail **two pages**, and say “this is page 1 of 3, 5 kids total.”',
              'If they forget to say which page, you still send page 1. You do not scold them for a blank form.',
            ],
          },
        ],
      },
      {
        heading: '13. One resource — GET, PATCH, DELETE',
        blocks: [
          { type: 'p', text: '**GET /organizations/:id** — no body. **200** and the row. **PATCH /organizations/:id** — JSON with **only** changed fields. **200** and the **updated** row (not 201). **DELETE /organizations/:id** — no body. **204 No Content**: success (2xx) but **empty body** — the row is gone, there is nothing honest to return. Then list no longer includes it. GET the same id → **404** + message like “organization not found.”' },
          { type: 'quote', text: '**404 is for a specific id the client named.** A list that matches nothing is **200** and `"data": []` (total 0). A nonsense `status` filter is empty data, not “resource not found.” Never 404 a list.' },
          {
            type: 'pre',
            lines: `PATCH /organizations/abc-uuid
{ "status": "active" }          → 200 + full row

DELETE /organizations/abc-uuid  → 204 empty

GET /organizations/abc-uuid     → 404 after delete
GET /organizations?status=nope  → 200 { "data": [], "total": 0 }`,
          },
        ],
      },
      {
        heading: '14. Custom actions — archive and clone',
        blocks: [
          { type: 'p', text: '**Archive** looks like `PATCH { "status": "archived" }`. If archive also **deletes nested projects, emails members, wipes tasks**, that is **not** “set a field.” It is a **workflow**. Name it: `POST /organizations/:id/archive`. Hierarchical: collection → item → action. Response is often **200** + the org now `archived` — **not** 201, nothing new was created.' },
          { type: 'p', text: '**Clone project**: you *could* `POST /projects` with a copy-paste body. The server may also clone **tasks**, email the owner, … The client cannot know. So: `POST /projects/:id/clone`. Optional body if they want to override a field. If the server **inserts** a new project, status **201** and the new row (`"name": "Project 2 clone"`). If the id was already deleted → **404**.' },
          {
            type: 'pre',
            lines: `POST /organizations/:id/archive     → 200  (workflow; row still exists)
POST /projects/:id/clone            → 201  (new row)
POST /projects/:id/clone            → 404  (source gone)`,
          },
          {
            type: 'kid',
            items: [
              'Archiving a classroom is not “change the label on the door.” It is cancel the trips, email the parents, box the art. That is a **named action**, not a sticker.',
              'Photocopying a project folder may also photocopy every worksheet inside. The office does that in one request: **clone**.',
            ],
          },
        ],
      },
      {
        heading: '15. JSON camelCase — and be boring on purpose',
        blocks: [
          { type: 'p', text: 'Request and response **JSON fields are camelCase** (`organizationId`, `createdAt`, `sortBy`). That is the JSON convention. Postgres columns were **snake_case** (`created_at`) — the API layer **translates**. Clients should not see both styles in one product.' },
          { type: 'p', text: '**Consistency across resources.** If create-org uses `"description"`, create-project uses `"description"`, not `"dsc"`. Integrators **copy the first payload they got working**. A surprise key is a wasted hour and a validation error. Same for paths: if orgs are plural, projects are plural. Pick the global REST style; if you cannot, **still pick one style and never vary it.**' },
          { type: 'p', text: 'Server-owned fields stay out of create bodies. Nested FKs the client *must* send (`organizationId` on a project) stay in the JSON — camelCase.' },
          {
            type: 'kid',
            items: [
              'Every classroom uses the same word for “homework.” You do not say “HW” in one room and “assignment” in the next for the same tray.',
              'The database speaks snake. The hallway (JSON) speaks camel. The translator is the API, not the kid at the door.',
            ],
          },
        ],
      },
      {
        heading: '16. Sane defaults, no abbreviations, document the playground',
        blocks: [
          {
            type: 'ul',
            items: [
              '**List defaults** — page 1, limit 10/20, sort `createdAt` desc. Sorting is not optional on the server: skip it and order **wanders**.',
              '**Create defaults** — only require what you **must** have. New org without `status` → server sets **`active`**. Optional description can be omitted. The client should create with **just a name** if that is enough.',
              '**No abbreviations** — `description`, not `dsc`. You know the domain; the integrator does not.',
              '**Interactive docs** from day one (OpenAPI / Swagger-style playground). Test your own API there; give integrators a try-it page. Keeping that spec honest is a large part of looking like a backend engineer. (OpenAPI is its own node on this map.)',
            ],
          },
          { type: 'quote', text: 'A REST API is **designed** in the first phase, not typed into a framework. Spend a session on the interface with no language in the room. Then implement.' },
          {
            type: 'kid',
            items: [
              'If they forget the “how many cookies” box, you still hand them a normal plate of ten. You do not refuse lunch.',
              'Write “description” on the jar. “dsc” is a secret code only the baker knows.',
            ],
          },
        ],
      },
      {
        heading: '17. Quick map',
        blocks: [
          {
            type: 'table',
            columns: ['Piece', 'Remember'],
            rows: [
              ['REST', 'Representations of state, transferred over HTTP, under six constraints.'],
              ['URL', '`https://api.example.com/v1/books` — api subdomain, version, plural resource.'],
              ['Path', 'Plural always. Slug: lowercase + hyphens. `/` is hierarchy.'],
              ['Idempotent', 'GET, PUT, PATCH, DELETE. POST is not. Money/mail: Idempotency-Key; replay the first response.'],
              ['PATCH vs PUT', 'Some fields vs whole replace. SPAs mostly PATCH.'],
              ['Custom action', 'POST `/resource/:id/verb`. Status is 200 or 201 from the outcome.'],
              ['Collection', 'GET list + POST create. Same path.'],
              ['Item', 'GET / PATCH / DELETE `/:id`.'],
              ['Statuses', '201 create, 200 most success, 204 delete, 404 missing **item**, never 404 on list.'],
              ['List extras', 'page, limit, sortBy, sortOrder, filters. Defaults so the first GET works.'],
              ['JSON', 'camelCase. Same keys on every resource. No dsc.'],
              ['Process', 'Wireframes → nouns → (schema) → interface in a client → then code.'],
            ],
          },
          {
            type: 'callout',
            lines: [
              '**Nouns in the path. Verbs in the method.** Custom work is still a noun tree plus a last segment (`/archive`, `/clone`).',
              '**Design the contract first.** Follow it so integrators stop guessing.',
              '**Sane defaults. Empty lists are 200. Missing ids are 404.** Pagination is not optional on list endpoints.',
            ],
          },
        ],
      },
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
    gist: 'They call me. I do not poll them. That inverts trust: now I am the server on the other end of someone else\'s retry loop.',
    remember: [
      'Push vs poll. URL + event + payload + signature. Answer 2xx fast, work later.',
      'Verify signatures. HTTPS. Retry with backoff. Make handlers idempotent — retries will happen.',
      'Log deliveries. A missed webhook is a silent business bug.',
    ],
  },
  {
    id: 'databases',
    n: 12,
    title: 'What is a Database? How Postgres Remembers After the Server Dies',
    label: 'Databases',
    cluster: 'core',
    x: 280,
    y: 515,
    gist: 'A database is persistence plus CRUD — data that survives the process. Postgres on disk is the usual backend “database.” RAM (Redis) is a cache, not the ledger.',
    remember: [
      'Disk is cheaper and bigger; RAM is faster and forgets on power-off. Backend databases live on disk.',
      'A DBMS organizes, accesses, protects integrity, and secures. A text file does none of that well.',
      'Migrations version the schema. DECIMAL for money. TEXT over VARCHAR(255) theater. JSONB for flexible bits. Parameterize every user value. Index what you filter — writes get a little slower.',
    ],
    sections: [
      {
        heading: '1. Why we need a database — persistence',
        blocks: [
          { type: 'h3', text: 'Core idea' },
          { type: 'p', text: 'At its core a database is a way to **persist** information **across sessions**. Persistence means the data **survives after the program that created it has stopped** — and is still there after a long time, or when you open the app from a different place.' },
          {
            type: 'pre',
            lines: `// in the process — gone on restart
todos = [{ title: "Learn Postgres" }]

restart the server
todos = []     // the app forgot`,
          },
          { type: 'p', text: 'A to-do app is the simple picture: you add items, check some off, close it. Open it again — the list is still there, in the same state. Accounts, orders, payments, comments: they must still be there **tomorrow, in another city, after a deploy**. Without persistence, every open is a blank page. That is why this lesson exists — it is the memory of the backend.' },
          {
            type: 'kid',
            items: [
              'Writing on a whiteboard is RAM. Wipe the board (restart) and the list is gone.',
              'Writing in a notebook you put on the shelf is the database. Tomorrow the list is still there — even if you open the notebook in another room.',
            ],
          },
        ],
      },
      {
        heading: '2. What “a database” even is',
        blocks: [
          { type: 'p', text: 'The word is **surprisingly broad**. In the simplest sense, **any structured storage you can come back to** is a database: a phone contact list, browser `localStorage` / session storage / cookies (a key–value store), even a text file of notes. The shared shape: a **persistent system that offers Create, Read, Update, Delete**.' },
          { type: 'p', text: 'That generic meaning is **not** limited to servers. In **backend talk**, though, “the database” almost always means a **disk-based DBMS** (Postgres, MySQL, Mongo, …) — not Redis, not a `.txt`. Same word, tighter meaning.' },
          {
            type: 'kid',
            items: [
              'A shoebox of paper is a database in the wide sense.',
              'When we say “the database” at work, we mean the **library with a librarian** (Postgres), not the shoebox.',
            ],
          },
        ],
      },
      {
        heading: '3. Disk-based databases — vs RAM',
        blocks: [
          { type: 'p', text: 'Backend databases sit on **disk** (HDD / SSD — secondary storage). Disk is **cheaper** than RAM, so you can keep **far more** data. Check a laptop: maybe 8–32 GB of RAM, but 512 GB to 2 TB of disk. That ratio is the whole point.' },
          { type: 'p', text: 'RAM (main / primary memory) is **much faster** to read and write. That is why **caching** (Redis, in-memory caches) lives there. RAM is also **volatile**: power off, data gone. Disk is slower — how it stores and fetches — but **survives**.' },
          {
            type: 'table',
            columns: ['Store', 'Speed', 'Size / cost', 'Power off'],
            rows: [
              ['**RAM** (Redis, process memory)', 'Fast', 'Expensive, smaller', '**Gone**'],
              ['**Disk** (Postgres, MySQL, Mongo)', 'Slower', 'Cheap, huge', '**Survives**'],
            ],
          },
          { type: 'quote', text: 'Traditional databases pick **capacity and survival** over raw speed. That is the point of the ledger. The cache is the other trade. How the engine lays bytes on disk is a deep topic — as a backend engineer you only need the application-level split: cache in RAM, database on disk.' },
          {
            type: 'kid',
            items: [
              'The desk (RAM) is instant and small. The warehouse (disk) is slower and holds everything.',
              'You do not keep the company’s money only on the desk. The desk forgets when the lights go out.',
            ],
          },
        ],
      },
      {
        heading: '4. DBMS — the software, not the disk',
        blocks: [
          { type: 'p', text: 'Dumping bytes on a disk is not enough. You need **efficient CRUD** over hundreds of gigabytes. That software is a **DBMS** (database management system). Postgres **is** a DBMS. SQL is the language you speak to it. High-level jobs:' },
          {
            type: 'ul',
            items: [
              '**Organization** — tables, rows, indexes so you are not rereading a giant file. Fetch / update / create stay feasible at scale.',
              '**Access** — create / read / update / delete with a query language, for clients and users.',
              '**Integrity** — accuracy and validity. A payment field is a **number**, not `"hello"`. The DBMS **refuses** garbage so the data stays consistent.',
              '**Security** — users and roles; not everyone may drop the payments table. Protect from unauthorized access.',
            ],
          },
          { type: 'p', text: 'Products also talk about scaling and load balancing. For this lesson: **store** + **efficient CRUD** + those four responsibilities.' },
          {
            type: 'kid',
            items: [
              'The warehouse needs a **librarian**: find the box, refuse a fake label, lock the vault.',
              'A pile of unlabeled boxes is a disk without a DBMS.',
            ],
          },
        ],
      },
      {
        heading: '5. Why not just text files?',
        blocks: [
          { type: 'p', text: 'Before DBMS products, people **did** store customers in text files. Three problems show up as soon as the file grows:' },
          {
            type: 'ul',
            items: [
              '**Parse / find** — “customer 824,251” in a million lines means **scan and split** in application code. Slow (especially in JS / Python vs a tight systems language), easy to mis-parse, easy to **corrupt** a line and show the wrong customer.',
              '**No structure** — `John,25` vs `Jane` vs `Bob,hello`. Nothing enforces “age is a number.” Everything is a string; the file will take anything.',
              '**Concurrency** — two people edit the same value at once. Both **read** `amount = 40`. One adds 20 → writes 60. One subtracts 20 → writes 20. Last write wins. You cannot tell which. There is **no consistent result**. A DBMS is built to manage simultaneous updates; a plain file is not.',
            ],
          },
          {
            type: 'pre',
            lines: `users.txt
John,25
Jane
Bob,hello     // what is this?

two writers, both read amount = 40
  A: 40 + 20 → write 60
  B: 40 - 20 → write 20
file has no transaction  →  60 or 20, not 40`,
          },
          {
            type: 'kid',
            items: [
              'A class notebook everyone writes in at the same time: pages tear, two people overwrite the same line.',
              'The librarian (DBMS) hands out one pen per page, or uses a rule so the total still makes sense.',
            ],
          },
        ],
      },
      {
        heading: '6. Relational vs non-relational',
        blocks: [
          { type: 'p', text: 'Two big families of DBMS. **Relational**: data in **tables, rows, columns**. Relationships use **foreign keys**. You **define the schema first** — every column and type — then insert. You cannot dump an arbitrary blob into a table that has no matching shape. That strictness is the feature: at any moment you **know** the types and the links. Integrity is the bet.' },
          { type: 'p', text: 'Examples: Postgres, MySQL, SQL Server. You talk to them with **SQL** (structured query language).' },
          { type: 'p', text: '**Non-relational** (often “NoSQL”; Mongo is the famous one): no forced schema. Side-by-side words: table → **collection**, row → **document**. Two documents in the same collection **need not share a shape**. That is the primary advantage — and sometimes the disadvantage.' },
          {
            type: 'ul',
            items: [
              '**CRM-shaped data** (contacts, deals, relationships you will query hard) → **relational**. You want constraints and joins.',
              '**CMS-shaped data** (an article that might have an image, a code block, an embed — you do not know the shape up front) → people often pick Mongo to move fast.',
              'The cost of “just dump JSON”: **integrity lives in application code**. App code changes a lot; it is easy to miss a rule. Inconsistencies sneak in because the database will not refuse them.',
            ],
          },
          { type: 'quote', text: 'Flexible schema is a prototype superpower. It is also how you ship three spellings of the same field. If the data has a real shape, write the shape down in Postgres.' },
          {
            type: 'kid',
            items: [
              'Relational = every student card has the **same boxes**. The office can trust “age is a number.”',
              'Document = each kid hands in a scrap of paper in whatever layout they like. Fast to collect. Hard to add up.',
            ],
          },
        ],
      },
      {
        heading: '7. Why Postgres (for most backends)',
        blocks: [
          { type: 'p', text: 'Lots of products can scale. Unless you already have a **specific bottleneck** at millions of users, **start with Postgres**. Reasons from the video:' },
          {
            type: 'ul',
            items: [
              '**Open source and free** — not proprietary. Companies can **host it themselves**.',
              '**SQL standard** — queries behave like they do on MySQL / SQL Server *if you stay standard*. Switching later is “some work,” not a rewrite of every sentence.',
              '**Huge feature set** (the docs are enormous) plus **extensions** you can add. Reliability and scalability are the reputation.',
              '**JSON / JSONB** — flexible documents **inside** a relational DB, with **indexing and querying**. You do **not** need Mongo *only* because some user content has no rigid schema. A CMS blob can be a JSONB column.',
            ],
          },
          { type: 'quote', text: 'Need a CMS blob with no fixed columns? `JSONB` in Postgres. Do not switch database family for that alone. MySQL-vs-Postgres micro-benchmarks can wait until you have a real, measured bottleneck.' },
          {
            type: 'kid',
            items: [
              'Postgres is the Swiss army knife: tables **and** a pocket for weird sticky notes (JSON).',
              'Do not buy a second house just to store the sticky notes.',
            ],
          },
        ],
      },
      {
        heading: '8. SQL vs Postgres — and what this video skips',
        blocks: [
          { type: 'p', text: '**SQL** = the language you use to query. **Postgres** = the program that runs it. `CREATE TABLE`, `SELECT`, `ORDER BY`, `GROUP BY` are assumed — there are a thousand free primers. Pause and learn those on the side if needed. This lesson is the **backend craft** around that: types, migrations, constraints, joins, parameters, indexes, triggers.' },
          { type: 'p', text: 'A GUI SQL client (the video uses one) is just a window to run SQL. The ideas do not depend on the app. In production you will talk through a **driver** (or an ORM on top of a driver) from your language — not by clicking forever in a GUI.' },
        ],
      },
      {
        heading: '9. Data types — numbers and money',
        blocks: [
          { type: 'p', text: 'A high-level tour — pick the type that matches the **truth**, not “string for everything.”' },
          {
            type: 'ul',
            items: [
              '**SERIAL / BIGSERIAL** — integer that **increments** on insert if you omit the id. Usual cheap primary key. **BIGSERIAL** for production (more room). A **primary key** uniquely identifies the row.',
              '**SMALLINT / INTEGER / BIGINT** — whole numbers, different max values. Pick the size you need.',
              '**DECIMAL / NUMERIC** — treated as the same. **Exact**. `NUMERIC(10,2)` = 10 digits **total**, 2 after the point (so `12345678.90` fits; a third decimal digit does not). **Price, money, anything you calculate.**',
              '**REAL / DOUBLE PRECISION / FLOAT** — binary floating point. Fast. **Not the same number on every system.** Tiny representation gaps. Fine for “area of a field” where 67.8987 vs 67.8967 does not matter. **Never money.**',
            ],
          },
          { type: 'quote', text: 'If accuracy matters (price), DECIMAL. FLOAT is faster — that is why science likes it. If you use FLOAT for money, two systems will disagree and finance will find you.' },
          {
            type: 'kid',
            items: [
              'Money in a jar of **exact coins** (DECIMAL), not a “about this much” guess (FLOAT).',
              'SERIAL is a ticket machine: next person gets the next number. BIGSERIAL is a ticket machine that will not run out at a stadium.',
            ],
          },
        ],
      },
      {
        heading: '10. Data types — text, time, UUID, JSONB',
        blocks: [
          { type: 'h3', text: 'Text' },
          {
            type: 'ul',
            items: [
              '**CHAR(n)** — **only** if length is **always** fixed (e.g. two-letter day codes). If you insert `"AB"` into `CHAR(10)`, Postgres **pads** eight spaces. Old. Skip it unless the length is truly constant.',
              '**VARCHAR(n)** — max length `n`, no padding. `VARCHAR(255)` is a **MySQL habit**. In Postgres, 255 is often a **random number with no meaning**. A new teammate will hunt the codebase for why 255. Prefer not to.',
              '**TEXT** — any length (practically huge). Official Postgres advice: **use TEXT**. No performance gap vs VARCHAR. Length limits that are **product rules** belong in **validation** (the gate), so you are not forced into a risky column-widen migration later. Backend engineers talk to SQL through a **driver** — you can enforce length in app code and keep migrations readable.',
            ],
          },
          { type: 'h3', text: 'Time, ids, documents, extras' },
          {
            type: 'ul',
            items: [
              '**BOOLEAN** — true / false.',
              '**DATE** — calendar day. **TIME** — clock. **TIMESTAMP** — both. **TIMESTAMPTZ** — timestamp **plus time zone** when “when in the real world” matters.',
              '**INTERVAL** — a duration (“10 days”, “one week”), not a clock time.',
              '**UUID** — native type. Unique, hard to guess (`/users/1`, `/users/2` is a gift to attackers). Common as a **primary key**; Postgres can `DEFAULT gen_random_uuid()` so you omit the id on insert.',
              '**JSON vs JSONB** — JSON is stored as **text**. **JSONB is binary** (Postgres serializes it for query/index speed). JSONB is **not** the SQL standard — it is a Postgres strength. **Prefer JSONB.**',
              '**ARRAY** — `INTEGER[]`, arrays of JSON, timestamps, … when a list really is a list.',
              'Also: inet / MAC, geometry, XML — exist; look them up when you need them.',
            ],
          },
          {
            type: 'pre',
            lines: `CREATE TABLE items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  price      NUMERIC(10, 2) NOT NULL,   -- not FLOAT
  metadata   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`,
          },
          {
            type: 'kid',
            items: [
              '`VARCHAR(255)` is a ruler you glued on because another school used it. **TEXT** is a page; the form (validation) still says “title max 100.”',
              'JSON is a sticky note in handwriting. **JSONB** is the same note typed into a card catalog so you can search it.',
            ],
          },
        ],
      },
      {
        heading: '11. Inserting a row',
        blocks: [
          { type: 'p', text: 'Write `INSERT INTO table (cols) VALUES (...)`. Column list order matches values order. Optional `RETURNING *` (or selected columns) gives the new row back — id, defaults, generated UUID — what an API often needs after create.' },
          {
            type: 'pre',
            lines: `INSERT INTO items (title, price)
VALUES ('Quiet Hours', 12.50)
RETURNING *;`,
          },
        ],
      },
      {
        heading: '12. Migrations — git for the schema',
        blocks: [
          { type: 'p', text: 'In production you do **not** click around in a GUI to add columns. There is no trail of *what* changed, *when*, or *who*. You **version** schema changes: SQL files that run **in order**. A CLI tool (the video uses **dbmate**; **golang-migrate** is the same idea) applies them and records what ran in a **`schema_migrations`** table (a `version` column). That way the next `up` starts **after** the last applied file — re-running `CREATE TABLE users` would error “already exists.”' },
          {
            type: 'ul',
            items: [
              '**Up** — apply: `CREATE TABLE`, `CREATE TYPE`, `CREATE INDEX`, `CREATE TRIGGER`, …',
              '**Down** — **undo** that up (drop what you created, **reverse order**: tables before types). So a bad deploy can roll back. Some modern shops skip downs; the standard still teaches them.',
              'File names: **sequence or timestamp** so order is obvious (`001_users.sql`, `20260101_add_index.sql`). Live next to the app in git.',
            ],
          },
          { type: 'p', text: '`dbmate new create_users_table` writes a file with `-- migrate:up` / `-- migrate:down` sections. The tool reads `DATABASE_URL` from the environment. `dbmate up` runs pending ups. Every environment — laptop, staging, prod — should replay the same files and look the same.' },
          { type: 'quote', text: 'Relational DBs are strict schema. Random “just insert a new shape” is a Mongo habit. Here, a new column = a new migration. You cannot dump arbitrary rows and hope.' },
          {
            type: 'kid',
            items: [
              'Migrations are **numbered recipe cards** for the kitchen. Card 1: build the shelf. Card 2: add a hook. Everyone cooks from the same cards, committed next to the code.',
              '**Down** = “unscrew the hook” if card 2 was a mistake. The stamp on the fridge (`schema_migrations`) says which card you last finished.',
            ],
          },
        ],
      },
      {
        heading: '13. Enums — allowed values, written down',
        blocks: [
          { type: 'p', text: 'An **enum** is a type whose values are a **fixed list**. Example: project status is only `active` | `completed` | `archived`. Task status: `pending` | `in_progress` | `completed` | `cancelled`. Member role: `owner` | `admin` | `member`.' },
          {
            type: 'pre',
            lines: `CREATE TYPE project_status AS ENUM ('active', 'completed', 'archived');

ALTER TABLE projects
  ADD COLUMN status project_status NOT NULL DEFAULT 'active';`,
          },
          {
            type: 'ul',
            items: [
              '**Integrity** — a random string in `status` is a **database error**, not a silent bad row. You can still validate in the app (smaller blast radius); the enum is the backstop.',
              '**Documentation** — often the bigger win. A new teammate reading migrations sees the allowed list **in one glance**. If `status` were `TEXT` and the three values lived only in handlers, they would have to hunt the whole codebase.',
            ],
          },
          { type: 'p', text: 'Changing the list later is another migration — that is the trade for safety. Enums often get a **DEFAULT** so insert code does not have to pass the starting state every time.' },
        ],
      },
      {
        heading: '14. Tables, constraints, and naming',
        blocks: [
          { type: 'p', text: 'The video models a **project-management** app: users, profiles, projects, tasks, members. Patterns that show up in almost every backend:' },
          {
            type: 'ul',
            items: [
              '**PRIMARY KEY** — unique + **NOT NULL** (those two are implied). The row’s identity. Convention: a column named `id`.',
              '**UUID PK** — `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`. You usually **omit** id on insert and let Postgres fill it.',
              '**NOT NULL** — in Postgres, columns are nullable **unless you say otherwise**. The video’s rule of thumb: **most** columns should be `NOT NULL`. Nulls from a buggy script are a nightmare. Only skip it when the field is truly optional (bio, phone).',
              '**UNIQUE** — one email per user. Second insert with the same email → database error.',
              '**CHECK** — a custom rule. Task `priority INTEGER NOT NULL DEFAULT 1` plus `CHECK (priority BETWEEN 1 AND 5)` so nobody stores `55`.',
              '**password_hash** — store a **hash**, never the plaintext password. The column name is the reminder.',
              '**created_at / updated_at** — `TIMESTAMPTZ NOT NULL DEFAULT now()`. `created_at` is “when this row was born.” `updated_at` is “last change” (see triggers). Useful for `ORDER BY`.',
            ],
          },
          { type: 'h3', text: 'Names' },
          {
            type: 'ul',
            items: [
              '**Plural tables** — `users`, `projects`, `tasks`. Some teams use singular; pick one. Industry default is plural.',
              '**lowercase + snake_case** — `full_name`, `created_at`. Postgres is **case-insensitive** unless you `"Quote"` identifiers. CamelCase forces ugly quotes in every query. Do not.',
            ],
          },
          {
            type: 'kid',
            items: [
              'A primary key is the student’s **ID card number**. Two kids cannot share it. It cannot be blank.',
              'Snake_case is the class rule so nobody has to put the name in quotation marks every time they speak.',
            ],
          },
        ],
      },
      {
        heading: '15. Relationships and ON DELETE',
        blocks: [
          { type: 'h3', text: 'One-to-one — users ↔ profiles' },
          { type: 'p', text: 'Why a second table? Profile fields (bio, avatar, phone, later social links…) **grow** and get edited often. Keep the **users** row small (email, name, password hash) so you are not constantly migrating and rewriting the identity table. Common also for preferences / metadata.' },
          { type: 'p', text: 'Implement: **no extra `id`**. `user_id` is both **PRIMARY KEY and FOREIGN KEY** to `users`. Optional columns skip `NOT NULL`.' },
          { type: 'h3', text: 'One-to-many — project → tasks' },
          { type: 'p', text: '`tasks.project_id` is a **FK only** (not the PK). Many tasks can share one `project_id`. `NOT NULL` means **no orphan task**. FK also means you cannot insert a `project_id` that is not a real project — even a well-formed UUID that does not exist **fails**.' },
          { type: 'h3', text: 'Many-to-many — users ↔ projects' },
          { type: 'p', text: 'A user can be in many projects; a project has many users. That needs a **linking table** (`project_members`): `project_id` + `user_id`, **composite PRIMARY KEY** of those two FKs (so the same pair cannot appear twice), plus extras that belong to the *membership* (`role` enum, default `member`). Extra indexes on each FK still help joins (see indexes).' },
          { type: 'h3', text: 'ON DELETE — referential integrity' },
          {
            type: 'ul',
            items: [
              '**RESTRICT** — cannot delete a user who still **owns** a project. Delete the project first (or transfer ownership).',
              '**CASCADE** — delete the project → delete its **tasks** (and membership rows). Useful when the child has no meaning without the parent.',
              '**SET NULL** — delete the user → task `assigned_to` becomes NULL (assignee gone, task remains). Only works if that column **allows** null.',
              '**SET DEFAULT** — put the column’s DEFAULT in. Fails if there is no default or it would violate NOT NULL.',
            ],
          },
          {
            type: 'pre',
            lines: `-- 1:1  user_id is PK and FK
-- 1:N  tasks.project_id REFERENCES projects ON DELETE CASCADE
-- M:N  PRIMARY KEY (project_id, user_id)

-- restrict: cannot delete a user who still owns projects
owner_id UUID NOT NULL REFERENCES users ON DELETE RESTRICT`,
          },
          {
            type: 'kid',
            items: [
              '**One-to-one** = one locker per student. The locker number **is** the student id.',
              '**One-to-many** = one class, many homework sheets. Each sheet stamped with the class id.',
              '**Many-to-many** = a sign-up sheet: (club, student). That pair is unique. Role (“captain”) lives on the sign-up, not on the student card.',
              '**RESTRICT** = you cannot shred the teacher’s file while the class still exists. **CASCADE** = cancel the class, throw away the homework. **SET NULL** = the homework stays; “who it was assigned to” goes blank.',
            ],
          },
        ],
      },
      {
        heading: '16. Apply, then seed',
        blocks: [
          { type: 'p', text: '`dbmate up` runs pending files. Refresh the GUI: tables exist, empty. You also see **`schema_migrations`** — the tool’s bookmark, not your product data.' },
          { type: 'p', text: '**Seed** = insert **dev/test** rows so the app is not empty. In production, real users sign up through forms. On a laptop you need fake users, projects, tasks **to test**. Best practice: a **separate** migration (or seed file) for seeds — timestamp after the schema so it runs second. You *can* mix seeds into the same file; do not do that blindly for production.' },
          { type: 'p', text: 'A readable seed uses a **CTE** (`WITH inserted_users AS (INSERT … RETURNING id, email)`) so the next insert can **join** on those new ids (profiles, projects) without guessing UUIDs.' },
          {
            type: 'kid',
            items: [
              'Schema migrations build the empty shelves. Seeding puts **practice books** on them so you can rehearse the library.',
              'Do not ship the practice books to the real library unless you mean to.',
            ],
          },
        ],
      },
      {
        heading: '17. Joins for APIs — LEFT JOIN and to_jsonb',
        blocks: [
          { type: 'p', text: 'List users **and** their profile in **one** API (`GET /v1/users`) so the client does not make a second call. Start the SQL from **`FROM`** (where data comes from), then `SELECT`.' },
          { type: 'p', text: '**LEFT JOIN** `user_profiles`: keep **all** users. If someone **never edited a profile**, there is no profile row. **INNER JOIN** would **drop** those users. You still want the user — so LEFT JOIN. `ON u.id = up.user_id`. Short **aliases** (`u`, `up`) keep the query readable.' },
          { type: 'p', text: '`u.*` is all user columns. `to_jsonb(up.*)` (Postgres built-in) turns the profile **row** into a JSON object nested as `profile`. One round-trip, nested shape for the frontend. Then **`ORDER BY u.created_at DESC`** — result row order is otherwise undefined; list APIs should sort (usually newest first).' },
          {
            type: 'pre',
            lines: `SELECT u.*, to_jsonb(up.*) AS profile
FROM users u
LEFT JOIN user_profiles up ON up.user_id = u.id
ORDER BY u.created_at DESC;

-- INNER JOIN would hide users with no profile row
-- LEFT JOIN keeps them; profile is NULL`,
          },
          { type: 'p', text: 'The handler still only speaks HTTP. Service / repository run this query; then serialize to JSON on the wire (cheap in JS; in Go you map into a struct first). Same idea as the handlers lesson.' },
          {
            type: 'kid',
            items: [
              'Class list (left) + optional hobby sheet (right).',
              '**Left join** = every student, hobby blank if they never turned in the sheet. **Inner join** = only students who turned in a sheet.',
              '`to_jsonb` = staple the hobby sheet to the student card as one packet before you hand it to the office.',
            ],
          },
        ],
      },
      {
        heading: '18. Parameterized queries — not string glue',
        blocks: [
          { type: 'p', text: '`GET /v1/users/:userId` adds `WHERE u.id = …`. That id is a **user-controlled** value. A **parameterized query** leaves a **slot** (`$1`, or a named placeholder in a GUI). You send the value **separately**. The DBMS treats it as **data**, not SQL. It is **escaped** — even if someone pastes `DELETE FROM users` into the id, it is just a string, not a command.' },
          { type: 'p', text: 'If you **concatenate** (`"... WHERE id = \'" + id + "\'"`), an attacker sends `\' OR 1=1 --` (or worse) and your `WHERE` becomes true for everyone — or runs extra statements. That is **SQL injection**.' },
          {
            type: 'pre',
            lines: `-- bad
"SELECT * FROM users WHERE id = '" + id + "'"

-- good
SELECT u.*, to_jsonb(up.*) AS profile
FROM users u
LEFT JOIN user_profiles up ON up.user_id = u.id
WHERE u.id = $1
-- run with params: [userId]`,
          },
          { type: 'p', text: 'Drivers and ORMs in every language know how to fill slots. Still **know the SQL** — the ORM is not a reason to skip this lesson. Dynamic filters still use slots, not `+`.' },
          {
            type: 'kid',
            items: [
              'Do not let a visitor **write on the librarian’s instruction card**.',
              'Hand them a **form field**. The librarian copies the value into the right box. They cannot rewrite the verb “FIND.”',
            ],
          },
        ],
      },
      {
        heading: '19. Filters, sort, and pagination',
        blocks: [
          { type: 'p', text: 'List APIs almost always take **query params**: page, limit, optional filter, optional sort. **Build the SQL in code**: if `letter` was not sent, **do not** add that `WHERE`. If it was, add `WHERE u.full_name ILIKE $1` with the value `J%` (`ILIKE` = case-insensitive `LIKE`; `%` = “anything after”). Do not default a dummy filter that matches everything unless you mean to.' },
          { type: 'p', text: '**Do not let the client sort by any column.** Whitelist (`full_name` | `email` | `created_at`). Missing `sort_by` → `created_at`. Missing `sort_order` → `DESC`. Defaults in the video: page 1, limit 10 (or 20), sort `created_at DESC`.' },
          { type: 'p', text: '**LIMIT** = page size. **OFFSET** = how many to skip. In SQL, **offset starts at 0**. Product page “1” is offset `0`; page 2 with page size 20 is offset `20`. Map in the backend: `(page - 1) * limit`. Deep offsets get expensive on huge tables (the engine still walks skipped rows). Fine for this lesson; later you may use keyset / `WHERE id > last`.' },
          {
            type: 'pre',
            lines: `-- user thinks page 1, 20 per page
LIMIT 20 OFFSET 0

-- user thinks page 2
LIMIT 20 OFFSET 20

WHERE u.full_name ILIKE $1   -- param: 'J%'
ORDER BY u.created_at DESC   -- whitelist the column in code`,
          },
          {
            type: 'kid',
            items: [
              'Do not dump the whole yearbook on the table. Hand over **20 photos**, starting after the ones you already showed.',
              'Page 1 starts at photo **0** in the pile, not photo 1. Humans and SQL count differently.',
              '“Names starting with J” = a sticker on the spine (`J%`). The librarian does not let you invent a new sticker that rewrites the catalog.',
            ],
          },
        ],
      },
      {
        heading: '20. Create and update — RETURNING and PATCH',
        blocks: [
          { type: 'h3', text: 'POST — insert + RETURNING' },
          { type: 'p', text: '`INSERT INTO users (email, full_name, password_hash) VALUES ($1, $2, $3) RETURNING *`. Hash the password in **application** code; the SQL only stores the hash. `RETURNING *` is the JSON you send back from `POST /v1/users`.' },
          { type: 'h3', text: 'PATCH — only the fields they sent' },
          { type: 'p', text: 'Profile update is **partial**. The client may send bio, or bio + phone, or all three. In code, from an **allowed set**, include only present fields in `SET`. Missing `avatar_url` → **do not touch** that column. Always `WHERE user_id = $n`. Always `RETURNING *` if the API returns the new row. **WHERE** is what stops you from rewriting every row.' },
          {
            type: 'pre',
            lines: `-- after the handler saw only bio + phone in the body
UPDATE user_profiles
SET bio = $1, phone = $2
WHERE user_id = $3
RETURNING *;`,
          },
          { type: 'p', text: 'After this update, `updated_at` will still equal `created_at` **unless** you set it in SQL or use a **trigger** (next two sections).' },
        ],
      },
      {
        heading: '21. Indexes — the book index',
        blocks: [
          { type: 'p', text: 'Rows on disk are **not** a neat list. Without an index, `WHERE id = …` is a **sequential scan**: walk every row, compare, maybe find it at the end. Fine for 6 rows. Painful for a million. An **index** is a **lookup table**: column value → **where that row lives on disk**, like a book’s index: chapter → page. You jump instead of flipping every page. (B-trees and friends are the internals — look them up later; the job is the lookup.)' },
          { type: 'p', text: '**Primary keys are indexed automatically.** Foreign keys are **not**. If you `JOIN tasks ON tasks.project_id = projects.id`, `projects.id` is already indexed; **index `tasks.project_id`**. Same for `assigned_to` if you list “tasks for this user.”' },
          { type: 'p', text: 'Thumb rule: consider an index if the column is in **WHERE, JOIN, or ORDER BY**, and that query is **frequent**. You can choose **ASC or DESC** so it matches `ORDER BY created_at DESC` and the engine does not re-sort. Examples: `users.email` (login / lookup), `users.created_at DESC` (list users), `tasks.status` (filter pending), FKs on a linking table.' },
          { type: 'p', text: '**Reads get faster. Writes get a little slower** — every INSERT/UPDATE/DELETE must **update the index too**. Do not index every column “just in case.” Start with the hot queries; **drop** the index later if the query is rare. Monitor. Indexes are not free RAM/disk either.' },
          {
            type: 'pre',
            lines: `CREATE INDEX users_email_idx ON users (email);
CREATE INDEX users_created_at_idx ON users (created_at DESC);
CREATE INDEX tasks_project_id_idx ON tasks (project_id);

-- helps:  WHERE email = $1
-- helps:  ORDER BY created_at DESC
-- helps:  JOIN ... ON tasks.project_id = projects.id`,
          },
          {
            type: 'kid',
            items: [
              'No index = flip every page to find “dragon.”',
              'Index = back of the book: “dragon — page 88.” Adding a new chapter means **updating that back page** too (slower writes).',
              'The ID stamped on the cover is already in the index. The “which class?” stamp on homework is not — unless you add it.',
            ],
          },
        ],
      },
      {
        heading: '22. Triggers — the database stamps updated_at',
        blocks: [
          { type: 'p', text: 'Two ways to keep `updated_at` honest: **set it in every UPDATE** from app code, or a **trigger**. A trigger is: when a condition happens (`UPDATE` on this table), run an action. The video’s pattern: one Postgres **function** that sets `NEW.updated_at = now()` and returns the row; then `CREATE TRIGGER … BEFORE UPDATE` on **each** table that has `updated_at` (users, profiles, projects, tasks, members). Name the triggers so **down** migrations can `DROP TRIGGER` cleanly.' },
          {
            type: 'pre',
            lines: `-- idea (exact syntax lives in a migration):
-- CREATE FUNCTION set_updated_at() ... NEW.updated_at = now(); RETURN NEW;
-- CREATE TRIGGER users_set_updated_at
--   BEFORE UPDATE ON users
--   FOR EACH ROW EXECUTE FUNCTION set_updated_at();`,
          },
          { type: 'p', text: 'After `dbmate up`, the same PATCH as before now **changes** `updated_at` with no extra `SET` in the handler. Triggers are easy to **hide** — prefer them for boring stamps; keep product rules in the **service** where you can see them. Still: they are part of mastering Postgres because you will meet them, and they stop every teammate from forgetting the stamp.' },
          {
            type: 'kid',
            items: [
              'Every time someone edits a page, the librarian **automatically** writes today’s date in the corner.',
              'You do not trust every student to remember the date stamp.',
            ],
          },
        ],
      },
      {
        heading: '23. What you actually do all day',
        blocks: [
          { type: 'p', text: 'The rest of a real API surface is the same loop: read the payload, **construct a dynamic query** from an allow-list, **parameterize** every user value, execute, return rows. Joins, indexes, and triggers are already in the schema. That is most of day-to-day backend database work — not the last 20% of exotic engine internals.' },
          {
            type: 'table',
            columns: ['Chapter', 'Remember'],
            rows: [
              ['Persistence', 'Survives the process. RAM does not.'],
              ['Disk vs RAM', 'Ledger on disk. Cache in RAM.'],
              ['DBMS', 'Organize, CRUD, integrity, security.'],
              ['Not a .txt', 'Scan, no schema, no safe concurrent writes.'],
              ['Relational vs not', 'Schema first vs flexible documents. Integrity vs speed of dumping.'],
              ['Postgres', 'Open source, SQL, JSONB — default choice.'],
              ['DECIMAL vs FLOAT', 'Money is DECIMAL. Always.'],
              ['TEXT vs CHAR', 'TEXT default. CHAR only if length is fixed. Skip VARCHAR(255) theater.'],
              ['JSONB', 'Queryable JSON. You often do not need Mongo for blobs.'],
              ['Migrations', 'Up / down files + schema_migrations. Same files everywhere.'],
              ['Enum', 'Integrity + documentation in one glance.'],
              ['NOT NULL / UNIQUE / CHECK / FK', 'The DBMS refuses garbage and orphans.'],
              ['ON DELETE', 'RESTRICT, CASCADE, SET NULL — pick on purpose.'],
              ['1:1 / 1:N / M:N', 'Shared PK; FK on the many; linking table with composite PK.'],
              ['LEFT JOIN', 'Keep the left even when the right is missing. to_jsonb nests the extra row.'],
              ['$1 parameters', 'Never glue SQL strings. Drivers/ORMs fill slots.'],
              ['LIMIT / OFFSET', 'Pages. Offset 0 = first page. Whitelist sort columns.'],
              ['RETURNING', 'Give the API the new row after INSERT/UPDATE.'],
              ['Index', 'WHERE / JOIN / ORDER BY + frequent. PK is free. FK is not. Writes cost extra.'],
              ['Trigger', 'DB stamps updated_at so handlers cannot forget.'],
            ],
          },
          {
            type: 'callout',
            lines: [
              'The database is **truth that outlives the server**.',
              '**DECIMAL** for money. **TEXT** for strings. **JSONB** for shapeless bits. **UUID** if ids must not be guessable. **Migrations** for every schema change.',
              '**Parameterize** every user value. **LEFT JOIN** when the extra table is optional. **Index** what you search — and only if that query is hot.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bll',
    n: 13,
    title: 'Business Logic Layer: Rules About the World, Not About HTTP or SQL',
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
    sections: [
      {
        heading: '1. Why this lesson exists',
        blocks: [
          { type: 'h3', text: 'Core idea' },
          { type: 'p', text: 'Handlers already named the **service**: business rules, no HTTP. This lesson is that layer as a **place**, not a function name. The product lives here — refunds, inventory, who may publish, when a cart becomes an order. If those sentences are in the route or in the SQL string, you do not have a backend. You have a database with extra steps.' },
          { type: 'p', text: 'The **business logic layer (BLL)** is the office. Reception (HTTP) and the filing cabinet (SQL) are not allowed to invent company policy. You already drew that spine in **9 · Handlers**. Stay here until you can point at a rule and say **which layer owns it**.' },
          { type: 'quote', text: 'HTTP is how the world knocks. SQL is how memory is kept. Business logic is what the company believes is allowed.' },
          {
            type: 'kid',
            items: [
              'Reception stamps envelopes. The cabinet stores folders. Neither one decides “Maya already borrowed this book.” That is the librarian.',
              'If the rule is written on the envelope, every new door forgets it. Write it in the office handbook.',
            ],
          },
        ],
      },
      {
        heading: '2. Three layers',
        blocks: [
          { type: 'p', text: 'Same picture as the request lifecycle, named as **layers** this time so you can test and replace them.' },
          {
            type: 'table',
            columns: ['Layer', 'Also called', 'Knows', 'Must not know'],
            rows: [
              ['Presentation', 'Handler / controller', 'HTTP, JSON, status codes, cookies', 'Prices, stock, who may refund'],
              ['Business', 'Service / BLL / domain', 'Rules, orchestration, domain types', '`req`, `res`, SQL dialects'],
              ['Data access', 'Repository / DAL', 'Queries, transactions, the store', 'Why a refund is allowed'],
            ],
          },
          {
            type: 'pre',
            lines: `POST /orders/42/refund
handler     bind JSON, 401 if no user, call service, stamp 200 / 409
service     "paid? window still open? restock? write refund + stock"
repository  UPDATE orders … ; INSERT refunds … ; UPDATE inventory …`,
          },
          { type: 'p', text: 'A **job** or a **CLI** should be able to call the same service. If “refund” only exists inside `res.status(200)`, you buried the product in the door.' },
        ],
      },
      {
        heading: '3. What counts as business logic',
        blocks: [
          { type: 'p', text: 'Not “code that runs on the server.” **Meaning.** Sentences a product person could argue about without mentioning Node or Postgres.' },
          {
            type: 'ul',
            items: [
              '**Inventory** — cannot sell below zero, or you allow backorder and record a debt.',
              '**Refunds** — only if paid, only inside 14 days, only once, restock or do not.',
              '**Publish** — draft → review → live. Who may press the button. What “live” does to the URL.',
              '**Unique in the product sense** — two orgs may both have a project named “API,” but not two projects in the **same** org.',
              '**Money** — totals, tax, rounding. Never float. The database lesson will say DECIMAL; the **rule** for when tax applies lives here.',
            ],
          },
          { type: 'p', text: 'CRUD is **how** you touch the row. BLL is **whether** you may, and **what else** must move with it. Charge the card and then insert the order — that order of operations is a rule, not a route.' },
          {
            type: 'kid',
            items: [
              '“Is this soup vegetarian?” is a rule. “PUT the soup bowl on table 4” is CRUD.',
              'The kitchen can file a bowl perfectly and still poison the guest if nobody owns the recipe.',
            ],
          },
        ],
      },
      {
        heading: '4. Format at the gate, meaning in the office',
        blocks: [
          { type: 'p', text: '**Validation of shape** can live at the gate (lesson 6): email looks like an email, `quantity` is a positive integer, JSON parsed. Fail → **400**, do not enter the service.' },
          { type: 'p', text: '**Validation of meaning** lives here: that email is already an account, quantity 3 exceeds stock 2, this user is not the owner. Those are **409 / 403 / 422** after a rule ran — not “the JSON was ugly.”' },
          {
            type: 'pre',
            lines: `// gate — format
if (!looksLikeEmail(body.email)) return 400

// BLL — meaning
if (repo.findByEmail(email)) throw alreadyTaken      // handler maps → 409
if (stock < qty) throw insufficientStock             // handler maps → 409`,
          },
          { type: 'quote', text: 'The gate asks “can I even read this?” The office asks “does this make sense in our world?”' },
        ],
      },
      {
        heading: '5. Domain models plus services',
        blocks: [
          { type: 'p', text: 'A **domain model** is a type that means something in the product: `User`, `Order`, `Note`. Not `Row42` and not the HTTP body. Fields the company cares about. Methods if the rule is small and belongs on that thing (`order.canRefund(now)`). Services if the rule **spans** two things (`checkoutService.place(cart, user)` talks to stock, payments, mail).' },
          { type: 'p', text: 'Do not pass `req` into a model. Do not make `User` know SQL. The model is the vocabulary. The service is the paragraph. The repository is the filing.' },
          {
            type: 'pre',
            lines: `// domain — meaning
order.canRefund(now)           // window, status, not already refunded

// service — orchestration
refundService.refund(orderId, actor)
  order = repo.get(orderId)
  if !order.canRefund(now) throw notRefundable
  payment.refund(order.chargeId)
  repo.markRefunded(orderId)
  mail.queueReceipt(order.email)`,
          },
          { type: 'p', text: 'If every rule is a pile of `if` in the handler, you do not have models. You have a script. If every rule is a SQL `CASE`, you hid the product in the cabinet — next lesson can store it, this lesson still has to **own** it.' },
        ],
      },
      {
        heading: '6. SoC, SRP, open/closed, depend on abstractions',
        blocks: [
          { type: 'p', text: 'Four names people throw at this layer. They are not decorations. They are how you keep the office from melting into the hallway.' },
          {
            type: 'ul',
            items: [
              '**Separation of concerns (SoC)** — HTTP, rules, SQL each have a room. A change to JSON shape should not rewrite the refund window.',
              '**Single responsibility (SRP)** — `refundService` refunds. It does not also parse cookies and also migrate tables. One reason to change.',
              '**Open/closed** — add a new payment vendor by plugging in a new adapter, not by editing `if stripe … else paypal` in twelve handlers. Open to extension, closed to “please do not touch that file.”',
              '**Depend on abstractions** — the service calls `Payments.refund(id)`, not `StripeClient.post(...)`. Tests fake `Payments`. Prod wires Stripe. The rule file does not import the vendor.',
            ],
          },
          { type: 'p', text: 'You do not need a 400-page DDD book to start. You need: **rules in one place**, **stores behind a narrow door**, **HTTP as a translator**.' },
          {
            type: 'kid',
            items: [
              'The office handbook does not name the brand of filing cabinet. Swap the cabinet, keep the rules.',
              'One clerk, one job. The person who refunds is not also the receptionist and the carpenter.',
            ],
          },
        ],
      },
      {
        heading: '7. Test the office without the building',
        blocks: [
          { type: 'p', text: 'If the rule is in the handler, a test needs a port, a JSON body, maybe a database. That is slow and brittle. If the rule is a function `canRefund(order, now)`, a test is **two objects and an assertion**. That is why this layer exists as a layer.' },
          {
            type: 'pre',
            lines: `// no server, no Postgres
assert canRefund({ status: "paid", refundedAt: null }, day(10)) === true
assert canRefund({ status: "paid", refundedAt: null }, day(30)) === false`,
          },
          { type: 'p', text: 'Fake the repository (`inMemoryOrders`) when the service orchestrates. Fake payments. You are testing **policy**, not the network. Integration tests still exist — they belong with the database and HTTP lessons. Do not make every rule wait on them.' },
          { type: 'quote', text: 'If I cannot test a refund without spinning a server, the rule is still trapped in the door.' },
        ],
      },
      {
        heading: '8. Three ways to hide the product',
        blocks: [
          { type: 'p', text: 'You will meet all three. They feel fast. They rot the same way.' },
          {
            type: 'table',
            columns: ['Smell', 'Where the rule went', 'What breaks'],
            rows: [
              ['Fat controller', 'The handler', 'Jobs and CLIs cannot reuse it. Tests need HTTP.'],
              ['Fat repository', 'The SQL file', 'Swap the store and you rewrite the company. Rules are unreadable CASE soup.'],
              ['Fat framework magic', 'Hooks, observers, “on save”', 'Nobody can find the refund. Order of hooks is the product.'],
            ],
          },
          { type: 'p', text: 'Triggers and constraints in Postgres are **good for integrity** (unique, `updated_at`, “amount > 0”). They are a poor home for “14-day refund if the user is on plan Pro.” Put invariants that must never be false in the database. Put **stories** in the BLL.' },
        ],
      },
      {
        heading: '9. Quick map',
        blocks: [
          {
            type: 'table',
            columns: ['Question', 'Layer', 'Lesson'],
            rows: [
              ['What did they send, what status do I stamp?', 'Handler', '9 · Handlers'],
              ['May they, and what else must move?', 'BLL / service', 'This node'],
              ['How do I persist the result?', 'Repository + DB', '12 · Databases'],
              ['Is this JSON even a number?', 'Gate', '6 · Validation'],
            ],
          },
          {
            type: 'callout',
            lines: [
              '**Rules about the world live in the office.** Not in the route, not in the SQL string.',
              '**Format at the gate. Meaning here.** Domain types plus services. Test them without a server.',
              'Open **12 · Databases** for the cabinet. CRUD was the skeleton. This is why the skeleton moves.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'caching',
    n: 14,
    title: 'What is Caching? A Fast Copy So You Do Not Repeat the Expensive Work',
    label: 'Caching',
    cluster: 'core',
    x: 445,
    y: 575,
    gist: 'A cache keeps a small, fast copy of data you will need again — so you skip the slow path. The hard part is when that copy goes stale.',
    remember: [
      'Hit = served from the fast copy. Miss = do the slow work, then store it.',
      'Lazy (cache-aside): fill on first read. Write-through: update DB and cache together on write.',
      'The cache is small. Evict with TTL, LRU, or LFU. If you cannot name the invalidation rule, do not cache it.',
    ],
    sections: [
      {
        heading: '1. What is caching',
        blocks: [
          { type: 'h3', text: 'Core idea' },
          { type: 'p', text: 'In one sentence: caching is a mechanism that **decreases the time and effort** it takes to do some work.' },
          { type: 'p', text: 'More technical: you have **primary data** (the full, slow, true store). You keep a **subset** of it — not the whole thing — in a place that is **faster and cheaper to access**. Which subset? The data people use often, or are likely to use next. Frequency, recency, and probability all matter.' },
          { type: 'quote', text: 'Not a copy of everything. A hot slice, sitting closer to the reader.' },
          { type: 'p', text: 'When someone asks for that slice, you read the fast copy instead of recomputing, recrawling, or hitting the disk database. That single trick is a huge factor in products that measure latency in **milliseconds** (sometimes microseconds).' },
          {
            type: 'kid',
            items: [
              'The library has every book. Your **desk** only holds the ones you keep opening this week.',
              'You do not photocopy the whole library. You photocopy the homework everyone asks for.',
            ],
          },
        ],
      },
      {
        heading: '2. Why it matters',
        blocks: [
          { type: 'p', text: 'Without a cache, **every** request pays the full price: CPU, memory, disk, network, vendor bill. With a cache, the first payer fills the copy; everyone after that is cheap.' },
          {
            type: 'ul',
            items: [
              '**Latency** — 20–30ms extra on a SQL round-trip, times every API, is a slow app.',
              '**Load** — a thousand users each hitting a heavy join will melt the primary database.',
              '**Money / quotas** — third-party APIs charge or rate-limit. Calling them on every page view is how you get a surprise invoice.',
              '**Compute** — ranking, ML trends, encoding: you do not want to rerun GPUs for every phone that opens the app.',
            ],
          },
          { type: 'p', text: 'The pattern across the next three stories is the same: **avoid repeating heavy computation or heavy data movement**.' },
          {
            type: 'kid',
            items: [
              'If every classmate walks to the library for the same page, the librarian collapses.',
              'One photocopy on the desk saves a hundred walks.',
            ],
          },
        ],
      },
      {
        heading: '3. Example — search (“what is the weather today”)',
        blocks: [
          { type: 'p', text: 'A web search is not “look in one table.” A query goes through **crawling, indexing, ranking** over billions of pages. That workflow eats CPU and memory. Queries like “what is the weather today” are typed **millions of times a day**.' },
          { type: 'p', text: 'Without a cache, the engine would **recompute** that whole ranking for every single weather search, in every city. Latency would spike. Servers would drown.' },
          { type: 'p', text: 'With a cache: the engine uses a **distributed in-memory** store (servers spread around the world, not one box). After a query is ranked once, the **result set** is stored. The next person who asks the same weather question is served from that store.' },
          {
            type: 'pre',
            lines: `search "weather in Phnom Penh"

1. look in the distributed cache for that query
   HIT  → return the stored result page   (cheap)
   MISS → crawl/index/rank  (expensive)
        → STORE the result in the cache
        → return it

millions of identical queries → one expensive run, then hits`,
          },
          { type: 'p', text: 'A **hit** is “we already did this.” A **miss** is “do the expensive work, then leave a copy.”' },
          {
            type: 'kid',
            items: [
              'The class asks “what’s the weather?” a hundred times. The teacher does not call the weather station a hundred times.',
              'She writes it on the board once. Everyone else reads the board.',
            ],
          },
        ],
      },
      {
        heading: '4. Example — streaming and a CDN',
        blocks: [
          { type: 'p', text: 'A global streamer sends **movies, series, anime** to millions of people. One title is not one file. It goes through **encoding**: 1080p, 720p, 480p, … so a phone on a slow network does not download a cinema-sized file. That already saves bandwidth and origin load.' },
          { type: 'p', text: 'Delivery is the other half. The **origin** (say racks in the US) holds the real files. If everyone in the world pulled from that one region, people nearby would buffer little; people far away would wait on a long cable. The origin would also melt.' },
          { type: 'p', text: 'So they put **edge locations** (POPs) around the world — servers chosen for connectivity, placed **near viewers**. Those edges **cache a subset** of titles: what that region is actually watching, not the entire catalog. A viewer in another country hits the nearby edge, not the US origin. Buffering stays low. Origin load stays sane.' },
          {
            type: 'pre',
            lines: `origin  (US)     = source of truth for the files
edge    (near you) = cached copies of hot titles + the right resolution

play "Movie 1" in Phnom Penh
  → edge nearby has 720p?  HIT  → stream from edge
  → miss?  fetch from origin, store on edge with a TTL, then stream`,
          },
          { type: 'p', text: 'CDN content is not cached forever. Teams pick a **TTL** (hours, not years) so a new version or a regional change can replace the old file. After expiry, the next request goes back to origin for a fresh copy.' },
          { type: 'p', text: 'This is **network-level** caching: geography is the trick. Same idea as Redis — small, hot, close — but the “close” is a city, not a process.' },
          {
            type: 'kid',
            items: [
              'The master copy of the movie lives in one warehouse. The popular movie is also in the shop **on your street**.',
              'You do not wait for a truck from another country every night. The street shop only stocks what people here actually watch.',
            ],
          },
        ],
      },
      {
        heading: '5. Example — trending topics',
        blocks: [
          { type: 'p', text: 'A social app shows **trending topics**. That number is not a `SELECT` on one row. The platform looks at **millions of posts in real time**, extracts patterns, runs heavy algorithms (often GPUs, terabytes of data). Doing that **on every phone open** would be insane.' },
          { type: 'p', text: 'So they **compute once** (or on a timer — trends stay stable for hours), store the list in an in-memory **key-value** store (Redis-class), and every timeline read is a get from that store. You open the app; the list is already there. No loader, unless the network itself is slow.' },
          {
            type: 'pre',
            lines: `job (every N minutes, expensive)
  analyze posts  →  ["topic A", "topic B", ...]
  SET trending = list

GET /trending
  GET trending from Redis   // cheap, every user
  return list`,
          },
          { type: 'p', text: 'Same pattern as search and the CDN: **do not redo the heavy work per user**. Cache the result of the work.' },
          {
            type: 'kid',
            items: [
              'Counting every vote in the school every time a kid peeks at the bulletin board would take all day.',
              'Count once, pin the top 10, update it on a timer. Kids just read the pin.',
            ],
          },
        ],
      },
      {
        heading: '6. Three levels: network, hardware, software',
        blocks: [
          { type: 'p', text: 'As a backend engineer you will bump into these three constantly. “Software cache” still **uses** hardware (RAM). We call it software because **you** talk to it through a library / Redis / ElastiCache — not by soldering a CPU.' },
          {
            type: 'table',
            columns: ['Level', 'Examples', 'What “close” means'],
            rows: [
              ['**Network**', 'CDN, DNS', 'A server near the user, or a resolver that already knows the IP'],
              ['**Hardware**', 'CPU L1 / L2 / L3, RAM vs disk', 'Millimeters from the core, electrical not mechanical'],
              ['**Software**', 'Redis, Memcached, in-process maps', 'A key-value get in RAM instead of a SQL round-trip'],
            ],
          },
          { type: 'p', text: 'Next sections walk **network** (CDN you just saw, then DNS), then **hardware**, then **software**.' },
        ],
      },
      {
        heading: '7. Network — CDN (again, as a type)',
        blocks: [
          { type: 'p', text: 'A **content delivery network** caches content on servers **geographically closer** to the user. Those machines are **edge nodes / edge servers**. “Edge” in a backend conversation almost always means **closest to the client**, not the origin in one region.' },
          { type: 'p', text: 'Goal: minimize latency and origin load. Static assets, video chunks, sometimes API responses. TTL decides how long an edge may keep a file before it must re-ask origin.' },
          {
            type: 'kid',
            items: [
              '“Edge” = the shop on your street. “Origin” = the warehouse.',
              'If the street copy is older than the sticker on the box, fetch a new box.',
            ],
          },
        ],
      },
      {
        heading: '8. Network — DNS',
        blocks: [
          { type: 'p', text: 'You use DNS every day without noticing. **Name → IP**. Without caches, **billions** of visits would walk the whole chain every time. Caching is why opening a site the second time feels instant at the “where is the server?” step.' },
          { type: 'h3', text: 'The walk on a miss' },
          { type: 'p', text: 'Suppose nothing has `example.com` yet:' },
          {
            type: 'pre',
            lines: `browser  →  OS cache  →  recursive resolver (ISP / 8.8.8.8 / Cloudflare)

resolver miss:
  1. ask a **root** server
     (a small set, worldwide — they do NOT know example.com's IP)
     they know where **TLD** servers are  (.com, .org, ...)
  2. ask the **.com TLD** server
     it does not have the IP either
     it points at the **authoritative** name server for example.com
  3. ask the **authoritative** server
     THIS one has the IP
  4. STORE that IP with a TTL at the resolver (and later OS / browser)

next visit: browser or OS cache answers. No root. No TLD.`,
          },
          { type: 'p', text: 'Caches stack: **browser DNS cache** → **OS cache** (Windows / macOS) → **recursive resolver cache** → sometimes even the authoritative side. Each layer exists so you do not repeat the long walk.' },
          {
            type: 'kid',
            items: [
              'First time: ask the country directory, then the city directory, then the house that actually knows the number.',
              'You write the number on a sticky note (TTL). Tomorrow you read the note. You do not call three directories again.',
            ],
          },
        ],
      },
      {
        heading: '9. Hardware — L1, L2, L3, RAM, disk',
        blocks: [
          { type: 'p', text: 'The CPU does not read the hard disk for every instruction. There are **layers of cache on the chip**:' },
          {
            type: 'ul',
            items: [
              '**L1** — smallest, fastest, closest to one core.',
              '**L2** — a bit bigger, still very close.',
              '**L3** — larger, often **shared** across cores.',
              'Then **RAM** (main / primary memory) — still electrical, still fast, **volatile** (power off = gone).',
              'Then **disk / SSD** — huge, persistent, much slower (especially spinning rust).',
            ],
          },
          { type: 'p', text: 'Same law as Redis: **hot data closer to the worker**. RAM vs disk is why in-memory stores beat Postgres for a counter: you are not waiting on a query planner and a disk page.' },
          { type: 'p', text: 'A small CS aside from the same talk: walking an **array in order** is fast because the CPU **predicts** and pulls a whole line into L1/L2. Random jumps miss the cache. That is hardware caching showing up in your loops.' },
          {
            type: 'kid',
            items: [
              'Pencil on the ear (L1). Pouch on the chair (L2). Shared cupboard in the classroom (L3). House across town (disk).',
              'You do not bike home for every eraser.',
            ],
          },
        ],
      },
      {
        heading: '10. Software — Redis, Memcached, key-value in RAM',
        blocks: [
          { type: 'p', text: '**Redis** and **Memcached** (and cloud cousins like ElastiCache) keep data in **primary memory**. Reads and writes hit RAM. Persistence to disk, if any, is *their* problem in the background — the path you care about is the RAM path. That is why they feel instant next to MySQL / Postgres.' },
          { type: 'p', text: 'Shape: **key → value**. No required schema, no join. A string, a number, a blob, a counter. You name the key (`item:88`, `session:abc`, `rl:10.0.0.1:minute`).' },
          {
            type: 'pre',
            lines: `SET item:88  '{"title":"Quiet Hours"}'
GET item:88

INCR rl:10.12.0.9:14:32     // counters are a first-class trick
EXPIRE session:tok_abc  1800`,
          },
          { type: 'p', text: 'You *can* store a rate-limit counter in Postgres. It works. It is also **20–30ms** and a connection on **every** request. A thousand users × 100 requests is a database that is busy being a cache. Put the counter in Redis.' },
          {
            type: 'kid',
            items: [
              'A box of labeled sticky notes on the teacher’s desk (key = name, value = the note).',
              'The filing cabinet across the building is the SQL database. You do not walk there to see “how many times did this kid borrow today?”',
            ],
          },
        ],
      },
      {
        heading: '11. Strategies — lazy (cache-aside) vs write-through',
        blocks: [
          { type: 'h3', text: 'Lazy / cache-aside' },
          { type: 'p', text: 'You do **not** predict and pre-fill. You wait until someone **asks**. Check cache → hit, return. Miss → load from primary storage → **put it in the cache** → return. The *next* client (or the same one) hits. “Lazy” = you only spend cache RAM on keys that were actually requested.' },
          {
            type: 'pre',
            lines: `GET /items/88
  cached = redis.GET("item:88")
  if cached: return cached          // hit

  row = db.SELECT ... WHERE id = 88 // miss — primary storage
  redis.SET "item:88" row
  return row`,
          },
          { type: 'h3', text: 'Write-through' },
          { type: 'p', text: 'This is about **updates**. Every **POST / PUT / PATCH** that changes the real row also **updates the cache in the same moment**. Next GET is already fresh. Cost: two writes on every change. Benefit: you do not serve yesterday’s title after an edit.' },
          {
            type: 'pre',
            lines: `PUT /items/88
  db.UPDATE items SET title = ... WHERE id = 88
  redis.SET "item:88" newRow     // same request

GET /items/88  →  already matches the DB`,
          },
          { type: 'p', text: 'Lazy saves space and is simple for reads. Write-through costs more on writes and stays consistent. If you cannot name **when the copy is allowed to be wrong**, do not cache that key.' },
          {
            type: 'kid',
            items: [
              '**Lazy** = photocopy only after the first kid asks. First kid waits; the rest are fast.',
              '**Write-through** = every time you edit the original, you edit the photocopy too. Nobody reads last week’s version — you write twice.',
            ],
          },
        ],
      },
      {
        heading: '12. Eviction — the cache is small',
        blocks: [
          { type: 'p', text: 'RAM is not infinite. When it is full, something must leave. **No eviction** means “I configured nothing.” The next `SET` **errors: memory full**. That is usually a mistake, not a strategy.' },
          { type: 'h3', text: 'LRU — least recently used' },
          { type: 'p', text: 'Track **when** each key was last touched. Keys 1–4 are in a full cache. 1, 2, 3 were read **today**. 4 was read **yesterday**. Key 5 arrives. LRU **drops 4** (oldest last-access) to make room.' },
          { type: 'h3', text: 'LFU — least frequently used' },
          { type: 'p', text: 'Track **how many times**, not how recently. Key 1 was hit 5 times, key 2 hit 10, key 3 hit 6, key 4 hit 23. Key 5 arrives. LFU **drops key 1** (fewest hits). A key nobody ever opens loses to a key people hammer.' },
          { type: 'h3', text: 'TTL — time to live' },
          { type: 'p', text: 'Each key gets an expiry. Weather for **one hour**. After that the key **dies by itself**. Next GET is a miss → fetch vendor → store again. CDNs use the same idea for edge files.' },
          {
            type: 'pre',
            lines: `SET weather:phnom-penh  {...}  EX 3600

// LRU sketch (full cache, 4 keys, 5 wants in)
// last access: 1,2,3 today; 4 yesterday  →  evict 4

// LFU sketch
// hits: 1→5, 2→10, 3→6, 4→23  →  evict 1`,
          },
          {
            type: 'kid',
            items: [
              'Desk holds ten photocopies. The 11th arrives.',
              '**LRU** throw the one nobody opened lately. **LFU** throw the one almost never asked for. **TTL** throw anything older than a day. **No rule** = desk full, refuse new paper.',
            ],
          },
        ],
      },
      {
        heading: '13. Use case — cache a heavy database query',
        blocks: [
          { type: 'p', text: 'Dashboard / landing APIs often run a query that **joins many tables**, aggregates millions of rows, and returns a small result. Compute-heavy. Hit on every page load. That is load on the primary DB for the same answer.' },
          { type: 'p', text: 'Cache **the result** with a TTL (say one hour). Next requests: if the key is there, return it; else run the join, store, return. Watch **hit vs miss**. A cache that always misses is extra code and still a hot database.' },
          {
            type: 'pre',
            lines: `GET /dashboard/stats
  hit  = redis.GET("stats:today")
  if hit: return hit

  rows = db.query("SELECT ... big joins ...")  // rare
  redis.SET "stats:today" rows  EX 3600
  return rows`,
          },
          {
            type: 'kid',
            items: [
              'Adding up every grade in the school for the hallway poster, every time a parent walks in, would take all morning.',
              'Add up once an hour. Pin the number. Parents read the pin.',
            ],
          },
        ],
      },
      {
        heading: '14. Use case — session storage',
        blocks: [
          { type: 'p', text: 'After login (see the Auth lesson), you create a **session token** and must **look it up on every API call**. If that blob lives only in Postgres, every request pays a DB round-trip — latency plus load on the user table.' },
          { type: 'p', text: 'Put the session in Redis (or another in-memory store). Fetching from RAM is much faster. This is one of the most common “why do we even have Redis?” answers in a web backend.' },
          {
            type: 'pre',
            lines: `POST /login  →  SET session:tok_abc  { userId, role }  EX 1800

later APIs
  GET session:tok_abc     // RAM
  // not: SELECT * FROM sessions WHERE token = ...`,
          },
          {
            type: 'kid',
            items: [
              'After the gate checks your badge, they write your name on a sticky note for this visit.',
              'Every classroom reads the sticky note. They do not call the national registry each period.',
            ],
          },
        ],
      },
      {
        heading: '15. Use case — cache a third-party API',
        blocks: [
          { type: 'p', text: 'Vendor APIs **rate-limit** and **bill** per call. Weather is a classic: it does **not** change every second. It is **safe to cache**.' },
          { type: 'p', text: 'Fetch once, `SET` with **TTL = 1 hour**. All frontend requests for that hour use the cache. When the key expires, the next request fetches fresh, stores again. You stay under the vendor cap and the page stays fast.' },
          {
            type: 'pre',
            lines: `GET /weather?city=phnom-penh
  cached = redis.GET("wx:phnom-penh")
  if cached: return cached

  payload = weatherVendor.fetch("phnom-penh")  // slow, costs quota
  redis.SET "wx:phnom-penh" payload  EX 3600
  return payload`,
          },
          {
            type: 'kid',
            items: [
              'The weather station charges per phone call. You call once, write it on the board for an hour.',
              'Live bus GPS that must be second-accurate is a bad board. Weather is a good board.',
            ],
          },
        ],
      },
      {
        heading: '16. Use case — rate limiting',
        blocks: [
          { type: 'p', text: 'Rate limiting **protects compute** (and stops bots). Example rule: **50 requests per minute per client**. Middleware runs **before** the route. It reads something like `X-Forwarded-For` to get the IP, then talks to a **key-value counter** — almost always Redis, not Postgres.' },
          {
            type: 'pre',
            lines: `// 50 requests / minute / IP
key = "rl:" + ip + ":" + thisMinute
n = redis.INCR(key)
if n == 1: redis.EXPIRE(key, 60)
if n > 50: return 429 Too Many Requests
next()  // let the handler run`,
          },
          { type: 'p', text: 'Why Redis: this runs on **every** request. SQL would add latency **and** load for a number you throw away after a minute. In memory, `INCR` is the whole product.' },
          { type: 'p', text: '**429** means “too many requests.” The client should back off. Same family of idea as the cache: a tiny, hot fact that does not belong in the ledger.' },
          {
            type: 'kid',
            items: [
              'The librarian stamps your card each time you borrow this hour. Sticky-note stamps, not the slow ledger.',
              'Too many stamps → “come back later.” That is 429.',
            ],
          },
        ],
      },
      {
        heading: '17. Quick map',
        blocks: [
          {
            type: 'table',
            columns: ['Timestamp idea', 'What to remember'],
            rows: [
              ['What / why', 'Subset in a faster place. Skip repeated expensive work.'],
              ['Search / stream / trends', 'Rank once, encode once, count once — serve many times.'],
              ['CDN', 'Origin far, edge near. TTL on the file.'],
              ['DNS', 'Browser → OS → resolver, then root → TLD → authoritative. Cache the IP.'],
              ['L1–L3 / RAM / disk', 'Closer to the CPU is faster. Redis is RAM; Postgres is the long walk.'],
              ['Lazy vs write-through', 'Fill on first read vs update both stores on write.'],
              ['No eviction / LRU / LFU / TTL', 'Full+no policy = error. Else drop old, rare, or expired.'],
              ['Query / session / API / 429', 'Four everyday Redis jobs in a backend.'],
            ],
          },
          {
            type: 'callout',
            lines: [
              'A cache is a **fast copy of a hot subset**. Name **when it expires**.',
              '**Hit** skip the expensive path. **Miss** pay once, then store.',
              'CDN and DNS are the same idea on the network. Redis is the same idea in RAM. The ledger stays in the database.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'search',
    n: 17,
    title: 'What is Full-Text Search? Why LIKE Dies and Indexes Win',
    label: 'Search',
    cluster: 'core',
    x: 145,
    y: 810,
    gist: 'Full-text search is a different data structure — an inverted index — not `LIKE %foo%` on the primary database. Elasticsearch is a fast projection. Postgres stays the source of truth.',
    remember: [
      'Inverted index: term → list of documents. Lookup, do not scan every row.',
      'Write to the primary DB. Sync a copy into the search cluster. Search can lag a second; that is the trade.',
      'text fields are analyzed (search inside). keyword fields are exact (filter, sort). Map them on purpose.',
    ],
    sections: [
      {
        heading: '1. The problem — why the primary DB is slow at search',
        blocks: [
          { type: 'h3', text: 'Core idea' },
          { type: 'p', text: 'Users type a box: “quiet hours”, a typo, a prefix for typeahead. They want **ranked** hits in milliseconds — titles, posts, comments, logs — not “scan every row.”' },
          { type: 'quote', text: '`LIKE \'%quiet%\'` is a brute-force walk. It cannot use a normal B-tree well. As the catalog grows, it gets slower. It also cannot say *which* hit is the best match.' },
          {
            type: 'pre',
            lines: `-- looks innocent. becomes a table scan.
SELECT * FROM items
WHERE title LIKE '%quiet%'
   OR description LIKE '%quiet%';

-- no ranking: a weak mention and a perfect title look the same
-- no typos: "quieet" misses
-- no typeahead: you are not scoring prefixes`,
          },
          { type: 'p', text: 'That is why this lesson exists. Search is its **own** engine, beside the database — not a cleverer `WHERE`.' },
          {
            type: 'kid',
            items: [
              'Finding “dragon” by reading every book in the library, cover to cover, every time someone asks.',
              'The librarian would quit. You want the **index at the back of the book**: word → page numbers.',
            ],
          },
        ],
      },
      {
        heading: '2. Inverted index — term → documents',
        blocks: [
          { type: 'p', text: 'A normal table maps **document → words** (the row has a title). Search flips it: **word → documents**. That flip is the **inverted index**.' },
          {
            type: 'pre',
            lines: `Doc 1: "Quiet Hours"
Doc 2: "Night Shift Hours"
Doc 3: "Quiet Kitchen"

inverted index
  quiet   →  {1, 3}
  hours   →  {1, 2}
  night   →  {2}
  shift   →  {2}
  kitchen →  {3}

search "quiet hours"
  quiet ∩ hours  →  {1}     // lookup + intersect, not a scan`,
          },
          { type: 'p', text: 'Before the index, text is **analyzed**: lowercase, split into tokens, drop tiny words, sometimes stem (`searching` → `search`). The **query** runs through the **same** analyzer so “Quiet” hits `quiet`.' },
          {
            type: 'kid',
            items: [
              'The back-of-book index: “dragon — pages 12, 40, 88.” You do not reread the novel.',
              'Two words means “pages that appear in **both** lists.” Intersection, not a treasure hunt.',
            ],
          },
        ],
      },
      {
        heading: '3. Ranking — not just yes/no',
        blocks: [
          { type: 'p', text: '`LIKE` can only say match / no match. An inverted index can **score**. Classic ingredients:' },
          {
            type: 'ul',
            items: [
              '**Term frequency (TF)** — this word shows up a lot *in this document* → stronger hit.',
              '**Inverse document frequency (IDF)** — this word is rare *across the whole catalog* → more interesting. “the” is useless; “kubernetes” is not.',
              '**Length** — a short title that is *exactly* the query often beats a long dump that mentions the word once.',
            ],
          },
          { type: 'p', text: 'Production engines (Lucene / Elasticsearch) use **BM25**, a tuned version of that idea. You can **boost** fields: title `^3`, name `^2`, body `^1` — a title hit outranks a footer mention.' },
          {
            type: 'pre',
            lines: `GET /catalog/_search
{
  "query": {
    "multi_match": {
      "query":  "quiet hours",
      "fields": ["title^3", "tags^2", "description"]
    }
  }
}
// higher _score first — not insertion order`,
          },
          {
            type: 'kid',
            items: [
              'Two books mention “dragon.” The one with “Dragon” in the **title** goes on the display table. The one that says it once in a footnote goes lower.',
              'The word “the” is in every book — it does not help you rank. Rare words do.',
            ],
          },
        ],
      },
      {
        heading: '4. Elasticsearch — documents, shards, segments',
        blocks: [
          { type: 'p', text: '**Elasticsearch** is a distributed search engine on **Apache Lucene**. You talk to it over HTTP with JSON documents. It is built for **read-heavy** search and analytics, not as your bank ledger.' },
          {
            type: 'ul',
            items: [
              '**Document** — one JSON thing you want to find (an item, a post, a log line).',
              '**Index** — a named collection of documents (like a table, but for search).',
              '**Shard** — a slice of the index on a node. Query many shards **in parallel**. This is how it scales.',
              '**Segment** — Lucene writes small **immutable** files. Search reads old segments while new ones appear. Near-real-time: a new doc is searchable after a short refresh, not always in the same millisecond as the SQL commit.',
            ],
          },
          { type: 'p', text: '**Use cases this lesson is for:** typeahead, log analytics, social search (profiles, posts, comments), product / catalog full-text — not “replace Postgres.”' },
          {
            type: 'kid',
            items: [
              'The library is so big it is split into **wings** (shards). Each wing has its own card catalog. A question is asked in every wing at once; you merge the answers.',
              'New cards are printed in small **batches** (segments). You can still search yesterday’s catalog while today’s batch is being printed.',
            ],
          },
        ],
      },
      {
        heading: '5. Mapping — text vs keyword',
        blocks: [
          { type: 'p', text: 'How you **declare fields** decides what search can do. Do this **explicitly**. Guessed mappings will hurt you later (a reindex).' },
          {
            type: 'table',
            columns: ['Field type', 'What happens', 'Use for'],
            rows: [
              ['**text**', 'Analyzed — split, lowercased, searchable *inside*', 'Title, body, comments'],
              ['**keyword**', 'Exact value — not analyzed', 'Filter, sort, aggregations: status, category, id'],
            ],
          },
          {
            type: 'pre',
            lines: `PUT /catalog
{
  "mappings": {
    "properties": {
      "title":    { "type": "text" },
      "status":   { "type": "keyword" },
      "price":    { "type": "scaled_float", "scaling_factor": 100 }
    }
  }
}

// filter on status (keyword) + search in title (text)
{
  "query": {
    "bool": {
      "must":   [{ "match":  { "title": "quiet" } }],
      "filter": [{ "term":   { "status": "published" } }]
    }
  }
}
// must  = scored  (relevance)
// filter = yes/no, often cached  (faster)`,
          },
          { type: 'p', text: '**Analyzers** are the pipeline that builds tokens. **Fuzzy** search allows typos (`quieet` → `quiet`). **Aggregations** power facets: counts per category, price ranges — without a second slow `GROUP BY` on the primary DB. **Pagination:** prefer search-after / cursors; deep `from/size` gets expensive.' },
          {
            type: 'kid',
            items: [
              '**text** = the essay you can search *inside*. **keyword** = the sticker on the spine (genre: “mystery”) — exact, for filtering the shelf.',
              'Do not use the essay field when you meant the sticker. You will sort “Mystery” and “mystery ” as two different books.',
            ],
          },
        ],
      },
      {
        heading: '6. Keep the database. Sync the index.',
        blocks: [
          { type: 'p', text: 'Writes go to the **primary store** (Postgres, etc.): transactions, joins, “this order paid.” A pipeline **copies** searchable fields into Elasticsearch. The search cluster is a **projection**. It can be **a second behind**. That is eventual consistency — acceptable for search, not for money.' },
          {
            type: 'pre',
            lines: `POST /catalog          →  insert row in Postgres  (source of truth)
                       →  index JSON into ES      (for the search box)

GET  /catalog?q=quiet  →  query Elasticsearch
                       →  return ids + snippets
                       →  (optional) hydrate extra fields from Postgres

// if ES is down: search degrades. checkout still uses Postgres.`,
          },
          {
            type: 'ul',
            items: [
              '**Index in batches** when you backfill. Do not one-by-one a million docs in a tight loop if you can bulk.',
              '**Avoid leading wildcards** (`*quiet`) — they fight the inverted index.',
              'Pick **shard count** on purpose; more shards is not always faster.',
              '**Kibana** is the UI for poking indexes, dashboards, logs — not a replacement for the mapping you designed.',
            ],
          },
          { type: 'quote', text: 'If I treat search as my database, I will lose ACID and then a lawsuit.' },
          {
            type: 'kid',
            items: [
              'The office ledger is the **truth** (who paid). The library card catalog is a **copy** for finding books fast. If the catalog is five minutes late, you can still check out with the ledger.',
              'If you throw away the ledger and only keep the catalog, you will argue about money with a search engine.',
            ],
          },
        ],
      },
      {
        heading: '7. Quick map',
        blocks: [
          {
            type: 'table',
            columns: ['Concept', 'Real-world analogy', 'What it does'],
            rows: [
              ['`LIKE %foo%`', 'Read every book', 'Scan — slow, no rank'],
              ['Inverted index', 'Back-of-book index', 'Term → documents, then intersect'],
              ['TF / IDF / BM25', 'Title hit beats a footnote', 'Rank, not just match'],
              ['text vs keyword', 'Essay vs spine sticker', 'Search inside vs filter exact'],
              ['Shard / segment', 'Wings of the library / new card batches', 'Scale out; near-real-time'],
              ['ES beside Postgres', 'Catalog vs ledger', 'Search projection, not source of truth'],
            ],
          },
          {
            type: 'callout',
            lines: [
              '**Lookup** the word. Do not **scan** the table.',
              '**Map** `text` vs `keyword` on purpose. Boost the title.',
              '**Write** to the primary DB. **Search** the replica index. Search may lag; money must not.',
            ],
          },
        ],
      },
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
    title: 'Task Queues and Background Jobs: Work That Must Not Hold the HTTP Door Open',
    label: 'Queues',
    cluster: 'async',
    x: 720,
    y: 830,
    gist: 'A background job is any work that runs outside the request–response cycle. Enqueue JSON, return 200/201, let a worker call the slow third party — with retries when that third party is down.',
    remember: [
      'Producer enqueues. Broker holds. Worker dequeues, deserializes, runs the handler, ACKs. No ACK before visibility timeout → job is offered again.',
      'HTTP POST is not idempotent. Jobs must be — a retry starts from scratch without double-charging or half-deleted users.',
      'One-off (verify email), recurring (reports, session cleanup), chain (encode → thumbs + captions), batch (delete account, midnight reports). Keep each job small.',
    ],
    sections: [
      {
        heading: '1. What a background job is',
        blocks: [
          { type: 'h3', text: 'Core idea' },
          { type: 'p', text: 'A **background task** is any logic that runs **outside** the request–response cycle. Client talks to server; HTTP comes in; HTTP goes out. Whatever you do **after** that door closes — or **without** blocking it — is a job. It is **not** mission-critical *to the HTTP round-trip*. It does not have to finish before you answer. It is not synchronous with the click. You offload it to **another process** and let that process finish how you programmed it.' },
          { type: 'quote', text: 'If the user can see “signed up” before the email provider has spoken, that email is a job. The API’s job was: validate, persist, **enqueue**.' },
          {
            type: 'kid',
            items: [
              'The classroom door (HTTP) cannot stay open while someone walks across town to mail a letter.',
              'You stamp “we’ll mail it” on the homework, close the door, and a runner takes the letter later.',
            ],
          },
        ],
      },
      {
        heading: '2. Why — the signup email',
        blocks: [
          { type: 'p', text: 'User signs up: name, email, password. Frontend hits your API. You validate (length, complexity, …). Then you must **prove they own the inbox**: a verification **link** or a 6–8 digit code. That means **another HTTP call** — from *your* backend to an **email provider** (HTML template, to/from, subject, API key). Their servers decide if it sends. You do not control their latency or their downtime.' },
          { type: 'p', text: '**Synchronous** (email inside the signup handler):' },
          {
            type: 'ul',
            items: [
              'Provider is down **and** you do not catch the error → the **whole signup** 500s. Horrible: they typed a password for nothing.',
              'You catch the error → signup **200**, UI says “we sent a verification email,” but **nothing arrived**. They wait, then hit “resend,” which is **another** API that can lie the same way.',
            ],
          },
          { type: 'p', text: 'You cannot honestly promise “email sent” until a machine that is not yours has succeeded. Blocking the signup on that machine makes *your* product feel broken whenever *they* hiccup.' },
          {
            type: 'kid',
            items: [
              'The office cannot refuse your library card because the post office is closed.',
              'They also should not say “the letter is already in your mailbox” if they never dropped it off.',
            ],
          },
        ],
      },
      {
        heading: '3. The async shape — enqueue, then 200',
        blocks: [
          { type: 'p', text: 'Same signup: validate, write the user, generate the code. Then **do not** call the provider in that function. Pack everything the send needs (to, template, code, user id, first name) into **JSON** — serialize — and **push it onto a queue**. Then return **200 or 201** (whatever your create semantics are). The UI can show “check your email” **immediately**. Creating the task is done.' },
          {
            type: 'pre',
            lines: `POST /signup
  validate
  insert user + verification code
  enqueue { to, template, code, userId }   // JSON on a queue
  return 201                               // HTTP is finished

// later, another process:
  dequeue → deserialize → POST to email provider`,
          },
          { type: 'p', text: 'On the other side: **consumers / workers** — a **different process** from the API. They pull the task. Config can put producers and consumers on **different machines**. High level: take JSON, deserialize to a dict / object / struct, run a **registered handler** — the same send function you used to call inline.' },
          { type: 'p', text: 'You can have **many queues**: email vs in-app vs mobile push. Different workers subscribe to different queues. Latency for email is usually **milliseconds to a few seconds**; verification links last **15–20 minutes**, so a 10s queue under load is fine.' },
        ],
      },
      {
        heading: '4. Failure is why the queue exists',
        blocks: [
          { type: 'p', text: 'If the provider call fails **inside HTTP**, you were heading toward **500**. If it fails **in a worker**, the **task** fails — not the signup that already returned. Frameworks (Celery in Python, BullMQ in Node, Asynq in Go, and cousins) **put the job back** on the queue.' },
          { type: 'p', text: '**Exponential backoff**: fail → wait 1 min → retry; fail → 2 min; then 4, 8, … up to a **max** (e.g. five tries). Big email APIs are rarely down for eight minutes straight; downtime is seconds. One or two retries usually land. The user still gets the mail. That retry story is a second reason jobs exist — not only “don’t block.”' },
          {
            type: 'ul',
            items: [
              '**Responsive APIs** — you do not wait on someone else’s server or on heavy CPU in the request.',
              '**No timeout** because a vendor hung.',
              '**Retries** for work that is allowed to fail once.',
            ],
          },
          { type: 'quote', text: 'Offload work that is slow or non-critical to the click. Keep the HTTP door honest. Let the queue absorb vendor weather.' },
          {
            type: 'kid',
            items: [
              'If the post office is closed, you do not fail the library card. You try the mailbox again in a minute, then two, then four.',
              'You stop after five tries and tell a grown-up (logs / alerts) — you do not keep the kid standing at the door.',
            ],
          },
        ],
      },
      {
        heading: '5. What we actually offload',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Email** — verify, welcome, reset password. External HTTP. (Transactional email is its own node; the *mechanism* is this queue.)',
              '**Images / video** — user uploaded a photo; you resize for phone vs desktop, several widths. CPU. Do not transcode in the signup or upload **handler**.',
              '**Reports** — weekly/daily PDF or HTML stats (done / pending in a sprint). Often **scheduled** (“cron-like”): midnight, Sunday 00:00. Queue libraries usually have **scheduled / repeating** jobs.',
              '**Push notifications** — the banner on a phone. You store a **device token**. You cannot push yourself: you call **Apple or Google**. Another vendor. Another job.',
            ],
          },
          { type: 'p', text: 'Pattern: **your API must call a machine you do not run**, or **do minutes of CPU**, or **wake up on a clock**. That is a queue, not a `await` in the route.' },
        ],
      },
      {
        heading: '6. Task queue — producer, broker, worker',
        blocks: [
          { type: 'p', text: 'A **task queue** is the system that **manages and distributes** jobs — the engine behind “do this later.” **Producer** = your app code: build the payload the worker will need, **serialize**, **enqueue** (DSA word: add to the queue). **Broker** = the queue itself, a **holding area** until a worker is free. **Consumer / worker** = another process (same repo or another): **watch** the broker, **dequeue**, run the handler.' },
          { type: 'p', text: 'Mental model: a **to-do list for the backend**. The API writes items. Workers tick them off one by one.' },
          {
            type: 'pre',
            lines: `API (producer)
  serialize payload → ENQUEUE → broker

worker (consumer)
  monitor broker
  DEQUEUE → deserialize → handler(payload)
  ACK → broker may delete the message`,
          },
          { type: 'p', text: 'The broker is a **real product**: RabbitMQ, Redis pub/sub (often used as a queue), **SQS** if you need a managed queue across regions. The *library* (Celery, BullMQ, Asynq, …) sits on top and handles retries and edge cases so you are not inventing ACK protocol at 2am.' },
          {
            type: 'kid',
            items: [
              'The **inbox tray** is the broker. The **receptionist** (API) drops a slip in. A **runner** (worker) takes slips when their hands are free.',
              'Enqueue = put the slip in. Dequeue = take it out. The tray is not the runner.',
            ],
          },
        ],
      },
      {
        heading: '7. ACK and visibility timeout — so jobs do not vanish',
        blocks: [
          { type: 'p', text: 'When the worker **finishes**, it **ACKs** the broker: “processed, you may drop this.” If it **never ACKs**, the broker must not assume success. Crash, hung vendor, network hole — the worker already **took** the message. Without a rule, that work **disappears**.' },
          { type: 'p', text: '**Visibility timeout** = how long the job is “in progress” and **hidden** from other workers. If no ACK in that window, the broker **makes it visible again** so **another** worker can take it. Someone must ACK success **or** failure. That is how the queue refuses to lose the verification email because one process died.' },
          { type: 'quote', text: 'Taken off the tray is not the same as done. Done is the ACK. Timeout without ACK = put the slip back.' },
          {
            type: 'kid',
            items: [
              'A runner grabs the letter and trips in the hallway. If we shredded the slip when they grabbed it, the letter is gone forever.',
              'We pencil “checked out for 5 minutes.” If they do not stamp DONE, another runner may take it.',
            ],
          },
        ],
      },
      {
        heading: '8. One-off jobs',
        blocks: [
          { type: 'p', text: '**One-off** = something in the request cycle **triggers one function** in the background. Most of what you will write:' },
          {
            type: 'ul',
            items: [
              'Registered → verification email.',
              'Verified → welcome email.',
              'Forgot password → reset link.',
              'Someone messaged you → a notification job.',
            ],
          },
          { type: 'p', text: 'Fire once per event. Still a queue, still retries — just not on a clock.' },
        ],
      },
      {
        heading: '9. Recurring jobs',
        blocks: [
          { type: 'p', text: '**Recurring** = same work on an **interval**. Daily / weekly / monthly **reports**. **Cleanup**: stateful auth stored sessions in a table; login/logout leaves **orphan** rows. A monthly (or similar) job **deletes dead sessions** so they do not eat disk. Libraries expose **scheduled** tasks for “every Sunday at midnight.”' },
          {
            type: 'kid',
            items: [
              'One-off = “mail this letter because they just signed the form.”',
              'Recurring = “every Sunday, empty the lost-and-found box.”',
            ],
          },
        ],
      },
      {
        heading: '10. Chained jobs — parent, then children',
        blocks: [
          { type: 'p', text: '**Chain** = **parent/child**. A course platform: instructor uploads video. HTTP **must not** wait for encode. Frontend gets an ACK; bytes go to object storage (often a **presigned URL**). Then a **graph** of jobs:' },
          {
            type: 'ul',
            items: [
              '**First** — encode to several resolutions / formats (network and device mix).',
              '**Then, in parallel** (neither waits on the other): **thumbnails** from the encoded file; **transcription / subtitles** from audio.',
              '**Then** — thumbnail **images** themselves get resized for devices.',
            ],
          },
          { type: 'p', text: 'Thumbs and captions **both wait on encode**. Image-resize waits on thumbnail **generation**. A child starts only when its parent **succeeded**. That is chaining, not one giant function.' },
          {
            type: 'pre',
            lines: `upload ACK (HTTP done)
     └─ encode
           ├─ generate thumbs → resize thumb images
           └─ transcribe captions
         (thumbs ∥ captions after encode)`,
          },
        ],
      },
      {
        heading: '11. Batch jobs — one trigger, lots of work',
        blocks: [
          { type: 'p', text: '**Delete account** cannot walk every shard of a big user in one HTTP request. 40–60s+ would time out. Pattern: **200 immediately**, log them out. Either a **grace window** (3–7 days to cancel) or “gone for you” while the worker still runs. The job: strip owned projects, assets, profile, then the user row, then a “we deleted you” email. One job that **fans out** into many deletes is **batch**. The API is not blocked.' },
          { type: 'p', text: 'Second batch picture: **midnight reports for every user** — thousands of **same-shaped** jobs at once. That is also batch: many copies of generate-and-send, not one request holding the wire.' },
        ],
      },
      {
        heading: '12. Design — idempotency and errors',
        blocks: [
          { type: 'p', text: 'At scale, jobs will **run more than once** (timeout, retry). **Idempotent** here: **safe to execute again** without extra side effects. Delete-account: do the DB work in a **transaction**. If a later step fails, **roll back**. The retry starts at **0%**, not “half the rows gone, try to delete them again and explode.” Design so a crash mid-job does not leave a cursed half-user.' },
          { type: 'p', text: '**Error handling** is stricter than in a handler you are staring at: this is **another process**. Catch, **log**, let the queue **retry**. Miss an edge case here and nobody is on the HTTP call to see the stack — only the dead job.' },
          { type: 'quote', text: 'HTTP POST is allowed to create twice if the client double-clicks. A **job retry** is not a double-click — it is recovery. The job itself must be the idempotent one.' },
          {
            type: 'kid',
            items: [
              'If the runner drops the box halfway through unpacking, we put **everything back on the shelf** and start unpacking again. We do not leave a mess and unpack “the rest.”',
            ],
          },
        ],
      },
      {
        heading: '13. Design — observe, scale, order, rate limits',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Monitoring** — how many jobs in the queue, how many succeeded, how many failed, **why** (vendor vs your bug). Metrics into something like Prometheus / Grafana (the observability lesson is the deep dive). You need a **live picture**, not a feeling.',
              '**Scale workers horizontally** — more users → **more consumer nodes**, not a bigger API box. Design so adding a worker is normal.',
              '**Ordering** — if jobs **must** run in sequence, the broker/library must **support ordered delivery**. Do not assume FIFO if you never asked.',
              '**Rate limits** — workers calling vendors can **blow their quota and your bill**. Cap how hard you hit *their* API, not only your own public routes.',
            ],
          },
        ],
      },
      {
        heading: '14. Best practices from the floor',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Small and focused** — one job, one unit of work. If B depends on A, **chain**, do not stuff both in one handler. If the child fails, the parent can stay succeeded; retries hit the **child**. One mega-job that fails on the last line **redoes the expensive first lines** and burns CPU.',
              '**No long-running blobs** — a job that “takes forever” is a signal to **split** (parallel siblings or a parent/child chain).',
              '**Errors + logs** — so you can debug, and so the queue knows to retry. You need the story: vendor vs internal.',
              '**Watch queue length and worker health** — alert if the tray piles up, alert if workers die. Otherwise you discover the outage when users say “no email.”',
            ],
          },
        ],
      },
      {
        heading: '15. Quick map',
        blocks: [
          {
            type: 'table',
            columns: ['Piece', 'Remember'],
            rows: [
              ['Job', 'Work outside HTTP. Not required before 200/201.'],
              ['Why', 'Vendors and CPU. Don’t 500 signup. Don’t lie “email sent.”'],
              ['Flow', 'Serialize → enqueue → return. Worker deserializes → vendor/CPU → ACK.'],
              ['Retry', 'Exponential backoff + max tries. Queue eats downtime; HTTP does not.'],
              ['Broker', 'Rabbit / Redis / SQS. Library on top (Celery, BullMQ, Asynq, …).'],
              ['Visibility', 'No ACK in time → job visible again. Crash must not drop work.'],
              ['One-off', 'Event → one send/notify.'],
              ['Recurring', 'Clock: reports, session cleanup.'],
              ['Chain', 'Encode then thumbs ∥ captions.'],
              ['Batch', 'Delete account / N reports. HTTP still instant.'],
              ['Idempotent', 'Retry from zero. Transactions. No half-deletes.'],
              ['Ops', 'Metrics, more workers, ordered delivery if required, rate-limit vendors, small jobs, alerts.'],
            ],
          },
          {
            type: 'callout',
            lines: [
              'The request returns **accepted work**, not **finished vendor**.',
              '**Enqueue JSON. ACK when done. Retry with backoff.** Visibility timeout is how a dead worker does not eat the letter.',
              '**Small jobs. Idempotent jobs. Watch the tray.** That is most of backend queue work.',
            ],
          },
        ],
      },
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
    title: 'What is Error Handling in Backend? How Systems Fail Without Lying',
    label: 'Errors',
    cluster: 'keep',
    x: 1000,
    y: 525,
    gist: 'Errors will happen. The question is not whether — it is how you detect them, contain them, and answer without lying to the user or leaking secrets.',
    remember: [
      'Best error handling starts before the error: health checks that prove the system is actually doing its job.',
      'Bubble every error to one mapper. Unique conflict → 400. Missing row → 404. Unknown crash → 500 with a safe message.',
      'Login errors stay vague. Logs use user id + request id, never passwords, cards, or emails.',
    ],
    sections: [
      {
        heading: '1. The fault-tolerant mindset',
        blocks: [
          { type: 'h3', text: 'Core idea' },
          { type: 'p', text: 'Errors are a normal part of a backend. Database queries will fail. External APIs will time out. Users will send bad data. Business logic will hit an edge case.' },
          { type: 'quote', text: 'The question is not whether errors will happen. It is how you handle them when they do.' },
          {
            type: 'ul',
            items: [
              'Be ready to **detect** them.',
              'Be ready to **contain** them so they do not corrupt money or data.',
              'Be ready to **answer** in a way a human and a machine can both use.',
            ],
          },
          { type: 'p', text: 'This is a mindset, not a framework. You are responsible for every transaction going through. Prepare for the worst, then watch for it.' },
          {
            type: 'kid',
            items: [
              'A kitchen will burn a pan sometimes. You do not pretend the stove is perfect.',
              'You keep a fire extinguisher, you notice smoke early, and you do not serve a burnt dish as if it is fine.',
            ],
          },
        ],
      },
      {
        heading: '2. Types of errors',
        blocks: [
          { type: 'p', text: 'Five kinds show up in day-to-day backend work:' },
          {
            type: 'table',
            columns: ['Kind', 'What it does', 'Why it hurts'],
            rows: [
              ['**Logic**', 'Code runs. The *result* is wrong.', 'Does not crash. Can steal money for weeks.'],
              ['**Database**', 'Cannot talk to the store, or the store says no.', 'Can take the whole app down.'],
              ['**External service**', 'A payment / mail / cache / sign-in vendor fails.', 'A point of failure you do not control.'],
              ['**Validation**', 'The user sent data that breaks the rules.', 'First line of defense at the door.'],
              ['**Configuration**', 'A required env var is missing or wrong between environments.', 'App should refuse to start — not fail on the first real user.'],
            ],
          },
          { type: 'h3', text: 'Logic errors — the sneaky ones' },
          { type: 'p', text: 'The app does not crash. It does the **wrong thing**. Example: a shop applies a discount twice and shipping goes negative. Every order loses money. These hide for weeks if nobody is watching.' },
          { type: 'quote', text: 'Wrong result with a 200 is worse than a loud crash.' },
          { type: 'h3', text: 'Database errors' },
          {
            type: 'ul',
            items: [
              'Cannot connect — network down, DB overloaded, **connection pool empty** → users see empty screens and 500s.',
              '**Unique constraint** — insert a catalog title that already exists. If you do not map this, it bubbles as a 500.',
              '**Foreign key** — insert an order for a customer id that is not in the customer table.',
              'Deadlocks and transaction fights under load.',
            ],
          },
          { type: 'h3', text: 'External service errors' },
          { type: 'p', text: 'Payments, email, object storage, cache, a hosted sign-in vendor — each one can time out, rate-limit you (`429`), reject credentials, or go down. You cannot abandon them. You **plan** for them: timeouts, backoff, and a fallback that does not break checkout.' },
          { type: 'h3', text: 'Validation errors' },
          { type: 'p', text: 'Users send bad data. Catch it at the **entry**. Format (email looks like an email), type, and meaning. This is the first wall against garbage and attacks.' },
          { type: 'h3', text: 'Configuration errors' },
          { type: 'p', text: 'You added `OPENAI_API_KEY` in local `.env`, merged the PR, forgot production. Prefer: **crash at boot** if a required variable is missing — not a 500 after users arrive. Validate config before the server starts serving.' },
          {
            type: 'kid',
            items: [
              '**Logic** = the recipe is wrong. The oven still works. The cake tastes like salt.',
              '**Database** = the pantry is locked, or the jar already has that label.',
              '**External** = the bakery next door is closed. You still need bread.',
              '**Validation** = a guest brings rotten fruit. You stop it at the door.',
              '**Config** = you forgot the oven key. Better to notice before dinner, not when guests sit down.',
            ],
          },
        ],
      },
      {
        heading: '3. Prevention — find it before it spreads',
        blocks: [
          { type: 'quote', text: 'The best error handling starts before the error happens.' },
          { type: 'p', text: 'Find the failure the moment it starts — before it damages data or money.' },
          { type: 'h3', text: 'Health checks' },
          {
            type: 'ul',
            items: [
              'Expose `/health` or `/status`. **The status code matters.** `200` = running. `4xx` / `5xx` = not okay.',
              'A ping that only proves the process is up is **not enough**.',
              '**Database health:** can we connect? Does a real query still return in a normal time? (500ms yesterday, 5s today = something is wrong.)',
              '**External health:** can we still reach the payment or mail vendor — not just our own process?',
            ],
          },
          {
            type: 'pre',
            lines: `GET /health
  → 200  process is up  (necessary, not sufficient)

GET /health/ready
  → ping the database with a cheap query
  → 200 if connect + query is healthy
  → 503 if the store is gone or too slow`,
          },
          {
            type: 'kid',
            items: [
              'Checking that the restaurant lights are on is not the same as checking that the kitchen can still cook.',
              'Knock on the pantry. Time how long it takes to get one tomato. If that used to be fast and now it is five minutes — stop seating tables.',
            ],
          },
        ],
      },
      {
        heading: '4. Recovery — retries, fallbacks, boundaries',
        blocks: [
          { type: 'p', text: 'Some failures are **temporary**: network blip, empty connection pool, a vendor saying `429`. Retries with **exponential backoff** help: wait 1 minute, then 2, then 4… until success — without hammering a system that is already on fire.' },
          {
            type: 'pre',
            lines: `got 429 from the mail vendor
wait 1 min  → retry
wait 2 min  → retry
wait 4 min  → retry
... until a 2xx, or give up and queue it`,
          },
          { type: 'p', text: 'The retry logic itself must not add more load to an already stressed dependency.' },
          { type: 'h3', text: 'Fallback' },
          { type: 'p', text: 'If the cache node dies, fall back to in-memory cache or a second node so **checkout still works**. Degrade the nice-to-have, keep the money path.' },
          { type: 'h3', text: 'Error boundaries' },
          { type: 'p', text: 'Stop a failure from jumping process to process. Separate processes, **timeouts** at the edge of a service, **queues** so two services are not one crash. A bug in mail should not take down orders.' },
          {
            type: 'kid',
            items: [
              'The bakery is busy. You wait a bit longer each time you knock — you do not bang on the door every second.',
              'If the fancy dessert fridge dies, you still serve the main course from the other fridge.',
              'A fire in the pastry room should not burn the whole restaurant. Close that door.',
            ],
          },
        ],
      },
      {
        heading: '5. Global error handling — one mapper',
        blocks: [
          { type: 'p', text: 'Errors can start in the **handler** (validation), the **service** (business rule), or the **repository** (database). Do not format HTTP in every layer. **Bubble** the error up to one middleware that sees every request and every response.' },
          {
            type: 'ul',
            items: [
              'Languages with exceptions: **throw**, catch in the final handler.',
              'Languages like Go: **return** the error from repo → service → handler → middleware.',
              'You stay in control of the bubble. A raw unique-constraint must not become an uncaught 500 with a stack trace.',
            ],
          },
          { type: 'p', text: 'The mapper **reads the error type** and picks status + body:' },
          {
            type: 'table',
            columns: ['What happened', 'HTTP', 'Message the client sees'],
            rows: [
              ['Validation / unique title already exists', '`400`', '`title already exists` (+ field errors if needed)'],
              ['Select by id, no row', '`404`', '`catalog item 123 does not exist`'],
              ['Foreign key: author id not in the table', '`400`', 'safe “this author is not valid” — not a SQL dump'],
              ['Unknown crash', '`500`', 'generic “something went wrong” — details stay in logs'],
            ],
          },
          {
            type: 'pre',
            lines: `POST /catalog
  insert hits unique constraint
  → mapper: 400  { "code": 400, "message": "title already exists" }

GET /catalog/123
  select returns no row
  → mapper: 404  { "code": 404, "message": "item 123 does not exist" }`,
          },
          { type: 'p', text: 'A typical error body: **code**, **message**, and maybe an array of field errors. Machines and UIs can both use that.' },
          {
            type: 'kid',
            items: [
              'Every kitchen mistake goes to one person at the pass — not every cook shouting a different story at the table.',
              '“That dish is already on the menu” is a 400. “We never had dish 123” is a 404. “The stove exploded” is a 500 — you do not describe the explosion to the guest.',
            ],
          },
        ],
      },
      {
        heading: '6. Security in errors and logs',
        blocks: [
          { type: 'h3', text: 'Do not help an attacker enumerate accounts' },
          { type: 'p', text: 'On sign-in, if there is no user for that email, **do not** say “no user with this email.” If the password is wrong, **do not** say “password is incorrect.” Both answers teach a stranger which emails exist. Always the same line:' },
          {
            type: 'pre',
            lines: `// naive — leaks whether the email is registered
"user with this email does not exist"
"password is incorrect"

// safe — same message either way
"invalid email or password"`,
          },
          { type: 'h3', text: 'Logs are a leak if you put secrets in them' },
          { type: 'p', text: 'Companies ship logs to storage, search, and observability vendors. Those dumps get stolen. Do **not** log passwords, API keys, card numbers, or emails. Log **user id** and a **correlation / request id** so you still have enough context.' },
          {
            type: 'kid',
            items: [
              'If someone guesses at the classroom door, do not say “there is no student named Maya” vs “Maya’s password is wrong.” Say “wrong name or password” every time.',
              'The diary of mistakes should not contain everyone’s home address. Write the student number and the hall pass id.',
            ],
          },
        ],
      },
      {
        heading: '7. Quick map',
        blocks: [
          {
            type: 'table',
            columns: ['Concept', 'Real-world analogy', 'What it does'],
            rows: [
              ['Fault-tolerant mindset', 'Kitchen will burn a pan', 'Assume failure; plan the response'],
              ['Logic error', 'Wrong recipe, oven still works', 'Silent wrong result — watch it'],
              ['Health / ready check', 'Pantry knock + timed tomato', 'Prove the system can still do the job'],
              ['Backoff retry', 'Knock, wait longer, knock again', 'Survive blips without a stampede'],
              ['Global mapper', 'One person at the pass', 'One HTTP shape for every layer’s error'],
              ['Vague login error', 'Same reply to every guess', 'Do not confirm which emails exist'],
            ],
          },
          {
            type: 'callout',
            lines: [
              '**Detect** early. **Contain** the blast. **Map** to a status the client can use.',
              'A unique clash is not a 500. A missing row is a 404. A crash is a 500 with a boring message.',
              '**User id + request id** in logs. Never the password, the card, or the email.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'config',
    n: 19,
    title: 'Production-grade Configuration: The DNA of How the Same Code Runs in Every Environment',
    label: 'Config',
    cluster: 'keep',
    x: 1180,
    y: 500,
    gist: 'Config is every setting that decides how the app behaves — not only DB passwords. Same code; different env. Never hardcode secrets. Validate at boot or production will fail in a way you cannot see.',
    remember: [
      'Secrets are a slice. Also: port, log level, pool size, timeouts, vendor keys, feature flags, business limits.',
      'Store by risk: env and YAML for most; a vault when traffic and many machines demand it. Hybrid + a priority order is normal.',
      'If you take one rule: validate every config at startup. Missing a required env var should refuse to boot, not limp.',
    ],
    sections: [
      {
        heading: '1. Config is the DNA — not just the vault',
        blocks: [
          { type: 'h3', text: 'Core idea' },
          { type: 'p', text: '**Configuration management** is the systematic way you **organize, store, access, and maintain all the settings** of the backend. It is the **DNA**: it decides how the **same code** runs in different environments.' },
          { type: 'p', text: 'Most people hear “config” and picture **database passwords**, connection URLs, **JWT secrets**, vendor **API keys**. That is the engine of the car. You still need the rest of the car: how the process **starts**, how it **talks to other services**, how it **behaves per environment**, **whether and where it logs**, where **metrics** go, **which features** this deploy turns on, **for which users**.' },
          { type: 'quote', text: 'A database URL is config. So is “debug vs info,” pool size 10 vs 50, and “new checkout only for this country.” Treat only the secrets and you will still have chaos.' },
          {
            type: 'kid',
            items: [
              'The **recipe** (code) stays the same. The **oven temperature and which pantry** (config) change at home vs the cafeteria.',
              'The lock on the safe is important. So is “lights on or off” and “how many kids at each table.”',
            ],
          },
        ],
      },
      {
        heading: '2. Why it is high stakes',
        blocks: [
          { type: 'p', text: 'Backends no longer run **alone**. They sit in a **distributed** mess: other services, databases, caches, queues, auth, email. Each hop needs **how to connect**, **how to fail**, **how to stay fast**, **how to stay secret** — and those answers **change by environment**.' },
          { type: 'p', text: 'Without a **strategy**, you get **configuration chaos**: hardcoded numbers sprinkled through the repo, **different mystery behavior** in staging vs prod, **secrets in git**, bugs you **cannot reproduce** because you cannot name which setting caused the break.' },
          { type: 'p', text: 'A wrong frontend config might show a bad dialog. A wrong **backend** config can **leak customer data**, **charge the wrong amount**, or **take the whole platform down**. Diverse runtimes (cloud, on-prem, containers, serverless, edge) each want their own settings. That is why this is a dedicated lesson, not a `.env` footnote.' },
          {
            type: 'kid',
            items: [
              'If the cafeteria thermostat is wrong, lunch is ruined for everyone — not just one poster on the wall.',
              'If every classroom writes the oven temperature in a different notebook, you cannot tell why the cookies burned.',
            ],
          },
        ],
      },
      {
        heading: '3. Types of config (they are not equal)',
        blocks: [
          { type: 'p', text: 'An e-commerce backend is a useful pile. Types matter because they pick **where you store**, **how you lock**, and **who may read**:' },
          {
            type: 'ul',
            items: [
              '**Application settings** — log level, listen **port**, **HTTP timeout**, **DB connection pool** size. Local often `8080` + **debug** logs; prod a different port + **info** so you do not drown the log pile. Timeout too short (60s) vs a job that takes 80s → the request **dies** (often a gateway **504**). Pool size is how many DB sockets you keep warm.',
              '**Database** — host, port, user, password, name (often one **URL**), query timeouts.',
              '**External services** — email provider API key, payment processor key, hosted-auth key. Anything you `init` a vendor client with.',
              '**Feature flags** — turn a **new checkout** on for **one country** (A/B), keep the old flow elsewhere. Dynamic enable/disable **without a rewrite**.',
              'Also in the mix: **infra / DevOps**, **security** (JWT / session secrets), **runtime tuning** (e.g. max CPUs in a Go process), **business rules** you want in one place (max order amount) instead of scattered `if`s.',
            ],
          },
          { type: 'p', text: 'Some values are **secret** (leak = damage). Some only **steer behavior**. Some change **weekly**; some **quarterly**. Some are **the same in every env**; some **must differ**. Sort before you pick a store.' },
        ],
      },
      {
        heading: '4. Feature flags are config too',
        blocks: [
          { type: 'p', text: 'You shipped a new checkout API. You do **not** flip 100% of users on day one. A **flag** says: this segment (e.g. one country) gets the new flow; another keeps the old. That is still configuration — it just changes **while the process is alive**, more often than a DB URL.' },
          { type: 'quote', text: 'A flag is a dimmer for a feature. A secret is a key. Do not keep both in the same mental drawer just because both are “settings.”' },
          {
            type: 'kid',
            items: [
              'The new playground opens **only for the east wing** this week. West wing still uses the old yard. That switch is a flag, not a new school building.',
            ],
          },
        ],
      },
      {
        heading: '5. Where it lives — env, files, vaults, hybrid',
        blocks: [
          { type: 'h3', text: 'Environment variables' },
          { type: 'p', text: 'The **most common** store, in every language. Locally: a file named something like `.env`, loaded into the **OS environment** by a library so you are not `export`ing by hand. In Kubernetes / a cloud deploy: the platform **injects** env at start — often **fetched from a secrets manager** (Vault, a cloud parameter/secret store) **then** handed to the process. Your app reads `process.env` / `os.Getenv` and runs.' },
          { type: 'h3', text: 'Files' },
          { type: 'p', text: '**JSON** works; you **cannot comment**. **YAML** is the usual choice in open-source backends (server, log level, storage, sessions in one tree) **because comments teach the next teammate**. **TOML** is another file standard. Local DB in a sample `config.yaml` might even be SQLite; prod will not be.' },
          { type: 'h3', text: 'Key-value and dedicated vaults' },
          { type: 'p', text: 'A **KV store** (Consul-class, etc.) feels like env: simple pairs. At **real traffic and many regions / many clouds**, teams centralize in **Vault / AWS Parameter Store / Azure Key Vault / Google Secret Manager** — docs and integrations already exist for Kubernetes and autoscaling. That is when a dedicated product pays for itself. Until then, env + YAML is most of the industry.' },
          { type: 'h3', text: 'Hybrid + priority' },
          { type: 'p', text: 'Normal: **build one runtime settings object** at boot from **several** places. Example order you **decide up front**: cloud parameter store **wins**, then `config.yaml`, then leftover env. Environment can change which sources even exist. Do not leave the merge order as folklore.' },
          {
            type: 'kid',
            items: [
              'The **pocket card** (env) is what this machine was handed at the door.',
              'The **binder** (YAML) is the shared classroom rules with sticky-note comments.',
              'The **bank vault** is for the combinations. Big schools use a vault; a single classroom uses a locked drawer.',
            ],
          },
        ],
      },
      {
        heading: '6. Same code, different env — on purpose',
        blocks: [
          { type: 'p', text: 'Why not one config file forever? Each environment has a **different first job**:' },
          {
            type: 'table',
            columns: ['Place', 'First job'],
            rows: [
              ['**Local / dev**', 'Go fast. Debug. Catch bugs on your laptop.'],
              ['**CI / test**', 'Automated checks. Quality, not pretty logs.'],
              ['**Staging**', 'As **close to prod behavior** as you can afford — so surprises happen here.'],
              ['**Production**', '**Reliability, security, performance.**'],
            ],
          },
          { type: 'p', text: 'The **application code does not change**. Config changes **behavior**. That is the whole point of not hardcoding. If a URL lives in source, you **rebuild** to point at another database — config leaked into code.' },
          { type: 'p', text: '**Pool size example:** local `max=10` is fine on a beefy laptop. Prod `max=50` because spikes are real. Staging might be **`2`**: you still want prod-*shaped* bugs, but you **do not** want prod-*priced* cloud bills. Staging is used by a handful of people; a little latency is cheaper than a clone of prod. Dev also **minimizes cost**. Those are config decisions, not code forks.' },
          {
            type: 'kid',
            items: [
              'Practice kitchen: two burners. Banquet hall: twenty. Same cookbook.',
              'The dress rehearsal uses a smaller oven so the school does not pay banquet prices every Tuesday.',
            ],
          },
        ],
      },
      {
        heading: '7. Security — obvious, still skipped',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Never hardcode secrets** — prod DB URL, payment key, email key, auth key. In the repo they get copied, forked, screenshot, logged. Obvious; still the first leak.',
              '**Prefer a secrets manager in production** when you can. They **encrypt at rest** and usually **in transit**; your deploy (GitHub secret, kube env, instance role) holds the key that unwraps. Over-engineering security here is cheaper than a leak.',
              '**Least privilege** — frontend folks get API base URL and **their** keys. Backend gets DB / cache / search. **Cloud instance** keys stay with DevOps. A large team without this map will share one god `.env`.',
              '**Rotate** JWT secrets, API keys, DB passwords on a schedule so a leak has a **shelf life**.',
            ],
          },
        ],
      },
      {
        heading: '8. Validate at boot — the one thing to steal',
        blocks: [
          { type: 'p', text: 'People load env and then `process.env.WHATEVER` with **no check**. If a **required** variable is missing, prod does not always crash loudly — it **limps**: empty string, `undefined`, weird defaults. That is **hard to spot** and **expensive**.' },
          { type: 'p', text: '**At startup**, after deploy, **before** you take traffic: validate **every** source (env, YAML, parameter store) with a real schema library (Zod in TypeScript, go-playground validator in Go, …). Mark **required vs optional**. Put **defaults in code** only where optional is honest. Fail the process if mandatory config is absent or the wrong type.' },
          { type: 'quote', text: 'If you take one sentence from this lesson: **always validate your config**, no matter where it came from. That is the production-grade part.' },
          {
            type: 'pre',
            lines: `// boot — before listen()
settings = load(env, yaml, vault)   // merge by your priority
assert settings.DATABASE_URL        // required
assert settings.PORT is a number
settings.LOG_LEVEL = settings.LOG_LEVEL or "info"  // optional default
listen(settings.PORT)`,
          },
          {
            type: 'kid',
            items: [
              'Before the cafeteria opens, someone checks: oven on, fridge cold, **combination for the safe present**. Missing the combination means **do not open**, not “cook anyway and hope.”',
            ],
          },
        ],
      },
      {
        heading: '9. Quick map',
        blocks: [
          {
            type: 'table',
            columns: ['Piece', 'Remember'],
            rows: [
              ['Config', 'All settings. DNA of how the same code runs.'],
              ['Not only secrets', 'Port, logs, pools, timeouts, flags, business limits.'],
              ['Chaos', 'Hardcoded values, env drift, secrets in git, unreproducible bugs.'],
              ['Types', 'App / DB / vendors / flags / infra / security / perf / rules.'],
              ['Flags', 'New checkout for one country. Change behavior without a deploy of logic.'],
              ['Stores', 'Env, YAML (comments), TOML, KV, vaults. Hybrid + explicit priority.'],
              ['Envs', 'Dev = debug. CI = tests. Staging ≈ prod shape, cheaper. Prod = safe and fast.'],
              ['Code vs config', 'Never rebuild to change a URL.'],
              ['Secrets', 'Not in source. Encrypt. Least privilege. Rotate.'],
              ['Validate', 'Boot fails closed. This is the hill to die on.'],
            ],
          },
          {
            type: 'callout',
            lines: [
              '**Same binary. Different DNA.** That DNA is config.',
              '**Secrets are necessary and not sufficient.** Timeouts and flags take platforms down too.',
              '**Validate at startup.** Missing required env should never become a mysterious prod.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'observe',
    n: 20,
    title: 'Logging, Monitoring, Observability: How You See a Machine You Cannot Sit Next To',
    label: 'Observe',
    cluster: 'keep',
    x: 1355,
    y: 530,
    gist: 'Logs are the diary. Metrics are the numbers. Traces are the path of one request. Monitoring says something is wrong; the three pillars together say where. It is a spectrum, not a badge.',
    remember: [
      'Debug locally; info/warn/error in prod. Fatal means the process is dying. JSON logs in prod so tools can parse; pretty text in the terminal.',
      'Alert → metrics → the related logs → the trace. Slack is the doorbell, not the diagnosis.',
      'You instrument in code (context + request id). DevOps collects. OpenTelemetry is the shared language. Nobody is 100% observable.',
    ],
    sections: [
      {
        heading: '1. A spectrum, not a trophy',
        blocks: [
          { type: 'h3', text: 'Core idea' },
          { type: 'p', text: 'Logging, monitoring, and observability each deserve their own book. In practice they are **not a pass/fail exam**. Companies sit on a **spectrum**. Nobody “does all the good practices.” That is on purpose: do not freeze when the tool names pile up.' },
          { type: 'p', text: 'These are **practices glued to code**. Unlike most of this map, this lesson has to show **how a request is instrumented** — otherwise the words stay fog. The sample stack in the video is Go plus a dashboard; the **moves** are the same in Node or Python.' },
          { type: 'quote', text: 'You will never be 100% observable. You still instrument. The dashboard is empty if the code never emits.' },
          {
            type: 'kid',
            items: [
              'The school does not have a camera on every pencil. It still has a bell, a logbook, and a hallway map.',
              'You do not “finish observability.” You get better at seeing.',
            ],
          },
        ],
      },
      {
        heading: '2. Why we bother — many machines, many cities',
        blocks: [
          { type: 'p', text: 'Modern backends run **distributed**: many servers, many regions, users everywhere. You cannot SSH into “the” box. You need a way to **keep track** of services and infra.' },
          { type: 'p', text: '**Logging** (we stay on the backend here): **record** important events — business, suspicious, security — with **metadata**: who (`userId`), how slow (`latency`), **which function** ran. That is the diary of the request lifecycle and of process start/stop.' },
          { type: 'p', text: '**Monitoring**: watch **health** — CPU, memory, requests per second, **how many DB pool connections are open**. “Realtime” in traditional stacks is often **10–15 seconds stale**. Pushing every millisecond would **drown** the pipeline. A few seconds of lag is normal unless you bought a specialist path.' },
          {
            type: 'kid',
            items: [
              'The diary says what the class did. The wall clock says how hot the room is **about now** (not every blink).',
              'You do not weigh the oven every millisecond. You glance every few seconds so the thermometer itself does not melt.',
            ],
          },
        ],
      },
      {
        heading: '3. Observability’s three pillars',
        blocks: [
          { type: 'p', text: 'A system is called **observable** when you can infer **internal state from external outputs**. The usual **three pillars**:' },
          {
            type: 'ul',
            items: [
              '**Logs** — the record of events.',
              '**Metrics** — **numbers** over a window (last 30 minutes, last hour, or “right now”): how many requests, how many failed, how many todos created. You **choose** which numbers matter — in code **and** in the tool.',
              '**Traces** — one request as a **transaction**. Where it started (browser, load balancer, or your API), then **handler → validation → service → repository → database**. Which hops it touched, where it died.',
            ],
          },
          { type: 'p', text: '**Monitoring alone** (the old default) **tells you there is a fire.** An alert fires. That is it. **Observability** (if you actually implemented all three) also tells you **what is on fire** — which function, which query — so you can fix it instead of staring at “API unhealthy.”' },
          {
            type: 'table',
            columns: ['Piece', 'Answers'],
            rows: [
              ['Logs', '**What** happened (and context).'],
              ['Metrics / monitoring', '**Patterns** — rate, trend, now vs an hour ago.'],
              ['Traces', '**Which hops** this one request walked, and where it stopped.'],
            ],
          },
        ],
      },
      {
        heading: '4. The debugging loop',
        blocks: [
          { type: 'p', text: 'You set a rule: **error rate over a threshold** (the video used 80%) → webhook → Slack. That is the doorbell. Then you open **metrics** (concrete counts). From a bad metric you jump to the **related logs** (the failed lines). From a 500 log you open the **trace**: request entered here, walked these functions, **failed at this one**. That path is the payoff.' },
          { type: 'p', text: 'A **failed request** in metrics is a **non-success** — typically **4xx/5xx**, not “any status above 200.” 201 and 204 are still wins. Pick the definition once and keep it.' },
          {
            type: 'pre',
            lines: `Slack: error rate high
  → metrics: which route / which operation
  → logs: the 401 / 500 lines + requestId
  → trace: middleware → service → DB  (died here)`,
          },
          {
            type: 'kid',
            items: [
              'The bell rings. The scoreboard says “too many red cards.” The diary names the play. The hallway map shows **which door** they tripped on.',
            ],
          },
        ],
      },
      {
        heading: '5. Log levels',
        blocks: [
          { type: 'p', text: 'Every event gets a **level**. Libraries support this; use it.' },
          {
            type: 'ul',
            items: [
              '**debug** — as much detail as you can stand. **Local / troubleshooting.** Usually **off in production** (too loud).',
              '**info** — normal life: todo created, server started, DB connected. Successful business events.',
              '**warn** — not success, not “the app is on fire.” Example: user typed a **wrong password**. That is their miss, not a server bug. Do **not** log the password.',
              '**error** — validation that exploded, **query failed**. A main reason logs exist.',
              '**fatal** — the process is **stopping**. Infra may restart it. Reserve this for “we cannot continue.”',
            ],
          },
          { type: 'p', text: 'At boot, pick the floor from **config** (last lesson): local → debug (or info, depending on noise); production → **info** so debug lines never hit the billable pile.' },
        ],
      },
      {
        heading: '6. Pretty locally, JSON in production',
        blocks: [
          { type: 'p', text: '**Unstructured / console**: colors, plain sentences, human-first. That is what you want in the terminal while coding. Easy to spot. Hard for a machine to split into `userId` and `requestId`.' },
          { type: 'p', text: '**Structured**: almost always **JSON** — `level`, `message`, status, ids, timestamp. Ugly in a local console. Perfect for **ELK**, **Loki + Promtail + Grafana**, or a vendor parser. Production should emit JSON so the pipeline does not regex a novel.' },
          {
            type: 'pre',
            lines: `// local (console)
INFO  connected to database
INFO  starting HTTP server

// production (JSON)
{"level":"info","msg":"todo created","todoId":"…","requestId":"…"}`,
          },
          {
            type: 'kid',
            items: [
              'At the desk, write in **handwriting**. In the archive, file **index cards** the librarian can sort.',
            ],
          },
        ],
      },
      {
        heading: '7. Instrumentation and OpenTelemetry',
        blocks: [
          { type: 'p', text: 'Two words you will hear forever: **instrumentation** = actually **measuring** a function / request (timers, attributes, errors). **OpenTelemetry** = the **open standard** (SDKs, collectors, practices) so Node, Go, Python all speak the same telemetry language. You can run a **vendor dashboard** and still send through an OTel collector if you want control.' },
          { type: 'p', text: 'Open-source stack people actually mean: **Prometheus** (metrics), **Grafana** (dashboards), **Promtail/Loki** (logs), **Jaeger** (traces). A **one-stop vendor** (New Relic, Datadog, cousins) is the same three pillars with less glue — useful when you do not have a team to babysit four open-source boxes. Neither path is “more observant” by brand. The code still has to emit.' },
        ],
      },
      {
        heading: '8. What the code actually does',
        blocks: [
          { type: 'p', text: '**Before listen:** build a logger. Log level from env (debug vs info). Format from env (console vs JSON). Flip JSON + “production” when you want the dashboard to ingest.' },
          { type: 'p', text: '**Middleware wraps every request** — that is **instrumentation**. First hop creates a **transaction** (the start of a trace), stamps **service name, env, IP, user-agent, request id, user id** (and whatever else you need), **puts it on request context**. Later layers **must not** invent a new world; they **pull the same transaction** out of context. (Same idea as the Context lesson: trusted bag for *this* call.)' },
          { type: 'p', text: 'In **create todo** (service): start of function → get transaction; `defer` end this **segment** when the function returns; add attributes (`userId`, title, priority); **info** “creating todo”; on DB error → **error** log + attach error to the trace + mark operation failed; on success → **debug** “created id …” (hidden in prod) + **info** business event with id, title, category, priority.' },
          {
            type: 'pre',
            lines: `middleware:  start transaction → context
service:     tx = context.transaction
             tx.set userId, title
             log.info  "create todo"
             row = repo.insert(...)
             if err: log.error; tx.noticeError; return
             log.debug "created"   // prod filter drops this
             log.info  "todo_created" metadata`,
          },
          { type: 'p', text: 'One request = **one trace** from that middleware through validation and service. That is how a 401 on `GET /todos` (no token) shows up as metric + log line + clickable trace: app name, env, status, host, IP, level, message, method, path, span id, timestamp.' },
        ],
      },
      {
        heading: '9. What the dashboard is for',
        blocks: [
          { type: 'p', text: '**Metrics** on a summary: average transaction time, **throughput**, **error %**. Fire a few unauthorized GETs → HTTP errors appear; click through to logs; click through to the trace. Per-route: error rate and latency for `/todos`. **Runtime**: GC time, RSS (tiny in a demo), throughput, average response. Those are still metrics — numbers about the **process**, not the business.' },
          { type: 'quote', text: 'Dev writes the emit. DevOps (or the platform) **collects**. If either side is missing, the loop is fake.' },
        ],
      },
      {
        heading: '10. Quick map',
        blocks: [
          {
            type: 'table',
            columns: ['Piece', 'Remember'],
            rows: [
              ['Spectrum', 'Never 100%. Still instrument.'],
              ['Logs', 'Diary + metadata. Levels. JSON in prod, pretty locally.'],
              ['Monitor', 'Health: CPU, RAM, RPS, pool. Often 10–15s stale.'],
              ['Metrics', 'Chosen numbers over time. Error rate, throughput, “todos created.”'],
              ['Traces', 'One request’s walk through layers. Transaction on context.'],
              ['Alert loop', 'Slack → metrics → logs → trace.'],
              ['Levels', 'debug / info / warn / error / fatal.'],
              ['OTel', 'Standard for instrumenting any language.'],
              ['Tools', 'Grafana stack or a vendor box. Same pillars.'],
              ['People', 'Code emit + infra collect. Both.'],
            ],
          },
          {
            type: 'callout',
            lines: [
              '**Monitoring rings the bell. Observability names the door.**',
              '**JSON in production. Debug stays on the laptop.** Attach **request id** so the three pillars join.',
              'You will not finish this. You will get faster at the loop: alert → number → line → path.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'shutdown',
    n: 21,
    title: 'Graceful Shutdown: How a Process Leaves Without Dropping the Work Still in Its Hands',
    label: 'Shutdown',
    cluster: 'keep',
    x: 1005,
    y: 670,
    gist: 'A deploy or scale-in kills the process. A rude kill drops in-flight writes. A polite one stops new work, finishes what it already started, closes pools in reverse, and exits before SIGKILL arrives.',
    remember: [
      'SIGTERM / SIGINT you can catch. SIGKILL you cannot. Finish inside the grace window or the OS yanks the cord.',
      'Fail readiness first, then stop accepting, then drain HTTP, then jobs, then pools. Last in, first out.',
      'Force-exit on a timer shorter than the orchestrator. Log the whole walk so Observe can see the death.',
    ],
    sections: [
      {
        heading: '1. Why dying is a feature',
        blocks: [
          { type: 'h3', text: 'Core idea' },
          { type: 'p', text: 'Starting a server is the easy half. **Stopping** it is the half that eats payments. Every deploy, every scale-in, every machine recycle **kills a running process**. The question is not whether it dies. The question is whether the work **already in its hands** finishes, or gets cut mid-write.' },
          { type: 'p', text: 'Picture checkout: the card network has said yes, your handler is writing the order row, a job is about to fire the receipt. Then the orchestrator replaces the box. If the process vanishes **now**, you can charge without an order, keep an order without a charge, or retry and **charge twice**. That is not a rare bug. That is **what deploys do** if nobody taught the process how to leave.' },
          { type: 'quote', text: 'Zero-downtime means the new box is already taking traffic. The old box still has to **walk its guests to the door**. It does not get to slam it.' },
          {
            type: 'kid',
            items: [
              'The cafeteria can close. The kids who already have a tray still get to finish eating.',
              'You do not shove them out with a half-chewed sandwich and then wonder why the register is wrong.',
            ],
          },
        ],
      },
      {
        heading: '2. What graceful actually means',
        blocks: [
          { type: 'p', text: '**Graceful shutdown** is stopping the process in a **controlled order**: no new work, finish the work already started, release what you opened, then exit. It is manners for a machine.' },
          {
            type: 'ul',
            items: [
              '**Stop accepting** new HTTP (and new jobs). The door closes.',
              '**Drain** in-flight requests and in-flight jobs. Conversations already started get an ending.',
              '**Close** listeners, pools, files, sockets — in **reverse** of how you opened them.',
              '**Log** that you left on purpose. Then **exit 0**.',
            ],
          },
          { type: 'p', text: 'The rude version is: signal arrives, process gone, TCP reset to whoever was talking, transaction half-committed, worker vanished with a message that will be retried into a mess. Users see a random 502 during a “successful” deploy. That is not the network being evil. That is you yanking the cord.' },
          {
            type: 'kid',
            items: [
              'Rude host: 9pm, push the guests into the street, slam the door.',
              'Polite host: finish the sentence, walk them out, wash the glasses, **then** lock up.',
            ],
          },
        ],
      },
      {
        heading: '3. A process is born, runs, and is asked to die',
        blocks: [
          { type: 'p', text: 'Your app is a **process**. The OS created it (`fork` / `exec`). The scheduler gave it CPU. It waits on I/O. It runs. Someday the OS (or Kubernetes, or you hitting Ctrl+C) decides **this life is over**.' },
          { type: 'p', text: 'The OS does **not** start with murder. It has a **protocol**: send a **signal** — a tiny asynchronous integer, not a JSON body — that means “please stop.” Your code can **register a handler**. The handler is the whole art. If you never registered one, the **default** is: die now, no cleanup.' },
          {
            type: 'pre',
            lines: `OS  →  SIGTERM / SIGINT  →  your handler
     finish in-flight work
     close pools
     log "shutdown complete"
     exit 0

OS  →  (if you are still alive after the grace window)
     SIGKILL  →  you do not get a handler. lights out.`,
          },
          {
            type: 'kid',
            items: [
              'The bell is a request to go home. The fire alarm that cannot be ignored is the principal pulling the plug.',
              'You pack your bag between the bell and the bus. You do not pack after the bus has left.',
            ],
          },
        ],
      },
      {
        heading: '4. Three signals — two you can catch',
        blocks: [
          {
            type: 'table',
            columns: ['Signal', 'Who sends it', 'Can you handle it?'],
            rows: [
              ['**SIGINT** (2)', 'Ctrl+C in a terminal', 'Yes. Same shutdown function as prod.'],
              ['**SIGTERM** (15)', 'Default `kill`. systemd. Docker stop. Kubernetes on pod delete.', 'Yes. This is the polite production ask.'],
              ['**SIGKILL** (9)', '`kill -9`. Orchestrator **after** the grace period.', '**No.** Cannot catch, cannot ignore. Power cord.'],
            ],
          },
          { type: 'p', text: 'Handle **both** SIGINT and SIGTERM with the **same** function. If you only handle SIGTERM, local Ctrl+C skips the drain and you never practice the path that production will take. If you only handle SIGINT, Kubernetes will still SIGTERM you into a default death.' },
          { type: 'p', text: 'Kubernetes default **termination grace** is **30 seconds** (you can set `terminationGracePeriodSeconds`). Docker stop is often **10**. Your internal force-exit timer must be **shorter** than that window. If you wait forever on a hung Redis, the orchestrator sends SIGKILL anyway — and you lost the “graceful” part plus whatever you were mid-write.' },
          { type: 'quote', text: 'SIGKILL is not a strategy. It is what happens when your strategy ran out of clock.' },
        ],
      },
      {
        heading: '5. The walk — fail ready, then drain, then close',
        blocks: [
          { type: 'p', text: 'Register handlers **at boot**, before you listen. When the signal lands:' },
          {
            type: 'ul',
            items: [
              '**Flip not-ready.** `/health/ready` (or whatever the probe hits) returns **503**. Liveness stays **200** — you are alive, you are just not taking new seats. If liveness fails during drain, Kubernetes **restarts** you mid-cleanup. That is the opposite of graceful.',
              '**Wait a beat** so the load balancer actually drops you. Endpoint updates are not instant. Closing the socket **before** the balancer notices is how you still get 502s with “we implemented shutdown.” A short sleep or a `preStop` hook exists for this race, not for decoration.',
              '**Stop accepting** new HTTP. `server.close()` / `Shutdown(ctx)` : listening socket dies; **in-flight** requests keep their connections.',
              '**Wait** for those requests (and keep-alives you are tracking) to finish, **bounded** by a timeout.',
              '**Stop workers** taking new jobs. Let the current job finish or **nack** it so the broker can give it to someone still alive. Do not ACK work you did not complete.',
              '**Close** Redis, then the DB pool, then anything else — **after** HTTP and jobs no longer need them.',
              '**Log** duration. **exit 0**. Parallel: a timer fires **exit 1** if you overstay.',
            ],
          },
          {
            type: 'pre',
            lines: `SIGTERM
  isShuttingDown = true          // ready probe → 503
  sleep a few seconds            // balancer forgets this box
  http.Shutdown / server.close   // no new accepts
  wait in-flight  (timeout)
  stop consumers; finish or nack
  redis.quit
  db.pool.end
  log shutdown complete
  exit 0

// safety net, unref'd so it does not keep the process alive
setTimeout(force exit 1, 25s)    // < k8s 30s`,
          },
        ],
      },
      {
        heading: '6. Last in, first out',
        blocks: [
          { type: 'p', text: 'Boot order is usually: **config → database → cache → queue consumers → HTTP listen**. Shutdown is **the stack, inverted**. HTTP **depends** on the pool. Jobs **depend** on the pool. If you `pool.end()` first, in-flight handlers still try to query and you invent errors that look like an outage.' },
          {
            type: 'pre',
            lines: `wrong:
  close DB
  then try to finish HTTP
  → in-flight INSERT dies
  → half a checkout

right:
  stop new HTTP + drain requests
  stop new jobs + drain / nack
  then close Redis
  then close DB
  then exit`,
          },
          { type: 'p', text: 'Student notes from this chapter hammer **LIFO**. The one exception people argue about is **workers vs HTTP**: both still need the DB, so **neither** closes the DB first. Stop **new** work on both, drain both, **then** pools. HTTP first vs workers first is a taste; **pools last** is the law.' },
          {
            type: 'kid',
            items: [
              'You do not unplug the kitchen before the tables have paid.',
              'You stop seating new tables, let the seated ones finish, **then** wash the pans and lock the walk-in.',
            ],
          },
        ],
      },
      {
        heading: '7. Health checks are part of shutdown',
        blocks: [
          { type: 'p', text: 'A **readiness** probe answers: “should this instance receive **new** traffic?” A **liveness** probe answers: “is this process **stuck** and should we kill it?” Mixing them is how drain turns into a restart loop.' },
          {
            type: 'table',
            columns: ['Probe', 'During drain', 'If you get it wrong'],
            rows: [
              ['Readiness', '**503** the instant shutdown starts', 'Balancer keeps sending. You close the socket. 502s.'],
              ['Liveness', '**200** until you actually exit', 'K8s thinks you are dead and SIGKILLs the cleanup.'],
              ['Startup', 'Only about boot, not death', 'Unrelated — do not reuse it as readiness.'],
            ],
          },
          { type: 'p', text: 'Failing readiness **does not kill the pod**. That is the point. You stay alive, finish the tray, then leave. The series pairs this with **zero-downtime deploys**: new replica ready **before** the old one is asked to die. Graceful shutdown is the old replica’s half of that handshake.' },
        ],
      },
      {
        heading: '8. Jobs, keep-alives, and the clock',
        blocks: [
          { type: 'p', text: 'HTTP is not the only in-flight work. A **queue consumer** holding a message with visibility timeout: if you die after doing the side effect but before ACK, the message comes back — that is why the Queues lesson insisted on **idempotent jobs**. If you die **before** the side effect, **nack / do not ACK** so another worker can take it. Shutdown is where those two lessons meet.' },
          { type: 'p', text: '**Keep-alive** connections (HTTP/1.1 default, HTTP/2 always) are not closed just because you called `server.close()`. Idle keep-alives can hold the process open. Track connections and destroy idle ones once drain starts, or the timeout is what saves you.' },
          { type: 'p', text: 'Size the grace window from **reality**: p99 of a request + drain delay + pool close. A 30s default is a guess. A 5-minute video encode in the HTTP handler will **never** drain in 30s — that work should not have been on the HTTP path (Queues again). Shutdown cannot fix a handler that was too fat.' },
          {
            type: 'kid',
            items: [
              'The bus will not wait an hour because someone started baking a cake at the bell.',
              'Cake was a job. The tray still on the table is a request. Know which is which.',
            ],
          },
        ],
      },
      {
        heading: '9. What the logs should look like',
        blocks: [
          { type: 'p', text: 'If Observe cannot see the death, you will swear shutdown “works” while deploys drip 502s. Boot logs the **acquire** order. Shutdown logs the **release** order, with timestamps.' },
          {
            type: 'pre',
            lines: `// boot
INFO  database connected
INFO  queue consumer started
INFO  http listening :3000

// Ctrl+C or SIGTERM
WARN  SIGTERM received — draining
INFO  readiness=false
INFO  http: no new accepts; waiting in-flight
INFO  http: drained
INFO  consumers stopped
INFO  redis quit
INFO  db pool closed
INFO  shutdown complete (1842ms)
// process exits 0`,
          },
          { type: 'p', text: 'Alert on **force exits** and on **SIGKILL** (the pod that exceeded grace). Those are not vibes. They mean the timer is too tight or a dependency hung. Correlation with deploy events is the whole point of the last lesson.' },
        ],
      },
      {
        heading: '10. The shape in code — language does not matter',
        blocks: [
          { type: 'p', text: 'Frameworks all expose the same moves: listen for signals, shut down the HTTP server with a context/timeout, close the pool. Node `server.close`, Go `http.Server.Shutdown`, Python uvicorn lifespan, whatever. Copy the **order**, not a library name.' },
          {
            type: 'pre',
            lines: `listen SIGTERM, SIGINT → shutdown(signal)

async shutdown(signal):
  log warn signal
  ready = false
  await sleep(drainDelay)          // balancer race
  await http.stopAcceptingAndWait(deadline)
  await workers.stop(deadline)     // nack incomplete
  await redis.quit()
  await db.end()
  log info complete
  exit 0

in parallel:
  after 25s: log error timeout; exit 1`,
          },
          { type: 'p', text: 'Register this **once** in a shared helper if you have many services. Forgetting it on the “small” one is how the small one becomes the 502 during every rollout.' },
        ],
      },
      {
        heading: '11. How you know it works',
        blocks: [
          {
            type: 'ul',
            items: [
              'Send a **slow** request (sleep 10s in a handler). SIGTERM the process. The client should get **200**, not a reset.',
              'Hold an open **transaction**. Drain should **commit or roll back**, not leave an idle-in-transaction ghost.',
              'Run a **job** mid-shutdown. Either it finishes or it is visible again on the broker — never ACK-and-die.',
              'Watch **ready** go 503 **before** the listening port dies.',
              'Exceed the timeout on purpose once. Confirm you **force-exit** and that the orchestrator did not need SIGKILL. Then fix the hung path.',
            ],
          },
          { type: 'quote', text: 'A shutdown you never tested with in-flight work is just a comment in main().' },
        ],
      },
      {
        heading: '12. Quick map',
        blocks: [
          {
            type: 'table',
            columns: ['Piece', 'Remember'],
            rows: [
              ['Why', 'Deploys kill processes. In-flight money must not die with them.'],
              ['SIGINT / SIGTERM', 'Catch both. Same drain.'],
              ['SIGKILL', 'Uncatchable. You already failed the clock.'],
              ['Ready vs live', 'Ready 503. Live 200 until exit.'],
              ['Order', 'Stop new → drain HTTP/jobs → pools last (LIFO).'],
              ['Timeout', 'Your timer < orchestrator grace. Force-exit beats hung quit().'],
              ['Jobs', 'Finish or nack. Never ACK work you did not do.'],
              ['Logs', 'Death is an event. Observe it.'],
            ],
          },
          {
            type: 'callout',
            lines: [
              '**The new box is ready. The old box still has guests.** Walk them out.',
              '**Ready fails first. Pools close last.** SIGKILL means you talked too long.',
              'Shutdown is not extra. It is the last chapter of every request that was still alive when the deploy started.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'scale',
    n: 23,
    title: 'Scaling and Performance: Measure the Tail, Then Add Machines You Can Afford to Lose',
    label: 'Scale',
    cluster: 'keep',
    x: 1355,
    y: 670,
    gist: 'Fast is click-to-pixels. Averages hide the 1% that is paying you. Find the bottleneck before you cache. Vertical is simple until the ceiling; horizontal needs stateless boxes, a balancer, and a database that is no longer one box.',
    remember: [
      'P99/P95 over averages. Throughput plus latency. Run at 60-80% utilization so bursts have a shoulder.',
      'Never guess: time the path. N+1, missing indexes, and connection storms beat “add Redis.” Pool externally when instances multiply.',
      'Horizontal only works if state lives outside the process. LB + health checks. Reads to replicas (lag is physics). Shard when one table cannot. CDN for the edge. Do not start with microservices.',
    ],
    sections: [
      {
        heading: '1. Fast is the whole round trip',
        blocks: [
          { type: 'h3', text: 'Core idea' },
          { type: 'p', text: 'Scaling and performance mean different things in a browser, on a wire, and in an OS. This chapter is the **backend**: how the process behaves **under load**, where time actually goes, and how you grow capacity without turning the map into folklore.' },
          { type: 'p', text: 'A system is **fast** when a click becomes pixels. Browser → internet → your server → maybe the database, maybe an email provider → JSON back → paint. Users who say “slow” are talking about that whole wait. They do not care that your handler was 2ms if the query was 800ms.' },
          { type: 'quote', text: 'Performance is a number you can argue with. “Fast” is a feeling. Give the feeling a unit: latency.' },
        ],
      },
      {
        heading: '2. Latency is a distribution, not an average',
        blocks: [
          { type: 'p', text: 'One request 50ms (cache hit, idle box). The next 200ms (miss, or fifty neighbors on the CPU). Average them and you get a polite lie. Averages **erase variation**, and variation is the job.' },
          { type: 'p', text: 'A thousand requests, average 100ms: 99% under 50ms, **1% at 5 seconds**. Scale to a million a day and **ten thousand** people stared at a spinner. The average still looks fine. That 1% is often the **hard workflow** — pay, purchase, the query with three joins — the customers you cannot afford to gaslight.' },
          {
            type: 'table',
            columns: ['Number', 'Means'],
            rows: [
              ['**P50**', 'Half of requests are at or below this. The typical click.'],
              ['**P90**', '10% are worse. The shoulder.'],
              ['**P99 / P95**', 'The tail. Complex logic, fat queries, waiting on someone else. Watch these.'],
            ],
          },
          { type: 'p', text: 'When people say P99 is 2s they mean **1% of users waited 2s** (and 99% were faster). Talk percentiles in every scaling argument. Average is for other sciences.' },
          {
            type: 'kid',
            items: [
              'The class average is a B. One kid waited at the office for an hour. The average did not mention them.',
              'The kids who wait are often the ones turning in the hard homework — payment, not window shopping.',
            ],
          },
        ],
      },
      {
        heading: '3. Throughput — how many, not how long',
        blocks: [
          { type: 'p', text: '**Throughput** is requests per second (or minute). Latency is one trip. You can look heroic at 10 rps and 150ms, then die at 1,000 rps and 2s. The curve is not “more work, a little slower.” It stays almost flat, then **falls off a cliff**.' },
          { type: 'p', text: 'Throughput answers: can we survive a sale day, a podcast mention, an email blast? Latency without throughput is a bench press with one plate.' },
        ],
      },
      {
        heading: '4. Utilization — leave a shoulder for bursts',
        blocks: [
          { type: 'p', text: 'Empty ice-cream shop: you are served now. **Low utilization, low latency.** Lunch rush: the worker is still two minutes per cone. You wait because of the **queue**. The worker did not get slower. **You** did, in wall-clock.' },
          { type: 'p', text: 'Servers are that shop. Idle CPU grabs a request and returns. Busy CPU makes a line. Formal name: **utilization** = fraction of capacity in use. 0% idle. 100% maxed, about to fall over.' },
          { type: 'p', text: 'The trap: we expect latency to rise **linearly** with utilization. Near 100% it goes **exponential**. Highway at 50%: overtaking works. 80%: you think twice. 90%: a brake becomes a jam. 100%: nobody moves. Production boxes usually sit **60-80%** and keep **20%+ headroom**. Traffic is not a metronome. It **bursts**. Average 40% still spikes through 100% if you have no shoulder.' },
          { type: 'quote', text: 'You cannot run at 100% and stay fast. The buffer is the product.' },
        ],
      },
      {
        heading: '5. The bottleneck is specific — measure, do not sprinkle Redis',
        blocks: [
          { type: 'p', text: '“Slow” means **something named** is slow. In practice we skip naming it. We add a cache because a blog said so. We bump the database version. We add instances. Sometimes we get lucky. Often we spend a week fixing a problem we **do not have**.' },
          { type: 'p', text: 'Story from the chapter: `GET /products/:id` felt slow. Cache in front of the read. Still slow. Then **timers** on the path: the query was **10ms**, the new cache **5ms**, a **sync** write to a remote log sink **500ms**. The database was never the villain. Blocking on someone else was. JSON of a huge body, XML, an HTTP call in a loop — same lesson. **Never guess. Always measure.**' },
          {
            type: 'kid',
            items: [
              'The line is long. You hire another cashier. The delay was the printer in the back.',
              'A stopwatch on each door beats a new oven.',
            ],
          },
        ],
      },
      {
        heading: '6. Profilers for CPU, traces for I/O',
        blocks: [
          { type: 'p', text: 'A **profiler** samples a running process: which functions, for how long. A **flame graph** makes wide frames the ones that ate the clock. First look: the hot path is rarely the “clever” business function. It is serialize, or wait.' },
          { type: 'p', text: 'Profilers are strong on **CPU**. Typical backends are **I/O-bound** (query, disk, outbound HTTP). For that, **distributed tracing** (Observe): one request, timestamps at handler / query / vendor. Two milliseconds in your code, 800 in SQL — now you know which lesson to reopen.' },
        ],
      },
      {
        heading: '7. N+1 — one list, a thousand round trips',
        blocks: [
          { type: 'p', text: 'Twenty posts on a home page, then **one query per author**. 21 trips. A thousand posts, 1001. Each trip pays TCP (if you are not pooled), parse, plan, execute, network. Five milliseconds times a thousand is **five seconds** of loader. The frontend loop is the cartoon. The real N+1 is **in the server**, looping `SELECT author` because the ORM made it look like an array walk.' },
          {
            type: 'pre',
            lines: `// the cartoon — and the ORM footgun
posts = db.select(posts)
for post in posts:
  author = db.select(users).where(id = post.authorId)   // N more queries

// bulk: 1 + 1, or a join
posts = db.select(posts)
authors = db.select(users).where(id in post.authorIds)
// or: select related / includes / join`,
          },
          { type: 'p', text: 'Modern ORMs have **prefetch / select-related / includes**. Raw SQL has **JOIN**. Print the SQL in dev. If you see a query per row, that is the bug, not “Postgres is slow.”' },
        ],
      },
      {
        heading: '8. Indexes — a catalog, not a sticker on every column',
        blocks: [
          { type: 'p', text: 'No catalog in a million-book library: walk every shelf (**sequential / full table scan**). A catalog by author: go to the shelves (**index**). Postgres usually uses a **B-tree**: sorted copy of a column plus pointers. Search by `author_id` without an index: seconds on a million rows. With one: tens of milliseconds. Primary key is already indexed. You still index the foreign keys you actually filter and join on.' },
          { type: 'p', text: 'Indexes are **not free**. They take **disk**. Every insert/update/delete **updates every index** on that table. Index every column and writes crawl. Obvious keys (author on books) at migration time. Unobvious keys **after** traces say this query is hot. `EXPLAIN ANALYZE` shows seq scan vs index scan. Add the index, run it again.' },
          {
            type: 'ul',
            items: [
              '**Composite** `(user_id, created_at)` — helps queries that filter both, and queries that only use the **left** prefix. Only `created_at` will not use this index. Order matters.',
              '**Covering** — the index holds the columns the query needs, so Postgres never visits the heap. Bigger index. Worth it when the read is brutal and the column set is tiny.',
            ],
          },
        ],
      },
      {
        heading: '9. Connections — a handshake is not free',
        blocks: [
          { type: 'p', text: 'Locally, open a connection, query, close — you never feel it. At scale: TCP handshake, auth, TLS, session, memory on the database **per connection**. Do that per query and you **pay latency on every request**. Postgres also **caps** connections (hundreds, not tens of thousands). A spike of workers can **exhaust** the cap and the database falls over.' },
          { type: 'p', text: '**Pool:** keep idle connections warm. Borrow, query, return. **Internal** pool = inside each app process. Three instances times 150 = 450 against a 300 cap after autoscaling — crash. **External** pool (one shared pooler in front of Postgres) is the grown-up version when you multiply boxes. Internal is fine until the math says otherwise.' },
        ],
      },
      {
        heading: '10. Cache when the query is already honest',
        blocks: [
          { type: 'p', text: 'After indexes and pooling, if the database is **still** the wall, cache the **expensive result**. Caching lesson is the deep dive. Here: **invalidation** is the hard problem (time-based TTL vs delete-on-write). **Local** maps per instance go stale across boxes. **Shared** cache (Redis-shaped) is one truth plus a network hop. **Tiered:** tiny local L1 for the hottest keys, shared L2 behind it.' },
          { type: 'p', text: 'Patterns: **aside** (read miss → DB → fill). **Write-through** (write DB and cache together — fewer misses, slower writes). **Write-behind** (cache first, DB later — fast, can diverge if the DB write dies). **Hit rate:** 90% is a healthy class; 20% means the key, TTL, or access pattern is wrong. TTL too long = stale. Cache too small = evict. Unknown user behavior = you are guessing again.' },
        ],
      },
      {
        heading: '11. Vertical then horizontal',
        blocks: [
          { type: 'p', text: '**Vertical (scale up):** bigger box — more cores, RAM, disk, NIC. Code unchanged. Twice the RAM, twice the local cache, roughly. Often **cheaper than two half-boxes** plus balancer tax. Ceiling: the cloud **largest instance**. **Single point of failure** — that beast reboots, you are gone (standbys help; the shape is still one neck). **One region** — far users stay far.' },
          { type: 'p', text: '**Horizontal (scale out):** more **same-sized** copies. No hardware ceiling. One copy dies, traffic moves. Put copies **near users**. Cost: you now own a **distributed** problem — who gets the request, how state stays true, what happens when the network lies. Vertical avoids that complexity on purpose. Horizontal **trades** one set of problems for another. Pick the set you can operate.' },
        ],
      },
      {
        heading: '12. Statelessness — any box, same answer',
        blocks: [
          { type: 'p', text: 'Horizontal only works if **no instance owns exclusive memory**. Delete instance B; A and C must still be the product. **Stateful** here means “this machine remembers.” Login stored in a process array: next request hits B → **401**. Upload saved on A’s disk: C cannot find the file. SQLite file on the box: only that box has the ledger.' },
          {
            type: 'table',
            columns: ['Thing', 'On the box (broken)', 'Outside (works)'],
            rows: [
              ['Session', 'Array in RAM', 'Shared store all instances can read'],
              ['Upload', 'Local disk', 'Object storage'],
              ['Rows', 'SQLite file beside the app', 'A real networked database'],
            ],
          },
          { type: 'p', text: 'Thumb rule: if you chose horizontal, **every persist** is shared. That is a **code** change, not a slider in the console. Vertical was the slider.' },
          {
            type: 'kid',
            items: [
              'Four identical classrooms. Homework cannot live in one teacher’s drawer.',
              'The office filing cabinet is shared. That is Redis / object storage / Postgres.',
            ],
          },
        ],
      },
      {
        heading: '13. Load balancer — the traffic cop and the pulse',
        blocks: [
          { type: 'p', text: 'Users do not pick instance C. Everything hits an **LB**; the LB forwards. Algorithms:' },
          {
            type: 'ul',
            items: [
              '**Round-robin** — A, B, C, A, … Fine when requests cost about the same and boxes are twins. Mix a 200ms read with a 2s write-plus-vendor-call and one box can drown in the expensive ones.',
              '**Weighted round-robin** — bigger box gets more turns. Still blind to request shape.',
              '**Least connections** — send to whoever has the fewest **open** HTTP waits. Long calls occupy a slot; light calls free it. Better mix of cheap and expensive.',
              '**Weighted least connections**, **least response time**, **resource-based** (CPU/RAM) — same idea: use a signal, not a coin flip.',
            ],
          },
          { type: 'p', text: 'If A is dead, round-robin still **sends A a third of traffic** → 502/503 for those users. **Health checks:** the LB probes a cheap GET on a timer. Fail → stop sending (Shutdown: fail **readiness** on purpose when draining). Live again → put back in rotation. Without probes, horizontal scaling is a lottery of errors.' },
        ],
      },
      {
        heading: '14. The database is still one bottleneck — replicas',
        blocks: [
          { type: 'p', text: 'You scaled the **stateless** app. The **stateful** store is still one primary. Most product APIs are **reads** (conservatively ~70%). **Read replicas:** one primary takes **writes**; copies take **SELECTs**, often closer to the reader. Primary load drops toward the write fraction.' },
          { type: 'p', text: '**Replication lag** is physics. Write name in US, refresh 200ms later against a replica in another continent: old name. Fiber is not instant. Product choice: read-your-writes from primary for a beat, or accept stale for the catalog. Replicas do **not** make one giant table smaller. They copy it.' },
        ],
      },
      {
        heading: '15. Sharding — split the table on purpose',
        blocks: [
          { type: 'p', text: 'When **one** table is too many rows **and** too many QPS, **shard**: split rows across physical databases by a **shard key** (month of order, tenant, user id hash). Each shard is smaller (faster scans) and you have more machines (more QPS). The app (or a router) must **know which shard** before the query. Cross-shard joins and transactions are the bill. Hosted databases often **do this for you**; you still need the words so you can ask for the right knob. Rolling your own cluster on day one is how you learn operations the hard way.' },
        ],
      },
      {
        heading: '16. CDN and edge — cache that is already near the user',
        blocks: [
          { type: 'p', text: 'Even a perfect origin in one region costs **ocean latency** for Tokyo. A **CDN** is a global cache of **points of presence**. Static bundles, images, fonts, and **stable API JSON** (a catalog that barely moves) live at the edge. Origin sees less traffic. Invalidation is still a cache problem — now worldwide.' },
          { type: 'p', text: '**Edge compute** is running **a little logic** at those POPs (auth cookie check, A/B, rewrite) so some requests never wake the origin. Not a replacement for your database. A shorter path for the bits that can be short.' },
        ],
      },
      {
        heading: '17. Async — get the HTTP door closed',
        blocks: [
          { type: 'p', text: 'The 2s handler that emails and writes a fat indexed table **holds an LB connection**. Queues lesson: enqueue, 202, worker. Horizontal scaling **loves** this: workers scale separately from request boxes. Part 2 repeats it because a “slow API” is often work that should not have been on the request thread. Shutdown still nacks in-flight jobs.' },
        ],
      },
      {
        heading: '18. One deploy vs many — monolith first',
        blocks: [
          { type: 'p', text: '**Microservices** are not a performance spell. They are **team and failure-domain** splits, paid for with network, versioning, and traces across hops. A **modulated monolith** (handlers / BLL already taught you the seams) scales **horizontally as one binary** for a long time. Split when a **piece** of the map has a different scale, a different store, or a different on-call — not because a talk said “distributed.”' },
        ],
      },
      {
        heading: '19. Serverless — someone else runs the instances',
        blocks: [
          { type: 'p', text: 'Functions that **appear** when a request arrives, bill per use, scale without you buying VMs. Cold start is a latency tax. Time limits and “no long in-process state” are the same **stateless** rule. Great for spiky, isolated work. Awkward for a chatty, always-warm monolith you have not designed as events. Not magic — a **packaging** of horizontal scale with sharper constraints.' },
        ],
      },
      {
        heading: '20. Quick map',
        blocks: [
          {
            type: 'table',
            columns: ['Move', 'When'],
            rows: [
              ['Percentiles', 'Always. Average is camouflage.'],
              ['Headroom', '60-80% CPU. Bursts are real.'],
              ['Measure', 'Before cache, before bigger DB, before more boxes.'],
              ['N+1 / index / pool', 'The usual database fruits.'],
              ['Vertical', 'Until the ceiling or the single neck scares you.'],
              ['Stateless + LB', 'The price of horizontal.'],
              ['Replicas', 'Read-heavy, accept lag or read-your-writes.'],
              ['Shard', 'One table cannot. Key is the design.'],
              ['CDN / edge', 'Geography and static (and some JSON).'],
              ['Queue', 'Work that should not own the HTTP connection.'],
              ['Many services', 'After the seams hurt, not before.'],
            ],
          },
          {
            type: 'callout',
            lines: [
              '**The tail is the product.** P99 is where checkout lives.',
              '**State off the box, then add boxes.** A balancer without health checks is a random 502 machine.',
              'Scaling is not a stack of logos. It is a sequence: measure, cheap DB wins, cache, up, then out.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'concurrency',
    n: 24,
title: 'Concurrency and Parallelism: Interleave the Waits, Parallelize the Math',
    label: 'Concurrency',
    cluster: 'keep',
    x: 1015,
    y: 820,
    gist: 'Concurrency is many tasks in flight (one core can still serve while a query is outstanding). Parallelism is many cores at the same instant. Most APIs wait on IO 95% of the time. Threads, event loops, and goroutines are three answers to that wait. Races happen at await too.',
    remember: [
      'IO-bound: event loop, async/await, goroutines. CPU-bound: more cores, workers. Do not run image math on the request loop.',
      'A thread has its own stack. Ten thousand of them eat RAM and context switches. Virtual threads map many tasks onto few OS threads.',
      'Increment is three steps. Check-then-act across an await is a race. Locks, channels, or one owner of the number.',
    ],
    sections: [
      {
        heading: '1. A server that takes one customer at a time is not a server',
        blocks: [
          { type: 'h3', text: 'Core idea' },
          { type: 'p', text: 'Every backend is asked to handle **many things at once**. Browser A, browser B, a cron, a webhook. A process that finishes request 1 before it even looks at request 2 is a demo. In production the line is thousands long. If you serialize them, people wait, then they retry, then you have a worse line.' },
          { type: 'p', text: 'This chapter is a **mental model**, not a library tour. `async` and `await` are keywords. Under them: a scheduler, a wait, a resume. If you only know the keywords, you cannot debug a hung loop, a thread explosion, or a balance that went negative. If you know the wait, you can pick a model on purpose.' },
          { type: 'quote', text: 'Concurrency is how the program is structured. Parallelism is how many cores actually run at the same instant. Most backend work is the first problem.' },
        ],
      },
      {
        heading: '2. The wait is the product — 95% idle is the default',
        blocks: [
          { type: 'p', text: 'A typical handler: parse JSON, validate, **query**, maybe call email or payments, serialize, write the socket. Parse and validate are CPU. The query is **not**. You send bytes. You sit. 1ms on a hot local box, 100ms across a busy network. The CPU did not get slower. **Physics** did.' },
          { type: 'p', text: 'A modern core does on the order of **3 billion instructions a second**. Wait 100ms for Postgres and you just threw away **hundreds of millions** of instructions. Five network hops at 50ms each is 250ms of waiting against maybe **10ms** of actual compute. The box is idle **most of the request**. Concurrency exists so that idle is not a personality: while A waits, B gets the core.' },
          {
            type: 'table',
            columns: ['Slice', 'Rough time', 'Bound'],
            rows: [
              ['Route, validate, JSON', '1-10ms', 'CPU'],
              ['One SQL round trip', '1-100ms', 'IO'],
              ['Five hops (DB + vendor + mail)', '~250ms', 'IO'],
              ['Handler compute in between', '~10ms', 'CPU'],
            ],
          },
          {
            type: 'kid',
            items: [
              'You order. The kitchen is quiet for two minutes while the oven works. The cook staring at the glass is wasted.',
              'A shop that takes the next ticket while the oven runs serves the room. That is concurrency.',
            ],
          },
        ],
      },
      {
        heading: '3. Concurrency vs parallelism',
        blocks: [
          { type: 'p', text: '**Concurrency:** many tasks **in flight**. Start, pause on wait, resume. One core is enough. You are **dealing with** several things. You are not necessarily **doing** them in the same nanosecond.' },
          { type: 'p', text: '**Parallelism:** many instructions **at the same instant**. That needs **more than one core** (or more than one machine). Two cores, two requests in the first 5ms of JSON parse, truly overlapping. One core cannot do that. It can only interleave.' },
          {
            type: 'table',
            columns: ['Word', 'Means', 'Hardware'],
            rows: [
              ['Concurrency', 'Structure: start / pause / resume', 'Works on one core'],
              ['Parallelism', 'Execution: same instant', 'Needs multiple cores'],
            ],
          },
          { type: 'quote', text: 'Juggling is concurrency. Two jugglers is parallelism. One juggler with two balls is still one pair of hands.' },
        ],
      },
      {
        heading: '4. Two requests, one core — a timeline',
        blocks: [
          { type: 'p', text: 'Request A arrives. Five milliseconds of CPU: route, validate, deserialize. Then A needs the database (~40ms). The core has nothing useful to do for A. The scheduler (OS or runtime) **gives the core to B**, which just arrived. B burns 15ms of CPU, then B also waits. Around 40ms the database answers A. A does not necessarily snap back this microsecond — someone else may still hold the core — but A is **runnable** again. At 50ms A resumes, finishes, leaves.' },
          { type: 'p', text: 'From the outside both requests were “in progress.” From the silicon, **one core, one instruction stream**. That is concurrency. Add a second core and A and B can parse JSON **together**. That is parallelism. Same handlers. Different hardware story.' },
          { type: 'p', text: 'If you refuse to pause, A occupies the process for the whole 100ms wait. B sits in a socket backlog. That is the “one customer” server. Throughput dies. Latency for everyone else explodes. The query was fine. The **policy** was not.' },
        ],
      },
      {
        heading: '5. IO-bound vs CPU-bound',
        blocks: [
          { type: 'p', text: '**IO-bound:** the limiter is waiting on something **outside** the core. Database, HTTP to a vendor, disk, stdout if it actually blocks, the socket to the client. The CPU is ready. The wire is not.' },
          { type: 'p', text: '**CPU-bound:** the limiter **is** the core. Validation and JSON are CPU, but they are usually **milliseconds**. Image resize, video transcode, heavy crypto, matrix work, ML inference — those **occupy** the core. More concurrent waiters will not shrink that math. You need **more cores**, or a **worker** that is allowed to burn them.' },
          {
            type: 'table',
            columns: ['Workload', 'Examples', 'You want'],
            rows: [
              ['IO-bound', 'SQL, HTTP out, files, most APIs', 'Concurrency: event loop, goroutines, async'],
              ['CPU-bound', 'Images, video, fat crypto, ML', 'Parallelism: threads, processes, extra cores'],
              ['Mixed', 'API that also resizes an upload', 'Both: do not do the math on the request loop'],
            ],
          },
          { type: 'p', text: 'Most backends are **majority IO**. That is why Node can look heroic on a CRUD API and look cursed on a thumbnail farm. Go is popular when the mix is real: cheap concurrency **and** real parallelism across cores. The fork is the workload, not the logo.' },
          {
            type: 'kid',
            items: [
              'Waiting for the oven: give the cook another ticket (concurrency).',
              'Chopping a crate of onions: hire a second cook (parallelism). More tickets will not make one knife faster.',
            ],
          },
        ],
      },
      {
        heading: '6. Two machines for concurrency: threads, and the loop',
        blocks: [
          { type: 'p', text: 'Computers expose two big stories. **Threads:** the OS runs several instruction pointers inside one process (or many processes). **Event loop:** usually **one** thread, a queue of callbacks, and an OS primitive that says “these sockets woke up.” Languages dress them differently. Underneath you still have those two, plus a third costume: **virtual threads** (goroutines) that look like threads to you and look like a scheduler to the kernel.' },
        ],
      },
      {
        heading: '7. What a thread actually is',
        blocks: [
          { type: 'p', text: 'A **thread** is an independent execution the OS knows how to run. It has its own **stack** (calls, locals) and an **instruction pointer** (what runs next). Threads in the **same process** share the **heap** and globals. That is why they can pass a pointer and not serialize. Threads in **different processes** do not share that memory — isolation is the point.' },
          { type: 'p', text: 'The **scheduler** picks who runs. It hands a thread a **time slice** (a few milliseconds). When the slice ends, or when the thread **blocks**, someone else runs. Pausing a thread that was not done is **preemptive** scheduling. You do not get a vote. The kernel does.' },
          { type: 'p', text: '**Blocking:** the thread does something the CPU cannot finish alone — a `read` on a socket that has no bytes yet, a disk, a lock. It tells the kernel “I am blocked.” The scheduler runs a **runnable** thread. When the bytes arrive, the blocked thread becomes runnable again. It does not steal the core this instant. It waits its turn.' },
        ],
      },
      {
        heading: '8. The thread tax — stacks, syscalls, context switches',
        blocks: [
          { type: 'p', text: 'Threads are not free. Each one wants a **stack**. On Linux that reservation is often **about 8MB** of address space (not all of it is dirty RAM, but it is not nothing). A toy model: 10,000 concurrent requests, one OS thread each, even at a few hundred KB apiece, and you are talking **gigabytes** just to exist. The process dies of memory before it dies of SQL.' },
          { type: 'p', text: '**Creation** is a syscall: kernel structures, stack, bookkeeping. Microseconds to milliseconds. Fine for a handful. Ugly in a tight loop per request if you spawn unbounded.' },
          { type: 'p', text: 'The quiet killer is the **context switch**. Save registers, load the other thread, update scheduler state. One to ten microseconds sounds cute. A hundred threads fighting for a few cores and you spend the day in **maintenance**: switching instead of computing. For **CPU-bound** work, more threads than cores can **slow you down**. For **IO-bound** work, blocking is a gift — the switch happens while you would have been idle anyway — until the count explodes and the switches become the work.' },
          { type: 'quote', text: 'Four cores can run four threads in parallel. Four thousand threads on four cores is a traffic jam with extra paperwork.' },
        ],
      },
      {
        heading: '9. The event loop — one thread, many waits',
        blocks: [
          { type: 'p', text: 'The other model: **one** (or a few) OS threads. You start a query and **do not block the thread**. You register “when this socket is readable, run this callback.” Control returns to the **loop**. The loop asks the OS which IO finished. Linux: **epoll**. macOS: **kqueue**. Each iteration: any ready sockets? Run their callbacks. Any new CPU work in the queue? Run it. Repeat.' },
          { type: 'p', text: 'No 8MB stack per request. No kernel context switch per waiter. Thousands of **in-flight** queries on one thread is normal. That is why this model **wins on IO-bound** APIs.' },
          { type: 'p', text: 'The bill: **you must not block the loop**. A 2s image resize on that thread is 2s where **nobody** else gets a callback. The whole process looks frozen. CPU-bound work belongs on **another thread or process**. Callbacks after IO must stay **short**: parse, enqueue, return. The loop is a dispatcher, not a workshop.' },
          {
            type: 'kid',
            items: [
              'One receptionist. They never stand in the kitchen. They take the next call the moment they hang up.',
              'If the receptionist starts chopping onions, the phone rings out. That is blocking the loop.',
            ],
          },
        ],
      },
      {
        heading: '10. Same handler, two runtimes',
        blocks: [
          { type: 'p', text: 'Walk a boring `GET user` in both models. Parse the request (CPU). Take a connection from the pool. Send `SELECT ... WHERE id = ?` on a socket. **Read** the response — that read is IO.' },
          {
            type: 'pre',
            lines: `// threading (blocking style)
user = db.query("SELECT * FROM users WHERE id = ?", [id])
// this thread is blocked on the socket
// OS runs some other thread, or nobody if the pool is empty
return json(user)

// event loop
db.query("SELECT * FROM users WHERE id = ?", [id], (err, user) => {
  send(user)  // runs later, when the socket is readable
})
// this thread is already back in the loop`,
          },
          { type: 'p', text: 'Threading: the blocked thread **tells the OS** to schedule a sibling. If every thread is blocked and the pool is exhausted, **everyone waits**. Event loop: the read is registered; request B can parse on the **same** thread while A is in flight. When epoll says socket A is ready, A’s callback runs. Same SQL. Different pause machinery: kernel thread state vs callback queue.' },
          { type: 'p', text: 'After the row arrives, both models spend CPU again: parse into objects, serialize JSON, write the client socket (more IO). Humans read the handler top to bottom. The pauses are invisible. That is the trap.' },
        ],
      },
      {
        heading: '11. async / await is callbacks in a nicer font',
        blocks: [
          { type: 'p', text: 'Old JavaScript: nested callbacks, error as the first argument, “callback hell” when the second query lives inside the first. After ES6: `async` / `await`. It **looks** synchronous. It is **not**. `await` **yields** to the event loop until the promise settles. Other requests run in the gap. Then you resume on the next line.' },
          {
            type: 'pre',
            lines: `async function handle(userId) {
  const user = await db.query(
    "SELECT * FROM users WHERE id = ?",
    [userId]
  )
  return user
}`,
          },
          { type: 'p', text: 'Python `async def` / `await`, JS, others: same contract. The keyword means **this wait is allowed to pause me**. A blocking `query()` on the loop thread is the old sin with a shorter name. Drivers that actually block will still freeze Node. `await` only helps if the thing you await is **non-blocking IO**.' },
        ],
      },
      {
        heading: '12. Why await only lives inside async — a state machine',
        blocks: [
          { type: 'p', text: 'A single-threaded runtime cannot literally “wait” without freezing the process. So the compiler **rewrites** an async function into a **state machine**: which line you are on, which locals to keep, what to do when the promise returns. `async` is the flag that says “please rewrite me.” `await` outside that rewrite is a syntax error because there is no machine to pause.' },
          { type: 'p', text: 'Traffic-light analogy: states (red / yellow / green), transitions on a timer. Here the states are **your lines**. Hit `await db.getUser`: save locals, register a callback, **return to the loop**. When the row arrives, enter the next state: `await db.getOrders`. Save again. Resume. Return `{ user, orders }`.' },
          {
            type: 'pre',
            lines: `// what you wrote
async function fetchUserData(userId) {
  const user = await db.getUser(userId)
  const orders = await db.getOrders(userId)
  return { user, orders }
}

// what it is conceptually
function fetchUserData(userId) {
  let state = 0
  let user, orders
  function step() {
    switch (state) {
      case 0:
        state = 1
        db.getUser(userId).then((result) => {
          user = result
          step()
        })
        return
      case 1:
        state = 2
        db.getOrders(userId).then((result) => {
          orders = result
          step()
        })
        return
      case 2:
        return { user, orders }
    }
  }
  return step()
}`,
          },
          { type: 'p', text: 'You do not have to love compilers. You do have to know: **every await is a concurrency point**. The loop runs other code in the hole. Shared variables are not frozen just because your function is “waiting.” That is the next chapter of pain.' },
        ],
      },
      {
        heading: '13. Goroutines — many virtual threads, few OS threads',
        blocks: [
          { type: 'p', text: 'Go’s answer is **goroutines**: virtual threads the **runtime** schedules onto a small pool of **OS threads** (M:N). You write blocking-looking code. A `Query` that waits on the network **pauses that goroutine**, not necessarily the OS thread. The Go scheduler runs another goroutine on the same thread. Cheap create, small initial stack (**on the order of 2KB**, grows as needed), switch that is a pointer dance rather than a full kernel context switch. Thousands to millions in flight is the pitch. 10,000 OS threads is how you OOM. 10,000 goroutines is a Tuesday.' },
          { type: 'p', text: 'The HTTP server typically **starts a goroutine per request**. `go f()` is the keyword you would use yourself. When G1 hits IO, G2 runs. When the socket wakes, G1 is runnable again. You still get **parallelism** when there are multiple OS threads on multiple cores — CPU-bound goroutines can actually overlap. That is why mixed workloads like Go: concurrency without an event-loop religion, parallelism without a thread per connection.' },
          {
            type: 'table',
            columns: ['', 'OS thread', 'Goroutine'],
            rows: [
              ['Stack', '~8MB reserved', '~2KB, grows'],
              ['Create', 'kernel syscall', 'runtime, cheap'],
              ['Switch', 'OS context switch', 'runtime, light'],
              ['How many', 'thousands, painfully', 'millions, in principle'],
              ['Who schedules', 'kernel', 'Go runtime onto OS threads'],
            ],
          },
        ],
      },
      {
        heading: '14. Race: increment is three steps',
        blocks: [
          { type: 'p', text: 'Concurrency’s tax is **shared mutable state**. Two tasks, one number, no protocol. A **race** means the answer depends on **timing**. Tests pass on your laptop. Production loses a write on Tuesday.' },
          { type: 'p', text: '`counter += 1` is not one instruction in your head. **Read** the value. **Add** in a register. **Write** back. Between those steps another task can sneak in.' },
          {
            type: 'pre',
            lines: `counter starts at 0
T1 reads 0
T2 reads 0          // both saw the old world
T1 writes 1
T2 writes 1          // lost update — expected 2, got 1`,
          },
          { type: 'p', text: 'That is a **lost update**. Hard to see: no crash, just a wrong number. Stress tests and race detectors exist because sequential unit tests will not save you.' },
        ],
      },
      {
        heading: '15. You can race on one thread — await at the bank',
        blocks: [
          { type: 'p', text: 'Node is single-threaded. That does **not** mean races are impossible. They live at **await**. Check the balance, await the payment vendor, subtract. In the hole, another `withdraw` runs the same check on the **old** balance.' },
          {
            type: 'pre',
            lines: `balance = 100
withdraw(100):  100 >= 100? yes → await process()
withdraw(100):  100 >= 100? yes → await process()   // still 100
first resumes:  balance = 0
second resumes: balance = 0 - 100 = -100`,
          },
          { type: 'p', text: 'The pattern is always **check-then-act** with a yield in the middle: read, decide, await, mutate based on a **stale** decision. Threads are one way to get that hole. `await` is another. The database row is shared state too. A **transaction** (or `UPDATE ... WHERE balance >= $1`) is often the lock you already have — do not reimplement banking in a process global.' },
          {
            type: 'kid',
            items: [
              'Two kids both see one cookie, both get told yes, both eat. The jar cannot do that math.',
              'The hole is not “threads.” The hole is “I looked, then I waited, then I acted.”',
            ],
          },
        ],
      },
      {
        heading: '16. Locks, channels, atomics',
        blocks: [
          { type: 'p', text: '**Lock / mutex:** only one task in the **critical section**. Acquire, read-increment-write, release. Others block. Correct. Cost: waiting, **contention**, and **deadlock** if two locks are taken in opposite orders. Keep the section **tiny**. Do not hold a lock across a network call unless you like outages.' },
          { type: 'p', text: '**Channels (Go):** do not share the variable. **Send a message.** One goroutine **owns** the counter. Everyone else sends “increment.” Serial by construction. The proverb: do not communicate by sharing memory; **share memory by communicating**. Cleaner for pipelines. Still a design: the protocol is the API.' },
          { type: 'p', text: '**Atomics:** hardware-indivisible bump of **one** integer. Great for a counter. Not a substitute for a multi-step withdraw. **Immutability** (copy, do not mutate) removes the race by removing the write. Heavier on memory. Fine when the object is small.' },
          {
            type: 'table',
            columns: ['Tool', 'Best for', 'Bill'],
            rows: [
              ['Lock', 'A critical section of several steps', 'Contention, deadlock if nested badly'],
              ['Channel', 'One owner, many senders', 'You must design the messages'],
              ['Atomic', 'One integer, one op', 'Does not compose into “check then update”'],
              ['Immutability', 'No writers', 'Copies'],
              ['DB transaction', 'The row is the truth', 'Use it instead of a process global'],
            ],
          },
        ],
      },
      {
        heading: '17. Practical rules',
        blocks: [
          {
            type: 'ul',
            items: [
              'Share **less**. If only one owner mutates, you cannot race.',
              'If you share, **every** read and write goes through the protocol. One naked write is enough to corrupt.',
              'Critical sections stay **short**. Lock, bump, unlock. Not lock, call Stripe, unlock.',
              'Do not nest locks without an order everyone obeys.',
              'Test under load. Sequential tests lie. Race detectors (Go `-race`, ThreadSanitizer) exist for a reason.',
              'On an event loop, **never** CPU-block. Offload math. `await` is not a lock.',
            ],
          },
        ],
      },
      {
        heading: '18. Quick map',
        blocks: [
          {
            type: 'table',
            columns: ['Situation', 'Reach for'],
            rows: [
              ['CRUD API, lots of SQL wait', 'Event loop (Node) or goroutines (Go)'],
              ['Thumbnails, video, fat crypto', 'Worker threads / extra processes / extra cores'],
              ['Mixed', 'Do IO on the request path; park CPU work elsewhere'],
              ['Shared counter in process', 'Atomic or a lock, or do not share'],
              ['Shared balance', 'Database constraint / transaction, not a global'],
              ['Pipeline of tasks', 'Channels or a queue (jobs lesson)'],
            ],
          },
          {
            type: 'callout',
            lines: [
              '**Most backends are IO-bound.** Concurrency is the default win. Parallelism is for the math.',
              '**async/await is a state machine.** Every await is a hole where someone else runs.',
              '**Threads cost stacks and switches.** Virtual threads exist because 10k OS threads is a memory story.',
            ],
          },
        ],
      },
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
    title: 'Twelve-Factor Discipline: A Checklist for Apps That Must Run in More Than One Place',
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
    sections: [
      {
        heading: '1. Why this checklist exists',
        blocks: [
          { type: 'h3', text: 'Core idea' },
          { type: 'p', text: '**Twelve-factor** is a 2011 Heroku essay that named how SaaS apps actually survive: same code on a laptop, in staging, and in prod; no pet server; config not baked into the binary. It is not a religion and not “the only architecture.” It is a **checklist** for apps that must **run in more than one place**.' },
          { type: 'p', text: 'This map already taught the pieces under other names: **19 · Config**, **20 · Observe**, **21 · Shutdown**, **12 · Databases**. This node is the **poster on the wall** so you can audit a repo in one pass. If a factor is a whole lesson, this page points there instead of rewriting it.' },
          { type: 'quote', text: 'Twelve-factor is how you stop having a “prod machine” that nobody dares reboot.' },
          {
            type: 'kid',
            items: [
              'The recipe is the same at home and in the cafeteria. The pantry and the oven settings change. You do not rewrite the recipe for each kitchen.',
              'A snowflake server is a locker only one kid has the key to. When that kid is sick, the hallway is stuck.',
            ],
          },
        ],
      },
      {
        heading: '2. I–II · One codebase, explicit dependencies',
        blocks: [
          { type: 'p', text: '**I. Codebase** — one repo, many deploys. Not a fork per environment. Staging is the **same git history** with different config, not `backend-prod-FINAL-v2`. Multiple apps? Multiple repos (or a monorepo with **clear** package boundaries). One app smeared across three undocumented copies is how prod drifts.' },
          { type: 'p', text: '**II. Dependencies** — declare them (`package.json`, `go.mod`, `requirements.txt`) and **isolate** them (lockfile, vendoring, containers). Do not assume ImageMagick or a system Python package is “already on the box.” The box will change. The lockfile is the bill of materials.' },
          {
            type: 'pre',
            lines: `// this laptop
import cowsay   // "it works, I brew-installed it"

// prod
ModuleNotFoundError: cowsay

// twelve-factor
package.json / go.mod lists it
lockfile pins the version
the image has nothing extra`,
          },
          {
            type: 'kid',
            items: [
              'One cookbook on the shelf. Three kitchens cook from it. You do not keep a secret fourth cookbook titled “the real one.”',
              'If the recipe says “salt,” the kitchen must **bring salt**. It must not assume the neighbor already has some.',
            ],
          },
        ],
      },
      {
        heading: '3. III · Config in the environment',
        blocks: [
          { type: 'p', text: '**III. Config** — everything that **changes between deploys** lives outside the code: URLs, keys, feature flags, pool size. Code in git. Secrets **never** in git. The usual wire is **environment variables** (and a vault when you have many machines). **19 · Config** is the full DNA lesson. The twelve-factor rule is the slogan: **same artifact, different env.**' },
          { type: 'p', text: 'Hardcoded `postgres://localhost` in a source file is the anti-pattern. A `.env` on your laptop is fine as a **local overlay**. In prod, the platform **injects** the values. Validate at boot — Config already yelled this — so a missing `RESEND_API_KEY` refuses to start instead of limping.' },
          { type: 'quote', text: 'If you have to recompile to change the database host, that host was not config. It was a bug waiting for a new region.' },
        ],
      },
      {
        heading: '4. IV · Backing services are attached resources',
        blocks: [
          { type: 'p', text: '**IV. Backing services** — database, cache, queue, email, object storage. Treat each as a **resource you attach** by URL/credential, not as “the Postgres that lives on this box.” Swap a local Redis for ElastiCache by changing config, not by rewriting the service.' },
          { type: 'p', text: 'Your **12 · Databases** lesson is the ledger. Caching, queues, Resend, Supabase buckets: same idea. The app should not care **whose logo** is on the disk. It cares that `DATABASE_URL` answers.' },
          {
            type: 'kid',
            items: [
              'The kitchen borrows a fridge. Tomorrow a different fridge, same plugs. You do not build the fridge into the stove.',
              'Email is a backing service too. The contact form talks to Resend by a key — not by “the mail program installed on the Vercel box.”',
            ],
          },
        ],
      },
      {
        heading: '5. V · Build, release, run — three stages',
        blocks: [
          { type: 'p', text: '**V. Build, release, run** — strict separate stages. **Build** turns git into an artifact (image, bundle). **Release** is that artifact **plus** a config snapshot. **Run** is the process in prod. You do not “hot-edit a file on the server.” You do not bake prod secrets into the image. A rollback is “run the previous release,” not “SSH and remember what we changed.”' },
          {
            type: 'pre',
            lines: `git commit
  → build   (npm run build / docker build)     artifact
  → release (artifact + env for this deploy)   named, immutable
  → run     (start the process)                disposable`,
          },
          { type: 'p', text: '**31 · DevOps** is CI/CD as a pipeline. This factor is the **law** that pipeline is enforcing. Mixing stages is how you get “works on the box we SSH into.”' },
        ],
      },
      {
        heading: '6. VI–IX · Processes: stateless, a port, scale-out, disposable',
        blocks: [
          { type: 'p', text: '**VI. Processes** — the app is one or more **stateless** processes. Session in a store, uploads in object storage, never “a file I wrote to `/tmp` and will read on the next request.” The next request may hit **another** process. Local disk is a scratch pad that dies with the container.' },
          { type: 'p', text: '**VII. Port binding** — the process **exports HTTP** (or whatever) by **binding a port**. It is not a plugin inside Apache that the OS already started. `PORT=3000` from the environment; the platform routes to it. That is how Vercel, Heroku, and containers all look the same from the app’s point of view.' },
          { type: 'p', text: '**VIII. Concurrency** — scale **out** by running **more processes** (or more containers), not by turning one process into a god. **24 · Concurrency** is the CPU story. This factor is the **ops** story: more copies of a small process, behind a load balancer.' },
          { type: 'p', text: '**IX. Disposability** — fast boot, graceful stop. SIGTERM: stop taking work, finish in-flight, close the pool. **21 · Shutdown** is the full sequence. Twelve-factor just insists you **can** kill a process at any time and start another. Cattle, not pets.' },
          {
            type: 'table',
            columns: ['Factor', 'Do', 'Do not'],
            rows: [
              ['VI Stateless', 'Session in Redis / JWT. Files in a bucket.', 'User uploads on the app disk.'],
              ['VII Port', 'Listen on `PORT`.', 'Assume you are a module inside a preinstalled server.'],
              ['VIII Scale', 'More processes.', 'One mega-process that holds all the work in RAM forever.'],
              ['IX Disposable', 'Boot in seconds. Drain on SIGTERM.', 'A boot that needs a 10-minute ritual. Kill -9 as the only stop.'],
            ],
          },
        ],
      },
      {
        heading: '7. X · Dev/prod parity',
        blocks: [
          { type: 'p', text: '**X. Dev/prod parity** — keep the **gaps** small: time (hours between deploys, not months), people (who writes it also ships it), tools (Postgres locally if prod is Postgres — not SQLite “because it is easier,” then surprise JSON vs ARRAY in prod). Docker Compose is a cheap way to make the laptop look like a tiny prod: same engine, smaller.' },
          { type: 'p', text: 'Parity is never perfect. The point is **no surprise adapters**. If you must fake a vendor locally, fake it **behind the same interface** the BLL already depends on — not a totally different code path that only exists on your machine.' },
          {
            type: 'kid',
            items: [
              'Practice in a kitchen that uses the same stove. A toy oven teaches you nothing about the cafeteria fire.',
              'If homework is pencil and the exam is a welding torch, you did not keep parity.',
            ],
          },
        ],
      },
      {
        heading: '8. XI · Logs are a stream',
        blocks: [
          { type: 'p', text: '**XI. Logs** — the app **writes events to stdout/stderr**. It does not rotate files, ship to S3, or manage log disks. The **platform** (container runtime, Vercel, a collector) grabs the stream. **20 · Observe** is levels, JSON, request ids, metrics, traces. This factor is only: **do not become your own syslog.**' },
          {
            type: 'pre',
            lines: `// twelve-factor
console.log(JSON.stringify({ msg: "refund.ok", orderId, requestId }))

// not twelve-factor
fs.appendFileSync("/var/log/myapp.log", line)
  + a cron that gzips last week
  + SSH to grep`,
          },
          { type: 'quote', text: 'The process talks. The platform remembers. If you need to SSH to read last Tuesday, the stream never left the box.' },
        ],
      },
      {
        heading: '9. XII · Admin as one-off processes',
        blocks: [
          { type: 'p', text: '**XII. Admin processes** — migrations, a REPL, “backfill these users,” run as **one-off processes** against the **same release and config** as the app. `npm run migrate` in CI, `heroku run`, `kubectl exec` of a job — not a secret SSH into a pet and `python` in a tmux nobody named.' },
          { type: 'p', text: 'The one-off should use the **same dependency isolation** as the web process. A migration that only works because you globally installed psql 14 on that one box will fail on the next box.' },
          {
            type: 'kid',
            items: [
              'Sunday inventory is a **shift** with the same uniform as weekday staff — not a stranger with a master key and no nametag.',
              'Do not hide the mop in a closet only the night janitor knows. Put it on the schedule.',
            ],
          },
        ],
      },
      {
        heading: '10. What twelve-factor is not',
        blocks: [
          { type: 'p', text: 'It is **not** microservices. A modulated monolith can be twelve-factor. It is **not** “never use a local disk for a cache that may vanish.” It **is** “do not require that disk to still be there on the next request.”' },
          { type: 'p', text: 'It is **not** a reason to skip a vault, skip tracing, or skip a domain. It was written for **Heroku-shaped** apps. You still need **19–21** and **31** when the product is real. Use the checklist to **find snowflakes**, not to win an argument about Kubernetes.' },
          { type: 'p', text: 'Some apps **should** be stateful (games, live collaboration). Then you **name** the state store and still keep config, logs, and deploys disciplined. Breaking factor VI on purpose is different from never having heard of it.' },
        ],
      },
      {
        heading: '11. Quick map',
        blocks: [
          {
            type: 'table',
            columns: ['Factor', 'In one line', 'This map'],
            rows: [
              ['I Codebase', 'One repo, many deploys.', 'Git. Not a fork per env.'],
              ['II Dependencies', 'Declare and isolate.', 'Lockfile. Image.'],
              ['III Config', 'Env / vault. Same artifact.', '**19 · Config**'],
              ['IV Backing services', 'Attached by URL.', '**12 · Databases**, cache, queue, mail'],
              ['V Build/release/run', 'Three stages. Immutable release.', '**31 · DevOps**'],
              ['VI–IX Process', 'Stateless, port, scale-out, killable.', '**21 · Shutdown**, **24 · Concurrency**'],
              ['X Parity', 'Laptop looks like a tiny prod.', 'Same engine, smaller.'],
              ['XI Logs', 'Stdout. Platform ships.', '**20 · Observe**'],
              ['XII Admin', 'One-off, same release.', 'Migrations as jobs, not SSH folklore.'],
            ],
          },
          {
            type: 'callout',
            lines: [
              '**Same code, different env.** Config and backing services are attached, not baked in.',
              '**Processes are cattle.** Bind a port, log to stdout, die on SIGTERM, scale by copies.',
              'Open **19 · Config** and **31 · DevOps** when you want the how. This node is the checklist.',
            ],
          },
        ],
      },
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
