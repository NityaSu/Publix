<script setup lang="ts">
type TabId = 'port' | 'compose' | 'dockerfile';
type PortMode = 'no' | 'yes' | null;
type PersonState = 'idle' | 'arrived' | 'inside' | 'rejected';

const activeTab = ref<TabId>('port');

const timers: ReturnType<typeof setTimeout>[] = [];
const intervals: ReturnType<typeof setInterval>[] = [];

function later(fn: () => void, ms: number) {
  const id = setTimeout(fn, ms);
  timers.push(id);
  return id;
}

function every(fn: () => void, ms: number) {
  const id = setInterval(fn, ms);
  intervals.push(id);
  return id;
}

function clearTimers() {
  while (timers.length) clearTimeout(timers.pop()!);
  while (intervals.length) clearInterval(intervals.pop()!);
}

onUnmounted(() => clearTimers());

const tabs = [
  { id: 'port' as const, label: 'Port mapping' },
  { id: 'compose' as const, label: 'Compose' },
  { id: 'dockerfile' as const, label: 'Dockerfile' },
];

function switchTab(tab: TabId) {
  clearTimers();
  activeTab.value = tab;
}

// --- Port mapping ---
const pmMode = ref<PortMode>(null);
const pmPerson = ref<PersonState>('idle');
const pmDoorOpen = ref(false);
const pmTunnel = ref(false);
const pmSendDisabled = ref(true);
const pmStoryTitle = ref('Choose a mode');
const pmStoryText = ref('Select Port mapped or No port map to see the difference.');
const pmReview = ref<string[]>([
  '<strong>Port mapping</strong> = <code>-p 8080:8080</code> opens a door from the host into the container.',
  '<strong>Left</strong> = host port (what the world sees). <strong>Right</strong> = container port (what the app uses).',
]);

function pmSetMode(mode: 'no' | 'yes') {
  clearTimers();
  pmMode.value = mode;
  pmPerson.value = 'idle';
  pmSendDisabled.value = false;

  if (mode === 'yes') {
    pmTunnel.value = true;
    pmDoorOpen.value = true;
    pmStoryTitle.value = 'Port mapping active: 8080:8080';
    pmStoryText.value =
      'The tunnel is built. Host door 8080 connects to container door 8080. Knock on the host — Docker routes you through the tunnel.';
    pmReview.value = [
      '<strong>Port mapping:</strong> <code>-p 8080:8080</code> creates a bridge.',
      '<strong>Host port 8080</strong> = door the world knocks on.',
      '<strong>Container port 8080</strong> = door the app listens on inside.',
      '<strong>Result:</strong> <code>http://localhost:8080</code> reaches the app.',
    ];
  } else {
    pmTunnel.value = false;
    pmDoorOpen.value = false;
    pmStoryTitle.value = 'No port mapping';
    pmStoryText.value =
      'No tunnel. The container has port 8080 inside, but the host has no door open. Isolated — a room with no street entrance.';
    pmReview.value = [
      '<strong>No mapping:</strong> container is isolated from the outside.',
      '<strong>App runs</strong> on 8080 inside, but nothing outside can reach it.',
      '<strong>Result:</strong> <code>localhost:8080</code> → connection refused.',
      '<strong>Fix:</strong> <code>ports: ["8080:8080"]</code> in compose, or <code>-p 8080:8080</code>.',
    ];
  }
}

function pmSendRequest() {
  if (!pmMode.value || pmSendDisabled.value) return;
  pmSendDisabled.value = true;
  pmPerson.value = 'arrived';

  later(() => {
    if (pmMode.value === 'yes') {
      pmPerson.value = 'inside';
      pmStoryTitle.value = 'Request succeeded';
      pmStoryText.value =
        'Knock on host:8080 → Docker routes through the tunnel → container:8080 → app responds.';
      pmReview.value = [
        '<strong>Flow:</strong> Browser → host:8080 → Docker → container:8080 → app → response.',
        '<strong>Without mapping</strong> the app is invisible from outside.',
        '<strong>Command:</strong> <code>docker run -p 8080:8080 myapp</code> or compose <code>ports: ["8080:8080"]</code>.',
      ];
    } else {
      pmPerson.value = 'rejected';
      pmStoryTitle.value = 'Request rejected';
      pmStoryText.value =
        'Knock on 8080 — no host door is open. Connection refused. The container may be running, but it is invisible.';
      pmReview.value = [
        '<strong>Error:</strong> <code>Failed to connect to localhost port 8080: Connection refused</code>',
        '<strong>Why:</strong> container has 8080; host does not expose it.',
        '<strong>Fix:</strong> <code>-p 8080:8080</code> or compose <code>ports: ["8080:8080"]</code>.',
      ];
    }
  }, 2000);
}

