<script setup lang="ts">
import { Maximize2, Minimize2, PanelRightClose, PanelRightOpen } from 'lucide-vue-next';
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import InsightsReadingToggle from '~/component/InsightsReadingToggle.vue';
import InsightsSplitHandle from '~/component/InsightsSplitHandle.vue';
import IndexRace from '~/component/IndexRace.vue';
import { useInsightsSplit } from '~/composables/useInsightsSplit';
import {
  TRAP_ITEM,
  customers,
  highlightSql,
  joinRows,
  lessonById,
  lessons,
  md,
  neighborLessons,
  ordersFor,
  type JoinRow,
  type LessonId,
} from '~/data/databaseLab';

interface ArenaLine {
  d: string;
  kind: 'match' | 'null';
}

type StageCorner = 'nw' | 'ne' | 'sw' | 'se';

const STAGE_MIN_W = 300;
const STAGE_MIN_H = 220;
const STAGE_STORAGE = 'publix-db-lab-stage';
const STAGE_CORNERS: { id: StageCorner; label: string }[] = [
  { id: 'nw', label: 'Resize from top left' },
  { id: 'ne', label: 'Resize from top right' },
  { id: 'sw', label: 'Resize from bottom left' },
  { id: 'se', label: 'Resize from bottom right' },
];

const activeId = ref<LessonId>('table');
const stepIndex = ref(0);
const hoverCustomerId = ref<number | null>(null);
const hoverOrderId = ref<number | null>(null);
const resultShown = ref(false);
const isFullscreen = ref(false);
const shellEl = ref<HTMLElement | null>(null);
const lessonEl = ref<HTMLElement | null>(null);
const arenaEl = ref<HTMLElement | null>(null);
const wrapEl = ref<HTMLElement | null>(null);
const stageEl = ref<HTMLElement | null>(null);
const innerEl = ref<HTMLElement | null>(null);
const lines = ref<ArenaLine[]>([]);
const stageBox = reactive({ x: 0, y: 0, w: 0, h: 0 });
const userSized = ref(false);
const resizing = ref(false);
const moving = ref(false);
const contentScale = ref(1);
const contentShift = reactive({ x: 0, y: 0 });
const naturalSize = reactive({ w: 1, h: 1 });

const stageStyle = computed(() => {
  if (!stageBox.w || !stageBox.h) {
    return { width: '100%', height: '100%' };
  }
  return {
    width: `${stageBox.w}px`,
    height: `${stageBox.h}px`,
    transform: `translate(${stageBox.x}px, ${stageBox.y}px)`,
  };
});

const innerStyle = computed(() => ({
  transform: `translate(${contentShift.x}px, ${contentShift.y}px) scale(${contentScale.value})`,
}));

const {
  bodyEl,
  leftPct,
  leftStyle,
  dragging,
  rightOpen,
  toggleRight,
  onHandlePointerDown,
  onHandleKeydown,
} = useInsightsSplit({ storageKey: 'database-lab', defaultPct: 58 });

const active = computed(() => lessonById(activeId.value) ?? lessons[0]!);
const step = computed(() => active.value.steps[stepIndex.value] ?? active.value.steps[0]!);
const visual = computed(() => step.value.visual);
const isIndexRace = computed(() => Boolean(visual.value.indexRace));
const indexRaceEl = ref<{ resetBoard: () => void } | null>(null);
const neighbors = computed(() => neighborLessons(activeId.value));
const visibleOrders = computed(() => ordersFor(Boolean(visual.value.orphan)));
const joinKind = computed(() => visual.value.join ?? 'left');
const trap = computed(() => visual.value.trap ?? 'off');

const resultRows = computed(() => {
  if (!visual.value.result) return [] as JoinRow[];
  return joinRows(joinKind.value, trap.value, Boolean(visual.value.orphan));
});

const keptCustomerIds = computed(() => {
  const ids = new Set<number>();
  for (const row of resultRows.value) {
    if (row.customer) ids.add(row.customer.id);
  }
  return ids;
});

const keptOrderIds = computed(() => {
  const ids = new Set<number>();
  for (const row of resultRows.value) {
    if (row.order) ids.add(row.order.id);
  }
  return ids;
});

const matchedCustomerIds = computed(() => {
  const ids = new Set<number>();
  for (const order of visibleOrders.value) {
    if (trap.value === 'on' && order.item !== TRAP_ITEM) continue;
    if (customers.some((customer) => customer.id === order.customerId)) {
      ids.add(order.customerId);
    }
  }
  return ids;
});

