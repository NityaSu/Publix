import { computed, ref, watch, type Ref } from 'vue';
import {
  filterCustomers,
  groupSales,
  selectSql,
  shopCustomers,
  shopJoinRows,
  spendByCustomer,
  type SelectOrderBy,
  type ShopJoinKind,
} from '~/data/coffeeShop';
import {
  PRACTICE_NEED,
  groupSql,
  joinSql,
  shopLessonDefs,
  subquerySql,
  type MasteryPhase,
  type ShopLessonId,
} from '~/data/coffeeShopLessons';

const lessonId = ref<ShopLessonId>('select');
const phase = ref<MasteryPhase>('explain');
const explainStep = ref(0);
const explainDone = ref(false);
const practiceMoves = ref(0);
const hintOpen = ref(false);
const revealAnswer = ref(false);
const picked = ref<Record<string, string>>({});
const bossBuilt = ref<string[]>([]);
const answered = ref<Record<string, boolean>>({});

const cityNyc = ref(false);
const beforeFeb = ref(false);
const cityLa = ref(false);
const useOr = ref(false);
const likeA = ref(false);
const orderBy = ref<SelectOrderBy>('joined_at');
const limit = ref(5);

const joinKind = ref<ShopJoinKind>('left');
const hoverJoin = ref<string | null>(null);
const selectedCustomerId = ref<number | null>(null);

const groupKey = ref<'city' | 'category'>('city');
const havingCount = ref(1);
const autoFold = ref(false);

const asCte = ref(false);
const aboveAvg = ref(false);
const subStep = ref(0);

const targetId = ref(5);
const indexOn = ref(true);
const racing = ref(false);
const scanChecks = ref(0);
const seekChecks = ref(0);
const scanIndex = ref(-1);
const scanFound = ref(-1);
const seekPath = ref<string[]>([]);
const raceDone = ref(false);
const heap = ref([...shopCustomers]);

const aliceBal = ref(100);
const bobBal = ref(30);
const pending = ref(false);
const dirtyReads = ref(false);
const txLog = ref<string[]>([]);

let raceGen = 0;
const timers: number[] = [];

const def = computed(() => shopLessonDefs[lessonId.value]);
const explainLen = computed(() => def.value.explain.length);

function markPractice() {
  practiceMoves.value += 1;
}

const canPractice = computed(
  () => explainDone.value || explainStep.value >= explainLen.value - 1,
);
const canMaster = computed(() => practiceMoves.value >= PRACTICE_NEED);

const selectRows = computed(() =>
  filterCustomers({
    cityNyc: cityNyc.value,
    beforeFeb: beforeFeb.value,
    cityLa: cityLa.value,
    useOr: useOr.value,
    likeA: likeA.value,
    orderBy: orderBy.value,
    limit: limit.value,
  }),
);

const joinRows = computed(() => shopJoinRows(joinKind.value));
const groups = computed(() => groupSales(groupKey.value, havingCount.value));
const spends = computed(() => {
  const rows = spendByCustomer().filter((row) => row.spend > 0);
  if (!aboveAvg.value) return rows.slice(0, 3);
  const avg = rows.reduce((sum, row) => sum + row.spend, 0) / rows.length;
  return rows.filter((row) => row.spend > avg);
});

const cashierAlice = computed(() =>
  pending.value && dirtyReads.value ? aliceBal.value - 50 : aliceBal.value,
);
const cashierBob = computed(() =>
  pending.value && dirtyReads.value ? bobBal.value + 50 : bobBal.value,
);

const practiceSql = computed(() => {
  const id = lessonId.value;
  if (id === 'select') {
    return selectSql({
      cityNyc: cityNyc.value,
      beforeFeb: beforeFeb.value,
      cityLa: cityLa.value,
      useOr: useOr.value,
      likeA: likeA.value,
      orderBy: orderBy.value,
      limit: limit.value,
    });
  }
  if (id === 'shopjoin') return joinSql(joinKind.value);
  if (id === 'shopgroup') return groupSql(groupKey.value, havingCount.value);
  if (id === 'subquery') return subquerySql(asCte.value, aboveAvg.value);
  if (id === 'shopindex') {
    return indexOn.value
      ? 'CREATE INDEX idx_customers_id ON customers(id);\n\nSELECT * FROM customers WHERE id = ' +
          targetId.value +
          ';'
      : 'SELECT * FROM customers WHERE id = ' + targetId.value + ';';
  }
  if (pending.value) {
    return 'BEGIN;\n-- Alice pending -50\n-- Bob pending +50';
  }
  return 'BEGIN;\n-- COMMIT or ROLLBACK';
});

