<script setup lang="ts">
import { Maximize2, Minimize2, Pause, Play, RotateCcw } from 'lucide-vue-next';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import InsightsReadingToggle from '~/component/InsightsReadingToggle.vue';
import NoteViews from '~/component/NoteViews.vue';
import {
  rateConfigs,
  rateIpMeta,
  rateQuiz,
  rateScenes,
  rateScript,
  type RateIpId,
  type RateRequestEvent,
} from '~/data/rateLimit';

type Outcome = 'allow' | 'deny';

interface Stamp {
  id: string;
  ip: RateIpId;
  path: string;
  outcome: Outcome;
  t: number;
  fly: boolean;
}

const shellEl = ref<HTMLElement | null>(null);
const isFullscreen = ref(false);
const sceneIndex = ref(0);
const limit = ref(10);
const windowSec = 60;

const playing = ref(false);
const clock = ref(0); // 0–60
const stamps = ref<Stamp[]>([]);
const counts = ref<Record<RateIpId, number>>({ you: 0, bot: 0 });
const lastFlash = ref<Outcome | null>(null);
const flying = ref<Stamp | null>(null);

const quizIndex = ref(0);
const quizPick = ref<string | null>(null);
const quizOk = ref<boolean | null>(null);
const quizFeedback = ref('');
const showQuiz = ref(false);

let raf = 0;
let lastTs = 0;
const SPEED = 4; // demo seconds per real second

const scene = computed(() => rateScenes[sceneIndex.value]!);
const quiz = computed(() => rateQuiz[quizIndex.value % rateQuiz.length]!);

const ringProgress = computed(() => Math.min(1, clock.value / windowSec));
const allowCount = computed(() => stamps.value.filter((s) => s.outcome === 'allow').length);
const denyCount = computed(() => stamps.value.filter((s) => s.outcome === 'deny').length);

const laneYou = computed(() => stamps.value.filter((s) => s.ip === 'you'));
const laneBot = computed(() => stamps.value.filter((s) => s.ip === 'bot'));

function resetSim(keepLimit = true) {
  playing.value = false;
  clock.value = 0;
  stamps.value = [];
  counts.value = { you: 0, bot: 0 };
  lastFlash.value = null;
  flying.value = null;
  lastTs = 0;
  if (!keepLimit) limit.value = 10;
}

function decide(ip: RateIpId): Outcome {
  if (counts.value[ip] >= limit.value) return 'deny';
  counts.value[ip] += 1;
  return 'allow';
}

function ingest(ev: RateRequestEvent) {
  const outcome = decide(ev.ip);
  const stamp: Stamp = {
    id: ev.id,
    ip: ev.ip,
    path: ev.path,
    outcome,
    t: ev.t,
    fly: true,
  };
  flying.value = stamp;
  lastFlash.value = outcome;
  stamps.value = [...stamps.value, { ...stamp, fly: false }];
  window.setTimeout(() => {
    if (flying.value?.id === stamp.id) flying.value = null;
  }, 420);
}

function tick(ts: number) {
  if (!playing.value) {
    raf = requestAnimationFrame(tick);
    return;
  }
  if (!lastTs) lastTs = ts;
  const dt = ((ts - lastTs) / 1000) * SPEED;
  lastTs = ts;
  const prev = clock.value;
  const next = Math.min(windowSec, prev + dt);

  for (const ev of rateScript) {
    if (ev.t > prev && ev.t <= next) ingest(ev);
  }

  clock.value = next;
  if (next >= windowSec) {
    playing.value = false;
    lastTs = 0;
  }
  raf = requestAnimationFrame(tick);
}

function play() {
  if (clock.value >= windowSec) resetSim(true);
  playing.value = true;
  lastTs = 0;
}

function pause() {
  playing.value = false;
  lastTs = 0;
}

function goScene(i: number) {
  if (i < 0 || i >= rateScenes.length) return;
  sceneIndex.value = i;
  showQuiz.value = false;
  resetSim(true);
}

