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

const storyTitle = ref('📖 Story');
const storyText = ref('Choose a mode above to start the adventure!');
const reviewCards = ref<string[]>([
  '<strong>Container</strong> = A temporary, isolated environment. Like a ship that can sink.',
  '<strong>Volume</strong> = Persistent storage on your host. Like a waterproof safe on the ocean floor.',
  '<strong>Command:</strong> <code>docker run</code> = Launch ship. <code>docker rm</code> = Burn/sink ship.',
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
      'Without Volume Mode',
      'The ship (Container) carries a notebook (Data) directly on its deck. There is no safe. If the ship sinks, the notebook sinks with it.',
    );
    updateReview([
      '<strong>No Volume:</strong> Data lives INSIDE the container. When the container dies, data dies.',
      '<strong>Real command:</strong> <code>docker-compose down</code> → Container deleted → Database files gone.',
      '<strong>Result:</strong> Alice and Bob lose all their money. 💀',
    ]);
  } else {
    safeVisible.value = true;
    safeGlow.value = true;
    ropeExtended.value = true;
    setStory(
      'With Volume Mode',
      'The ship (Container) reads/writes data through a rope to a waterproof safe (Volume: pgdata) sitting on the ocean floor. The safe is separate from the ship.',
    );
    updateReview([
      '<strong>With Volume:</strong> Data lives OUTSIDE the container, on your real computer.',
      '<strong>Real command:</strong> <code>docker-compose down</code> → Container deleted → Volume folder on your hard drive STAYS.',
      '<strong>Result:</strong> Even if the ship sinks, the safe remains. New ship can connect to the same safe. 🎉',
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
        '💀 TRAGEDY: All Data Lost!',
        "The ship burned and sank. The notebook was glued to the deck. It sank with the ship. There is no backup. Alice and Bob's transaction history is gone forever.",
      );
      updateReview([
        '<strong>What happened:</strong> <code>docker-compose down</code> removed the container.',
        '<strong>Where was the data?</strong> Inside <code>/var/lib/postgresql/data</code> INSIDE the container.',
        '<strong>Problem:</strong> Containers are cattle — meant to be destroyed and rebuilt. Data should NEVER live only inside them.',
        '<strong>Moral:</strong> Never run a database in Docker without a volume!',
      ]);
    } else {
      setStory(
        '🔥 Ship Destroyed... But Wait!',
        'The ship burned and sank. But the notebook was never on the ship — it was safely inside the waterproof safe (Volume: pgdata) on the ocean floor. The rope snapped, but the safe is untouched.',
      );
      updateReview([
        '<strong>What happened:</strong> <code>docker-compose down</code> removed the container.',
        '<strong>Where was the data?</strong> In the Volume folder on your REAL computer: <code>/var/lib/docker/volumes/pgdata/_data/</code>',
        '<strong>Magic:</strong> The container was just "borrowing" that folder. Deleting the borrower doesn\'t delete the owner.',
        '<strong>Next:</strong> Launch a new container. It will connect to the SAME safe. Same data. No loss.',
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
        '🚢 New Ship Arrived... But Empty.',
        'A brand new ship (fresh container) has arrived. But it has no notebook. No data. You must start from zero. This is what happens when you rebuild a container without a volume.',
      );
      updateReview([
        '<strong>New container:</strong> Fresh, clean, empty. Like a brand new ship.',
        '<strong>Old data:</strong> Gone. Buried at the bottom of the ocean.',
        '<strong>Real world:</strong> You run <code>docker-compose up --build</code> and wonder why your database is empty. 😭',
        '<strong>Fix:</strong> Add <code>volumes: pgdata:/var/lib/postgresql/data</code> to your docker-compose.yml!',
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
        '🎉 VICTORY: Data Survived!',
        'The new ship arrived and immediately connected to the same underwater safe (Volume). The notebook was retrieved. Alice still has $70. Bob still has $80. All transaction history is intact!',
      );
      updateReview([
        '<strong>New container:</strong> Fresh ship, but connected to the SAME volume.',
        '<strong>Data:</strong> Instantly available. No restore needed. No backup needed.',
        '<strong>Real command:</strong> <code>docker-compose up --build</code> → New container starts → Old volume reattached automatically.',
        '<strong>The Rule:</strong> Containers die. Volumes live forever (until YOU delete them). 🛡️',
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
  setStory('📖 Story', 'Choose a mode above to start the adventure!');
  updateReview([
    '<strong>Container</strong> = A temporary, isolated environment. Like a ship that can sink.',
    '<strong>Volume</strong> = Persistent storage on your host. Like a waterproof safe on the ocean floor.',
    '<strong>Command:</strong> <code>docker run</code> = Launch ship. <code>docker rm</code> = Burn/sink ship.',
  ]);
}

onUnmounted(() => {
  clearTimers();
});
</script>

<template>
  <div class="dvsg" aria-label="Why Docker Volumes Matter">
    <header class="dvsg-header">
      <h2>🐳 Why Docker Volumes Matter</h2>
      <p>Click a mode below. Watch the ship burn. Learn why volumes matter.</p>
    </header>

    <div class="mode-bar">
      <button
        type="button"
        class="mode-btn"
        :class="{ active: currentMode === 'novol' }"
        @click="setMode('novol')"
      >
        ❌ Without Volume
      </button>
      <button
        type="button"
        class="mode-btn"
        :class="{ active: currentMode === 'withvol' }"
        @click="setMode('withvol')"
      >
        ✅ With Volume
      </button>
    </div>

    <div class="scene">
      <div class="step-counter">Step {{ step }}</div>

      <div class="sky">
        <div class="cloud">☁️</div>
        <div class="cloud">☁️</div>
      </div>

      <div class="ship-wrapper" :class="{ sinking: shipSinking }">
        <div class="ship-body">🚢</div>
        <div class="notebook" :style="{ opacity: notebookOpacity }">📓</div>
        <div class="fire" :class="{ burning: fireBurning }">🔥</div>
        <div class="label-tag ship-label">Container: my-app</div>
      </div>

      <div
        class="safe-box"
        :class="{ visible: safeVisible, glow: safeGlow, pulse: safePulse }"
      >
        🏦
        <div class="label-tag safe-label">Volume: pgdata</div>
      </div>
      <div class="rope" :class="{ extended: ropeExtended }" />

      <div class="new-ship" :class="{ arrived: newShipArrived }">
        🚢
        <div class="label-tag ship-label" style="top: -45px">New Container</div>
      </div>
      <div class="treasure-retrieved" :class="{ show: treasureShow }">📓</div>

      <div class="water">
        <div class="wave" />
        <div class="wave" />
        <div class="wave" />
      </div>
    </div>

    <div class="story-panel">
      <h4>{{ storyTitle }}</h4>
      <p>{{ storyText }}</p>
    </div>

    <div class="controls-bar">
      <button
        type="button"
        class="action-btn btn-burn"
        :disabled="burnDisabled"
        @click="burnShip"
      >
        🔥 Burn Ship
      </button>
      <button
        type="button"
        class="action-btn btn-launch"
        :disabled="launchDisabled"
        @click="launchNewShip"
      >
        🚢 Launch New Ship
      </button>
      <button type="button" class="action-btn btn-reset" @click="resetGame">🔄 Reset</button>
    </div>

    <div class="review-panel">
      <h4>🧠 Review Notes</h4>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div
        v-for="(card, i) in reviewCards"
        :key="i"
        class="review-card"
        v-html="card"
      />
    </div>
  </div>
</template>

<style scoped>
.dvsg {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  background: linear-gradient(180deg, #87ceeb 0%, #e0f7fa 40%, #006994 100%);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  position: relative;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.dvsg-header {
  background: #1565c0;
  color: white;
  padding: 16px 20px;
  text-align: center;
}

.dvsg-header h2 {
  margin: 0;
  font-size: 22px;
}

.dvsg-header p {
  margin: 4px 0 0;
  font-size: 13px;
  opacity: 0.9;
}

.mode-bar {
  display: flex;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.9);
  justify-content: center;
}

.mode-btn {
  flex: 1;
  padding: 10px 20px;
  border: 2px solid #ccc;
  border-radius: 24px;
  background: white;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
  color: #333;
}

.mode-btn:hover {
  transform: translateY(-2px);
}

.mode-btn.active {
  border-color: #1565c0;
  background: #e3f2fd;
  color: #1565c0;
}

.scene {
  position: relative;
  height: 320px;
  overflow: hidden;
}

.sky {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 180px;
  background: linear-gradient(180deg, #87ceeb, #b3e5fc);
}

.cloud {
  position: absolute;
  font-size: 40px;
  opacity: 0.8;
  animation: dvsg-float 8s ease-in-out infinite;
}

.cloud:nth-child(1) {
  top: 20px;
  left: 60px;
  animation-delay: 0s;
}

.cloud:nth-child(2) {
  top: 40px;
  right: 80px;
  animation-delay: 3s;
  font-size: 30px;
}

@keyframes dvsg-float {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(20px);
  }
}

.water {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 140px;
  background: linear-gradient(180deg, #29b6f6, #01579b);
  overflow: hidden;
}

.wave {
  position: absolute;
  width: 200%;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  animation: dvsg-wave 4s linear infinite;
}

.wave:nth-child(1) {
  top: 10px;
  animation-delay: 0s;
}

.wave:nth-child(2) {
  top: 40px;
  animation-delay: 1s;
}

.wave:nth-child(3) {
  top: 70px;
  animation-delay: 2s;
}

@keyframes dvsg-wave {
  0% {
    transform: translateX(-50%);
  }
  100% {
    transform: translateX(0%);
  }
}

.ship-wrapper {
  position: absolute;
  left: 50%;
  bottom: 110px;
  transform: translateX(-50%);
  transition: all 1.5s ease-in-out;
  z-index: 10;
}

.ship-wrapper.sinking {
  transform: translateX(-50%) translateY(180px) rotate(25deg);
  opacity: 0.3;
}

.ship-body {
  font-size: 80px;
  line-height: 1;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  animation: dvsg-rock 3s ease-in-out infinite;
}

@keyframes dvsg-rock {
  0%,
  100% {
    transform: rotate(-3deg);
  }
  50% {
    transform: rotate(3deg);
  }
}

.ship-wrapper.sinking .ship-body {
  animation: none;
}

.notebook {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 32px;
  transition: all 1.5s ease-in-out;
  z-index: 11;
}

.ship-wrapper.sinking .notebook {
  transform: translateX(-50%) translateY(80px);
  opacity: 0;
}

.fire {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 36px;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 12;
  animation: dvsg-flicker 0.3s infinite;
}

.fire.burning {
  opacity: 1;
}

@keyframes dvsg-flicker {
  0%,
  100% {
    transform: translateX(-50%) scale(1);
  }
  50% {
    transform: translateX(-50%) scale(1.2);
  }
}

.safe-box {
  position: absolute;
  left: 50%;
  bottom: 40px;
  transform: translateX(-50%) scale(0);
  font-size: 50px;
  z-index: 8;
  transition: all 0.8s ease-out;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
}

.safe-box.visible {
  transform: translateX(-50%) scale(1);
}

.safe-box.glow {
  filter: drop-shadow(0 0 20px #4caf50) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
}

.safe-box.pulse {
  transform: translateX(-50%) scale(1.1);
}

.rope {
  position: absolute;
  left: 50%;
  bottom: 85px;
  width: 3px;
  height: 0;
  background: #8d6e63;
  transform: translateX(-50%);
  transition: height 1s ease-out;
  z-index: 9;
}

.rope.extended {
  height: 60px;
}

.new-ship {
  position: absolute;
  left: -100px;
  bottom: 110px;
  font-size: 80px;
  z-index: 10;
  transition: left 1.5s ease-out;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  animation: dvsg-rock 3s ease-in-out infinite;
}

.new-ship.arrived {
  left: 50%;
  transform: translateX(-50%);
}

.treasure-retrieved {
  position: absolute;
  left: 50%;
  bottom: 140px;
  transform: translateX(-50%) translateY(60px);
  font-size: 32px;
  opacity: 0;
  transition: all 1s ease-out;
  z-index: 13;
}

.treasure-retrieved.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

.label-tag {
  position: absolute;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.ship-label {
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
}

.safe-label {
  bottom: -28px;
  left: 50%;
  transform: translateX(-50%);
  background: #2e7d32;
}

.controls-bar {
  display: flex;
  gap: 10px;
  padding: 16px 20px;
  background: white;
  justify-content: center;
  flex-wrap: wrap;
  border-top: 1px solid #e0e0e0;
}

.action-btn {
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-burn {
  background: #ff5722;
  color: white;
}

.btn-burn:hover:not(:disabled) {
  background: #e64a19;
}

.btn-launch {
  background: #4caf50;
  color: white;
}

.btn-launch:hover:not(:disabled) {
  background: #388e3c;
}

.btn-reset {
  background: #757575;
  color: white;
}

.btn-reset:hover:not(:disabled) {
  background: #616161;
}

.story-panel {
  background: #fff8e1;
  padding: 16px 20px;
  border-left: 4px solid #ffc107;
  min-height: 60px;
}

.story-panel h4 {
  margin: 0 0 6px;
  color: #f57f17;
  font-size: 15px;
}

.story-panel p {
  margin: 0;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

.review-panel {
  background: #e8f5e9;
  padding: 16px 20px;
  border-top: 1px solid #c8e6c9;
}

.review-panel h4 {
  margin: 0 0 10px;
  color: #2e7d32;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.review-card {
  background: white;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 8px;
  font-size: 13px;
  border-left: 3px solid #4caf50;
  color: #333;
  line-height: 1.45;
}

.review-card:last-child {
  margin-bottom: 0;
}

.review-card :deep(strong) {
  color: #1565c0;
}

.review-card :deep(code) {
  font-family: ui-monospace, monospace;
  font-size: 12px;
  background: #f5f5f5;
  padding: 1px 4px;
  border-radius: 4px;
}

.step-counter {
  position: absolute;
  top: 10px;
  right: 16px;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  color: #1565c0;
  z-index: 20;
}

@media (prefers-reduced-motion: reduce) {
  .cloud,
  .wave,
  .ship-body,
  .new-ship,
  .fire {
    animation: none;
  }
}
</style>
