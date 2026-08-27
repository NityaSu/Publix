<script setup lang="ts">
import { Maximize2, Minimize2, PanelRightClose, PanelRightOpen } from 'lucide-vue-next';
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue';
import InsightsReadingToggle from '~/component/InsightsReadingToggle.vue';
import NoteViews from '~/component/NoteViews.vue';
import InsightsSplitHandle from '~/component/InsightsSplitHandle.vue';
import { useInsightsSplit } from '~/composables/useInsightsSplit';
import {
  BOT_KIND_META,
  botDefenses,
  botQuizzes,
  botRequests,
  botSteps,
  decideBotAction,
  type BotDefense,
} from '~/data/botDefense';

type Phase = 'explain' | 'practice' | 'master';
type Action = 'allow' | 'challenge' | 'block';

const isFullscreen = ref(false);
const shellEl = ref<HTMLElement | null>(null);
const lessonEl = ref<HTMLElement | null>(null);

const currentStep = ref(0);
const currentPhase = ref<Phase>('explain');
const practiceUnlocked = ref(false);
const masterUnlocked = ref(false);
const hintOpen = ref(false);

const defenses = reactive<Record<BotDefense['id'], boolean>>({
  waf: false,
  rate: false,
  botmg: false,
  turnstile: false,
});

const classifyId = ref(botRequests[0]!.id);
const classifyGuess = ref<Action | null>(null);
const classifyFeedback = ref('');
const classifyOk = ref<boolean | null>(null);
const classified = ref(0);

const currentQuiz = ref(0);
const quizPicked = ref<string | null>(null);
const quizFeedback = ref('');
const quizOk = ref<boolean | null>(null);

const {
  bodyEl,
  leftPct,
  leftStyle,
  dragging,
  rightOpen,
  toggleRight,
  onHandlePointerDown,
  onHandleKeydown,
} = useInsightsSplit({ storageKey: 'bot-defense', defaultPct: 54 });

const step = computed(() => botSteps[currentStep.value]!);
const quiz = computed(() => botQuizzes[currentQuiz.value % botQuizzes.length]!);
const activeRequest = computed(() => botRequests.find((r) => r.id === classifyId.value)!);

const outcomes = computed(() =>
  botRequests.map((req) => ({
    req,
    action: decideBotAction(req, defenses),
  })),
);

const counts = computed(() => {
  const c = { allow: 0, challenge: 0, block: 0 };
  for (const row of outcomes.value) c[row.action] += 1;
  return c;
});

const stageLabel = computed(() => {
  if (currentPhase.value === 'practice') {
    return `Practice · defenses on · classified ${classified.value}/${botRequests.length}`;
  }
  if (currentPhase.value === 'master') return 'Master: Quiz';
  return step.value.label;
});

function isFocused(id: string) {
  if (currentPhase.value !== 'explain') return true;
  return step.value.focus.includes(id);
}

function goStep(idx: number) {
  if (currentPhase.value !== 'explain') return;
  if (idx < 0 || idx >= botSteps.length || idx > currentStep.value + 1) return;
  currentStep.value = idx;
  hintOpen.value = false;
}

function nextExplain() {
  if (currentStep.value < botSteps.length - 1) {
    goStep(currentStep.value + 1);
    return;
  }
  practiceUnlocked.value = true;
  // sensible defaults when entering practice
  defenses.waf = true;
  defenses.rate = true;
  defenses.botmg = true;
  defenses.turnstile = true;
  setPhase('practice');
}

function setPhase(phase: Phase) {
  if (phase === 'practice' && !practiceUnlocked.value) return;
  if (phase === 'master' && !masterUnlocked.value) return;
  currentPhase.value = phase;
  hintOpen.value = false;
  if (phase === 'practice') masterUnlocked.value = true;
  if (phase === 'master') {
    quizPicked.value = null;
    quizFeedback.value = '';
    quizOk.value = null;
  }
  nextTick(() => lessonEl.value?.scrollTo({ top: 0 }));
}

