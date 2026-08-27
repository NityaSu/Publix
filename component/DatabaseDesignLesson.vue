<script setup lang="ts">
import { Maximize2, Minimize2, PanelRightClose, PanelRightOpen } from 'lucide-vue-next';
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import InsightsReadingToggle from '~/component/InsightsReadingToggle.vue';
import NoteViews from '~/component/NoteViews.vue';
import InsightsSplitHandle from '~/component/InsightsSplitHandle.vue';
import { useInsightsSplit } from '~/composables/useInsightsSplit';
import {
  dbPracticeTasks,
  dbQuizzes,
  dbSteps,
  dbTables,
  dbTableById,
} from '~/data/databaseDesign';

type Phase = 'explain' | 'practice' | 'master';

const isFullscreen = ref(false);
const shellEl = ref<HTMLElement | null>(null);
const lessonEl = ref<HTMLElement | null>(null);

const currentStep = ref(0);
const currentPhase = ref<Phase>('explain');
const practiceUnlocked = ref(false);
const masterUnlocked = ref(false);
const hintOpen = ref(false);

const practiceIndex = ref(0);
const practicePicked = ref<string | null>(null);
const practiceOk = ref<boolean | null>(null);
const practiceFeedback = ref('');
const practiceSolved = ref(0);

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
} = useInsightsSplit({ storageKey: 'database-design', defaultPct: 54 });

const step = computed(() => dbSteps[currentStep.value]!);
const visibleTables = computed(() =>
  step.value.tables.map((id) => dbTableById(id)!).filter(Boolean),
);
const practiceTask = computed(() => dbPracticeTasks[practiceIndex.value]!);
const quiz = computed(() => dbQuizzes[currentQuiz.value % dbQuizzes.length]!);

const stageLabel = computed(() => {
  if (currentPhase.value === 'practice') {
    return `Practice ${practiceIndex.value + 1}/${dbPracticeTasks.length} · ${practiceSolved.value} solved`;
  }
  if (currentPhase.value === 'master') return 'Master: Quiz';
  return step.value.label;
});

function colBadge(col: { pk?: boolean; fk?: string; unique?: boolean; indexed?: boolean }) {
  const bits: string[] = [];
  if (col.pk) bits.push('PK');
  if (col.fk) bits.push('FK');
  if (col.unique) bits.push('UQ');
  if (col.indexed && !col.pk && !col.unique) bits.push('IDX');
  return bits.join(' · ');
}

function showColFlags(col: { pk?: boolean; fk?: string; unique?: boolean; indexed?: boolean }) {
  if (currentPhase.value !== 'explain') {
    return Boolean(col.pk || col.fk || col.unique || col.indexed);
  }
  const v = step.value.visual;
  if (v === 'entities') return Boolean(col.pk);
  if (v === 'relationships') return Boolean(col.pk || col.fk);
  if (v === 'keys') return Boolean(col.pk || col.fk || col.unique);
  return Boolean(col.pk || col.fk || col.unique || col.indexed);
}

function goStep(idx: number) {
  if (currentPhase.value !== 'explain') return;
  if (idx < 0 || idx >= dbSteps.length || idx > currentStep.value + 1) return;
  currentStep.value = idx;
  hintOpen.value = false;
}

function nextExplain() {
  if (currentStep.value < dbSteps.length - 1) {
    goStep(currentStep.value + 1);
    return;
  }
  practiceUnlocked.value = true;
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
  practiceIndex.value = 0;
  practicePicked.value = null;
  practiceOk.value = null;
  practiceFeedback.value = '';
  practiceSolved.value = 0;
  currentQuiz.value = 0;
  quizPicked.value = null;
  quizFeedback.value = '';
  quizOk.value = null;
}