function pmReset() {
  clearTimers();
  pmMode.value = null;
  pmPerson.value = 'idle';
  pmDoorOpen.value = false;
  pmTunnel.value = false;
  pmSendDisabled.value = true;
  pmStoryTitle.value = 'Choose a mode';
  pmStoryText.value = 'Select Port mapped or No port map to see the difference.';
  pmReview.value = [
    '<strong>Port mapping</strong> = <code>-p 8080:8080</code> opens a door from the host into the container.',
    '<strong>Left</strong> = host port (what the world sees). <strong>Right</strong> = container port (what the app uses).',
  ];
}

// --- Compose ---
const cpBusy = ref(false);
const cpStations = reactive({
  pg: false,
  app: false,
  redis: false,
  nginx: false,
  frontend: false,
});
const cpLines = reactive({ ln1: false, ln2: false, ln3: false, ln4: false });
const cpConductor = ref(false);
const cpStoryTitle = ref('Docker Compose');
const cpStoryText = ref(
  'Try Start one by one for the chaos, then docker-compose up for orchestration.',
);
const cpReview = ref<string[]>([
  '<strong>Docker Compose</strong> = one <code>docker-compose.yml</code> for services, networks, volumes.',
  '<strong>One command</strong> = <code>docker-compose up</code> starts the stack.',
  '<strong>Without it</strong> = many <code>docker run</code> commands, order, and flags by hand.',
]);

function cpClearScene() {
  Object.assign(cpStations, { pg: false, app: false, redis: false, nginx: false, frontend: false });
  Object.assign(cpLines, { ln1: false, ln2: false, ln3: false, ln4: false });
  cpConductor.value = false;
}

function cpManualStart() {
  clearTimers();
  cpClearScene();
  cpBusy.value = true;

  const order: (keyof typeof cpStations)[] = ['pg', 'app', 'redis', 'nginx', 'frontend'];
  const names = ['Postgres', 'Java App', 'Redis', 'Nginx', 'Frontend'];
  let i = 0;

  const tick = () => {
    if (i >= order.length) {
      clearTimers();
      cpBusy.value = false;
      cpStoryTitle.value = 'Manual start: chaos';
      cpStoryText.value =
        'Five containers started by hand. The app may crash if Postgres was not ready. Nginx may miss the frontend. Order, flags, and networks — all on you.';
      cpReview.value = [
        '<strong>Manual:</strong> separate <code>docker run</code> per service.',
        '<strong>Order matters</strong> — app crashes if DB is not ready.',
        '<strong>Networks</strong> must be created and linked by hand.',
        '<strong>Env vars</strong> typed by hand invite typos.',
      ];
      return;
    }
    cpStations[order[i]] = true;
    cpStoryTitle.value = 'Starting…';
    cpStoryText.value = `Manually starting ${names[i]} — full docker run with flags.`;
    i++;
  };

  tick();
  every(tick, 800);
}

function cpOrchestrate() {
  clearTimers();
  cpClearScene();
  cpBusy.value = true;
  cpConductor.value = true;

  later(() => {
    const order: (keyof typeof cpStations)[] = ['pg', 'app', 'redis', 'nginx', 'frontend'];
    order.forEach((key, idx) => {
      later(() => {
        cpStations[key] = true;
      }, idx * 400);
    });

    (['ln1', 'ln2', 'ln3', 'ln4'] as const).forEach((key, idx) => {
      later(() => {
        cpLines[key] = true;
      }, 2000 + idx * 200);
    });

    later(() => {
      cpBusy.value = false;
      cpStoryTitle.value = 'Orchestration';
      cpStoryText.value =
        'One command: docker-compose up. Compose reads the file and starts services with networks, volumes, and env — linked by name.';
      cpReview.value = [
        '<strong>docker-compose.yml</strong> defines the whole stack.',
        '<strong>Command:</strong> <code>docker-compose up --build</code>.',
        '<strong>Order:</strong> <code>depends_on</code> (and healthchecks) wait for deps.',
        '<strong>Network:</strong> services talk by service name.',
      ];
    }, 3500);
  }, 600);
}

