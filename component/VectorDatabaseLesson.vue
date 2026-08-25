<script setup lang="ts">
import { Maximize2, Minimize2, PanelRightClose, PanelRightOpen } from 'lucide-vue-next';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import InsightsReadingToggle from '~/component/InsightsReadingToggle.vue';
import NoteViews from '~/component/NoteViews.vue';
import InsightsSplitHandle from '~/component/InsightsSplitHandle.vue';
import { useInsightsSplit } from '~/composables/useInsightsSplit';
import {
  VEC_CAT_COLORS,
  VEC_LINE,
  VEC_NEAREST,
  VEC_QUERY_COLOR,
  vecDocs,
  vecQuizzes,
  vecSteps,
  type VecDoc,
} from '~/data/vectorDatabase';

type Phase = 'explain' | 'practice' | 'master';
type SearchMode = 'brute' | 'hnsw';

interface QueryPoint {
  x: number;
  y: number;
  text: string;
}

interface Scored {
  doc: VecDoc;
  distance: number;
}

const BASE_W = 600;
const BASE_H = 320;

const isFullscreen = ref(false);
const shellEl = ref<HTMLElement | null>(null);
const lessonEl = ref<HTMLElement | null>(null);
const canvasEl = ref<HTMLCanvasElement | null>(null);
const canvasWrapEl = ref<HTMLElement | null>(null);

const currentStep = ref(0);
const currentPhase = ref<Phase>('explain');
const practiceUnlocked = ref(false);
const masterUnlocked = ref(false);
const hintOpen = ref(false);
const searchMode = ref<SearchMode>('brute');
const query = ref<QueryPoint | null>(null);
const nearest = ref<Scored[]>([]);
const searchTime = ref('—');
const floatOffset = ref(0);

const currentQuiz = ref(0);
const quizPicked = ref<string | null>(null);
const quizFeedback = ref('');
const quizOk = ref<boolean | null>(null);

let rafId = 0;
let resizeObserver: ResizeObserver | null = null;

const {
  bodyEl,
  leftPct,
  leftStyle,
  dragging,
  rightOpen,
  toggleRight,
  onHandlePointerDown,
  onHandleKeydown,
} = useInsightsSplit({ storageKey: 'vector-database', defaultPct: 52 });

const step = computed(() => vecSteps[currentStep.value]!);
const quiz = computed(() => vecQuizzes[currentQuiz.value % vecQuizzes.length]!);

const stageLabel = computed(() => {
  if (currentPhase.value === 'practice') {
    return 'Practice: Click anywhere to search. Toggle modes below.';
  }
  if (currentPhase.value === 'master') return 'Master: Quiz';
  return step.value.label;
});

const listItems = computed(() => {
  if (nearest.value.length > 0) return nearest.value;
  return vecDocs.map((doc) => ({ doc, distance: null as number | null }));
});

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function scaledDoc(doc: VecDoc, w: number, h: number) {
  return {
    ...doc,
    x: (doc.x / BASE_W) * w,
    y: (doc.y / BASE_H) * h,
  };
}

function findNearest(k: number) {
  const q = query.value;
  const canvas = canvasEl.value;
  if (!q || !canvas) {
    nearest.value = [];
    return;
  }
  const w = canvas.width;
  const h = canvas.height;
  const scored = vecDocs.map((doc) => {
    const s = scaledDoc(doc, w, h);
    return { doc, distance: dist(q, s) };
  });
  scored.sort((a, b) => a.distance - b.distance);
  nearest.value = scored.slice(0, k);
}

function applyStepDefaults(idx: number) {
  const s = vecSteps[idx]!;
  hintOpen.value = false;
  searchTime.value = s.searchTime;

  if (idx === 0) {
    query.value = null;
    nearest.value = [];
    return;
  }

  const canvas = canvasEl.value;
  if (!query.value && canvas) {
    query.value = {
      x: (130 / BASE_W) * canvas.width,
      y: (85 / BASE_H) * canvas.height,
      text: 'best pizza near me',
    };
  }
  findNearest(5);
}

