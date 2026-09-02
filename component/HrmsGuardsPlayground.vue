<script setup lang="ts">
import { computed, ref } from 'vue';

type Role = 'none' | 'hr' | 'intern';
type Drawer = 'local' | 'session' | 'cookie';
type Page = '/login' | '/' | '/leave';

const role = ref<Role>('none');
const drawer = ref<Drawer>('local');
const page = ref<Page>('/login');
const tokenAlive = ref(false);
const tabOpen = ref(true);
const lastHttp = ref('—');
const log = ref('Idle. Log in, then try /leave.');
const hiddenApprove = ref(true);

const perms = computed(() => {
  if (role.value === 'hr') return ['leaveRequest.read', 'leaveRequest.update'];
  if (role.value === 'intern') return [];
  return [];
});

const storageJson = computed(() => {
  if (!tokenAlive.value || (drawer.value === 'session' && !tabOpen.value)) {
    return '{ }';
  }
  if (role.value === 'none') return '{ }';
  return JSON.stringify(
    { auth_session: { username: role.value === 'hr' ? 'sokha' : 'dara', accessToken: 'eyJ…id=17' } },
    null,
    2,
  );
});

function flash(msg: string, http: string) {
  log.value = msg;
  lastHttp.value = http;
}

function login(next: Role) {
  role.value = next;
  tokenAlive.value = true;
  tabOpen.value = true;
  page.value = '/';
  hiddenApprove.value = next !== 'hr';
  flash(
    `POST /api/v1/admin/auth/login → 200 { accessToken }. Saved under localStorage key auth_session (this app names it “session”).`,
    '200',
  );
}

function logout() {
  role.value = 'none';
  tokenAlive.value = false;
  page.value = '/login';
  hiddenApprove.value = true;
  flash('authStorage.clear() — localStorage.removeItem("auth_session"). Router sends you to /login.', '—');
}

function go(target: Page) {
  if (!tabOpen.value) {
    flash('Tab is closed.', '—');
    return;
  }

  if (target === '/login') {
    if (tokenAlive.value) {
      flash('beforeEach: already authenticated → bounce off /login (stay where you were).', '—');
      return;
    }
    page.value = '/login';
    flash('Public route. No token needed.', '—');
    return;
  }

  if (!tokenAlive.value) {
    page.value = '/login';
    flash('beforeEach: !isAuthenticated && path !== /login → return "/login". Vue never mounts /leave.', '—');
    return;
  }

  if (target === '/leave') {
    const canRead = perms.value.includes('leaveRequest.read');
    if (!canRead) {
      page.value = '/';
      flash(
        'beforeEach: to.meta.requiresPermission = leaveRequest.read. Pinia copy has no match → return "/". This is UX. curl still talks to Gin.',
        '—',
      );
      return;
    }
    page.value = '/leave';
    flash(
      'Guard passed. Axios interceptor stamps Authorization: Bearer <jwt>. Gin AuthN(Admin) verifies HS256. GET /leave-request has RequireResourcePermission("leaveRequest") → action read.',
      '200',
    );
    return;
  }

  page.value = '/';
  flash('Home. Dashboard often only needs a valid JWT on the API (AuthN), plus menu hide on the SPA.', '200');
}

function approve() {
  if (page.value !== '/leave' || !tokenAlive.value) {
    flash('Open /leave first as someone who can read leave.', '—');
    return;
  }
  if (!perms.value.includes('leaveRequest.update')) {
    flash(
      'v-permission hid the button. If you still PUT /api/v1/admin/leave-request/approve/9 from DevTools: Gin maps PUT→update, SQL/Redis miss → 403. The hidden button was never the lock.',
      '403',
    );
    return;
  }
  flash('PUT …/approve/9 + Bearer. RequireResourcePermission leaveRequest + update → 200.', '200');
}

function curlNoToken() {
  flash(
    'curl -X GET /api/v1/admin/leave-request  (no Authorization). AuthN/permission JWT parse fails → 401 Unauthorized. SPA never saw this request.',
    '401',
  );
}

function expireToken() {
  if (!tokenAlive.value) {
    flash('No token to expire.', '—');
    return;
  }
  tokenAlive.value = false;
  flash(
    'Axios response interceptor: 401 → authStorage.clear(); location = /login. Same as a forged/expired JWT hitting Gin.',
    '401',
  );
  page.value = '/login';
}

function closeTab() {
  tabOpen.value = false;
  page.value = '/login';
  if (drawer.value === 'session') {
    tokenAlive.value = false;
    role.value = 'none';
    flash('sessionStorage would wipe on tab close. This app does NOT use it for auth.', '—');
  } else if (drawer.value === 'cookie') {
    flash('HttpOnly cookie would still be there next visit — and would ride every HTTP call. HRMS does not set an auth cookie.', '—');
  } else {
    flash('Tab closed. localStorage auth_session still on disk. New tab → initFromSession() restores Pinia.', '—');
  }
}

function reopen() {
  tabOpen.value = true;
  if (drawer.value === 'local' && role.value !== 'none') {
    tokenAlive.value = true;
    page.value = '/';
    flash('initFromSession() reads localStorage, sets isAuthenticated, fetchPermissions().', '200');
    return;
  }
  if (drawer.value === 'cookie' && role.value !== 'none') {
    tokenAlive.value = true;
    page.value = '/';
    flash('A cookie drawer would restore without JS reading the token. HRMS cannot do this — JWT lives in JS-readable storage.', '200');
    return;
  }
  page.value = '/login';
  flash('Empty drawer. Login again.', '—');
}