const unmatchedCustomers = computed(() =>
  customers.filter((customer) => !matchedCustomerIds.value.has(customer.id)),
);

const sqlHtml = computed(() => highlightSql(step.value.sql));
const insightHtml = computed(() => md(step.value.insight));
const nullBadgeStyle = ref<Record<string, string>>({ display: 'none' });

function customerMatched(id: number) {
  return Boolean(visual.value.matches || visual.value.result) && matchedCustomerIds.value.has(id);
}

function orderIsMatch(order: { id: number; customerId: number; item: string }) {
  if (!(visual.value.matches || visual.value.result)) return false;
  if (!customers.some((customer) => customer.id === order.customerId)) return false;
  if (trap.value === 'on' && order.item !== TRAP_ITEM) return false;
  if (visual.value.result && visual.value.trap && !keptOrderIds.value.has(order.id)) return false;
  return true;
}

function customerFaded(id: number) {
  if (visual.value.hideUnmatchedLeft && !keptCustomerIds.value.has(id)) return true;
  if (visual.value.fadeUnmatchedLeft && !matchedCustomerIds.value.has(id)) return true;
  return false;
}

function customerGone(id: number) {
  return Boolean(visual.value.hideUnmatchedLeft) && !keptCustomerIds.value.has(id);
}

function orderFaded(orderId: number, customerId: number) {
  if (visual.value.fadeUnmatchedRight && !customers.some((customer) => customer.id === customerId)) {
    return true;
  }
  if (visual.value.result && !keptOrderIds.value.has(orderId) && visual.value.trap) {
    return true;
  }
  return false;
}

function orderIsOrphan(customerId: number) {
  return !customers.some((customer) => customer.id === customerId);
}

function customerHot(id: number) {
  if (hoverCustomerId.value === id) return true;
  if (hoverOrderId.value == null) return false;
  const order = visibleOrders.value.find((item) => item.id === hoverOrderId.value);
  return order?.customerId === id;
}

function orderHot(orderId: number, customerId: number) {
  if (hoverOrderId.value === orderId) return true;
  return hoverCustomerId.value === customerId;
}

function resultHot(row: JoinRow) {
  if (row.customer && hoverCustomerId.value === row.customer.id) return true;
  if (row.order && hoverOrderId.value === row.order.id) return true;
  return false;
}

function selectLesson(id: LessonId) {
  activeId.value = id;
  stepIndex.value = 0;
  if (import.meta.client) {
    history.replaceState(null, '', `#${id}`);
  }
  nextTick(() => {
    lessonEl.value?.scrollTo({ top: 0 });
    measureLines();
  });
}

function goNext() {
  if (stepIndex.value < active.value.steps.length - 1) {
    stepIndex.value += 1;
    return;
  }
  if (neighbors.value.next) {
    selectLesson(neighbors.value.next.id);
    return;
  }
  selectLesson('table');
}

function resetLesson() {
  stepIndex.value = 0;
  hoverCustomerId.value = null;
  hoverOrderId.value = null;
  indexRaceEl.value?.resetBoard();
  nextTick(() => measureLines());
}

function setStep(index: number) {
  stepIndex.value = index;
}

function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cp = x1 + (x2 - x1) * 0.5;
  return `M ${x1} ${y1} C ${cp} ${y1}, ${cp} ${y2}, ${x2} ${y2}`;
}

const arenaView = reactive({ w: 100, h: 100 });

function toLocal(
  left: number,
  top: number,
  arenaRect: DOMRect,
  scale: number,
) {
  const k = scale || 1;
  return {
    x: (left - arenaRect.left) / k,
    y: (top - arenaRect.top) / k,
  };
}

