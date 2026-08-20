<script setup lang="ts">
type MatchKey = 'image' | 'container' | 'dockerfile' | 'engine';

interface MatchCard {
  key: MatchKey;
  side: 'kid' | 'real';
  emoji: string;
  label: string;
}

interface OrderItem {
  id: string;
  code: string;
  desc: string;
  check: string;
}

const LEVELS = [
  { n: 1, label: 'Match' },
  { n: 2, label: 'Run' },
  { n: 3, label: 'Dockerfile' },
  { n: 4, label: 'Volumes' },
  { n: 5, label: 'Compose' },
] as const;

const level = ref(1);
const score = ref(0);
const streak = ref(0);
const matchesDone = ref(0);
const selectedKid = ref<MatchKey | null>(null);
const selectedReal = ref<MatchKey | null>(null);
const matched = ref<Set<MatchKey>>(new Set());
const flashWrong = ref<[MatchKey, MatchKey] | null>(null);
const feedback = ref<{ kind: 'success' | 'error' | 'hint'; text: string } | null>(null);
const showVictory = ref(false);
const showHint2 = ref(false);
const completed = ref<Set<number>>(new Set());
const levelDone = ref(false);

const l2 = reactive({
  createFixed: false,
  portFixed: false,
  highlight: 0 as 0 | 1 | 2,
});

const l4Revealed = ref(false);
const stackDb1 = ref('');
const stackDb2 = ref('');

const kidCards: MatchCard[] = [
  { key: 'image', side: 'kid', emoji: '📋', label: 'The Recipe' },
  { key: 'container', side: 'kid', emoji: '🍪', label: 'The Cookie' },
  { key: 'dockerfile', side: 'kid', emoji: '🥡', label: 'Writing Recipe' },
  { key: 'engine', side: 'kid', emoji: '🏭', label: 'The Kitchen' },
];

const realCards: MatchCard[] = [
  { key: 'engine', side: 'real', emoji: '⚙️', label: 'Docker Engine' },
  { key: 'image', side: 'real', emoji: '💿', label: 'Docker Image' },
  { key: 'dockerfile', side: 'real', emoji: '📝', label: 'Dockerfile' },
  { key: 'container', side: 'real', emoji: '📦', label: 'Container' },
];

const orderItems = ref<OrderItem[]>([
  { id: 'copy', code: 'COPY . /app', desc: 'Copy your code', check: 'COPY .' },
  { id: 'from', code: 'FROM python:3.11', desc: 'Base image', check: 'FROM python' },
  { id: 'cmd', code: 'CMD ["python","app.py"]', desc: 'Run command', check: 'CMD [' },
  { id: 'run', code: 'RUN pip install -r requirements.txt', desc: 'Install deps', check: 'RUN pip' },
]);

const orderChecks = ['FROM python', 'RUN pip', 'COPY .', 'CMD ['];
const orderResult = ref<('ok' | 'bad' | null)[]>([]);

const progressPct = computed(() => (completed.value.size / 5) * 100);

function bumpScore(pts: number) {
  score.value += pts;
}

function markDone(n: number) {
  completed.value = new Set([...completed.value, n]);
  levelDone.value = true;
  if (completed.value.size >= 5) {
    window.setTimeout(() => {
      showVictory.value = true;
    }, 800);
  }
}

function goToLevel(n: number) {
  showVictory.value = false;
  level.value = n;
  feedback.value = null;
  levelDone.value = completed.value.has(n);
}

function goNext() {
  if (level.value >= 5) {
    if (completed.value.size >= 5) showVictory.value = true;
    return;
  }
  goToLevel(level.value + 1);
}

