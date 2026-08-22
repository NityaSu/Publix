<script setup lang="ts">
import { Maximize2, Minimize2, PanelRightClose, PanelRightOpen, RefreshCw } from 'lucide-vue-next';
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import InsightsReadingToggle from '~/component/InsightsReadingToggle.vue';
import NoteViews from '~/component/NoteViews.vue';
import InsightsSplitHandle from '~/component/InsightsSplitHandle.vue';
import VizCartDemo from '~/component/VizCartDemo.vue';
import { useInsightsSplit } from '~/composables/useInsightsSplit';
import {
  KIND_LABEL,
  clusters,
  drinkById,
  drinks,
  neighborTopics,
  topicById,
  topicsInOrder,
  type ClusterId,
  type DrinkKind,
  type LessonBlock,
} from '~/data/vizState';

const CLUSTER_DOT: Record<ClusterId, string> = {
  store: '#8b7cff',
  clocks: '#8b7cff',
  data: '#4A9EFF',
  pointer: '#e6a817',
  intent: '#7B2D8E',
  camera: '#004E89',
  derived: '#3498db',
  share: '#e91e63',
  haunt: '#c0392b',
};

type LayerId = 'hover' | 'select' | 'filter' | 'camera' | 'derived' | 'url';

const KIND_ORDER: DrinkKind[] = ['coffee', 'tea', 'pastry'];

const LAYER_META: { id: LayerId; label: string }[] = [
  { id: 'hover', label: 'Hover' },
  { id: 'select', label: 'Select' },
  { id: 'filter', label: 'Filter' },
  { id: 'camera', label: 'Camera' },
  { id: 'derived', label: 'Derived' },
  { id: 'url', label: 'URL' },
];

const selectedLessonId = ref<string | null>(null);
const activeCluster = ref<ClusterId | null>(null);
const isFullscreen = ref(false);
const shellEl = ref<HTMLElement | null>(null);
const graphEl = ref<HTMLElement | null>(null);
const chartEl = ref<HTMLElement | null>(null);
const svgEl = ref<SVGSVGElement | null>(null);
const lessonEl = ref<HTMLElement | null>(null);
const chartSize = reactive({ width: 640, height: 360 });

const {
  bodyEl,
  leftPct,
  leftStyle,
  dragging,
  rightOpen,
  toggleRight,
  onHandlePointerDown,
  onHandleKeydown,
} = useInsightsSplit({ storageKey: 'state-in-visualization', defaultPct: 46 });

const hoverId = ref<string | null>(null);
const selectedId = ref<string | null>(null);
const filterKind = ref<DrinkKind | null>(null);
const haunted = ref(false);
const transform = reactive({ x: 0, y: 0, k: 1 });
const layers = reactive<Record<LayerId, boolean>>({
  hover: true,
  select: true,
  filter: true,
  camera: true,
  derived: true,
  url: true,
});

const selectedTopic = computed(() =>
  selectedLessonId.value ? topicById(selectedLessonId.value) ?? null : null,
);
const selectedCluster = computed(() => {
  if (!selectedTopic.value) return null;
  return clusters.find((cluster) => cluster.id === selectedTopic.value?.cluster) ?? null;
});
const neighbors = computed(() =>
  selectedLessonId.value
    ? neighborTopics(selectedLessonId.value)
    : { prev: null, next: null },
);

const howTo = computed(() => {
  const id = selectedLessonId.value;
  if (!id || id === 'store') {
    return {
      kicker: 'Start here',
      text: 'Read the right side first. In the café, click Add latte. Then press Next at the bottom of the lesson.',
    };
  }
  if (id === 'clocks') {
    return {
      kicker: 'Now the chart',
      text: 'Hover a bar (gold). Click it (purple). Watch the colored pills above the bars.',
    };
  }
  const number = selectedTopic.value?.n ?? '';
  return {
    kicker: `Lesson ${number}`,
    text: 'The chart follows this lesson. When you are done, press Next under the writing.',
  };
});

const selectedDrink = computed(() => drinkById(selectedId.value));
const hoverDrink = computed(() => drinkById(hoverId.value));
const maxCups = Math.max(...drinks.map((drink) => drink.cups));