function cpReset() {
  clearTimers();
  cpBusy.value = false;
  cpClearScene();
  cpStoryTitle.value = 'Docker Compose';
  cpStoryText.value =
    'Try Start one by one for the chaos, then docker-compose up for orchestration.';
  cpReview.value = [
    '<strong>Docker Compose</strong> = one <code>docker-compose.yml</code> for services, networks, volumes.',
    '<strong>One command</strong> = <code>docker-compose up</code> starts the stack.',
    '<strong>Without it</strong> = many <code>docker run</code> commands, order, and flags by hand.',
  ];
}

// --- Dockerfile ---
const dfSteps = [
  { instr: 'FROM eclipse-temurin:17-jdk-alpine', label: 'Base image', emoji: '📦' },
  { instr: 'WORKDIR /app', label: 'Set folder', emoji: '📁' },
  { instr: 'COPY . .', label: 'Copy code', emoji: '📂' },
  { instr: 'RUN ./mvnw package', label: 'Build app', emoji: '🔧' },
  { instr: 'EXPOSE 8080', label: 'Open port', emoji: '🚪' },
  { instr: 'CMD ["java","-jar","app.jar"]', label: 'Start app', emoji: '▶️' },
] as const;

const dfStep = ref(0);
const dfBusy = ref(false);
const dfShowInstr = ref(false);
const dfInstr = ref(dfSteps[0].instr);
const dfLabel = ref(dfSteps[0].label);
const dfEmoji = ref(dfSteps[0].emoji);
const dfCakeLeft = ref('-3.5rem');
const dfHighlight = ref(-1);
const dfFinal = ref(false);
const dfStoryTitle = ref('Dockerfile');
const dfStoryText = ref('Click docker build to watch each instruction add a layer.');
const dfReview = ref<string[]>([
  '<strong>Dockerfile</strong> = recipe of instructions that build an image.',
  '<strong>Each line</strong> creates a layer. Change line 5 → layers 1–4 stay cached.',
  '<strong>Keys:</strong> <code>FROM</code>, <code>COPY</code>, <code>RUN</code>, <code>EXPOSE</code>, <code>CMD</code>.',
]);

const dfStationHighlight = computed(() => {
  // Map steps to station index: FROM, COPY, RUN, EXPOSE
  const map = [0, 1, 1, 2, 3, 3];
  return dfHighlight.value >= 0 ? map[dfHighlight.value] ?? -1 : -1;
});

function dfBuild() {
  if (dfStep.value >= dfSteps.length || dfBusy.value) return;
  dfBusy.value = true;

  const step = dfSteps[dfStep.value];
  dfInstr.value = step.instr;
  dfShowInstr.value = true;
  dfLabel.value = step.label;
  dfEmoji.value = step.emoji;
  dfHighlight.value = dfStep.value;

  const positions = ['3.5rem', '8.5rem', '13.5rem', '18.5rem', '23.5rem', '28.5rem'];
  dfCakeLeft.value = positions[dfStep.value];

  dfStoryTitle.value = `Building layer ${dfStep.value + 1}`;
  dfStoryText.value = `Executing: ${step.instr}. This adds a new layer on top of the previous ones.`;

  dfStep.value += 1;

  if (dfStep.value >= dfSteps.length) {
    later(() => {
      dfFinal.value = true;
      dfShowInstr.value = false;
      dfBusy.value = false;
      dfStoryTitle.value = 'Image built';
      dfStoryText.value =
        'Each instruction added a layer. Change code (COPY) and only that layer onward rebuilds — earlier layers stay cached.';
      dfReview.value = [
        '<strong>FROM:</strong> base image with the runtime.',
        '<strong>WORKDIR + COPY:</strong> your code in the image.',
        '<strong>RUN:</strong> build / install steps.',
        '<strong>EXPOSE:</strong> documents the port.',
        '<strong>CMD:</strong> default start command.',
        '<strong>Cache:</strong> change code → rebuild from COPY onward; base stays instant.',
      ];
    }, 1500);
  } else {
    later(() => {
      dfBusy.value = false;
      later(() => {
        dfCakeLeft.value = '-3.5rem';
        dfShowInstr.value = false;
      }, 100);
    }, 1800);
  }
}