function selectMatch(card: MatchCard) {
  if (matched.value.has(card.key)) return;
  if (card.side === 'kid') selectedKid.value = card.key;
  else selectedReal.value = card.key;

  if (!selectedKid.value || !selectedReal.value) return;

  const kid = selectedKid.value;
  const real = selectedReal.value;

  if (kid === real) {
    matched.value = new Set([...matched.value, kid]);
    streak.value += 1;
    const gained = 100 * streak.value;
    bumpScore(gained);
    matchesDone.value += 1;
    feedback.value = { kind: 'success', text: `Match! +${gained} pts` };
    selectedKid.value = null;
    selectedReal.value = null;
    if (matchesDone.value >= 4) {
      bumpScore(200);
      markDone(1);
    }
  } else {
    streak.value = 0;
    flashWrong.value = [kid, real];
    feedback.value = { kind: 'error', text: 'Not a match' };
    window.setTimeout(() => {
      flashWrong.value = null;
      selectedKid.value = null;
      selectedReal.value = null;
    }, 450);
  }
}

function cardClass(card: MatchCard) {
  const isSel =
    (card.side === 'kid' && selectedKid.value === card.key) ||
    (card.side === 'real' && selectedReal.value === card.key);
  const isWrong =
    flashWrong.value &&
    ((card.side === 'kid' && flashWrong.value[0] === card.key) ||
      (card.side === 'real' && flashWrong.value[1] === card.key));
  return {
    'is-selected': isSel,
    'is-matched': matched.value.has(card.key),
    'is-wrong': !!isWrong,
  };
}

function tryFixCreate(ans: 'run' | 'start') {
  if (l2.createFixed) return;
  if (ans === 'run') {
    l2.createFixed = true;
    streak.value += 1;
    bumpScore(150);
    feedback.value = {
      kind: 'success',
      text: '`docker run` starts the container. `create` only makes it.',
    };
    maybeFinishL2();
  } else {
    streak.value = 0;
    feedback.value = { kind: 'error', text: 'Not the right fix' };
  }
}

function tryFixPort(ans: '5432:5432' | '8080:5432') {
  if (l2.portFixed) return;
  if (ans === '5432:5432') {
    l2.portFixed = true;
    streak.value += 1;
    bumpScore(150);
    feedback.value = {
      kind: 'success',
      text: 'Port mapping format is `host:container`',
    };
    maybeFinishL2();
  } else {
    streak.value = 0;
    feedback.value = { kind: 'error', text: 'Not the right fix' };
  }
}

function maybeFinishL2() {
  if (l2.createFixed && l2.portFixed) {
    bumpScore(200);
    markDone(2);
  }
}

function moveOrder(idx: number, dir: -1 | 1) {
  const next = idx + dir;
  if (next < 0 || next >= orderItems.value.length) return;
  const copy = [...orderItems.value];
  const tmp = copy[idx];
  copy[idx] = copy[next];
  copy[next] = tmp;
  orderItems.value = copy;
  orderResult.value = [];
}

function checkOrder() {
  if (completed.value.has(3)) return;
  const results = orderItems.value.map((item, i) =>
    item.code.includes(orderChecks[i]) ? ('ok' as const) : ('bad' as const),
  );
  orderResult.value = results;
  const right = results.filter((r) => r === 'ok').length;
  if (right === 4) {
    streak.value += 1;
    bumpScore(300);
    feedback.value = { kind: 'success', text: 'Perfect! FROM → RUN → COPY → CMD' };
    bumpScore(200);
    markDone(3);
  } else {
    streak.value = 0;
    feedback.value = {
      kind: 'error',
      text: `${4 - right} wrong. Base image first, then deps, then code, then run.`,
    };
  }
}

function checkMissing(ans: 'volumes' | 'networks' | 'restart') {
  if (completed.value.has(4)) return;
  if (ans === 'volumes') {
    streak.value += 1;
    bumpScore(200);
    feedback.value = {
      kind: 'success',
      text: 'Correct! Without a volume, database data is lost on container stop.',
    };
    bumpScore(200);
    markDone(4);
  } else {
    streak.value = 0;
    feedback.value = {
      kind: 'error',
      text: 'Think about what happens to data when the container restarts.',
    };
  }
}

