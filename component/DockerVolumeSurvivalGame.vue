<script setup lang="ts">
type Mode = 'novol' | 'withvol' | null;

const currentMode = ref<Mode>(null);
const step = ref(0);
const shipSinking = ref(false);
const fireBurning = ref(false);
const notebookOpacity = ref(1);
const safeVisible = ref(false);
const safeGlow = ref(false);
const safePulse = ref(false);
const ropeExtended = ref(false);
const newShipArrived = ref(false);
const treasureShow = ref(false);
const burnDisabled = ref(true);
const launchDisabled = ref(true);

const storyTitle = ref('Story');
const storyText = ref('Pick a mode above to start.');
const reviewCards = ref<string[]>([
  '<strong>Container</strong> = temporary, isolated. Like a ship that can sink.',
  '<strong>Volume</strong> = persistent storage on the host. Like a safe on the ocean floor.',
  '<strong>Commands:</strong> <code>docker run</code> launches a ship. <code>docker rm</code> sinks it.',
]);

const timers: ReturnType<typeof setTimeout>[] = [];

function later(fn: () => void, ms: number) {
  const id = setTimeout(fn, ms);
  timers.push(id);
  return id;
}

function clearTimers() {
  while (timers.length) {
    clearTimeout(timers.pop()!);
  }
}

function setStory(title: string, text: string) {
  storyTitle.value = title;
  storyText.value = text;
}

function updateReview(cards: string[]) {
  reviewCards.value = cards;
}

function resetVisuals() {
  shipSinking.value = false;
  fireBurning.value = false;
  notebookOpacity.value = 1;
  safeVisible.value = false;
  safeGlow.value = false;
  safePulse.value = false;
  ropeExtended.value = false;
  newShipArrived.value = false;
  treasureShow.value = false;
}

function setMode(mode: 'novol' | 'withvol') {
  clearTimers();
  currentMode.value = mode;
  step.value = 1;
  resetVisuals();

  burnDisabled.value = false;
  launchDisabled.value = true;

  if (mode === 'novol') {
    setStory(
      'Without a volume',
      'The ship (container) carries the notebook (data) on deck. No safe. If the ship sinks, the notebook sinks with it.',
    );
    updateReview([
      '<strong>No volume:</strong> Data lives inside the container. When the container dies, data dies.',
      '<strong>Real command:</strong> <code>docker-compose down</code> → container deleted → database files gone.',
      '<strong>Result:</strong> Alice and Bob lose everything.',
    ]);
  } else {
    safeVisible.value = true;
    safeGlow.value = true;
    ropeExtended.value = true;
    setStory(
      'With a volume',
      'The ship reads and writes through a rope to a waterproof safe (volume: pgdata) on the ocean floor. The safe is separate from the ship.',
    );
    updateReview([
      '<strong>With volume:</strong> Data lives outside the container, on your real disk.',
      '<strong>Real command:</strong> <code>docker-compose down</code> → container deleted → volume folder stays.',
      '<strong>Result:</strong> Ship sinks; safe remains. A new ship can reconnect.',
    ]);
  }
}

function burnShip() {
  if (!currentMode.value || burnDisabled.value) return;
  step.value = 2;
  burnDisabled.value = true;
  fireBurning.value = true;

  later(() => {
    shipSinking.value = true;

    if (currentMode.value === 'withvol') {
      notebookOpacity.value = 0;
      later(() => {
        safePulse.value = true;
        later(() => {
          safePulse.value = false;
        }, 300);
      }, 800);
    }
  }, 1500);

  later(() => {
    launchDisabled.value = false;

    if (currentMode.value === 'novol') {
      setStory(
        'All data lost',
        'The ship burned and sank. The notebook was on the deck — it sank too. No backup. Alice and Bob’s history is gone.',
      );
      updateReview([
        '<strong>What happened:</strong> <code>docker-compose down</code> removed the container.',
        '<strong>Where was the data?</strong> Inside <code>/var/lib/postgresql/data</code> in the container.',
        '<strong>Problem:</strong> Containers are meant to be destroyed and rebuilt. Data should never live only inside them.',
        '<strong>Moral:</strong> Never run a database in Docker without a volume.',
      ]);
    } else {
      setStory(
        'Ship gone — data stays',
        'The ship burned and sank. The notebook was never on it — it was in the safe (volume: pgdata). The rope snapped; the safe is untouched.',
      );
      updateReview([
        '<strong>What happened:</strong> <code>docker-compose down</code> removed the container.',
        '<strong>Where was the data?</strong> On your machine: <code>/var/lib/docker/volumes/pgdata/_data/</code>',
        '<strong>Why:</strong> The container was borrowing that folder. Deleting the borrower does not delete the owner.',
        '<strong>Next:</strong> Launch a new container. It reconnects to the same safe.',
      ]);
    }
  }, 3500);
}