function nextScene() {
  if (sceneIndex.value < rateScenes.length - 1) {
    goScene(sceneIndex.value + 1);
    return;
  }
  showQuiz.value = true;
}

function answerQuiz(opt: string) {
  if (quizOk.value === true) return;
  const q = quiz.value;
  quizPick.value = opt;
  if (opt === q.answer) {
    quizOk.value = true;
    quizFeedback.value = `Correct — ${q.explain}`;
    window.setTimeout(() => {
      quizIndex.value += 1;
      quizPick.value = null;
      quizOk.value = null;
      quizFeedback.value = '';
    }, 1300);
  } else {
    quizOk.value = false;
    quizFeedback.value = `Not yet — ${q.explain}`;
  }
}

function quizClass(opt: string) {
  if (!quizPick.value) return '';
  const q = quiz.value;
  if (opt === q.answer && (quizPick.value === opt || quizOk.value === false)) return 'ok';
  if (opt === quizPick.value && opt !== q.answer) return 'bad';
  return '';
}

async function toggleFullscreen() {
  if (isFullscreen.value) {
    if (document.fullscreenElement) await document.exitFullscreen();
    isFullscreen.value = false;
    return;
  }
  isFullscreen.value = true;
  try {
    await shellEl.value?.requestFullscreen();
  } catch {
    /* layout fs */
  }
}

function onFs() {
  isFullscreen.value = document.fullscreenElement === shellEl.value;
}

watch(limit, () => {
  resetSim(true);
});

onMounted(() => {
  raf = requestAnimationFrame(tick);
  document.addEventListener('fullscreenchange', onFs);
});

onUnmounted(() => {
  cancelAnimationFrame(raf);
  document.removeEventListener('fullscreenchange', onFs);
});
</script>

