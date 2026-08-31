<script setup lang="ts">
import { Maximize2, Minimize2, PanelRightClose, PanelRightOpen, RefreshCw } from 'lucide-vue-next';
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import InsightsReadingToggle from '~/component/InsightsReadingToggle.vue';
import NoteViews from '~/component/NoteViews.vue';
import InsightsSplitHandle from '~/component/InsightsSplitHandle.vue';
import { useInsightsSplit } from '~/composables/useInsightsSplit';
import StateManagementStudio from '~/component/StateManagementStudio.vue';
import FrontendSecurityStudio from '~/component/FrontendSecurityStudio.vue';
import {
  clusters,
  graphEdges,
  neighborTopics,
  topicById,
  topicsInOrder,
  type ClusterId,
  type LessonBlock,
} from '~/data/frontendFirstPrinciples';

interface SimNode {
  id: string;
  n: number;
  label: string;
  title: string;
  cluster: ClusterId;
  gist: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx: number | null;
  fy: number | null;
}

interface SimEdge {
  id: string;
  source: string;
  target: string;
  kind: 'then' | 'relates';
}

const NODE_R = 18;
const CLUSTER_DOT: Record<ClusterId, string> = {
  glass: '#8b7cff',
  pieces: '#4A9EFF',
  memory: '#7B2D8E',
  wire: '#004E89',
  lock: '#c0392b',
  keep: '#9b8cff',
};

const selectedId = ref<string | null>(null);
const hoverId = ref<string | null>(null);
const showEdgeLabels = ref(false);
const activeCluster = ref<ClusterId | null>(null);
const isFullscreen = ref(false);
const graphEl = ref<HTMLElement | null>(null);
const svgEl = ref<SVGSVGElement | null>(null);
const shellEl = ref<HTMLElement | null>(null);
const lessonEl = ref<HTMLElement | null>(null);
const simNodes = ref<SimNode[]>([]);
const transform = reactive({ x: 0, y: 0, k: 1 });

const {
  bodyEl,
  leftPct,
  leftStyle,
  dragging,
  rightOpen,
  toggleRight,
  onHandlePointerDown,
  onHandleKeydown,
} = useInsightsSplit({ storageKey: 'frontend-first-principle', defaultPct: 42 });

const selectedTopic = computed(() =>
  selectedId.value ? topicById(selectedId.value) ?? null : null,
);
const selectedCluster = computed(() => {
  if (!selectedTopic.value) return null;
  return clusters.find((cluster) => cluster.id === selectedTopic.value?.cluster) ?? null;
});
const neighbors = computed(() =>
  selectedId.value
    ? neighborTopics(selectedId.value)
    : { prev: null, next: null },
);

const simEdges = computed<SimEdge[]>(() => {
  const sequential: SimEdge[] = topicsInOrder.slice(0, -1).flatMap((topic, index) => {
    const next = topicsInOrder[index + 1];
    return next
      ? [{ id: `${topic.id}->${next.id}`, source: topic.id, target: next.id, kind: 'then' as const }]
      : [];
  });
  const related: SimEdge[] = graphEdges.flatMap((edge) => {
    if (!topicById(edge.from) || !topicById(edge.to)) return [];
    if (sequential.some((item) => item.source === edge.from && item.target === edge.to)) return [];
    return [{ id: `${edge.from}~${edge.to}`, source: edge.from, target: edge.to, kind: 'relates' as const }];
  });
  return [...sequential, ...related];
});

const nodeById = computed(() => {
  const map: Record<string, SimNode> = {};
  for (const node of simNodes.value) map[node.id] = node;
  return map;
});

const highlighted = computed(() => {
  const ids = new Set<string>();
  if (selectedId.value) {
    ids.add(selectedId.value);
    for (const edge of simEdges.value) {
      if (edge.source === selectedId.value) ids.add(edge.target);
      if (edge.target === selectedId.value) ids.add(edge.source);
    }
  }
  if (activeCluster.value) {
    for (const node of simNodes.value) {
      if (node.cluster === activeCluster.value) ids.add(node.id);
    }
  }
  return ids;
});

function isDimmed(id: string) {
  if (highlighted.value.size === 0) return false;
  return !highlighted.value.has(id);
}