const story = computed(() => {
  if (phase.value === 'explain') {
    return def.value.explain[explainStep.value] ?? def.value.explain[0]!;
  }
  if (phase.value === 'practice') {
    return { ...def.value.practice, sql: practiceSql.value };
  }
  return def.value.master;
});

const questions = computed(() => def.value.questions);

const correctCount = computed(() =>
  questions.value.filter((question) => answered.value[question.id]).length,
);
const scorePct = computed(() =>
  questions.value.length ? Math.round((correctCount.value / questions.value.length) * 100) : 0,
);
const mastered = computed(() => scorePct.value >= 80);
const scoreLine = computed(
  () =>
    `${correctCount.value}/${questions.value.length} correct · ${scorePct.value}%${
      mastered.value ? ' · Mastered' : ''
    }`,
);

const nextLabel = computed(() => {
  if (phase.value === 'explain') {
    return explainStep.value < explainLen.value - 1 ? 'Next' : 'Practice';
  }
  if (phase.value === 'practice') {
    const left = PRACTICE_NEED - practiceMoves.value;
    return left > 0 ? `Play ${left} more` : 'Master';
  }
  return 'Play again';
});

function goPhase(next: MasteryPhase) {
  if (next === 'practice' && !canPractice.value) return;
  if (next === 'master' && !canMaster.value) return;
  phase.value = next;
  hintOpen.value = false;
  revealAnswer.value = false;
  if (next === 'practice') explainDone.value = true;
}

function advance(): 'stay' | 'exit' {
  if (phase.value === 'explain') {
    if (explainStep.value < explainLen.value - 1) {
      explainStep.value += 1;
      if (explainStep.value >= explainLen.value - 1) explainDone.value = true;
      return 'stay';
    }
    explainDone.value = true;
    phase.value = 'practice';
    return 'stay';
  }
  if (phase.value === 'practice') {
    if (!canMaster.value) return 'stay';
    phase.value = 'master';
    return 'stay';
  }
  return 'exit';
}

function toggleHint() {
  hintOpen.value = !hintOpen.value;
}

function gradeChoice(id: string, value: string) {
  const question = questions.value.find((item) => item.id === id);
  if (!question || Array.isArray(question.answer)) return;
  picked.value = { ...picked.value, [id]: value };
  answered.value = { ...answered.value, [id]: value === question.answer };
}

function toggleBoss(fragment: string) {
  const at = bossBuilt.value.indexOf(fragment);
  bossBuilt.value =
    at >= 0 ? bossBuilt.value.filter((item) => item !== fragment) : [...bossBuilt.value, fragment];
  const question = questions.value.find((item) => item.kind === 'boss');
  const expected = question?.answer;
  const ok =
    Array.isArray(expected) &&
    expected.length === bossBuilt.value.length &&
    expected.every((part, index) => part === bossBuilt.value[index]);
  if (question) answered.value = { ...answered.value, [question.id]: ok };
}

function showAnswers() {
  revealAnswer.value = true;
  const boss = questions.value.find((item) => item.kind === 'boss');
  if (boss && Array.isArray(boss.answer)) bossBuilt.value = [...boss.answer];
  for (const question of questions.value) {
    if (typeof question.answer === 'string') {
      picked.value = { ...picked.value, [question.id]: question.answer };
    }
  }
}

function clearTimers() {
  for (const id of timers) window.clearTimeout(id);
  timers.length = 0;
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    timers.push(window.setTimeout(resolve, ms));
  });
}

function shuffleHeap() {
  const next = [...shopCustomers];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const cur = next[i]!;
    next[i] = next[j]!;
    next[j] = cur;
  }
  heap.value = next;
}

function seekNodes(id: number) {
  if (id <= 2) return ['root', 'b0', 'l0'];
  if (id <= 4) return ['root', 'b1', 'l1'];
  return ['root', 'b2', 'l2'];
}