function checkStack() {
  if (completed.value.has(5)) return;
  const v1 = stackDb1.value.trim();
  const v2 = stackDb2.value.trim();
  if (v1 === 'db' && v2 === 'db') {
    streak.value += 1;
    bumpScore(400);
    feedback.value = {
      kind: 'success',
      text: 'Correct! Service name `db` becomes the hostname.',
    };
    bumpScore(300);
    markDone(5);
  } else if (v1 === 'db' || v2 === 'db') {
    bumpScore(100);
    feedback.value = { kind: 'hint', text: 'Partial! Both blanks should be `db`' };
  } else {
    streak.value = 0;
    feedback.value = {
      kind: 'error',
      text: 'In docker-compose, use the SERVICE NAME as hostname.',
    };
  }
}

function resetGame() {
  level.value = 1;
  score.value = 0;
  streak.value = 0;
  matchesDone.value = 0;
  selectedKid.value = null;
  selectedReal.value = null;
  matched.value = new Set();
  flashWrong.value = null;
  feedback.value = null;
  showVictory.value = false;
  showHint2.value = false;
  completed.value = new Set();
  levelDone.value = false;
  l2.createFixed = false;
  l2.portFixed = false;
  l2.highlight = 0;
  l4Revealed.value = false;
  stackDb1.value = '';
  stackDb2.value = '';
  orderResult.value = [];
  orderItems.value = [
    { id: 'copy', code: 'COPY . /app', desc: 'Copy your code', check: 'COPY .' },
    { id: 'from', code: 'FROM python:3.11', desc: 'Base image', check: 'FROM python' },
    { id: 'cmd', code: 'CMD ["python","app.py"]', desc: 'Run command', check: 'CMD [' },
    { id: 'run', code: 'RUN pip install -r requirements.txt', desc: 'Install deps', check: 'RUN pip' },
  ];
}
</script>