function edgeActive(edge: SimEdge) {
  if (!selectedId.value) return false;
  return edge.source === selectedId.value || edge.target === selectedId.value;
}

function selectTopic(id: string) {
  selectedId.value = id;
  nextTick(() => {
    lessonEl.value?.scrollTo({ top: 0 });
  });
}

function clearTopic() {
  selectedId.value = null;
}

function md(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /\[([^\]]+)\]\((https?:[^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    )
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

function toggleCluster(id: ClusterId) {
  activeCluster.value = activeCluster.value === id ? null : id;
}

let raf = 0;
let alpha = 1;
let running = false;
let dragId: string | null = null;
let panning = false;
let panStart = { x: 0, y: 0, tx: 0, ty: 0 };

function size() {
  const el = graphEl.value;
  return {
    width: el?.clientWidth || 800,
    height: el?.clientHeight || 560,
  };
}

function seedNodes() {
  const { width, height } = size();
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.34;
  simNodes.value = topicsInOrder.map((topic, index) => {
    const angle = (index / topicsInOrder.length) * Math.PI * 2 - Math.PI / 2;
    return {
      id: topic.id,
      n: topic.n,
      label: topic.label,
      title: topic.title,
      cluster: topic.cluster,
      gist: topic.gist,
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      vx: 0,
      vy: 0,
      fx: null,
      fy: null,
    };
  });
  transform.x = 0;
  transform.y = 0;
  transform.k = 1;
  reheat();
}

function reheat() {
  alpha = 1;
  if (!running) {
    running = true;
    raf = requestAnimationFrame(tick);
  }
}

function tick() {
  const nodes = simNodes.value;
  const { width, height } = size();
  const cx = width / 2;
  const cy = height / 2;
  const edges = simEdges.value;
  const lookup = nodeById.value;

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      if (!a || !b) continue;
      let dx = a.x - b.x;
      let dy = a.y - b.y;
      let dist = Math.hypot(dx, dy) || 0.01;
      const min = NODE_R * 2 + 28;
      const force = ((800 * alpha) / (dist * dist));
      dx /= dist;
      dy /= dist;
      a.vx += dx * force;
      a.vy += dy * force;
      b.vx -= dx * force;
      b.vy -= dy * force;
      if (dist < min) {
        const overlap = (min - dist) * 0.5;
        a.x += dx * overlap;
        a.y += dy * overlap;
        b.x -= dx * overlap;
        b.y -= dy * overlap;
      }
    }
  }

  for (const edge of edges) {
    const source = lookup[edge.source];
    const target = lookup[edge.target];
    if (!source || !target) continue;
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.hypot(dx, dy) || 0.01;
    const rest = edge.kind === 'then' ? 118 : 150;
    const pull = ((dist - rest) / dist) * 0.045 * alpha;
    source.vx += dx * pull;
    source.vy += dy * pull;
    target.vx -= dx * pull;
    target.vy -= dy * pull;
  }

  for (const node of nodes) {
    node.vx += (cx - node.x) * 0.018 * alpha;
    node.vy += (cy - node.y) * 0.018 * alpha;
    node.vx *= 0.84;
    node.vy *= 0.84;
    if (node.fx != null && node.fy != null) {
      node.x = node.fx;
      node.y = node.fy;
      node.vx = 0;
      node.vy = 0;
    } else {
      node.x += node.vx;
      node.y += node.vy;
    }
  }

  alpha *= 0.96;
  if (alpha > 0.025) {
    raf = requestAnimationFrame(tick);
  } else {
    running = false;
  }
}

function clientToGraph(clientX: number, clientY: number) {
  const rect = svgEl.value?.getBoundingClientRect();
  if (!rect) return { x: 0, y: 0 };
  return {
    x: (clientX - rect.left - transform.x) / transform.k,
    y: (clientY - rect.top - transform.y) / transform.k,
  };
}

function onWheel(event: WheelEvent) {
  event.preventDefault();
  const factor = event.deltaY < 0 ? 1.08 : 0.92;
  const nextK = Math.min(4, Math.max(0.2, transform.k * factor));
  const rect = svgEl.value?.getBoundingClientRect();
  if (!rect) return;
  const px = event.clientX - rect.left;
  const py = event.clientY - rect.top;
  transform.x = px - ((px - transform.x) * nextK) / transform.k;
  transform.y = py - ((py - transform.y) * nextK) / transform.k;
  transform.k = nextK;
}