<template>
  <div ref="shellEl" class="rl" :class="{ 'is-fs': isFullscreen }">
    <header class="rl-top">
      <NuxtLink to="/insights/notes" class="rl-brand">The Minute Door</NuxtLink>
      <div class="rl-tools">
        <NoteViews slug="rate-limit" class="rl-meta" />
        <span class="rl-meta">10 / min / IP</span>
        <button type="button" class="rl-tool" @click="toggleFullscreen">
          <Minimize2 v-if="isFullscreen" :size="14" />
          <Maximize2 v-else :size="14" />
        </button>
        <InsightsReadingToggle />
      </div>
    </header>

    <div class="rl-stage">
      <!-- Living visualization -->
      <section class="rl-viz" aria-label="Rate limit animation">
        <div class="rl-sky">
          <div class="rl-clock">
            <svg viewBox="0 0 120 120" class="rl-ring">
              <circle class="rl-ring-bg" cx="60" cy="60" r="52" />
              <circle
                class="rl-ring-fg"
                cx="60"
                cy="60"
                r="52"
                :style="{
                  strokeDasharray: `${ringProgress * 327} 327`,
                }"
              />
            </svg>
            <div class="rl-clock-face">
              <strong>{{ clock.toFixed(1) }}s</strong>
              <span>/ {{ windowSec }}s window</span>
            </div>
          </div>

          <div class="rl-door" :class="{ allow: lastFlash === 'allow', deny: lastFlash === 'deny' }">
            <div class="rl-door-lintel">GATE · {{ limit }} stamps / IP / min</div>
            <div class="rl-door-body">
              <div class="rl-counters">
                <div class="rl-counter is-you">
                  <span>You</span>
                  <strong>{{ counts.you }}</strong>
                  <em>/ {{ limit }}</em>
                </div>
                <div class="rl-counter is-bot">
                  <span>Bot</span>
                  <strong>{{ counts.bot }}</strong>
                  <em>/ {{ limit }}</em>
                </div>
              </div>
              <div class="rl-stamp-board" aria-hidden="true">
                <div class="rl-stamp-row is-you">
                  <span>You</span>
                  <i
                    v-for="n in limit"
                    :key="`y-${n}`"
                    class="rl-slot"
                    :class="{ filled: counts.you >= n }"
                  />
                </div>
                <div class="rl-stamp-row is-bot">
                  <span>Bot</span>
                  <i
                    v-for="n in limit"
                    :key="`b-${n}`"
                    class="rl-slot"
                    :class="{ filled: counts.bot >= n }"
                  />
                </div>
              </div>
              <Transition name="fly">
                <div
                  v-if="flying"
                  class="rl-flyer"
                  :class="flying.outcome"
                  :style="{ '--c': rateIpMeta[flying.ip].color }"
                >
                  {{ flying.outcome === 'allow' ? '✓ stamped' : '429' }}
                </div>
              </Transition>
            </div>
          </div>

          <div class="rl-stats">
            <div><b class="ok">{{ allowCount }}</b> allowed</div>
            <div><b class="bad">{{ denyCount }}</b> blocked (429)</div>
          </div>
        </div>

        <div class="rl-lanes">
          <div class="rl-lane">
            <header>
              <i :style="{ background: rateIpMeta.you.color }" />
              {{ rateIpMeta.you.label }}
              <code>{{ rateIpMeta.you.ip }}</code>
            </header>
            <div class="rl-pills">
              <span
                v-for="s in laneYou"
                :key="s.id"
                class="rl-pill"
                :class="s.outcome"
                :title="s.path"
              >
                {{ s.outcome === 'allow' ? 'ok' : '429' }}
              </span>
              <span v-if="!laneYou.length" class="rl-empty">waiting for requests…</span>
            </div>
          </div>
          <div class="rl-lane">
            <header>
              <i :style="{ background: rateIpMeta.bot.color }" />
              {{ rateIpMeta.bot.label }}
              <code>{{ rateIpMeta.bot.ip }}</code>
            </header>
            <div class="rl-pills">
              <span
                v-for="s in laneBot"
                :key="s.id"
                class="rl-pill"
                :class="s.outcome"
                :title="s.path"
              >
                {{ s.outcome === 'allow' ? 'ok' : '429' }}
              </span>
              <span v-if="!laneBot.length" class="rl-empty">waiting for requests…</span>
            </div>
          </div>
        </div>

        <div class="rl-transport">
          <button type="button" class="rl-btn primary" @click="playing ? pause() : play()">
            <Pause v-if="playing" :size="16" />
            <Play v-else :size="16" />
            {{ playing ? 'Pause' : clock >= windowSec ? 'Replay minute' : 'Play minute' }}
          </button>
          <button type="button" class="rl-btn" @click="resetSim(true)">
            <RotateCcw :size="16" />
            Reset
          </button>
          <label class="rl-dial">
            <span>Limit</span>
            <input v-model.number="limit" type="range" min="3" max="20" step="1" />
            <strong>{{ limit }} / min / IP</strong>
          </label>
        </div>
      </section>

      <!-- Story / quiz -->
      <section class="rl-story">
        <nav class="rl-scenes" aria-label="Scenes">
          <button
            v-for="(s, i) in rateScenes"
            :key="s.id"
            type="button"
            class="rl-scene-dot"
            :class="{ on: !showQuiz && sceneIndex === i }"
            :aria-label="s.kicker"
            @click="goScene(i)"
          >
            {{ i + 1 }}
          </button>
          <button
            type="button"
            class="rl-scene-dot quiz"
            :class="{ on: showQuiz }"
            @click="showQuiz = true"
          >
            ?
          </button>
        </nav>

        <template v-if="!showQuiz">
          <p class="rl-kicker">{{ scene.kicker }}</p>
          <h1>{{ scene.title }}</h1>
          <p class="rl-body">{{ scene.body }}</p>
          <p class="rl-tip">{{ scene.tip }}</p>

          <div v-if="scene.id === 'real'" class="rl-code-grid">
            <pre><span>English</span>{{ rateConfigs.english }}</pre>
            <pre><span>Cloudflare-shaped</span>{{ rateConfigs.cloudflare }}</pre>
            <pre><span>Redis sketch</span>{{ rateConfigs.redis }}</pre>
          </div>

          <div class="rl-nav">
            <button
              type="button"
              class="rl-btn"
              :disabled="sceneIndex === 0"
              @click="goScene(sceneIndex - 1)"
            >
              Back
            </button>
            <button type="button" class="rl-btn primary" @click="nextScene">
              {{ sceneIndex === rateScenes.length - 1 ? 'Quiz' : 'Next scene' }}
            </button>
          </div>
        </template>

        <template v-else>
          <p class="rl-kicker">Check · Quiz</p>
          <h1>{{ quiz.q }}</h1>
          <div class="rl-quiz">
            <button
              v-for="opt in quiz.options"
              :key="opt"
              type="button"
              class="rl-opt"
              :class="quizClass(opt)"
              @click="answerQuiz(opt)"
            >
              {{ opt }}
            </button>
          </div>
          <p class="rl-feedback" :class="{ ok: quizOk === true, bad: quizOk === false }">
            {{ quizFeedback }}
          </p>
          <div class="rl-nav">
            <button type="button" class="rl-btn" @click="showQuiz = false; goScene(rateScenes.length - 1)">
              Back to scenes
            </button>
          </div>
        </template>
      </section>
    </div>
  </div>
