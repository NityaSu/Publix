<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { customers, orders, orphanOrder } from '~/data/databaseLab';
import { quizQuestions } from '~/data/databaseGroupBy';
import { useGroupByLesson } from '~/composables/useGroupByLesson';

interface ArenaLine {
  d: string;
  kind: 'match' | 'null';
}

const g = useGroupByLesson();
const arenaEl = ref<HTMLElement | null>(null);
const lines = ref<ArenaLine[]>([]);
const arenaView = reactive({ w: 100, h: 100 });
let resizeObserver: ResizeObserver | null = null;

const showLines = computed(
  () => g.phase.value === 'explain' && g.explainStep.value >= 1,
);
const showPile = computed(
  () => g.phase.value === 'explain' && g.explainStep.value >= 2,
);
const showFold = computed(
  () => g.phase.value === 'explain' && g.explainStep.value >= 3,
);

function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cp = x1 + (x2 - x1) * 0.5;
  return `M ${x1} ${y1} C ${cp} ${y1}, ${cp} ${y2}, ${x2} ${y2}`;
}

function measureLines() {
  const arena = arenaEl.value;
  if (!arena || !showLines.value) {
    lines.value = [];
    return;
  }
  arenaView.w = Math.max(1, arena.clientWidth);
  arenaView.h = Math.max(1, arena.clientHeight);
  const arenaRect = arena.getBoundingClientRect();
  const next: ArenaLine[] = [];
  for (const order of orders) {
    const customerEl = arena.querySelector<HTMLElement>(`#epm-c-${order.customerId}`);
    const orderEl = arena.querySelector<HTMLElement>(`#epm-o-${order.id}`);
    if (!customerEl || !orderEl) continue;
    const cRect = customerEl.getBoundingClientRect();
    const oRect = orderEl.getBoundingClientRect();
    next.push({
      d: bezier(
        cRect.right - arenaRect.left,
        cRect.top + cRect.height / 2 - arenaRect.top,
        oRect.left - arenaRect.left,
        oRect.top + oRect.height / 2 - arenaRect.top,
      ),
      kind: 'match',
    });
  }
  if (g.explainStep.value >= 2) {
    for (const customer of customers) {
      if (orders.some((order) => order.customerId === customer.id)) continue;
      const customerEl = arena.querySelector<HTMLElement>(`#epm-c-${customer.id}`);
      if (!customerEl) continue;
      const cRect = customerEl.getBoundingClientRect();
      const x = cRect.right - arenaRect.left;
      const y = cRect.top + cRect.height / 2 - arenaRect.top;
      next.push({ d: bezier(x, y, x + 56, y), kind: 'null' });
    }
  }
  lines.value = next;
}

function isPicked(id: string, value: string) {
  return g.picked.value[id] === value;
}

function isRight(id: string, value: string) {
  const question = quizQuestions.find((item) => item.id === id);
  if (!question || Array.isArray(question.answer)) return false;
  if (g.picked.value[id] == null && !g.revealAnswer.value) return false;
  return value === question.answer && (isPicked(id, value) || g.revealAnswer.value);
}

function isWrong(id: string, value: string) {
  return isPicked(id, value) && !isRight(id, value);
}

const leftoverBoss = computed(() => {
  const question = quizQuestions.find((item) => item.id === 'q5');
  return (question?.fragments ?? []).filter((part) => !g.bossBuilt.value.includes(part));
});

watch(arenaEl, (el) => {
  resizeObserver?.disconnect();
  if (!el) return;
  resizeObserver = new ResizeObserver(() => measureLines());
  resizeObserver.observe(el);
  measureLines();
});

watch(
  [() => g.phase.value, () => g.explainStep.value],
  async () => {
    await nextTick();
    measureLines();
  },
);

onMounted(async () => {
  await nextTick();
  measureLines();
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});
</script>

