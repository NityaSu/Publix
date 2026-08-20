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
    title: 'Complete REST API Design: Resources Clients Can Guess Without Reading Your Code',
    label: 'REST',
    cluster: 'surface',
    x: 1325,
    y: 125,
    gist: 'REST is a contract: plural nouns in the path, verbs in the method, JSON in camelCase. Design the interface first — then code. Pagination, sort, filter, and sane defaults are part of that contract, not extras.',
    remember: [
      'Collection `GET/POST /books`. Item `GET/PATCH/DELETE /books/:id`. Same path, different method.',
      'POST is the only non-idempotent method — and the bucket for custom actions (`POST /orgs/:id/archive`).',
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
          {
            type: 'kid',
            items: [
              'Putting the same sticker on the locker a hundred times still leaves **one** sticker. That is PUT.',
              'Dropping a new marble in the jar every time you press the button is POST. The jar grows.',
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
              ['Idempotent', 'GET, PUT, PATCH, DELETE. POST is not — each call may create.'],
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
