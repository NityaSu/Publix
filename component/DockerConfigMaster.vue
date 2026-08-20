<script setup lang="ts">
const LEVELS = [
  { n: 1, label: 'Redis' },
  { n: 2, label: 'PG+Redis' },
  { n: 3, label: 'Health' },
  { n: 4, label: 'Multi-stage' },
  { n: 5, label: 'Prod' },
] as const;

interface OrderItem {
  id: string;
  code: string;
  desc: string;
  check: string;
}

const level = ref(1);
const score = ref(0);
const streak = ref(0);
const feedback = ref<{ kind: 'success' | 'error' | 'hint'; text: string } | null>(null);
const showVictory = ref(false);
const completed = ref<Set<number>>(new Set());

const l1 = reactive({
  fixed: [false, false, false] as boolean[],
  image: 'redis',
  ports: '"6379"',
  command: 'redis-server --maxmemory 100mb',
  showCopy: false,
});

const l2 = reactive({
  db: '???',
  user: '???',
  pass: '???',
  net: '???',
  net2: '???',
  fieldOk: {} as Record<string, boolean | null>,
  showCopy: false,
  connected: false,
});

const l3 = reactive({
  revealed: [false, false, false] as boolean[],
  showCopy: false,
  healthy: false,
});

const l4Items = ref<OrderItem[]>([
  { id: 'runtime', code: 'FROM python:3.11-slim AS runtime', desc: 'Final small image', check: 'FROM python:3.11-slim' },
  { id: 'copyfrom', code: 'COPY --from=builder /app /app', desc: 'Copy built artifacts', check: 'COPY --from=builder' },
  { id: 'builder', code: 'FROM python:3.11 AS builder', desc: 'Build environment', check: 'FROM python:3.11 AS builder' },
  { id: 'cmd', code: 'CMD ["python", "app.py"]', desc: 'Run the app', check: 'CMD' },
  { id: 'run', code: 'RUN pip install -r requirements.txt', desc: 'Install dependencies', check: 'RUN pip' },
  { id: 'workdir', code: 'WORKDIR /app', desc: 'Set working directory', check: 'WORKDIR' },
  { id: 'copy', code: 'COPY . /app', desc: 'Copy source code', check: 'COPY .' },
]);
const l4Checks = [
  'FROM python:3.11 AS builder',
  'WORKDIR',
  'COPY .',
  'RUN pip',
  'FROM python:3.11-slim',
  'COPY --from=builder',
  'CMD',
];
const l4Result = ref<('ok' | 'bad' | null)[]>([]);
const l4ShowCopy = ref(false);
const l4SizeOk = ref(false);

const l5 = reactive({
  picks: [null, null, null] as (string | null)[],
  showCopy: false,
});

const progressPct = computed(() => (completed.value.size / 5) * 100);

function bump(pts: number) {
  score.value += pts;
}

function markDone(n: number) {
  completed.value = new Set([...completed.value, n]);
  if (completed.value.size >= 5) {
    window.setTimeout(() => {
      showVictory.value = true;
    }, 900);
  }
}

function goToLevel(n: number) {
  showVictory.value = false;
  level.value = n;
  feedback.value = null;
}

function goNext() {
  if (level.value >= 5) {
    if (completed.value.size >= 5) showVictory.value = true;
    return;
  }
  goToLevel(level.value + 1);
}

function l1Fix(part: 1 | 2 | 3, val: string) {
  let ok = false;
  if (part === 1 && val === 'redis:7-alpine') ok = true;
  if (part === 2 && val === '"6379:6379"') ok = true;
  if (part === 3 && val.includes('allkeys-lru')) ok = true;

  if (!ok) {
    streak.value = 0;
    feedback.value = { kind: 'error', text: 'Not the best choice for production' };
    return;
  }

  if (part === 1) l1.image = val;
  if (part === 2) l1.ports = val;
  if (part === 3) l1.command = val;
  l1.fixed[part - 1] = true;
  streak.value += 1;
  bump(150);
  feedback.value = { kind: 'success', text: `Correct! +${150 * streak.value} pts` };

  if (l1.fixed.every(Boolean)) {
    l1.showCopy = true;
    bump(200);
    markDone(1);
  }
}