function resetLesson() {
  currentStep.value = 0;
  currentPhase.value = 'explain';
  hintOpen.value = false;
  defenses.waf = false;
  defenses.rate = false;
  defenses.botmg = false;
  defenses.turnstile = false;
  classifyId.value = botRequests[0]!.id;
  classifyGuess.value = null;
  classifyFeedback.value = '';
  classifyOk.value = null;
  classified.value = 0;
  currentQuiz.value = 0;
  quizPicked.value = null;
  quizFeedback.value = '';
  quizOk.value = null;
}

function toggleDefense(id: BotDefense['id']) {
  defenses[id] = !defenses[id];
}

function selectRequest(id: string) {
  classifyId.value = id;
  classifyGuess.value = null;
  classifyFeedback.value = '';
  classifyOk.value = null;
}

function guessAction(action: Action) {
  if (classifyOk.value === true) return;
  const expected = decideBotAction(activeRequest.value, defenses);
  classifyGuess.value = action;
  if (action === expected) {
    classifyOk.value = true;
    classifyFeedback.value = `Yes — with current defenses this request is ${expected}.`;
    classified.value = Math.min(botRequests.length, classified.value + 1);
    if (classified.value >= 3) masterUnlocked.value = true;
  } else {
    classifyOk.value = false;
    classifyFeedback.value = `Edge would ${expected}. Check which toggles are on and the request signals.`;
  }
}

function classifyClass(action: Action) {
  if (!classifyGuess.value) return '';
  const expected = decideBotAction(activeRequest.value, defenses);
  if (action === expected && (classifyGuess.value === action || classifyOk.value === false)) return 'ok';
  if (classifyGuess.value === action && action !== expected) return 'bad';
  return '';
}

function answerQuiz(opt: string) {
  if (quizOk.value === true) return;
  const q = quiz.value;
  quizPicked.value = opt;
  if (opt === q.answer) {
    quizOk.value = true;
    quizFeedback.value = `Correct! ${q.explain}`;
    window.setTimeout(() => {
      currentQuiz.value += 1;
      quizPicked.value = null;
      quizFeedback.value = '';
      quizOk.value = null;
    }, 1400);
  } else {
    quizOk.value = false;
    quizFeedback.value = `Not quite. ${q.explain}`;
  }
}

function quizClass(opt: string) {
  if (!quizPicked.value) return '';
  const q = quiz.value;
  if (opt === q.answer && (quizPicked.value === opt || quizOk.value === false)) return 'ok';
  if (opt === quizPicked.value && opt !== q.answer) return 'bad';
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
    /* layout fullscreen */
  }
}

function onFullscreenChange() {
  isFullscreen.value = document.fullscreenElement === shellEl.value;
}

onMounted(() => document.addEventListener('fullscreenchange', onFullscreenChange));
onUnmounted(() => document.removeEventListener('fullscreenchange', onFullscreenChange));
</script>

