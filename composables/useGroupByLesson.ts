import { computed, ref } from 'vue';
import type { JoinKind } from '~/data/databaseLab';
import {
  EXPLAIN_STEPS,
  PRACTICE_NEED,
  explainStories,
  foldPile,
  joinPile,
  masterStory,
  practiceSql,
  practiceStory,
  quizQuestions,
  type AggMode,
  type MasteryPhase,
} from '~/data/databaseGroupBy';

const phase = ref<MasteryPhase>('explain');
const explainStep = ref(0);
const explainDone = ref(false);
const practiceMoves = ref(0);
const joinKind = ref<JoinKind>('left');
const agg = ref<AggMode>('orders');
const includeOrphan = ref(false);
const coffeeWhere = ref(false);
const hintOpen = ref(false);
const revealAnswer = ref(false);
const hoverKey = ref<string | null>(null);
const picked = ref<Record<string, string>>({});
const bossBuilt = ref<string[]>([]);
const answered = ref<Record<string, boolean>>({});

function markPractice() {
  practiceMoves.value += 1;
}

function setJoin(next: JoinKind) {
  if (joinKind.value === next) return;
  joinKind.value = next;
  markPractice();
}

function setAgg(next: AggMode) {
  if (agg.value === next) return;
  agg.value = next;
  markPractice();
}

function toggleOrphan() {
  includeOrphan.value = !includeOrphan.value;
  markPractice();
}

function toggleCoffee() {
  coffeeWhere.value = !coffeeWhere.value;
  markPractice();
}

const canPractice = computed(() => explainDone.value || explainStep.value >= EXPLAIN_STEPS - 1);
const canMaster = computed(() => practiceMoves.value >= PRACTICE_NEED);
const pile = computed(() => joinPile(joinKind.value, includeOrphan.value, coffeeWhere.value));
const groups = computed(() => foldPile(pile.value, agg.value));

const story = computed(() => {
  if (phase.value === 'explain') {
    return explainStories[explainStep.value] ?? explainStories[0]!;
  }
  if (phase.value === 'practice') {
    return {
      ...practiceStory,
      sql: practiceSql(joinKind.value, agg.value, includeOrphan.value, coffeeWhere.value),
    };
  }
  return masterStory;
});

const correctCount = computed(() =>
  quizQuestions.filter((question) => answered.value[question.id]).length,
);

const scorePct = computed(() =>
  quizQuestions.length ? Math.round((correctCount.value / quizQuestions.length) * 100) : 0,
);

const mastered = computed(() => scorePct.value >= 80);

const scoreLine = computed(
  () =>
    `${correctCount.value}/${quizQuestions.length} correct · ${scorePct.value}%${
      mastered.value ? ' · Mastered' : ''
    }`,
);

const nextLabel = computed(() => {
  if (phase.value === 'explain') {
    return explainStep.value < EXPLAIN_STEPS - 1 ? 'Next' : 'Practice';
  }
  if (phase.value === 'practice') {
    if (!canMaster.value) {
      const left = PRACTICE_NEED - practiceMoves.value;
      return left > 0 ? `Play ${left} more` : 'Master';
    }
    return 'Master';
  }
  return 'Play again';
});

function toggleHint() {
  hintOpen.value = !hintOpen.value;
}

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
    if (explainStep.value < EXPLAIN_STEPS - 1) {
      explainStep.value += 1;
      if (explainStep.value >= EXPLAIN_STEPS - 1) explainDone.value = true;
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

function gradeChoice(id: string, value: string) {
  const question = quizQuestions.find((item) => item.id === id);
  if (!question || Array.isArray(question.answer)) return;
  picked.value = { ...picked.value, [id]: value };
  answered.value = { ...answered.value, [id]: value === question.answer };
}

function toggleBoss(fragment: string) {
  const at = bossBuilt.value.indexOf(fragment);
  if (at >= 0) {
    bossBuilt.value = bossBuilt.value.filter((item) => item !== fragment);
  } else {
    bossBuilt.value = [...bossBuilt.value, fragment];
  }
  const question = quizQuestions.find((item) => item.id === 'q5');
  const expected = question?.answer;
  const ok =
    Array.isArray(expected) &&
    expected.length === bossBuilt.value.length &&
    expected.every((part, index) => part === bossBuilt.value[index]);
  answered.value = { ...answered.value, q5: ok };
}

function showAnswers() {
  revealAnswer.value = true;
  const boss = quizQuestions.find((item) => item.id === 'q5');
  if (boss && Array.isArray(boss.answer)) {
    bossBuilt.value = [...boss.answer];
  }
  for (const question of quizQuestions) {
    if (question.kind === 'boss') continue;
    if (typeof question.answer === 'string') {
      picked.value = { ...picked.value, [question.id]: question.answer };
    }
  }
}

function resetAll() {
  phase.value = 'explain';
  explainStep.value = 0;
  explainDone.value = false;
  practiceMoves.value = 0;
  joinKind.value = 'left';
  agg.value = 'orders';
  includeOrphan.value = false;
  coffeeWhere.value = false;
  hintOpen.value = false;
  revealAnswer.value = false;
  hoverKey.value = null;
  picked.value = {};
  bossBuilt.value = [];
  answered.value = {};
}

export function useGroupByLesson() {
  return {
    phase,
    explainStep,
    explainDone,
    practiceMoves,
    joinKind,
    agg,
    includeOrphan,
    coffeeWhere,
    hintOpen,
    revealAnswer,
    hoverKey,
    picked,
    bossBuilt,
    answered,
    canPractice,
    canMaster,
    pile,
    groups,
    story,
    correctCount,
    scorePct,
    mastered,
    scoreLine,
    nextLabel,
    goPhase,
    toggleHint,
    advance,
    setJoin,
    setAgg,
    toggleOrphan,
    toggleCoffee,
    gradeChoice,
    toggleBoss,
    showAnswers,
    resetAll,
  };
}
