<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';
import {
  money,
  customerSpend,
  shopCustomers,
  shopOrders,
  shopSales,
} from '~/data/coffeeShop';
import { useCoffeeShopLesson } from '~/composables/useCoffeeShopLesson';

const g = useCoffeeShopLesson();
const arenaEl = ref<HTMLElement | null>(null);
const lines = ref<{ d: string; kind: 'match' | 'null' }[]>([]);
const arenaView = reactive({ w: 100, h: 100 });

const leftoverBoss = computed(() => {
  const question = g.questions.value.find((item) => item.kind === 'boss');
  return (question?.fragments ?? []).filter((part) => !g.bossBuilt.value.includes(part));
});

const explainMatch = computed(() => {
  if (g.lessonId.value !== 'select') return new Set<number>();
  const step = g.explainStep.value;
  return new Set(
    shopCustomers
      .filter((row) => {
        if (step < 2) return false;
        if (step === 2) return row.city === 'NYC';
        return row.city === 'NYC' && row.joined_at < '2024-02-01';
      })
      .map((row) => row.id),
  );
});

const selectMatchIds = computed(() => new Set(g.selectRows.value.map((row) => row.id)));

function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cp = x1 + (x2 - x1) * 0.5;
  return `M ${x1} ${y1} C ${cp} ${y1}, ${cp} ${y2}, ${x2} ${y2}`;
}

function measureJoinLines() {
  const arena = arenaEl.value;
  if (!arena || g.lessonId.value !== 'shopjoin' || g.phase.value !== 'explain' || g.explainStep.value < 1) {
    lines.value = [];
    return;
  }
  arenaView.w = Math.max(1, arena.clientWidth);
  arenaView.h = Math.max(1, arena.clientHeight);
  const rect = arena.getBoundingClientRect();
  const next: { d: string; kind: 'match' | 'null' }[] = [];
  for (const order of shopOrders) {
    const cEl = arena.querySelector<HTMLElement>(`#shop-c-${order.customer_id}`);
    const oEl = arena.querySelector<HTMLElement>(`#shop-o-${order.id}`);
    if (!cEl || !oEl) continue;
    const c = cEl.getBoundingClientRect();
    const o = oEl.getBoundingClientRect();
    next.push({
      d: bezier(c.right - rect.left, c.top + c.height / 2 - rect.top, o.left - rect.left, o.top + o.height / 2 - rect.top),
      kind: 'match',
    });
  }
  if (g.explainStep.value >= 2) {
    for (const customer of shopCustomers) {
      if (shopOrders.some((order) => order.customer_id === customer.id)) continue;
      const cEl = arena.querySelector<HTMLElement>(`#shop-c-${customer.id}`);
      if (!cEl) continue;
      const c = cEl.getBoundingClientRect();
      const x = c.right - rect.left;
      const y = c.top + c.height / 2 - rect.top;
      next.push({ d: bezier(x, y, x + 48, y), kind: 'null' });
    }
  }
  lines.value = next;
}

function isPicked(id: string, value: string) {
  return g.picked.value[id] === value;
}
function isRight(id: string, value: string) {
  const question = g.questions.value.find((item) => item.id === id);
  if (!question || Array.isArray(question.answer)) return false;
  return value === question.answer && (isPicked(id, value) || g.revealAnswer.value);
}
function isWrong(id: string, value: string) {
  return isPicked(id, value) && !isRight(id, value);
}

function bumpJoin(kind: typeof g.joinKind.value) {
  if (g.joinKind.value === kind) return;
  g.joinKind.value = kind;
  g.markPractice();
}
function bumpGroup(key: 'city' | 'category') {
  if (g.groupKey.value === key) return;
  g.groupKey.value = key;
  g.markPractice();
}

watch(
  [() => g.phase.value, () => g.explainStep.value, () => g.lessonId.value],
  async () => {
    await nextTick();
    measureJoinLines();
  },
);
</script>