<template>
  <div class="dq" aria-label="Docker Quest learning game">
    <header class="dq-header">
      <div>
        <h2 class="dq-title">Docker Quest</h2>
        <p class="dq-sub">Master real Docker configs through play</p>
      </div>
      <div class="dq-stats">
        <div class="dq-stat">
          <span class="dq-stat-label">Done</span>
          <span class="dq-stat-value">{{ completed.size }}/5</span>
        </div>
        <div class="dq-stat">
          <span class="dq-stat-label">Score</span>
          <span class="dq-stat-value">{{ score }}</span>
        </div>
        <div class="dq-stat">
          <span class="dq-stat-label">Streak</span>
          <span class="dq-stat-value">{{ streak }}</span>
        </div>
      </div>
    </header>

    <div class="dq-progress" aria-hidden="true">
      <div class="dq-progress-fill" :style="{ width: `${progressPct}%` }" />
    </div>

    <nav class="dq-levels" aria-label="Choose level">
      <button
        v-for="item in LEVELS"
        :key="item.n"
        type="button"
        class="dq-level-btn"
        :class="{
          'is-active': !showVictory && level === item.n,
          'is-done': completed.has(item.n),
        }"
        @click="goToLevel(item.n)"
      >
        {{ item.n }}. {{ item.label }}
      </button>
    </nav>

    <div v-if="showVictory" class="dq-victory">
      <p class="dq-trophy" aria-hidden="true">*</p>
      <h3>You Dockerized It!</h3>
      <p>You now understand real Docker configs used in production.</p>
      <div class="dq-victory-card">
        <p class="dq-final">Final Score: {{ score }}</p>
        <ul>
          <li>Docker terminology (Image, Container, Engine, Dockerfile)</li>
          <li><code>docker run</code> flags (-e, -p, -v, --name)</li>
          <li>Dockerfile layer ordering (FROM → RUN → COPY → CMD)</li>
          <li>Volume persistence (why databases must have volumes)</li>
          <li>docker-compose networking (service names as hostnames)</li>
        </ul>
      </div>
      <button type="button" class="dq-btn dq-btn-primary" @click="resetGame">Play Again</button>
    </div>

    <template v-else>
      <!-- Level 1 -->
      <section v-show="level === 1" class="dq-level">
        <div class="dq-level-head">
          <h3>Level 1: Match the Concepts</h3>
          <p>Click a Kid card, then its Real match.</p>
        </div>
        <div class="dq-match">
          <div>
            <p class="dq-col-label is-gold">Kid analogy</p>
            <button
              v-for="card in kidCards"
              :key="`k-${card.key}`"
              type="button"
              class="dq-card"
              :class="cardClass(card)"
              @click="selectMatch(card)"
            >
              <span class="dq-card-emoji" aria-hidden="true">{{ card.emoji }}</span>
              <span class="dq-card-label">{{ card.label }}</span>
            </button>
          </div>
          <div>
            <p class="dq-col-label is-blue">Real term</p>
            <button
              v-for="card in realCards"
              :key="`r-${card.key}`"
              type="button"
              class="dq-card"
              :class="cardClass(card)"
              @click="selectMatch(card)"
            >
              <span class="dq-card-emoji" aria-hidden="true">{{ card.emoji }}</span>
              <span class="dq-card-label">{{ card.label }}</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Level 2 -->
      <section v-show="level === 2" class="dq-level">
        <div class="dq-level-head">
          <h3>Level 2: Fix the Broken Command</h3>
          <p>Two real mistakes. Fix them with the buttons below.</p>
        </div>
        <div class="dq-code">
          <p class="dq-comment"># Broken command</p>
          <p>
            docker
            <span
              class="dq-tok"
              :class="l2.createFixed ? 'is-fixed' : 'is-broken'"
              @click="l2.highlight = 1"
            >{{ l2.createFixed ? 'run' : 'create' }}</span>
            \
          </p>
          <p class="dq-indent">--name mydb \</p>
          <p class="dq-indent">-e POSTGRES_PASSWORD=secret \</p>
          <p class="dq-indent">
            -p
            <span
              class="dq-tok"
              :class="l2.portFixed ? 'is-fixed' : 'is-broken'"
              @click="l2.highlight = 2"
            >{{ l2.portFixed ? '5432:5432' : '5432' }}</span>
            \
          </p>
          <p class="dq-indent">-v pgdata:/var/lib/postgresql/data \</p>
          <p class="dq-indent">postgres:15</p>
        </div>
        <div class="dq-actions">
          <button type="button" class="dq-btn dq-btn-primary" @click="tryFixCreate('run')">
            Fix: <code>docker run</code>
          </button>
          <button type="button" class="dq-btn" @click="tryFixCreate('start')">
            Fix: <code>docker start</code>
          </button>
          <button type="button" class="dq-btn dq-btn-primary" @click="tryFixPort('5432:5432')">
            Fix port: <code>5432:5432</code>
          </button>
          <button type="button" class="dq-btn" @click="tryFixPort('8080:5432')">
            Fix port: <code>8080:5432</code>
          </button>
        </div>
        <button type="button" class="dq-hint" @click="showHint2 = true">
          {{ showHint2 ? 'Hint: create does not start; ports need host:container' : 'Need a hint?' }}
        </button>
      </section>

      <!-- Level 3 -->
      <section v-show="level === 3" class="dq-level">
        <div class="dq-level-head">
          <h3>Level 3: Order the Dockerfile</h3>
          <p>Reorder for build caching. Correct: FROM → RUN → COPY → CMD.</p>
        </div>
        <ul class="dq-order">
          <li
            v-for="(item, idx) in orderItems"
            :key="item.id"
            class="dq-order-item"
            :class="{
              'is-ok': orderResult[idx] === 'ok',
              'is-bad': orderResult[idx] === 'bad',
            }"
          >
            <button type="button" class="dq-order-btn" @click="moveOrder(idx, -1)">↑</button>
            <button type="button" class="dq-order-btn" @click="moveOrder(idx, 1)">↓</button>
            <code class="dq-order-code">{{ item.code }}</code>
            <span class="dq-order-desc">{{ item.desc }}</span>
          </li>
        </ul>
        <div class="dq-actions">
          <button type="button" class="dq-btn dq-btn-success" @click="checkOrder">Check Order</button>
        </div>
      </section>

      <!-- Level 4 -->
      <section v-show="level === 4" class="dq-level">
        <div class="dq-level-head">
          <h3>Level 4: Find the Data Disaster</h3>
          <p>This compose file loses DB data on restart. What’s missing?</p>
        </div>
        <div class="dq-code">
          <p class="dq-comment"># Click ??? then choose below</p>
          <p><span class="dq-key">version</span>: <span class="dq-str">"3.9"</span></p>
          <p><span class="dq-key">services</span>:</p>
          <p class="dq-indent"><span class="dq-tag">db</span>:</p>
          <p class="dq-indent2"><span class="dq-key">image</span>: <span class="dq-str">postgres:15</span></p>
          <p class="dq-indent2"><span class="dq-key">environment</span>:</p>
          <p class="dq-indent3"><span class="dq-key">POSTGRES_PASSWORD</span>: <span class="dq-str">secret</span></p>
          <p class="dq-indent2"><span class="dq-key">ports</span>:</p>
          <p class="dq-indent3">- <span class="dq-str">"5432:5432"</span></p>
          <button
            v-if="!l4Revealed"
            type="button"
            class="dq-missing"
            @click="l4Revealed = true"
          >
            ??? — click to reveal missing line
          </button>
          <div v-else class="dq-missing is-on">
            <p class="dq-indent2"><span class="dq-key">volumes</span>:</p>
            <p class="dq-indent3">- <span class="dq-str">"pg_data:/var/lib/postgresql/data"</span></p>
          </div>
        </div>
        <div class="dq-actions">
          <button type="button" class="dq-btn dq-btn-danger" @click="checkMissing('volumes')">
            Missing <code>volumes</code>
          </button>
          <button type="button" class="dq-btn" @click="checkMissing('networks')">
            Missing <code>networks</code>
          </button>
          <button type="button" class="dq-btn" @click="checkMissing('restart')">
            Missing <code>restart: always</code>
          </button>
        </div>
      </section>

      <!-- Level 5 -->
      <section v-show="level === 5" class="dq-level">
        <div class="dq-level-head">
          <h3>Level 5: Build the Full Stack</h3>
          <p>In compose, service names become hostnames. Fill both blanks.</p>
        </div>
        <div class="dq-code">
          <p><span class="dq-key">version</span>: <span class="dq-str">"3.9"</span></p>
          <p><span class="dq-key">services</span>:</p>
          <p class="dq-indent"><span class="dq-tag">app</span>:</p>
          <p class="dq-indent2"><span class="dq-key">build</span>: .</p>
          <p class="dq-indent2"><span class="dq-key">ports</span>: - <span class="dq-str">"5000:5000"</span></p>
          <p class="dq-indent2"><span class="dq-key">depends_on</span>:</p>
          <p class="dq-indent3">
            -
            <input v-model="stackDb1" class="dq-input" placeholder="???" aria-label="depends_on service" />
          </p>
          <p class="dq-indent2"><span class="dq-key">environment</span>:</p>
          <p class="dq-indent3">
            <span class="dq-key">DATABASE_URL</span>:
            <span class="dq-str">"postgresql://admin:secret@</span><input
              v-model="stackDb2"
              class="dq-input"
              placeholder="???"
              aria-label="database host"
            /><span class="dq-str">:5432/blog"</span>
          </p>
          <p class="dq-indent"><span class="dq-tag">db</span>:</p>
          <p class="dq-indent2"><span class="dq-key">image</span>: <span class="dq-str">postgres:15</span></p>
          <p class="dq-indent2"><span class="dq-key">volumes</span>: - <span class="dq-str">pg_data:/var/lib/postgresql/data</span></p>
          <p><span class="dq-key">volumes</span>:</p>
          <p class="dq-indent"><span class="dq-tag">pg_data</span>:</p>
        </div>
        <div class="dq-actions">
          <button type="button" class="dq-btn dq-btn-success" @click="checkStack">Launch Stack</button>
        </div>
      </section>

      <p
        v-if="feedback"
        class="dq-feedback"
        :class="`is-${feedback.kind}`"
        role="status"
      >
        {{ feedback.text }}
      </p>

      <div v-if="levelDone && !showVictory" class="dq-continue">
        <button
          v-if="level < 5"
          type="button"
          class="dq-btn dq-btn-primary"
          @click="goNext"
        >
          Next level →
        </button>
        <p v-else class="dq-continue-note">Pick any level above, or finish all five for victory.</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dq {
  /* UI chrome on light left panel */
  --dq-ink: #111111;
  --dq-muted: #4b5563;
  --dq-line: #d1d5db;
  --dq-surface: #ffffff;
  --dq-blue: #2563eb;
  --dq-green: #15803d;
  --dq-red: #b91c1c;
  --dq-gold: #a16207;
  /* Code terminal stays dark */
  --dq-code-bg: #0d1117;
  --dq-code-line: #30363d;
  --dq-comment: #9ca3af;
  --dq-key: #ff7b72;
  --dq-str: #a5d6ff;
  --dq-tag: #7ee787;
  width: 100%;
  max-width: 38rem;
  margin: 0 auto;
  padding: 0.85rem 0.9rem 1rem;
  border: 1px solid var(--dq-line);
  border-radius: 12px;
  background: var(--dq-surface);
  color: var(--dq-ink);
  box-shadow: 0 6px 20px rgba(17, 17, 17, 0.08);
  font-family: 'Space Grotesk', 'Space Grotesk fallback', Helvetica Neue, Arial, sans-serif;
}