function dfReset() {
  clearTimers();
  dfStep.value = 0;
  dfBusy.value = false;
  dfShowInstr.value = false;
  dfInstr.value = dfSteps[0].instr;
  dfLabel.value = dfSteps[0].label;
  dfEmoji.value = dfSteps[0].emoji;
  dfCakeLeft.value = '-3.5rem';
  dfHighlight.value = -1;
  dfFinal.value = false;
  dfStoryTitle.value = 'Dockerfile';
  dfStoryText.value = 'Click docker build to watch each instruction add a layer.';
  dfReview.value = [
    '<strong>Dockerfile</strong> = recipe of instructions that build an image.',
    '<strong>Each line</strong> creates a layer. Change line 5 → layers 1–4 stay cached.',
    '<strong>Keys:</strong> <code>FROM</code>, <code>COPY</code>, <code>RUN</code>, <code>EXPOSE</code>, <code>CMD</code>.',
  ];
}
</script>

<template>
  <div class="dcp" aria-label="Docker Concepts Playground">
    <header class="dcp-header">
      <div>
        <h2 class="dcp-title">Docker Concepts Playground</h2>
        <p class="dcp-sub">Port mapping, Compose, and Dockerfile — three visual drills.</p>
      </div>
    </header>

    <nav class="dcp-tabs" aria-label="Concept games">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="dcp-tab"
        :class="{ 'is-active': activeTab === tab.id }"
        @click="switchTab(tab.id)"
      >
        {{ tab.label }}
      </button>
    </nav>

    <!-- Port mapping -->
    <div v-show="activeTab === 'port'" class="dcp-panel">
      <nav class="dcp-modes" aria-label="Port mapping mode">
        <button
          type="button"
          class="dcp-mode"
          :class="{ 'is-active': pmMode === 'no' }"
          @click="pmSetMode('no')"
        >
          No port map
        </button>
        <button
          type="button"
          class="dcp-mode"
          :class="{ 'is-active': pmMode === 'yes' }"
          @click="pmSetMode('yes')"
        >
          Port mapped
        </button>
      </nav>

      <div class="dcp-scene dcp-scene-port" aria-hidden="true">
        <div class="pm-host">
          <div class="pm-label">host</div>
          <div class="pm-door" :class="{ open: pmDoorOpen, closed: !pmDoorOpen }">8080</div>
        </div>

        <div class="pm-tunnel" :class="{ connected: pmTunnel }">
          <span v-if="pmTunnel" class="pm-tunnel-label">8080:8080</span>
        </div>

        <div class="pm-container">
          <div class="pm-label">container</div>
          <div class="pm-inner-door">8080</div>
        </div>

        <div
          class="pm-person"
          :class="{
            arrived: pmPerson === 'arrived',
            inside: pmPerson === 'inside',
            rejected: pmPerson === 'rejected',
          }"
        >
          🧑‍💻
        </div>

        <span class="pm-caption pm-caption-host">host port</span>
        <span class="pm-caption pm-caption-ctr">container port</span>
      </div>

      <div class="dcp-controls">
        <button
          type="button"
          class="dcp-btn dcp-btn-primary"
          :disabled="pmSendDisabled"
          @click="pmSendRequest"
        >
          Send request
        </button>
        <button type="button" class="dcp-btn" @click="pmReset">Reset</button>
      </div>

      <div class="dcp-story">
        <h4>{{ pmStoryTitle }}</h4>
        <p>{{ pmStoryText }}</p>
      </div>

      <div class="dcp-notes">
        <h4>Maps to Docker</h4>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-for="(card, i) in pmReview" :key="i" class="dcp-note" v-html="card" />
      </div>
    </div>

    <!-- Compose -->
    <div v-show="activeTab === 'compose'" class="dcp-panel">
      <div class="dcp-scene dcp-scene-compose" aria-hidden="true">
        <div class="cp-station cp-pg" :class="{ active: cpStations.pg }">
          <span>🐘</span>
          <span class="cp-st-label">postgres</span>
        </div>
        <div class="cp-station cp-app" :class="{ active: cpStations.app }">
          <span>🚀</span>
          <span class="cp-st-label">app</span>
        </div>
        <div class="cp-station cp-redis" :class="{ active: cpStations.redis }">
          <span>⚡</span>
          <span class="cp-st-label">redis</span>
        </div>
        <div class="cp-station cp-nginx" :class="{ active: cpStations.nginx }">
          <span>🌐</span>
          <span class="cp-st-label">nginx</span>
        </div>
        <div class="cp-station cp-frontend" :class="{ active: cpStations.frontend }">
          <span>🎨</span>
          <span class="cp-st-label">frontend</span>
        </div>

        <div class="cp-line cp-ln1" :class="{ show: cpLines.ln1 }" />
        <div class="cp-line cp-ln2" :class="{ show: cpLines.ln2 }" />
        <div class="cp-line cp-ln3" :class="{ show: cpLines.ln3 }" />
        <div class="cp-line cp-ln4" :class="{ show: cpLines.ln4 }" />

        <div class="cp-conductor" :class="{ appear: cpConductor }">🧑‍🍳</div>
      </div>

      <div class="dcp-controls">
        <button
          type="button"
          class="dcp-btn dcp-btn-danger"
          :disabled="cpBusy"
          @click="cpManualStart"
        >
          Start one by one
        </button>
        <button
          type="button"
          class="dcp-btn dcp-btn-primary"
          :disabled="cpBusy"
          @click="cpOrchestrate"
        >
          docker-compose up
        </button>
        <button type="button" class="dcp-btn" @click="cpReset">Reset</button>
      </div>

      <div class="dcp-story">
        <h4>{{ cpStoryTitle }}</h4>
        <p>{{ cpStoryText }}</p>
      </div>

      <div class="dcp-notes">
        <h4>Maps to Docker</h4>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-for="(card, i) in cpReview" :key="i" class="dcp-note" v-html="card" />
      </div>
    </div>

    <!-- Dockerfile -->
    <div v-show="activeTab === 'dockerfile'" class="dcp-panel">
      <div class="dcp-scene dcp-scene-df" aria-hidden="true">
        <div class="df-instr" :class="{ show: dfShowInstr }">
          <code>{{ dfInstr }}</code>
        </div>

        <div
          v-for="(name, idx) in ['FROM', 'COPY', 'RUN', 'EXPOSE']"
          :key="name"
          class="df-station"
          :class="[`df-st-${idx}`, { highlight: dfStationHighlight === idx }]"
        >
          <span class="df-st-name">{{ name }}</span>
        </div>

        <div class="df-belt" />

        <div class="df-cake" :style="{ left: dfCakeLeft }">
          <span class="df-cake-label">{{ dfLabel }}</span>
          <span>{{ dfEmoji }}</span>
        </div>

        <div class="df-final" :class="{ show: dfFinal }">🍰</div>
      </div>

      <div class="dcp-controls">
        <button
          type="button"
          class="dcp-btn dcp-btn-primary"
          :disabled="dfBusy || dfStep >= dfSteps.length"
          @click="dfBuild"
        >
          docker build
        </button>
        <button type="button" class="dcp-btn" @click="dfReset">Reset</button>
      </div>

      <div class="dcp-story">
        <h4>{{ dfStoryTitle }}</h4>
        <p>{{ dfStoryText }}</p>
      </div>

      <div class="dcp-notes">
        <h4>Maps to Docker</h4>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-for="(card, i) in dfReview" :key="i" class="dcp-note" v-html="card" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dcp {
  --dv-ink: #111111;
  --dv-muted: #4b5563;
  --dv-line: #d1d5db;
  --dv-surface: #ffffff;
  --dv-blue: #2563eb;
  --dv-green: #15803d;
  --dv-red: #b91c1c;
  --dv-scene: #f3f4f6;
  --dv-block: #e5e7eb;
  width: 100%;
  max-width: 38rem;
  margin: 0 auto;
  padding: 0.85rem 0.9rem 1rem;
  border: 1px solid var(--dv-line);
  border-radius: 12px;
  background: var(--dv-surface);
  color: var(--dv-ink);
  box-shadow: 0 6px 20px rgba(17, 17, 17, 0.08);
  font-family: 'Space Grotesk', 'Space Grotesk fallback', Helvetica Neue, Arial, sans-serif;
}