function checkL2() {
  const fields = {
    db: l2.db.trim() === 'myapp',
    user: l2.user.trim() === 'admin',
    pass: l2.pass.trim() === 'secretpassword123',
    net: l2.net.trim() === 'backend' && l2.net2.trim() === 'backend',
  };
  l2.fieldOk = { ...fields };
  const ok = Object.values(fields).filter(Boolean).length;
  if (ok === 4) {
    streak.value += 1;
    bump(300);
    bump(200);
    l2.connected = true;
    l2.showCopy = true;
    feedback.value = {
      kind: 'success',
      text: 'Perfect! Both services connect via the `backend` network.',
    };
    markDone(2);
  } else {
    streak.value = 0;
    feedback.value = {
      kind: 'error',
      text: `${4 - ok} fields wrong. Both services must use the SAME network name.`,
    };
  }
}

function l2Hint() {
  feedback.value = {
    kind: 'hint',
    text: 'DB = myapp, user = admin, password = secretpassword123, network = backend for BOTH',
  };
}

function l3Reveal(n: 1 | 2 | 3) {
  l3.revealed[n - 1] = true;
}

function checkL3() {
  if (l3.revealed.every(Boolean)) {
    streak.value += 1;
    bump(400);
    bump(200);
    l3.healthy = true;
    l3.showCopy = true;
    feedback.value = {
      kind: 'success',
      text: 'App waits via depends_on; healthchecks prove DB/Redis are ready.',
    };
    markDone(3);
  } else {
    streak.value = 0;
    feedback.value = { kind: 'error', text: 'Click all ??? lines to reveal the missing config.' };
  }
}

function l3Hint() {
  l3.revealed = [true, true, true];
  feedback.value = {
    kind: 'hint',
    text: 'depends_on waits for services; healthcheck tells Docker when they’re truly ready.',
  };
}

function moveL4(idx: number, dir: -1 | 1) {
  const next = idx + dir;
  if (next < 0 || next >= l4Items.value.length) return;
  const copy = [...l4Items.value];
  const a = copy[idx];
  const b = copy[next];
  if (!a || !b) return;
  copy[idx] = b;
  copy[next] = a;
  l4Items.value = copy;
  l4Result.value = [];
}

function checkL4() {
  const results = l4Items.value.map((item, i) => {
    const check = l4Checks[i] ?? '';
    return item.code.includes(check) ? ('ok' as const) : ('bad' as const);
  });
  l4Result.value = results;
  const right = results.filter((r) => r === 'ok').length;
  if (right === 7) {
    streak.value += 1;
    bump(400);
    bump(200);
    l4SizeOk.value = true;
    l4ShowCopy.value = true;
    feedback.value = {
      kind: 'success',
      text: 'Builder compiles; runtime stays tiny (~150MB).',
    };
    markDone(4);
  } else {
    streak.value = 0;
    feedback.value = {
      kind: 'error',
      text: `${7 - right} wrong. Build first, then copy into a small image.`,
    };
  }
}

function l4Hint() {
  feedback.value = {
    kind: 'hint',
    text: 'Stage 1 builder has tools. Stage 2 slim runtime only runs the app — COPY --from=builder.',
  };
}

function l5Pick(part: 1 | 2 | 3, val: string) {
  l5.picks[part - 1] = val;
}

function checkL5() {
  if (
    l5.picks[0] === 'unless-stopped' &&
    l5.picks[1] === 'service_healthy' &&
    l5.picks[2] === 'service_healthy'
  ) {
    streak.value += 1;
    bump(500);
    bump(300);
    l5.showCopy = true;
    feedback.value = {
      kind: 'success',
      text: 'unless-stopped + service_healthy — production-ready.',
    };
    markDone(5);
  } else {
    streak.value = 0;
    let msg = 'Not quite. ';
    if (l5.picks[0] !== 'unless-stopped') msg += 'Prefer unless-stopped over always. ';
    if (l5.picks[1] !== 'service_healthy' || l5.picks[2] !== 'service_healthy') {
      msg += 'Use service_healthy so the app waits until healthchecks pass.';
    }
    feedback.value = { kind: 'error', text: msg };
  }
}