:global(.insights-shell[data-mode='dark']) .dq {
  --dq-ink: #f3f3f3;
  --dq-muted: #a3a3a3;
  --dq-line: #2a2a2a;
  --dq-surface: #1a1a1a;
  --dq-blue: #4a9eff;
  --dq-green: #4ade80;
  --dq-red: #f87171;
  --dq-gold: #fbbf24;
}

.dq-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.dq-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--dq-ink);
}

.dq-sub {
  margin: 0.2rem 0 0;
  font-size: 0.72rem;
  color: var(--dq-muted);
}

.dq-stats {
  display: flex;
  gap: 0.4rem;
}

.dq-stat {
  min-width: 3.4rem;
  text-align: center;
  border: 1px solid var(--dq-line);
  border-radius: 8px;
  background: color-mix(in srgb, var(--dq-blue) 6%, var(--dq-surface));
  padding: 0.35rem 0.5rem;
}

.dq-stat-label {
  display: block;
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--dq-muted);
}

.dq-stat-value {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--dq-ink);
}

.dq-progress {
  height: 5px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--dq-ink) 10%, transparent);
  overflow: hidden;
  margin-bottom: 0.85rem;
}

.dq-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b7cff, #4a9eff);
  transition: width 0.4s ease;
}

.dq-levels {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}