<template>
  <div class="epm shop">
    <div class="epm-tabs" role="tablist" aria-label="Lesson phase">
      <button type="button" class="epm-tab" :class="{ on: g.phase.value === 'explain' }" @click="g.goPhase('explain')">
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

    <!-- SELECT -->
    <div v-if="g.lessonId.value === 'select' && g.phase.value !== 'master'" class="shop-block">
      <p v-if="g.phase.value === 'explain'" class="epm-kicker">Step {{ g.explainStep.value + 1 }} / 4</p>
      <div v-if="g.phase.value === 'practice'" class="epm-controls">
        <div class="epm-pills">
          <button type="button" class="epm-pill" :class="{ on: g.cityNyc.value }" @click="g.cityNyc.value = !g.cityNyc.value; g.markPractice()">
            city = NYC
          </button>
          <button type="button" class="epm-pill" :class="{ on: g.beforeFeb.value }" @click="g.beforeFeb.value = !g.beforeFeb.value; g.markPractice()">
            joined before Feb 1
          </button>
          <button type="button" class="epm-pill" :class="{ on: g.cityLa.value }" @click="g.cityLa.value = !g.cityLa.value; g.markPractice()">
            city = LA
          </button>
          <button type="button" class="epm-pill" :class="{ on: g.useOr.value }" @click="g.useOr.value = !g.useOr.value; g.markPractice()">
            {{ g.useOr.value ? 'OR' : 'AND' }}
          </button>
          <button type="button" class="epm-pill" :class="{ on: g.likeA.value }" @click="g.likeA.value = !g.likeA.value; g.markPractice()">
            name LIKE %a%
          </button>
        </div>
        <div class="epm-inline">
          <label>
            ORDER BY
            <select v-model="g.orderBy.value" @change="g.markPractice()">
              <option value="name">name</option>
              <option value="city">city</option>
              <option value="joined_at">joined_at</option>
            </select>
          </label>
          <label>
            LIMIT {{ g.limit.value }}
            <input v-model.number="g.limit.value" type="range" min="1" max="5" @change="g.markPractice()" />
          </label>
        </div>
        <p class="epm-kicker">{{ g.selectRows.value.length }} rows · {{ g.practiceMoves.value }}/3 plays</p>
      </div>
      <div class="shop-table">
        <div class="epm-label">customers · before → after</div>
        <div
          v-for="row in shopCustomers"
          :key="row.id"
          class="epm-result-row"
          :class="{
            'is-ok':
              g.phase.value === 'explain' ? explainMatch.has(row.id) : selectMatchIds.has(row.id),
            fade:
              g.phase.value === 'practice'
                ? !selectMatchIds.has(row.id)
                : g.explainStep.value >= 2 && !explainMatch.has(row.id),
          }"
        >
          <span>{{ row.id }} {{ row.name }}</span>
          <span>{{ row.city }} · {{ row.joined_at }}</span>
        </div>
      </div>
    </div>

    <!-- JOINS -->
    <div v-else-if="g.lessonId.value === 'shopjoin' && g.phase.value !== 'master'" class="shop-block">
      <p v-if="g.phase.value === 'explain'" class="epm-kicker">Step {{ g.explainStep.value + 1 }} / 4</p>
      <div v-if="g.phase.value === 'practice'" class="epm-pills">
        <button
          v-for="kind in (['inner', 'left', 'right', 'full'] as const)"
          :key="kind"
          type="button"
          class="epm-pill"
          :class="{ on: g.joinKind.value === kind }"
          @click="bumpJoin(kind)"
        >
          {{ kind.toUpperCase() }}
        </button>
      </div>
      <div ref="arenaEl" class="epm-arena">
        <svg class="epm-arrows" :viewBox="`0 0 ${arenaView.w} ${arenaView.h}`">
          <path v-for="(line, index) in lines" :key="index" :d="line.d" :class="line.kind" />
        </svg>
        <div class="epm-table is-left">
          <div class="epm-label">LEFT · customers</div>
          <div
            v-for="row in shopCustomers"
            :id="`shop-c-${row.id}`"
            :key="row.id"
            class="epm-row"
            :class="{ hot: g.selectedCustomerId.value === row.id }"
            @click="g.selectedCustomerId.value = row.id; g.phase.value === 'practice' && g.markPractice()"
          >
            <span>{{ row.id }}</span><strong>{{ row.name }}</strong>
          </div>
        </div>
        <div class="epm-table is-right">
          <div class="epm-label">RIGHT · orders</div>
          <div
            v-for="row in shopOrders"
            :id="`shop-o-${row.id}`"
            :key="row.id"
            class="epm-row"
            :class="{ hot: g.selectedCustomerId.value === row.customer_id }"
          >
            <span>#{{ row.id }} → {{ row.customer_id }}</span><strong>{{ row.item }} {{ money(row.price) }}</strong>
          </div>
        </div>
      </div>
      <div
        v-if="g.phase.value === 'practice' || g.explainStep.value >= 2"
        class="epm-live"
      >
        <div class="epm-label">
          Result · {{ g.phase.value === 'practice' ? g.joinRows.value.length : g.explainStep.value >= 3 ? 7 : 5 }} rows
        </div>
        <template v-if="g.phase.value === 'practice'">
          <div
            v-for="row in g.joinRows.value"
            :key="row.id"
            class="epm-result-row"
            :class="{ 'is-null': !row.matched, hot: g.hoverJoin.value === row.id }"
            @pointerenter="g.hoverJoin.value = row.id"
            @pointerleave="g.hoverJoin.value = null"
          >
            <span>{{ row.customer?.name ?? 'NULL' }}</span>
            <span>{{ row.order ? `${row.order.item} ${money(row.order.price)}` : 'NULL' }}</span>
          </div>
        </template>
        <template v-else>
          <div class="epm-result-row"><span>Alice</span><span>Coffee $5.00</span></div>
          <div class="epm-result-row"><span>Alice</span><span>Bagel $3.50</span></div>
          <div class="epm-result-row"><span>Alice</span><span>Tea $3.00</span></div>
          <div class="epm-result-row"><span>Carol</span><span>Muffin $4.00</span></div>
          <div class="epm-result-row"><span>Dave</span><span>Coffee $5.00</span></div>
          <div v-if="g.explainStep.value >= 3" class="epm-result-row is-null"><span>Bob</span><span>NULL</span></div>
          <div v-if="g.explainStep.value >= 3" class="epm-result-row is-null"><span>Eve</span><span>NULL</span></div>
        </template>
      </div>
    </div>

    <!-- GROUP BY -->
    <div v-else-if="g.lessonId.value === 'shopgroup' && g.phase.value !== 'master'" class="shop-block">
      <p v-if="g.phase.value === 'explain'" class="epm-kicker">Step {{ g.explainStep.value + 1 }} / 4</p>
      <div v-if="g.phase.value === 'practice'" class="epm-controls">
        <div class="epm-pills">
          <button type="button" class="epm-pill" :class="{ on: g.groupKey.value === 'city' }" @click="bumpGroup('city')">By city</button>
          <button type="button" class="epm-pill" :class="{ on: g.groupKey.value === 'category' }" @click="bumpGroup('category')">By category</button>
          <button type="button" class="epm-pill" :class="{ on: g.autoFold.value }" @click="g.autoFold.value = true; g.markPractice()">
            Auto GROUP BY
          </button>
        </div>
        <label class="epm-inline">
          HAVING COUNT >= {{ g.havingCount.value }}
          <input v-model.number="g.havingCount.value" type="range" min="1" max="4" @change="g.markPractice()" />
        </label>
      </div>
      <div class="shop-table">
        <div class="epm-label">tickets</div>
        <div v-for="sale in shopSales" :key="sale.order.id" class="epm-result-row">
          <span>{{ sale.customer.name }} · {{ sale.customer.city }}</span>
          <span>{{ sale.product.category }} · {{ sale.order.item }} {{ money(sale.order.price) }}</span>
        </div>
      </div>
      <div v-if="g.phase.value === 'practice' || g.explainStep.value >= 1" class="bucket-row">
        <div v-for="group in g.groups.value" :key="group.name" class="bucket">
          <strong>{{ group.name }}</strong>
          <span>COUNT {{ group.count }}</span>
          <span>SUM {{ money(group.sum) }}</span>
          <span>AVG {{ money(group.avg) }}</span>
        </div>
      </div>
    </div>

    <!-- SUBQUERY -->
    <div v-else-if="g.lessonId.value === 'subquery' && g.phase.value !== 'master'" class="shop-block">
      <p v-if="g.phase.value === 'explain'" class="epm-kicker">Step {{ g.explainStep.value + 1 }} / 4</p>
      <div v-if="g.phase.value === 'practice'" class="epm-pills">
        <button type="button" class="epm-pill" :class="{ on: !g.asCte.value }" @click="g.asCte.value = false; g.markPractice()">Subquery</button>
        <button type="button" class="epm-pill" :class="{ on: g.asCte.value }" @click="g.asCte.value = true; g.markPractice()">CTE WITH</button>
        <button type="button" class="epm-pill" :class="{ on: g.aboveAvg.value }" @click="g.aboveAvg.value = !g.aboveAvg.value; g.markPractice()">
          Above average
        </button>
      </div>
      <div class="shop-table">
        <div class="epm-label">1. Intermediate · spend per customer</div>
        <div v-for="row in shopCustomers" :key="row.id" class="epm-result-row" :class="{ fade: customerSpend(row.id) === 0 }">
          <span>{{ row.name }}</span>
          <span>{{ money(customerSpend(row.id)) }}</span>
        </div>
      </div>
      <div v-if="g.phase.value === 'practice' || g.explainStep.value >= 1" class="shop-table">
        <div class="epm-label">2. Outer result</div>
        <div v-for="row in g.spends.value" :key="row.customer.id" class="epm-result-row is-ok">
          <span>{{ row.customer.name }}</span>
          <span>{{ money(row.spend) }}</span>
        </div>
      </div>
    </div>

    <!-- INDEX -->
    <div v-else-if="g.lessonId.value === 'shopindex' && g.phase.value !== 'master'" class="shop-block">
      <div class="epm-inline">
        <label>
          Find id
          <input v-model.number="g.targetId.value" type="number" min="1" max="5" />
        </label>
        <button type="button" class="epm-pill" :class="{ on: g.indexOn.value }" @click="g.indexOn.value = !g.indexOn.value; g.markPractice()">
          Index {{ g.indexOn.value ? 'ON' : 'OFF' }}
        </button>
        <button type="button" class="idx-race-btn" :disabled="g.racing.value" @click="g.startRace()">
          {{ g.racing.value ? 'Racing…' : 'Race!' }}
        </button>
      </div>
      <div class="idx-cards">
        <article class="idx-card">
          <header>Table scan · {{ g.scanChecks.value }} checks</header>
          <div
            v-for="(row, index) in g.heap.value"
            :key="row.id"
            class="epm-result-row"
            :class="{ 'is-ok': index === g.scanFound.value, checking: index === g.scanIndex.value && index !== g.scanFound.value }"
          >
            <span>{{ row.id }}</span><span>{{ row.name }}</span>
          </div>
        </article>
        <article class="idx-card">
          <header>Index seek · {{ g.seekChecks.value }} checks</header>
          <div class="idx-node" :class="{ on: g.seekPath.value.includes('root') }">1-2 | 3-4 | 5</div>
          <div class="idx-branches">
            <div class="idx-node" :class="{ on: g.seekPath.value.includes('b0') }">1-2</div>
            <div class="idx-node" :class="{ on: g.seekPath.value.includes('b1') }">3-4</div>
            <div class="idx-node" :class="{ on: g.seekPath.value.includes('b2') }">5</div>
          </div>
          <div class="idx-branches">
            <div class="idx-node" :class="{ on: g.seekPath.value.includes('l0') }">1 2</div>
            <div class="idx-node" :class="{ on: g.seekPath.value.includes('l1') }">3 4</div>
            <div class="idx-node" :class="{ on: g.seekPath.value.includes('l2') }">5</div>
          </div>
        </article>
      </div>
      <div v-if="g.raceDone.value" class="idx-banner">
        {{ g.indexOn.value && g.seekChecks.value ? `${(g.scanChecks.value / Math.max(g.seekChecks.value, 1)).toFixed(1)}× faster with the index` : 'Scan walked the heap. Turn the index on.' }}
      </div>
    </div>

    <!-- TX -->
    <div v-else-if="g.lessonId.value === 'tx' && g.phase.value !== 'master'" class="shop-block">
      <div class="tx-cards">
        <div class="tx-card" :class="{ pending: g.pending.value }">
          <span>Alice</span>
          <strong>{{ money(g.aliceBal.value) }}</strong>
          <em v-if="g.pending.value">pending −$50</em>
        </div>
        <div class="tx-card" :class="{ pending: g.pending.value }">
          <span>Bob</span>
          <strong>{{ money(g.bobBal.value) }}</strong>
          <em v-if="g.pending.value">pending +$50</em>
        </div>
      </div>
      <div class="epm-pills">
        <button type="button" class="epm-pill" :disabled="g.pending.value || g.aliceBal.value < 50" @click="g.transfer()">
          Transfer $50
        </button>
        <button type="button" class="epm-pill" :disabled="!g.pending.value" @click="g.commitTx()">COMMIT</button>
        <button type="button" class="epm-pill" :disabled="!g.pending.value" @click="g.rollbackTx()">ROLLBACK</button>
        <button type="button" class="epm-pill" :class="{ on: g.dirtyReads.value }" @click="g.dirtyReads.value = !g.dirtyReads.value; g.markPractice()">
          Dirty reads {{ g.dirtyReads.value ? 'ON' : 'OFF' }}
        </button>
      </div>
      <p v-if="g.dirtyReads.value" class="epm-note">
        Cashier 2 sees Alice {{ money(g.cashierAlice.value) }}, Bob {{ money(g.cashierBob.value) }}.
      </p>
      <div class="tx-log">
        <div class="epm-label">Transaction log</div>
        <p v-for="(line, index) in g.txLog.value" :key="index">{{ line }}</p>
        <p v-if="!g.txLog.value.length">Empty. Transfer to begin.</p>
      </div>
    </div>

    <!-- MASTER -->
    <div v-if="g.phase.value === 'master'" class="epm-master">
      <div class="epm-score" :class="{ win: g.mastered.value }">{{ g.scoreLine.value }}</div>
      <article v-for="(question, index) in g.questions.value" :key="question.id" class="epm-q">
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
            :class="{ on: isPicked(question.id, option), ok: isRight(question.id, option), bad: isWrong(question.id, option) }"
            @click="g.gradeChoice(question.id, option)"
          >
            {{ option }}
          </button>
        </div>
        <div v-if="question.kind === 'boss'" class="epm-boss">
          <div class="epm-built">
            <button v-for="part in g.bossBuilt.value" :key="part" type="button" class="epm-chip on" @click="g.toggleBoss(part)">
              {{ part }}
            </button>
            <span v-if="!g.bossBuilt.value.length" class="epm-placeholder">Click fragments in order</span>
          </div>
          <div class="epm-pills wrap">
            <button v-for="part in leftoverBoss" :key="part" type="button" class="epm-chip" @click="g.toggleBoss(part)">
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
.shop {
  --epm-left: #3b82f6;
  --epm-right: #7c3aed;
  --epm-ok: #10b981;
  --epm-bad: #f43f5e;
  --epm-mag: #d946ef;
  width: 700px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.epm-tabs { display: flex; gap: 6px; }
.epm-tab, .epm-pill, .epm-chip {
  border: 1px solid var(--mf-line);
  background: var(--mf-panel);
  color: var(--mf-muted);
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.epm-tab { height: 30px; padding: 0 12px; border-radius: 8px; }
.epm-tab.on, .epm-pill.on, .epm-chip.on {
  border-color: var(--epm-mag);
  background: color-mix(in srgb, var(--epm-mag) 14%, var(--mf-panel));
  color: var(--mf-text);
}
.epm-tab:disabled, .epm-pill:disabled { opacity: 0.4; cursor: not-allowed; }
.epm-kicker {
  margin: 0;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--epm-mag);
}
.shop-block, .epm-master, .epm-controls { display: flex; flex-direction: column; gap: 10px; }
.epm-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.epm-pill, .epm-chip { min-height: 28px; padding: 4px 10px; border-radius: 6px; text-align: left; }
.epm-pill.ok { border-color: var(--epm-ok); color: var(--epm-ok); }
.epm-pill.bad { border-color: var(--epm-bad); color: var(--epm-bad); }
.epm-inline, .epm-inline label { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; font-size: 12px; color: var(--mf-muted); }
.epm-inline select, .epm-inline input[type='number'] {
  height: 28px;
  border: 1px solid var(--mf-line);
  background: var(--mf-graph);
  color: var(--mf-text);
  font-family: 'DM Mono', ui-monospace, monospace;
}
.shop-table, .epm-live, .tx-log {
  border: 1px solid var(--mf-line);
  border-radius: 10px;
  padding: 10px;
  background: var(--mf-graph);
}
.epm-label {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 8px;
  color: var(--mf-muted);
}
.epm-result-row, .epm-row {
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
.epm-result-row.is-ok { border-color: var(--epm-ok); }
.epm-result-row.fade { opacity: 0.35; }
.epm-result-row.is-null span:last-child { color: var(--epm-bad); }
.epm-result-row.checking { border-color: var(--epm-left); color: var(--epm-left); }
.epm-result-row.hot, .epm-row.hot { border-color: var(--epm-mag); }
.epm-arena { position: relative; display: flex; justify-content: space-between; gap: 36px; min-height: 200px; }
.epm-arrows { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.epm-arrows path { fill: none; stroke-width: 2; }
.epm-arrows path.match { stroke: var(--epm-left); }
.epm-arrows path.null { stroke: var(--epm-bad); stroke-dasharray: 4 4; }
.epm-table { position: relative; z-index: 1; min-width: 150px; }
.epm-table.is-left .epm-label { color: var(--epm-left); }
.epm-table.is-right .epm-label { color: var(--epm-right); }
.bucket-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; }
.bucket {
  border: 1px solid var(--mf-line);
  border-radius: 10px;
  padding: 10px;
  background: var(--mf-panel);
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  color: var(--mf-muted);
}
.bucket strong { color: var(--mf-text); font-size: 13px; }
.idx-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.idx-card { border: 1px solid var(--mf-line); border-radius: 10px; overflow: hidden; background: var(--mf-panel); padding-bottom: 8px; }
.idx-card header {
  background: #0f0f1a;
  color: #fff;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  padding: 8px 10px;
  margin-bottom: 8px;
}
.idx-node {
  margin: 0 8px 6px;
  padding: 6px;
  border: 1px solid var(--mf-line);
  border-radius: 6px;
  text-align: center;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  color: var(--mf-muted);
}
.idx-node.on { border-color: var(--epm-ok); color: var(--epm-ok); }
.idx-branches { display: grid; grid-template-columns: 1fr 1fr 1fr; }
.idx-race-btn {
  height: 32px;
  padding: 0 14px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(90deg, #8b7cff, #d946ef);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}
.idx-banner { padding: 10px; border-radius: 8px; background: color-mix(in srgb, var(--epm-ok) 12%, var(--mf-graph)); color: var(--epm-ok); font-weight: 700; }
.tx-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.tx-card {
  border: 1px solid var(--mf-line);
  border-radius: 10px;
  padding: 14px;
  background: var(--mf-panel);
}
.tx-card.pending { border-color: #f59e0b; }
.tx-card span { font-family: 'DM Mono', ui-monospace, monospace; font-size: 11px; color: var(--mf-muted); }
.tx-card strong { display: block; font-size: 22px; margin-top: 4px; }
.tx-card em { font-size: 11px; color: #f59e0b; }
.tx-log p { margin: 0 0 4px; font-family: 'DM Mono', ui-monospace, monospace; font-size: 11px; color: var(--mf-muted); }
.epm-note { margin: 0; font-size: 12px; color: var(--mf-muted); }
.epm-score { font-family: 'DM Mono', ui-monospace, monospace; font-size: 12px; padding: 8px 10px; border-radius: 8px; border: 1px solid var(--mf-line); }
.epm-score.win { border-color: var(--epm-ok); color: var(--epm-ok); }
.epm-q { border: 1px solid var(--mf-line); border-radius: 10px; padding: 10px; }
.epm-q-prompt { margin: 0 0 8px; font-size: 13px; line-height: 1.5; white-space: pre-wrap; }
.epm-q-prompt span { display: block; margin-bottom: 4px; font-family: 'DM Mono', ui-monospace, monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--epm-mag); }
.epm-why { margin: 8px 0 0; font-size: 12px; }
.epm-why.ok { color: var(--epm-ok); }
.epm-why.bad { color: var(--epm-bad); }
.epm-built { min-height: 40px; margin-bottom: 8px; padding: 8px; border-radius: 8px; border: 1px dashed var(--mf-line); display: flex; flex-wrap: wrap; gap: 6px; }
.epm-placeholder { color: var(--mf-muted); font-size: 12px; }
.epm-chip { font-size: 10px; }
@media (max-width: 720px) {
  .shop { width: 100%; }
  .epm-arena, .idx-cards, .tx-cards { grid-template-columns: 1fr; flex-direction: column; }
}
</style>