:global(.insights-shell[data-mode='dark']) .dcp {
  --dv-ink: #f3f3f3;
  --dv-muted: #a3a3a3;
  --dv-line: #2a2a2a;
  --dv-surface: #1a1a1a;
  --dv-blue: #4a9eff;
  --dv-green: #4ade80;
  --dv-red: #f87171;
  --dv-scene: #121820;
  --dv-block: #1e2630;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
}

.dcp-header {
  margin-bottom: 0.75rem;
}

.dcp-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--dv-ink);
}

.dcp-sub {
  margin: 0.2rem 0 0;
  font-size: 0.72rem;
  color: var(--dv-muted);
  line-height: 1.4;
}

.dcp-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}

.dcp-tab {
  border: 1px solid var(--dv-line);
  background: var(--dv-surface);
  color: var(--dv-ink);
  border-radius: 999px;
  padding: 0.28rem 0.7rem;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}

.dcp-tab:hover {
  border-color: var(--dv-blue);
}

.dcp-tab.is-active {
  border-color: var(--dv-blue);
  color: var(--dv-blue);
  background: color-mix(in srgb, var(--dv-blue) 10%, var(--dv-surface));
}

.dcp-modes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.65rem;
}

.dcp-mode {
  border: 1px solid var(--dv-line);
  background: var(--dv-surface);
  color: var(--dv-ink);
  border-radius: 999px;
  padding: 0.28rem 0.75rem;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}

