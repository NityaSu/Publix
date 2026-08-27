import type { HrmsStudioMeta } from './hrmsStudioShared';

/**
 * Status Studio — http_pkg, ResponseDTO, Resp helpers, middleware status quirks.
 */
export const hrmsStatusStudio: HrmsStudioMeta = {
  id: 'status',
  brand: 'Status Studio',
  title: 'Status codes & the response envelope',
  subtitle:
    'Every JSON reply is shaped by dto.ResponseDTO. Helpers in common/utils/resp.go pick codes. Middleware sometimes bypasses helpers and writes JSON directly — those veins matter.',
  mapPath: '/insights/notes/hrms',
  noteSlug: 'hrms',
  chapters: [
    {
      id: 'envelope',
      label: '0 · Envelope',
      title: 'ResponseDTO — the contract clients parse',
      lead: 'Whether success or failure, handlers usually speak through the same struct. Learn the fields once.',
      files: ['dto/response.dto.go', 'common/utils/resp.go'],
      blocks: [
        {
          type: 'pre',
          caption: 'Shape (conceptual from ResponseDTO usage)',
          lines: `{
  "data":       <T | null>,
  "message":    "success" | error string | "Unauthorized" | …,
  "statusCode": 200 | 400 | 401 | …,
  "metadata":   { … } | null
}`,
        },
        {
          type: 'ul',
          items: [
            '`Resp[T](c, statusCode, message, data, meta)` — logs data asynchronously, then `c.JSON(statusCode, ResponseDTO{…})`.',
            '**Important:** Gin’s HTTP status and `statusCode` **field** are usually the same integer — but always read both when debugging proxies that strip bodies.',
            '`RespOK` → 200 + message `"success"` + pointer to data.',
            '`RespBadReq` → 400 + `"bad request"` + nil data.',
            '`RespErr` → `getCodeFromErr(err)` + `err.Error()` as message.',
            '`RespConfirmationErr` → **422** with confirmation payload (user must act).',
          ],
        },
        {
          type: 'kid',
          items: [
            'The envelope is the stamped form every reply uses.',
            '`message` is the human line; `statusCode` is the machine number; `data` is the cargo.',
          ],
        },
      ],
    },
    {
      id: 'http-pkg',
      label: '1 · http_pkg',
      title: 'Constants in pkg/http_pkg/status_code.go',
      lead: 'A small mirror of net/http statuses used by middleware and docs. Not every RFC code is listed — only what this project imported.',
      files: ['pkg/http_pkg/status_code.go'],
      blocks: [
        {
          type: 'table',
          columns: ['Constant', 'Value', 'Typical meaning here'],
          rows: [
            ['StatusOK', '200', 'RespOK success'],
            ['StatusCreated', '201', 'Available; prefer checking handlers for actual use'],
            ['StatusAccepted', '202', 'Listed'],
            ['StatusNoContent', '204', 'Listed'],
            ['StatusBadRequest', '400', 'RespBadReq / validation'],
            ['StatusUnauthorized', '401', 'Bad/missing JWT'],
            ['StatusForbidden', '403', 'Permission denied'],
            ['StatusNotFound', '404', 'gorm.ErrRecordNotFound via RespErr'],
            ['StatusMethodNotAllowed', '405', 'Listed'],
            ['StatusInternalServerError', '500', 'Default RespErr'],
          ],
        },
        {
          type: 'callout',
          lines: [
            'Codes **used in resp.go but not in http_pkg file:** **422** (confirmation), **428** (`ErrPasswordChangeRequired`). Middleware Forbidden sometimes uses `http.StatusForbidden` from net/http instead of http_pkg.',
          ],
        },
      ],
    },
    {
      id: 'getCodeFromErr',
      label: '2 · Err → code',
      title: 'getCodeFromErr — how RespErr chooses',
      lead: 'Most domain errors become **500** with the raw error string as message. Only a few sentinel errors remap.',
      blocks: [
        {
          type: 'table',
          columns: ['Error', 'HTTP / statusCode', 'When you see it'],
          rows: [
            ['gorm.ErrRecordNotFound', '404', 'Repo First/Take misses'],
            ['ErrPasswordChangeRequired', '428', 'Password change required gate'],
            ['anything else', '500', 'Including login "wrong password" / "user not found" today'],
          ],
        },
        {
          type: 'callout',
          lines: [
            '**Vein to notice:** login failures use `errors.New("wrong password")` → RespErr → **500**, not 401. Auth **middleware** failures are 401. So “bad password at login” and “bad token on a later call” do **not** share a status code in this codebase.',
          ],
        },
        {
          type: 'pre',
          caption: 'Auth middleware direct JSON (bypasses RespErr)',
          lines: `// AuthN failure
c.JSON(http.StatusUnauthorized, dto.ResponseDTO{
  Message: "Unauthorized",
  StatusCode: http_pkg.StatusUnauthorized, // 401
})

// RequireResourcePermission failure (permission)
c.JSON(http_pkg.StatusForbidden, dto.ResponseDTO{
  Message: "You don't have permission to access this resource",
  StatusCode: http_pkg.StatusForbidden, // 403
})`,
        },
      ],
    },
    {
      id: 'matrix',
      label: '3 · Matrix',
      title: 'When each code appears in auth & gates',
      blocks: [
        {
          type: 'table',
          columns: ['Situation', 'Likely status', 'message (typical)', 'Path'],
          rows: [
            ['Login success', '200', 'success', 'RespOK'],
            ['Login wrong password / user', '500', 'wrong password / user not found', 'RespErr default'],
            ['set-pwd bad bind', '400', 'bad request', 'RespBadReq'],
            ['Missing/invalid Bearer', '401', 'Unauthorized', 'AuthN / Require*'],
            ['JWT ok, no permission row', '403', 'You don\'t have permission…', 'RequireResourcePermission'],
            ['Legacy AuthZ fail', '403', 'Forbidden', 'middleware.AuthZ in auth.go'],
            ['Confirmation required', '422', 'custom', 'RespConfirmationErr'],
            ['Must change password', '428', 'password change required', 'ErrPasswordChangeRequired'],
            ['Record missing in handler', '404', 'record not found…', 'RespErr + gorm'],
          ],
        },
        {
          type: 'kid',
          items: [
            '401 = “I don’t know who you are.”',
            '403 = “I know who you are; you still can’t open this door.”',
            '500 on bad login password = the app treated it like a generic error string, not like “unauthorized.”',
          ],
        },
      ],
    },
    {
      id: 'quirks',
      label: '4 · Quirks',
      title: 'Inconsistencies worth memorizing',
      blocks: [
        {
          type: 'ul',
          items: [
            'AuthN uses `http.StatusUnauthorized` for Gin status; permission middleware often passes `http_pkg.StatusUnauthorized` as the first `c.JSON` argument — same number 401, different import path.',
            'Legacy AuthZ sets `StatusCode: http.StatusForbidden` (net/http) inside the DTO.',
            'Success always `"success"` lowercase from RespOK — clients should not switch on fancy success messages.',
            'Data pointer: RespOK always takes `data T` and stores `&data` — nil interface quirks if you pass typed nils.',
          ],
        },
      ],
    },
  ],
};