function launchNewShip() {
  if (!currentMode.value || launchDisabled.value) return;
  step.value = 3;
  launchDisabled.value = true;
  newShipArrived.value = true;

  if (currentMode.value === 'novol') {
    later(() => {
      setStory(
        'New ship — empty',
        'A fresh container arrived with no notebook. You start from zero. That is a rebuild without a volume.',
      );
      updateReview([
        '<strong>New container:</strong> Fresh, clean, empty.',
        '<strong>Old data:</strong> Gone.',
        '<strong>Real world:</strong> <code>docker-compose up --build</code> and the database is empty.',
        '<strong>Fix:</strong> Add <code>volumes: pgdata:/var/lib/postgresql/data</code> to compose.',
      ]);
    }, 1600);
  } else {
    later(() => {
      treasureShow.value = true;
      ropeExtended.value = false;
      later(() => {
        safeGlow.value = false;
      }, 500);
    }, 1600);

    later(() => {
      setStory(
        'Data survived',
        'The new ship connected to the same underwater safe. Notebook retrieved. Alice still has $70. Bob still has $80.',
      );
      updateReview([
        '<strong>New container:</strong> Fresh ship, same volume.',
        '<strong>Data:</strong> Instantly available — no restore needed.',
        '<strong>Real command:</strong> <code>docker-compose up --build</code> → new container → old volume reattached.',
        '<strong>Rule:</strong> Containers die. Volumes live until you delete them.',
      ]);
    }, 3000);
  }
}

function resetGame() {
  clearTimers();
  currentMode.value = null;
  step.value = 0;
  resetVisuals();
  burnDisabled.value = true;
  launchDisabled.value = true;
  setStory('Story', 'Pick a mode above to start.');
  updateReview([
    '<strong>Container</strong> = temporary, isolated. Like a ship that can sink.',
    '<strong>Volume</strong> = persistent storage on the host. Like a safe on the ocean floor.',
    '<strong>Commands:</strong> <code>docker run</code> launches a ship. <code>docker rm</code> sinks it.',
  ]);
}

onUnmounted(() => {
  clearTimers();
});
</script>

<template>
  <div class="dvsg" aria-label="Why Docker Volumes Matter">
    <header class="dvsg-header">
      <div>
        <h2 class="dvsg-title">Why Docker Volumes Matter</h2>
        <p class="dvsg-sub">Burn the ship. See whether the data sinks — or lives in the volume.</p>
      </div>
      <div class="dvsg-stat" aria-label="Current step">
        <span class="dvsg-stat-label">Step</span>
        <span class="dvsg-stat-value">{{ step }}</span>
      </div>
    </header>

    <nav class="dvsg-modes" aria-label="Choose mode">
      <button
        type="button"
        class="dvsg-mode"
        :class="{ 'is-active': currentMode === 'novol' }"
        @click="setMode('novol')"
      >
        Without volume
      </button>
      <button
        type="button"
        class="dvsg-mode"
        :class="{ 'is-active': currentMode === 'withvol' }"
        @click="setMode('withvol')"
      >
        With volume
      </button>
    </nav>

    <div class="dvsg-scene" aria-hidden="true">
      <div class="dvsg-sky">
        <span class="dvsg-haze" />
        <span class="dvsg-haze dvsg-haze-2" />
      </div>

      <div class="ship-wrapper" :class="{ sinking: shipSinking }">
        <div class="ship-body">🚢</div>
        <div class="notebook" :style="{ opacity: notebookOpacity }">📓</div>
        <div class="fire" :class="{ burning: fireBurning }">🔥</div>
        <div class="label-tag ship-label">container: my-app</div>
      </div>

      <div
        class="safe-box"
        :class="{ visible: safeVisible, glow: safeGlow, pulse: safePulse }"
      >
        🏦
        <div class="label-tag safe-label">volume: pgdata</div>
      </div>
      <div class="rope" :class="{ extended: ropeExtended }" />

      <div class="new-ship" :class="{ arrived: newShipArrived }">
        🚢
        <div class="label-tag ship-label" style="top: -2.6rem">container: new</div>
      </div>
      <div class="treasure-retrieved" :class="{ show: treasureShow }">📓</div>

      <div class="dvsg-water">
        <div class="dvsg-water-line" />
      </div>
    </div>

    <div class="dvsg-story">
      <h4>{{ storyTitle }}</h4>
      <p>{{ storyText }}</p>
    </div>

    <div class="dvsg-controls">
      <button
        type="button"
        class="dvsg-btn dvsg-btn-danger"
        :disabled="burnDisabled"
        @click="burnShip"
      >
        Burn ship
      </button>
      <button
        type="button"
        class="dvsg-btn dvsg-btn-primary"
        :disabled="launchDisabled"
        @click="launchNewShip"
      >
        Launch new ship
      </button>
      <button type="button" class="dvsg-btn" @click="resetGame">Reset</button>
    </div>

    <div class="dvsg-notes">
      <h4>Maps to Docker</h4>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div
        v-for="(card, i) in reviewCards"
        :key="i"
        class="dvsg-note"
        v-html="card"
      />
    </div>
  </div>