function goStep(idx: number) {
  if (idx < 0 || idx >= vecSteps.length) return;
  if (currentPhase.value !== 'explain') return;
  if (idx > currentStep.value + 1) return;
  currentStep.value = idx;
  applyStepDefaults(idx);
}

function nextExplain() {
  if (currentStep.value < vecSteps.length - 1) {
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

  if (phase === 'practice') {
    masterUnlocked.value = true;
    searchTime.value = searchMode.value === 'hnsw' ? '0.3ms' : '12ms';
    if (!query.value) {
      const canvas = canvasEl.value;
      if (canvas) {
        query.value = {
          x: (130 / BASE_W) * canvas.width,
          y: (85 / BASE_H) * canvas.height,
          text: 'your query',
        };
        findNearest(5);
      }
    }
  }

  if (phase === 'master') {
    quizPicked.value = null;
    quizFeedback.value = '';
    quizOk.value = null;
  }

  nextTick(() => lessonEl.value?.scrollTo({ top: 0 }));
}

function setSearchMode(mode: SearchMode) {
  searchMode.value = mode;
  searchTime.value = mode === 'hnsw' ? '0.3ms' : '12ms';
}

function resetLesson() {
  currentStep.value = 0;
  currentPhase.value = 'explain';
  query.value = null;
  nearest.value = [];
  searchTime.value = '—';
  hintOpen.value = false;
  searchMode.value = 'brute';
  currentQuiz.value = 0;
  quizPicked.value = null;
  quizFeedback.value = '';
  quizOk.value = null;
}

function onCanvasClick(event: MouseEvent) {
  const canvas = canvasEl.value;
  if (!canvas) return;
  if (currentPhase.value === 'master') return;
  if (currentPhase.value === 'explain' && currentStep.value < 1) return;

  const rect = canvas.getBoundingClientRect();
  query.value = {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
    text: 'your query',
  };
  findNearest(5);

  if (currentPhase.value === 'practice') {
    searchTime.value = searchMode.value === 'hnsw' ? '0.3ms' : '8ms';
  } else {
    searchTime.value = currentStep.value >= 3 ? '0.3ms' : '8ms';
  }
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

function optionClass(opt: string) {
  if (!quizPicked.value) return '';
  const q = quiz.value;
  if (opt === q.answer && (quizPicked.value === opt || quizOk.value === false)) return 'correct';
  if (opt === quizPicked.value && opt !== q.answer) return 'wrong';
  return '';
}

function resizeCanvas() {
  const canvas = canvasEl.value;
  const wrap = canvasWrapEl.value;
  if (!canvas || !wrap) return;
  const prevW = canvas.width || BASE_W;
  const prevH = canvas.height || BASE_H;
  const nextW = Math.max(280, wrap.clientWidth);
  const nextH = 320;
  if (query.value && prevW > 0 && prevH > 0) {
    query.value = {
      ...query.value,
      x: (query.value.x / prevW) * nextW,
      y: (query.value.y / prevH) * nextH,
    };
  }
  canvas.width = nextW;
  canvas.height = nextH;
  if (query.value) findNearest(5);
}

function draw() {
  const canvas = canvasEl.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const t = floatOffset.value;
  ctx.clearRect(0, 0, w, h);

  const grid =
    getComputedStyle(canvas).getPropertyValue('--vec-grid').trim() || '#e2e8f0';
  ctx.strokeStyle = grid;
  ctx.lineWidth = 0.5;
  for (let i = 0; i < w; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, h);
    ctx.stroke();
  }
  for (let j = 0; j < h; j += 40) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(w, j);
    ctx.stroke();
  }

  const q = query.value;
  const scaled = vecDocs.map((d) => scaledDoc(d, w, h));
  const nearestIds = new Set(nearest.value.map((n) => n.doc.id));

  if (q && nearest.value.length > 0) {
    for (const n of nearest.value) {
      const d = scaled.find((s) => s.id === n.doc.id);
      if (!d) continue;
      ctx.beginPath();
      ctx.strokeStyle = VEC_LINE;
      ctx.lineWidth = 1.5;
      ctx.moveTo(q.x, q.y);
      ctx.lineTo(d.x, d.y);
      ctx.stroke();
    }
  }

  for (const d of scaled) {
    const isNearest = nearestIds.has(d.id);
    const floatY = Math.sin(t + d.id * 0.5) * 2;
    const y = d.y + floatY;

    if (isNearest) {
      ctx.beginPath();
      ctx.arc(d.x, y, 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(139, 124, 255, 0.12)';
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(d.x, y, isNearest ? 7 : 5, 0, Math.PI * 2);
    ctx.fillStyle = VEC_CAT_COLORS[d.category];
    ctx.fill();

    if (isNearest) {
      ctx.strokeStyle = VEC_NEAREST;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  if (q) {
    const qFloatY = Math.sin(t * 1.5) * 3;
    const qy = q.y + qFloatY;
    ctx.beginPath();
    ctx.arc(q.x, qy, 10, 0, Math.PI * 2);
    ctx.fillStyle = VEC_QUERY_COLOR;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    const pulse = (Math.sin(t * 3) + 1) / 2;
    ctx.beginPath();
    ctx.arc(q.x, qy, 10 + pulse * 15, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(123, 45, 142, ${0.35 - pulse * 0.22})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function loop() {
  floatOffset.value += 0.02;
  draw();
  rafId = requestAnimationFrame(loop);
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
    /* layout fullscreen still works */
  }
}

function onFullscreenChange() {
  if (document.fullscreenElement) {
    isFullscreen.value = document.fullscreenElement === shellEl.value;
    return;
  }
  isFullscreen.value = false;
}

watch(currentPhase, () => nextTick(() => resizeCanvas()));

onMounted(async () => {
  await nextTick();
  resizeCanvas();
  applyStepDefaults(0);
  loop();
  document.addEventListener('fullscreenchange', onFullscreenChange);
  if (canvasWrapEl.value) {
    resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
      draw();
    });
    resizeObserver.observe(canvasWrapEl.value);
  }
});

onUnmounted(() => {
  cancelAnimationFrame(rafId);
  resizeObserver?.disconnect();
  document.removeEventListener('fullscreenchange', onFullscreenChange);
});
</script>

<template>
  <div ref="shellEl" class="mf" :class="{ 'is-fs': isFullscreen }" aria-label="Vector database lesson">
    <header class="mf-header">
      <NuxtLink to="/insights/notes" class="mf-brand">Similarity search in vector space</NuxtLink>
      <div class="mf-meta">
        <NoteViews slug="vector-database" class="mf-step" />
        <span class="mf-step">4 explain · practice · master</span>
        <div class="step-dots" aria-label="Explain steps">
          <button
            v-for="(_, i) in vecSteps"
            :key="i"
            type="button"
            class="step-dot"
            :class="{
              active: currentPhase === 'explain' && currentStep === i,
              done: currentPhase !== 'explain' || currentStep > i,
            }"
            :aria-label="`Step ${i + 1}`"
            :disabled="currentPhase !== 'explain' || i > currentStep + 1"
            @click="goStep(i)"
          />
        </div>
        <button
          type="button"
          class="mf-tool"
          :aria-pressed="!rightOpen"
          :aria-label="rightOpen ? 'Hide notes panel' : 'Show notes panel'"
          @click="toggleRight"
        >
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
      <section class="mf-graph" :style="leftStyle" aria-label="Vector space playground">
        <div class="phase-tabs" role="tablist" aria-label="Lesson phase">
          <button
            type="button"
            class="phase-tab"
            :class="{ on: currentPhase === 'explain' }"
            @click="setPhase('explain')"
          >
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

        <template v-if="currentPhase !== 'master'">
          <p class="stage-label">{{ stageLabel }}</p>

          <div
            v-if="currentPhase === 'practice'"
            class="search-modes"
            role="group"
            aria-label="Search mode"
          >
            <button
              type="button"
              class="mode-btn"
              :class="{ on: searchMode === 'brute' }"
              @click="setSearchMode('brute')"
            >
              Brute force
            </button>
            <button
              type="button"
              class="mode-btn"
              :class="{ on: searchMode === 'hnsw' }"
              @click="setSearchMode('hnsw')"
            >
              HNSW approximate
            </button>
          </div>

          <div ref="canvasWrapEl" class="canvas-wrap">
            <canvas
              ref="canvasEl"
              class="vec-canvas"
              width="600"
              height="320"
              :style="{ cursor: currentPhase === 'explain' && currentStep < 1 ? 'default' : 'crosshair' }"
              @click="onCanvasClick"
            />
            <div class="canvas-legend">
              <span class="leg-item">
                <i class="leg-dot" :style="{ background: VEC_CAT_COLORS.food }" />
                Food
              </span>
              <span class="leg-item">
                <i class="leg-dot" :style="{ background: VEC_CAT_COLORS.tech }" />
                Tech
              </span>
              <span class="leg-item">
                <i class="leg-dot" :style="{ background: VEC_CAT_COLORS.travel }" />
                Travel
              </span>
              <span class="leg-item">
                <i class="leg-dot" :style="{ background: VEC_QUERY_COLOR }" />
                Your query
              </span>
            </div>
          </div>

          <div class="doc-list" aria-live="polite">
            <div
              v-for="(item, i) in listItems"
              :key="item.doc.id"
              class="doc-item"
              :class="{ matched: item.distance != null }"
            >
              <span class="doc-color" :style="{ background: VEC_CAT_COLORS[item.doc.category] }" />
              <span class="doc-text">
                <template v-if="item.distance != null">#{{ i + 1 }} </template>{{ item.doc.text }}
              </span>
              <span class="doc-dist">{{ item.distance != null ? item.distance.toFixed(1) : '' }}</span>
            </div>
          </div>

          <div class="metric-cards">
            <div class="metric-card">
              <div class="metric-val">15</div>
              <div class="metric-label">Documents</div>
            </div>
            <div class="metric-card">
              <div class="metric-val">384</div>
              <div class="metric-label">Dimensions</div>
            </div>
            <div class="metric-card">
              <div class="metric-val">{{ searchTime }}</div>
              <div class="metric-label">Search time</div>
            </div>
          </div>
        </template>

        <div v-else class="master-panel">
          <p class="stage-label">Question {{ (currentQuiz % vecQuizzes.length) + 1 }} / {{ vecQuizzes.length }}</p>
          <h3 class="quiz-q">{{ quiz.q }}</h3>
          <div class="quiz-options">
            <button
              v-for="opt in quiz.options"
              :key="opt"
              type="button"
              class="quiz-opt"
              :class="optionClass(opt)"
              @click="answerQuiz(opt)"
            >
              {{ opt }}
            </button>
          </div>
          <p class="quiz-feedback" :class="{ good: quizOk === true, bad: quizOk === false }">
            {{ quizFeedback }}
          </p>
        </div>

        <div class="controls-bar">
          <button
            v-if="currentPhase === 'explain'"
            type="button"
            class="ctrl-btn primary"
            @click="nextExplain"
          >
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

      <section
        v-show="rightOpen"
        ref="lessonEl"
        class="mf-lesson"
        aria-label="Explanation"
      >
        <template v-if="currentPhase === 'master'">
          <p class="lesson-tag">Master · Quiz</p>
          <h3>Check what stuck</h3>
          <p>
            Four questions on distance, meaning, indexes, and cosine similarity. Wrong answers stay marked —
            read the note, then try the next one when you get it right.
          </p>
          <div class="insight">
            <strong>Tip:</strong> Think of documents as points. Similarity is neighborhood, not shared words.
          </div>
        </template>
        <template v-else-if="currentPhase === 'practice'">
          <p class="lesson-tag">Practice · Free search</p>
          <h3>Explore the space</h3>
          <p>
            Click anywhere to place a query. Toggle brute force vs HNSW and watch the search-time metric.
            There are no wrong clicks — just see how clusters pull in the nearest neighbors.
          </p>
          <div class="sql-block" v-html="step.sql" />
          <div class="insight" v-html="step.insight" />
        </template>
        <template v-else>
          <p class="lesson-tag">Lesson 01 · Vector databases</p>
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
  --vec-grid: #e2e8f0;
  height: calc(100dvh - var(--insights-nav-offset, 4rem));
  display: flex;
  flex-direction: column;
  background: var(--mf-bg);
  color: var(--mf-text);
  overflow: hidden;
}

.mf.is-fs {
  height: 100dvh;
}

:global(.insights-shell[data-mode='dark']) .mf {
  --mf-bg: #111111;
  --mf-graph: #161616;
  --mf-dot: #2b2b2b;
  --mf-line: #2a2a2a;
  --mf-text: #f3f3f3;
  --mf-muted: #9a9a9a;
  --mf-panel: #1a1a1a;
  --vec-grid: #2a2a2a;
}

.mf-header {
  min-height: 52px;
  border-bottom: 1px solid var(--mf-line);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 16px 0 20px;
  flex-shrink: 0;
  background: var(--mf-bg);
}

.mf-brand {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 1px;
  color: var(--mf-text);
  text-decoration: none;
  flex-shrink: 0;
}

.mf-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.mf-step {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  color: var(--mf-muted);
}

.mf-tool {
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--mf-line);
  background: var(--mf-panel);
  color: var(--mf-text);
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.mf-tool:hover {
  border-color: var(--mf-accent);
  color: var(--mf-accent);
}

.step-dots {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  padding-left: 12px;
  border-left: 1px solid var(--mf-line);
}

.step-dot {
  width: 10px;
  height: 10px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--mf-dot);
  cursor: pointer;
  transition: all 0.35s ease;
}

.step-dot.active {
  background: var(--lj-purple);
  box-shadow: 0 0 10px color-mix(in srgb, var(--lj-purple) 70%, transparent);
}

.step-dot.done {
  background: var(--lj-blue);
}

.step-dot:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.mf-body {
  flex: 1;
  min-height: 0;
  display: flex;
  background-color: var(--mf-graph);
  background-image: radial-gradient(var(--mf-dot) 1.5px, transparent 1.5px);
  background-size: 20px 20px;
}

.mf-body.is-dragging {
  cursor: col-resize;
  user-select: none;
}

.mf-graph {
  min-width: 0;
  padding: 20px 22px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.mf-lesson {
  flex: 1;
  min-width: 0;
  padding: 24px 26px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--mf-panel);
  border-left: 1px solid var(--mf-line);
}

.lesson-tag {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 500;
  color: var(--lj-intent);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin: 0;
}

.mf-lesson h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.25;
  color: var(--mf-text);
}