</template>

<style scoped>
.rl {
  --mf-bg: #ffffff;
  --mf-graph: #fafafa;
  --mf-dot: #d0d0d0;
  --mf-line: #eaeaea;
  --mf-text: #37352f;
  --mf-muted: #787774;
  --mf-panel: #ffffff;
  --mf-accent: #4a9eff;
  --lj-purple: #8b7cff;
  --lj-blue: #4a9eff;
  --lj-gold: #e6a817;
  --lj-intent: #7b2d8e;
  --lj-ok: #10b981;
  --lj-bad: #c0392b;
  --you: var(--lj-blue);
  --bot: var(--lj-bad);
  height: calc(100dvh - var(--insights-nav-offset, 4rem));
  display: flex;
  flex-direction: column;
  background-color: var(--mf-graph);
  background-image: radial-gradient(var(--mf-dot) 1.5px, transparent 1.5px);
  background-size: 20px 20px;
  color: var(--mf-text);
  overflow: hidden;
  font-family: 'DM Sans', system-ui, sans-serif;
}

.rl.is-fs {
  height: 100dvh;
}

:global(.insights-shell[data-mode='dark']) .rl {
  --mf-bg: #111111;
  --mf-graph: #161616;
  --mf-dot: #2b2b2b;
  --mf-line: #2a2a2a;
  --mf-text: #f3f3f3;
  --mf-muted: #9a9a9a;
  --mf-panel: #1a1a1a;
}

.rl-top {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  border-bottom: 1px solid var(--mf-line);
  flex-shrink: 0;
  background: var(--mf-bg);
}

.rl-brand {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--mf-text);
  text-decoration: none;
}

.rl-tools {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.rl-meta {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  color: var(--mf-muted);
}

.rl-tool {
  width: 32px;
  height: 32px;
  border: 1px solid var(--mf-line);
  background: var(--mf-panel);
  color: var(--mf-text);
  display: grid;
  place-items: center;
  cursor: pointer;
  border-radius: 8px;
}

.rl-tool:hover {
  border-color: var(--mf-accent);
  color: var(--mf-accent);
}

.rl-stage {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 0;
}

.rl-viz {
  padding: 20px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-right: 1px solid var(--mf-line);
}

.rl-sky {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: center;
}

.rl-clock {
  position: relative;
  width: 110px;
  height: 110px;
}

.rl-ring {
  width: 110px;
  height: 110px;
  transform: rotate(-90deg);
}

.rl-ring-bg {
  fill: none;
  stroke: var(--mf-line);
  stroke-width: 8;
}

.rl-ring-fg {
  fill: none;
  stroke: var(--lj-purple);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dasharray 0.05s linear;
}

.rl-clock-face {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'DM Mono', ui-monospace, monospace;
}

.rl-clock-face strong {
  font-size: 18px;
  color: var(--mf-text);
}

.rl-clock-face span {
  font-size: 9px;
  color: var(--mf-muted);
}

.rl-door {
  border: 1px solid var(--mf-line);
  border-radius: 12px;
  background: var(--mf-panel);
  overflow: hidden;
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
}

.rl-door.allow {
  border-color: color-mix(in srgb, var(--lj-ok) 55%, var(--mf-line));
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--lj-ok) 25%, transparent);
}