.dq-level-btn {
  border: 1px solid var(--dq-line);
  background: var(--dq-surface);
  color: var(--dq-ink);
  border-radius: 999px;
  padding: 0.28rem 0.6rem;
  font-size: 0.68rem;
  font-weight: 700;
  cursor: pointer;
}

.dq-level-btn.is-active {
  border-color: var(--dq-blue);
  color: var(--dq-blue);
  background: color-mix(in srgb, var(--dq-blue) 10%, var(--dq-surface));
}

.dq-level-btn.is-done {
  border-color: var(--dq-green);
}

.dq-continue {
  display: flex;
  justify-content: center;
  margin-top: 0.65rem;
}

.dq-continue-note {
  margin: 0;
  font-size: 0.72rem;
  color: var(--dq-muted);
  text-align: center;
}

.dq-level-head {
  border: 1px solid var(--dq-line);
  border-radius: 10px;
  background: color-mix(in srgb, var(--dq-blue) 5%, var(--dq-surface));
  padding: 0.7rem 0.85rem;
  margin-bottom: 0.75rem;
}

.dq-level-head h3 {
  margin: 0;
  font-size: 0.95rem;
  color: var(--dq-ink);
}

.dq-level-head p {
  margin: 0.25rem 0 0;
  font-size: 0.72rem;
  color: var(--dq-muted);
}

