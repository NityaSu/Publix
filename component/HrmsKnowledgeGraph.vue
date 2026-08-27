<script setup lang="ts">
import { Maximize2, Minimize2, RefreshCw } from 'lucide-vue-next';
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue';
import InsightsReadingToggle from '~/component/InsightsReadingToggle.vue';
import NoteViews from '~/component/NoteViews.vue';
import {
  hrmsClusters,
  hrmsGraphEdges,
  hrmsTopicById,
  hrmsTopicsInOrder,
  type HrmsClusterId,
} from '~/data/hrmsFirstPrinciples';

interface SimNode {
  id: string;
  n: number;
  label: string;
  title: string;
  cluster: HrmsClusterId;
  gist: string;
  studioPath: string;
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
const CLUSTER_DOT: Record<HrmsClusterId, string> = {
  gate: '#7B2D8E',
  contract: '#4A9EFF',
  speed: '#e6a817',
  data: '#8b7cff',
};

const hoverId = ref<string | null>(null);
const showEdgeLabels = ref(false);
const activeCluster = ref<HrmsClusterId | null>(null);
const isFullscreen = ref(false);
const graphEl = ref<HTMLElement | null>(null);
const svgEl = ref<SVGSVGElement | null>(null);
const shellEl = ref<HTMLElement | null>(null);
const simNodes = ref<SimNode[]>([]);
const transform = reactive({ x: 0, y: 0, k: 1 });

const simEdges = computed<SimEdge[]>(() => {
  const sequential: SimEdge[] = hrmsTopicsInOrder.slice(0, -1).flatMap((topic, index) => {
    const next = hrmsTopicsInOrder[index + 1];
    return next
      ? [{ id: `${topic.id}->${next.id}`, source: topic.id, target: next.id, kind: 'then' as const }]
      : [];
  });
  const related: SimEdge[] = hrmsGraphEdges.flatMap((edge) => {
    if (!hrmsTopicById(edge.from) || !hrmsTopicById(edge.to)) return [];
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
  if (hoverId.value) {
    ids.add(hoverId.value);
    for (const edge of simEdges.value) {
      if (edge.source === hoverId.value) ids.add(edge.target);
      if (edge.target === hoverId.value) ids.add(edge.source);
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
  if (!hoverId.value) return false;
  return edge.source === hoverId.value || edge.target === hoverId.value;
}

function toggleCluster(id: HrmsClusterId) {
  activeCluster.value = activeCluster.value === id ? null : id;
}

let raf = 0;
let alpha = 1;
let running = false;
let dragId: string | null = null;
let panning = false;
let panStart = { x: 0, y: 0, tx: 0, ty: 0 };
let dragMoved = false;
let pointerDownAt = { x: 0, y: 0 };

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
  simNodes.value = hrmsTopicsInOrder.map((topic, index) => {
    const angle = (index / hrmsTopicsInOrder.length) * Math.PI * 2 - Math.PI / 2;
    return {
      id: topic.id,
      n: topic.n,
      label: topic.label,
      title: topic.title,
      cluster: topic.cluster,
      gist: topic.gist,
      studioPath: topic.studioPath,
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
      const force = (800 * alpha) / (dist * dist);
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
  if ((event.target as HTMLElement).closest('.mf-node')) return;
  panning = true;
  panStart = { x: event.clientX, y: event.clientY, tx: transform.x, ty: transform.y };
  svgEl.value?.setPointerCapture(event.pointerId);
}

function onCanvasMove(event: PointerEvent) {
  if (dragId) {
    const node = nodeById.value[dragId];
    if (!node) return;
    if (
      Math.hypot(event.clientX - pointerDownAt.x, event.clientY - pointerDownAt.y) > 8
    ) {
      dragMoved = true;
    }
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

function onCanvasUp(event?: PointerEvent) {
  if (dragId) {
    const node = nodeById.value[dragId];
    const moved =
      dragMoved ||
      (event
        ? Math.hypot(event.clientX - pointerDownAt.x, event.clientY - pointerDownAt.y) > 8
        : false);
    const path = node?.studioPath;
    if (node) {
      node.fx = null;
      node.fy = null;
    }
    dragId = null;
    dragMoved = false;
    panning = false;
    // Pointer capture is on the SVG, so node pointerup never fires — open here on a click.
    if (!moved && path) {
      void navigateTo(path);
    }
    return;
  }
  panning = false;
}

function onNodeDown(event: PointerEvent, id: string) {
  event.stopPropagation();
  dragId = id;
  dragMoved = false;
  pointerDownAt = { x: event.clientX, y: event.clientY };
  const node = nodeById.value[id];
  if (node) {
    node.fx = node.x;
    node.fy = node.y;
  }
  // Capture on SVG so move/up stay consistent; navigation happens in onCanvasUp.
  svgEl.value?.setPointerCapture(event.pointerId);
}

function edgeMid(edge: SimEdge) {
  const source = nodeById.value[edge.source];
  const target = nodeById.value[edge.target];
  if (!source || !target) return { x: 0, y: 0 };
  return { x: (source.x + target.x) / 2, y: (source.y + target.y) / 2 };
}

async function toggleFullscreen() {
  if (isFullscreen.value) {
    if (document.fullscreenElement) await document.exitFullscreen();
    isFullscreen.value = false;
    nextTick(() => seedNodes());
    return;
  }
  isFullscreen.value = true;
  try {
    await shellEl.value?.requestFullscreen();
  } catch {
    /* layout fs */
  }
  nextTick(() => seedNodes());
}

function onFullscreenChange() {
  isFullscreen.value = document.fullscreenElement === shellEl.value;
  nextTick(() => seedNodes());
}

let resizeObserver: ResizeObserver | null = null;

onMounted(async () => {
  await nextTick();
  seedNodes();
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
  <div ref="shellEl" class="mf" :class="{ 'is-fs': isFullscreen }" aria-label="HRMS knowledge map">
    <header class="mf-header">
      <NuxtLink to="/insights/notes" class="mf-brand">HRMS · FIRST PRINCIPLES</NuxtLink>
      <div class="mf-meta">
        <NoteViews slug="hrms" class="mf-step" />
        <span class="mf-step">{{ hrmsTopicsInOrder.length }} studios</span>
        <button type="button" class="mf-tool" @click="toggleFullscreen">
          <Minimize2 v-if="isFullscreen" :size="14" />
          <Maximize2 v-else :size="14" />
          {{ isFullscreen ? 'Exit' : 'Fullscreen' }}
        </button>
        <InsightsReadingToggle />
      </div>
    </header>

    <div class="mf-body">
      <section ref="graphEl" class="mf-graph" aria-label="Knowledge graph">
        <div class="mf-graph-head">
          <p class="mf-graph-title">Map · click a node to open its studio</p>
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
            <linearGradient id="hrms-map-fill" x1="0" y1="0" x2="0" y2="1">
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
                'is-dim': hoverId && !edgeActive(edge),
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
                'is-hot': hoverId === node.id,
                'is-dim': isDimmed(node.id),
              }"
              @pointerdown="onNodeDown($event, node.id)"
              @mouseenter="hoverId = node.id"
              @mouseleave="hoverId = null"
            >
              <title>{{ node.title }} — {{ node.gist }}</title>
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
              v-for="cluster in hrmsClusters"
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
  --mf-bg: #111;
  --mf-graph: #161616;
  --mf-dot: #2b2b2b;
  --mf-line: #2a2a2a;
  --mf-text: #f3f3f3;
  --mf-muted: #9a9a9a;
  --mf-panel: #1a1a1a;
}
.mf-header {
  min-height: 52px;
  border-bottom: 1px solid var(--mf-line);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 16px 0 20px;
  background: var(--mf-bg);
}
.mf-brand {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 0.06em;
  color: var(--mf-text);
  text-decoration: none;
}
.mf-meta {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
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
  border-radius: 6px;
}
.mf-tool:hover {
  border-color: var(--mf-accent);
  color: var(--mf-accent);
}
.mf-body {
  flex: 1;
  min-height: 0;
  display: flex;
}
.mf-graph {
  position: relative;
  flex: 1 1 100%;
  width: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 14px 16px;
  overflow: hidden;
  background-color: var(--mf-graph);
  background-image: radial-gradient(var(--mf-dot) 1.5px, transparent 1.5px);
  background-size: 20px 20px;
}
.mf-graph-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 12px;
}
.mf-graph-title {
  margin: 0;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--mf-muted);
}
.mf-edge-toggle {
  position: absolute;
  top: 70px;
  right: 24px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  color: var(--mf-muted);
}
.mf-switch-mini {
  position: relative;
  width: 34px;
  height: 18px;
  display: inline-block;
}
.mf-switch-mini input {
  opacity: 0;
  width: 0;
  height: 0;
}
.mf-slider {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: var(--mf-line);
  cursor: pointer;
}
.mf-slider::before {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  left: 2px;
  top: 2px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.15s ease;
}
.mf-switch-mini input:checked + .mf-slider {
  background: color-mix(in srgb, var(--lj-purple) 70%, #4a9eff);
}
.mf-switch-mini input:checked + .mf-slider::before {
  transform: translateX(16px);
}
.mf-svg {
  flex: 1;
  width: 100%;
  min-height: 280px;
  cursor: grab;
  touch-action: none;
}
.mf-link {
  stroke: var(--mf-dot);
  stroke-width: 2;
  fill: none;
}
.mf-link.is-then {
  stroke: color-mix(in srgb, var(--lj-purple) 55%, var(--mf-dot));
}
.mf-link.is-on {
  stroke: var(--lj-purple);
  stroke-width: 2.5;
}
.mf-link.is-dim {
  opacity: 0.25;
}
.mf-link-label {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 9px;
  fill: var(--mf-muted);
  pointer-events: none;
}
.mf-node {
  cursor: pointer;
}
.mf-node.is-dim {
  opacity: 0.28;
}
.mf-hit {
  fill: transparent;
}
.mf-core {
  fill: url(#hrms-map-fill);
  stroke: #fff;
  stroke-width: 2.5;
}
.mf-node.is-hot .mf-core {
  stroke: var(--lj-purple);
  stroke-width: 3;
  filter: drop-shadow(0 0 8px color-mix(in srgb, var(--lj-purple) 45%, transparent));
}
.mf-num {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 12px;
  font-weight: 700;
  fill: #1a1440;
  pointer-events: none;
}
.mf-label {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  fill: var(--mf-text);
  pointer-events: none;
}
.mf-legend {
  padding-top: 8px;
  border-top: 1px solid var(--mf-line);
}
.mf-legend-title {
  display: block;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--mf-muted);
  margin-bottom: 8px;
}
.mf-legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.mf-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--mf-line);
  background: var(--mf-panel);
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  color: var(--mf-muted);
  cursor: pointer;
}
.mf-legend-item.is-on {
  border-color: var(--lj-purple);
  color: var(--mf-text);
  background: color-mix(in srgb, var(--lj-purple) 12%, var(--mf-panel));
}
.mf-legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>