<template>
  <div class="epm">
    <div class="epm-tabs" role="tablist" aria-label="Lesson phase">
      <button
        type="button"
        class="epm-tab"
        :class="{ on: g.phase.value === 'explain' }"
        @click="g.goPhase('explain')"
      >
        Explain
      </button>
      <button
        type="button"
        class="epm-tab"
        :class="{ on: g.phase.value === 'practice' }"
        :disabled="!g.canPractice.value"
        @click="g.goPhase('practice')"
      >
        Practice
      </button>
      <button
        type="button"
        class="epm-tab"
        :class="{ on: g.phase.value === 'master' }"
        :disabled="!g.canMaster.value"
        @click="g.goPhase('master')"
      >
        Master
      </button>
    </div>

    <div v-if="g.phase.value === 'explain'" class="epm-explain">
      <p class="epm-kicker">Step {{ g.explainStep.value + 1 }} / 4</p>
      <div ref="arenaEl" class="epm-arena">
        <svg class="epm-arrows" :viewBox="`0 0 ${arenaView.w} ${arenaView.h}`" preserveAspectRatio="none">
          <path
            v-for="(line, index) in lines"
            :key="index"
            :d="line.d"
            :class="line.kind"
          />
        </svg>
        <div class="epm-table is-left">
          <div class="epm-label">LEFT · customers</div>
          <div
            v-for="customer in customers"
            :id="`epm-c-${customer.id}`"
            :key="customer.id"
            class="epm-row"
          >
            <span>{{ customer.id }}</span>
            <strong>{{ customer.name }}</strong>
          </div>
        </div>
        <div class="epm-table is-right">
          <div class="epm-label">RIGHT · orders</div>
          <div
            v-for="order in orders"
            :id="`epm-o-${order.id}`"
            :key="order.id"
            class="epm-row"
          >
            <span>#{{ order.id }} → {{ order.customerId }}</span>
            <strong>{{ order.item }}</strong>
          </div>
        </div>
      </div>

      <div v-if="showPile" class="epm-result">
        <div class="epm-label">LEFT JOIN pile</div>
        <div class="epm-result-row">
          <span>Alice</span><span>Coffee</span>
        </div>
        <div class="epm-result-row">
          <span>Alice</span><span>Bagel</span>
        </div>
        <div class="epm-result-row">
          <span>Carol</span><span>Muffin</span>
        </div>
        <div class="epm-result-row is-null">
          <span>Bob</span><span>NULL</span>
        </div>
        <div class="epm-result-row is-null">
          <span>Dave</span><span>NULL</span>
        </div>
      </div>

      <div v-if="showFold" class="epm-result is-fold">
        <div class="epm-label">GROUP BY name · COUNT(orders.id)</div>
        <div class="epm-result-row is-ok"><span>Alice</span><span>2</span></div>
        <div class="epm-result-row is-ok"><span>Carol</span><span>1</span></div>
        <div class="epm-result-row is-zero"><span>Bob</span><span>0</span></div>
        <div class="epm-result-row is-zero"><span>Dave</span><span>0</span></div>
      </div>
    </div>

    <div v-else-if="g.phase.value === 'practice'" class="epm-practice">
      <div class="epm-controls">
        <div class="epm-control">
          <span>Join</span>
          <div class="epm-pills">
            <button
              v-for="kind in (['inner', 'left', 'right', 'full'] as const)"
              :key="kind"
              type="button"
              class="epm-pill"
              :class="{ on: g.joinKind.value === kind }"
              @click="g.setJoin(kind)"
            >
              {{ kind.toUpperCase() }}
            </button>
          </div>
        </div>
        <div class="epm-control">
          <span>Fold</span>
          <div class="epm-pills">
            <button type="button" class="epm-pill" :class="{ on: g.agg.value === 'raw' }" @click="g.setAgg('raw')">
              Raw rows
            </button>
            <button type="button" class="epm-pill" :class="{ on: g.agg.value === 'orders' }" @click="g.setAgg('orders')">
              COUNT(id)
            </button>
            <button type="button" class="epm-pill" :class="{ on: g.agg.value === 'star' }" @click="g.setAgg('star')">
              COUNT(*)
            </button>
          </div>
        </div>
        <div class="epm-control">
          <span>Extra</span>
          <div class="epm-pills">
            <button type="button" class="epm-pill" :class="{ on: g.includeOrphan.value }" @click="g.toggleOrphan()">
              + Tea orphan
            </button>
            <button type="button" class="epm-pill" :class="{ on: g.coffeeWhere.value }" @click="g.toggleCoffee()">
              WHERE Coffee
            </button>
          </div>
        </div>
      </div>
      <p class="epm-kicker">{{ g.practiceMoves.value }}/3 plays to unlock Master</p>
      <div class="epm-live">
        <div class="epm-label">Live result · {{ g.agg.value === 'raw' ? g.pile.value.length : g.groups.value.length }} rows</div>
        <template v-if="g.agg.value === 'raw'">
          <div
            v-for="row in g.pile.value"
            :key="row.id"
            class="epm-result-row"
            :class="{ 'is-null': !row.matched, hot: g.hoverKey.value === row.id }"
            @pointerenter="g.hoverKey.value = row.id"
            @pointerleave="g.hoverKey.value = null"
          >
            <span>{{ row.customer?.name ?? 'NULL' }}</span>
            <span>{{ row.order?.item ?? 'NULL' }}</span>
          </div>
        </template>
        <template v-else>
          <div
            v-for="group in g.groups.value"
            :key="group.key"
            class="epm-result-row"
            :class="{ 'is-zero': group.n === 0, 'is-ok': group.n > 0, hot: g.hoverKey.value === group.key }"
            @pointerenter="g.hoverKey.value = group.key"
            @pointerleave="g.hoverKey.value = null"
          >
            <span>{{ group.key }}</span>
            <span>{{ group.n }}</span>
          </div>
        </template>
        <p v-if="g.includeOrphan" class="epm-note">Tea is order #{{ orphanOrder.id }} → customer {{ orphanOrder.customerId }}.</p>
      </div>
    </div>

    <div v-else class="epm-master">
      <div class="epm-score" :class="{ win: g.mastered.value }">
        {{ g.scoreLine.value }}
      </div>
      <article v-for="(question, index) in quizQuestions" :key="question.id" class="epm-q">
        <p class="epm-q-prompt">
          <span>Q{{ index + 1 }}{{ question.kind === 'boss' ? ' · Boss' : '' }}</span>
          {{ question.prompt }}
        </p>
        <div v-if="question.options" class="epm-pills wrap">
          <button
            v-for="option in question.options"
            :key="option"
            type="button"
            class="epm-pill"
            :class="{
              on: isPicked(question.id, option),
              ok: isRight(question.id, option),
              bad: isWrong(question.id, option),
            }"
            @click="g.gradeChoice(question.id, option)"
          >
            {{ option }}
          </button>
        </div>
        <div v-if="question.kind === 'boss'" class="epm-boss">
          <div class="epm-built">
            <button
              v-for="part in g.bossBuilt.value"
              :key="part"
              type="button"
              class="epm-chip on"
              @click="g.toggleBoss(part)"
            >
              {{ part }}
            </button>
            <span v-if="!g.bossBuilt.value.length" class="epm-placeholder">Click fragments in order</span>
          </div>
          <div class="epm-pills wrap">
            <button
              v-for="part in leftoverBoss"
              :key="part"
              type="button"
              class="epm-chip"
              @click="g.toggleBoss(part)"
            >
              {{ part }}
            </button>
          </div>
        </div>
        <p
          v-if="g.answered.value[question.id] || g.revealAnswer.value"
          class="epm-why"
          :class="{ ok: g.answered.value[question.id] || g.revealAnswer.value, bad: !g.answered.value[question.id] && !g.revealAnswer.value }"
        >
          {{ question.why }}
        </p>
      </article>
    </div>
  </div>