const sameKindIds = computed(() => {
  if (!layers.derived || !selectedDrink.value) return new Set<string>();
  const kind = selectedDrink.value.kind;
  return new Set(
    drinks
      .filter((drink) => drink.kind === kind && drink.id !== selectedDrink.value?.id)
      .map((drink) => drink.id),
  );
});

const selectionHidden = computed(() => {
  if (!selectedDrink.value || !filterKind.value) return false;
  return selectedDrink.value.kind !== filterKind.value;
});

const pretendUrl = computed(() => {
  if (!layers.url) return '—';
  const params = new URLSearchParams();
  if (selectedId.value) params.set('sel', selectedId.value);
  if (filterKind.value) params.set('kind', filterKind.value);
  const query = params.toString();
  return query ? `?${query}` : '(intent empty)';
});

const layout = computed(() => {
  const width = Math.max(chartSize.width, 280);
  const height = Math.max(chartSize.height, 200);
  const pad = { top: 28, right: 14, bottom: 52, left: 34 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const band = innerW / drinks.length;
  const bars = drinks.map((drink, index) => {
    const h = Math.max(4, (drink.cups / maxCups) * innerH);
    const x = pad.left + index * band + band * 0.18;
    const w = band * 0.64;
    const y = pad.top + innerH - h;
    const cx = pad.left + index * band + band * 0.5;
    return {
      ...drink,
      x,
      y,
      w,
      h,
      labelX: cx,
      labelY: pad.top + innerH + 14,
      cupsX: cx,
      cupsY: y - 6,
      nameLines: drink.name.split(/\s+/),
    };
  });
  const ticks = [0, 0.5, 1].map((t) => {
    const value = Math.round(maxCups * t);
    return {
      value,
      y: pad.top + innerH - t * innerH,
    };
  });
  return { width, height, pad, innerW, innerH, bars, ticks };
});

function isDimmed(kind: DrinkKind) {
  return Boolean(layers.filter && filterKind.value && filterKind.value !== kind);
}

function toggleLayer(id: LayerId) {
  layers[id] = !layers[id];
  if (id === 'hover' && !layers.hover) hoverId.value = null;
  if (id === 'select' && !layers.select) selectedId.value = null;
  if (id === 'filter' && !layers.filter) filterKind.value = null;
  if (id === 'camera' && !layers.camera) {
    transform.x = 0;
    transform.y = 0;
    transform.k = 1;
  }
}

function toggleFilter(kind: DrinkKind) {
  if (!layers.filter) return;
  filterKind.value = filterKind.value === kind ? null : kind;
}

function onBarEnter(id: string) {
  if (!layers.hover && !haunted.value) return;
  if (layers.hover) hoverId.value = id;
  if (haunted.value) selectedId.value = id;
}

function onBarLeave() {
  hoverId.value = null;
}

function onBarClick(id: string) {
  if (!layers.select || haunted.value) return;
  selectedId.value = selectedId.value === id ? null : id;
}

function applyLessonDemo(id: string) {
  haunted.value = false;
  transform.x = 0;
  transform.y = 0;
  transform.k = 1;
  hoverId.value = null;

  const allOn = () => {
    layers.hover = true;
    layers.select = true;
    layers.filter = true;
    layers.camera = true;
    layers.derived = true;
    layers.url = true;
  };

  const only = (on: LayerId[]) => {
    (Object.keys(layers) as LayerId[]).forEach((key) => {
      layers[key] = on.includes(key);
    });
  };

  switch (id) {
    case 'store':
      only([]);
      selectedId.value = null;
      filterKind.value = null;
      break;
    case 'data':
      only([]);
      selectedId.value = null;
      filterKind.value = null;
      break;
    case 'hover':
      only(['hover']);
      selectedId.value = null;
      filterKind.value = null;
      break;
    case 'select':
      only(['hover', 'select']);
      selectedId.value = 'latte';
      filterKind.value = null;
      break;
    case 'filter':
      only(['hover', 'select', 'filter']);
      selectedId.value = 'muffin';
      filterKind.value = 'coffee';
      break;
    case 'camera':
      only(['camera', 'select']);
      selectedId.value = 'latte';
      filterKind.value = null;
      transform.k = 1.35;
      transform.x = -40;
      break;
    case 'derived':
      only(['select', 'derived']);
      selectedId.value = 'latte';
      filterKind.value = null;
      break;
    case 'url':
      only(['select', 'filter', 'url']);
      selectedId.value = 'latte';
      filterKind.value = 'coffee';
      break;
    case 'mix':
    case 'haunted':
      allOn();
      haunted.value = true;
      selectedId.value = 'latte';
      filterKind.value = null;
      break;
    default:
      allOn();
      if (!selectedId.value) selectedId.value = 'latte';
      if (id === 'rule' || id === 'clocks' || id === 'graph' || id === 'store') haunted.value = false;
      break;
  }
}

function selectTopic(id: string) {
  selectedLessonId.value = id;
  applyLessonDemo(id);
  nextTick(() => {
    lessonEl.value?.scrollTo({ top: 0 });
  });
}

function toggleCluster(id: ClusterId) {
  activeCluster.value = activeCluster.value === id ? null : id;
}

function resetPlayground() {
  haunted.value = false;
  hoverId.value = null;
  selectedId.value = null;
  filterKind.value = null;
  transform.x = 0;
  transform.y = 0;
  transform.k = 1;
  layers.hover = true;
  layers.select = true;
  layers.filter = true;
  layers.camera = true;
  layers.derived = true;
  layers.url = true;
}

function md(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function blockText(block: LessonBlock) {
  return 'text' in block ? block.text ?? '' : '';
}

function blockItems(block: LessonBlock) {
  return 'items' in block ? block.items ?? [] : [];
}

function blockLines(block: LessonBlock) {
  return 'lines' in block ? (typeof block.lines === 'string' ? block.lines : block.lines.join('\n')) : '';
}

function blockCallout(block: LessonBlock) {
  return 'lines' in block && Array.isArray(block.lines) ? block.lines : [];
}

function blockColumns(block: LessonBlock) {
  return block.type === 'table' ? block.columns : [];
}

function blockRows(block: LessonBlock) {
  return block.type === 'table' ? block.rows : [];
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
    /* layout fullscreen still works without the browser API */
  }
}

function onFullscreenChange() {
  if (document.fullscreenElement) {
    isFullscreen.value = document.fullscreenElement === shellEl.value;
    return;
  }
  isFullscreen.value = false;
}

let panning = false;
let panStart = { x: 0, y: 0, tx: 0, ty: 0 };

function onWheel(event: WheelEvent) {
  if (!layers.camera) return;
  event.preventDefault();
  const factor = event.deltaY < 0 ? 1.08 : 0.92;
  const nextK = Math.min(4, Math.max(0.35, transform.k * factor));
  const rect = svgEl.value?.getBoundingClientRect();
  if (!rect) return;
  const px = event.clientX - rect.left;
  const py = event.clientY - rect.top;
  transform.x = px - ((px - transform.x) * nextK) / transform.k;
  transform.y = py - ((py - transform.y) * nextK) / transform.k;
  transform.k = nextK;
}

function onCanvasDown(event: PointerEvent) {
  if (!layers.camera) return;
  if ((event.target as HTMLElement).closest('.vz-bar')) return;
  panning = true;
  panStart = { x: event.clientX, y: event.clientY, tx: transform.x, ty: transform.y };
  svgEl.value?.setPointerCapture(event.pointerId);
}

function onCanvasMove(event: PointerEvent) {
  if (!panning) return;
  transform.x = panStart.tx + (event.clientX - panStart.x);
  transform.y = panStart.ty + (event.clientY - panStart.y);
}

function onCanvasUp() {
  panning = false;
}

function measureChart() {
  const el = chartEl.value ?? graphEl.value;
  if (!el) return;
  chartSize.width = Math.max(280, el.clientWidth);
  chartSize.height = Math.max(160, el.clientHeight);
}

watch(selectedLessonId, (id) => {
  if (!import.meta.client) return;
  const hash = id ? `#${id}` : '';
  if (window.location.hash !== hash) {
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}${hash}`);
  }
});

let resizeObserver: ResizeObserver | null = null;

onMounted(async () => {
  await nextTick();
  measureChart();
  const hash = decodeURIComponent(window.location.hash.replace(/^#/, ''));
  if (topicById(hash)) selectTopic(hash);
  else selectTopic('store');
  document.addEventListener('fullscreenchange', onFullscreenChange);
  const observed = chartEl.value ?? graphEl.value;
  if (observed) {
    resizeObserver = new ResizeObserver(() => measureChart());
    resizeObserver.observe(observed);
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  document.removeEventListener('fullscreenchange', onFullscreenChange);
});
</script>

<template>
  <div ref="shellEl" class="mf" :class="{ 'is-fs': isFullscreen }">
    <header class="mf-header">
      <NuxtLink to="/insights/notes" class="mf-brand">STATE IN VIZ</NuxtLink>
      <div class="mf-meta">
        <NoteViews slug="state-in-visualization" class="mf-step" />
        <span class="mf-step">13 lessons</span>
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
      <section
        v-show="!isFullscreen"
        ref="graphEl"
        class="mf-graph vz-graph"
        :style="leftStyle"
        aria-label="Live chart"
      >
        <div class="vz-graph-head mf-graph-head">
          <div>
            <p class="mf-graph-title">The chart</p>
            <p class="vz-howto">
              <strong>{{ howTo.kicker }}.</strong>
              {{ howTo.text }}
            </p>
          </div>
          <button type="button" class="mf-tool" @click="resetPlayground">
            <RefreshCw :size="14" />
            Reset
          </button>
        </div>

        <div class="vz-hud">
          <div class="vz-layers">
            <button
              v-for="layer in LAYER_META"
              :key="layer.id"
              type="button"
              class="vz-chip"
              :class="['is-' + layer.id, { 'is-on': layers[layer.id] }]"
              @click="toggleLayer(layer.id)"
            >
              {{ layer.label }}
            </button>
            <button
              type="button"
              class="vz-chip is-haunt"
              :class="{ 'is-on': haunted }"
              @click="haunted = !haunted"
            >
              Haunted
            </button>
          </div>

          <div class="vz-pills" aria-live="polite">
            <span class="vz-pill is-data">data · {{ drinks.length }} drinks</span>
            <span class="vz-pill is-hover" :class="{ 'is-lit': hoverDrink }">
              hover · {{ hoverDrink?.name ?? '—' }}
            </span>
            <span class="vz-pill is-select" :class="{ 'is-lit': selectedDrink, 'is-warn': selectionHidden }">
              selected · {{ selectedDrink?.name ?? '—' }}{{ selectionHidden ? ' (hidden)' : '' }}
            </span>
            <span class="vz-pill is-filter" :class="{ 'is-lit': filterKind }">
              filter · {{ filterKind ? KIND_LABEL[filterKind] : 'all' }}
            </span>
            <span class="vz-pill is-camera" :class="{ 'is-lit': transform.k !== 1 || transform.x !== 0 }">
              camera · {{ transform.k.toFixed(2) }}×
            </span>
            <span class="vz-pill is-derived" :class="{ 'is-lit': sameKindIds.size > 0 }">
              derived · {{ sameKindIds.size }} same kind
            </span>
            <span v-if="layers.url" class="vz-pill is-url" :class="{ 'is-lit': selectedId || filterKind }">
              url · {{ pretendUrl }}
            </span>
          </div>
        </div>

        <div ref="chartEl" class="vz-chart">
        <svg
          ref="svgEl"
          class="vz-svg"
          :viewBox="`0 0 ${layout.width} ${layout.height}`"
          @wheel.prevent="onWheel"
          @pointerdown="onCanvasDown"
          @pointermove="onCanvasMove"
          @pointerup="onCanvasUp"
          @pointercancel="onCanvasUp"
        >
          <defs>
            <linearGradient id="vz-bar-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#8b7cff" />
              <stop offset="48%" stop-color="#4A9EFF" />
              <stop offset="100%" stop-color="#ffffff" />
            </linearGradient>
          </defs>

          <g :transform="`translate(${transform.x} ${transform.y}) scale(${transform.k})`">
            <line
              v-for="tick in layout.ticks"
              :key="tick.value"
              class="vz-grid"
              :x1="layout.pad.left"
              :x2="layout.width - layout.pad.right"
              :y1="tick.y"
              :y2="tick.y"
            />
            <text
              v-for="tick in layout.ticks"
              :key="`t-${tick.value}`"
              class="vz-tick"
              :x="layout.pad.left - 6"
              :y="tick.y + 3"
              text-anchor="end"
            >
              {{ tick.value }}
            </text>

            <g
              v-for="bar in layout.bars"
              :key="bar.id"
              class="vz-bar"
              :class="{
                'is-hot': layers.hover && hoverId === bar.id,
                'is-on': layers.select && selectedId === bar.id,
                'is-dim': isDimmed(bar.kind),
                'is-kin': sameKindIds.has(bar.id),
                'is-illegal': selectionHidden && selectedId === bar.id,
              }"
              @pointerenter="onBarEnter(bar.id)"
              @pointerleave="onBarLeave"
              @click="onBarClick(bar.id)"
            >
              <title>{{ bar.name }} · {{ bar.cups }} cups</title>
              <rect
                class="vz-hit"
                :x="bar.x"
                :y="layout.pad.top"
                :width="bar.w"
                :height="layout.innerH"
              />
              <rect
                v-if="sameKindIds.has(bar.id)"
                class="vz-kin"
                :x="bar.x - 4"
                :y="bar.y - 4"
                :width="bar.w + 8"
                :height="bar.h + 8"
                rx="3"
              />
              <rect
                class="vz-rect"
                :x="bar.x"
                :y="bar.y"
                :width="bar.w"
                :height="bar.h"
                rx="3"
              />
              <text class="vz-cups" :x="bar.cupsX" :y="bar.cupsY" text-anchor="middle">
                {{ bar.cups }}
              </text>
              <text class="vz-name" :x="bar.labelX" :y="bar.labelY" text-anchor="middle">
                <tspan
                  v-for="(line, lineIndex) in bar.nameLines"
                  :key="line"
                  :x="bar.labelX"
                  :dy="lineIndex === 0 ? 0 : 11"
                >
                  {{ line }}
                </tspan>
              </text>
            </g>
          </g>
        </svg>
        </div>

        <div class="vz-nodes">
          <div v-if="layers.filter" class="vz-filters">
            <button
              v-for="kind in KIND_ORDER"
              :key="kind"
              type="button"
              class="vz-filter"
              :class="{ 'is-on': filterKind === kind }"
              @click="toggleFilter(kind)"
            >
              {{ KIND_LABEL[kind] }}
            </button>
          </div>

          <div class="vz-lessons" aria-label="Lessons">
            <button
              v-for="topic in topicsInOrder"
              :key="topic.id"
              type="button"
              class="vz-node"
              :class="{
                'is-on': selectedLessonId === topic.id,
                'is-dim': activeCluster && topic.cluster !== activeCluster,
              }"
              :style="{ '--dot': CLUSTER_DOT[topic.cluster] }"
              :title="topic.title"
              :aria-label="`Lesson ${topic.n}: ${topic.title}`"
              @click="selectTopic(topic.id)"
            >
              {{ topic.n }}
            </button>
          </div>

          <div class="mf-legend vz-legend">
            <span class="mf-legend-title">Clocks</span>
            <div class="mf-legend-items">
              <button
                v-for="cluster in clusters"
                :key="cluster.id"
                type="button"
                class="mf-legend-item"
                :class="{ 'is-on': activeCluster === cluster.id }"
                @click="toggleCluster(cluster.id)"
              >
                <i class="mf-legend-dot" :style="{ background: CLUSTER_DOT[cluster.id] }" />
                {{ cluster.label }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <InsightsSplitHandle
        v-show="!isFullscreen && rightOpen"
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
        aria-label="Lesson"
      >
        <article v-if="selectedTopic" class="mf-page">
          <div class="mf-lesson-top">
            <p class="mf-kicker">
              Lesson {{ selectedTopic.n.toString().padStart(2, '0') }}
              <span v-if="selectedCluster"> · {{ selectedCluster.label }}</span>
            </p>
            <button
              type="button"
              class="mf-tool mf-lesson-close"
              aria-label="Hide notes panel"
              @click="toggleRight"
            >
              <PanelRightClose :size="14" />
              Hide
            </button>
          </div>
          <h1>{{ selectedTopic.title }}</h1>
          <p class="mf-lead">{{ selectedTopic.gist }}</p>
          <VizCartDemo v-if="selectedTopic.id === 'store'" />

          <ul v-if="!selectedTopic.sections?.length" class="mf-bullets">
            <li v-for="line in selectedTopic.remember" :key="line">{{ line }}</li>
          </ul>

          <section
            v-for="(section, sIndex) in selectedTopic.sections"
            :key="`${selectedTopic.id}-${sIndex}`"
            class="mf-block"
          >
            <h2>{{ section.heading }}</h2>
            <template v-for="(block, bIndex) in section.blocks" :key="`${selectedTopic.id}-${sIndex}-${bIndex}`">
              <h3 v-if="block.type === 'h3'" v-html="md(blockText(block))" />
              <p v-else-if="block.type === 'p'" v-html="md(blockText(block))" />
              <blockquote v-else-if="block.type === 'quote'" v-html="md(blockText(block))" />
              <ul v-else-if="block.type === 'ul'" class="mf-bullets">
                <li v-for="item in blockItems(block)" :key="item" v-html="md(item)" />
              </ul>
              <pre v-else-if="block.type === 'pre'">{{ blockLines(block) }}</pre>
              <hr v-else-if="block.type === 'hr'" class="mf-rule" />
              <div v-else-if="block.type === 'table'" class="mf-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th v-for="col in blockColumns(block)" :key="col" v-html="md(col)" />
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, rIndex) in blockRows(block)" :key="rIndex">
                      <td v-for="(cell, cIndex) in row" :key="cIndex" v-html="md(cell)" />
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else-if="block.type === 'kid'" class="mf-kid">
                <p class="mf-kid-label">Kid version</p>
                <ul v-if="blockItems(block).length" class="mf-bullets">
                  <li v-for="item in blockItems(block)" :key="item" v-html="md(item)" />
                </ul>
                <p v-else v-html="md(blockText(block))" />
              </div>
              <div v-else-if="block.type === 'callout'" class="mf-callout">
                <p v-for="line in blockCallout(block)" :key="line" v-html="md(line)" />
              </div>
            </template>
          </section>

          <div class="mf-pager">
            <button
              v-if="neighbors.prev"
              type="button"
              @click="neighbors.prev && selectTopic(neighbors.prev.id)"
            >
              ← {{ neighbors.prev.n }}. {{ neighbors.prev.label }}
            </button>
            <span v-else />
            <button
              v-if="neighbors.next"
              type="button"
              @click="neighbors.next && selectTopic(neighbors.next.id)"
            >
              {{ neighbors.next.n }}. {{ neighbors.next.label }} →
            </button>
          </div>
        </article>

        <div v-else class="mf-empty vz-empty">
          <p>Start on the right: lesson 1 is the shop.</p>
          <p>Then use Next to reach the chart.</p>
        </div>
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
  --mf-edge: #c0c0c0;
  --mf-panel: #ffffff;
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
  --mf-edge: #5a5a5a;
  --mf-panel: #1a1a1a;
}

.mf-header {
  height: 56px;
  border-bottom: 1px solid var(--mf-line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
  background: var(--mf-bg);
}

.mf-brand {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 1px;
  color: var(--mf-text);
}

.mf-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mf-step {
  font-size: 13px;
  font-weight: 600;
  color: var(--mf-muted);
}

.mf-tool,
.mf-pager button {
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--mf-line);
  background: var(--mf-panel);
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--mf-muted);
  font-size: 12px;
}

.mf-body {
  flex: 1;
  display: flex;
  flex-direction: row;
  min-height: 0;
}

.mf-body.is-dragging {
  cursor: col-resize;
}

.mf-body.is-notes-closed .mf-graph {
  flex: 1 1 100%;
  width: 100%;
}

.mf-lesson-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.15rem;
}

.mf-lesson-top .mf-kicker {
  margin: 0;
}

.mf-lesson-close {
  flex-shrink: 0;
}

.mf-graph {
  position: relative;
  width: 46%;
  min-width: 0;
  flex: 1 1 46%;
  min-height: 0;
  background-color: var(--mf-graph);
  background-image: radial-gradient(var(--mf-dot) 1.5px, transparent 1.5px);
  background-size: 24px 24px;
  display: flex;
  flex-direction: column;
}

.vz-graph {
  overflow: hidden;
}

.mf-graph-head {
  padding: 12px 16px 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-shrink: 0;
}

.mf-graph-title {
  font-size: 13px;
  font-weight: 600;
}

.vz-howto {
  margin: 4px 0 0;
  max-width: 28rem;
  font-size: 12px;
  line-height: 1.45;
  color: var(--mf-muted);
}

.vz-hud {
  padding: 8px 16px 4px;
  flex-shrink: 0;
  z-index: 10;
}

.vz-layers,
.vz-pills,
.vz-filters,
.vz-lessons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.vz-pills {
  margin-top: 8px;
}

.vz-chip,
.vz-filter {
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid var(--mf-line);
  background: var(--mf-panel);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--mf-muted);
}

.vz-chip.is-on,
.vz-filter.is-on {
  color: var(--mf-text);
  border-color: transparent;
}

.vz-chip.is-hover.is-on { background: color-mix(in srgb, #e6a817 28%, var(--mf-panel)); }
.vz-chip.is-select.is-on { background: color-mix(in srgb, #7B2D8E 28%, var(--mf-panel)); }
.vz-chip.is-filter.is-on { background: color-mix(in srgb, #4A9EFF 28%, var(--mf-panel)); }
.vz-chip.is-camera.is-on { background: color-mix(in srgb, #004E89 28%, var(--mf-panel)); }
.vz-chip.is-derived.is-on { background: color-mix(in srgb, #3498db 28%, var(--mf-panel)); }
.vz-chip.is-url.is-on { background: color-mix(in srgb, #e91e63 22%, var(--mf-panel)); }
.vz-chip.is-haunt.is-on { background: color-mix(in srgb, #c0392b 32%, var(--mf-panel)); color: var(--mf-text); }

.vz-pill {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--mf-muted) 12%, transparent);
  color: var(--mf-muted);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vz-pill.is-lit { color: var(--mf-text); font-weight: 600; }
.vz-pill.is-hover.is-lit { background: color-mix(in srgb, #e6a817 30%, transparent); }
.vz-pill.is-select.is-lit { background: color-mix(in srgb, #7B2D8E 30%, transparent); }
.vz-pill.is-filter.is-lit { background: color-mix(in srgb, #4A9EFF 30%, transparent); }
.vz-pill.is-camera.is-lit { background: color-mix(in srgb, #4A9EFF 22%, transparent); }
.vz-pill.is-derived.is-lit { background: color-mix(in srgb, #3498db 30%, transparent); }
.vz-pill.is-url.is-lit { background: color-mix(in srgb, #e91e63 22%, transparent); }
.vz-pill.is-warn { background: color-mix(in srgb, #c0392b 28%, transparent); color: var(--mf-text); }

.vz-chart {
  flex: 1 1 auto;
  min-height: 160px;
  width: 100%;
}

.vz-svg {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
  cursor: grab;
}

.vz-grid { stroke: var(--mf-line); stroke-width: 1; }
.vz-tick {
  fill: var(--mf-muted);
  font-size: 9px;
  font-family: 'DM Mono', ui-monospace, monospace;
}
.vz-bar { cursor: pointer; }
.vz-hit { fill: transparent; }
.vz-rect {
  fill: url(#vz-bar-fill);
  stroke: #ffffff;
  stroke-width: 2.5;
  transition: opacity 0.2s ease, stroke 0.15s ease, stroke-width 0.15s ease;
}
.vz-bar.is-hot .vz-rect {
  stroke: #e6a817;
  stroke-width: 3.5;
}
.vz-bar.is-on .vz-rect {
  stroke: #7B2D8E;
  stroke-width: 3.5;
}
.vz-bar.is-dim { opacity: 0.18; }
.vz-bar.is-illegal .vz-rect {
  stroke: #c0392b;
  stroke-width: 3;
}
.vz-kin {
  fill: none;
  stroke: #3498db;
  stroke-width: 1.5;
  stroke-dasharray: 4 3;
}
.vz-cups,
.vz-name {
  fill: var(--mf-text);
  font-size: 10px;
  font-weight: 600;
  pointer-events: none;
}
.vz-cups { font-family: 'DM Mono', ui-monospace, monospace; font-size: 9px; fill: var(--mf-muted); }

.vz-nodes {
  padding: 4px 12px 12px;
  flex-shrink: 0;
  z-index: 10;
}

.vz-filters { margin-bottom: 8px; }

.vz-node {
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 50%;
  border: 2.5px solid #fff;
  background: linear-gradient(180deg, #8b7cff 0%, #4A9EFF 48%, #ffffff 100%);
  color: #1a1440;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  font-weight: 700;
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--mf-line) 70%, transparent);
}
.vz-node.is-on {
  border-width: 3.5px;
}
.vz-node.is-dim { opacity: 0.25; }

.vz-legend {
  position: static;
  margin-top: 10px;
  background: color-mix(in srgb, var(--mf-panel) 94%, transparent);
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--mf-line);
}

.mf-legend-title {
  display: block;
  font-size: 10px;
  font-weight: 600;
  color: #e91e63;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.mf-legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
}
.mf-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--mf-muted);
}
.mf-legend-item.is-on { color: var(--mf-text); font-weight: 600; }
.mf-legend-dot { width: 10px; height: 10px; border-radius: 50%; }

.mf-lesson {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  background: var(--mf-bg);
}

.mf.is-fs .mf-lesson {
  flex: 1 1 100%;
}

.mf-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 28px 80px;
}

@media (max-width: 860px) {
  .mf-body { flex-direction: column; }
  .mf-graph {
    width: 100% !important;
    flex: 0 0 48vh !important;
    min-height: 280px;
    border-bottom: 1px solid var(--mf-line);
  }
  .mf-lesson { flex: 1 1 auto; }
}

.mf-kicker {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #7b2d8e;
}

.mf-page h1 {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.2;
  margin: 10px 0 16px;
}

.mf-lead {
  font-size: 17px;
  line-height: 1.7;
  color: var(--mf-text);
}

.mf-block { margin-top: 36px; }

.mf-page h2 {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--mf-line);
}

.mf-page h3 {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin: 22px 0 10px;
}

.mf-page p {
  font-size: 15px;
  line-height: 1.75;
  margin: 0 0 10px;
}

.mf-page blockquote {
  margin: 8px 0 16px;
  padding: 10px 14px;
  border-left: 3px solid #8b7cff;
  background: color-mix(in srgb, #8b7cff 8%, var(--mf-graph));
  font-size: 15px;
  line-height: 1.7;
  font-style: italic;
}

.mf-rule {
  border: 0;
  border-top: 1px solid var(--mf-line);
  margin: 28px 0;
}

.mf-callout {
  margin: 16px 0;
  padding: 14px 16px;
  border: 1px solid var(--mf-line);
  background: var(--mf-graph);
  border-radius: 6px;
}

.mf-callout p { margin: 0 0 6px; }
.mf-callout p:last-child { margin-bottom: 0; }

.mf-bullets {
  margin: 8px 0 16px;
  padding-left: 1.35rem;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mf-bullets li {
  font-size: 15px;
  line-height: 1.7;
}

.mf-page :deep(code) {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.86em;
  background: color-mix(in srgb, var(--mf-muted) 10%, transparent);
  padding: 1px 5px;
  border-radius: 4px;
}

.mf-page :deep(strong) { font-weight: 700; }
.mf-page :deep(em) { font-style: italic; }

.mf-kid {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 6px;
  background: color-mix(in srgb, #8b7cff 10%, var(--mf-graph));
  border-left: 3px solid #8b7cff;
}

.mf-kid-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #7b2d8e;
  margin-bottom: 4px;
}

.mf-kid .mf-bullets { margin-bottom: 0; }

.mf-table-wrap { overflow-x: auto; margin: 12px 0; }
.mf-page table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.mf-page th,
.mf-page td {
  border: 1px solid var(--mf-line);
  padding: 8px 10px;
  text-align: left;
  vertical-align: top;
}
.mf-page th {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--mf-muted);
}
.mf-page pre {
  padding: 12px;
  border: 1px solid var(--mf-line);
  background: var(--mf-graph);
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre;
  border-radius: 6px;
}

.mf-pager {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 48px;
  padding-top: 20px;
  border-top: 1px solid var(--mf-line);
}

.mf-empty {
  display: grid;
  place-content: center;
  min-height: 200px;
  color: var(--mf-muted);
  font-size: 15px;
  text-align: center;
  gap: 6px;
}
</style>
