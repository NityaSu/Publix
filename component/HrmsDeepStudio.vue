<script setup lang="ts">
import { Maximize2, Minimize2 } from 'lucide-vue-next';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import InsightsReadingToggle from '~/component/InsightsReadingToggle.vue';
import NoteViews from '~/component/NoteViews.vue';
import type { HrmsStudioBlock, HrmsStudioMeta } from '~/data/hrmsStudioShared';
import { hrmsNeighborTopics } from '~/data/hrmsFirstPrinciples';

const props = defineProps<{ studio: HrmsStudioMeta }>();

const isFullscreen = ref(false);
const shellEl = ref<HTMLElement | null>(null);
const lessonEl = ref<HTMLElement | null>(null);
const chapterId = ref(props.studio.chapters[0]?.id ?? '');

const chapter = computed(
  () => props.studio.chapters.find((c) => c.id === chapterId.value) ?? props.studio.chapters[0]!,
);

const neighbors = computed(() => hrmsNeighborTopics(props.studio.id));

function md(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function blockText(block: HrmsStudioBlock) {
  return 'text' in block ? block.text ?? '' : '';
}
function blockItems(block: HrmsStudioBlock) {
  return 'items' in block ? block.items ?? [] : [];
}
function blockLines(block: HrmsStudioBlock) {
  if (!('lines' in block)) return '';
  return typeof block.lines === 'string' ? block.lines : block.lines.join('\n');
}
function blockCallout(block: HrmsStudioBlock) {
  return 'lines' in block && Array.isArray(block.lines) ? block.lines : [];
}

function selectChapter(id: string) {
  chapterId.value = id;
  nextTick(() => lessonEl.value?.scrollTo({ top: 0 }));
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

watch(chapterId, (id) => {
  if (!import.meta.client) return;
  const hash = id ? `#${id}` : '';
  if (window.location.hash !== hash) {
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}${hash}`);
  }
});

onMounted(() => {
  document.addEventListener('fullscreenchange', onFs);
  const hash = decodeURIComponent(window.location.hash.replace(/^#/, ''));
  if (props.studio.chapters.some((c) => c.id === hash)) chapterId.value = hash;
});

onUnmounted(() => document.removeEventListener('fullscreenchange', onFs));
</script>

<template>
  <div ref="shellEl" class="st" :class="{ 'is-fs': isFullscreen }" :aria-label="studio.brand">
    <header class="st-header">
      <NuxtLink :to="studio.mapPath" class="st-brand">{{ studio.brand }}</NuxtLink>
      <div class="st-meta">
        <NoteViews :slug="studio.noteSlug" class="st-step" />
        <span class="st-step">{{ studio.chapters.length }} chapters</span>
        <button type="button" class="st-tool" @click="toggleFullscreen">
          <Minimize2 v-if="isFullscreen" :size="14" />
          <Maximize2 v-else :size="14" />
        </button>
        <InsightsReadingToggle />
      </div>
    </header>

    <div class="st-body">
      <nav class="st-nav" aria-label="Chapters">
        <p class="st-nav-title">Chapters</p>
        <button
          v-for="ch in studio.chapters"
          :key="ch.id"
          type="button"
          class="st-nav-item"
          :class="{ 'is-on': chapter.id === ch.id }"
          @click="selectChapter(ch.id)"
        >
          {{ ch.label }}
        </button>
      </nav>

      <section ref="lessonEl" class="st-lesson" aria-label="Studio lesson">
        <p class="st-kicker">{{ chapter.label }}</p>
        <h1>{{ chapter.title }}</h1>
        <p class="st-lead">{{ chapter.lead }}</p>

        <div v-if="chapter.files?.length" class="st-files">
          <p class="st-label">In hrms_api</p>
          <ul>
            <li v-for="f in chapter.files" :key="f">{{ f }}</li>
          </ul>
        </div>

        <template v-for="(block, bIndex) in chapter.blocks" :key="bIndex">
          <h3 v-if="block.type === 'h3'" v-html="md(blockText(block))" />
          <p v-else-if="block.type === 'p'" class="st-p" v-html="md(blockText(block))" />
          <ul v-else-if="block.type === 'ul'" class="st-bullets">
            <li v-for="item in blockItems(block)" :key="item" v-html="md(item)" />
          </ul>
          <ol v-else-if="block.type === 'ol'" class="st-bullets">
            <li v-for="item in blockItems(block)" :key="item" v-html="md(item)" />
          </ol>
          <div v-else-if="block.type === 'pre'" class="st-pre-wrap">
            <p v-if="block.caption" class="st-label">{{ block.caption }}</p>
            <pre>{{ blockLines(block) }}</pre>
          </div>
          <div v-else-if="block.type === 'kid'" class="st-kid">
            <p class="st-label">Kid version</p>
            <ul v-if="blockItems(block).length" class="st-bullets">
              <li v-for="item in blockItems(block)" :key="item" v-html="md(item)" />
            </ul>
            <p v-else class="st-p" v-html="md(blockText(block))" />
          </div>
          <div v-else-if="block.type === 'callout'" class="st-callout">
            <p v-for="line in blockCallout(block)" :key="line" v-html="md(line)" />
          </div>
          <div v-else-if="block.type === 'table' || block.type === 'compare'" class="st-table-wrap">
            <p v-if="block.type === 'compare' && block.title" class="st-label">{{ block.title }}</p>
            <table>
              <thead>
                <tr>
                  <th v-for="col in block.columns" :key="col" v-html="md(col)" />
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rIndex) in block.rows" :key="rIndex">
                  <td v-for="(cell, cIndex) in row" :key="cIndex" v-html="md(cell)" />
                </tr>
              </tbody>
            </table>
          </div>
          <article v-else-if="block.type === 'route'" class="st-route">
            <p class="st-route-path">
              <code class="st-method">{{ block.method }}</code>
              <code>{{ block.path }}</code>
            </p>
            <p class="st-route-gate"><span class="st-label">Gate</span> {{ block.gate }}</p>
            <p class="st-p">{{ block.purpose }}</p>
            <ul v-if="block.notes?.length" class="st-bullets">
              <li v-for="n in block.notes" :key="n" v-html="md(n)" />
            </ul>
          </article>
        </template>

        <div class="st-pager">
          <NuxtLink v-if="neighbors.prev" :to="neighbors.prev.studioPath" class="st-tool">
            ← {{ neighbors.prev.label }}
          </NuxtLink>
          <span v-else />
          <NuxtLink v-if="neighbors.next" :to="neighbors.next.studioPath" class="st-tool">
            {{ neighbors.next.label }} →
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.st {
  --st-bg: #ffffff;
  --st-graph: #fafafa;
  --st-dot: #d0d0d0;
  --st-line: #eaeaea;
  --st-text: #37352f;
  --st-muted: #787774;
  --st-panel: #ffffff;
  --st-accent: #4a9eff;
  --lj-purple: #8b7cff;
  --lj-intent: #7b2d8e;
  --lj-gold: #e6a817;
  height: calc(100dvh - var(--insights-nav-offset, 4rem));
  display: flex;
  flex-direction: column;
  background: var(--st-bg);
  color: var(--st-text);
  overflow: hidden;
}
.st.is-fs {
  height: 100dvh;
}
:global(.insights-shell[data-mode='dark']) .st {
  --st-bg: #111;
  --st-graph: #161616;
  --st-dot: #2b2b2b;
  --st-line: #2a2a2a;
  --st-text: #f3f3f3;
  --st-muted: #9a9a9a;
  --st-panel: #1a1a1a;
}
.st-header {
  min-height: 52px;
  border-bottom: 1px solid var(--st-line);
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 16px 0 20px;
  background: var(--st-bg);
}
.st-brand {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 0.06em;
  color: var(--st-text);
  text-decoration: none;
}
.st-brand:hover {
  color: var(--st-accent);
}
.st-meta {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.st-step {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  color: var(--st-muted);
}
.st-tool {
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--st-line);
  background: var(--st-panel);
  color: var(--st-text);
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  text-decoration: none;
  border-radius: 6px;
  font-family: 'DM Mono', ui-monospace, monospace;
}
.st-tool:hover {
  border-color: var(--st-accent);
  color: var(--st-accent);
}
.st-body {
  flex: 1;
  min-height: 0;
  display: flex;
  background-color: var(--st-graph);
  background-image: radial-gradient(var(--st-dot) 1.5px, transparent 1.5px);
  background-size: 20px 20px;
}
.st-nav {
  width: min(240px, 34vw);
  flex-shrink: 0;
  padding: 16px 12px;
  overflow: auto;
  border-right: 1px solid var(--st-line);
  background: color-mix(in srgb, var(--st-panel) 88%, transparent);
}
.st-nav-title {
  margin: 0 0 10px;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--st-muted);
}
.st-nav-item {
  display: block;
  width: 100%;
  text-align: left;
  margin-bottom: 6px;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--st-muted);
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  cursor: pointer;
}
.st-nav-item:hover {
  color: var(--st-text);
  background: var(--st-panel);
}
.st-nav-item.is-on {
  color: var(--st-text);
  border-color: var(--lj-purple);
  background: color-mix(in srgb, var(--lj-purple) 12%, var(--st-panel));
}
.st-lesson {
  flex: 1;
  min-width: 0;
  padding: 22px 28px 40px;
  overflow: auto;
  background: var(--st-panel);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.st-kicker {
  margin: 0;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--lj-intent);
}
.st-lesson h1 {
  margin: 0;
  font-size: 1.55rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.25;
}
.st-lead,
.st-p {
  margin: 0;
  font-size: 15px;
  line-height: 1.65;
  color: var(--st-muted);
}
.st-lesson h3 {
  margin: 10px 0 0;
  font-size: 1rem;
}
.st-label {
  margin: 0 0 6px;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--lj-intent);
}
.st-files {
  border: 1px solid var(--st-line);
  border-radius: 10px;
  padding: 12px 14px;
  background: var(--st-graph);
}
.st-files ul,
.st-bullets {
  margin: 0;
  padding-left: 1.15rem;
  font-size: 14px;
  line-height: 1.55;
  color: var(--st-muted);
}
.st-files li {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 12px;
}
.st-lesson :deep(code) {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.9em;
  color: var(--st-accent);
}
.st-pre-wrap pre {
  margin: 0;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid var(--st-line);
  background: var(--st-graph);
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  line-height: 1.55;
  white-space: pre-wrap;
  color: var(--st-text);
}
.st-kid {
  padding: 12px 14px;
  border-radius: 8px;
  border-left: 3px solid var(--lj-gold);
  background: color-mix(in srgb, var(--lj-gold) 10%, var(--st-graph));
}
.st-callout {
  padding: 12px 14px;
  border-radius: 8px;
  border-left: 3px solid var(--lj-purple);
  background: color-mix(in srgb, var(--lj-purple) 8%, var(--st-graph));
  font-size: 14px;
  line-height: 1.6;
  color: var(--st-muted);
}
.st-table-wrap {
  overflow: auto;
  border: 1px solid var(--st-line);
  border-radius: 8px;
}
.st-table-wrap table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.st-table-wrap th,
.st-table-wrap td {
  padding: 8px 10px;
  border-bottom: 1px solid var(--st-line);
  text-align: left;
  vertical-align: top;
}
.st-table-wrap th {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--st-muted);
  background: var(--st-graph);
}
.st-route {
  border: 1px solid var(--st-line);
  border-radius: 10px;
  padding: 12px 14px;
  background: var(--st-graph);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.st-route-path {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.st-method {
  padding: 2px 8px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--lj-purple) 18%, var(--st-panel));
  color: var(--lj-purple) !important;
  font-weight: 700;
}
.st-route-gate {
  margin: 0;
  font-size: 13px;
  color: var(--st-muted);
}
.st-pager {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--st-line);
}
@media (max-width: 860px) {
  .st-body {
    flex-direction: column;
  }
  .st-nav {
    width: 100%;
    max-height: 28vh;
    border-right: none;
    border-bottom: 1px solid var(--st-line);
  }
}
</style>