function measureLines() {
  const arena = arenaEl.value;
  if (!arena || visual.value.indexRace) {
    lines.value = [];
    nullBadgeStyle.value = { display: 'none' };
    return;
  }

  arenaView.w = Math.max(1, arena.clientWidth);
  arenaView.h = Math.max(1, arena.clientHeight);

  const arenaRect = arena.getBoundingClientRect();
  const scale = contentScale.value || 1;
  const next: ArenaLine[] = [];
  const edges = joinRows(joinKind.value, trap.value, Boolean(visual.value.orphan));

  if (visual.value.matches) {
    for (const row of edges) {
      if (!row.matched || !row.customer || !row.order) continue;
      const customerEl = arena.querySelector<HTMLElement>(`#c-${row.customer.id}`);
      const orderEl = arena.querySelector<HTMLElement>(`#o-${row.order.id}`);
      if (!customerEl || !orderEl) continue;
      if (customerGone(row.customer.id)) continue;
      const cRect = customerEl.getBoundingClientRect();
      const oRect = orderEl.getBoundingClientRect();
      const from = toLocal(cRect.right, cRect.top + cRect.height / 2, arenaRect, scale);
      const to = toLocal(oRect.left, oRect.top + oRect.height / 2, arenaRect, scale);
      next.push({
        d: bezier(from.x, from.y, to.x, to.y),
        kind: 'match',
      });
    }

    if (visual.value.nulls) {
      for (const row of edges) {
        if (row.matched || !row.customer || row.order) continue;
        if (customerGone(row.customer.id)) continue;
        const customerEl = arena.querySelector<HTMLElement>(`#c-${row.customer.id}`);
        if (!customerEl) continue;
        const cRect = customerEl.getBoundingClientRect();
        const from = toLocal(cRect.right, cRect.top + cRect.height / 2, arenaRect, scale);
        next.push({
          d: bezier(from.x, from.y, from.x + 72, from.y),
          kind: 'null',
        });
      }
    }
  }

  lines.value = next;

  if (!visual.value.nullBadge) {
    nullBadgeStyle.value = { display: 'none' };
    return;
  }
  const first = edges.find(
    (row) => !row.matched && row.customer && !customerGone(row.customer.id),
  );
  const el = first?.customer
    ? arena.querySelector<HTMLElement>(`#c-${first.customer.id}`)
    : null;
  if (!el) {
    nullBadgeStyle.value = { display: 'none' };
    return;
  }
  const rect = el.getBoundingClientRect();
  const badge = toLocal(rect.right, rect.top, arenaRect, scale);
  nullBadgeStyle.value = {
    top: `${badge.y + 8}px`,
    left: `${badge.x + 16}px`,
  };
}

function wrapBounds() {
  const el = wrapEl.value;
  if (!el) return { maxW: 0, maxH: 0 };
  return { maxW: el.clientWidth, maxH: el.clientHeight };
}

function clampStage() {
  const { maxW, maxH } = wrapBounds();
  if (maxW <= 0 || maxH <= 0) return;
  const minW = Math.min(STAGE_MIN_W, maxW);
  const minH = Math.min(STAGE_MIN_H, maxH);
  stageBox.w = Math.min(Math.max(stageBox.w, minW), maxW);
  stageBox.h = Math.min(Math.max(stageBox.h, minH), maxH);
  stageBox.x = Math.min(Math.max(stageBox.x, 0), Math.max(0, maxW - stageBox.w));
  stageBox.y = Math.min(Math.max(stageBox.y, 0), Math.max(0, maxH - stageBox.h));
}

function fillStage() {
  const { maxW, maxH } = wrapBounds();
  if (maxW <= 0 || maxH <= 0) return;
  stageBox.x = 0;
  stageBox.y = 0;
  stageBox.w = maxW;
  stageBox.h = maxH;
}

function persistStage() {
  if (!import.meta.client || !userSized.value) return;
  localStorage.setItem(
    STAGE_STORAGE,
    JSON.stringify({ x: stageBox.x, y: stageBox.y, w: stageBox.w, h: stageBox.h }),
  );
}

function readStoredStage() {
  if (!import.meta.client) return false;
  const raw = localStorage.getItem(STAGE_STORAGE);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as { x?: number; y?: number; w?: number; h?: number };
    if (![parsed.x, parsed.y, parsed.w, parsed.h].every((n) => Number.isFinite(n))) return false;
    stageBox.x = parsed.x as number;
    stageBox.y = parsed.y as number;
    stageBox.w = parsed.w as number;
    stageBox.h = parsed.h as number;
    userSized.value = true;
    clampStage();
    return true;
  } catch {
    return false;
  }
}

function syncStageToWrap() {
  if (userSized.value) clampStage();
  else fillStage();
  applyFit();
}

function measureNatural() {
  const inner = innerEl.value;
  if (!inner) return;
  naturalSize.w = Math.max(1, inner.scrollWidth);
  naturalSize.h = Math.max(1, inner.scrollHeight);
}

function applyFit() {
  const stage = stageEl.value;
  if (!stage) return;
  const pad = 24;
  const availW = Math.max(48, stage.clientWidth - pad);
  const availH = Math.max(48, stage.clientHeight - pad);
  const next = Math.min(availW / naturalSize.w, availH / naturalSize.h);
  contentScale.value = Math.min(Math.max(next, 0.38), 1.8);
  const usedW = naturalSize.w * contentScale.value;
  const usedH = naturalSize.h * contentScale.value;
  contentShift.x = (stage.clientWidth - usedW) / 2;
  contentShift.y = Math.max(10, (stage.clientHeight - usedH) / 2);
  requestAnimationFrame(() => measureLines());
}