async function startRace() {
  if (racing.value) return;
  const gen = ++raceGen;
  racing.value = true;
  raceDone.value = false;
  scanChecks.value = 0;
  seekChecks.value = 0;
  scanIndex.value = -1;
  scanFound.value = -1;
  seekPath.value = [];
  shuffleHeap();
  const target = targetId.value;
  const scan = async () => {
    for (let i = 0; i < heap.value.length; i += 1) {
      if (gen !== raceGen) return;
      scanIndex.value = i;
      scanChecks.value = i + 1;
      await wait(180);
      if (heap.value[i]?.id === target) {
        scanFound.value = i;
        return;
      }
    }
  };
  const seek = async () => {
    if (!indexOn.value) {
      seekChecks.value = 0;
      return;
    }
    const path = seekNodes(target);
    for (let i = 0; i < path.length; i += 1) {
      if (gen !== raceGen) return;
      seekPath.value = path.slice(0, i + 1);
      seekChecks.value = i + 1;
      await wait(250);
    }
  };
  await Promise.all([scan(), seek()]);
  if (gen !== raceGen) return;
  racing.value = false;
  raceDone.value = true;
  markPractice();
}

function transfer() {
  if (pending.value || aliceBal.value < 50) return;
  pending.value = true;
  txLog.value = [...txLog.value, 'BEGIN · transfer $50 Alice → Bob'];
  markPractice();
}

function commitTx() {
  if (!pending.value) return;
  aliceBal.value -= 50;
  bobBal.value += 50;
  pending.value = false;
  txLog.value = [...txLog.value, 'COMMIT · Alice ' + aliceBal.value + ' · Bob ' + bobBal.value];
  markPractice();
}

function rollbackTx() {
  if (!pending.value) return;
  pending.value = false;
  txLog.value = [...txLog.value, 'ROLLBACK · balances unchanged'];
  markPractice();
}

function resetQuiz() {
  picked.value = {};
  bossBuilt.value = [];
  answered.value = {};
  revealAnswer.value = false;
  hintOpen.value = false;
}

function resetPractice() {
  cityNyc.value = false;
  beforeFeb.value = false;
  cityLa.value = false;
  useOr.value = false;
  likeA.value = false;
  orderBy.value = 'joined_at';
  limit.value = 5;
  joinKind.value = 'left';
  hoverJoin.value = null;
  selectedCustomerId.value = null;
  groupKey.value = 'city';
  havingCount.value = 1;
  autoFold.value = false;
  asCte.value = false;
  aboveAvg.value = false;
  subStep.value = 0;
  targetId.value = 5;
  indexOn.value = true;
  racing.value = false;
  raceDone.value = false;
  scanChecks.value = 0;
  seekChecks.value = 0;
  scanIndex.value = -1;
  scanFound.value = -1;
  seekPath.value = [];
  heap.value = [...shopCustomers];
  aliceBal.value = 100;
  bobBal.value = 30;
  pending.value = false;
  dirtyReads.value = false;
  txLog.value = [];
  raceGen += 1;
  clearTimers();
}

function resetAll() {
  phase.value = 'explain';
  explainStep.value = 0;
  explainDone.value = false;
  practiceMoves.value = 0;
  resetQuiz();
  resetPractice();
}

function setLesson(id: ShopLessonId) {
  if (lessonId.value === id) return;
  lessonId.value = id;
  resetAll();
}

export function useCoffeeShopLesson(active?: Ref<string>) {
  if (active) {
    watch(
      active,
      (id) => {
        if (id in shopLessonDefs) setLesson(id as ShopLessonId);
      },
      { immediate: true },
    );
  }

  return {
    lessonId,
    phase,
    explainStep,
    explainDone,
    practiceMoves,
    hintOpen,
    revealAnswer,
    picked,
    bossBuilt,
    answered,
    canPractice,
    canMaster,
    story,
    questions,
    correctCount,
    scorePct,
    mastered,
    scoreLine,
    nextLabel,
    cityNyc,
    beforeFeb,
    cityLa,
    useOr,
    likeA,
    orderBy,
    limit,
    selectRows,
    joinKind,
    hoverJoin,
    selectedCustomerId,
    joinRows,
    groupKey,
    havingCount,
    autoFold,
    groups,
    asCte,
    aboveAvg,
    subStep,
    spends,
    targetId,
    indexOn,
    racing,
    scanChecks,
    seekChecks,
    scanIndex,
    scanFound,
    seekPath,
    raceDone,
    heap,
    aliceBal,
    bobBal,
    pending,
    dirtyReads,
    txLog,
    cashierAlice,
    cashierBob,
    goPhase,
    advance,
    toggleHint,
    gradeChoice,
    toggleBoss,
    showAnswers,
    resetAll,
    setLesson,
    markPractice,
    startRace,
    transfer,
    commitTx,
    rollbackTx,
  };
}
