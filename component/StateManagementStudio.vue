<script setup lang="ts">
import { Bell, Database, ShoppingCart, User } from 'lucide-vue-next';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

const withStore = ref(true);

const stageRef = ref<HTMLElement | null>(null);
const gridRef = ref<HTMLElement | null>(null);
const storeRef = ref<HTMLElement | null>(null);

type Spoke = { x1: number; y1: number; x2: number; y2: number };
const spokeLines = ref<Spoke[]>([]);
const hubPt = ref({ x: 0, y: 0 });
const svgSize = ref({ w: 0, h: 0 });

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function nudgeToward(
  from: { x: number; y: number },
  toward: { x: number; y: number },
  px: number,
) {
  const dx = toward.x - from.x;
  const dy = toward.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: from.x + (dx / len) * px, y: from.y + (dy / len) * px };
}

function closestOnRect(
  left: number,
  top: number,
  right: number,
  bottom: number,
  px: number,
  py: number,
) {
  const x = clamp(px, left, right);
  const y = clamp(py, top, bottom);
  if (px >= left && px <= right && py >= top && py <= bottom) {
    const dl = px - left;
    const dr = right - px;
    const dt = py - top;
    const db = bottom - py;
    const m = Math.min(dl, dr, dt, db);
    if (m === dl) return { x: left, y: py };
    if (m === dr) return { x: right, y: py };
    if (m === dt) return { x: px, y: top };
    return { x: px, y: bottom };
  }
  return { x, y };
}

function layoutSpokes() {
  const stage = stageRef.value;
  const grid = gridRef.value;
  const store = storeRef.value;
  if (!stage || !grid || !store || !withStore.value) {
    spokeLines.value = [];
    return;
  }

  const sr = stage.getBoundingClientRect();
  const gr = grid.getBoundingClientRect();
  const st = store.getBoundingClientRect();
  svgSize.value = { w: sr.width, h: sr.height };

  const hub = {
    x: sr.width / 2,
    y: (gr.bottom - sr.top + (st.top - sr.top)) / 2,
  };
  hubPt.value = hub;

  const lines: Spoke[] = [...grid.querySelectorAll<HTMLElement>('.sm-card')].map((card) => {
    const r = card.getBoundingClientRect();
    const edge = closestOnRect(
      r.left - sr.left,
      r.top - sr.top,
      r.right - sr.left,
      r.bottom - sr.top,
      hub.x,
      hub.y,
    );
    // Sit the stroke on top of the card, not tucked under the border.
    const p = nudgeToward(edge, {
      x: r.left + r.width / 2 - sr.left,
      y: r.top + r.height / 2 - sr.top,
    }, 10);
    return { x1: p.x, y1: p.y, x2: hub.x, y2: hub.y };
  });

  const storeEdge = closestOnRect(
    st.left - sr.left,
    st.top - sr.top,
    st.right - sr.left,
    st.bottom - sr.top,
    hub.x,
    hub.y,
  );
  lines.push({ x1: hub.x, y1: hub.y, x2: storeEdge.x, y2: storeEdge.y });
  spokeLines.value = lines;
}

let resizeObserver: ResizeObserver | null = null;

const store = ref({
  cart: 0,
  user: 'Guest',
  price: 29,
});

const siloCart = ref(0);
const siloUser = ref('Guest');
const siloNotice = ref('—');
const productLocalCart = ref(0);

const cart = computed(() => (withStore.value ? store.value.cart : siloCart.value));
const user = computed(() => (withStore.value ? store.value.user : siloUser.value));
const price = computed(() => store.value.price);
const notice = computed(() => {
  if (withStore.value) {
    if (store.value.cart > 0 && store.value.user !== 'Guest') return `Hi ${store.value.user} · ${store.value.cart} in cart`;
    if (store.value.cart > 0) return `Added · ${store.value.cart} in cart`;
    if (store.value.user !== 'Guest') return `Welcome, ${store.value.user}`;
    return '—';
  }
  return siloNotice.value;
});
const loggedIn = computed(() => user.value !== 'Guest');

function setMode(next: boolean) {
  withStore.value = next;
  reset();
}

function addToCart() {
  if (withStore.value) {
    store.value = { ...store.value, cart: store.value.cart + 1 };
    return;
  }
  productLocalCart.value += 1;
}

