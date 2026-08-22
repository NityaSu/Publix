<script setup lang="ts">
import {
  Maximize2,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
  RefreshCw,
  Eye,
  ArrowRight,
  Play,
} from 'lucide-vue-next';
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import InsightsReadingToggle from '~/component/InsightsReadingToggle.vue';
import NoteViews from '~/component/NoteViews.vue';
import InsightsSplitHandle from '~/component/InsightsSplitHandle.vue';
import { useInsightsSplit } from '~/composables/useInsightsSplit';
import {
  demoSeed,
  lessonById,
  neighborLessons,
  redisLessons,
  wordsForLesson,
  type RedisLessonId,
} from '~/data/redisLab';

const activeId = ref<RedisLessonId>('why');
const isFullscreen = ref(false);
const shellEl = ref<HTMLElement | null>(null);
const hash = reactive<Record<string, number>>({ ...demoSeed });
const pulseSlug = ref<string | null>(null);
const lastCommand = ref('');
const hopIndex = ref(0);
const log = ref<string[]>([]);
const playing = ref(false);

const active = computed(() => lessonById(activeId.value));
const neighbors = computed(() => neighborLessons(activeId.value));
const sortedEntries = computed(() =>
  Object.entries(hash).sort((a, b) => a[0].localeCompare(b[0])),
);
const hops = computed(() => active.value.hops ?? []);
const currentHop = computed(() => hops.value[hopIndex.value] ?? null);
const lessonWords = computed(() => wordsForLesson(active.value));

const {
  bodyEl,
  leftPct,
  leftStyle,
  dragging,
  rightOpen,
  toggleRight,
  onHandlePointerDown,
  onHandleKeydown,
} = useInsightsSplit({ storageKey: 'redis-views', defaultPct: 50 });

function pushLog(line: string) {
  log.value = [line, ...log.value].slice(0, 10);
}

function selectLesson(id: RedisLessonId) {
  activeId.value = id;
  hopIndex.value = 0;
  pulseSlug.value = null;
  playing.value = false;
  const lesson = lessonById(id);
  if (lesson.command) lastCommand.value = lesson.command;
  if (import.meta.client) history.replaceState(null, '', `#${id}`);
}

function resetHash() {
  for (const key of Object.keys(hash)) delete hash[key];
  Object.assign(hash, { ...demoSeed });
  pulseSlug.value = null;
  lastCommand.value = '';
  hopIndex.value = 0;
  log.value = [];
  pushLog('RESET — demo HASH views reseeded from Build Note slugs');
}

function visit(slug: string) {
  const next = (hash[slug] ?? 0) + 1;
  hash[slug] = next;
  pulseSlug.value = slug;
  lastCommand.value = `HINCRBY views ${slug} 1  →  ${next}`;
  pushLog(`HINCRBY views ${slug} 1  →  ${next}`);
  window.setTimeout(() => {
    if (pulseSlug.value === slug) pulseSlug.value = null;
  }, 750);
}

function runReadAll() {
  lastCommand.value = 'HGETALL views';
  const summary = sortedEntries.value.map(([k, v]) => `${k}:${v}`).join(', ');
  pushLog(`HGETALL views  →  { ${summary} }`);
}

function onHopFocus(i: number) {
  hopIndex.value = i;
  const hop = hops.value[i];
  if (!hop) return;
  pushLog(`${hop.from}  →  ${hop.to}  (${hop.via})`);

  if (active.value.mode === 'write' && hop.via.includes('HINCRBY')) {
    visit('supercage');
  }
  if (
    (active.value.mode === 'read' || active.value.mode === 'hash') &&
    hop.via.includes('HGETALL')
  ) {
    runReadAll();
  }
}

function stepHop(dir: 1 | -1) {
  const next = hopIndex.value + dir;
  if (next < 0 || next >= hops.value.length) return;
  onHopFocus(next);
}

