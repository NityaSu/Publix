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
