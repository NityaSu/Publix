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

export interface LessonSection {
  heading: string;
  body?: string[];
  kid?: string;
  table?: { term: string; here: string; kid: string }[];
  code?: { caption?: string; lines: string };
  examples?: LessonExample[];
  bullets?: string[];
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
    gist: 'Routing is a table: HTTP method (intent) + URL path (where) → one function. A phone screen never talks to a database. It sends one request; the map walks it to one worker.',
    remember: [
      'Method = intent. Path = which resource. Together they pick exactly one function.',
      'The live map is the registration lines, not comments above them.',
      'Two 404s: nobody registered that address vs the address matched and the row was missing.',
    ],
    sections: [
      {
        heading: 'How I picture it',
        body: [
          'The API I keep in mind is a Go service with a Gin-style router. The map lives in `routes/`. The work lives in `endpoints/`. There are no Spring `@GetMapping` stickers. Comments can describe a path; the live map is still the `.GET` / `.POST` lines, like `desk.GET("", h.ListMembers)`.',
          'Pretend I am rebuilding a workplace-ops API from zero. A phone or a desk UI never “calls a database.” It sends one HTTP request: a method (what it wants) plus a URL (which drawer). My job is to write a table that says “this method + this path goes to this one Go function.” That table is routing.',
          'I would start the same way `BuildEngine` does: one engine, then `/api`, then `/v1`, then `/desk` vs `/mobile`, then one resource group per file (`/member`, `/time-off`, `/check-in`). After that, each line like `POST /create` is one endpoint method. If two URLs look similar, they are still two map entries — `GET /api/v1/desk/member` lists people; `POST /api/v1/desk/member/create` adds one.',
        ],
        kid: 'Routing is a receptionist. Someone says “GET member list” or “POST create member.” The receptionist looks at the words (method) and the room number (URL), then walks them to one person (endpoint).',
      },
      {
        heading: 'Words I use (so “controller ≠ handler ≠ fetch”)',
        table: [
          {
            term: 'Intent',
            here: 'Purpose. GET means read, POST means create/do, PUT/PATCH means change, DELETE means remove.',
            kid: 'What you want to happen.',
          },
          {
            term: 'Controller',
            here: 'The struct that groups related routes, e.g. `MemberEndpoint` in `endpoints/member.go`. This codebase names it Endpoint, not Controller.',
            kid: 'The office (people office, time-off office).',
          },
          {
            term: 'Handler / endpoint method',
            here: 'One method for one route, e.g. `ListMembers`, `AddMember`, `Punch`.',
            kid: 'One worker who does one job.',
          },
          {
            term: 'Fetch / lookup',
            here: 'Only some GET methods load records. `Punch` is POST and writes a check-in. `BuildPayMonth` is POST and builds a file.',
            kid: 'Fetch = “go get it.” Not every door is a “go get it” door.',
          },
        ],
        body: [
          'Request flow in that codebase: HTTP request → engine (`BuildEngine`) → group prefixes (`/api/v1/desk` or `/api/v1/mobile`) → resource group (`/member`) → one registered method+path → one endpoint method → service → store.',
        ],
      },
      {
        heading: '1. What is routing?',
        body: [
          'Routing = map (HTTP method + URL path) → one endpoint method.',
          'HTTP method = intent. Same path with a different method is a different job. URL path = where / which resource. `/member` is people, `/time-off` is leave-from-work, `/check-in` is punch data.',
          'The framework builds the map in `routes/*.go`. OpenAPI comments document it, but the live map is the `.GET` / `.POST` / `.PUT` / `.PATCH` / `.DELETE` lines.',
        ],
        kid: 'Method = what you want. Path = which drawer. Routing = the label that sends you to the right worker.',
        examples: [
          {
            method: 'POST',
            path: '/api/v1/mobile/auth/session',
            goesTo: 'routes/auth.go → AuthEndpoint.OpenMemberSession',
            purpose: 'A teammate signs in (creates a session/token). Not a fetch of a list.',
          },
          {
            method: 'GET',
            path: '/api/v1/desk/member',
            goesTo: 'routes/member.go → MemberEndpoint.ListMembers',
            purpose: 'Desk UI looks up a paginated member list. This GET really is a fetch.',
          },
          {
            method: 'POST',
            path: '/api/v1/desk/member/create',
            goesTo: 'routes/member.go → MemberEndpoint.AddMember',
            purpose: 'Desk UI creates a member. Same resource family as the list, opposite intent.',
            note: 'Tiny compare: GET …/member (list) vs POST …/member/create (create). Same struct, two methods, two intents. Swap them and listing tries to insert.',
          },
          {
            method: 'PUT',
            path: '/api/v1/desk/time-off/decide/:id',
            goesTo: 'routes/time_off.go → TimeOffEndpoint.SetDecision',
            purpose: 'Desk UI changes status of one time-off row (accept/decline). Path names which row; this is not “fetch the list.”',
          },
          {
            method: 'POST',
            path: '/api/v1/mobile/check-in/punch',
            goesTo: 'routes/check_in.go → CheckInEndpoint.Punch',
            purpose: 'Teammate punches in or out. A write. Proof that “endpoint” does not mean “fetch.”',
          },
        ],
      },
      {
        heading: '2. Types of routes',
        body: [
          'Static route: every piece of the path is fixed (`/session`, `/list`, `/export`). Dynamic route: a slot in the path changes per request. In this stack the slot is written `:id` (or `:date`, `:user-id`, `:member_id`). The endpoint reads it with `c.Param("id")`. Docs often write the same slot as `{id}` — that is docs only, not the live router.',
          'This stack does not use `@PathVariable`. It uses path slots in the registration string, then `c.Param` with the same name.',
        ],
        kid: 'Static = a door with a painted name. Dynamic = a door with a blank where you write the person’s number.',
        code: {
          caption: 'routes/site.go + endpoints/site.go',
          lines: `desk.GET("/:id", h.ReadSite)
desk.POST("/create", h.AddSite)
desk.PUT("/update/:id", h.EditSite)
desk.DELETE("/delete/:id", h.RemoveSite)

func (h *SiteEndpoint) ReadSite(c *gin.Context) {
    id := c.Param("id")
}`,
        },
        examples: [
          {
            method: 'GET',
            path: '/api/v1/desk/home',
            goesTo: 'HomeEndpoint.LoadHome (routes/home.go)',
            purpose: 'Load the desk home screen. No ID in the URL. Static.',
          },
          {
            method: 'GET',
            path: '/api/v1/mobile/member/me',
            goesTo: 'MemberEndpoint.ReadMyCard',
            purpose: 'The signed-in teammate reads their own card. Identity comes from the token (`c.GetUint("UserId")`), not from the path.',
          },
          {
            method: 'GET',
            path: '/api/v1/desk/member/card/:id',
            goesTo: 'MemberEndpoint.ReadCardByID',
            purpose: 'Desk reads one named teammate. `:id` is the resource identity.',
            note: 'Same struct, two card routes — “me” (static) vs “this person” (dynamic).',
          },
          {
            method: 'POST',
            path: '/api/v1/desk/pay-run/build/:date',
            goesTo: 'PayRunEndpoint.BuildMonth',
            purpose: 'Build pay for one month. The slot is `:date` (e.g. 2025-08-01), read with `c.Param("date")`. Dynamic params are not only IDs.',
          },
          {
            method: 'GET',
            path: '/api/v1/desk/operator/access/:user-id',
            goesTo: 'OperatorEndpoint.ReadAccess',
            purpose: 'Read that operator’s access role. The slot is literally `user-id`, so the code calls `c.Param("user-id")`, not `c.Param("id")`. The name in the route string must match.',
          },
        ],
      },
      {
        heading: '3. Path parameters vs query parameters',
        body: [
          'Path params (`:id` in the URL) = who / which record. Required for identity. Query params (`?page=1&name=Sok`) = how to filter, search, paginate, or pick a period. Optional extras after `?`.',
          'This codebase reads them differently: path via `c.Param("id")`; query via `c.Query("searchDate")` or `c.DefaultQuery("page", "1")`; shared list helper `BindListQuery` reads `page` and `limit`.',
          'Honest finding: almost no live endpoint mixes both on one URL. Identity goes in the path; filters hang on list URLs. That is a design choice, not a textbook mix.',
        ],
        kid: 'Path param = the locker number. Query param = “show me page 2, only late people, 10 per page.”',
        examples: [
          {
            method: 'GET',
            path: '/api/v1/desk/member?teamID=&name=&page=1&limit=10',
            goesTo: 'MemberEndpoint.ListMembers',
            purpose: 'List members, optionally filtered by team and name, paginated. Query only.',
          },
          {
            method: 'GET',
            path: '/api/v1/desk/member/card/:id',
            goesTo: 'MemberEndpoint.ReadCardByID',
            purpose: 'Load that member. `c.Param("id")`. Collection + query vs one resource + path.',
          },
          {
            method: 'GET',
            path: '/api/v1/desk/extra-shift?status=pending&name=&kind=&page=1&limit=10',
            goesTo: 'ExtraShiftEndpoint.DeskList',
            purpose: 'Desk extra-shift list filtered by status, name, and kind. `c.DefaultQuery("status"|"name"|"kind")`.',
          },
          {
            method: 'POST',
            path: '/api/v1/desk/time-bank/settle-member/:member_id',
            goesTo: 'TimeBankEndpoint.SettleForMember',
            purpose: 'Run settlement for one person. `c.Param("member_id")`. Path = which person.',
          },
          {
            method: 'POST',
            path: '/api/v1/desk/time-bank/settle-month?year=2026&month=8',
            goesTo: 'TimeBankEndpoint.SettleForMonth',
            purpose: 'Run settlement for a year/month. `c.Query("year")` and `c.Query("month")`.',
            note: 'Same feature family as the previous row. “Which person?” → path. “Which month?” → query. Closest mix this repo has: two sibling routes, two param styles.',
          },
        ],
        bullets: [
          'Another query-heavy list: GET `/api/v1/desk/planner/items?title=&type=&start_date=&end_date=&yearly=&monthly=&weekly=&today=true&page=&limit=` → `PlannerEndpoint.ListItems`. Detail is a different route: GET `/api/v1/desk/planner/items/:id`.',
          'Docs trap: one decide-endpoint comment said status was a query param and id was a path param, but the live route is `PUT /api/v1/desk/time-off/decide/:id` and status comes from the JSON body. Trust the router file over stale comments.',
        ],
      },
      {
        heading: '4. Nested routing',
        body: [
          'Nested routing = URL hierarchy: parent resource, then child, then maybe an action. In this stack, nesting is groups, then extra path segments: `/api` → `/v1` → `/desk` or `/mobile`, then e.g. `desk.Group("/planner")` + `/items/:id`.',
        ],
        kid: 'Address = country / city / street / house number. `/api/v1/desk/planner/items/12` is “API → edition 1 → desk → planner → item 12.”',
        code: {
          caption: 'routes/boot.go',
          lines: `api := engine.Group("/api")
v1 := api.Group("/v1")
desk := v1.Group("/desk")
mobile := v1.Group("/mobile")`,
        },
        examples: [
          {
            method: 'GET',
            path: '/api/v1/desk/planner/items/:id',
            goesTo: 'PlannerEndpoint.ReadItem (routes/planner.go)',
            purpose: 'One planner item under the planner module. Family: POST/GET /items, GET/PUT/DELETE /items/:id.',
          },
          {
            method: 'GET',
            path: '/api/v1/desk/access-roles/:id/grants-group',
            goesTo: 'AccessRoleEndpoint.ReadWithGrants',
            purpose: 'Grants grouped for that role. Child path hangs off `:id`. Compare: `GET …/access-roles/:id` is the role itself.',
          },
          {
            method: 'POST',
            path: '/api/v1/desk/pay-run/stub/build/:date',
            goesTo: 'PayRunEndpoint.BuildMonthWithStubs',
            purpose: 'Build pay and stubs for a month. Nested under pay-run, then stub, then build. Sibling: `POST /api/v1/desk/pay-run/build/:date` (pay only).',
          },
          {
            method: 'PATCH',
            path: '/api/v1/desk/operator/update/access/:user-id',
            goesTo: 'OperatorEndpoint.ChangeAccess',
            purpose: 'Change that operator’s role (a sub-resource). Sibling: `PATCH …/operator/update/grants/:user-id`.',
          },
          {
            method: 'GET',
            path: '/api/v1/desk/check-in/monthly/export',
            goesTo: 'CheckInEndpoint.MonthlyExport',
            purpose: 'Spreadsheet export of the monthly check-in report. Nested action under `/check-in/monthly`. JSON sibling: `GET …/check-in/monthly`.',
          },
        ],
        bullets: [
          'Time-off kinds vs time-off rows (`/time-off-kind` vs `/time-off`) are sibling resources, not nested URLs. Nesting is when one URL contains the other (`/access-roles/:id/grants-group`), not when two modules are merely related in the store.',
        ],
      },
      {
        heading: '5. Route versioning and deprecation',
        body: [
          'There is no `/v2`. Versioning here is one prefix plus parallel APIs (audience), not old-vs-new editions. From boot: `@BasePath /api/v1`, then `/api` + `/v1` + `/desk` or `/mobile`.',
        ],
        kid: 'Version = “this is edition 1 of the menu.” Desk vs mobile = staff kitchen vs customer menu. Same restaurant, different doors.',
        examples: [
          {
            method: 'GET',
            path: '/api/v1/desk/home',
            goesTo: 'HomeEndpoint.LoadHome',
            purpose: 'Every live business route sits under `/api/v1`. There is no `/api/v2/...` in `BuildEngine`. If I rebuilt, `/v1` is where I would later add `/v2` without breaking phones on v1.',
          },
          {
            method: 'POST',
            path: '/api/v1/desk/auth/session',
            goesTo: 'AuthEndpoint.OpenOperatorSession',
            purpose: 'Desk / operator sign-in.',
          },
          {
            method: 'POST',
            path: '/api/v1/mobile/auth/session',
            goesTo: 'AuthEndpoint.OpenMemberSession',
            purpose: 'Teammate sign-in. Same `/auth/session` suffix, different group. Wrong door = wrong function (or 404 if the path only exists on the other side).',
          },
          {
            method: 'GET',
            path: '/api/v1/desk/time-off  vs  /api/v1/mobile/time-off/mine',
            goesTo: 'TimeOffEndpoint.DeskList vs ReadMine',
            purpose: 'Desk sees a permission-filtered list; the phone sees only mine. Same module, two contracts.',
          },
          {
            method: 'GET',
            path: '/api/v1/desk/time-bank/open-report  vs  /api/v1/ops/time-bank/open-report',
            goesTo: 'TimeBankEndpoint.OpenReport (routes/time_bank.go)',
            purpose: 'Desk can also POST settle routes; `/ops/...` is a read-only report door. Parallel prefix, not a version.',
          },
        ],
        bullets: [
          'Dead map: `routes/sandbox.go` defines `GET /desk/sandbox/data` → `SandboxEndpoint.Ping`, but `BuildEngine` never calls `MountSandbox`. Those URLs 404 even though the files exist.',
          'Ghost comment: one check-in endpoint still documents `@Router /mobile/check-in/request-punch [POST]`, but `routes/check_in.go` only registers `/punch`, `/history`, `/status`. Live map wins.',
        ],
      },
      {
        heading: '6. Catch-all / not found',
        body: [
          'Two different “not found”s. Route miss: nothing in the map matches method+path — the endpoint is never called. Resource miss: the route matched, the function ran, the store had no row.',
          'This service has no custom `NoRoute`. The default engine gives logger + recovery. An unknown URL gets the framework’s plain `404 page not found`. Recovery is the panic net: a crash becomes HTTP 500 instead of killing the process.',
          'The only true wildcard is the spec UI: `engine.GET("/spec/*any", …)`. `*any` means anything under `/spec/`. That is a matched route, not a 404.',
        ],
        kid: 'Route miss = no room with that number (receptionist shrugs). Resource miss = the room exists, but the folder inside is empty. Catch-all `/spec/*any` = “any paper in the docs cabinet.”',
        examples: [
          {
            method: 'GET',
            path: '/api/v1/desk/books',
            goesTo: 'No endpoint. Map miss.',
            purpose: 'Prove the map is exact. This API has no books resource. 404 happens before any `endpoints/*.go` code runs.',
          },
          {
            method: 'GET',
            path: '/api/v1/desk/sandbox/data',
            goesTo: 'SandboxEndpoint.Ping exists, but MountSandbox is never called',
            purpose: 'A file is not a route. Only registration makes a path live.',
          },
          {
            method: 'GET',
            path: '/spec/index.html',
            goesTo: '`GET /spec/*any` (non-production)',
            purpose: 'One pattern serves the whole spec UI. A missing member is not this route.',
          },
          {
            method: 'GET',
            path: '/api/v1/desk/site/99999',
            goesTo: 'SiteEndpoint.ReadSite → service → store',
            purpose: 'If the store returns record-not-found, the error helper maps it to JSON 404. The map found the function; the site row did not exist. Not the framework’s plain 404 page.',
          },
          {
            method: 'PUT',
            path: '/api/v1/desk/access-roles/:id',
            goesTo: 'AccessRoleEndpoint.Edit',
            purpose: 'Missing role → structured “role not found.” Same idea as GET `/api/v1/desk/operator/:id` → operator not found. Matched route, missing record.',
            note: 'Also not a route miss: auth middleware can abort with 401 before the endpoint. The route did match; access failed. Example: GET `/api/v1/desk/member` without a token still hit the member group.',
          },
        ],
        bullets: [
          'Wrong method: this engine does not enable method-not-allowed. `POST /api/v1/desk/home` (home is GET-only) is treated like no match → 404, not 405. When I rebuild, decide whether I want 405 for “path exists, method wrong.”',
        ],
      },
      {
        heading: 'Rebuild checklist',
        bullets: [
          'One engine, then groups. Copy `BuildEngine`: `/api` → `/v1` → `/desk` and `/mobile`.',
          'One file per resource. `routes/member.go` owns member paths; `endpoints/member.go` owns the methods.',
          'Method = intent, path = resource. `GET ""` list, `POST /create` create, `PUT /update/:id` change, `DELETE /delete/:id` remove — this project’s style (verb in the path, not only REST-pure `/members/:id`).',
          '`:name` in the route must match `c.Param("name")`. `:id`, `:date`, `:user-id`, `:member_id` are all used on purpose.',
          'Path = identity, query = filter/page/period. Do not put `teamID` in the path for a list; this repo puts it in `?teamID=`. Do not put member id in query for “this person”; this repo uses `/card/:id`.',
          'Nest only when it is a child. `/planner/items/:id`, `/access-roles/:id/grants-group`, `/pay-run/stub/build/:date`.',
          'Audience is not version. Desk vs mobile vs `/ops` are parallel doors. Keep `/v1` until I truly need `/v2`.',
          'Register or it does not exist. `sandbox.go` is the warning. Wire every `MountX` I care about.',
          'Handle two 404s. Unknown URL (framework default) vs missing row (store not-found → JSON). Users feel both as “not found”; the code must treat them differently.',
          'Trust the router file over `@Router` comments. Decide path, pay-run stub path, and `request-punch` already drifted. The live map is `routes/*.go`.',
        ],
        body: [
          'That is routing in this backend: a method plus a path, registered once, pointing at one function. Everything else (filters, nesting, desk vs phone, 404s) is how I keep that map honest as the product grows.',
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