function answerPractice(id: string) {
  if (practiceOk.value === true) return;
  const task = practiceTask.value;
  practicePicked.value = id;
  if (id === task.answer) {
    practiceOk.value = true;
    practiceFeedback.value = `Correct! ${task.explain}`;
    practiceSolved.value = Math.min(dbPracticeTasks.length, practiceSolved.value + 1);
    window.setTimeout(() => {
      if (practiceIndex.value < dbPracticeTasks.length - 1) {
        practiceIndex.value += 1;
        practicePicked.value = null;
        practiceOk.value = null;
        practiceFeedback.value = '';
      } else {
        masterUnlocked.value = true;
        practiceFeedback.value = 'Practice complete — Master unlocked.';
      }
    }, 1100);
  } else {
    practiceOk.value = false;
    practiceFeedback.value = `Not quite. ${task.explain}`;
  }
}

function practiceClass(id: string) {
  if (!practicePicked.value) return '';
  const task = practiceTask.value;
  if (id === task.answer && (practicePicked.value === id || practiceOk.value === false)) return 'ok';
  if (id === practicePicked.value && id !== task.answer) return 'bad';
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
  <div ref="shellEl" class="mf" :class="{ 'is-fs': isFullscreen }" aria-label="Database design lesson">
    <header class="mf-header">
      <NuxtLink to="/insights/notes" class="mf-brand">Schema design for backends</NuxtLink>
      <div class="mf-meta">
        <NoteViews slug="database-design" class="mf-step" />
        <span class="mf-step">4 explain · practice · master</span>
        <div class="step-dots" aria-label="Explain steps">
          <button
            v-for="(_, i) in dbSteps"
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
      <section class="mf-graph" :style="leftStyle" aria-label="Schema playground">
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

        <template v-if="currentPhase === 'explain'">
          <div class="er-board" :data-visual="step.visual">
            <svg v-if="step.edges.length" class="er-edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path
                v-for="(e, i) in step.edges"
                :key="i"
                class="er-edge"
                :d="i === 0 ? 'M 28 42 C 40 42, 40 22, 52 22' : i === 1 ? 'M 28 55 C 40 55, 40 38, 52 38' : 'M 62 58 C 70 58, 70 72, 78 72'"
              />
            </svg>
            <article
              v-for="table in visibleTables"
              :key="table.id"
              class="er-table"
              :class="[`is-${table.id}`, { 'is-hot': step.visual !== 'entities' }]"
              :style="{ '--t': table.color }"
            >
              <header>
                <i class="er-dot" />
                <strong>{{ table.name }}</strong>
              </header>
              <ul>
                <li
                  v-for="col in table.cols"
                  :key="col.name"
                  :class="{
                    'is-pk': col.pk && showColFlags(col),
                    'is-fk': col.fk && showColFlags(col),
                    'is-uq': col.unique && showColFlags(col),
                    'is-idx': col.indexed && showColFlags(col) && step.visual === 'indexes',
                  }"
                >
                  <span>{{ col.name }}</span>
                  <em>{{ col.type }}</em>
                  <b v-if="showColFlags(col) && colBadge(col)">{{ colBadge(col) }}</b>
                </li>
              </ul>
            </article>
          </div>
          <div class="legend">
            <span><i class="leg pk" /> Primary key</span>
            <span><i class="leg fk" /> Foreign key</span>
            <span><i class="leg uq" /> Unique</span>
            <span><i class="leg idx" /> Index</span>
          </div>
        </template>

        <template v-else-if="currentPhase === 'practice'">
          <div class="task-card">
            <p class="task-prompt">{{ practiceTask.prompt }}</p>
            <div class="opt-grid">
              <button
                v-for="opt in practiceTask.options"
                :key="opt.id"
                type="button"
                class="opt-btn"
                :class="practiceClass(opt.id)"
                @click="answerPractice(opt.id)"
              >
                {{ opt.label }}
              </button>
            </div>
            <p class="feedback" :class="{ good: practiceOk === true, bad: practiceOk === false }">
              {{ practiceFeedback }}
            </p>
          </div>
          <div class="er-board is-mini">
            <article
              v-for="table in dbTables"
              :key="table.id"
              class="er-table is-mini"
              :style="{ '--t': table.color }"
            >
              <header><i class="er-dot" /><strong>{{ table.name }}</strong></header>
            </article>
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
          <p>Ownership, foreign keys, uniqueness as business law, and when to index.</p>
        </template>
        <template v-else-if="currentPhase === 'practice'">
          <p class="lesson-tag">Practice · Schema judgment</p>
          <h3>Decide like a backend owner</h3>
          <p>Each prompt is a real review comment. Pick the constraint or index that protects the product.</p>
          <div class="insight">
            <strong>Goal:</strong> say why the rule lives in the database — races, retries, and money.
          </div>
        </template>
        <template v-else>
          <p class="lesson-tag">Lesson · Database design</p>
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
.er-board {
  position: relative; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px; min-height: 280px;
}
.er-board.is-mini { min-height: 0; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.er-edges { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
.er-edge { fill: none; stroke: color-mix(in srgb, var(--lj-purple) 55%, transparent); stroke-width: 0.8; stroke-dasharray: 2 1.5; }
.er-table {
  position: relative; z-index: 1; border: 1px solid var(--mf-line); border-radius: 10px;
  background: var(--mf-panel); overflow: hidden; border-top: 3px solid var(--t);
}
.er-table.is-mini { padding-bottom: 4px; }
.er-table header {
  display: flex; align-items: center; gap: 8px; padding: 10px 12px;
  border-bottom: 1px solid var(--mf-line); font-family: 'DM Mono', ui-monospace, monospace; font-size: 12px;
}
.er-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--t); }
.er-table ul { list-style: none; margin: 0; padding: 8px; display: flex; flex-direction: column; gap: 4px; }
.er-table li {
  display: grid; grid-template-columns: 1fr auto auto; gap: 8px; align-items: center;
  padding: 6px 8px; border-radius: 6px; font-size: 12px; font-family: 'DM Mono', ui-monospace, monospace;
  color: var(--mf-muted);
}
.er-table li span { color: var(--mf-text); }
.er-table li em { font-style: normal; font-size: 10px; }
.er-table li b { font-size: 9px; letter-spacing: 0.06em; color: var(--lj-intent); }
.er-table li.is-pk { background: color-mix(in srgb, var(--lj-blue) 12%, transparent); }
.er-table li.is-fk { background: color-mix(in srgb, var(--lj-purple) 12%, transparent); }
.er-table li.is-uq { background: color-mix(in srgb, var(--lj-intent) 10%, transparent); }
.er-table li.is-idx { outline: 1px dashed var(--lj-gold); }
.legend {
  display: flex; flex-wrap: wrap; gap: 12px; font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px; color: var(--mf-muted);
}
.legend span { display: inline-flex; align-items: center; gap: 6px; }
.leg { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
.leg.pk { background: color-mix(in srgb, var(--lj-blue) 50%, transparent); }
.leg.fk { background: color-mix(in srgb, var(--lj-purple) 50%, transparent); }
.leg.uq { background: color-mix(in srgb, var(--lj-intent) 50%, transparent); }
.leg.idx { border: 1px dashed var(--lj-gold); }
.task-card {
  border: 1px solid var(--mf-line); border-radius: 10px; background: var(--mf-panel); padding: 16px;
  display: flex; flex-direction: column; gap: 12px;
}
.task-prompt, .quiz-q { margin: 0; font-size: 15px; font-weight: 700; color: var(--mf-text); line-height: 1.4; }
.opt-grid { display: flex; flex-direction: column; gap: 8px; }
.opt-btn {
  text-align: left; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--mf-line);
  background: var(--mf-graph); color: var(--mf-text); font-size: 13px; cursor: pointer;
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
  .er-board { grid-template-columns: 1fr; }
  .er-board.is-mini { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