</template>

<style scoped>
.epm {
  --epm-left: #3b82f6;
  --epm-right: #7c3aed;
  --epm-ok: #10b981;
  --epm-bad: #f43f5e;
  --epm-mag: #d946ef;
  width: 680px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.epm-tabs {
  display: flex;
  gap: 6px;
}

.epm-tab,
.epm-pill,
.epm-chip {
  border: 1px solid var(--mf-line);
  background: var(--mf-panel);
  color: var(--mf-muted);
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.epm-tab {
  height: 30px;
  padding: 0 12px;
  border-radius: 8px;
}

.epm-tab.on,
.epm-pill.on,
.epm-chip.on {
  border-color: var(--epm-mag);
  background: color-mix(in srgb, var(--epm-mag) 14%, var(--mf-panel));
  color: var(--mf-text);
}

.epm-tab:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.epm-kicker {
  margin: 0;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--epm-mag);
}

.epm-arena {
  position: relative;
  display: flex;
  justify-content: space-between;
  gap: 48px;
  min-height: 168px;
}

.epm-arrows {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.epm-arrows path {
  fill: none;
  stroke-width: 2;
}

.epm-arrows path.match {
  stroke: url(#none);
  stroke: var(--epm-left);
}

.epm-arrows path.null {
  stroke: var(--epm-bad);
  stroke-dasharray: 4 4;
}

.epm-table {
  position: relative;
  z-index: 1;
  min-width: 148px;
}

.epm-label {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.epm-table.is-left .epm-label {
  color: var(--epm-left);
}

.epm-table.is-right .epm-label {
  color: var(--epm-right);
}

.epm-row,
.epm-result-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 8px;
  margin-bottom: 6px;
  border: 1px solid var(--mf-line);
  border-radius: 6px;
  background: var(--mf-panel);
  font-size: 12px;
  transition: all 0.3s ease;
}

.epm-row span,
.epm-result-row span:last-child {
  font-family: 'DM Mono', ui-monospace, monospace;
  color: var(--mf-muted);
}

.epm-result,
.epm-live {
  border: 1px solid var(--mf-line);
  border-radius: 10px;
  padding: 10px;
  background: var(--mf-graph);
}

.epm-result-row.is-null span:last-child,
.epm-result-row.is-zero span:last-child {
  color: var(--epm-bad);
}

.epm-result-row.is-ok span:last-child {
  color: var(--epm-ok);
  font-weight: 700;
}

.epm-result-row.hot {
  border-color: var(--epm-mag);
}

.epm-explain,
.epm-practice,
.epm-master {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.epm-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.epm-control span {
  display: block;
  margin-bottom: 4px;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--mf-muted);
}

.epm-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.epm-pill,
.epm-chip {
  height: auto;
  min-height: 28px;
  padding: 4px 10px;
  border-radius: 6px;
  text-align: left;
}

.epm-pill.ok,
.epm-chip.ok {
  border-color: var(--epm-ok);
  background: color-mix(in srgb, var(--epm-ok) 16%, var(--mf-panel));
  color: var(--epm-ok);
}

.epm-pill.bad {
  border-color: var(--epm-bad);
  background: color-mix(in srgb, var(--epm-bad) 14%, var(--mf-panel));
  color: var(--epm-bad);
}

.epm-note {
  margin: 8px 0 0;
  font-size: 11px;
  color: var(--mf-muted);
}

.epm-score {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 12px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--mf-line);
  background: var(--mf-graph);
}

.epm-score.win {
  border-color: var(--epm-ok);
  color: var(--epm-ok);
}

.epm-q {
  border: 1px solid var(--mf-line);
  border-radius: 10px;
  padding: 10px;
  background: var(--mf-panel);
}

.epm-q-prompt {
  margin: 0 0 8px;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  color: var(--mf-text);
}

.epm-q-prompt span {
  display: block;
  margin-bottom: 4px;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--epm-mag);
}

.epm-why {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.5;
}

.epm-why.ok {
  color: var(--epm-ok);
}

.epm-why.bad {
  color: var(--epm-bad);
}

.epm-built {
  min-height: 40px;
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 8px;
  border: 1px dashed var(--mf-line);
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.epm-placeholder {
  color: var(--mf-muted);
  font-size: 12px;
}

.epm-chip {
  font-size: 10px;
}

@media (max-width: 720px) {
  .epm {
    width: 100%;
  }

  .epm-arena {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