.dq-match {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
}

.dq-col-label {
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin: 0 0 0.4rem;
  font-weight: 700;
}

.dq-col-label.is-gold { color: var(--dq-gold); }
.dq-col-label.is-blue { color: var(--dq-blue); }

.dq-card {
  width: 100%;
  display: grid;
  justify-items: center;
  gap: 0.2rem;
  margin-bottom: 0.45rem;
  padding: 0.7rem 0.5rem;
  border-radius: 10px;
  border: 2px solid var(--dq-line);
  background: var(--dq-surface);
  color: var(--dq-ink);
  cursor: pointer;
  transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
}

.dq-card:hover {
  border-color: var(--dq-blue);
  transform: scale(1.02);
  box-shadow: 0 2px 10px rgba(17, 17, 17, 0.08);
}
.dq-card.is-selected {
  border-color: var(--dq-gold);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--dq-gold) 35%, transparent);
}
.dq-card.is-matched {
  opacity: 0.45;
  pointer-events: none;
  border-color: var(--dq-green);
}
.dq-card.is-wrong {
  border-color: var(--dq-red);
  animation: dq-shake 0.35s;
}

.dq-card-emoji { font-size: 1.4rem; line-height: 1; }
.dq-card-label { font-size: 0.78rem; font-weight: 700; color: var(--dq-ink); }

.dq-code {
  background: var(--dq-code-bg);
  border: 1px solid var(--dq-code-line);
  border-radius: 10px;
  padding: 0.75rem 0.85rem;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  line-height: 1.65;
  overflow-x: auto;
  color: #e6edf3;
}

.dq-code p { margin: 0; }
.dq-comment { color: var(--dq-comment); }
.dq-key { color: var(--dq-key); }
.dq-str { color: var(--dq-str); }
.dq-tag { color: var(--dq-tag); }
.dq-indent { padding-left: 1rem; }
.dq-indent2 { padding-left: 1.75rem; }
.dq-indent3 { padding-left: 2.5rem; }

.dq-tok {
  display: inline-block;
  padding: 0 0.3rem;
  border-radius: 4px;
  cursor: pointer;
}
.dq-tok.is-broken {
  background: rgba(255, 0, 0, 0.15);
  border: 1px dashed #e94560;
}
.dq-tok.is-fixed {
  background: rgba(46, 160, 67, 0.15);
  border: 1px solid #2ea043;
  color: #7ee787;
  cursor: default;
}

.dq-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  justify-content: center;
  margin-top: 0.75rem;
}

.dq-btn {
  border: 1px solid var(--dq-line);
  background: var(--dq-surface);
  color: var(--dq-ink);
  border-radius: 8px;
  padding: 0.45rem 0.75rem;
  font-size: 0.72rem;
  cursor: pointer;
}
.dq-btn:hover {
  border-color: var(--dq-blue);
  background: color-mix(in srgb, var(--dq-blue) 8%, var(--dq-surface));
}
.dq-btn-primary {
  border-color: var(--dq-blue);
  background: color-mix(in srgb, var(--dq-blue) 10%, var(--dq-surface));
  color: var(--dq-ink);
}
.dq-btn-success {
  border-color: var(--dq-green);
  background: color-mix(in srgb, var(--dq-green) 10%, var(--dq-surface));
}
.dq-btn-danger {
  border-color: var(--dq-red);
  background: color-mix(in srgb, var(--dq-red) 8%, var(--dq-surface));
}
.dq-btn code {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  color: var(--dq-blue);
}