function onCanvasDown(event: PointerEvent) {
  if (event.button !== 0) return;
  if ((event.target as HTMLElement).closest('.mf-node')) return;
  panning = true;
  panStart = { x: event.clientX, y: event.clientY, tx: transform.x, ty: transform.y };
  svgEl.value?.setPointerCapture(event.pointerId);
}

function onCanvasMove(event: PointerEvent) {
  if (dragId) {
    const node = nodeById.value[dragId];
    if (!node) return;
    const point = clientToGraph(event.clientX, event.clientY);
    node.fx = point.x;
    node.fy = point.y;
    node.x = point.x;
    node.y = point.y;
    reheat();
    return;
  }
  if (!panning) return;
  transform.x = panStart.tx + (event.clientX - panStart.x);
  transform.y = panStart.ty + (event.clientY - panStart.y);
}

function onCanvasUp(event: PointerEvent) {
  const wasDraggingNode = Boolean(dragId);
  if (dragId) {
    const node = nodeById.value[dragId];
    if (node) {
      node.fx = null;
      node.fy = null;
    }
    dragId = null;
  }
  const wasPanning = panning;
  panning = false;
  if (wasDraggingNode || !wasPanning || event.type === 'pointercancel') return;
  const moved = Math.hypot(event.clientX - panStart.x, event.clientY - panStart.y) > 6;
  if (!moved) clearTopic();
}

function onNodeDown(event: PointerEvent, id: string) {
  event.stopPropagation();
  dragId = id;
  selectTopic(id);
  const node = nodeById.value[id];
  if (node) {
    node.fx = node.x;
    node.fy = node.y;
  }
  svgEl.value?.setPointerCapture(event.pointerId);
  reheat();
}

function edgeMid(edge: SimEdge) {
  const source = nodeById.value[edge.source];
  const target = nodeById.value[edge.target];
  if (!source || !target) return { x: 0, y: 0 };
  return { x: (source.x + target.x) / 2, y: (source.y + target.y) / 2 };
}