function l5Hint() {
  feedback.value = {
    kind: 'hint',
    text: 'unless-stopped restarts on crash but respects manual stop. service_healthy waits for ready, not just started.',
  };
}

async function copyBlock(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    feedback.value = { kind: 'success', text: 'Copied — paste into your project file.' };
  } catch {
    feedback.value = { kind: 'hint', text: 'Select the code and copy manually.' };
  }
}

const L1_COPY = `version: "3.9"
services:
  cache:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru`;

const L2_COPY = `version: "3.9"
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secretpassword123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - backend
  cache:
    image: redis:7-alpine
    networks:
      - backend
volumes:
  postgres_data:
networks:
  backend:`;

const L3_COPY = `version: "3.9"
services:
  app:
    build: .
    ports:
      - "5000:5000"
    depends_on:
      - db
    environment:
      DATABASE_URL: "postgresql://admin:secret@db:5432/myapp"
      REDIS_URL: "redis://cache:6379"
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d myapp"]
      interval: 10s
      timeout: 5s
      retries: 5
  cache:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
volumes:
  postgres_data:`;

const L4_COPY = `# Stage 1: Builder
FROM python:3.11 AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .

# Stage 2: Runtime (tiny image)
FROM python:3.11-slim AS runtime
WORKDIR /app
COPY --from=builder /app /app
RUN pip install -r requirements.txt --no-cache-dir
CMD ["python", "app.py"]`;

const L5_COPY = `version: "3.9"
services:
  proxy:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - app
  app:
    build: .
    restart: unless-stopped
    env_file:
      - .env
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_healthy
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
  db:
    image: postgres:15-alpine
    env_file:
      - .env
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $POSTGRES_USER -d $POSTGRES_DB"]
      interval: 10s
      timeout: 5s
      retries: 5
  cache:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
volumes:
  postgres_data:`;

function resetGame() {
  level.value = 1;
  score.value = 0;
  streak.value = 0;
  feedback.value = null;
  showVictory.value = false;
  completed.value = new Set();
  Object.assign(l1, {
    fixed: [false, false, false],
    image: 'redis',
    ports: '"6379"',
    command: 'redis-server --maxmemory 100mb',
    showCopy: false,
  });
  Object.assign(l2, {
    db: '???',
    user: '???',
    pass: '???',
    net: '???',
    net2: '???',
    fieldOk: {},
    showCopy: false,
    connected: false,
  });
  Object.assign(l3, { revealed: [false, false, false], showCopy: false, healthy: false });
  l4Result.value = [];
  l4ShowCopy.value = false;
  l4SizeOk.value = false;
  l4Items.value = [
    { id: 'runtime', code: 'FROM python:3.11-slim AS runtime', desc: 'Final small image', check: 'FROM python:3.11-slim' },
    { id: 'copyfrom', code: 'COPY --from=builder /app /app', desc: 'Copy built artifacts', check: 'COPY --from=builder' },
    { id: 'builder', code: 'FROM python:3.11 AS builder', desc: 'Build environment', check: 'FROM python:3.11 AS builder' },
    { id: 'cmd', code: 'CMD ["python", "app.py"]', desc: 'Run the app', check: 'CMD' },
    { id: 'run', code: 'RUN pip install -r requirements.txt', desc: 'Install dependencies', check: 'RUN pip' },
    { id: 'workdir', code: 'WORKDIR /app', desc: 'Set working directory', check: 'WORKDIR' },
    { id: 'copy', code: 'COPY . /app', desc: 'Copy source code', check: 'COPY .' },
  ];
  Object.assign(l5, { picks: [null, null, null], showCopy: false });
}
</script>