function toggleAuth() {
  if (withStore.value) {
    store.value = {
      ...store.value,
      user: store.value.user === 'Guest' ? 'Ada' : 'Guest',
    };
    return;
  }
  siloUser.value = siloUser.value === 'Guest' ? 'Ada' : 'Guest';
}

function reset() {
  store.value = { cart: 0, user: 'Guest', price: 29 };
  siloCart.value = 0;
  siloUser.value = 'Guest';
  siloNotice.value = '—';
  productLocalCart.value = 0;
}

watch(withStore, async () => {
  await nextTick();
  layoutSpokes();
});

onMounted(async () => {
  await nextTick();
  layoutSpokes();
  if (typeof ResizeObserver === 'undefined' || !stageRef.value) return;
  resizeObserver = new ResizeObserver(() => layoutSpokes());
  resizeObserver.observe(stageRef.value);
  if (gridRef.value) resizeObserver.observe(gridRef.value);
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
});
</script>

<template>
  <div class="sm" :class="{ 'is-central': withStore, 'is-silo': !withStore }">
    <div class="sm-toggle" role="tablist" aria-label="State management mode">
      <button
        type="button"
        role="tab"
        class="sm-toggle-label"
        :class="{ 'is-on': !withStore }"
        :aria-selected="!withStore"
        @click="setMode(false)"
      >
        No state management
      </button>
      <button
        type="button"
        class="sm-switch"
        :aria-pressed="withStore"
        aria-label="Toggle state management"
        @click="setMode(!withStore)"
      >
        <span class="sm-knob" />
      </button>
      <button
        type="button"
        role="tab"
        class="sm-toggle-label"
        :class="{ 'is-on': withStore }"
        :aria-selected="withStore"
        @click="setMode(true)"
      >
        With state management
      </button>
    </div>

    <div ref="stageRef" class="sm-stage">
      <div ref="gridRef" class="sm-grid">
        <article class="sm-card">
          <p class="sm-card-title">Product card</p>
          <p class="sm-row">Price: $ {{ price }}</p>
          <button type="button" class="sm-btn" @click="addToCart">Add to cart</button>
          <p v-if="!withStore && productLocalCart > 0" class="sm-own">
            Own copy: added {{ productLocalCart }}
          </p>
        </article>

        <article class="sm-card">
          <p class="sm-card-title">Cart badge</p>
          <p class="sm-row sm-icon-row">
            <ShoppingCart :size="14" />
            Items:
            <span class="sm-value" :class="{ 'is-stale': !withStore }">
              {{ cart }}
              <i v-if="!withStore" class="sm-dot" />
            </span>
          </p>
          <p v-if="!withStore" class="sm-own">Own copy: {{ cart }}</p>
        </article>

        <article class="sm-card">
          <p class="sm-card-title">User profile</p>
          <p class="sm-row sm-icon-row">
            <User :size="14" />
            Name: {{ user }}
          </p>
          <button type="button" class="sm-btn sm-btn-ghost" @click="toggleAuth">
            {{ loggedIn ? 'Log out' : 'Log in' }}
          </button>
        </article>

        <article class="sm-card">
          <p class="sm-card-title">Notification</p>
          <p class="sm-row sm-icon-row">
            <Bell :size="14" />
            <span class="sm-value" :class="{ 'is-stale': !withStore }">
              {{ notice }}
              <i v-if="!withStore" class="sm-dot" />
            </span>
          </p>
          <p v-if="!withStore" class="sm-own">Own copy: {{ notice }}</p>
        </article>

        <svg v-if="!withStore" class="sm-cross" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line x1="50" y1="4" x2="50" y2="96" />
          <line x1="4" y1="50" x2="96" y2="50" />
        </svg>
      </div>

      <div v-if="withStore" class="sm-hub-gap" aria-hidden="true" />

      <article v-if="withStore" ref="storeRef" class="sm-store">
        <div class="sm-store-head">
          <span class="sm-store-title">
            <Database :size="14" />
            Central store
          </span>
          <span class="sm-store-tag">Single source of truth</span>
        </div>
        <pre class="sm-store-body">cart: {{ store.cart }}