watch(selectedId, (id) => {
  if (!import.meta.client) return;
  const hash = id ? `#${id}` : '';
  if (window.location.hash !== hash) {
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}${hash}`);
  }
});

watch(isFullscreen, (fs) => {
  if (!fs) nextTick(() => seedNodes());
});

let resizeObserver: ResizeObserver | null = null;

onMounted(async () => {
  await nextTick();
  seedNodes();
  const hash = decodeURIComponent(window.location.hash.replace(/^#/, ''));
  if (topicById(hash)) selectedId.value = hash;
  document.addEventListener('fullscreenchange', onFullscreenChange);
  if (graphEl.value) {
    let lastW = 0;
    let lastH = 0;
    resizeObserver = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (!box) return;
      if (Math.abs(box.width - lastW) < 8 && Math.abs(box.height - lastH) < 8) return;
      lastW = box.width;
      lastH = box.height;
      if (box.width > 0 && box.height > 0) seedNodes();
    });
    resizeObserver.observe(graphEl.value);
  }
});

onUnmounted(() => {
  if (raf) cancelAnimationFrame(raf);
  resizeObserver?.disconnect();
  document.removeEventListener('fullscreenchange', onFullscreenChange);
});
</script>

<template>
  <div ref="shellEl" class="mf" :class="{ 'is-fs': isFullscreen }">
    <header class="mf-header">
      <NuxtLink to="/insights/notes" class="mf-brand">FRONTEND · FIRST PRINCIPLE</NuxtLink>
      <div class="mf-meta">
        <NoteViews slug="frontend-from-first-principle" class="mf-step" />
        <span class="mf-step">{{ topicsInOrder.length }} lessons</span>
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
        class="mf-graph"
        ref="graphEl"
        :style="leftStyle"
        aria-label="Knowledge graph"
      >
        <div class="mf-graph-head">
          <p class="mf-graph-title">Map</p>
          <button type="button" class="mf-tool" @click="seedNodes">
            <RefreshCw :size="14" />
            Reset
          </button>
        </div>

        <label class="mf-edge-toggle">
          Edge labels
          <span class="mf-switch-mini">
            <input v-model="showEdgeLabels" type="checkbox" />
            <span class="mf-slider" />
          </span>
        </label>

        <svg
          ref="svgEl"
          class="mf-svg"
          @wheel.prevent="onWheel"
          @pointerdown="onCanvasDown"
          @pointermove="onCanvasMove"
          @pointerup="onCanvasUp"
          @pointercancel="onCanvasUp"
        >
          <defs>
            <linearGradient id="ff-node-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#8b7cff" />
              <stop offset="48%" stop-color="#4A9EFF" />
              <stop offset="100%" stop-color="#ffffff" />
            </linearGradient>
          </defs>
          <g :transform="`translate(${transform.x} ${transform.y}) scale(${transform.k})`">
            <line
              v-for="edge in simEdges"
              :key="edge.id"
              :x1="nodeById[edge.source]?.x"
              :y1="nodeById[edge.source]?.y"
              :x2="nodeById[edge.target]?.x"
              :y2="nodeById[edge.target]?.y"
              class="mf-link"
              :class="{
                'is-then': edge.kind === 'then',
                'is-on': edgeActive(edge),
                'is-dim': selectedId && !edgeActive(edge),
              }"
            />
            <g v-if="showEdgeLabels">
              <text
                v-for="edge in simEdges"
                :key="`lbl-${edge.id}`"
                :x="edgeMid(edge).x"
                :y="edgeMid(edge).y - 4"
                class="mf-link-label"
                text-anchor="middle"
              >
                {{ edge.kind === 'then' ? 'THEN' : 'RELATES' }}
              </text>
            </g>
            <g
              v-for="node in simNodes"
              :key="node.id"
              class="mf-node"
              :class="{
                'is-on': selectedId === node.id,
                'is-hot': hoverId === node.id,
                'is-dim': isDimmed(node.id),
              }"
              @pointerdown="onNodeDown($event, node.id)"
              @mouseenter="hoverId = node.id"
              @mouseleave="hoverId = null"
            >
              <circle :cx="node.x" :cy="node.y" r="26" class="mf-hit" />
              <circle :cx="node.x" :cy="node.y" :r="NODE_R" class="mf-core" />
              <text :x="node.x" :y="node.y + 4" text-anchor="middle" class="mf-num">
                {{ node.n }}
              </text>
              <text :x="node.x" :y="node.y + NODE_R + 14" text-anchor="middle" class="mf-label">
                {{ node.label }}
              </text>
            </g>
          </g>
        </svg>

        <div class="mf-legend">
          <span class="mf-legend-title">Clusters</span>
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

          <StateManagementStudio v-if="selectedTopic.studio === 'state'" />
          <FrontendSecurityStudio v-else-if="selectedTopic.studio === 'security'" />

          <ul v-if="!selectedTopic.sections?.length" class="mf-bullets">
            <li v-for="line in selectedTopic.remember" :key="line">{{ line }}</li>
          </ul>

          <section
            v-for="(section, sIndex) in selectedTopic.sections"
            :key="`${selectedTopic.id}-${sIndex}`"
            class="mf-block"
          >
            <h2>{{ section.heading }}</h2>
            <template v-if="section.blocks?.length">
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
            </template>
            <template v-else>
              <p v-for="paragraph in section.body" :key="paragraph">{{ paragraph }}</p>
              <ul v-if="section.bullets?.length" class="mf-bullets">
                <li v-for="bullet in section.bullets" :key="bullet">{{ bullet }}</li>
              </ul>
              <div v-if="section.table?.length" class="mf-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Word</th>
                      <th>Here</th>
                      <th>Kid version</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in section.table" :key="row.term">
                      <td>{{ row.term }}</td>
                      <td>{{ row.here }}</td>
                      <td>{{ row.kid }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-if="section.code">
                <p v-if="section.code.caption" class="mf-code-cap">{{ section.code.caption }}</p>
                <pre>{{ section.code.lines }}</pre>
              </div>
              <ol v-if="section.examples?.length" class="mf-examples">
                <li v-for="example in section.examples" :key="`${example.method}-${example.path}`">
                  <p class="mf-ex-path">
                    <code>{{ example.method }}</code>
                    <code>{{ example.path }}</code>
                  </p>
                  <p class="mf-ex-to">→ {{ example.goesTo }}</p>
                  <p>Purpose: {{ example.purpose }}</p>
                  <p v-if="example.note" class="mf-note">{{ example.note }}</p>
                </li>
              </ol>
              <ul v-if="section.footer?.length" class="mf-bullets">
                <li v-for="line in section.footer" :key="line">{{ line }}</li>
              </ul>
              <div v-if="section.kid" class="mf-kid">
                <p class="mf-kid-label">Kid version</p>
                <p>{{ section.kid }}</p>
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

        <div v-else class="mf-empty">
          <p>Click a node on the map to open that lesson.</p>
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
  width: 42%;
  min-width: 0;
  flex: 1 1 42%;
  min-height: 0;
  background-color: var(--mf-graph);
  background-image: radial-gradient(var(--mf-dot) 1.5px, transparent 1.5px);
  background-size: 24px 24px;
}

.mf-graph-head {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
}

.mf-graph-title {
  font-size: 13px;
  font-weight: 600;
  pointer-events: auto;
}

.mf-graph-head .mf-tool {
  pointer-events: auto;
}

.mf-svg {
  width: 100%;
  height: 100%;
  display: block;
  touch-action: none;
  cursor: grab;
}

.mf-link { stroke: var(--mf-edge); stroke-width: 1.5; }
.mf-link.is-then { stroke-width: 2; }
.mf-link.is-on { stroke: #7b2d8e; stroke-width: 2.4; }
.mf-link.is-dim { opacity: 0.18; }
.mf-link-label {
  fill: var(--mf-muted);
  font-size: 9px;
  font-family: 'DM Mono', ui-monospace, monospace;
  pointer-events: none;
}
.mf-node { cursor: pointer; }
.mf-hit { fill: transparent; }
.mf-core {
  fill: url(#ff-node-fill);
  stroke: #ffffff;
  stroke-width: 2.5;
}
.mf-node.is-on .mf-core,
.mf-node.is-hot .mf-core { stroke-width: 3.5; }
.mf-node.is-dim { opacity: 0.2; }
.mf-num {
  fill: #1a1440;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  pointer-events: none;
}
.mf-label {
  fill: var(--mf-text);
  font-size: 11px;
  font-weight: 600;
  pointer-events: none;
}

.mf-legend {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: color-mix(in srgb, var(--mf-panel) 94%, transparent);
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--mf-line);
  z-index: 10;
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
  max-width: 360px;
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

.mf-edge-toggle {
  position: absolute;
  top: 12px;
  right: 96px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--mf-panel);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid var(--mf-line);
  z-index: 10;
  font-size: 12px;
  color: var(--mf-muted);
}
.mf-switch-mini { position: relative; width: 36px; height: 20px; }
.mf-switch-mini input { opacity: 0; width: 0; height: 0; }
.mf-slider {
  position: absolute;
  inset: 0;
  background: #e0e0e0;
  border-radius: 22px;
}
.mf-slider:before {
  content: '';
  position: absolute;
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background: #fff;
  border-radius: 50%;
  transition: 0.2s;
}
.mf-switch-mini input:checked + .mf-slider { background: #7b2d8e; }
.mf-switch-mini input:checked + .mf-slider:before { transform: translateX(16px); }

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
  .mf-body {
    flex-direction: column;
  }

  .mf-graph {
    width: 100% !important;
    flex: 0 0 38vh !important;
    min-height: 220px;
    border-bottom: 1px solid var(--mf-line);
  }

  .mf-lesson {
    flex: 1 1 auto;
  }
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
  border-radius: 6px;
  background: var(--mf-graph);
}

.mf-callout p { margin: 0 0 6px; }
.mf-callout p:last-child { margin-bottom: 0; }
.mf-kid .mf-bullets { margin-bottom: 0; }

.mf-bullets,
.mf-examples {
  margin: 8px 0 16px;
  padding-left: 1.35rem;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mf-bullets li,
.mf-examples li {
  font-size: 15px;
  line-height: 1.7;
}

.mf-ex-path { margin-bottom: 2px; }
.mf-ex-to,
.mf-note {
  color: var(--mf-muted);
  font-size: 14px;
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
.mf-page :deep(a) {
  color: #7b2d8e;
  text-decoration: underline;
  text-underline-offset: 3px;
}

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
.mf-code-cap {
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--mf-muted);
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
}
</style>