async function refitStage() {
  await nextTick();
  measureNatural();
  applyFit();
}

let stageDrag: {
  corner: StageCorner;
  startX: number;
  startY: number;
  orig: { x: number; y: number; w: number; h: number };
} | null = null;

let stageMove: {
  startX: number;
  startY: number;
  origX: number;
  origY: number;
} | null = null;

function onStageHandleDown(corner: StageCorner, event: PointerEvent) {
  if (event.button != null && event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  if (!stageBox.w || !stageBox.h) fillStage();
  userSized.value = true;
  resizing.value = true;
  stageDrag = {
    corner,
    startX: event.clientX,
    startY: event.clientY,
    orig: { x: stageBox.x, y: stageBox.y, w: stageBox.w, h: stageBox.h },
  };
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  document.body.style.userSelect = 'none';
}

function onStageHandleMove(event: PointerEvent) {
  if (!stageDrag) return;
  const dx = event.clientX - stageDrag.startX;
  const dy = event.clientY - stageDrag.startY;
  const { orig, corner } = stageDrag;
  let { x, y, w, h } = orig;
  if (corner.includes('e')) w = orig.w + dx;
  if (corner.includes('w')) {
    w = orig.w - dx;
    x = orig.x + dx;
  }
  if (corner.includes('s')) h = orig.h + dy;
  if (corner.includes('n')) {
    h = orig.h - dy;
    y = orig.y + dy;
  }
  stageBox.x = x;
  stageBox.y = y;
  stageBox.w = w;
  stageBox.h = h;
  clampStage();
  applyFit();
}

function onStageHandleUp() {
  if (!stageDrag) return;
  stageDrag = null;
  resizing.value = false;
  document.body.style.removeProperty('user-select');
  persistStage();
  applyFit();
}

function canMoveStage(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  if (target.closest('.lj-handle')) return false;
  if (target.closest('.trow, .res-row')) return false;
  if (target.closest('.idx-controls, .idx-scan-list, .idx-node, .idx-input, .idx-race-btn')) {
    return false;
  }
  return Boolean(target.closest('.lj-stage'));
}

function onStageMoveDown(event: PointerEvent) {
  if (event.button != null && event.button !== 0) return;
  if (stageDrag || !canMoveStage(event.target)) return;
  if (!stageBox.w || !stageBox.h) fillStage();
  userSized.value = true;
  moving.value = true;
  stageMove = {
    startX: event.clientX,
    startY: event.clientY,
    origX: stageBox.x,
    origY: stageBox.y,
  };
  stageEl.value?.setPointerCapture(event.pointerId);
  document.body.style.userSelect = 'none';
}

function onStageMoveMove(event: PointerEvent) {
  if (!stageMove) return;
  stageBox.x = stageMove.origX + (event.clientX - stageMove.startX);
  stageBox.y = stageMove.origY + (event.clientY - stageMove.startY);
  clampStage();
}

function onStageMoveUp() {
  if (!stageMove) return;
  stageMove = null;
  moving.value = false;
  document.body.style.removeProperty('user-select');
  persistStage();
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

watch([stepIndex, activeId, rightOpen, leftPct], async () => {
  resultShown.value = false;
  await nextTick();
  syncStageToWrap();
  if (visual.value.result) {
    requestAnimationFrame(() => {
      resultShown.value = true;
    });
  }
  await refitStage();
});

let resizeObserver: ResizeObserver | null = null;

onMounted(async () => {
  const hash = decodeURIComponent(window.location.hash.replace(/^#/, '')) as LessonId;
  if (lessonById(hash)) selectLesson(hash);
  document.addEventListener('fullscreenchange', onFullscreenChange);
  await nextTick();
  if (!readStoredStage()) fillStage();
  await refitStage();
  const observed = wrapEl.value ?? arenaEl.value;
  if (observed) {
    resizeObserver = new ResizeObserver(() => {
      syncStageToWrap();
    });
    resizeObserver.observe(observed);
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  document.removeEventListener('fullscreenchange', onFullscreenChange);
  document.body.style.removeProperty('user-select');
});
</script>

<template>
  <div ref="shellEl" class="mf" :class="{ 'is-fs': isFullscreen }" aria-label="Database lab">
    <header class="lj-top">
      <NuxtLink to="/insights/notes" class="mf-brand">DATABASE LAB</NuxtLink>
      <nav class="lj-lessons" aria-label="Database lessons">
        <button
          v-for="lesson in lessons"
          :key="lesson.id"
          type="button"
          class="lj-lesson-tab"
          :class="{ 'is-on': lesson.id === activeId }"
          :title="lesson.label"
          :aria-label="`Lesson ${String(lesson.n).padStart(2, '0')} ${lesson.label}`"
          @click="selectLesson(lesson.id)"
        >
          {{ String(lesson.n).padStart(2, '0') }}
        </button>
      </nav>
      <div class="step-dots" role="tablist" aria-label="Steps in this lesson">
        <button
          v-for="(item, index) in active.steps"
          :key="item.label"
          type="button"
          class="step-dot"
          :class="{ active: index === stepIndex, done: index < stepIndex }"
          :aria-label="item.label"
          :aria-selected="index === stepIndex"
          @click="setStep(index)"
        />
      </div>
      <div class="mf-meta">
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
        class="mf-graph lj-playground"
        :style="leftStyle"
        aria-label="Lab"
      >
        <div
          ref="wrapEl"
          class="lj-stage-wrap"
          :class="{ 'is-resizing': resizing, 'is-moving': moving }"
        >
          <div
            ref="stageEl"
            class="lj-stage"
            :class="{ 'is-moving': moving }"
            :style="stageStyle"
            @pointerdown="onStageMoveDown"
            @pointermove="onStageMoveMove"
            @pointerup="onStageMoveUp"
            @pointercancel="onStageMoveUp"
          >
            <div ref="innerEl" class="lj-stage-inner" :style="innerStyle">
            <div class="stage-label">{{ step.label }}</div>

          <IndexRace v-if="isIndexRace" ref="indexRaceEl" />

          <div v-else ref="arenaEl" class="tables-arena" :class="{ 'is-one': !visual.showRight }">
            <div class="arrow-layer" aria-hidden="true">
              <svg
                :viewBox="`0 0 ${arenaView.w} ${arenaView.h}`"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="gradMatch" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#4A9EFF" />
                    <stop offset="100%" stop-color="#8b7cff" />
                  </linearGradient>
                </defs>
                <path
                  v-for="(line, index) in lines"
                  :key="`${line.kind}-${index}`"
                  :d="line.d"
                  class="show"
                  :class="line.kind === 'match' ? 'match-line' : 'null-line'"
                />
              </svg>
            </div>

            <div class="table-box left">
              <div class="tlabel"><span class="dot" /> Customers (left)</div>
              <div
                v-for="customer in customers"
                :id="`c-${customer.id}`"
                :key="customer.id"
                class="trow"
                :class="{
                  matched: customerMatched(customer.id),
                  highlight: customerHot(customer.id),
                  faded: customerFaded(customer.id),
                  gone: customerGone(customer.id),
                  'is-key': visual.keys === 'left' || visual.keys === 'both',
                }"
                @pointerenter="hoverCustomerId = customer.id"
                @pointerleave="hoverCustomerId = null"
              >
                <div class="rkey">id: {{ customer.id }}</div>
                <div class="rval">{{ customer.name }}</div>
              </div>
            </div>

            <div v-if="visual.showRight" class="table-box right">
              <div class="tlabel"><span class="dot" /> Orders (right)</div>
              <div
                v-for="order in visibleOrders"
                :id="`o-${order.id}`"
                :key="order.id"
                class="trow"
                :class="{
                  matched: orderIsMatch(order),
                  orphan: orderIsOrphan(order.customerId) && (visual.matches || visual.result),
                  highlight: orderHot(order.id, order.customerId),
                  faded: orderFaded(order.id, order.customerId),
                  'is-key': visual.keys === 'right' || visual.keys === 'both',
                }"
                @pointerenter="hoverOrderId = order.id"
                @pointerleave="hoverOrderId = null"
              >
                <div class="rkey">order #{{ order.id }} → customer {{ order.customerId }}</div>
                <div class="rval">{{ order.item }}</div>
              </div>
            </div>

            <div
              class="null-badge"
              :class="{ show: visual.nullBadge }"
              :style="nullBadgeStyle"
            >
              NULL
            </div>
          </div>

          <div v-if="visual.result" class="result-area">
            <div class="res-label">
              <span>Result table</span>
              <span class="res-count">{{ resultRows.length }} rows</span>
            </div>
            <div>
              <div
                v-for="(row, index) in resultRows"
                :key="row.id"
                class="res-row"
                :class="{
                  show: resultShown,
                  'matched-res': row.matched,
                  'null-res': !row.matched,
                  'is-hot': resultHot(row),
                }"
                :style="{ transitionDelay: `${index * 150}ms` }"
                @pointerenter="
                  hoverCustomerId = row.customer?.id ?? null;
                  hoverOrderId = row.order?.id ?? null;
                "
                @pointerleave="
                  hoverCustomerId = null;
                  hoverOrderId = null;
                "
              >
                <div class="rcell from-left">{{ row.customer?.name ?? 'NULL' }}</div>
                <div class="rcell" :class="row.customer ? 'from-left' : 'null'">
                  {{ row.customer ? row.customer.id : 'NULL' }}
                </div>
                <div class="rcell" :class="row.order ? 'from-right' : 'null'">
                  {{ row.order?.item ?? 'NULL' }}
                </div>
                <div class="rcell" :class="row.order ? 'from-right' : 'null'">
                  {{ row.order ? `#${row.order.id}` : 'NULL' }}
                </div>
              </div>
            </div>
          </div>
            </div>

            <button
              v-for="corner in STAGE_CORNERS"
              :key="corner.id"
              type="button"
              class="lj-handle"
              :class="`is-${corner.id}`"
              :aria-label="corner.label"
              @pointerdown="onStageHandleDown(corner.id, $event)"
              @pointermove="onStageHandleMove"
              @pointerup="onStageHandleUp"
              @pointercancel="onStageHandleUp"
            />
          </div>
        </div>

        <div class="lj-dock">
          <div class="legend">
            <template v-if="isIndexRace">
              <div class="legend-item">
                <div class="legend-dot is-scan" />
                table scan
              </div>
              <div class="legend-item">
                <div class="legend-dot is-seek" />
                index seek
              </div>
            </template>
            <template v-else>
              <div class="legend-item">
                <div class="legend-dot is-match" />
                matched
              </div>
              <div class="legend-item">
                <div class="legend-dot is-null" />
                unmatched (NULL)
              </div>
              <div class="legend-item">
                <div class="legend-dot is-hidden" />
                hidden
              </div>
            </template>
          </div>

          <div class="controls-bar">
            <button
              type="button"
              class="ctrl-btn primary"
              @click="goNext"
            >
              {{ step.nextLabel }}
            </button>
            <button type="button" class="ctrl-btn" @click="resetLesson">Reset</button>
          </div>
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
        class="mf-lesson lj-explanation"
        :class="{ 'is-index': isIndexRace }"
        aria-label="Explanation"
      >
        <div>
          <p class="lesson-tag">{{ active.tag }}</p>
          <h3>{{ step.title }}</h3>
        </div>
        <p>{{ step.text }}</p>

        <div v-if="visual.venn && visual.venn !== 'none'" class="venn-mini">
          <div
            class="venn-circle left-c"
            :class="{ active: visual.venn === 'left' || visual.venn === 'both' }"
          >
            Left
          </div>
          <div
            class="venn-circle right-c"
            :class="{ active: visual.venn === 'both' }"
          >
            Right
          </div>
        </div>

        <div class="sql-block" v-html="sqlHtml" />

        <div class="insight" v-html="insightHtml" />
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
  --lj-purple: #8b7cff;
  --lj-blue: #4A9EFF;
  --lj-gold: #e6a817;
  --lj-intent: #7B2D8E;
  --lj-pink: #e91e63;
  --lj-null: #c0392b;
  --lj-bg: var(--mf-graph);
  --lj-surface: var(--mf-panel);
  --lj-border: var(--mf-line);
  --lj-muted: var(--mf-muted);
  --lj-dot: var(--mf-dot);
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
}

.lj-top {
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
  border-color: #4A9EFF;
  color: #4A9EFF;
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

.lj-lessons {
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  gap: 2px;
  padding: 0;
  background: transparent;
  border: 0;
  overflow-x: auto;
}

.lj-lesson-tab {
  height: 28px;
  min-width: 32px;
  padding: 0 8px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--mf-muted);
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.04em;
  cursor: pointer;
  flex-shrink: 0;
}

.lj-lesson-tab:hover {
  color: var(--mf-text);
}

.lj-lesson-tab.is-on {
  background: color-mix(in srgb, var(--lj-purple) 18%, transparent);
  color: var(--mf-text);
}

.mf-body {
  flex: 1;
  display: flex;
  flex-direction: row;
  min-height: 0;
  background-color: var(--mf-graph);
  background-image: radial-gradient(var(--mf-dot) 1.5px, transparent 1.5px);
  background-size: 24px 24px;
}

.mf-body.is-dragging {
  cursor: col-resize;
}

.mf-body.is-notes-closed .mf-graph {
  flex: 1 1 100%;
  width: 100%;
}

.lj-playground {
  flex: 1 1 420px;
  min-width: 0;
  min-height: 0;
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}

.lj-stage-wrap {
  flex: 1 1 auto;
  min-height: 0;
  position: relative;
}

.lj-stage-wrap.is-resizing,
.lj-stage-wrap.is-moving {
  user-select: none;
}

.lj-stage {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  overflow: hidden;
  background: var(--mf-panel);
  border: 1px solid var(--mf-line);
  border-radius: 12px;
  cursor: grab;
}

.lj-stage.is-moving {
  cursor: grabbing;
}

.lj-stage-inner {
  transform-origin: 0 0;
  width: max-content;
  min-width: 280px;
  padding: 22px;
  box-sizing: border-box;
}

.lj-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  padding: 0;
  border: 2px solid var(--lj-purple);
  border-radius: 2px;
  background: var(--mf-panel);
  z-index: 6;
}

