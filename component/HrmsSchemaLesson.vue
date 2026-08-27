<script setup lang="ts">
import { Maximize2, Minimize2, PanelRightClose, PanelRightOpen } from 'lucide-vue-next';
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import InsightsReadingToggle from '~/component/InsightsReadingToggle.vue';
import NoteViews from '~/component/NoteViews.vue';
import InsightsSplitHandle from '~/component/InsightsSplitHandle.vue';
import { useInsightsSplit } from '~/composables/useInsightsSplit';
import {
  hrmsFlow,
  hrmsQuiz,
  hrmsScenes,
  hrmsTableById,
  hrmsTables,
  inboundOf,
  neighborsOf,
  outboundOf,
  type HrmsTable,
} from '~/data/hrmsSchema';

const isFullscreen = ref(false);
const shellEl = ref<HTMLElement | null>(null);
const lessonEl = ref<HTMLElement | null>(null);

const sceneIndex = ref(0);
const selectedId = ref<string>('employees');
const flowStep = ref(0);
const showQuiz = ref(false);
const quizIndex = ref(0);
const quizPick = ref<string | null>(null);
const quizOk = ref<boolean | null>(null);
const quizFeedback = ref('');

const {
  bodyEl,
  leftPct,
  leftStyle,
  dragging,
  rightOpen,
  toggleRight,
  onHandlePointerDown,
  onHandleKeydown,
} = useInsightsSplit({ storageKey: 'hrms-schema', defaultPct: 56 });

const scene = computed(() => hrmsScenes[sceneIndex.value]!);
const selected = computed(() => hrmsTableById(selectedId.value)!);
const hot = computed(() => neighborsOf(selectedId.value));
const inbound = computed(() => inboundOf(selectedId.value));
const outbound = computed(() => outboundOf(selectedId.value));
const activeFlow = computed(() => hrmsFlow[flowStep.value]!);
const quiz = computed(() => hrmsQuiz[quizIndex.value % hrmsQuiz.length]!);

const clusters = computed(() => {
  const order = ['org', 'leave', 'time', 'pay', 'auth', 'join'] as const;
  return order
    .map((c) => ({
      id: c,
      tables: hrmsTables.filter((t) => t.cluster === c),
    }))
    .filter((g) => g.tables.length);
});

function selectTable(id: string) {
  selectedId.value = id;
  showQuiz.value = false;
}

function isDim(t: HrmsTable) {
  return !hot.value.has(t.id);
}

function isFocus(t: HrmsTable) {
  return scene.value.focus.includes(t.id);
}

function goScene(i: number) {
  if (i < 0 || i >= hrmsScenes.length) return;
  sceneIndex.value = i;
  showQuiz.value = false;
  const focus = hrmsScenes[i]!.focus[0];
  if (focus) selectedId.value = focus;
  nextTick(() => lessonEl.value?.scrollTo({ top: 0 }));
}

function nextScene() {
  if (sceneIndex.value < hrmsScenes.length - 1) {
    goScene(sceneIndex.value + 1);
    return;
  }
  showQuiz.value = true;
}