<template>
  <div class="dcm" aria-label="Docker Config Master">
    <header class="dcm-header">
      <div>
        <h2 class="dcm-title">Docker Config Master</h2>
        <p class="dcm-sub">Real production configs — pick any level, copy when done</p>
      </div>
      <div class="dcm-stats">
        <div class="dcm-stat">
          <span class="dcm-stat-label">Done</span>
          <span class="dcm-stat-value">{{ completed.size }}/5</span>
        </div>
        <div class="dcm-stat">
          <span class="dcm-stat-label">Score</span>
          <span class="dcm-stat-value">{{ score }}</span>
        </div>
      </div>
    </header>

    <div class="dcm-progress" aria-hidden="true">
      <div class="dcm-progress-fill" :style="{ width: `${progressPct}%` }" />
    </div>

    <nav class="dcm-levels" aria-label="Choose level">
      <button
        v-for="item in LEVELS"
        :key="item.n"
        type="button"
        class="dcm-level-btn"
        :class="{
          'is-active': !showVictory && level === item.n,
          'is-done': completed.has(item.n),
        }"
        @click="goToLevel(item.n)"
      >
        {{ item.n }}. {{ item.label }}
      </button>
    </nav>

    <div v-if="showVictory" class="dcm-victory">
      <h3>Config Master unlocked</h3>
      <p>Final score: {{ score }}</p>
      <ul>
        <li>Redis cache with memory limits & eviction</li>
        <li>Postgres + Redis on a named network</li>
        <li>Healthchecks + depends_on</li>
        <li>Multi-stage Dockerfile</li>
        <li>Prod: proxy, .env, restart, resource limits</li>
      </ul>
      <button type="button" class="dcm-btn dcm-btn-primary" @click="resetGame">Play Again</button>
    </div>

    <template v-else>
      <!-- L1 -->
      <section v-show="level === 1" class="dcm-level">
        <div class="dcm-level-head">
          <h3>Level 1: Redis Cache</h3>
          <p>Fix three production mistakes in this compose snippet.</p>
        </div>
        <div class="dcm-mini">
          <div class="dcm-chip">
            <strong>Redis 6379</strong>
            <span :class="l1.fixed[0] && l1.fixed[1] ? 'ok' : 'bad'">{{ l1.fixed[0] && l1.fixed[1] ? 'Online' : 'Offline' }}</span>
          </div>
          <div class="dcm-chip">
            <strong>Memory</strong>
            <span :class="l1.fixed[2] ? 'ok' : 'bad'">{{ l1.fixed[2] ? '256mb + LRU' : 'Not set' }}</span>
          </div>
        </div>
        <div class="dcm-code">
          <p class="cmt"># docker-compose.yml</p>
          <p><span class="key">version</span>: <span class="str">"3.9"</span></p>
          <p><span class="key">services</span>:</p>
          <p class="ind"><span class="tag">cache</span>:</p>
          <p class="ind2">
            <span class="key">image</span>:
            <span class="tok" :class="l1.fixed[0] ? 'fixed' : 'broken'">{{ l1.image }}</span>
          </p>
          <p class="ind2"><span class="key">ports</span>:</p>
          <p class="ind3">
            -
            <span class="tok" :class="l1.fixed[1] ? 'fixed' : 'broken'">{{ l1.ports }}</span>
          </p>
          <p class="ind2">
            <span class="key">command</span>:
            <span class="tok" :class="l1.fixed[2] ? 'fixed' : 'broken'">{{ l1.command }}</span>
          </p>
        </div>
        <div class="dcm-actions">
          <button type="button" class="dcm-btn" @click="l1Fix(1, 'redis:7-alpine')">image: redis:7-alpine</button>
          <button type="button" class="dcm-btn" @click="l1Fix(1, 'redis:latest')">image: redis:latest</button>
          <button type="button" class="dcm-btn" @click="l1Fix(2, '&quot;6379:6379&quot;')">ports: "6379:6379"</button>
          <button type="button" class="dcm-btn" @click="l1Fix(2, '&quot;6380:6379&quot;')">ports: "6380:6379"</button>
          <button
            type="button"
            class="dcm-btn"
            @click="l1Fix(3, 'redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru')"
          >
            command + LRU
          </button>
          <button type="button" class="dcm-btn" @click="l1Fix(3, 'redis-server')">command: redis-server</button>
        </div>
        <div v-if="l1.showCopy" class="dcm-copy">
          <div class="dcm-copy-head">
            <span>Correct config</span>
            <button type="button" class="dcm-btn dcm-btn-success" @click="copyBlock(L1_COPY)">Copy</button>
            <button type="button" class="dcm-btn dcm-btn-primary" @click="goNext">Next level</button>
          </div>
          <pre>{{ L1_COPY }}</pre>
        </div>
      </section>

      <!-- L2 -->
      <section v-show="level === 2" class="dcm-level">
        <div class="dcm-level-head">
          <h3>Level 2: Postgres + Redis</h3>
          <p>Fill blanks. Both services must share the same network name.</p>
        </div>
        <div class="dcm-code">
          <p class="cmt"># Fill ??? then Verify</p>
          <p><span class="key">services</span>:</p>
          <p class="ind"><span class="tag">db</span>:</p>
          <p class="ind2"><span class="key">image</span>: <span class="str">postgres:15-alpine</span></p>
          <p class="ind2"><span class="key">environment</span>:</p>
          <p class="ind3">
            <span class="key">POSTGRES_DB</span>:
            <input v-model="l2.db" class="dcm-input" :class="{ ok: l2.fieldOk.db, bad: l2.fieldOk.db === false }" />
          </p>
          <p class="ind3">
            <span class="key">POSTGRES_USER</span>:
            <input v-model="l2.user" class="dcm-input" :class="{ ok: l2.fieldOk.user, bad: l2.fieldOk.user === false }" />
          </p>
          <p class="ind3">
            <span class="key">POSTGRES_PASSWORD</span>:
            <input v-model="l2.pass" class="dcm-input" :class="{ ok: l2.fieldOk.pass, bad: l2.fieldOk.pass === false }" />
          </p>
          <p class="ind2"><span class="key">networks</span>: -
            <input v-model="l2.net" class="dcm-input" :class="{ ok: l2.fieldOk.net, bad: l2.fieldOk.net === false }" />
          </p>
          <p class="ind"><span class="tag">cache</span>:</p>
          <p class="ind2"><span class="key">image</span>: <span class="str">redis:7-alpine</span></p>
          <p class="ind2"><span class="key">networks</span>: -
            <input v-model="l2.net2" class="dcm-input" :class="{ ok: l2.fieldOk.net, bad: l2.fieldOk.net === false }" />
          </p>
          <p><span class="key">networks</span>:</p>
          <p class="ind"><span class="tag">backend</span>:</p>
        </div>
        <div class="dcm-actions">
          <button type="button" class="dcm-btn dcm-btn-success" @click="checkL2">Verify Config</button>
          <button type="button" class="dcm-btn" @click="l2Hint">Hint</button>
        </div>
        <div v-if="l2.showCopy" class="dcm-copy">
          <div class="dcm-copy-head">
            <span>Production-ready</span>
            <button type="button" class="dcm-btn dcm-btn-success" @click="copyBlock(L2_COPY)">Copy</button>
            <button type="button" class="dcm-btn dcm-btn-primary" @click="goNext">Next level</button>
          </div>
          <pre>{{ L2_COPY }}</pre>
        </div>
      </section>

      <!-- L3 -->
      <section v-show="level === 3" class="dcm-level">
        <div class="dcm-level-head">
          <h3>Level 3: Health checks</h3>
          <p>Click ??? to reveal depends_on / healthcheck blocks, then verify.</p>
        </div>
        <div class="dcm-code">
          <p class="ind"><span class="tag">app</span>:</p>
          <p class="ind2"><span class="key">build</span>: .</p>
          <button
            type="button"
            class="tok"
            :class="l3.revealed[0] ? 'fixed' : 'broken'"
            @click="l3Reveal(1)"
          >
            {{ l3.revealed[0] ? 'depends_on:' : '???' }}
          </button>
          <p v-if="l3.revealed[0]" class="ind3">- <span class="str">db</span></p>
          <p class="ind"><span class="tag">db</span>:</p>
          <button
            type="button"
            class="tok"
            :class="l3.revealed[1] ? 'fixed' : 'broken'"
            @click="l3Reveal(2)"
          >
            {{ l3.revealed[1] ? 'healthcheck:' : '???' }}
          </button>
          <template v-if="l3.revealed[1]">
            <p class="ind3"><span class="key">test</span>: [<span class="str">"CMD-SHELL"</span>, <span class="str">"pg_isready -U admin -d myapp"</span>]</p>
            <p class="ind3"><span class="key">interval</span>: <span class="str">10s</span></p>
          </template>
          <p class="ind"><span class="tag">cache</span>:</p>
          <button
            type="button"
            class="tok"
            :class="l3.revealed[2] ? 'fixed' : 'broken'"
            @click="l3Reveal(3)"
          >
            {{ l3.revealed[2] ? 'healthcheck:' : '???' }}
          </button>
          <template v-if="l3.revealed[2]">
            <p class="ind3"><span class="key">test</span>: [<span class="str">"CMD"</span>, <span class="str">"redis-cli"</span>, <span class="str">"ping"</span>]</p>
          </template>
        </div>
        <div class="dcm-actions">
          <button type="button" class="dcm-btn dcm-btn-success" @click="checkL3">Verify Stack</button>
          <button type="button" class="dcm-btn" @click="l3Hint">Show Me</button>
        </div>
        <div v-if="l3.showCopy" class="dcm-copy">
          <div class="dcm-copy-head">
            <span>Full stack + healthchecks</span>
            <button type="button" class="dcm-btn dcm-btn-success" @click="copyBlock(L3_COPY)">Copy</button>
            <button type="button" class="dcm-btn dcm-btn-primary" @click="goNext">Next level</button>
          </div>
          <pre>{{ L3_COPY }}</pre>
        </div>
      </section>

      <!-- L4 -->
      <section v-show="level === 4" class="dcm-level">
        <div class="dcm-level-head">
          <h3>Level 4: Multi-stage Dockerfile</h3>
          <p>Reorder: builder first, then slim runtime. Size: {{ l4SizeOk ? '~150MB' : '800MB+ wrong' }}</p>
        </div>
        <ul class="dcm-order">
          <li
            v-for="(item, idx) in l4Items"
            :key="item.id"
            class="dcm-order-item"
            :class="{ ok: l4Result[idx] === 'ok', bad: l4Result[idx] === 'bad' }"
          >
            <button type="button" class="dcm-order-btn" @click="moveL4(idx, -1)">↑</button>
            <button type="button" class="dcm-order-btn" @click="moveL4(idx, 1)">↓</button>
            <code>{{ item.code }}</code>
            <span>{{ item.desc }}</span>
          </li>
        </ul>
        <div class="dcm-actions">
          <button type="button" class="dcm-btn dcm-btn-success" @click="checkL4">Check Order</button>
          <button type="button" class="dcm-btn" @click="l4Hint">Explain</button>
        </div>
        <div v-if="l4ShowCopy" class="dcm-copy">
          <div class="dcm-copy-head">
            <span>Production Dockerfile</span>
            <button type="button" class="dcm-btn dcm-btn-success" @click="copyBlock(L4_COPY)">Copy</button>
            <button type="button" class="dcm-btn dcm-btn-primary" @click="goNext">Next level</button>
          </div>
          <pre>{{ L4_COPY }}</pre>
        </div>
      </section>

      <!-- L5 -->
      <section v-show="level === 5" class="dcm-level">
        <div class="dcm-level-head">
          <h3>Level 5: Production stack</h3>
          <p>Pick restart policy and depends_on conditions.</p>
        </div>
        <div class="dcm-code">
          <p class="ind"><span class="tag">app</span>:</p>
          <p class="ind2">
            <span class="key">restart</span>:
            <span class="tok" :class="l5.picks[0] ? 'fixed' : 'broken'">{{ l5.picks[0] ?? '???' }}</span>
          </p>
          <p class="ind2"><span class="key">depends_on</span>:</p>
          <p class="ind3">
            <span class="tag">db</span> · condition:
            <span class="tok" :class="l5.picks[1] ? 'fixed' : 'broken'">{{ l5.picks[1] ?? '???' }}</span>
          </p>
          <p class="ind3">
            <span class="tag">cache</span> · condition:
            <span class="tok" :class="l5.picks[2] ? 'fixed' : 'broken'">{{ l5.picks[2] ?? '???' }}</span>
          </p>
        </div>
        <div class="dcm-actions">
          <button type="button" class="dcm-btn" @click="l5Pick(1, 'unless-stopped')">restart: unless-stopped</button>
          <button type="button" class="dcm-btn" @click="l5Pick(1, 'always')">restart: always</button>
          <button type="button" class="dcm-btn" @click="l5Pick(2, 'service_healthy')">db: service_healthy</button>
          <button type="button" class="dcm-btn" @click="l5Pick(2, 'service_started')">db: service_started</button>
          <button type="button" class="dcm-btn" @click="l5Pick(3, 'service_healthy')">cache: service_healthy</button>
          <button type="button" class="dcm-btn" @click="l5Pick(3, 'service_started')">cache: service_started</button>
        </div>
        <div class="dcm-actions">
          <button type="button" class="dcm-btn dcm-btn-success" @click="checkL5">Verify Production</button>
          <button type="button" class="dcm-btn" @click="l5Hint">Explain</button>
        </div>
        <div v-if="l5.showCopy" class="dcm-copy">
          <div class="dcm-copy-head">
            <span>Production compose</span>
            <button type="button" class="dcm-btn dcm-btn-success" @click="copyBlock(L5_COPY)">Copy</button>
          </div>
          <pre>{{ L5_COPY }}</pre>
        </div>
      </section>

      <p v-if="feedback" class="dcm-feedback" :class="`is-${feedback.kind}`" role="status">
        {{ feedback.text }}
      </p>
    </template>
  </div>
