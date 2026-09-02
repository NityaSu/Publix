<script setup lang="ts">
import { Bell, Database, Smartphone, Wifi, WifiOff } from 'lucide-vue-next';
import { computed, ref } from 'vue';

type Drawer = 'session' | 'local' | 'cookie';

interface Notice {
  id: string;
  title: string;
  body: string;
  updatedAt: string;
}

const drawer = ref<Drawer>('session');
const connected = ref(false);
const tabOpen = ref(true);
const page = ref<'home' | 'settings'>('home');
const notices = ref<Notice[]>([]);
const seenKeys = ref<string[]>([]);
const log = ref('Click Connect to start.');

const NOTICE_ID = 'n_maintenance';

function keyOf(n: Notice) {
  return `${n.id}_${n.updatedAt}`;
}

const unseen = computed(() =>
  notices.value.filter((n) => !seenKeys.value.includes(keyOf(n))),
);

const showPopup = computed(() => {
  if (!connected.value || !tabOpen.value) return false;
  return unseen.value.length > 0;
});

function currentNotice() {
  return notices.value[0];
}

function push(msg: string) {
  log.value = msg;
}

function connect() {
  tabOpen.value = true;
  connected.value = true;
  push('WebSocket connected. Auth token passed on handshake.');
}

function disconnect() {
  connected.value = false;
  push('Disconnected.');
}

function publish() {
  if (!connected.value) return;
  notices.value = [{
    id: NOTICE_ID,
    title: 'Maintenance tonight',
    body: 'The shop will pause at 23:00. Finish checkout before then.',
    updatedAt: '2026-09-01T10:00:00Z',
  }];
  push('Admin published → server.emit("notice:list") → every tab.');
}

function edit() {
  if (!connected.value || notices.value.length === 0) return;
  notices.value = [{
    ...notices.value[0]!,
    title: 'Maintenance moved to Sunday',
    body: 'Same pause, new night. The updatedAt changed, so the key is new.',
    updatedAt: '2026-09-01T11:00:00Z',
  }];
  push('Admin edited → new updatedAt → new key → popup again.');
}

function gotIt() {
  seenKeys.value = [...new Set([...seenKeys.value, ...unseen.value.map(keyOf)])];
  push('Seen key written to sessionStorage.');
}

function goPage() {
  page.value = page.value === 'home' ? 'settings' : 'home';
  push(`Navigated to ${page.value}. Same tab, same keys, no popup.`);
}

function closeTab() {
  tabOpen.value = false;
  connected.value = false;
  if (drawer.value === 'session') {
    seenKeys.value = [];
    push('Tab closed. sessionStorage wiped.');
  } else if (drawer.value === 'local') {
    push('Tab closed. localStorage still remembers.');
  } else {
    push('Tab closed. Cookie would still ride requests.');
  }
}

function newTab() {
  tabOpen.value = true;
  page.value = 'home';
  if (drawer.value === 'session') {
    seenKeys.value = [];
    push('New tab. sessionStorage empty → popup can show again.');
  } else {
    push('New tab. Drawer still has keys → popup stays quiet until an edit.');
  }
  connect();
}

function setDrawer(next: Drawer) {
  drawer.value = next;
  seenKeys.value = [];
  notices.value = [];
  connected.value = false;
  tabOpen.value = true;
  page.value = 'home';
  const name = next === 'session' ? 'sessionStorage' : next === 'local' ? 'localStorage' : 'Cookie';
  push(`Switched to ${name}. Real app uses sessionStorage for this feature.`);
}

function storageJson() {
  if (drawer.value === 'session' && !tabOpen.value) return '{}';
  if (seenKeys.value.length === 0) return '{}';
  return JSON.stringify({ notice_seen_keys: seenKeys.value }, null, 2);
}

function reset() {
  drawer.value = 'session';
  connected.value = false;
  tabOpen.value = true;
  page.value = 'home';
  notices.value = [];
  seenKeys.value = [];
  log.value = 'Reset. Click Connect.';
}
</script>

