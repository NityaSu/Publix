import type { HrmsStudioMeta } from './hrmsStudioShared';

/**
 * AuthN Studio — extracted from real hrms_api.
 * Sources: middleware/auth.go, common/utils/jwt.go, dto/auth.dto.go,
 * handlers/auth.handler.go, services/auth.service.go, routers/auth.route.go,
 * config/config.go, main.go swagger defs, services/redis_service.go (sessions).
 */
export const hrmsAuthnStudio: HrmsStudioMeta = {
  id: 'authn',
  brand: 'AuthN Studio',
  title: 'Authentication — every vein',
  subtitle:
    'Session vs JWT vs API key in theory; then exactly what hrms_api does: two login doors, two secrets, HS256 claims, Bearer header, and what Redis session helpers are for (spoiler: not login).',
  mapPath: '/insights/notes/hrms',
  noteSlug: 'hrms',
  chapters: [
    {
      id: 'map',
      label: '0 · Map',
      title: 'What AuthN means here',
      lead: 'Authentication answers: “Is this request carrying a real identity?” Authorization answers later: “May that identity do this?” In hrms_api, AuthN is almost always JWT Bearer validation that sets `UserId` on the Gin context.',
      files: [
        'middleware/auth.go → AuthN',
        'common/utils/jwt.go → GenerateJWTToken / ValildateToken',
        'routers/auth.route.go',
        'config → JwtSecret / ClientJwtSecret / AccessTokenExp',
      ],
      blocks: [
        {
          type: 'kid',
          items: [
            'Login = get a badge printed with your id.',
            'Every later request = show the badge in the Authorization header.',
            'The door checks the badge ink (signature) and the expiry date — not your password again.',
          ],
        },
        {
          type: 'callout',
          lines: [
            '**Hard rule in this codebase:** login issues an **access JWT**. There is **no server-side login session** written to Redis on success. Redis `SetSession` / `GetSession` exist as helpers, but AuthN middleware never reads them. The **admin SPA** stores that JWT in **localStorage** (`auth_session`) and stamps `Authorization: Bearer` in Axios — see **Guards Studio**.',
            'Swagger names the security schemes `AdminBearerAuth` / `ClientBearerAuth` with `@securityDefinitions.apikey` — that is Swagger’s label for “API key in a header.” The **runtime** auth is still `Authorization: Bearer <jwt>`, not a separate API-key table.',
          ],
        },
        {
          type: 'ul',
          items: [
            'Two product doors: **client** (mobile employees) and **admin** (sys_users).',
            'Two HMAC secrets: `CLIENT_JWT_SECRET` vs `JWT_SECRET`.',
            'One claim that matters for identity: custom `id` (uint) plus registered `exp` / `jti`.',
            'Typo in the wild: function is named `ValildateToken` (three L’s) — same function AuthN and permission middleware call.',
          ],
        },
      ],
    },
    {
      id: 'three-models',
      label: '1 · Three models',
      title: 'Session · JWT · API key — then pick what hrms_api uses',
      lead: 'Before reading Go files, lock the three industry patterns. Then map each to this repo so you never confuse “we have Redis session helpers” with “login uses sessions.”',
      blocks: [
        {
          type: 'compare',
          title: 'Identity tokens — industry vs this repo',
          columns: ['Model', 'What it looks like', 'Server remembers?', 'In hrms_api?'],
          rows: [
            [
              '**Server session**',
              'Cookie `sid=abc…` or header with opaque id. Server stores `{userId, …}` in Redis/DB keyed by sid.',
              'Yes — revoke = delete key',
              'Helpers only: `RedisService.SetSession` / `GetSession` / `DeleteSession` / `ExtendSession`. **Login does not call them.** AuthN does not read them.',
            ],
            [
              '**JWT (bearer)**',
              '`Authorization: Bearer eyJhbGciOi…` — three Base64url segments: header.payload.signature',
              'No (stateless). Revoke needs denylist or short exp',
              '**Primary path.** Login → `GenerateJWTToken`. Protected routes → `ValildateToken` + `c.Set("UserId", claims.ID)`.',
            ],
            [
              '**API key**',
              'Long random secret in header (`X-Api-Key`) or query; server looks up key → principal + scopes',
              'Yes — row in DB',
              '**Not implemented** for product auth. Swagger’s `apikey` security *definition type* is just how OpenAPI describes “token in Authorization header.”',
            ],
          ],
        },
        {
          type: 'h3',
          text: 'What a session *would* look like (if login used Redis)',
        },
        {
          type: 'pre',
          caption: 'Conceptual — not what LoginEmployee / LoginSysUser write today',
          lines: `SET session:a1b2c3d4 '{"userId":42,"kind":"employee"}' EX 86400
# Cookie: Set-Cookie: sid=a1b2c3d4; HttpOnly; Secure; SameSite=Lax
# Later: GET session:a1b2c3d4 → unmarshal → trust userId`,
        },
        {
          type: 'h3',
          text: 'What the JWT *does* look like (this project)',
        },
        {
          type: 'pre',
          caption: 'Structure after GenerateJWTToken (HS256)',
          lines: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.   ← header  {"alg":"HS256","typ":"JWT"}
eyJpZCI6NDIsImV4cCI6…,"jti":"42"}.      ← payload UserClaim{ ID, RegisteredClaims }
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c  ← HMAC-SHA256(secret, header.payload)`,
        },
        {
          type: 'h3',
          text: 'What an API key *would* look like (not in auth path)',
        },
        {
          type: 'pre',
          caption: 'Typical pattern — absent from hrms_api auth middleware',
          lines: `X-Api-Key: hrms_live_sk_8f3a…   or   Authorization: ApiKey hrms_live_sk_8f3a…
# Server: SELECT * FROM api_keys WHERE hash = sha256(key) → scopes`,
        },
        {
          type: 'callout',
          lines: [
            '**Remember:** `TokenRes` in `dto/auth.dto.go` has both `accessToken` and `refreshToken`, and config has `REFRESH_TOKEN_EXP` (default **5**, units not applied in login). Login response DTOs only return **`accessToken`**. Refresh flow types exist; a refresh *handler* is not wired in `auth.route.go`.',
          ],
        },
      ],
    },
    {
      id: 'two-doors',
      label: '2 · Two doors',
      title: 'Client employee login vs admin sys_user login',
      lead: 'Router mounts everything under `/api/v1`. Auth lives on two parallel trees: `/client/auth/*` and `/admin/auth/*`. Same JWT machinery, different identity table and different HMAC secret.',
      files: [
        'routers/router.go → /api/v1/admin · /api/v1/client',
        'routers/auth.route.go',
        'services/auth.service.go',
        'dto/auth.dto.go',
      ],
      blocks: [
        {
          type: 'route',
          method: 'POST',
          path: '/api/v1/client/auth/login',
          gate: 'public (no AuthN)',
          purpose: 'Employee mobile login: staffID + password → ClientJwtSecret JWT + employee profile blob.',
          notes: [
            'Body: EmployeeLogin { staffID, password } — validated with go-playground validator.',
            'Lookup: employeeRepo.GetEmployeeByStaffID.',
            'Password: utils.CompareHash(plain, employee.PasswordHash).',
            'Fail strings: "user not found" | "wrong password" | "could not generate token" → RespErr (see Status studio for code mapping).',
            'Success: LoginResEmployeeDTO { accessToken, …EmployeeResponseDTO including offices lat/lng/radius }.',
          ],
        },
        {
          type: 'route',
          method: 'POST',
          path: '/api/v1/admin/auth/login',
          gate: 'public (no AuthN)',
          purpose: 'Admin panel login: username + password → JwtSecret JWT + username.',
          notes: [
            'Body: SysUserLogin { username, password }.',
            'Lookup: sysUserRepo.GetSysUserByUserName.',
            'Same CompareHash + GenerateJWTToken pattern.',
            'Success: LoginResSysUserDTO { accessToken, username } — note typo field UsenName in Go → json "username".',
          ],
        },
        {
          type: 'route',
          method: 'PUT',
          path: '/api/v1/client/auth/set-pwd',
          gate: 'AuthN(enum.Employee)',
          purpose: 'Authenticated employee changes own password; UserId comes from JWT claims.',
          notes: [
            'Handler: employeeID := c.GetUint("UserId") — set only if AuthN succeeded.',
            'Rules: new password length ≥ 6; old password must CompareHash; sets IsDefaultPassword = false.',
            'Bind/validate failure → RespBadReq (400), not RespErr.',
          ],
        },
        {
          type: 'route',
          method: 'PUT',
          path: '/api/v1/admin/auth/set-pwd',
          gate: 'AuthN(enum.Admin)',
          purpose: 'Authenticated sys_user changes own password; activity log on success/failure.',
          notes: [
            'Uses JwtSecret door (Admin enum → default secret in AuthN switch).',
            'logger.CreateActivityLog on fail and success.',
          ],
        },
        {
          type: 'table',
          columns: ['Door', 'Identity table', 'Login fields', 'JWT secret config', 'AuthN enum'],
          rows: [
            ['Client', 'employees', 'staffID + password', 'CLIENT_JWT_SECRET (`ClientJwtSecret`)', 'enum.Employee'],
            ['Admin', 'sys_users', 'username + password', 'JWT_SECRET (`JwtSecret`)', 'enum.Admin (default branch)'],
          ],
        },
        {
          type: 'callout',
          lines: [
            '**Cross-door attack surface:** a client JWT signed with `ClientJwtSecret` must **not** validate against `JwtSecret`. AuthN picks the secret from `authType`. If you ever mount `AuthN(Employee)` on an admin route (or the reverse), tokens from the wrong door fail signature check → 401.',
            '**Opposite bug:** `RequireResourcePermission` always uses `config.AppConfig.JwtSecret` (admin). It is admin-only by design.',
          ],
        },
      ],
    },
    {
      id: 'jwt-anatomy',
      label: '3 · JWT anatomy',
      title: 'Claims, signing, expiry — line by line',
      lead: 'Everything identity-related collapses into `dto.UserClaim` and two functions in `common/utils/jwt.go`.',
      files: [
        'dto/auth.dto.go → JwtPayload, UserClaim, TokenRes',
        'common/utils/jwt.go',
        'config/config.go → AccessTokenExp default 365 (hours)',
      ],
      blocks: [
        {
          type: 'pre',
          caption: 'dto.UserClaim — what is inside the payload',
          lines: `type UserClaim struct {
  jwt.RegisteredClaims   // includes ExpiresAt, ID (jti), etc.
  ID uint \`json:"id"\`     // YOUR user primary key
}

type JwtPayload struct {
  ID  uint
  Exp time.Duration      // how long until ExpiresAt
}`,
        },
        {
          type: 'ol',
          items: [
            '`GenerateJWTToken`: build `UserClaim{ ID: input.ID, RegisteredClaims{ ID: fmt.Sprintf("%d", input.ID), ExpiresAt: now.UTC()+input.Exp } }`.',
            'Create token with `jwt.NewWithClaims(jwt.SigningMethodHS256, claim)`.',
            '`SignedString([]byte(secret))` — HMAC with the door’s secret.',
            'Login sets `Exp: time.Duration(config.AppConfig.AccessTokenExp) * time.Hour` — **default AccessTokenExp = 365 → ~1 year access tokens**.',
          ],
        },
        {
          type: 'h3',
          text: 'Validation (`ValildateToken`) — every failure mode',
        },
        {
          type: 'ol',
          items: [
            'Split `Authorization` on space → must be length 2.',
            'First part lowercased must equal `"bearer"` (so `Bearer` / `bearer` / `BEARER` all OK).',
            '`jwt.ParseWithClaims` with HMAC check: method must be `*jwt.SigningMethodHMAC` or error “invalid signing method”.',
            'Wrong secret → parse error → AuthN returns Unauthorized.',
            'Expired `exp` → library error → Unauthorized.',
            '`token.Valid` must be true or “invalid token”.',
            'On success AuthN does **only** `c.Set("UserId", claims.ID)` then `c.Next()`. No role load here.',
          ],
        },
        {
          type: 'pre',
          caption: 'Header the client must send',
          lines: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.…

# Rejected shapes (ValildateToken → invalid token):
Authorization: eyJ…              # missing Bearer
Authorization: Token eyJ…        # wrong scheme
Authorization: Bearer            # no second part
(no header)                      # split length ≠ 2`,
        },
        {
          type: 'table',
          columns: ['Claim / field', 'Source', 'Used later for'],
          rows: [
            ['`id` (custom)', 'employee.ID or sysUser.ID at login', '`c.GetUint("UserId")` in handlers (set-pwd, profile, …)'],
            ['`exp`', 'now + AccessTokenExp hours', 'Reject stale tokens'],
            ['`jti` (`RegisteredClaims.ID`)', 'fmt.Sprintf("%d", userId)', 'Present in token; AuthN does not specially use it beyond parse'],
            ['roles / permissions in JWT?', '—', '**Not embedded.** AuthZ loads from DB (+ Redis cache)'],
          ],
        },
        {
          type: 'kid',
          items: [
            'The badge does not list every room you can enter.',
            'It only says “this is person #42” and “badge expires on date X”.',
            'The building’s permission office (AuthZ + Redis) decides rooms.',
          ],
        },
      ],
    },
    {
      id: 'middleware',
      label: '4 · AuthN middleware',
      title: 'middleware.AuthN(authType) — the gate function',
      lead: 'Factory that closes over `enum.AuthType` and returns a Gin handler. Used per-route or on a whole router group.',
      files: ['middleware/auth.go → AuthN', 'common/enum/auth.enum.go'],
      blocks: [
        {
          type: 'pre',
          caption: 'Essence of AuthN (from auth.go)',
          lines: `func AuthN(authType enum.AuthType) gin.HandlerFunc {
  return func(c *gin.Context) {
    tokenHeader := c.GetHeader("Authorization")
    var claims dto.UserClaim
    var jwtSecret string
    switch authType {
    case enum.Employee:
      jwtSecret = config.AppConfig.ClientJwtSecret
    default: // Admin and anything else
      jwtSecret = config.AppConfig.JwtSecret
    }
    err := utils.ValildateToken(tokenHeader, &claims, jwtSecret)
    if err != nil {
      c.JSON(http.StatusUnauthorized, dto.ResponseDTO{
        Message: "Unauthorized", StatusCode: http_pkg.StatusUnauthorized,
      })
      c.Abort()
      return
    }
    c.Set("UserId", claims.ID)
    c.Next()
  }
}`,
        },
        {
          type: 'ul',
          items: [
            'HTTP status for fail: `http.StatusUnauthorized` (**401**) with body `StatusCode: http_pkg.StatusUnauthorized` (also 401).',
            '`c.Abort()` stops the chain — handler never runs.',
            '`enum.Employee = "employee"`, `enum.Admin = "admin"`.',
            'Legacy `AuthZ(perm enum.Permission)` still sits in the **same file** with a buggy join (`sys_user_roles sur ON sur.id = sys_users.id`). Production routes prefer `RequireResourcePermission` in `permission.go` — see AuthZ Studio.',
          ],
        },
        {
          type: 'h3',
          text: 'Where AuthN is applied (pattern)',
        },
        {
          type: 'ul',
          items: [
            '**Group Use:** e.g. `clientRoute.Use(middleware.AuthN(enum.Employee))` then all routes under that group inherit it (attendance, leave client, …).',
            '**Per-route:** auth set-pwd attaches AuthN only on PUT, leaving POST login public.',
            '**AuthN + RequireResourcePermission:** leave admin, post-clock admin, roles (after one open route), permissions — permission middleware **re-validates JWT itself** with admin secret (does not assume prior AuthN).',
          ],
        },
      ],
    },
    {
      id: 'password',
      label: '5 · Passwords',
      title: 'Hashing, compare, default password flag',
      lead: 'Login never stores the raw password. It compares against `PasswordHash` and only then mints a JWT.',
      blocks: [
        {
          type: 'ul',
          items: [
            '`utils.CompareHash(plain, hash)` — failure → `"wrong password"` / `"incorrect old password"`.',
            '`utils.HashPassword` on set-pwd / create flows.',
            'Employee set-pwd clears `IsDefaultPassword` so the client can stop forcing a password change UX.',
            '`ErrPasswordChangeRequired` exists in `resp.go` as HTTP **428** — a separate contract from AuthN; worth knowing when reading Status Studio.',
          ],
        },
        {
          type: 'callout',
          lines: [
            'Login error messages are **generic-ish** but distinct: `"user not found"` vs `"wrong password"`. That enables username enumeration. Many production APIs collapse both to one message; this codebase does not.',
          ],
        },
      ],
    },
    {
      id: 'config-swagger',
      label: '6 · Config & Swagger',
      title: 'Secrets, expiry knobs, OpenAPI security names',
      lead: 'Config defaults are dangerous for production (long-lived tokens, testing secrets). Swagger documents Bearer as “apikey” type — naming trap.',
      files: ['config/config.go', 'main.go swagger comments', 'config.yml.example'],
      blocks: [
        {
          type: 'table',
          columns: ['Config key', 'Go field', 'Default in struct tag', 'Used by'],
          rows: [
            ['JWT_SECRET', 'JwtSecret', '`"testing"`', 'Admin login + AuthN(Admin) + RequireResourcePermission'],
            ['CLIENT_JWT_SECRET', 'ClientJwtSecret', '`"client_testing"`', 'Employee login + AuthN(Employee)'],
            ['ACCESS_TOKEN_EXP', 'AccessTokenExp', '`365` (hours)', 'Both login JWT Exp'],
            ['REFRESH_TOKEN_EXP', 'RefreshTokenExp', '`5`', 'Defined; **not applied** in Login*Services'],
          ],
        },
        {
          type: 'pre',
          caption: 'main.go — Swagger security (names ≠ API-key auth)',
          lines: `// @securityDefinitions.apikey AdminBearerAuth
// @in header
// @name Authorization
// @description Admin Bearer Token Authentication

// @securityDefinitions.apikey ClientBearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.`,
        },
        {
          type: 'kid',
          items: [
            'Swagger saying “apikey” is like the form label saying “key”.',
            'The thing you paste is still a Bearer JWT from login.',
            'There is no second product called “API keys” in the auth routes.',
          ],
        },
      ],
    },
    {
      id: 'veins',
      label: '7 · Trace',
      title: 'One request through every vein',
      lead: 'Follow a clock-in after login — AuthN only. Then contrast with an admin leave approve that also hits AuthZ + Redis.',
      blocks: [
        {
          type: 'ol',
          items: [
            'Mobile: `POST /client/auth/login` with staffID/password → 200 + `accessToken` (ClientJwtSecret, id=employee.ID).',
            'Mobile: `POST /client/attendance/clock` with `Authorization: Bearer <token>`.',
            'Group middleware `AuthN(Employee)` → validate with ClientJwtSecret → `UserId` set.',
            'Handler reads `UserId`, writes attendance — **no permission row check** on client attendance.',
            'Admin: login with JwtSecret → `PUT /admin/leave-request/approve/:id`.',
            '`RequireResourcePermission("leaveRequest")` validates **admin** JWT, maps PUT→`update`, checks Redis then SQL join for resource/action, may 403.',
          ],
        },
        {
          type: 'callout',
          lines: [
            '**Mental model:** Client routes often stop at AuthN (identity). Sensitive admin resources add AuthZ (permission). Some admin routes only use AuthN (e.g. many department/employee CRUD groups) — identity without resource middleware. That inconsistency is part of learning the real codebase, not an accident to paper over.',
          ],
        },
      ],
    },
  ],
};
