import type { HrmsStudioMeta } from './hrmsStudioShared';

/**
 * AuthZ Studio — real hrms_api permission gates + full route inventory.
 */
export const hrmsAuthzStudio: HrmsStudioMeta = {
  id: 'authz',
  brand: 'AuthZ Studio',
  title: 'Authorization — every gate on every route',
  subtitle:
    'AuthN proves identity. AuthZ asks: may this sys_user touch this resource with this HTTP action? Extracted from middleware/permission.go, the legacy AuthZ in auth.go, permission enums, and every routers/*.go Use() line.',
  mapPath: '/insights/notes/hrms',
  noteSlug: 'hrms',
  chapters: [
    {
      id: 'split',
      label: '0 · Split',
      title: 'AuthN vs AuthZ in one sentence each',
      lead: 'If AuthN fails you get 401 Unauthorized. If AuthZ fails you get 403 Forbidden (when the middleware is the resource checker). Mixing them up is the #1 mental bug.',
      blocks: [
        {
          type: 'compare',
          columns: ['', 'AuthN', 'AuthZ (resource middleware)'],
          rows: [
            ['Question', 'Who is this?', 'May they do this?'],
            ['Input', 'Bearer JWT + door secret', 'UserId + resource string + action from HTTP method'],
            ['Success', '`c.Set("UserId", id)`', '`c.Next()` (also sets userId)'],
            ['Fail body', 'Unauthorized / 401', 'You don\'t have permission… / 403'],
            ['Primary code', 'middleware.AuthN', 'RequireResourcePermission / RequireAny / RequireAll / RequireSuperAdmin'],
          ],
        },
        {
          type: 'callout',
          lines: [
            '**Legacy:** `middleware.AuthZ(perm enum.Permission)` in `auth.go` uses dotted names like `leaveRequest.read` and a **broken join** (`sys_user_roles sur ON sur.id = sys_users.id`). Live routers do **not** `Use(AuthZ(...))` — they use `RequireResourcePermission("leaveRequest")` with separate `resource` + `action` columns.',
          ],
        },
      ],
    },
    {
      id: 'rbac',
      label: '1 · RBAC shape',
      title: 'Tables the permission SQL walks',
      lead: 'Permissions are not in the JWT. Every check walks sys_users → roles → permissions (with soft-delete filters).',
      files: [
        'middleware/permission.go → hasResourcePermissionFromDB',
        'models: sys_users, sys_user_roles, roles, role_permissions, permissions',
        'common/enum/permission.enum.go',
      ],
      blocks: [
        {
          type: 'pre',
          caption: 'Exact Raw SQL inside hasResourcePermissionFromDB',
          lines: `SELECT COUNT(*)
FROM sys_users su
JOIN sys_user_roles sur ON su.id = sur.sys_user_id
JOIN roles r ON sur.role_id = r.id AND r.deleted_at IS NULL
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id AND p.deleted_at IS NULL
WHERE su.id = ? AND p.resource = ? AND p.action = ? AND su.deleted_at IS NULL`,
        },
        {
          type: 'ul',
          items: [
            '`count > 0` → allowed; cached in Redis as `user_permission:{userID}:{resource}:{action}` for **15 minutes**.',
            'Enum constants still use dotted form (`leaveRequest.read`) for older AuthZ / seeds — resource middleware wants **split** `resource="leaveRequest"`, `action="read"`.',
            'Super admin check: `hasResourcePermissionFromDB(userID, "admin", "manage")`.',
          ],
        },
        {
          type: 'h3',
          text: 'HTTP method → action',
        },
        {
          type: 'table',
          columns: ['HTTP method', 'Permission action'],
          rows: [
            ['GET', 'read'],
            ['POST', 'create'],
            ['PUT / PATCH', 'update'],
            ['DELETE', 'delete'],
            ['(other)', 'read (default)'],
          ],
        },
        {
          type: 'kid',
          items: [
            'Your badge (JWT) gets you into the lobby (AuthN).',
            'The clipboard at each door lists room name + verb (resource + action).',
            'If your role’s list doesn’t include that line, the guard says “no” (403) even though the badge is real.',
          ],
        },
      ],
    },
    {
      id: 'middleware-family',
      label: '2 · Middleware family',
      title: 'RequireResourcePermission and friends',
      lead: 'Unlike AuthN, these functions **re-parse the JWT** with `JwtSecret` every time. They do not require a prior AuthN in the chain — but many routes stack both.',
      files: ['middleware/permission.go'],
      blocks: [
        {
          type: 'ul',
          items: [
            '`RequireResourcePermission(resource)` — one resource; action from method.',
            '`RequireAnyPermission(resource, actions)` — OR across actions.',
            '`RequireAllPermissions(resource, actions)` — AND across actions.',
            '`RequireSuperAdmin()` — needs permission `admin` + `manage`.',
            'On JWT fail: JSON with `http_pkg.StatusUnauthorized` as **both** Gin status argument and StatusCode field (see Status studio — this differs slightly from AuthN’s `http.StatusUnauthorized` constant usage).',
            'Sets both `UserId` and `userId` on context when allowed.',
          ],
        },
        {
          type: 'callout',
          lines: [
            '**Stacking AuthN + RequireResourcePermission:** JWT is validated twice (once Employee/Admin secret via AuthN, once always JwtSecret via permission). For admin tokens that is redundant but consistent. Never put RequireResourcePermission on a **client** employee route — it will only accept admin-signed JWTs.',
          ],
        },
      ],
    },
    {
      id: 'routes-authn-only',
      label: '3 · AuthN-only admin',
      title: 'Admin groups that only check identity',
      lead: 'These Use AuthN(Admin) (or Employee on client) but **not** RequireResourcePermission. Any valid admin JWT can hit them — RBAC rows are not consulted by middleware.',
      blocks: [
        {
          type: 'route',
          method: '*',
          path: '/api/v1/admin/employee/*',
          gate: 'AuthN(Admin)',
          purpose: 'List/export/create/update/delete employees, reset-pwd, generate-staff-id.',
        },
        {
          type: 'route',
          method: '*',
          path: '/api/v1/admin/sys-user/*',
          gate: 'AuthN(Admin)',
          purpose: 'Sys user CRUD + role/permission patches — identity only at middleware.',
        },
        {
          type: 'route',
          method: '*',
          path: '/api/v1/admin/department|team|office|logger|dashboard|payroll|payslips|notifications|calendar/*',
          gate: 'AuthN(Admin)',
          purpose: 'Org / pay / ops surfaces gated by “is admin JWT”, not resource string.',
        },
        {
          type: 'route',
          method: '*',
          path: '/api/v1/admin/ot-request/*',
          gate: 'AuthN(Admin)',
          purpose: 'OT admin list/create/status/delete — AuthN only (contrast leave-request which uses resource middleware).',
        },
        {
          type: 'route',
          method: '*',
          path: '/api/v1/admin/leave-type/*',
          gate: 'AuthN(Admin)',
          purpose: 'Leave type CRUD — AuthN only.',
        },
        {
          type: 'callout',
          lines: [
            '**Attendance admin oddity:** `adminRoute.GET("/monthly"…)` under `/admin/attendance` has **no** `Use(AuthN)` in `attendance.route.go`. Client attendance is protected; admin monthly list is currently open at the router layer. Trace that file when hardening.',
          ],
        },
      ],
    },
    {
      id: 'routes-resource',
      label: '4 · Resource gates',
      title: 'RequireResourcePermission inventory',
      lead: 'These are the veins where Redis + SQL permission checks actually run.',
      blocks: [
        {
          type: 'route',
          method: 'GET/POST/PUT/DELETE',
          path: '/api/v1/admin/leave-request/*',
          gate: 'RequireResourcePermission("leaveRequest")',
          purpose: 'Admin leave list/create/approve/delete. PUT approve → action update.',
          notes: [
            'Does not also Use AuthN — JWT validated inside permission middleware with JwtSecret.',
          ],
        },
        {
          type: 'route',
          method: 'GET/POST/PUT/DELETE',
          path: '/api/v1/admin/postclock-request/*',
          gate: 'RequireResourcePermission("postClockRequest")',
          purpose: 'Admin post-clock request management.',
        },
        {
          type: 'route',
          method: 'GET…',
          path: '/api/v1/admin/permissions',
          gate: 'RequireResourcePermission("role")',
          purpose: 'List permissions / groups — permission to manage roles implies reading permission catalog.',
        },
        {
          type: 'route',
          method: 'mixed',
          path: '/api/v1/admin/roles/*',
          gate: 'AuthN(Admin) then (after one route) RequireResourcePermission("role")',
          purpose: 'GET /current-permission is AuthN-only; subsequent role CRUD needs role resource.',
          notes: [
            'Order matters: `GetCurrentRolePermissions` registered **before** `Use(RequireResourcePermission("role"))`.',
          ],
        },
        {
          type: 'route',
          method: 'POST/GET',
          path: '/api/v1/admin|hr/borrowing-repayment/*',
          gate: 'AuthN(Admin) + RequireResourcePermission("leaveRequest")',
          purpose: 'Leave borrowing repayment processing & reports (mounted on /api/v1 directly).',
        },
      ],
    },
    {
      id: 'client',
      label: '5 · Client side',
      title: 'Employee routes — identity, almost never RBAC middleware',
      lead: 'Mobile client groups typically `Use(AuthN(Employee))`. Fine-grained “can this employee approve X?” is usually business logic inside services, not RequireResourcePermission.',
      blocks: [
        {
          type: 'table',
          columns: ['Prefix', 'Gate', 'Examples'],
          rows: [
            ['/client/auth/login', 'public', 'Issue ClientJwtSecret JWT'],
            ['/client/auth/set-pwd', 'AuthN(Employee)', 'Change password'],
            ['/client/employee/profile', 'AuthN(Employee)', 'Self profile'],
            ['/client/attendance/*', 'AuthN(Employee)', 'history, clock, status'],
            ['/client/leave-request/*', 'AuthN(Employee)', 'my, create, update, cancel'],
            ['/client/ot-request/*', 'AuthN(Employee)', 'list, create, update, cancel'],
            ['/client/postclock-request/*', 'AuthN(Employee)', 'create, my, update, cancel'],
            ['/client/leave-type', 'AuthN(Employee)', 'list'],
            ['/client/calendar/history', 'AuthN(Employee)', 'calendar history'],
            ['/client/sample/*', 'none', 'Sample routes unprotected'],
          ],
        },
      ],
    },
    {
      id: 'public',
      label: '6 · Public / docs',
      title: 'What never asks for a badge',
      blocks: [
        {
          type: 'ul',
          items: [
            'Both login POSTs.',
            'Swagger `/docs/*` when Environment != Production.',
            'CORS middleware on the engine (not auth).',
            'Sample admin/client data routes — no AuthN in sample.route.go.',
          ],
        },
      ],
    },
  ],
};