.lj-handle.is-nw {
  top: 6px;
  left: 6px;
  cursor: nwse-resize;
}

.lj-handle.is-ne {
  top: 6px;
  right: 6px;
  cursor: nesw-resize;
}

.lj-handle.is-sw {
  bottom: 6px;
  left: 6px;
  cursor: nesw-resize;
}

.lj-handle.is-se {
  bottom: 6px;
  right: 6px;
  cursor: nwse-resize;
}

.lj-dock {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 4px;
  background: var(--mf-graph);
}

.lj-explanation {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  background: var(--mf-bg);
  border-left: 1px solid var(--mf-line);
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.lj-explanation h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--mf-text);
  letter-spacing: -0.01em;
  margin: 6px 0 0;
}

.lj-explanation p {
  font-size: 14px;
  line-height: 1.7;
  color: var(--mf-muted);
}

.lj-explanation :deep(code) {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.92em;
  color: #4A9EFF;
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

.sql-block :deep(.sql-table) {
  color: var(--lj-blue);
}

.sql-block :deep(.sql-col) {
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

.lj-explanation.is-index .sql-block :deep(.sql-kw) {
  color: #d946ef;
}

.lj-explanation.is-index .sql-block :deep(.sql-table) {
  color: #22d3ee;
}

.lj-explanation.is-index .insight {
  border-left-color: #10b981;
  background: color-mix(in srgb, #10b981 10%, var(--mf-graph));
}

.stage-label {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--mf-muted);
  margin-bottom: 18px;
  cursor: grab;
}

.tables-arena {
  display: flex;
  gap: 80px;
  justify-content: center;
  align-items: flex-start;
  position: relative;
  min-height: 0;
}

.tables-arena.is-one {
  gap: 0;
}

.table-box {
  min-width: 150px;
  position: relative;
  z-index: 2;
}

.tlabel {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.table-box.left .tlabel {
  color: var(--lj-blue);
}

.table-box.right .tlabel {
  color: var(--lj-purple);
}

.tlabel .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.table-box.left .tlabel .dot {
  background: var(--lj-blue);
}

.table-box.right .tlabel .dot {
  background: var(--lj-purple);
}

.trow {
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  font-family: 'DM Mono', ui-monospace, monospace;
  background: var(--mf-panel);
  border: 1.5px solid var(--mf-line);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  z-index: 2;
}

.trow:hover,
.trow.highlight {
  transform: translateY(-2px);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--lj-gold) 40%, transparent);
  border-color: var(--lj-gold);
}

.rkey {
  font-size: 10px;
  color: var(--mf-muted);
  margin-bottom: 2px;
}

.rval {
  font-weight: 500;
  color: var(--mf-text);
}

.trow.matched {
  border-color: var(--lj-blue);
  background: color-mix(in srgb, var(--lj-blue) 8%, var(--mf-panel));
}

.trow.orphan {
  border-color: var(--lj-pink);
  background: color-mix(in srgb, var(--lj-pink) 8%, var(--mf-panel));
}

.trow.is-key .rkey {
  color: var(--lj-intent);
  font-weight: 600;
}

.trow.faded {
  opacity: 0.35;
}

.trow.gone {
  opacity: 0.2;
  transform: scale(0.98);
}

.arrow-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.arrow-layer svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.arrow-layer path {
  fill: none;
  stroke-width: 2.5;
  stroke-linecap: round;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.arrow-layer path.show {
  opacity: 1;
}

.arrow-layer path.match-line {
  stroke: url(#gradMatch);
}

.arrow-layer path.null-line {
  stroke: var(--lj-null);
  stroke-dasharray: 6 4;
}

.null-badge {
  position: absolute;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 500;
  color: var(--lj-null);
  background: var(--mf-panel);
  padding: 4px 10px;
  border-radius: 6px;
  border: 1.5px solid var(--lj-null);
  opacity: 0;
  transition: opacity 0.5s ease;
  z-index: 3;
  pointer-events: none;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--lj-null) 22%, transparent);
}

.null-badge.show {
  opacity: 1;
}

.result-area {
  margin-top: 12px;
  padding-top: 18px;
  padding-bottom: 8px;
  border-top: 1px dashed var(--mf-line);
}

.res-label {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--mf-muted);
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.res-count {
  font-size: 11px;
  color: var(--lj-intent);
  background: color-mix(in srgb, var(--lj-purple) 12%, transparent);
  padding: 3px 10px;
  border-radius: 4px;
}

.res-row {
  display: flex;
  border-radius: 8px;
  margin-bottom: 5px;
  font-size: 12px;
  font-family: 'DM Mono', ui-monospace, monospace;
  overflow: hidden;
  opacity: 0;
  transform: translateY(12px);
  transition: all 0.45s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1.5px solid transparent;
  cursor: pointer;
}

.res-row.show {
  opacity: 1;
  transform: translateY(0);
}

.res-row.matched-res {
  border-color: color-mix(in srgb, var(--lj-blue) 35%, transparent);
  background: color-mix(in srgb, var(--lj-blue) 6%, var(--mf-panel));
}

.res-row.null-res {
  border-color: color-mix(in srgb, var(--lj-null) 35%, transparent);
  background: color-mix(in srgb, var(--lj-null) 6%, var(--mf-panel));
}

.res-row.is-hot {
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--lj-gold) 40%, transparent);
}