</template>

<style scoped>
.dvsg {
  --dv-ink: #111111;
  --dv-muted: #4b5563;
  --dv-line: #d1d5db;
  --dv-surface: #ffffff;
  --dv-blue: #2563eb;
  --dv-green: #15803d;
  --dv-red: #b91c1c;
  --dv-sky: #e8eef6;
  --dv-water: #c5d4e8;
  --dv-water-deep: #8fa8c9;
  --dv-haze: rgba(255, 255, 255, 0.55);
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

:global(.insights-shell[data-mode='dark']) .dvsg {
  --dv-ink: #f3f3f3;
  --dv-muted: #a3a3a3;
  --dv-line: #2a2a2a;
  --dv-surface: #1a1a1a;
  --dv-blue: #4a9eff;
  --dv-green: #4ade80;
  --dv-red: #f87171;
  --dv-sky: #121820;
  --dv-water: #1a2433;
  --dv-water-deep: #243447;
  --dv-haze: rgba(255, 255, 255, 0.04);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
}

.dvsg-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.dvsg-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--dv-ink);
}

.dvsg-sub {
  margin: 0.2rem 0 0;
  font-size: 0.72rem;
  color: var(--dv-muted);
  line-height: 1.4;
}

.dvsg-stat {
  min-width: 3.4rem;
  text-align: center;
  border: 1px solid var(--dv-line);
  border-radius: 8px;
  background: color-mix(in srgb, var(--dv-blue) 6%, var(--dv-surface));
  padding: 0.35rem 0.5rem;
  flex-shrink: 0;
}

.dvsg-stat-label {
  display: block;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--dv-muted);
  font-weight: 700;
}

.dvsg-stat-value {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--dv-ink);
}

.dvsg-modes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.dvsg-mode {
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

.dvsg-mode:hover {
  border-color: var(--dv-blue);
}

.dvsg-mode.is-active {
  border-color: var(--dv-blue);
  color: var(--dv-blue);
  background: color-mix(in srgb, var(--dv-blue) 10%, var(--dv-surface));
}

.dvsg-scene {
  position: relative;
  height: 280px;
  overflow: hidden;
  border: 1px solid var(--dv-line);
  border-radius: 10px;
  background: var(--dv-sky);
  margin-bottom: 0.75rem;
}

.dvsg-sky {
  position: absolute;
  inset: 0 0 42% 0;
}

.dvsg-haze {
  position: absolute;
  width: 7rem;
  height: 2.2rem;
  border-radius: 999px;
  background: var(--dv-haze);
  top: 28px;
  left: 18%;
  opacity: 0.9;
}

.dvsg-haze-2 {
  width: 5rem;
  height: 1.6rem;
  top: 52px;
  left: auto;
  right: 16%;
  opacity: 0.7;
}

.dvsg-water {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 42%;
  background: linear-gradient(180deg, var(--dv-water), var(--dv-water-deep));
}

.dvsg-water-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: color-mix(in srgb, var(--dv-ink) 18%, transparent);
}

.ship-wrapper {
  position: absolute;
  left: 50%;
  bottom: 38%;
  transform: translateX(-50%);
  transition: transform 1.4s ease-in-out, opacity 1.4s ease-in-out;
  z-index: 10;
}

.ship-wrapper.sinking {
  transform: translateX(-50%) translateY(9rem) rotate(22deg);
  opacity: 0.25;
}

.ship-body {
  font-size: 4.5rem;
  line-height: 1;
  animation: dvsg-rock 4s ease-in-out infinite;
}

@keyframes dvsg-rock {
  0%,
  100% {
    transform: rotate(-2deg);
  }
  50% {
    transform: rotate(2deg);
  }
}

