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
              'Anything from the client: **JSON body**, **query params**, **path params**, **headers**.',
              'If the API needs a `name` string between 5 and 100 characters, prove that **at the door**.',
              'Skip the gate and bad data walks into the service and the SQL. The user gets a **500** (“something unexpected”). That is a poor form experience. Fail at the door with **400** and a field list they can fix.',
            ],
          },
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
          { type: 'h3', text: 'Type' },
          { type: 'p', text: 'String, number, boolean, array, nested object. Query params arrive as **strings** even when they look like numbers — type checks and transforms often travel together.' },
          { type: 'h3', text: 'Syntactic' },
          { type: 'p', text: '“Does this string *look like* what we asked for?” Email regex / parser. Phone pattern. A date that can actually be read as a date.' },
          { type: 'h3', text: 'Semantic' },
          { type: 'p', text: 'The value is the right type and the right shape — and still nonsense. Date of birth `2025-13-01` when today is `2025-11-01`. Age `365`. The pipeline should reject it.' },
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
          { type: 'h3', text: 'Query params are always strings' },
          { type: 'p', text: '`GET /bookmarks?page=2&limit=20` looks numeric in the URL. On the server, `page` and `limit` are still **strings** `"2"` and `"20"`. If the rule is “page is a number, `> 0` and `< 500`,” you **cast** first, then check the range. Cast fails → tell the client, do not crash.' },
          {
            type: 'pre',
            lines: `// arrives as strings
page  = "2"
limit = "20"

// transform, then validate
page  = int("2")     # 2
limit = int("20")    # 20
# then: 0 < page < 500,  0 < limit < 10000`,
          },
          { type: 'h3', text: 'Normalize what users type wildly' },
          {
            type: 'ul',
            items: [
              'Email `Test@Example.COM` → **lowercase** `test@example.com` before lookup.',
              'Phone missing `+` → prefix it so the service always stores one form.',
              'Dates in mixed formats → one canonical form for the database.',
            ],
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