.mf-lesson > p {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--mf-muted);
}

.phase-tabs {
  display: flex;
  gap: 6px;
}

.phase-tab,
.mode-btn {
  height: 30px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid var(--mf-line);
  background: var(--mf-panel);
  color: var(--mf-muted);
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.phase-tab.on,
.mode-btn.on {
  border-color: var(--lj-purple);
  background: color-mix(in srgb, var(--lj-purple) 14%, var(--mf-panel));
  color: var(--mf-text);
}

.phase-tab:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.stage-label {
  margin: 0;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--mf-muted);
}

.search-modes {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.canvas-wrap {
  background: var(--mf-panel);
  border: 1px solid var(--mf-line);
  border-radius: 10px;
  padding: 14px;
}

.vec-canvas {
  width: 100%;
  height: 320px;
  display: block;
  border-radius: 8px;
  background: color-mix(in srgb, var(--mf-graph) 80%, var(--mf-panel));
  --vec-grid: inherit;
}

.canvas-legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.leg-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--mf-muted);
  font-family: 'DM Mono', ui-monospace, monospace;
}

.leg-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.doc-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 180px;
  overflow-y: auto;
}

.doc-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--mf-panel);
  border: 1.5px solid transparent;
  font-size: 12px;
  font-family: 'DM Mono', ui-monospace, monospace;
}