.ship-wrapper.sinking .ship-body {
  animation: none;
}

.notebook {
  position: absolute;
  top: -1.4rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.7rem;
  transition: opacity 1.2s ease, transform 1.2s ease;
  z-index: 11;
}

.ship-wrapper.sinking .notebook {
  transform: translateX(-50%) translateY(4rem);
  opacity: 0;
}

.fire {
  position: absolute;
  top: -0.85rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.85rem;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 12;
}

.fire.burning {
  opacity: 1;
}

.safe-box {
  position: absolute;
  left: 50%;
  bottom: 12%;
  transform: translateX(-50%) scale(0);
  font-size: 2.6rem;
  z-index: 8;
  transition: transform 0.7s ease-out, filter 0.4s;
}

.safe-box.visible {
  transform: translateX(-50%) scale(1);
}

.safe-box.glow {
  filter: drop-shadow(0 0 10px color-mix(in srgb, var(--dv-green) 55%, transparent));
}

.safe-box.pulse {
  transform: translateX(-50%) scale(1.08);
}

.rope {
  position: absolute;
  left: 50%;
  bottom: 28%;
  width: 2px;
  height: 0;
  background: color-mix(in srgb, var(--dv-muted) 70%, transparent);
  transform: translateX(-50%);
  transition: height 0.9s ease-out;
  z-index: 9;
}

.rope.extended {
  height: 3.4rem;
}

.new-ship {
  position: absolute;
  left: -5rem;
  bottom: 38%;
  font-size: 4.5rem;
  line-height: 1;
  z-index: 10;
  transition: left 1.4s ease-out;
  animation: dvsg-rock 4s ease-in-out infinite;
}

.new-ship.arrived {
  left: 50%;
  transform: translateX(-50%);
}

.treasure-retrieved {
  position: absolute;
  left: 50%;
  bottom: 48%;
  transform: translateX(-50%) translateY(2.5rem);
  font-size: 1.7rem;
  opacity: 0;
  transition: all 0.9s ease-out;
  z-index: 13;
}

.treasure-retrieved.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

.label-tag {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
  color: var(--dv-ink);
  background: color-mix(in srgb, var(--dv-surface) 92%, transparent);
  border: 1px solid var(--dv-line);
  border-radius: 6px;
  padding: 0.15rem 0.4rem;
}

.ship-label {
  top: -2.85rem;
}

.safe-label {
  bottom: -1.55rem;
  color: var(--dv-green);
  border-color: color-mix(in srgb, var(--dv-green) 40%, var(--dv-line));
}

.dvsg-story {
  border: 1px solid var(--dv-line);
  border-radius: 10px;
  background: color-mix(in srgb, var(--dv-blue) 5%, var(--dv-surface));
  padding: 0.7rem 0.85rem;
  margin-bottom: 0.65rem;
  min-height: 3.6rem;
}

.dvsg-story h4 {
  margin: 0 0 0.25rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--dv-ink);
}

.dvsg-story p {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.5;
  color: var(--dv-muted);
}

.dvsg-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.dvsg-btn {
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

.dvsg-btn:hover:not(:disabled) {
  border-color: var(--dv-blue);
  background: color-mix(in srgb, var(--dv-blue) 8%, var(--dv-surface));
}

.dvsg-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.dvsg-btn-primary {
  border-color: var(--dv-blue);
  background: color-mix(in srgb, var(--dv-blue) 10%, var(--dv-surface));
}

.dvsg-btn-danger {
  border-color: var(--dv-red);
  background: color-mix(in srgb, var(--dv-red) 8%, var(--dv-surface));
}

.dvsg-notes {
  border-top: 1px solid var(--dv-line);
  padding-top: 0.7rem;
}

.dvsg-notes h4 {
  margin: 0 0 0.45rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--dv-muted);
}

.dvsg-note {
  border: 1px solid var(--dv-line);
  border-radius: 8px;
  padding: 0.55rem 0.7rem;
  margin-bottom: 0.4rem;
  font-size: 0.72rem;
  line-height: 1.5;
  color: var(--dv-ink);
  background: color-mix(in srgb, var(--dv-ink) 2%, var(--dv-surface));
}

.dvsg-note:last-child {
  margin-bottom: 0;
}

.dvsg-note :deep(strong) {
  color: var(--dv-blue);
  font-weight: 700;
}

.dvsg-note :deep(code) {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  color: var(--dv-blue);
}

@media (prefers-reduced-motion: reduce) {
  .ship-body,
  .new-ship {
    animation: none;
  }
}
</style>