</template>

<style scoped>
.dcm {
  --ink: #111111;
  --muted: #4b5563;
  --line: #d1d5db;
  --surface: #ffffff;
  --blue: #2563eb;
  --green: #15803d;
  --red: #b91c1c;
  --gold: #a16207;
  width: 100%;
  max-width: 40rem;
  margin: 0 auto;
  padding: 0.85rem 0.9rem 1rem;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface);
  color: var(--ink);
  box-shadow: 0 6px 20px rgba(17, 17, 17, 0.08);
  font-family: 'Space Grotesk', 'Space Grotesk fallback', Helvetica Neue, Arial, sans-serif;
}

:global(.insights-shell[data-mode='dark']) .dcm {
  --ink: #f3f3f3;
  --muted: #a3a3a3;
  --line: #2a2a2a;
  --surface: #1a1a1a;
  --blue: #4a9eff;
  --green: #4ade80;
  --red: #f87171;
  --gold: #fbbf24;
}

.dcm-header {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.65rem;
}
.dcm-title { margin: 0; font-size: 1.1rem; font-weight: 800; }
.dcm-sub { margin: 0.2rem 0 0; font-size: 0.72rem; color: var(--muted); }
.dcm-stats { display: flex; gap: 0.4rem; }
.dcm-stat {
  min-width: 3.4rem;
  text-align: center;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 0.3rem 0.45rem;
  background: color-mix(in srgb, var(--blue) 6%, var(--surface));
}
.dcm-stat-label {
  display: block;
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.dcm-stat-value {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-weight: 700;
  font-size: 0.9rem;
}

.dcm-progress {
  height: 5px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--ink) 10%, transparent);
  margin-bottom: 0.65rem;
  overflow: hidden;
}
.dcm-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b7cff, #4a9eff);
  transition: width 0.35s ease;
}