.doc-item.matched {
  border-color: var(--lj-ok);
  background: color-mix(in srgb, var(--lj-ok) 8%, var(--mf-panel));
}

.doc-color {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.doc-text {
  flex: 1;
  color: var(--mf-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doc-dist {
  font-size: 10px;
  color: var(--mf-muted);
  min-width: 50px;
  text-align: right;
}

.metric-cards {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.metric-card {
  flex: 1;
  min-width: 100px;
  padding: 12px;
  border-radius: 10px;
  background: var(--mf-panel);
  border: 1px solid var(--mf-line);
  text-align: center;
}

.metric-val {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 22px;
  font-weight: 500;
  color: var(--mf-text);
}

.metric-label {
  font-size: 11px;
  color: var(--mf-muted);
  margin-top: 4px;
  font-family: 'DM Mono', ui-monospace, monospace;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.controls-bar {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  margin-top: auto;
}

.ctrl-btn {
  padding: 10px 18px;
  border: 1.5px solid var(--mf-line);
  background: var(--mf-panel);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: var(--mf-text);
  transition: all 0.2s ease;
}

.ctrl-btn:hover {
  border-color: var(--lj-purple);
  color: var(--lj-purple);
}

.ctrl-btn.primary {
  background: linear-gradient(180deg, #8b7cff 0%, #4a9eff 100%);
  color: #fff;
  border-color: transparent;
}

.ctrl-btn.primary:hover {
  opacity: 0.92;
}

.sql-block {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 12px;
  background: var(--mf-graph);
  color: var(--mf-text);
  border: 1px solid var(--mf-line);
  padding: 16px;
  border-radius: 6px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.sql-block :deep(.sql-kw) {
  color: var(--lj-intent);
  font-weight: 500;
}

.sql-block :deep(.sql-fn) {
  color: var(--lj-blue);
}

.sql-block :deep(.sql-str) {
  color: var(--lj-gold);
}

.insight {
  padding: 14px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--lj-purple) 8%, var(--mf-graph));
  border-left: 3px solid var(--lj-purple);
  font-size: 13px;
  color: var(--mf-muted);
  line-height: 1.6;
}

.insight :deep(strong) {
  color: var(--mf-text);
  font-weight: 700;
}

.hint-box {
  padding: 10px 12px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--lj-gold) 10%, var(--mf-graph));
  border: 0;
  border-left: 3px solid var(--lj-gold);
  font-size: 13px;
  color: var(--mf-muted);
  text-align: left;
  cursor: pointer;
  line-height: 1.55;
}

.master-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
  padding: 8px 0;
}

.quiz-q {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--mf-text);
}

.quiz-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quiz-opt {
  padding: 8px 14px;
  border: 1px solid var(--mf-line);
  background: var(--mf-panel);
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: var(--mf-text);
  transition: all 0.2s ease;
}

.quiz-opt:hover {
  border-color: var(--lj-purple);
}

.quiz-opt.correct {
  background: color-mix(in srgb, var(--lj-ok) 14%, var(--mf-panel));
  border-color: var(--lj-ok);
  color: var(--lj-ok);
}

.quiz-opt.wrong {
  background: color-mix(in srgb, var(--lj-bad) 12%, var(--mf-panel));
  border-color: var(--lj-bad);
  color: var(--lj-bad);
}

.quiz-feedback {
  min-height: 1.4em;
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--mf-muted);
}

.quiz-feedback.good {
  color: var(--lj-ok);
}

.quiz-feedback.bad {
  color: var(--lj-bad);
}

@media (max-width: 860px) {
  .mf-body {
    flex-direction: column;
  }

  .mf-graph {
    flex: 1 1 auto !important;
    width: 100% !important;
    max-width: none !important;
  }

  .mf-lesson {
    border-left: none;
    border-top: 1px solid var(--mf-line);
  }

  .step-dots {
    display: none;
  }
}
</style>