.dcp-mode.is-active {
  border-color: var(--dv-blue);
  color: var(--dv-blue);
  background: color-mix(in srgb, var(--dv-blue) 10%, var(--dv-surface));
}

.dcp-scene {
  position: relative;
  height: 260px;
  overflow: hidden;
  border: 1px solid var(--dv-line);
  border-radius: 10px;
  background: var(--dv-scene);
  margin-bottom: 0.65rem;
}

/* Port scene */
.pm-host {
  position: absolute;
  left: 1.1rem;
  top: 2.8rem;
  width: 7.5rem;
  height: 9.5rem;
  border: 1px solid var(--dv-line);
  border-radius: 10px;
  background: color-mix(in srgb, var(--dv-muted) 12%, var(--dv-surface));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 0.75rem;
  z-index: 5;
}

.pm-container {
  position: absolute;
  right: 1.4rem;
  top: 3.4rem;
  width: 7rem;
  height: 7.5rem;
  border: 1px solid var(--dv-blue);
  border-radius: 10px;
  background: color-mix(in srgb, var(--dv-blue) 12%, var(--dv-surface));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

.pm-label {
  position: absolute;
  top: 0.45rem;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 600;
  color: var(--dv-muted);
  letter-spacing: 0.04em;
}

.pm-door,
.pm-inner-door {
  width: 2.6rem;
  height: 3rem;
  border-radius: 1.2rem 1.2rem 0.2rem 0.2rem;
  border: 1px solid var(--dv-line);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.65rem;
  font-weight: 700;
}

.pm-door.closed {
  background: color-mix(in srgb, var(--dv-red) 18%, var(--dv-surface));
  border-color: color-mix(in srgb, var(--dv-red) 50%, var(--dv-line));
  color: var(--dv-red);
}

.pm-door.open {
  background: color-mix(in srgb, var(--dv-green) 18%, var(--dv-surface));
  border-color: color-mix(in srgb, var(--dv-green) 50%, var(--dv-line));
  color: var(--dv-green);
}

.pm-inner-door {
  margin-top: 0.5rem;
  background: color-mix(in srgb, var(--dv-blue) 15%, var(--dv-surface));
  border-color: color-mix(in srgb, var(--dv-blue) 45%, var(--dv-line));
  color: var(--dv-blue);
}

.pm-tunnel {
  position: absolute;
  left: 8.7rem;
  top: 7.2rem;
  width: 0;
  height: 1.1rem;
  border: 1px solid transparent;
  border-radius: 6px;
  background: color-mix(in srgb, var(--dv-blue) 25%, var(--dv-surface));
  transition: width 0.9s ease-out;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.pm-tunnel.connected {
  width: 7.5rem;
  border-color: color-mix(in srgb, var(--dv-blue) 40%, var(--dv-line));
}

.pm-tunnel-label {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.58rem;
  font-weight: 700;
  color: var(--dv-blue);
  white-space: nowrap;
}

.pm-person {
  position: absolute;
  left: -2.5rem;
  top: 7.4rem;
  font-size: 1.7rem;
  transition: left 1.8s ease-in-out;
  z-index: 10;
}

.pm-person.arrived {
  left: 3.4rem;
}

.pm-person.inside {
  left: 16rem;
}

.pm-person.rejected {
  left: 3.6rem;
  animation: dcp-shake 0.45s infinite;
}

@keyframes dcp-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}

.pm-caption {
  position: absolute;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.58rem;
  color: var(--dv-muted);
  border: 1px solid var(--dv-line);
  border-radius: 6px;
  padding: 0.12rem 0.35rem;
  background: color-mix(in srgb, var(--dv-surface) 90%, transparent);
}

.pm-caption-host {
  left: 2.4rem;
  bottom: 0.7rem;
}

.pm-caption-ctr {
  right: 2.2rem;
  bottom: 0.7rem;
}

/* Compose scene */
.cp-station {
  position: absolute;
  width: 4.6rem;
  height: 4.6rem;
  border-radius: 10px;
  border: 1px solid var(--dv-line);
  background: var(--dv-block);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
  font-size: 1.35rem;
  opacity: 0.35;
  transform: scale(0.92);
  transition: opacity 0.4s, transform 0.4s, border-color 0.3s;
  z-index: 3;
}

.cp-station.active {
  opacity: 1;
  transform: scale(1);
  border-color: var(--dv-blue);
  background: color-mix(in srgb, var(--dv-blue) 8%, var(--dv-surface));
}

.cp-st-label {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.55rem;
  font-weight: 700;
  color: var(--dv-muted);
  letter-spacing: 0.02em;
}

.cp-pg {
  left: 8%;
  top: 12%;
}
.cp-app {
  left: 38%;
  top: 12%;
}
.cp-redis {
  left: 68%;
  top: 12%;
}
.cp-nginx {
  left: 22%;
  top: 48%;
}
.cp-frontend {
  left: 54%;
  top: 48%;
}

.cp-line {
  position: absolute;
  height: 2px;
  background: color-mix(in srgb, var(--dv-blue) 55%, var(--dv-line));
  opacity: 0;
  transition: opacity 0.4s;
  z-index: 1;
}

.cp-line.show {
  opacity: 1;
}

.cp-ln1 {
  left: 20%;
  top: 24%;
  width: 18%;
}
.cp-ln2 {
  left: 50%;
  top: 24%;
  width: 18%;
}
.cp-ln3 {
  left: 34%;
  top: 36%;
  width: 2px;
  height: 12%;
}
.cp-ln4 {
  left: 64%;
  top: 36%;
  width: 2px;
  height: 12%;
}

.cp-conductor {
  position: absolute;
  left: 50%;
  bottom: 0.6rem;
  transform: translateX(-50%) translateY(0.8rem);
  font-size: 2.4rem;
  opacity: 0;
  transition: all 0.7s;
  z-index: 5;
}

.cp-conductor.appear {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* Dockerfile scene */
.df-instr {
  position: absolute;
  top: 0.7rem;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.35s;
  z-index: 8;
  border: 1px solid var(--dv-line);
  border-radius: 8px;
  background: color-mix(in srgb, var(--dv-ink) 92%, transparent);
  padding: 0.3rem 0.65rem;
  max-width: 92%;
}

.df-instr.show {
  opacity: 1;
}

.df-instr code {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.65rem;
  color: var(--dv-green);
  white-space: nowrap;
}

.df-station {
  position: absolute;
  top: 3.2rem;
  width: 3.6rem;
  height: 3.2rem;
  border-radius: 8px;
  border: 1px solid var(--dv-line);
  background: var(--dv-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 6;
  transition: transform 0.25s, border-color 0.25s;
}

.df-station.highlight {
  transform: scale(1.12);
  border-color: var(--dv-blue);
  background: color-mix(in srgb, var(--dv-blue) 10%, var(--dv-surface));
}

.df-st-name {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.55rem;
  font-weight: 700;
  color: var(--dv-muted);
}

.df-st-0 {
  left: 14%;
}
.df-st-1 {
  left: 34%;
}
.df-st-2 {
  left: 54%;
}
.df-st-3 {
  left: 74%;
}

.df-belt {
  position: absolute;
  left: 0.75rem;
  right: 0.75rem;
  top: 10.2rem;
  height: 1.6rem;
  border: 1px solid var(--dv-line);
  border-radius: 6px;
  background: color-mix(in srgb, var(--dv-muted) 18%, var(--dv-surface));
  z-index: 4;
}

.df-belt::after {
  content: '';
  position: absolute;
  inset: 45% 0 auto;
  height: 2px;
  background: repeating-linear-gradient(
    90deg,
    color-mix(in srgb, var(--dv-muted) 45%, transparent) 0 12px,
    transparent 12px 20px
  );
}

.df-cake {
  position: absolute;
  top: 7.4rem;
  width: 2.8rem;
  height: 2.8rem;
  border: 1px solid var(--dv-line);
  border-radius: 8px;
  background: var(--dv-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  transition: left 1.6s ease-in-out;
  z-index: 7;
}

.df-cake-label {
  position: absolute;
  top: -1.15rem;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.52rem;
  font-weight: 700;
  color: var(--dv-muted);
  white-space: nowrap;
}

.df-final {
  position: absolute;
  right: 1rem;
  top: 6.5rem;
  font-size: 2.8rem;
  opacity: 0;
  transform: scale(0.6);
  transition: all 0.7s;
  z-index: 8;
}

.df-final.show {
  opacity: 1;
  transform: scale(1);
}

.dcp-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
  margin-bottom: 0.65rem;
}

.dcp-btn {
  border: 1px solid var(--dv-line);
  background: var(--dv-surface);
  color: var(--dv-ink);
  border-radius: 8px;
  padding: 0.45rem 0.75rem;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

.dcp-btn:hover:not(:disabled) {
  border-color: var(--dv-blue);
  background: color-mix(in srgb, var(--dv-blue) 8%, var(--dv-surface));
}

.dcp-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.dcp-btn-primary {
  border-color: var(--dv-blue);
  background: color-mix(in srgb, var(--dv-blue) 10%, var(--dv-surface));
}

.dcp-btn-danger {
  border-color: var(--dv-red);
  background: color-mix(in srgb, var(--dv-red) 8%, var(--dv-surface));
}

.dcp-story {
  border: 1px solid var(--dv-line);
  border-radius: 10px;
  background: color-mix(in srgb, var(--dv-blue) 5%, var(--dv-surface));
  padding: 0.7rem 0.85rem;
  margin-bottom: 0.65rem;
  min-height: 3.4rem;
}

.dcp-story h4 {
  margin: 0 0 0.25rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--dv-ink);
}

.dcp-story p {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.5;
  color: var(--dv-muted);
}

.dcp-notes {
  border-top: 1px solid var(--dv-line);
  padding-top: 0.7rem;
}

.dcp-notes h4 {
  margin: 0 0 0.45rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--dv-muted);
}

.dcp-note {
  border: 1px solid var(--dv-line);
  border-radius: 8px;
  padding: 0.55rem 0.7rem;
  margin-bottom: 0.4rem;
  font-size: 0.72rem;
  line-height: 1.5;
  color: var(--dv-ink);
  background: color-mix(in srgb, var(--dv-ink) 2%, var(--dv-surface));
}

.dcp-note:last-child {
  margin-bottom: 0;
}

.dcp-note :deep(strong) {
  color: var(--dv-blue);
  font-weight: 700;
}

.dcp-note :deep(code) {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  color: var(--dv-blue);
}

@media (max-width: 520px) {
  .dcp-scene {
    height: 240px;
  }

  .pm-tunnel.connected {
    width: 5.5rem;
  }

  .pm-person.inside {
    left: 12.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pm-person.rejected {
    animation: none;
  }

  .pm-tunnel,
  .df-cake,
  .cp-station,
  .cp-conductor {
    transition: none;
  }
}
</style>