<template>
  <div class="ln">
    <div class="ln-drawers">
      <button type="button" class="ln-chip" :class="{ 'is-on': drawer === 'session' }" @click="setDrawer('session')">
        sessionStorage
      </button>
      <button type="button" class="ln-chip" :class="{ 'is-on': drawer === 'local' }" @click="setDrawer('local')">
        localStorage
      </button>
      <button type="button" class="ln-chip" :class="{ 'is-on': drawer === 'cookie' }" @click="setDrawer('cookie')">
        Cookie
      </button>
    </div>
    <p class="ln-hint">Real feature uses <strong>sessionStorage</strong>. The other two show what would change.</p>

    <div class="ln-stage">
      <article class="ln-card">
        <p class="ln-title">
          <Database :size="14" />
          Admin
        </p>
        <p class="ln-muted">Writes DB, then broadcasts.</p>
        <button type="button" class="ln-btn" :disabled="!connected" @click="publish">Publish notice</button>
        <button type="button" class="ln-btn ln-ghost" :disabled="!connected || !notices.length" @click="edit">Edit notice</button>
      </article>

      <article class="ln-card ln-pipe" :class="{ 'is-live': connected }">
        <p class="ln-title">
          <Wifi v-if="connected" :size="14" />
          <WifiOff v-else :size="14" />
          Socket · /event
        </p>
        <p class="ln-status" :class="{ 'is-on': connected }">
          {{ connected ? 'Connected' : 'Disconnected' }}
        </p>
        <button type="button" class="ln-btn" :disabled="connected" @click="connect">Connect</button>
        <button type="button" class="ln-btn ln-ghost" :disabled="!connected" @click="disconnect">Disconnect</button>
      </article>

      <article class="ln-card">
        <p class="ln-title">
          <Smartphone :size="14" />
          Tab · {{ page }}
        </p>
        <div class="ln-phone">
          <p class="ln-chrome">{{ page === 'home' ? 'Home' : 'Settings' }}</p>
          <div v-if="showPopup" class="ln-popup">
            <p class="ln-popup-kicker">
              <Bell :size="12" />
              Notice
            </p>
            <p class="ln-popup-title">{{ currentNotice()?.title }}</p>
            <p class="ln-popup-body">{{ currentNotice()?.body }}</p>
            <button type="button" class="ln-btn ln-sm" @click="gotIt">Got it</button>
          </div>
          <p v-else class="ln-muted">No unseen popup.</p>
        </div>
        <button type="button" class="ln-btn ln-ghost" :disabled="!tabOpen" @click="goPage">Navigate</button>
        <button type="button" class="ln-btn ln-ghost" :disabled="!tabOpen" @click="closeTab">Close tab</button>
        <button type="button" class="ln-btn ln-ghost" :disabled="tabOpen" @click="newTab">New tab</button>
      </article>
    </div>

    <div class="ln-store">
      <p class="ln-title">Drawer · {{ drawer }}</p>
      <pre>{{ storageJson() }}</pre>
    </div>

    <p class="ln-log">{{ log }}</p>
    <button type="button" class="ln-reset" @click="reset">Reset</button>
  </div>
</template>

<style scoped>
.ln {
  margin: 8px 0 24px;
  padding: 16px;
  border: 1px solid #c8c8c8;
  border-radius: 10px;
  background: #fafafa;
}
.ln-drawers {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 8px;
}
.ln-chip {
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid #c8c8c8;
  background: #fff;
  font-size: 12px;
  font-weight: 600;
  color: #787774;
}
.ln-chip.is-on {
  background: #7b2d8e;
  border-color: #7b2d8e;
  color: #fff;
}
.ln-hint {
  margin: 0 0 14px;
  text-align: center;
  font-size: 12px;
  color: #787774;
}
.ln-stage {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}
@media (max-width: 720px) {
  .ln-stage {
    grid-template-columns: 1fr;
  }
}
.ln-card {
  background: #fff;
  border: 1px solid #c8c8c8;
  border-radius: 8px;
  padding: 12px;
  min-height: 180px;
}
.ln-pipe.is-live {
  box-shadow: 0 0 0 2px #d7c4e0;
}
.ln-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 700;
}
.ln-muted {
  margin: 0 0 10px;
  font-size: 12px;
  color: #787774;
}
.ln-status {
  font-size: 12px;
  font-weight: 600;
  color: #787774;
  margin-bottom: 8px;
}
.ln-status.is-on {
  color: #2b8a3e;
}
.ln-btn {
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
.ln-btn:disabled {
  opacity: 0.4;
}
.ln-ghost {
  background: #fff;
  color: #37352f;
  border-color: #c8c8c8;
}
.ln-sm {
  width: auto;
  margin-top: 6px;
  padding: 0 12px;
}
.ln-phone {
  min-height: 120px;
  padding: 10px;
  border: 1px solid #c8c8c8;
  border-radius: 8px;
  background: #f4f4f4;
  margin-bottom: 8px;
}
.ln-chrome {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 700;
  color: #787774;
}
.ln-popup {
  padding: 10px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #c8c8c8;
}
.ln-popup-kicker {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 0 4px;
  font-size: 11px;
  color: #787774;
}
.ln-popup-title {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 700;
}
.ln-popup-body {
  margin: 0;
  font-size: 12px;
}
.ln-store {
  margin-top: 10px;
  padding: 12px;
  border: 1px solid #c8c8c8;
  border-radius: 8px;
  background: #fff;
}
.ln-store pre {
  margin: 0;
  padding: 8px 10px;
  border-radius: 6px;
  background: #f4f4f4;
  font-size: 11px;
  font-family: 'DM Mono', ui-monospace, monospace;
  white-space: pre-wrap;
}
.ln-log {
  margin: 12px 0 0;
  font-size: 13px;
  text-align: center;
  color: #37352f;
}
.ln-reset {
  display: block;
  margin: 8px auto 0;
  border: 0;
  background: transparent;
  color: #787774;
  font-size: 12px;
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