function setDrawer(next: Drawer) {
  drawer.value = next;
  logout();
  flash(
    next === 'local'
      ? 'Real HRMS: auth_session in localStorage.'
      : next === 'session'
        ? 'What-if: sessionStorage — close tab and you are logged out.'
        : 'What-if: HttpOnly cookie — JS cannot steal it; CSRF becomes the leftover problem. Not this codebase.',
    '—',
  );
}
</script>

<template>
  <div class="hg">
    <div class="hg-drawers">
      <button type="button" class="hg-chip" :class="{ 'is-on': drawer === 'local' }" @click="setDrawer('local')">
        localStorage (real)
      </button>
      <button type="button" class="hg-chip" :class="{ 'is-on': drawer === 'session' }" @click="setDrawer('session')">
        sessionStorage
      </button>
      <button type="button" class="hg-chip" :class="{ 'is-on': drawer === 'cookie' }" @click="setDrawer('cookie')">
        Cookie
      </button>
    </div>

    <div class="hg-stage">
      <article class="hg-col">
        <p class="hg-title">SPA tab · {{ page }}</p>
        <button type="button" class="hg-btn" @click="login('hr')">Login as Sokha (HR)</button>
        <button type="button" class="hg-btn hg-ghost" @click="login('intern')">Login as Dara (no leave)</button>
        <button type="button" class="hg-btn hg-ghost" :disabled="!tabOpen" @click="go('/leave')">Open /leave</button>
        <button type="button" class="hg-btn hg-ghost" :disabled="page !== '/leave'" @click="approve">
          {{ hiddenApprove ? 'Approve (button hidden)' : 'Approve leave' }}
        </button>
        <p class="hg-muted">v-permission hides Approve unless leaveRequest.update. Hide ≠ 403.</p>
      </article>

      <article class="hg-col">
        <p class="hg-title">Hallways</p>
        <ol class="hg-steps">
          <li>Vue <code>beforeEach</code> — login? meta.requiresPermission?</li>
          <li>Axios request — stamp <code>Authorization: Bearer</code></li>
          <li>Gin AuthN — JWT + admin secret → UserId</li>
          <li>Gin AuthZ — resource × HTTP verb (PUT→update)</li>
        </ol>
        <p class="hg-http" :class="{ 'is-bad': lastHttp === '401' || lastHttp === '403', 'is-ok': lastHttp === '200' }">
          Last HTTP {{ lastHttp }}
        </p>
        <p class="hg-log">{{ log }}</p>
      </article>

      <article class="hg-col">
        <p class="hg-title">Attack / ops</p>
        <button type="button" class="hg-btn hg-ghost" @click="curlNoToken">curl with no Bearer</button>
        <button type="button" class="hg-btn hg-ghost" @click="expireToken">Forge / expire token</button>
        <button type="button" class="hg-btn hg-ghost" :disabled="!tabOpen" @click="closeTab">Close tab</button>
        <button type="button" class="hg-btn hg-ghost" :disabled="tabOpen" @click="reopen">New tab</button>
        <button type="button" class="hg-btn hg-ghost" @click="logout">Logout</button>
      </article>
    </div>

    <div class="hg-store">
      <p class="hg-title">Application · {{ drawer }} · key auth_session</p>
      <pre>{{ storageJson }}</pre>
      <p class="hg-muted">
        Perms in Pinia (copy from GET /admin/roles/current-permission):
        {{ perms.length ? perms.join(', ') : 'none' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.hg {
  margin: 0 0 22px;
  padding: 14px;
  border: 1px solid var(--st-line, #eaeaea);
  border-radius: 10px;
  background: var(--st-graph, #fafafa);
}
.hg-drawers {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.hg-chip {
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid #c8c8c8;
  background: #fff;
  font-size: 11px;
  font-weight: 600;
}
.hg-chip.is-on {
  background: #7b2d8e;
  border-color: #7b2d8e;
  color: #fff;
}
.hg-stage {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr;
  gap: 10px;
}
@media (max-width: 800px) {
  .hg-stage {
    grid-template-columns: 1fr;
  }
}
.hg-col,
.hg-store {
  background: #fff;
  border: 1px solid #c8c8c8;
  border-radius: 8px;
  padding: 12px;
}
.hg-store {
  margin-top: 10px;
}
.hg-title {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 700;
}
.hg-btn {
  display: block;
  width: 100%;
  margin-bottom: 6px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid #7b2d8e;
  background: #7b2d8e;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}
.hg-ghost {
  background: #fff;
  color: #37352f;
  border-color: #c8c8c8;
}
.hg-btn:disabled {
  opacity: 0.4;
}
.hg-muted {
  margin: 8px 0 0;
  font-size: 11px;
  color: #787774;
}
.hg-steps {
  margin: 0 0 10px;
  padding-left: 18px;
  font-size: 12px;
  line-height: 1.55;
}
.hg-http {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  font-family: 'DM Mono', ui-monospace, monospace;
}
.hg-http.is-ok {
  color: #2b8a3e;
}
.hg-http.is-bad {
  color: #c0392b;
}
.hg-log {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
}
.hg-store pre {
  margin: 0;
  padding: 8px 10px;
  border-radius: 6px;
  background: #f4f4f4;
  font-size: 11px;
  font-family: 'DM Mono', ui-monospace, monospace;
  white-space: pre-wrap;
}
</style>
