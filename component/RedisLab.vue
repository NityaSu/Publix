<script setup lang="ts">
import { ArrowRight, Maximize2, Minimize2 } from 'lucide-vue-next';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import InsightsReadingToggle from '~/component/InsightsReadingToggle.vue';
import NoteViews from '~/component/NoteViews.vue';
import { useInsightsReadingMode } from '~/composables/useInsightsReadingMode';
import {
  redisPageById,
  redisPages,
  redisPathSteps,
  type RedisPageId,
} from '~/data/redisLab';

const { mode, isLight } = useInsightsReadingMode();

const pageId = ref<RedisPageId>('why');
const isFullscreen = ref(false);
const shellEl = ref<HTMLElement | null>(null);
const stepIndex = ref(0);

const page = computed(() => redisPageById(pageId.value));
const activeStep = computed(() => redisPathSteps[stepIndex.value] ?? redisPathSteps[0]!);

function selectPage(id: RedisPageId) {
  pageId.value = id;
  stepIndex.value = 0;
  if (import.meta.client) history.replaceState(null, '', `#${id}`);
}

function md(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
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

onMounted(() => {
  document.addEventListener('fullscreenchange', onFs);
  const hash = decodeURIComponent(window.location.hash.replace(/^#/, '')) as RedisPageId;
  if (redisPages.some((p) => p.id === hash)) pageId.value = hash;
});

onUnmounted(() => document.removeEventListener('fullscreenchange', onFs));
</script>

<template>
  <div
    ref="shellEl"
    class="rx"
    :class="{ 'is-fs': isFullscreen, 'is-light': isLight, 'is-dark': !isLight }"
    :data-mode="mode"
    aria-label="Redis views note"
  >
    <header class="rx-header">
      <NuxtLink to="/insights/notes" class="rx-brand">VIEW COUNTS</NuxtLink>
      <nav class="rx-tabs" aria-label="Pages">
        <button
          v-for="p in redisPages"
          :key="p.id"
          type="button"
          class="rx-tab"
          :class="{ 'is-on': pageId === p.id }"
          @click="selectPage(p.id)"
        >
          {{ p.n }}. {{ p.label }}
        </button>
      </nav>
      <div class="rx-meta">
        <NoteViews slug="redis-views" class="rx-step" />
        <button type="button" class="rx-tool" @click="toggleFullscreen">
          <Minimize2 v-if="isFullscreen" :size="14" />
          <Maximize2 v-else :size="14" />
        </button>
        <InsightsReadingToggle />
      </div>
    </header>

    <div class="rx-body">
      <!-- Light viz strip -->
      <aside class="rx-viz" aria-label="Diagram">
        <template v-if="pageId === 'why'">
          <p class="rx-viz-title">At a glance</p>
          <div class="rx-speed">
            <div class="rx-speed-row">
              <span>Disk DB</span>
              <i class="rx-bar rx-bar-slow" />
              <em>~5–20ms</em>
            </div>
            <div class="rx-speed-row">
              <span>Redis</span>
              <i class="rx-bar rx-bar-fast" />
              <em>~0.1ms</em>
            </div>
          </div>
          <div class="rx-pipe">
            <span>Reader</span>
            <ArrowRight :size="12" />
            <span>API</span>
            <ArrowRight :size="12" />
            <span>HINCRBY</span>
          </div>
          <pre class="rx-mini-tree">views
├─ supercage → N
├─ redis-views → N
└─ …</pre>
          <p class="rx-viz-note">Left is only a sketch. Read the page for the full why.</p>
        </template>

        <template v-else>
          <p class="rx-viz-title">Steps</p>
          <button
            v-for="step in redisPathSteps"
            :key="step.n"
            type="button"
            class="rx-step-btn"
            :class="{ 'is-on': stepIndex === step.n - 1 }"
            @click="stepIndex = step.n - 1"
          >
            <span>{{ step.n }}</span>
            {{ step.title }}
          </button>
          <div class="rx-step-focus">
            <p class="rx-file">{{ activeStep.file }}</p>
            <p>{{ activeStep.detail }}</p>
            <pre v-if="activeStep.code">{{ activeStep.code }}</pre>
          </div>
        </template>
      </aside>

      <!-- Text -->
      <article class="rx-read" aria-label="Lesson">
        <div class="rx-read-inner">
          <p class="rx-kicker">Page {{ page.n }} of 2</p>
          <h1>{{ page.title }}</h1>
          <p class="rx-lead">{{ page.lead }}</p>

          <template v-for="(block, i) in page.blocks" :key="i">
            <h3 v-if="block.type === 'h3'">{{ block.text }}</h3>
            <p v-else-if="block.type === 'p'" class="rx-p" v-html="md(block.text)" />
            <ul v-else-if="block.type === 'ul'" class="rx-ul">
              <li v-for="item in block.items" :key="item" v-html="md(item)" />
            </ul>
            <div v-else-if="block.type === 'pre'" class="rx-pre">
              <p v-if="block.caption" class="rx-file">{{ block.caption }}</p>
              <pre>{{ block.lines }}</pre>
            </div>
            <div v-else-if="block.type === 'table'" class="rx-table">
              <table>
                <thead>
                  <tr>
                    <th v-for="col in block.columns" :key="col">{{ col }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, r) in block.rows" :key="r">
                    <td v-for="(cell, c) in row" :key="c" v-html="md(cell)" />
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else-if="block.type === 'callout'" class="rx-callout">
              <p v-for="line in block.lines" :key="line" v-html="md(line)" />
            </div>
          </template>

          <div class="rx-pager">
            <button
              v-if="pageId === 'path'"
              type="button"
              class="rx-tool"
              @click="selectPage('why')"
            >
              ← Why Redis
            </button>
            <span v-else />
            <button
              v-if="pageId === 'why'"
              type="button"
              class="rx-tool"
              @click="selectPage('path')"
            >
              Apply path →
            </button>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
/* Follow Insights reading-mode tokens from .insights-shell — both modes stay in sync. */
.rx {
  --bg: var(--ri-bg, #111111);
  --panel: var(--ri-surface, #1a1a1a);
  --text: var(--ri-ink, #ffffff);
  --muted: var(--ri-sub, #888888);
  --line: var(--ri-border, rgba(255, 255, 255, 0.12));
  --accent: #4a9eff;
  height: calc(100dvh - var(--insights-nav-offset, 4rem));
  display: flex;
  flex-direction: column;
  background: var(--bg);
  color: var(--text);
  overflow: hidden;
}
.rx.is-fs {
  height: 100dvh;
}
/* Explicit fallbacks if shell tokens are missing (e.g. fullscreen edge cases) */
.rx.is-light {
  --bg: #f8f9fa;
  --panel: #ffffff;
  --text: #111111;
  --muted: #6b7280;
  --line: rgba(17, 24, 39, 0.12);
}
.rx.is-dark {
  --bg: #111111;
  --panel: #1a1a1a;
  --text: #ffffff;
  --muted: #888888;
  --line: rgba(255, 255, 255, 0.12);
}
.rx-header {
  min-height: 52px;
  border-bottom: 1px solid var(--line);
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 16px 0 20px;
  flex-shrink: 0;
  background: var(--bg);
  color: var(--text);
}
.rx-brand {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 0.06em;
  color: var(--text);
  text-decoration: none;
}
.rx-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.rx-tab {
  height: 30px;
  padding: 0 12px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--muted);
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  cursor: pointer;
}
.rx-tab.is-on {
  border-color: var(--accent);
  color: var(--accent);
}
.rx-meta {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text);
}
.rx-step {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  color: var(--muted);
}
.rx-tool {
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--line);
  background: var(--panel);
  color: var(--text);
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-family: 'DM Mono', ui-monospace, monospace;
}
.rx-body {
  flex: 1;
  min-height: 0;
  display: flex;
  background: var(--bg);
  color: var(--text);
}
.rx-viz {
  width: min(300px, 34vw);
  flex-shrink: 0;
  border-right: 1px solid var(--line);
  padding: 16px 14px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--panel);
  color: var(--text);
}
.rx-viz-title {
  margin: 0;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
.rx-viz-note {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: var(--muted);
}
.rx-speed {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--text);
}
.rx-speed-row {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: 8px;
  align-items: center;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  color: var(--text);
}
.rx-bar {
  display: block;
  height: 8px;
  border-radius: 2px;
}
.rx-bar-slow {
  width: 90%;
  background: #e6a817;
}
.rx-bar-fast {
  width: 14%;
  background: var(--accent);
}
.rx-speed-row em {
  font-style: normal;
  color: var(--muted);
}
.rx-pipe {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  color: var(--text);
}
.rx-pipe span {
  padding: 4px 8px;
  border: 1px solid var(--line);
  background: var(--bg);
  color: var(--text);
}
.rx-mini-tree {
  margin: 0;
  padding: 10px;
  border: 1px solid var(--line);
  background: var(--bg);
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  line-height: 1.5;
  color: var(--text);
}
.rx-step-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  width: 100%;
  padding: 8px 10px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--muted);
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  cursor: pointer;
}
.rx-step-btn span {
  color: var(--accent);
  font-weight: 700;
}
.rx-step-btn.is-on {
  border-color: var(--accent);
  color: var(--text);
  background: color-mix(in srgb, var(--accent) 10%, transparent);
}
.rx-step-focus {
  margin-top: 4px;
  padding: 10px;
  border: 1px solid var(--line);
  background: var(--bg);
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: var(--muted);
  line-height: 1.45;
}
.rx-step-focus pre {
  margin: 0;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  line-height: 1.5;
  white-space: pre-wrap;
  color: var(--text);
}
.rx-file {
  margin: 0;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent);
}
.rx-read {
  flex: 1;
  min-width: 0;
  overflow: auto;
  background: var(--bg);
  color: var(--text);
  display: flex;
  justify-content: center;
}
.rx-read-inner {
  width: 100%;
  max-width: 40rem;
  padding: 28px 32px 48px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
  color: var(--text);
}
.rx-kicker {
  margin: 0;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);
}
.rx-read h1 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.25;
  color: var(--text);
}
.rx-lead,
.rx-p {
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  color: var(--muted);
}
.rx-read h3 {
  margin: 14px 0 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text);
}
.rx-ul {
  margin: 0;
  padding-left: 1.15rem;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
}
.rx-read :deep(code) {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.9em;
  color: var(--accent);
}
.rx-pre pre {
  margin: 0;
  padding: 12px 14px;
  border: 1px solid var(--line);
  background: var(--panel);
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  line-height: 1.55;
  white-space: pre-wrap;
  color: var(--text);
}
.rx-table {
  overflow: auto;
  border: 1px solid var(--line);
}
.rx-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.rx-table th,
.rx-table td {
  padding: 8px 10px;
  border-bottom: 1px solid var(--line);
  text-align: left;
  vertical-align: top;
  color: var(--text);
}
.rx-table th {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
  background: var(--panel);
}
.rx-callout {
  padding: 12px 14px;
  border-left: 3px solid var(--accent);
  background: color-mix(in srgb, var(--accent) 8%, var(--panel));
  font-size: 14px;
  line-height: 1.6;
  color: var(--muted);
}
.rx-pager {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
}
@media (max-width: 860px) {
  .rx-body {
    flex-direction: column;
  }
  .rx-viz {
    width: 100%;
    max-height: 36vh;
    border-right: none;
    border-bottom: 1px solid var(--line);
  }
  .rx-read-inner {
    padding: 20px 18px 40px;
  }
}
</style>