<template>
  <div ref="shellEl" class="mf" :class="{ 'is-fs': isFullscreen }" aria-label="Bot defense lesson">
    <header class="mf-header">
      <NuxtLink to="/insights/notes" class="mf-brand">Bots at the edge</NuxtLink>
      <div class="mf-meta">
        <NoteViews slug="bot-defense" class="mf-step" />
        <span class="mf-step">4 explain · practice · master</span>
        <div class="step-dots" aria-label="Explain steps">
          <button
            v-for="(_, i) in botSteps"
            :key="i"
            type="button"
            class="step-dot"
            :class="{
              active: currentPhase === 'explain' && currentStep === i,
              done: currentPhase !== 'explain' || currentStep > i,
            }"
            :disabled="currentPhase !== 'explain' || i > currentStep + 1"
            :aria-label="`Step ${i + 1}`"
            @click="goStep(i)"
          />
        </div>
        <button type="button" class="mf-tool" :aria-pressed="!rightOpen" @click="toggleRight">
          <PanelRightClose v-if="rightOpen" :size="14" />
          <PanelRightOpen v-else :size="14" />
          {{ rightOpen ? 'Hide notes' : 'Notes' }}
        </button>
        <button type="button" class="mf-tool" @click="toggleFullscreen">
          <Minimize2 v-if="isFullscreen" :size="14" />
          <Maximize2 v-else :size="14" />
          {{ isFullscreen ? 'Exit' : 'Fullscreen' }}
        </button>
        <InsightsReadingToggle />
      </div>
    </header>

    <div
      ref="bodyEl"
      class="mf-body"
      :class="{ 'is-dragging': dragging, 'is-notes-closed': !rightOpen }"
    >
      <section class="mf-graph" :style="leftStyle" aria-label="Traffic playground">
        <div class="phase-tabs" role="tablist">
          <button type="button" class="phase-tab" :class="{ on: currentPhase === 'explain' }" @click="setPhase('explain')">
            Explain
          </button>
          <button
            type="button"
            class="phase-tab"
            :class="{ on: currentPhase === 'practice' }"
            :disabled="!practiceUnlocked"
            @click="setPhase('practice')"
          >
            Practice
          </button>
          <button
            type="button"
            class="phase-tab"
            :class="{ on: currentPhase === 'master' }"
            :disabled="!masterUnlocked"
            @click="setPhase('master')"
          >
            Master
          </button>
        </div>

        <p class="stage-label">{{ stageLabel }}</p>

        <template v-if="currentPhase !== 'master'">
          <div v-if="currentPhase === 'practice'" class="defense-bar">
            <button
              v-for="d in botDefenses"
              :key="d.id"
              type="button"
              class="def-btn"
              :class="{ on: defenses[d.id] }"
              :title="d.blurb"
              @click="toggleDefense(d.id)"
            >
              {{ d.label }}
            </button>
          </div>

          <div class="metric-cards">
            <div class="metric-card">
              <div class="metric-val is-allow">{{ counts.allow }}</div>
              <div class="metric-label">Allow</div>
            </div>
            <div class="metric-card">
              <div class="metric-val is-challenge">{{ counts.challenge }}</div>
              <div class="metric-label">Challenge</div>
            </div>
            <div class="metric-card">
              <div class="metric-val is-block">{{ counts.block }}</div>
              <div class="metric-label">Block</div>
            </div>
          </div>

          <div class="req-list">
            <button
              v-for="row in outcomes"
              :key="row.req.id"
              type="button"
              class="req-card"
              :class="{
                dim: !isFocused(row.req.id),
                on: currentPhase === 'practice' && classifyId === row.req.id,
              }"
              :style="{ '--k': BOT_KIND_META[row.req.kind].color }"
              @click="currentPhase === 'practice' && selectRequest(row.req.id)"
            >
              <header>
                <i class="req-dot" />
                <strong>{{ BOT_KIND_META[row.req.kind].label }}</strong>
                <span class="req-action" :class="`is-${row.action}`">{{ row.action }}</span>
              </header>
              <p class="req-path">{{ row.req.path }}</p>
              <p class="req-meta">
                {{ row.req.ua }} · {{ row.req.rps }} rps · score {{ row.req.score }}
              </p>
              <p v-if="isFocused(row.req.id) || currentPhase === 'practice'" class="req-note">
                {{ row.req.note }}
              </p>
            </button>
          </div>

          <div v-if="currentPhase === 'practice'" class="classify-box">
            <p class="classify-prompt">
              With current toggles, what should happen to
              <strong>{{ activeRequest.path }}</strong>?
            </p>
            <div class="opt-row">
              <button
                type="button"
                class="opt-btn"
                :class="classifyClass('allow')"
                @click="guessAction('allow')"
              >
                Allow
              </button>
              <button
                type="button"
                class="opt-btn"
                :class="classifyClass('challenge')"
                @click="guessAction('challenge')"
              >
                Challenge
              </button>
              <button
                type="button"
                class="opt-btn"
                :class="classifyClass('block')"
                @click="guessAction('block')"
              >
                Block
              </button>
            </div>
            <p class="feedback" :class="{ good: classifyOk === true, bad: classifyOk === false }">
              {{ classifyFeedback }}
            </p>
          </div>
        </template>

        <template v-else>
          <div class="task-card">
            <h3 class="quiz-q">{{ quiz.q }}</h3>
            <div class="opt-grid">
              <button
                v-for="opt in quiz.options"
                :key="opt"
                type="button"
                class="opt-btn"
                :class="quizClass(opt)"
                @click="answerQuiz(opt)"
              >
                {{ opt }}
              </button>
            </div>
            <p class="feedback" :class="{ good: quizOk === true, bad: quizOk === false }">
              {{ quizFeedback }}
            </p>
          </div>
        </template>

        <div class="controls-bar">
          <button v-if="currentPhase === 'explain'" type="button" class="ctrl-btn primary" @click="nextExplain">
            {{ step.nextLabel }}
          </button>
          <button type="button" class="ctrl-btn" @click="resetLesson">Reset</button>
        </div>
      </section>

      <InsightsSplitHandle
        v-show="rightOpen"
        :dragging="dragging"
        :value="leftPct"
        :min="28"
        :max="68"
        @pointerdown="onHandlePointerDown"
        @keydown="onHandleKeydown"
      />

      <section v-show="rightOpen" ref="lessonEl" class="mf-lesson" aria-label="Explanation">
        <template v-if="currentPhase === 'master'">
          <p class="lesson-tag">Master · Quiz</p>
          <h3>Check what stuck</h3>
          <p>Why bots grow, stuffing defenses, good crawlers, and Turnstile’s job.</p>
        </template>
        <template v-else-if="currentPhase === 'practice'">
          <p class="lesson-tag">Practice · Edge policy</p>
          <h3>Toggle defenses, predict the action</h3>
          <p>
            Turn WAF / rate limit / bot score / Turnstile on and off. Click a request, then guess allow,
            challenge, or block. Classify 3 correctly to unlock Master.
          </p>
          <div class="insight">
            <strong>Cloudflare mental model:</strong> layered controls. Edge cuts volume; your app still owns lockouts and idempotency.
          </div>
        </template>
        <template v-else>
          <p class="lesson-tag">Lesson · Bot defense</p>
          <h3>{{ step.title }}</h3>
          <p>{{ step.text }}</p>
          <div class="sql-block" v-html="step.sql" />
          <div class="insight" v-html="step.insight" />
          <button type="button" class="hint-box" @click="hintOpen = !hintOpen">
            {{ hintOpen ? step.hint : 'Click for a hint' }}
          </button>
        </template>
      </section>
    </div>
  </div>