user: {{ store.user }}
price: {{ store.price }}</pre>
      </article>

      <svg
        v-if="withStore && svgSize.w > 0"
        class="sm-spokes"
        :viewBox="`0 0 ${svgSize.w} ${svgSize.h}`"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line
          v-for="(line, i) in spokeLines"
          :key="i"
          :x1="line.x1"
          :y1="line.y1"
          :x2="line.x2"
          :y2="line.y2"
        />
        <circle :cx="hubPt.x" :cy="hubPt.y" r="3.5" />
      </svg>
    </div>

    <p class="sm-caption">
      <template v-if="withStore">All components read from one central store. Updates sync instantly.</template>
      <template v-else>Each component holds its own copy of data. Updates don't sync.</template>
    </p>

    <button type="button" class="sm-reset" @click="reset">Reset demo</button>
  </div>
</template>

<style scoped>
.sm {
  margin: 8px 0 28px;
  padding: 18px 16px 14px;
  border: 1px solid var(--mf-line, #eaeaea);
  border-radius: 10px;
  background: var(--mf-graph, #fafafa);
}

.sm-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 18px;
}

.sm-toggle-label {
  border: 0;
  background: transparent;
  font-size: 12px;
  font-weight: 600;
  color: var(--mf-muted, #787774);
  padding: 0;
}

.sm-toggle-label.is-on {
  color: var(--mf-text, #37352f);
}

.sm-switch {
  width: 44px;
  height: 24px;
  border-radius: 999px;
  border: 1px solid var(--mf-line, #eaeaea);
  background: #e6e6e6;
  position: relative;
  padding: 0;
}

.sm.is-central .sm-switch {
  background: #7b2d8e;
  border-color: #7b2d8e;
}

.sm-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.18s ease;
}

.sm.is-central .sm-knob {
  transform: translateX(20px);
}

.sm-stage {
  position: relative;
  z-index: 0;
  max-width: 520px;
  margin: 0 auto;
  overflow: visible;
}

.sm-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.sm-spokes {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 6;
  overflow: visible;
}

.sm-spokes line {
  stroke: #c4c4c4;
  stroke-width: 1.25;
  vector-effect: non-scaling-stroke;
}

.sm-spokes circle {
  fill: #1f1f1f;
}

.sm-cross {
  position: absolute;
  inset: 8px;
  width: calc(100% - 16px);
  height: calc(100% - 16px);
  pointer-events: none;
}

.sm-cross line {
  stroke: var(--mf-edge, #c0c0c0);
  stroke-width: 1;
  stroke-dasharray: 4 4;
}

.sm-card {
  position: relative;
  z-index: 1;
  background: var(--mf-panel, #fff);
  border: 1px solid var(--mf-line, #eaeaea);
  border-radius: 8px;
  padding: 12px 14px 14px;
  min-height: 118px;
}

.sm-card-title {
  font-size: 13px;
  font-weight: 700;
  margin: 0 0 10px;
}

.sm-row {
  font-size: 13px;
  color: var(--mf-text, #37352f);
  margin: 0 0 10px;
}

.sm-icon-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sm-value {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 1px 8px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--mf-muted, #787774) 10%, transparent);
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 12px;
}

.sm-value.is-stale {
  padding-right: 14px;
}

.sm-dot {
  position: absolute;
  top: -3px;
  right: -3px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #e03131;
}

.sm-own {
  margin: 8px 0 0;
  font-size: 11px;
  color: var(--mf-muted, #787774);
}

.sm-btn {
  height: 30px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid #7b2d8e;
  background: #7b2d8e;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.sm-btn-ghost {
  background: var(--mf-panel, #fff);
  color: var(--mf-text, #37352f);
  border-color: var(--mf-line, #eaeaea);
}

.sm-hub-gap {
  height: 36px;
}

.sm-store {
  position: relative;
  z-index: 1;
  margin-top: 0;
  background: var(--mf-panel, #fff);
  border: 1px solid var(--mf-line, #eaeaea);
  border-radius: 8px;
  padding: 12px 14px 14px;
}

.sm-store-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.sm-store-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
}

.sm-store-tag {
  font-size: 11px;
  color: var(--mf-muted, #787774);
}

.sm-store-body {
  margin: 0;
  padding: 10px 12px;
  border-radius: 6px;
  background: var(--mf-graph, #fafafa);
  border: 1px solid var(--mf-line, #eaeaea);
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 13px;
  line-height: 1.7;
  color: var(--mf-text, #37352f);
}

.sm-caption {
  margin: 16px 0 0;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--mf-text, #37352f);
}

.sm-reset {
  display: block;
  margin: 10px auto 0;
  border: 0;
  background: transparent;
  color: var(--mf-muted, #787774);
  font-size: 12px;
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