.rl-door.deny {
  border-color: color-mix(in srgb, var(--lj-bad) 55%, var(--mf-line));
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--lj-bad) 25%, transparent);
  animation: shake 0.35s ease;
}

@keyframes shake {
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

.rl-door-lintel {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 10px 14px;
  border-bottom: 1px solid var(--mf-line);
  color: var(--mf-muted);
  background: color-mix(in srgb, var(--lj-purple) 6%, var(--mf-panel));
}

.rl-door-body {
  position: relative;
  padding: 16px;
  min-height: 140px;
}

.rl-counters {
  display: flex;
  gap: 18px;
  margin-bottom: 12px;
}

.rl-counter {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-family: 'DM Mono', ui-monospace, monospace;
}

.rl-counter.is-you {
  --c: var(--you);
}
.rl-counter.is-bot {
  --c: var(--bot);
}

.rl-counter span {
  color: var(--c);
  font-size: 12px;
}

.rl-counter strong {
  font-size: 28px;
  color: var(--mf-text);
}

.rl-counter em {
  font-style: normal;
  color: var(--mf-muted);
  font-size: 12px;
}

.rl-stamp-board {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rl-stamp-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  color: var(--mf-muted);
}

.rl-stamp-row.is-you {
  --c: var(--you);
}
.rl-stamp-row.is-bot {
  --c: var(--bot);
}

.rl-stamp-row span {
  width: 28px;
}

.rl-slot {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  border: 1px dashed var(--mf-line);
  background: transparent;
}

.rl-slot.filled {
  background: color-mix(in srgb, var(--c) 45%, transparent);
  border-style: solid;
  border-color: var(--c);
}

.rl-flyer {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  font-family: 'DM Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 18px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--c);
  color: var(--c);
  background: color-mix(in srgb, var(--c) 12%, var(--mf-panel));
}

.rl-flyer.deny {
  color: var(--lj-bad);
  border-color: var(--lj-bad);
}

.fly-enter-active {
  animation: popIn 0.42s cubic-bezier(0.2, 0.9, 0.3, 1.2);
}
.fly-leave-active {
  animation: popOut 0.25s ease forwards;
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: translateY(-50%) scale(0.4) rotate(-8deg);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) scale(1) rotate(0);
  }
}
@keyframes popOut {
  to {
    opacity: 0;
    transform: translateY(-60%) scale(0.8);
  }
}

.rl-stats {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 12px;
  color: var(--mf-muted);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rl-stats b.ok {
  color: var(--lj-ok);
}
.rl-stats b.bad {
  color: var(--lj-bad);
}

.rl-lanes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.rl-lane {
  border: 1px solid var(--mf-line);
  border-radius: 10px;
  background: var(--mf-panel);
  padding: 12px;
  min-height: 88px;
}

.rl-lane header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 12px;
  margin-bottom: 10px;
  color: var(--mf-text);
}

.rl-lane header i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.rl-lane header code {
  margin-left: auto;
  font-size: 10px;
  color: var(--mf-muted);
}

.rl-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.rl-pill {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 6px;
  animation: pillIn 0.35s ease;
}

.rl-pill.allow {
  background: color-mix(in srgb, var(--lj-ok) 14%, transparent);
  color: var(--lj-ok);
}
.rl-pill.deny {
  background: color-mix(in srgb, var(--lj-bad) 12%, transparent);
  color: var(--lj-bad);
}

