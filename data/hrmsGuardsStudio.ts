import type { HrmsStudioMeta } from './hrmsStudioShared';

/**
 * Guards Studio — hrms-admin route protection + hrms_api Gin middleware,
 * and where the JWT actually lives (localStorage, not a cookie).
 */
export const hrmsGuardsStudio: HrmsStudioMeta = {
  id: 'guards',
  brand: 'Guards Studio',
  title: 'Route protection & middleware — front to back',
  subtitle:
    'hrms-admin Vue beforeEach + Axios interceptors + Gin AuthN/AuthZ. The JWT sits in localStorage under auth_session. Cookies and sessionStorage are the interview traps — this repo does not use them for login.',
  mapPath: '/insights/notes/hrms',
  noteSlug: 'hrms',
  chapters: [
    {
      id: 'play',
      label: '0 · Play',
      title: 'Walk one request through every hallway',
      lead: 'Log in as Sokha, open /leave, approve. Then Dara (no leave permission). Then curl with no Bearer. Toggle the drawer to see what would change if this were a cookie or sessionStorage app. The real code is localStorage.',
      files: [
        'hrms-admin/src/router/index.ts → beforeEach',
        'hrms-admin/src/pages/auth/services/session.ts → auth_session',
        'hrms-admin/src/lib/api/index.ts → Axios interceptors',
        'hrms_api/middleware/auth.go → AuthN',
        'hrms_api/middleware/permission.go → RequireResourcePermission',
      ],
      blocks: [
        { type: 'playground', id: 'guards' },
        {
          type: 'kid',
          items: [
            'The Vue guard is a bouncer at the restaurant door. No reservation name → you never sit down.',
            'The API is the kitchen. If you climb through the window (curl), the kitchen still checks the badge.',
            'Hiding the Approve button is taking the menu away. It is not locking the freezer.',
          ],
        },
      ],
    },
    {
      id: 'drawers',
      label: '1 · Drawers',
      title: 'They named it session. It is localStorage. Not a cookie.',
      lead: 'Interviewers mix these words. This codebase is a clean specimen: the file is session.ts, the key is auth_session, the API is localStorage. Redis SetSession on the server is also unused by login. Say that out loud.',
      files: [
        'hrms-admin/src/pages/auth/services/session.ts',
        'hrms-admin/src/pages/auth/store/authStore.ts → initFromSession',
        'hrms_api/services/redis_service.go → SetSession (not called from login)',
      ],
      blocks: [
        {
          type: 'compare',
          title: 'What HRMS actually uses vs what people say',
          columns: ['Word', 'What it looks like in a real browser', 'HRMS'],
          rows: [
            [
              '**Cookie**',
              'Application → Cookies. `Set-Cookie: sid=…; HttpOnly; Secure; SameSite=Lax`. Sent on every HTTP request to that host automatically.',
              '**Not used for auth.** No login Set-Cookie. Axios sends Bearer by hand.',
            ],
            [
              '**localStorage**',
              'Application → Local Storage → origin. Survives tab close and reboot until you clear site data. Any JS on the origin can read it (XSS can steal the JWT).',
              '**This is the drawer.** `localStorage.setItem("auth_session", JSON.stringify({ username, accessToken }))`.',
            ],
            [
              '**sessionStorage**',
              'Application → Session Storage. **This tab only.** Close the tab, it is gone. Duplicate tab does not share it.',
              '**Not used for auth.** Logout does not need to clear it because it was never written.',
            ],
            [
              '**Server session**',
              'Opaque id in a cookie; Redis/DB holds `{ userId }`. Revoke = delete key.',
              'Redis helpers exist. **Login never writes them.** AuthN never reads them. See AuthN Studio.',
            ],
            [
              '**JWT**',
              '`Authorization: Bearer eyJ…` three Base64url parts, HS256.',
              '**The actual credential.** Login returns `accessToken`. Interceptor copies it onto every Axios call.',
            ],
          ],
        },
        {
          type: 'pre',
          caption: 'session.ts — the whole persistence layer',
          lines: `const SESSION_KEY = "auth_session"

save(session)  { localStorage.setItem(SESSION_KEY, JSON.stringify(session)) }
get()          { JSON.parse(localStorage.getItem(SESSION_KEY)) }
clear()        { localStorage.removeItem(SESSION_KEY) }`,
        },
        {
          type: 'callout',
          lines: [
            '**Interview line:** “We persist a JWT in localStorage. That is not an HTTP session and not sessionStorage. Refresh restores Pinia via initFromSession. XSS can read that key; a cookie HttpOnly would not. We accepted that trade for a SPA that stamps Bearer itself.”',
            'Frontend · **25 · Storage** is the drawer theory. This studio is the HRMS specimen.',
          ],
        },
      ],
    },
    {
      id: 'three-mw',
      label: '2 · Three middlewares',
      title: 'Same word, three hallways',
      lead: 'Middleware always means: code in the middle that can pass, stamp, or stop. HRMS has three. Mixing them is how you fail “how do you protect routes?”',
      blocks: [
        {
          type: 'table',
          columns: ['Hallway', 'Where', 'What it sees', 'Can it stop the kitchen?'],
          rows: [
            [
              '**Vue `router.beforeEach`**',
              'hrms-admin `src/router/index.ts`',
              'The **next URL** (`to.path`, `to.meta`). Pinia auth + permissions copy.',
              'No. It only refuses to **mount a page**. curl never hits this file.',
            ],
            [
              '**Axios interceptors**',
              '`src/lib/api/index.ts`',
              'Every SPA HTTP call. Request: add Bearer. Response: if 401, clear storage and `window.location = /login`.',
              'No. It only **dresses** requests the SPA makes. It cannot see a request you type in Terminal.',
            ],
            [
              '**Gin middleware**',
              '`middleware/auth.go` + `permission.go`',
              'Raw HTTP: method, path, `Authorization` header, then SQL/Redis for RBAC.',
              '**Yes.** 401 if the JWT is junk. 403 if the role lacks resource×action. This is the lock.',
            ],
          ],
        },
        {
          type: 'pre',
          caption: 'Vue — the restaurant door (router/index.ts)',
          lines: `router.beforeEach(async (to, from) => {
  if (!authStore.isAuthenticated) await authStore.initFromSession()

  if (authStore.isAuthenticated && to.path === "/login") return from.path
  if (!authStore.isAuthenticated && to.path !== "/login") return "/login"

  if (authStore.isAuthenticated && to.meta.requiresPermission) {
    if (authStore.permissions.length === 0) await authStore.fetchPermissions()
    const { resource, action } = to.meta.requiresPermission
    if (!hasPermission(resource, action)) return "/"   // UX bounce
  }
})`,
        },
        {
          type: 'pre',
          caption: 'Axios — stamp and panic (lib/api/index.ts)',
          lines: `api.interceptors.request.use((config) => {
  const token = authStorage.get()?.accessToken
  if (token) config.headers.Authorization = \`Bearer \${token}\`
  return config
})

api.interceptors.response.use(ok, async (error) => {
  if (error.response?.status === 401) {
    authStorage.clear()
    if (window.location.pathname !== "/login") window.location.href = "/login"
  }
  return Promise.reject(error.response?.data?.message || error.message)
})`,
        },
        {
          type: 'pre',
          caption: 'Gin — the kitchen (leave_req.route.go)',
          lines: `adminRoute.Use(middleware.RequireResourcePermission("leaveRequest"))
adminRoute.GET("", h.GetLeaveReqList)                 // GET → action read
adminRoute.PUT("/approve/:id", h.UpdateLeaveReqStatus) // PUT → action update

clientRoute.Use(middleware.AuthN(enum.Employee))
clientRoute.GET("/my", h.GetMyLeaveReqList)            // identity only, employee JWT`,
        },
        {
          type: 'callout',
          lines: [
            'Frontend · **24 · Middleware** is the airport metaphor. Backend · Middleware is Gin `c.Next()`. Here they sit on one product.',
            '`GET /admin/roles/current-permission` is **AuthN only** (mounted before `Use(RequireResourcePermission("role"))`). The SPA needs that so a payroll clerk can load their own permission copy without having `role.read`.',
          ],
        },
      ],
    },
    {
      id: 'front-to-back',
      label: '3 · Front → back',
      title: 'Login, then open Leave — what the wires look like',
      lead: 'This is the story you tell in an interview. Names are from the real files.',
      blocks: [
        {
          type: 'ol',
          items: [
            '**UI.** `/login` is public (`login/router` has no `requiresPermission`). Sokha types username + password.',
            '**POST** `/api/v1/admin/auth/login` — **no** AuthN on this route (`auth.route.go`). Body `{ username, password }`.',
            '**Service.** Lookup `sys_users`, `CompareHash`, `GenerateJWTToken` with `JWT_SECRET`, `exp` = AccessTokenExp hours (default **365h**).',
            '**Response looks like:** `{ statusCode, message, data: { accessToken: "eyJ…", username: "sokha" } }`.',
            '**SPA.** `authService.login` + `authStore.login` write Pinia **and** `localStorage.auth_session`. Then `fetchPermissions()` → **GET** `/api/v1/admin/roles/current-permission` **with** Bearer (interceptor already has the token).',
            '**Navigate** `/leave`. `leave/router` meta: `{ resource: "leaveRequest", action: "read" }`. `beforeEach` checks the Pinia copy. Fail → `/`. Pass → page mounts.',
            '**Page fetch.** GET `/api/v1/admin/leave-request`. Header: `Authorization: Bearer eyJ…`.',
            '**Gin.** `RequireResourcePermission("leaveRequest")` re-parses JWT with **admin** secret, maps GET→`read`, Redis key `user_permission:{id}:leaveRequest:read` or SQL joins. 200 list or 403.',
          ],
        },
        {
          type: 'route',
          method: 'POST',
          path: '/api/v1/admin/auth/login',
          gate: 'public',
          purpose: 'Mint admin JWT. This is the only moment the password is seen.',
        },
        {
          type: 'route',
          method: 'GET',
          path: '/api/v1/admin/roles/current-permission',
          gate: 'AuthN(Admin) only — before role resource middleware',
          purpose: 'Fill the SPA permission copy so beforeEach and v-permission have something to read.',
        },
        {
          type: 'route',
          method: 'GET',
          path: '/api/v1/admin/leave-request',
          gate: 'RequireResourcePermission("leaveRequest") → read',
          purpose: 'The list the Leave page shows. Kitchen lock.',
        },
        {
          type: 'h3',
          text: 'What DevTools looks like (be able to point)',
        },
        {
          type: 'ul',
          items: [
            '**Application → Local Storage** → `auth_session` JSON with `accessToken`.',
            '**Network → login** → 200, no `Set-Cookie`.',
            '**Network → leave-request** → Request Headers `Authorization: Bearer eyJ…`.',
            '**Network → current-permission** → 200 array of `{ resource, permissions: [{ action }] }`.',
            'Wrong password → login 4xx/500 per Status studio; storage stays empty; you stay on `/login`.',
          ],
        },
      ],
    },
    {
      id: 'back-to-front',
      label: '4 · Back → front',
      title: '401, 403, and why the SPA panics differently',
      lead: 'The server speaks first with a status. The SPA decides whether to kill the “session” or just hide a page.',
      blocks: [
        {
          type: 'table',
          columns: ['Status', 'Who decided', 'What the SPA does', 'What you should say'],
          rows: [
            [
              '**401**',
              'JWT missing, wrong secret, expired, bad shape (`ValildateToken`)',
              'Axios interceptor **clears localStorage** and hard-redirects `/login`. Pinia dies with the storage.',
              'Identity failed. We do not try to render a protected page with a dead badge.',
            ],
            [
              '**403**',
              '`RequireResourcePermission` — badge is real, clipboard says no',
              'Interceptor does **not** logout. The request rejects; UI shows an error. You are still Sokha.',
              'Authorization failed. Logging them out would be lying about who they are.',
            ],
            [
              'Vue bounce to `/`',
              '`beforeEach` + missing `meta` permission in the **Pinia copy**',
              'No HTTP leave-request call if they never mounted the page.',
              'This is not 403. The kitchen was never asked. A curl with a valid JWT might still 200 if the API group is AuthN-only.',
            ],
            [
              'Hidden button',
              '`v-permission="{ resource, action }"` → `display: none`',
              'Nothing. The PUT is still legal if they craft it.',
              'UI chrome. Same sentence as Frontend · 17: the UI is not authorization.',
            ],
          ],
        },
        {
          type: 'callout',
          lines: [
            '**Mismatch to remember:** some admin groups (employee CRUD, departments, …) are **AuthN(Admin) only** on Gin. The SPA may still `requiresPermission` on the Vue route. Then: intern is bounced by Vue, but a stolen admin JWT from a payroll clerk might still hit those APIs. That is the real-code interview gold — not a perfect textbook RBAC.',
          ],
        },
      ],
    },
    {
      id: 'layers',
      label: '5 · Layers',
      title: 'Four UX locks, one real lock',
      lead: 'HRMS stacks the same permission string in four places. Only Gin is the lock.',
      blocks: [
        {
          type: 'ol',
          items: [
            '**Menu** (`menuData.ts` `requiredPermission`) — intern does not see Leave in the sidebar.',
            '**Router meta** (`leave/router` `requiresPermission`) — intern typing `/leave` still bounces home.',
            '**Directive** (`v-permission`) — Approve hidden without `leaveRequest.update`.',
            '**Gin** (`RequireResourcePermission("leaveRequest")`) — PUT without `update` → 403 even if they un-hide the button.',
          ],
        },
        {
          type: 'kid',
          items: [
            'Hide the hallway sign. Lock the door. Take the handle off. Guard with a clipboard.',
            'A thief with curl only meets the clipboard (Gin).',
          ],
        },
        {
          type: 'p',
          text: 'Client mobile (`AuthN(Employee)` on `/client/leave-request/*`) never uses `RequireResourcePermission`. Identity is enough for “my leave.” Admin leave is the RBAC specimen.',
        },
      ],
    },
    {
      id: 'interview',
      label: '6 · Interview',
      title: 'Questions they will ask — answers from this repo',
      lead: 'Speak in this product’s nouns. “In our HRMS admin…” is stronger than a generic blog answer.',
      blocks: [
        {
          type: 'h3',
          text: 'How do you protect routes?',
        },
        {
          type: 'p',
          text: 'Two layers. **SPA:** `beforeEach` restores JWT from localStorage, blocks anonymous users except `/login`, then checks `to.meta.requiresPermission` against a permission list fetched after login. **API:** Gin `AuthN` or `RequireResourcePermission` on the router group. I never claim the Vue guard is security. Demo: intern URL `/leave` vs `curl` with a valid JWT.',
        },
        {
          type: 'h3',
          text: 'JWT vs session vs cookies vs localStorage vs sessionStorage?',
        },
        {
          type: 'p',
          text: 'JWT is the **token format**. A **server session** is a row the server remembers (we have Redis helpers, unused at login). A **cookie** is a **transport** the browser attaches. **localStorage / sessionStorage** are **JS lockers**. Ours: JWT in localStorage, sent as Bearer. Not a cookie (so no automatic CSRF via cookie; XSS can still steal the token). Not sessionStorage (refresh/new tab would log you out).',
        },
        {
          type: 'h3',
          text: '401 vs 403?',
        },
        {
          type: 'p',
          text: '401 = we do not accept this as Sokha (no/invalid JWT) → interceptor logs the SPA out. 403 = we know it is Sokha, she may not `leaveRequest.update` → stay logged in, fail the action. Vue bounce to `/` is neither status; it is a client redirect.',
        },
        {
          type: 'h3',
          text: 'Where do you put permissions — JWT or server?',
        },
        {
          type: 'p',
          text: 'Not in the JWT. Claims are `id` + `exp`. AuthZ walks `sys_users → roles → permissions` and caches bools in Redis 15 minutes. The SPA keeps a **copy** from `GET current-permission` for menus and guards. Revoke a role: Redis TTL or delete key; JWT still valid until exp — that is the stateless trade (year-long access tokens in config make this painful; I would mention shortening `ACCESS_TOKEN_EXP`).',
        },
        {
          type: 'h3',
          text: 'What is middleware?',
        },
        {
          type: 'p',
          text: 'A function that runs before the handler/page. It must call next (or return a redirect / abort). Ours: Vue `beforeEach`, Axios interceptors, Gin `Use`. Same airport stamp. Different passengers (URL vs HTTP).',
        },
        {
          type: 'h3',
          text: 'Can I hide the button instead of checking the API?',
        },
        {
          type: 'p',
          text: 'No. `v-permission` is display. I would PUT from DevTools and expect 403. If a route is AuthN-only on the server, I would say that is a gap we still have on some admin CRUDs.',
        },
        {
          type: 'callout',
          lines: [
            '**Practice out loud** with the playground: Sokha /leave 200, Dara bounce, curl 401, Approve without update 403, close tab with localStorage still logged in.',
            'Then open AuthN (token anatomy) and AuthZ (SQL + Redis) studios. Guards is the **wiring**. Those two are the **locks**.',
          ],
        },
      ],
    },
  ],
};