</template>

<style scoped>
.mf {
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
  height: calc(100dvh - var(--insights-nav-offset, 4rem));
  display: flex;
  flex-direction: column;
  background: var(--mf-bg);
  color: var(--mf-text);
  overflow: hidden;
}
.mf.is-fs { height: 100dvh; }
:global(.insights-shell[data-mode='dark']) .mf {
  --mf-bg: #111; --mf-graph: #161616; --mf-dot: #2b2b2b; --mf-line: #2a2a2a;
  --mf-text: #f3f3f3; --mf-muted: #9a9a9a; --mf-panel: #1a1a1a;
}
.mf-header {
  min-height: 52px; border-bottom: 1px solid var(--mf-line);
  display: flex; align-items: center; gap: 16px; padding: 0 16px 0 20px;
  flex-shrink: 0; background: var(--mf-bg);
}
.mf-brand {
  font-family: 'DM Mono', ui-monospace, monospace; font-weight: 800; font-size: 14px;
  letter-spacing: 0.04em; color: var(--mf-text); text-decoration: none; flex-shrink: 0;
}
.mf-meta { display: flex; align-items: center; gap: 12px; margin-left: auto; flex-wrap: wrap; justify-content: flex-end; }
.mf-step { font-family: 'DM Mono', ui-monospace, monospace; font-size: 11px; color: var(--mf-muted); }
.mf-tool {
  height: 32px; padding: 0 12px; border: 1px solid var(--mf-line); background: var(--mf-panel);
  color: var(--mf-text); font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; cursor: pointer;
}
.mf-tool:hover { border-color: var(--mf-accent); color: var(--mf-accent); }
.step-dots { display: flex; gap: 8px; padding-left: 12px; border-left: 1px solid var(--mf-line); }
.step-dot {
  width: 10px; height: 10px; padding: 0; border: 0; border-radius: 50%;
  background: var(--mf-dot); cursor: pointer;
}
.step-dot.active { background: var(--lj-purple); box-shadow: 0 0 10px color-mix(in srgb, var(--lj-purple) 70%, transparent); }
.step-dot.done { background: var(--lj-blue); }
.step-dot:disabled { opacity: 0.45; cursor: not-allowed; }
.mf-body {
  flex: 1; min-height: 0; display: flex;
  background-color: var(--mf-graph);
  background-image: radial-gradient(var(--mf-dot) 1.5px, transparent 1.5px);
  background-size: 20px 20px;
}
.mf-graph { min-width: 0; padding: 20px 22px; overflow: auto; display: flex; flex-direction: column; gap: 14px; }
.mf-lesson {
  flex: 1; min-width: 0; padding: 24px 26px; overflow: auto; display: flex; flex-direction: column; gap: 16px;
  background: var(--mf-panel); border-left: 1px solid var(--mf-line);
}
.lesson-tag {
  font-family: 'DM Mono', ui-monospace, monospace; font-size: 11px; font-weight: 500;
  color: var(--lj-intent); text-transform: uppercase; letter-spacing: 0.12em; margin: 0;
}
.mf-lesson h3 { margin: 0; font-size: 1.25rem; font-weight: 800; line-height: 1.25; }
.mf-lesson > p { margin: 0; font-size: 14px; line-height: 1.7; color: var(--mf-muted); }
.phase-tabs { display: flex; gap: 6px; }
.phase-tab {
  height: 30px; padding: 0 12px; border-radius: 8px; border: 1px solid var(--mf-line);
  background: var(--mf-panel); color: var(--mf-muted); font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px; cursor: pointer;
}
.phase-tab.on {
  border-color: var(--lj-purple);
  background: color-mix(in srgb, var(--lj-purple) 14%, var(--mf-panel));
  color: var(--mf-text);
}
.phase-tab:disabled { opacity: 0.4; cursor: not-allowed; }
.stage-label {
  margin: 0; font-family: 'DM Mono', ui-monospace, monospace; font-size: 10px;
  text-transform: uppercase; letter-spacing: 0.15em; color: var(--mf-muted);
}
.defense-bar { display: flex; flex-wrap: wrap; gap: 8px; }
.def-btn {
  height: 30px; padding: 0 12px; border-radius: 8px; border: 1px solid var(--mf-line);
  background: var(--mf-panel); color: var(--mf-muted); font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px; cursor: pointer;
}
.def-btn.on {
  border-color: var(--lj-blue);
  background: color-mix(in srgb, var(--lj-blue) 14%, var(--mf-panel));
  color: var(--mf-text);
}
.metric-cards { display: flex; gap: 10px; flex-wrap: wrap; }
.metric-card {
  flex: 1; min-width: 90px; padding: 12px; border-radius: 10px;
  background: var(--mf-panel); border: 1px solid var(--mf-line); text-align: center;
}
.metric-val { font-family: 'DM Mono', ui-monospace, monospace; font-size: 22px; font-weight: 500; }
.metric-val.is-allow { color: var(--lj-ok); }
.metric-val.is-challenge { color: var(--lj-gold); }
.metric-val.is-block { color: var(--lj-bad); }
.metric-label {
  font-size: 11px; color: var(--mf-muted); margin-top: 4px;
  font-family: 'DM Mono', ui-monospace, monospace; text-transform: uppercase; letter-spacing: 0.05em;
}
.req-list {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;
}
.req-card {
  text-align: left; border: 1px solid var(--mf-line); border-radius: 10px; background: var(--mf-panel);
  padding: 12px; cursor: default; border-top: 3px solid var(--k); display: flex; flex-direction: column; gap: 6px;
}
.req-card.on { outline: 2px solid color-mix(in srgb, var(--lj-purple) 50%, transparent); }
.req-card.dim { opacity: 0.45; }
.req-card header { display: flex; align-items: center; gap: 8px; font-family: 'DM Mono', ui-monospace, monospace; font-size: 12px; }
.req-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--k); }
.req-action {
  margin-left: auto; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase;
  padding: 2px 6px; border-radius: 4px;
}
.req-action.is-allow { color: var(--lj-ok); background: color-mix(in srgb, var(--lj-ok) 12%, transparent); }
.req-action.is-challenge { color: var(--lj-gold); background: color-mix(in srgb, var(--lj-gold) 14%, transparent); }
.req-action.is-block { color: var(--lj-bad); background: color-mix(in srgb, var(--lj-bad) 12%, transparent); }
.req-path { margin: 0; font-family: 'DM Mono', ui-monospace, monospace; font-size: 12px; color: var(--mf-text); }
.req-meta, .req-note { margin: 0; font-size: 11px; line-height: 1.45; color: var(--mf-muted); }
.classify-box, .task-card {
  border: 1px solid var(--mf-line); border-radius: 10px; background: var(--mf-panel); padding: 14px;
  display: flex; flex-direction: column; gap: 10px;
}
.classify-prompt, .quiz-q { margin: 0; font-size: 14px; font-weight: 700; line-height: 1.4; }
.opt-row { display: flex; flex-wrap: wrap; gap: 8px; }
.opt-grid { display: flex; flex-direction: column; gap: 8px; }
.opt-btn {
  padding: 10px 12px; border-radius: 8px; border: 1px solid var(--mf-line);
  background: var(--mf-graph); color: var(--mf-text); font-size: 13px; cursor: pointer; text-align: left;
}
.opt-btn:hover { border-color: var(--lj-purple); }
.opt-btn.ok { border-color: var(--lj-ok); color: var(--lj-ok); background: color-mix(in srgb, var(--lj-ok) 10%, var(--mf-panel)); }
.opt-btn.bad { border-color: var(--lj-bad); color: var(--lj-bad); background: color-mix(in srgb, var(--lj-bad) 10%, var(--mf-panel)); }
.feedback { min-height: 1.3em; margin: 0; font-size: 13px; color: var(--mf-muted); }
.feedback.good { color: var(--lj-ok); }
.feedback.bad { color: var(--lj-bad); }
.controls-bar { display: flex; gap: 10px; flex-wrap: wrap; margin-top: auto; }
.ctrl-btn {
  padding: 10px 18px; border: 1.5px solid var(--mf-line); background: var(--mf-panel);
  border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; color: var(--mf-text);
}
.ctrl-btn.primary {
  background: linear-gradient(180deg, #8b7cff 0%, #4a9eff 100%); color: #fff; border-color: transparent;
}
.sql-block {
  font-family: 'DM Mono', ui-monospace, monospace; font-size: 12px; background: var(--mf-graph);
  color: var(--mf-text); border: 1px solid var(--mf-line); padding: 16px; border-radius: 6px;
  line-height: 1.7; white-space: pre-wrap; word-break: break-word;
}
.sql-block :deep(.sql-kw) { color: var(--lj-intent); font-weight: 500; }
.sql-block :deep(.sql-com) { color: var(--mf-muted); }
.insight {
  padding: 14px; border-radius: 6px;
  background: color-mix(in srgb, var(--lj-purple) 8%, var(--mf-graph));
  border-left: 3px solid var(--lj-purple); font-size: 13px; color: var(--mf-muted); line-height: 1.6;
}
.insight :deep(strong) { color: var(--mf-text); }
.hint-box {
  padding: 10px 12px; border-radius: 8px; border: 0; border-left: 3px solid var(--lj-gold);
  background: color-mix(in srgb, var(--lj-gold) 10%, var(--mf-graph));
  font-size: 13px; color: var(--mf-muted); text-align: left; cursor: pointer; line-height: 1.55;
}
@media (max-width: 860px) {
  .mf-body { flex-direction: column; }
  .mf-graph { flex: 1 1 auto !important; width: 100% !important; }
  .mf-lesson { border-left: none; border-top: 1px solid var(--mf-line); }
  .step-dots { display: none; }
  .req-list { grid-template-columns: 1fr; }
}
</style>