.dq-hint {
  display: block;
  margin: 0.55rem auto 0;
  background: none;
  border: 0;
  color: var(--dq-muted);
  font-size: 0.68rem;
  cursor: pointer;
}
.dq-hint:hover { color: var(--dq-gold); }

.dq-order {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.4rem;
}

.dq-order-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--dq-surface);
  border: 2px solid var(--dq-line);
  border-radius: 8px;
  padding: 0.5rem 0.6rem;
}
.dq-order-item.is-ok {
  border-color: var(--dq-green);
  background: color-mix(in srgb, var(--dq-green) 8%, var(--dq-surface));
}
.dq-order-item.is-bad {
  border-color: var(--dq-red);
  background: color-mix(in srgb, var(--dq-red) 8%, var(--dq-surface));
}

.dq-order-btn {
  border: 1px solid var(--dq-line);
  background: transparent;
  color: var(--dq-ink);
  border-radius: 6px;
  width: 1.6rem;
  height: 1.6rem;
  cursor: pointer;
}
.dq-order-code {
  flex: 1;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  color: #b91c1c;
}
:global(.insights-shell[data-mode='dark']) .dq-order-code {
  color: #ff7b72;
}
.dq-order-desc {
  font-size: 0.65rem;
  color: var(--dq-muted);
}

.dq-missing {
  display: block;
  width: 100%;
  text-align: left;
  margin-top: 0.35rem;
  padding: 0.35rem 0.45rem;
  border: 0;
  border-radius: 4px;
  background: rgba(255, 0, 0, 0.12);
  color: #ff7b72;
  font: inherit;
  cursor: pointer;
}
.dq-missing.is-on {
  background: rgba(46, 160, 67, 0.12);
  cursor: default;
  color: #e6edf3;
}

.dq-input {
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 4px;
  color: #a5d6ff;
  padding: 0.15rem 0.35rem;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  width: 4.5rem;
}
.dq-input:focus {
  outline: none;
  border-color: #58a6ff;
}

.dq-feedback {
  text-align: center;
  margin-top: 0.7rem;
  min-height: 1.2rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--dq-ink);
}
.dq-feedback.is-success { color: var(--dq-green); }
.dq-feedback.is-error { color: var(--dq-red); }
.dq-feedback.is-hint { color: var(--dq-gold); }

.dq-victory {
  text-align: center;
  padding: 1.5rem 0.5rem 0.5rem;
  color: var(--dq-ink);
}
.dq-trophy {
  font-size: 2rem;
  margin: 0 0 0.4rem;
  color: var(--dq-gold);
}
.dq-victory h3 {
  margin: 0;
  color: var(--dq-ink);
  font-size: 1.35rem;
}
.dq-victory > p {
  color: var(--dq-muted);
}
.dq-victory-card {
  text-align: left;
  margin: 1rem auto;
  max-width: 22rem;
  border: 1px solid var(--dq-line);
  border-radius: 12px;
  background: color-mix(in srgb, var(--dq-blue) 5%, var(--dq-surface));
  padding: 0.9rem 1rem;
  color: var(--dq-ink);
}
.dq-final {
  text-align: center;
  font-weight: 800;
  color: var(--dq-ink);
  margin: 0 0 0.6rem;
}
.dq-victory-card ul {
  margin: 0;
  padding-left: 1.1rem;
  font-size: 0.78rem;
  line-height: 1.55;
  color: var(--dq-ink);
}
.dq-victory-card code {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  color: var(--dq-blue);
}

@keyframes dq-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@media (max-width: 520px) {
  .dq-match { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .dq-card.is-wrong { animation: none; }
  .dq-progress-fill { transition: none; }
}
</style>