async function playHops() {
  if (!hops.value.length || playing.value) return;
  playing.value = true;
  for (let i = 0; i < hops.value.length; i += 1) {
    if (!playing.value) break;
    onHopFocus(i);
    await new Promise((r) => setTimeout(r, 1100));
  }
  playing.value = false;
}

function goNext() {
  if (hops.value.length && hopIndex.value < hops.value.length - 1) {
    stepHop(1);
    return;
  }
  if (neighbors.value.next) selectLesson(neighbors.value.next.id);
}

function goPrev() {
  if (hops.value.length && hopIndex.value > 0) {
    stepHop(-1);
    return;
  }
  if (neighbors.value.prev) selectLesson(neighbors.value.prev.id);
}

const nextLabel = computed(() => {
  if (hops.value.length && hopIndex.value < hops.value.length - 1) {
    return 'Next hop →';
  }
  return neighbors.value.next ? 'Next lesson →' : 'Done';
});

async function toggleFullscreen() {
  const el = shellEl.value;
  if (!el) return;
  if (!document.fullscreenElement) {
    await el.requestFullscreen?.();
    isFullscreen.value = true;
  } else {
    await document.exitFullscreen?.();
    isFullscreen.value = false;
  }
}

function onFullscreenChange() {
  isFullscreen.value = Boolean(document.fullscreenElement);
}