.rcell {
  flex: 1;
  padding: 9px 12px;
  border-right: 1px solid var(--mf-line);
  text-align: center;
  min-width: 60px;
}

.rcell:last-child {
  border-right: none;
}

.rcell.null {
  color: var(--lj-null);
  font-style: italic;
  font-weight: 500;
  background: color-mix(in srgb, var(--lj-null) 10%, transparent);
  border-radius: 4px;
}

.rcell.from-left {
  color: var(--lj-blue);
}

.rcell.from-right {
  color: var(--lj-purple);
}

.controls-bar {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.ctrl-btn {
  padding: 10px 22px;
  border: 1.5px solid var(--mf-line);
  background: var(--mf-panel);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--mf-text);
  transition: all 0.2s ease;
}

.ctrl-btn:hover {
  border-color: var(--lj-blue);
  color: var(--lj-blue);
}

.ctrl-btn.primary {
  background: linear-gradient(180deg, #8b7cff 0%, #4A9EFF 100%);
  color: #fff;
  border-color: transparent;
}

.ctrl-btn.primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--lj-purple) 35%, transparent);
}

.legend {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--mf-muted);
  font-family: 'DM Mono', ui-monospace, monospace;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot.is-match {
  background: var(--lj-blue);
}

.legend-dot.is-null {
  background: var(--lj-null);
}