function stepFlow(dir: 1 | -1) {
  const next = flowStep.value + dir;
  if (next < 0 || next >= hrmsFlow.length) return;
  flowStep.value = next;
  selectedId.value = hrmsFlow[next]!.table;
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

onMounted(() => document.addEventListener('fullscreenchange', onFs));
onUnmounted(() => document.removeEventListener('fullscreenchange', onFs));
</script>

<template>
  <div ref="shellEl" class="mf" :class="{ 'is-fs': isFullscreen }" aria-label="HRMS schema lesson">
    <header class="mf-header">
      <NuxtLink to="/insights/notes/hrms" class="mf-brand">Schema Studio</NuxtLink>
      <div class="mf-meta">
        <NoteViews slug="hrms" class="mf-step" />
        <span class="mf-step">from your hrms_api models</span>
        <button type="button" class="mf-tool" :aria-pressed="!rightOpen" @click="toggleRight">
          <PanelRightClose v-if="rightOpen" :size="14" />
          <PanelRightOpen v-else :size="14" />
          {{ rightOpen ? 'Hide notes' : 'Notes' }}
        </button>
        <button type="button" class="mf-tool" @click="toggleFullscreen">
          <Minimize2 v-if="isFullscreen" :size="14" />
          <Maximize2 v-else :size="14" />
        </button>
        <InsightsReadingToggle />
      </div>
    </header>

    <div
      ref="bodyEl"
      class="mf-body"
      :class="{ 'is-dragging': dragging, 'is-notes-closed': !rightOpen }"
    >
      <section class="mf-graph" :style="leftStyle" aria-label="Schema map">
        <div class="legend">
          <span><b>🔑</b> Primary key</span>
          <span><b>🔗</b> Foreign key</span>
          <span><b>1→N</b> parent has many children</span>
          <span class="hint">Click a card · connected tables stay bright</span>
        </div>

        <div class="clusters">
          <div v-for="g in clusters" :key="g.id" class="cluster" :data-cluster="g.id">
            <p class="cluster-label">{{ g.id }}</p>
            <div class="card-grid">
              <button
                v-for="t in g.tables"
                :key="t.id"
                type="button"
                class="tcard"
                :class="{
                  on: selectedId === t.id,
                  dim: isDim(t),
                  focus: isFocus(t),
                }"
                :style="{ '--t': t.color }"
                @click="selectTable(t.id)"
              >
                <header>
                  <span class="ico">{{ t.icon }}</span>
                  <strong>{{ t.name }}</strong>
                </header>
                <p class="pk">🔑 {{ t.pk }}</p>
                <ul v-if="t.fks.length" class="fks">
                  <li v-for="fk in t.fks" :key="fk.column">
                    🔗 {{ fk.column }} → {{ fk.to }}
                  </li>
                </ul>
                <p v-else class="fks empty">no outbound FK</p>
              </button>
            </div>
          </div>
        </div>

        <div class="explain">
          <p class="explain-kicker">Selected · {{ selected.icon }} {{ selected.name }}</p>
          <p class="explain-blurb">{{ selected.blurb }}</p>

          <div class="explain-cols">
            <div>
              <h4>Who connects TO me</h4>
              <ul v-if="inbound.length">
                <li v-for="e in inbound" :key="e.from + e.label">
                  <button type="button" class="linkish" @click="selectTable(e.from)">
                    {{ e.from }}
                  </button>
                  · {{ e.label }} ({{ e.card }})
                </li>
              </ul>
              <p v-else class="muted">Nothing points here (root / leaf catalog).</p>
            </div>
            <div>
              <h4>I connect TO</h4>
              <ul v-if="outbound.length">
                <li v-for="e in outbound" :key="e.to + e.label">
                  <button type="button" class="linkish" @click="selectTable(e.to)">
                    {{ e.to }}
                  </button>
                  · {{ e.label }} ({{ e.card }})
                </li>
              </ul>
              <p v-else class="muted">No outbound FKs.</p>
            </div>
          </div>

          <div v-if="selected.oneToMany.length" class="rules">
            <h4>Real HRMS meaning</h4>
            <ul>
              <li v-for="r in selected.oneToMany" :key="r">{{ r }}</li>
            </ul>
          </div>

          <pre class="sql"><span>JOIN example</span>{{ selected.joinSql }}</pre>
        </div>

        <div class="flow">
          <div class="flow-head">
            <h3>Data flow tracer · leave → pay</h3>
            <div class="flow-nav">
              <button type="button" class="chip" :disabled="flowStep === 0" @click="stepFlow(-1)">
                Prev
              </button>
              <span>{{ flowStep + 1 }} / {{ hrmsFlow.length }}</span>
              <button
                type="button"
                class="chip"
                :disabled="flowStep === hrmsFlow.length - 1"
                @click="stepFlow(1)"
              >
                Next
              </button>
            </div>
          </div>
          <div class="flow-steps">
            <button
              v-for="(s, i) in hrmsFlow"
              :key="s.n"
              type="button"
              class="fstep"
              :class="{ on: flowStep === i }"
              @click="flowStep = i; selectTable(s.table)"
            >
              <i>{{ s.n }}</i>
              {{ s.title }}
            </button>
          </div>
          <article class="flow-card">
            <p class="op">
              <b :data-op="activeFlow.op">{{ activeFlow.op }}</b>
              {{ activeFlow.table }}
            </p>
            <p class="why">{{ activeFlow.why }}</p>
            <p class="jump">FK hop: {{ activeFlow.fkJump }}</p>
            <pre class="sql">{{ activeFlow.sql }}</pre>
          </article>
        </div>
      </section>

      <InsightsSplitHandle
        v-show="rightOpen"
        :dragging="dragging"
        :value="leftPct"
        :min="28"
        :max="72"
        @pointerdown="onHandlePointerDown"
        @keydown="onHandleKeydown"
      />

      <section v-show="rightOpen" ref="lessonEl" class="mf-lesson" aria-label="Lesson">
        <nav class="scene-dots">
          <button
            v-for="(s, i) in hrmsScenes"
            :key="s.id"
            type="button"
            class="dot"
            :class="{ on: !showQuiz && sceneIndex === i }"
            @click="goScene(i)"
          >
            {{ i + 1 }}
          </button>
          <button type="button" class="dot quiz" :class="{ on: showQuiz }" @click="showQuiz = true">
            ?
          </button>
        </nav>

        <template v-if="!showQuiz">
          <p class="lesson-tag">{{ scene.kicker }}</p>
          <h3>{{ scene.title }}</h3>
          <p>{{ scene.body }}</p>
          <div class="insight">{{ scene.tip }}</div>
          <div class="nav-row">
            <button type="button" class="ctrl" :disabled="sceneIndex === 0" @click="goScene(sceneIndex - 1)">
              Back
            </button>
            <button type="button" class="ctrl primary" @click="nextScene">
              {{ sceneIndex === hrmsScenes.length - 1 ? 'Quiz' : 'Next lesson' }}
            </button>
          </div>
        </template>
        <template v-else>
          <p class="lesson-tag">Master · Schema judgment</p>
          <h3>{{ quiz.q }}</h3>
          <div class="qopts">
            <button
              v-for="opt in quiz.options"
              :key="opt"
              type="button"
              class="qopt"
              :class="quizClass(opt)"
              @click="answerQuiz(opt)"
            >
              {{ opt }}
            </button>
          </div>
          <p class="feedback" :class="{ ok: quizOk === true, bad: quizOk === false }">
            {{ quizFeedback }}
          </p>
          <button type="button" class="ctrl" @click="showQuiz = false">Back to lessons</button>
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
  letter-spacing: 0.04em; color: var(--mf-text); text-decoration: none;
}
.mf-brand:hover { color: var(--mf-accent); }
.mf-meta { margin-left: auto; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.mf-step { font-family: 'DM Mono', ui-monospace, monospace; font-size: 11px; color: var(--mf-muted); }
.mf-tool {
  height: 32px; padding: 0 12px; border: 1px solid var(--mf-line); background: var(--mf-panel);
  color: var(--mf-text); font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; cursor: pointer;
}
.mf-tool:hover { border-color: var(--mf-accent); color: var(--mf-accent); }
.mf-body {
  flex: 1; min-height: 0; display: flex;
  background-color: var(--mf-graph);
  background-image: radial-gradient(var(--mf-dot) 1.5px, transparent 1.5px);
  background-size: 20px 20px;
}
.mf-graph { min-width: 0; padding: 18px 20px; overflow: auto; display: flex; flex-direction: column; gap: 16px; }
.mf-lesson {
  flex: 1; min-width: 0; padding: 24px 26px; overflow: auto; display: flex; flex-direction: column; gap: 14px;
  background: var(--mf-panel); border-left: 1px solid var(--mf-line);
}
.lesson-tag {
  margin: 0; font-family: 'DM Mono', ui-monospace, monospace; font-size: 11px;
  letter-spacing: 0.12em; text-transform: uppercase; color: var(--lj-intent);
}
.mf-lesson h3 { margin: 0; font-size: 1.25rem; font-weight: 800; line-height: 1.25; }
.mf-lesson > p { margin: 0; font-size: 14px; line-height: 1.7; color: var(--mf-muted); }
.legend {
  display: flex; flex-wrap: wrap; gap: 12px; font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px; color: var(--mf-muted);
}
.legend .hint { margin-left: auto; color: var(--lj-purple); }
.clusters { display: flex; flex-direction: column; gap: 14px; }
.cluster-label {
  margin: 0 0 8px; font-family: 'DM Mono', ui-monospace, monospace; font-size: 10px;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--mf-muted);
}
.card-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px;
}
.tcard {
  text-align: left; border: 1px solid var(--mf-line); border-radius: 10px; background: var(--mf-panel);
  padding: 12px; cursor: pointer; border-top: 3px solid var(--t); transition: opacity 0.25s ease, box-shadow 0.2s ease;
}
.tcard.dim { opacity: 0.28; }
.tcard.on {
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--t) 55%, transparent);
  opacity: 1;
}
.tcard.focus:not(.dim) {
  outline: 1px dashed color-mix(in srgb, var(--lj-gold) 70%, transparent);
}
.tcard header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.tcard .ico { font-size: 16px; }
.tcard strong {
  font-family: 'DM Mono', ui-monospace, monospace; font-size: 12px; color: var(--mf-text);
}
.pk, .fks {
  margin: 0; font-family: 'DM Mono', ui-monospace, monospace; font-size: 10px; color: var(--mf-muted);
  list-style: none; padding: 0;
}
.fks li { margin-top: 3px; line-height: 1.35; }
.fks.empty { opacity: 0.6; font-style: italic; }
.explain, .flow {
  border: 1px solid var(--mf-line); border-radius: 12px; background: var(--mf-panel); padding: 14px 16px;
}
.explain-kicker {
  margin: 0 0 6px; font-family: 'DM Mono', ui-monospace, monospace; font-size: 11px;
  letter-spacing: 0.1em; text-transform: uppercase; color: var(--lj-intent);
}
.explain-blurb { margin: 0 0 12px; font-size: 14px; line-height: 1.55; color: var(--mf-text); }
.explain-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.explain h4, .rules h4, .flow h3 {
  margin: 0 0 8px; font-size: 12px; font-family: 'DM Mono', ui-monospace, monospace;
  letter-spacing: 0.06em; text-transform: uppercase; color: var(--mf-muted); font-weight: 600;
}
.explain ul, .rules ul { margin: 0; padding-left: 1.1rem; font-size: 13px; line-height: 1.55; color: var(--mf-text); }
.muted { margin: 0; font-size: 13px; color: var(--mf-muted); }
.linkish {
  border: 0; background: none; padding: 0; color: var(--lj-blue); cursor: pointer;
  font: inherit; text-decoration: underline;
}
.rules { margin-top: 12px; }
.sql {
  margin: 12px 0 0; padding: 12px; border-radius: 8px; border: 1px solid var(--mf-line);
  background: var(--mf-graph); font-family: 'DM Mono', ui-monospace, monospace; font-size: 11px;
  line-height: 1.55; white-space: pre-wrap; color: var(--mf-text);
}
.sql span {
  display: block; margin-bottom: 6px; color: var(--lj-intent); letter-spacing: 0.08em; text-transform: uppercase; font-size: 10px;
}
.flow-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.flow-nav { display: flex; align-items: center; gap: 8px; font-family: 'DM Mono', ui-monospace, monospace; font-size: 12px; color: var(--mf-muted); }
.chip, .ctrl {
  height: 32px; padding: 0 12px; border-radius: 8px; border: 1px solid var(--mf-line);
  background: var(--mf-graph); color: var(--mf-text); font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 12px; cursor: pointer;
}
.chip:disabled, .ctrl:disabled { opacity: 0.4; cursor: not-allowed; }
.ctrl.primary {
  background: linear-gradient(180deg, #8b7cff 0%, #4a9eff 100%); color: #fff; border-color: transparent;
}
.flow-steps { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0; }
.fstep {
  display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 999px;
  border: 1px solid var(--mf-line); background: var(--mf-graph); color: var(--mf-muted);
  font-size: 11px; cursor: pointer; font-family: 'DM Mono', ui-monospace, monospace;
}
.fstep i {
  width: 18px; height: 18px; border-radius: 50%; display: grid; place-items: center;
  background: var(--mf-line); font-style: normal; font-size: 10px; color: var(--mf-text);
}
.fstep.on {
  border-color: var(--lj-purple); color: var(--mf-text);
  background: color-mix(in srgb, var(--lj-purple) 12%, var(--mf-panel));
}
.fstep.on i { background: var(--lj-purple); color: #fff; }
.flow-card .op { margin: 0 0 6px; font-family: 'DM Mono', ui-monospace, monospace; font-size: 13px; }
.flow-card .op b[data-op='SELECT'] { color: var(--lj-blue); }
.flow-card .op b[data-op='INSERT'] { color: var(--lj-ok); }
.flow-card .op b[data-op='UPDATE'] { color: var(--lj-gold); }
.why, .jump { margin: 0 0 6px; font-size: 13px; color: var(--mf-muted); line-height: 1.5; }
.jump { font-family: 'DM Mono', ui-monospace, monospace; font-size: 11px; color: var(--lj-intent); }
.insight {
  padding: 12px 14px; border-radius: 8px; border-left: 3px solid var(--lj-gold);
  background: color-mix(in srgb, var(--lj-gold) 10%, var(--mf-graph));
  font-size: 13px; color: var(--mf-muted); line-height: 1.55;
}
.scene-dots { display: flex; gap: 8px; flex-wrap: wrap; }
.dot {
  width: 30px; height: 30px; border-radius: 50%; border: 1px solid var(--mf-line);
  background: var(--mf-graph); color: var(--mf-muted); font-family: 'DM Mono', ui-monospace, monospace; cursor: pointer;
}
.dot.on { background: var(--lj-purple); color: #fff; border-color: transparent; }
.dot.quiz.on { background: var(--lj-intent); }
.nav-row { display: flex; gap: 10px; margin-top: auto; }
.qopts { display: flex; flex-direction: column; gap: 8px; }
.qopt {
  text-align: left; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--mf-line);
  background: var(--mf-graph); color: var(--mf-text); cursor: pointer; font-size: 13px;
}
.qopt:hover { border-color: var(--lj-purple); }
.qopt.ok { border-color: var(--lj-ok); color: var(--lj-ok); }
.qopt.bad { border-color: var(--lj-bad); color: var(--lj-bad); }
.feedback { min-height: 1.3em; margin: 0; font-size: 12px; font-family: 'DM Mono', ui-monospace, monospace; color: var(--mf-muted); }
.feedback.ok { color: var(--lj-ok); }
.feedback.bad { color: var(--lj-bad); }
@media (max-width: 860px) {
  .mf-body { flex-direction: column; }
  .mf-graph { width: 100% !important; flex: 1 1 auto !important; }
  .mf-lesson { border-left: none; border-top: 1px solid var(--mf-line); }
  .explain-cols { grid-template-columns: 1fr; }
}
</style>