onMounted(() => {
  const hashId = decodeURIComponent(
    window.location.hash.replace(/^#/, ''),
  ) as RedisLessonId;
  if (redisLessons.some((l) => l.id === hashId)) activeId.value = hashId;
  document.addEventListener('fullscreenchange', onFullscreenChange);
  pushLog('Demo HASH views ready — same slugs as live Build Notes');
});

onUnmounted(() => {
  playing.value = false;
  document.removeEventListener('fullscreenchange', onFullscreenChange);
});

watch(activeId, (id) => {
  const mode = lessonById(id).mode;
  if (mode === 'hash' || mode === 'read') runReadAll();
});
</script>

<template>
  <div
    ref="shellEl"
    class="mf"
    :class="{ 'is-fs': isFullscreen }"
    aria-label="Redis view counter lab"
  >
    <header class="mf-header">
      <NuxtLink to="/insights/notes" class="mf-brand">VIEW COUNTS</NuxtLink>
      <nav class="rx-tabs" aria-label="Redis lessons">
        <button
          v-for="lesson in redisLessons"
          :key="lesson.id"
          type="button"
          class="rx-tab"
          :class="{ 'is-on': lesson.id === activeId }"
          :title="lesson.label"
          @click="selectLesson(lesson.id)"
        >
          {{ String(lesson.n).padStart(2, '0') }}
        </button>
      </nav>
      <div class="mf-meta">
        <NoteViews slug="redis-views" class="mf-step hidden sm:inline" />
        <span class="mf-step">{{ redisLessons.length }} lessons</span>
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
      <section class="mf-graph" :style="leftStyle" aria-label="Process visualization">
        <div class="mf-graph-head">
          <p class="mf-graph-title">
            Process ·
            <span class="rx-mode">{{ active.mode }}</span>
          </p>
          <div class="rx-head-actions">
            <button
              v-if="hops.length"
              type="button"
              class="mf-tool"
              :disabled="playing"
              @click="playHops"
            >
              <Play :size="14" />
              Play path
            </button>
            <button type="button" class="mf-tool" @click="resetHash">
              <RefreshCw :size="14" />
              Reset
            </button>
          </div>
        </div>

        <!-- FROM → TO hop rail -->
        <div v-if="hops.length" class="rx-flow" aria-label="From-to process hops">
          <button
            v-for="(hop, i) in hops"
            :key="`${hop.from}-${hop.to}-${i}`"
            type="button"
            class="rx-hop"
            :class="{ 'is-on': hopIndex === i, 'is-done': hopIndex > i }"
            @click="onHopFocus(i)"
          >
            <span class="rx-hop-i">{{ i + 1 }}</span>
            <span class="rx-hop-from">{{ hop.from }}</span>
            <span class="rx-hop-arrow" aria-hidden="true">
              <ArrowRight :size="14" />
              <em>{{ hop.via }}</em>
            </span>
            <span class="rx-hop-to">{{ hop.to }}</span>
          </button>
        </div>

        <div v-if="currentHop" class="rx-focus" aria-live="polite">
          <p class="rx-focus-sign">
            <strong>{{ currentHop.from }}</strong>
            <ArrowRight :size="16" aria-hidden="true" />
            <strong>{{ currentHop.to }}</strong>
          </p>
          <p class="rx-focus-via">via <code>{{ currentHop.via }}</code></p>
          <p class="rx-focus-detail">{{ currentHop.detail }}</p>
        </div>

        <p v-if="lastCommand" class="rx-cmd">
          <span class="rx-cmd-label">redis</span>
          {{ lastCommand }}
        </p>

        <!-- Memory picture of HASH views -->
        <div class="rx-hash-wrap">
          <div class="rx-hash-label">
            <span>Redis memory</span>
            <code>HASH views</code>
          </div>
          <div class="rx-board" role="table" aria-label="views hash fields">
            <div class="rx-board-head" role="row">
              <span role="columnheader">field → slug</span>
              <span role="columnheader">value → count</span>
              <span role="columnheader" class="rx-act-h">simulate</span>
            </div>
            <div
              v-for="[slug, count] in sortedEntries"
              :key="slug"
              class="rx-row"
              role="row"
              :class="{ 'is-pulse': pulseSlug === slug }"
            >
              <code class="rx-slug" role="cell">{{ slug }}</code>
              <span class="rx-count" role="cell">
                <Eye :size="14" aria-hidden="true" />
                {{ count.toLocaleString('en-US') }}
              </span>
              <button
                type="button"
                class="rx-visit"
                role="cell"
                :disabled="active.mode === 'read'"
                @click="visit(slug)"
              >
                HINCRBY +1
              </button>
            </div>
          </div>
        </div>

        <div class="rx-log" aria-label="Command log">
          <p class="rx-log-title">Trail</p>
          <ul>
            <li v-for="(line, i) in log" :key="`${i}-${line}`">{{ line }}</li>
          </ul>
        </div>
      </section>

      <InsightsSplitHandle
        v-show="rightOpen"
        :value="leftPct"
        :dragging="dragging"
        :min="28"
        :max="68"
        @pointerdown="onHandlePointerDown"
        @keydown="onHandleKeydown"
      />

      <aside v-show="rightOpen" class="mf-lesson" aria-label="Lesson">
        <div>
          <p class="lesson-tag">{{ active.tag }} · {{ active.label }}</p>
          <h3>{{ active.title }}</h3>
          <p class="rx-lead">{{ active.lead }}</p>
        </div>

        <div v-if="lessonWords.length" class="rx-words" aria-label="Keywords in kid version">
          <p class="rx-words-title">Keywords · kid version</p>
          <article
            v-for="word in lessonWords"
            :key="word.term"
            class="rx-word"
          >
            <header>
              <code>{{ word.term }}</code>
              <span>{{ word.kid }}</span>
            </header>
            <p>{{ word.meaning }}</p>
          </article>
        </div>

        <div class="rx-paras">
          <p v-for="(p, i) in active.paragraphs" :key="i">{{ p }}</p>
        </div>

        <ul v-if="active.remember?.length" class="rx-remember">
          <li v-for="item in active.remember" :key="item">{{ item }}</li>
        </ul>

        <div v-if="active.code" class="rx-code">
          <p class="rx-code-file">{{ active.code.file }}</p>
          <pre><code>{{ active.code.lines }}</code></pre>
        </div>

        <div class="rx-controls">
          <button type="button" class="ctrl-btn" @click="goPrev">← Back</button>
          <button
            type="button"
            class="ctrl-btn primary"
            :disabled="!neighbors.next && hopIndex >= hops.length - 1"
            @click="goNext"
          >
            {{ nextLabel }}
          </button>
          <button
            v-if="active.mode === 'write' || active.mode === 'overview'"
            type="button"
            class="ctrl-btn"
            @click="visit('supercage')"
          >
            Demo HINCRBY supercage
          </button>
          <button
            v-if="active.mode === 'read' || active.mode === 'hash'"
            type="button"
            class="ctrl-btn"
            @click="runReadAll"
          >
            Demo HGETALL
          </button>
        </div>

        <p class="rx-footnote">
          Left board is a teaching simulator. Live counts on this site use the same commands against Upstash Redis.
        </p>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.mf {
  --mf-bg: var(--ri-bg, #111);
  --mf-panel: var(--ri-surface, #1a1a1a);
  --mf-text: var(--ri-ink, #fff);
  --mf-muted: var(--ri-sub, #888);
  --mf-line: var(--ri-border, rgba(255, 255, 255, 0.12));
  --mf-accent: #4a9eff;
  height: calc(100dvh - var(--insights-nav-offset, 0px));
  display: flex;
  flex-direction: column;
  background: var(--mf-bg);
  color: var(--mf-text);
}

.mf.is-fs {
  height: 100dvh;
}

.mf-header {
  min-height: 52px;
  border-bottom: 1px solid var(--mf-line);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px 0 20px;
  flex-shrink: 0;
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

.rx-tabs {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.rx-tab {
  width: 32px;
  height: 28px;
  border: 1px solid var(--mf-line);
  background: transparent;
  color: var(--mf-muted);
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.rx-tab.is-on {
  border-color: var(--mf-accent);
  color: var(--mf-accent);
}

.mf-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  flex-shrink: 0;
}

.mf-step {
  font-size: 13px;
  font-weight: 600;
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

.mf-tool:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.mf-body {
  flex: 1;
  min-height: 0;
  display: flex;
}

.mf-body.is-notes-closed .mf-graph {
  flex: 1 1 100%;
  width: 100%;
}

.mf-graph {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px 18px;
  overflow: auto;
  border-right: 1px solid var(--mf-line);
}

.mf-graph-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.rx-head-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.mf-graph-title {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--mf-muted);
}

.rx-mode {
  color: var(--mf-accent);
}

.rx-flow {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rx-hop {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  text-align: left;
  padding: 8px 10px;
  border: 1px solid var(--mf-line);
  background: transparent;
  color: var(--mf-text);
  cursor: pointer;
  opacity: 0.45;
  transition: opacity 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.rx-hop.is-done {
  opacity: 0.75;
}

.rx-hop.is-on {
  opacity: 1;
  border-color: var(--mf-accent);
  background: color-mix(in srgb, var(--mf-accent) 10%, transparent);
}

.rx-hop-i {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  color: var(--mf-accent);
  font-weight: 700;
}

.rx-hop-from,
.rx-hop-to {
  font-size: 12px;
  font-weight: 700;
  line-height: 1.3;
  word-break: break-word;
}

.rx-hop-arrow {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: var(--mf-accent);
  min-width: 72px;
}

.rx-hop-arrow em {
  font-style: normal;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 9px;
  letter-spacing: 0.04em;
  color: var(--mf-muted);
  max-width: 110px;
  text-align: center;
  line-height: 1.2;
}

.rx-focus {
  border: 1px solid color-mix(in srgb, var(--mf-accent) 45%, var(--mf-line));
  background: var(--mf-panel);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rx-focus-sign {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin: 0;
}

.rx-focus-sign strong {
  font-weight: 800;
}

.rx-focus-via {
  margin: 0;
  font-size: 12px;
  color: var(--mf-muted);
}

.rx-focus-via code {
  font-family: 'DM Mono', ui-monospace, monospace;
  color: var(--mf-accent);
  font-size: 11px;
}

.rx-focus-detail {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
}

.rx-cmd {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 12px;
  padding: 10px 12px;
  border: 1px solid var(--mf-line);
  background: color-mix(in srgb, var(--mf-panel) 80%, #000);
  display: flex;
  gap: 10px;
  align-items: baseline;
  flex-wrap: wrap;
  margin: 0;
}

.rx-cmd-label {
  color: var(--mf-accent);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 10px;
}

.rx-hash-wrap {
  border: 1px solid var(--mf-line);
  background: var(--mf-panel);
}

.rx-hash-label {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--mf-line);
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--mf-muted);
}

.rx-hash-label code {
  color: var(--mf-accent);
  letter-spacing: 0.06em;
}

.rx-board-head,
.rx-row {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.7fr) auto;
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
}

.rx-board-head {
  border-bottom: 1px solid var(--mf-line);
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--mf-muted);
}

.rx-row {
  border-bottom: 1px solid var(--mf-line);
  transition: background 0.35s ease;
}

.rx-row:last-child {
  border-bottom: none;
}

.rx-row.is-pulse {
  background: color-mix(in srgb, var(--mf-accent) 18%, transparent);
}

.rx-slug {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rx-count {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--mf-accent);
}

.rx-visit {
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--mf-line);
  background: transparent;
  color: var(--mf-text);
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  cursor: pointer;
  white-space: nowrap;
}

.rx-visit:hover:not(:disabled) {
  border-color: var(--mf-accent);
  color: var(--mf-accent);
}

.rx-visit:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.rx-log {
  margin-top: auto;
  border: 1px solid var(--mf-line);
  padding: 10px 12px;
  max-height: 130px;
  overflow: auto;
}

.rx-log-title {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--mf-muted);
  margin: 0 0 6px;
}

.rx-log ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rx-log li {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  color: var(--mf-muted);
  word-break: break-word;
}

.mf-lesson {
  flex: 1;
  min-width: 0;
  padding: 20px 22px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.lesson-tag {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--mf-accent);
  margin: 0;
}

.mf-lesson h3 {
  margin: 6px 0 0;
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1.25;
}

.rx-lead {
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--mf-muted);
}

.rx-words {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rx-words-title {
  margin: 0;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--mf-accent);
}

.rx-word {
  border: 1px solid var(--mf-line);
  background: var(--mf-panel);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rx-word header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rx-word header code {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 12px;
  font-weight: 700;
  color: var(--mf-accent);
  width: fit-content;
}

.rx-word header span {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--mf-text);
}

.rx-word p {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--mf-muted);
}

.rx-paras {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rx-paras p {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
}

.rx-remember {
  margin: 0;
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--mf-muted);
}

.rx-code {
  border: 1px solid var(--mf-line);
  background: color-mix(in srgb, var(--mf-panel) 90%, #000);
  padding: 10px 12px;
}

.rx-code-file {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--mf-accent);
  margin: 0 0 8px;
}

.rx-code pre {
  margin: 0;
  overflow-x: auto;
}

.rx-code code {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 12px;
  line-height: 1.55;
  white-space: pre;
}

.rx-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
  padding-top: 8px;
}

.ctrl-btn {
  height: 34px;
  padding: 0 14px;
  border: 1px solid var(--mf-line);
  background: var(--mf-panel);
  color: var(--mf-text);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.ctrl-btn.primary {
  border-color: var(--mf-accent);
  color: var(--mf-accent);
}

.ctrl-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.rx-footnote {
  font-size: 11px;
  color: var(--mf-muted);
  line-height: 1.45;
  margin: 0;
}

@media (max-width: 860px) {
  .mf-body {
    flex-direction: column;
  }

  .mf-graph {
    border-right: none;
    border-bottom: 1px solid var(--mf-line);
    max-height: 52%;
  }

  .rx-hop {
    grid-template-columns: 24px 1fr;
    grid-template-rows: auto auto auto;
  }

  .rx-hop-arrow {
    grid-column: 2;
    flex-direction: row;
    justify-content: flex-start;
    gap: 6px;
    min-width: 0;
  }

  .rx-hop-to {
    grid-column: 2;
  }

  .rx-act-h {
    display: none;
  }

  .rx-board-head,
  .rx-row {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .rx-visit {
    grid-column: 1 / -1;
    justify-self: start;
  }
}
</style>