.legend-dot.is-hidden {
  background: var(--mf-dot);
}

.legend-dot.is-scan {
  background: #3b82f6;
}

.legend-dot.is-seek {
  background: #10b981;
}

.venn-mini {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.venn-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid var(--mf-line);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  font-weight: 500;
  transition: all 0.4s ease;
}

.venn-circle.left-c {
  border-color: var(--lj-blue);
  color: var(--lj-blue);
  background: color-mix(in srgb, var(--lj-blue) 8%, transparent);
}

.venn-circle.right-c {
  border-color: var(--lj-purple);
  color: var(--lj-purple);
  background: color-mix(in srgb, var(--lj-purple) 8%, transparent);
  margin-left: -18px;
}

.venn-circle.active {
  box-shadow: 0 0 14px currentColor;
}

@media (max-width: 860px) {
  .mf-body {
    flex-direction: column;
  }

  .lj-playground {
    width: 100% !important;
    flex: 0 0 62vh !important;
    min-height: 320px;
  }

  .lj-explanation {
    border-left: none;
    border-top: 1px solid var(--mf-line);
  }

  .tables-arena {
    gap: 36px;
  }

  .lj-handle {
    display: none;
  }

  .lj-stage {
    position: relative;
    width: 100% !important;
    height: 100% !important;
    transform: none !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .res-row,
  .trow,
  .arrow-layer path,
  .null-badge,
  .step-dot {
    transition: none;
  }

  .res-row {
    transition-delay: 0s !important;
  }
}
</style>
