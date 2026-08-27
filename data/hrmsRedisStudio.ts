import type { HrmsStudioMeta } from './hrmsStudioShared';

/**
 * Redis Studio — permission cache keys, TTL, sessions unused by login.
 */
export const hrmsRedisStudio: HrmsStudioMeta = {
  id: 'redis',
  brand: 'Redis Studio',
  title: 'Redis — permission cache & session helpers',
  subtitle:
    'In hrms_api, Redis’s hot path is AuthZ acceleration: cache bools for user×resource×action. Session helpers exist but login AuthN is JWT-stateless. Read every key pattern in services/redis_service.go.',
  mapPath: '/insights/notes/hrms',
  noteSlug: 'hrms',
  chapters: [
    {
      id: 'role',
      label: '0 · Role',
      title: 'Where Redis sits in the request',
      lead: 'Redis is already wired into hrms_api. It is used as a read-through cache for permission checks, plus a mini session store that is currently not used for login. The main flow is in `middleware/permission.go`: first check cache, then fall back to SQL, then write back to cache with a 15-minute TTL.',
      files: [
        'config/redis/redis.go',
        'services/redis_service.go',
        'middleware/permission.go → hasResourcePermissionFromDB',
        'repositories/role.repo.go',
        'repositories/sys_user.repo.go',
      ],
      blocks: [
        {
          type: 'h3',
          text: 'How Redis is booted',
        },
        {
          type: 'pre',
          caption: 'config/redis/redis.go — init() runs on package import',
          lines: `var Rdb *redis.Client

func init() {
  defer func() {
    if r := recover(); r != nil {
      Rdb = nil // any panic → continue without Redis
    }
  }()
  Rdb = redis.NewClient(&redis.Options{
    Addr:     config.AppConfig.RedisAddr + ":" + config.AppConfig.RedisPort,
    Password: config.AppConfig.RedisPassword,
    DB:       config.AppConfig.RedisDB,
  })
  _, err := Rdb.Ping(context.Background()).Result()
  if err != nil {
    fmt.Printf("Warning: Could not connect to Redis: %v. Continuing without Redis caching.\n", err)
    Rdb = nil
    return
  }
  fmt.Println("redis connected")
}`,
        },
        {
          type: 'ul',
          items: [
            'Address from env: `REDIS_ADDR` (default `localhost`), `REDIS_PORT` (default `6379`), `REDIS_PASSWORD`, `REDIS_DB` (default `0`).',
            'If Redis fails to ping, the app intentionally sets `Rdb = nil` and keeps running. No cache, no crash.',
          ],
        },
        {
          type: 'h3',
          text: 'The hot path: permission middleware read-through cache',
        },
        {
          type: 'pre',
          caption: 'Flow inside middleware/permission.go',
          lines: `func RequireResourcePermission(resource string) gin.HandlerFunc {
  return func(c *gin.Context) {
    // 1. Validate JWT first, extract userID
    err := utils.ValildateToken(tokenHeader, &claims, jwtSecret)
    ...
    c.Set("UserId", userID)

    // 2. Map HTTP method to action
    requiredAction := mapHTTPMethodToAction(c.Request.Method) // GET→read, POST→create, etc.

    // 3. hasResourcePermissionFromDB(userID, resource, requiredAction)
    //    - Try Redis key user_permission:{userID}:{resource}:{action}
    //    - On cache miss: run SQL COUNT join sys_users→roles→permissions
    //    - On result: write back to Redis with 15*time.Minute TTL
    // 4. If false → 403; if true → c.Next()
  }
}`,
        },
        {
          type: 'ol',
          items: [
            'Build key: `user_permission:{userID}:{resource}:{action}`.',
            'GET hit → parse bool; cache miss error string `"cache miss"`.',
            'If `Rdb == nil`, skip cache and always hit SQL.',
            'After SQL `COUNT(*)`, `SetUserPermission(..., 15*time.Minute)` stores the result.',
            'This is a **read-through cache** — every request populates the cache on first miss.',
          ],
        },
        {
          type: 'callout',
          lines: [
            '**AuthN does not touch Redis.** A stolen JWT works until `exp` even if you delete every Redis key. To revoke early you would need a denylist or short-lived tokens + refresh — neither is wired on the login path today.',
          ],
        },
        {
          type: 'kid',
          items: [
            'Redis is a sticky note on the fridge: “User 7 may update leaveRequest = yes.”',
            'After 15 minutes the note falls off and someone checks the big permission binder (SQL) again.',
          ],
        },
      ],
    },
    {
      id: 'keys',
      label: '1 · Key map',
      title: 'Every key pattern in RedisService',
      lead: 'Memorize the prefixes. Invalidation bugs are almost always “forgot which pattern to delete.”',
      blocks: [
        {
          type: 'table',
          columns: ['Key pattern', 'Value', 'API', 'TTL'],
          rows: [
            [
              '`user_permission:{userID}:{resource}:{action}`',
              'bool string (`true`/`false`)',
              'Get/SetUserPermission',
              '15m from permission middleware',
            ],
            [
              '`role_permissions:{roleID}`',
              'JSON []uint permission IDs',
              'Get/SetRolePermissions',
              'caller-chosen expiration',
            ],
            [
              '`user_roles:{userID}`',
              'JSON []uint role IDs',
              'Get/SetUserRoles',
              'caller-chosen expiration',
            ],
            [
              'arbitrary `sessionKey`',
              'JSON of sessionData',
              'SetSession / GetSession',
              'caller-chosen',
            ],
          ],
        },
        {
          type: 'h3',
          text: 'Invalidation helpers',
        },
        {
          type: 'ul',
          items: [
            '`InvalidateUserPermissions(userID)` → `KEYS user_permission:{id}:*` then DEL.',
            '`InvalidateAllUserPermissions` → `user_permission:*`.',
            '`InvalidateRolePermissions` / `InvalidateAllRolePermissions`.',
            '`InvalidateUserRoles(userID)`.',
            '`DeleteSession` / `ExtendSession` for session keys.',
          ],
        },
        {
          type: 'callout',
          lines: [
            '`KEYS` is used for pattern deletes. Fine for small deployments; in large Redis, `KEYS` blocks — production hardening often switches to SCAN. Know what the code actually does.',
          ],
        },
      ],
    },
    {
      id: 'sessions',
      label: '2 · Sessions',
      title: 'Session API vs JWT login — do not confuse them',
      lead: 'RedisService exposes a complete mini session store. Auth login services never call it. Treat this as unused capability unless another feature wires it.',
      blocks: [
        {
          type: 'compare',
          columns: ['', 'JWT access (actual login)', 'Redis session helpers'],
          rows: [
            ['Issued at login?', 'Yes — accessToken string', 'No — not in auth.service'],
            ['Validated by AuthN?', 'Yes — ValildateToken', 'No'],
            ['Revoke instantly?', 'Need extra design', 'DeleteSession(key)'],
            ['Payload', 'UserClaim id + exp', 'Any JSON you marshal'],
          ],
        },
        {
          type: 'pre',
          caption: 'If you *did* store a session (illustrative)',
          lines: `SetSession("session:empl:42:deviceA", map[string]any{
  "userId": 42,
  "kind": "employee",
}, 24*time.Hour)

GetSession("session:empl:42:deviceA", &out)
ExtendSession("session:empl:42:deviceA", 24*time.Hour)
DeleteSession("session:empl:42:deviceA")`,
        },
      ],
    },
    {
      id: 'cache-coherence',
      label: '3 · Coherence',
      title: 'Cache invalidation — when role changes',
      lead: 'The cache is not forever. Update-role and update-role-permissions handlers manually clear Redis keys so the next request re-reads the database.',
      blocks: [
        {
          type: 'pre',
          caption: 'repositories/sys_user.repo.go — UpdateUserRole invalidates',
          lines: `if redisConnect.Rdb != nil {
  ctx := context.Background()
  userPermPattern := fmt.Sprintf("user_permission:%d:*", user.ID)
  userPermKeys, err := redisConnect.Rdb.Keys(ctx, userPermPattern).Result()
  if err == nil && len(userPermKeys) > 0 {
    if cacheErr := redisConnect.Rdb.Del(ctx, userPermKeys...).Err(); cacheErr != nil {
      fmt.Printf("Warning: Failed to invalidate user permissions cache for user %d: %v\n", user.ID, cacheErr)
    }
  }
  userRoleKey := fmt.Sprintf("user_roles:%d", user.ID)
  if cacheErr := redisConnect.Rdb.Del(ctx, userRoleKey).Err(); cacheErr != nil {
    fmt.Printf("Warning: Failed to invalidate user roles cache for user %d: %v\n", user.ID, cacheErr)
  }
}`,
        },
        {
          type: 'pre',
          caption: 'repositories/role.repo.go — UpdateRolePermissions invalidates',
          lines: `if redisConnect.Rdb != nil {
  ctx := context.Background()

  userPermPattern := "user_permission:*"
  userPermKeys, err := redisConnect.Rdb.Keys(ctx, userPermPattern).Result()
  if err == nil && len(userPermKeys) > 0 {
    if cacheErr := redisConnect.Rdb.Del(ctx, userPermKeys...).Err(); cacheErr != nil {
      fmt.Printf("Warning: Failed to invalidate user permissions cache: %v\n", cacheErr)
    }
  }

  rolePermKey := fmt.Sprintf("role_permissions:%d", roleID)
  if cacheErr := redisConnect.Rdb.Del(ctx, rolePermKey).Err(); cacheErr != nil {
    fmt.Printf("Warning: Failed to invalidate role permissions cache: %v\n", cacheErr)
  }
}`,
        },
        {
          type: 'ul',
          items: [
            'Changing a user’s role → clears `user_permission:{user.ID}:*` and `user_roles:{user.ID}`.',
            'Changing a role’s permissions → clears **all** `user_permission:*` plus `role_permissions:{roleID}`.',
            'Grant a permission in DB without invalidation → user may still be denied until the cached false expires (15m).',
            'Revoke a permission without invalidation → user may still be allowed until the cached true expires.',
          ],
        },
        {
          type: 'h3',
          text: 'Performance tests in repo',
        },
        {
          type: 'ul',
          items: [
            '`performance_tests/scripts/test_with_redis.sh` / `test_without_redis.sh`',
            '`performance_tests/redis_demo.sh`',
            '`test/test_redis.sh`',
          ],
        },
      ],
    },
    {
      id: 'nil-client',
      label: '4 · Nil client',
      title: 'Degraded mode when Redis is down',
      blocks: [
        {
          type: 'ul',
          items: [
            '`NewRedisService` stores `redisConnect.Rdb` which may be nil.',
            'Get/SetUserPermission return errors if client nil; middleware checks `Rdb != nil` before calling.',
            'App continues authorizing via SQL — slower, still correct for that request.',
            'No circuit breaker beyond “skip cache”.',
          ],
        },
      ],
    },
  ],
};