.dcm-levels {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}
.dcm-level-btn {
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--ink);
  border-radius: 999px;
  padding: 0.28rem 0.6rem;
  font-size: 0.68rem;
  font-weight: 700;
  cursor: pointer;
}
.dcm-level-btn.is-active {
  border-color: var(--blue);
  color: var(--blue);
  background: color-mix(in srgb, var(--blue) 10%, var(--surface));
}
.dcm-level-btn.is-done {
  border-color: var(--green);
}

.dcm-level-head {
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 0.65rem 0.8rem;
  margin-bottom: 0.65rem;
  background: color-mix(in srgb, var(--blue) 5%, var(--surface));
}
.dcm-level-head h3 { margin: 0; font-size: 0.92rem; }
.dcm-level-head p { margin: 0.2rem 0 0; font-size: 0.72rem; color: var(--muted); }

.dcm-mini { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.6rem; }
.dcm-chip {
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 0.4rem 0.55rem;
  font-size: 0.68rem;
  display: grid;
  gap: 0.15rem;
}
.dcm-chip .ok { color: var(--green); font-weight: 700; }
.dcm-chip .bad { color: var(--red); font-weight: 700; }

.dcm-code {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 10px;
  padding: 0.7rem 0.8rem;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  line-height: 1.65;
  color: #e6edf3;
  overflow-x: auto;
  margin-bottom: 0.65rem;
}
.dcm-code p { margin: 0; }
.cmt { color: #9ca3af; }
.key { color: #ff7b72; }
.str { color: #a5d6ff; }
.tag { color: #7ee787; }
.ind { padding-left: 0.85rem; }
.ind2 { padding-left: 1.6rem; }
.ind3 { padding-left: 2.35rem; }

.tok {
  display: inline-block;
  padding: 0 0.3rem;
  border-radius: 4px;
  cursor: pointer;
  font: inherit;
  color: inherit;
}
.tok.broken {
  background: rgba(255, 0, 0, 0.15);
  border: 1px dashed #e94560;
}
.tok.fixed {
  background: rgba(46, 160, 67, 0.15);
  border: 1px solid #2ea043;
  color: #7ee787;
  cursor: default;
}

.dcm-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}
.dcm-btn {
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--ink);
  border-radius: 8px;
  padding: 0.4rem 0.7rem;
  font-size: 0.7rem;
  cursor: pointer;
}
.dcm-btn:hover { border-color: var(--blue); }
.dcm-btn-primary {
  border-color: var(--blue);
  background: color-mix(in srgb, var(--blue) 10%, var(--surface));
}
.dcm-btn-success {
  border-color: var(--green);
  background: color-mix(in srgb, var(--green) 10%, var(--surface));
}

.dcm-input {
  background: #21262d;
  border: 1px solid #e94560;
  border-radius: 4px;
  color: #a5d6ff;
  padding: 0.1rem 0.35rem;
  font: inherit;
  width: 7.5rem;
}
.dcm-input.ok { border-color: #2ea043; color: #7ee787; }
.dcm-input.bad { border-color: #e94560; }

.dcm-order { list-style: none; margin: 0 0 0.65rem; padding: 0; display: grid; gap: 0.35rem; }
.dcm-order-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 0.45rem 0.55rem;
  background: var(--surface);
}
.dcm-order-item.ok { border-color: var(--green); }
.dcm-order-item.bad { border-color: var(--red); }
.dcm-order-item code {
  flex: 1;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  color: #b91c1c;
}
:global(.insights-shell[data-mode='dark']) .dcm-order-item code { color: #ff7b72; }
.dcm-order-item span { font-size: 0.62rem; color: var(--muted); }
.dcm-order-btn {
  width: 1.5rem;
  height: 1.5rem;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
}

.dcm-copy {
  margin-top: 0.55rem;
  border: 1px solid var(--green);
  border-radius: 10px;
  background: color-mix(in srgb, var(--green) 8%, var(--surface));
  padding: 0.65rem 0.75rem;
}
.dcm-copy-head {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
  margin-bottom: 0.45rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--green);
}
.dcm-copy pre {
  margin: 0;
  background: #0d1117;
  color: #c9d1d9;
  border-radius: 8px;
  padding: 0.65rem 0.75rem;
  font-size: 0.65rem;
  line-height: 1.55;
  overflow-x: auto;
  font-family: 'DM Mono', ui-monospace, monospace;
}

.dcm-feedback {
  text-align: center;
  margin-top: 0.45rem;
  font-size: 0.75rem;
  font-weight: 700;
}
.dcm-feedback.is-success { color: var(--green); }
.dcm-feedback.is-error { color: var(--red); }
.dcm-feedback.is-hint { color: var(--gold); }

.dcm-victory {
  text-align: center;
  padding: 1rem 0.5rem;
}
.dcm-victory h3 { margin: 0 0 0.35rem; }
.dcm-victory ul {
  text-align: left;
  max-width: 22rem;
  margin: 0.75rem auto;
  font-size: 0.78rem;
  line-height: 1.55;
}
</style>