@keyframes pillIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.85);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.rl-empty {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  color: var(--mf-muted);
}

.rl-transport {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.rl-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid var(--mf-line);
  background: var(--mf-panel);
  color: var(--mf-text);
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 12px;
  cursor: pointer;
}

.rl-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.rl-btn.primary {
  background: linear-gradient(180deg, #8b7cff 0%, #4a9eff 100%);
  color: #fff;
  border-color: transparent;
  font-weight: 600;
}

.rl-dial {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 12px;
  color: var(--mf-muted);
}

.rl-dial input {
  width: 120px;
  accent-color: var(--lj-purple);
}

.rl-dial strong {
  color: var(--mf-text);
  min-width: 7rem;
}

.rl-story {
  padding: 28px 26px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: var(--mf-panel);
}

.rl-scenes {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.rl-scene-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--mf-line);
  background: var(--mf-graph);
  color: var(--mf-muted);
  font-family: 'DM Mono', ui-monospace, monospace;
  cursor: pointer;
}

.rl-scene-dot.on {
  background: var(--lj-purple);
  color: #fff;
  border-color: transparent;
  font-weight: 700;
  box-shadow: 0 0 10px color-mix(in srgb, var(--lj-purple) 50%, transparent);
}

.rl-scene-dot.quiz.on {
  background: var(--lj-intent);
  box-shadow: 0 0 10px color-mix(in srgb, var(--lj-intent) 45%, transparent);
}

.rl-kicker {
  margin: 0;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--lj-intent);
}

.rl-story h1 {
  margin: 0;
  font-size: clamp(1.5rem, 2.4vw, 2rem);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--mf-text);
}

.rl-body {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.65;
  color: var(--mf-muted);
}

.rl-tip {
  margin: 0;
  padding: 12px 14px;
  border-left: 3px solid var(--lj-gold);
  background: color-mix(in srgb, var(--lj-gold) 10%, var(--mf-graph));
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 12px;
  line-height: 1.55;
  color: var(--mf-muted);
}

.rl-code-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rl-code-grid pre {
  margin: 0;
  padding: 12px 14px;
  border-radius: 6px;
  border: 1px solid var(--mf-line);
  background: var(--mf-graph);
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  line-height: 1.55;
  white-space: pre-wrap;
  color: var(--mf-text);
}

.rl-code-grid pre span {
  display: block;
  color: var(--lj-intent);
  margin-bottom: 6px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 10px;
}

.rl-nav {
  display: flex;
  gap: 10px;
  margin-top: auto;
  padding-top: 8px;
}

.rl-quiz {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rl-opt {
  text-align: left;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid var(--mf-line);
  background: var(--mf-graph);
  color: var(--mf-text);
  font-size: 14px;
  cursor: pointer;
  font-family: 'DM Sans', system-ui, sans-serif;
}

.rl-opt:hover {
  border-color: var(--lj-purple);
}

.rl-opt.ok {
  border-color: var(--lj-ok);
  color: var(--lj-ok);
  background: color-mix(in srgb, var(--lj-ok) 10%, var(--mf-panel));
}

.rl-opt.bad {
  border-color: var(--lj-bad);
  color: var(--lj-bad);
  background: color-mix(in srgb, var(--lj-bad) 10%, var(--mf-panel));
}

.rl-feedback {
  min-height: 1.4em;
  margin: 0;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 12px;
  color: var(--mf-muted);
}

.rl-feedback.ok {
  color: var(--lj-ok);
}
.rl-feedback.bad {
  color: var(--lj-bad);
}

@media (max-width: 960px) {
  .rl-stage {
    grid-template-columns: 1fr;
  }
  .rl-viz {
    border-right: none;
    border-bottom: 1px solid var(--mf-line);
    max-height: 52vh;
  }
  .rl-sky {
    grid-template-columns: 1fr;
    justify-items: start;
  }
  .rl-lanes {
    grid-template-columns: 1fr;
  }
  .rl-dial {
    margin-left: 0;
    width: 100%;
  }
}
</style>
