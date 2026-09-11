<script setup lang="ts">
import { Maximize2, Minimize2 } from 'lucide-vue-next';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import InsightsReadingToggle from '~/component/InsightsReadingToggle.vue';
import NoteViews from '~/component/NoteViews.vue';
import { useInsightsReadingMode } from '~/composables/useInsightsReadingMode';

const { mode, isLight } = useInsightsReadingMode();

const envs = ['Dev', 'QA', 'Staging', 'UAT', 'Production'] as const;
type Env = (typeof envs)[number];
type Branch = 'develop' | 'staging' | 'main';

const envBranch: Record<Env, Branch> = {
  Dev: 'develop',
  QA: 'develop',
  Staging: 'staging',
  UAT: 'staging',
  Production: 'main',
};

const branchY: Record<Branch, number> = {
  develop: 45,
  staging: 125,
  main: 205,
};

const fromEnv = ref<Env>('Staging');
const toEnv = ref<Env>('Production');

const sourceBranch = computed(() => envBranch[fromEnv.value]);
const targetBranch = computed(() => envBranch[toEnv.value]);
const sameBranch = computed(() => sourceBranch.value === targetBranch.value);

const steps = computed(() => {
  const sb = sourceBranch.value;
  const tb = targetBranch.value;
  const to = toEnv.value;
  return [
    {
      n: 1,
      title: 'Sync remotes',
      desc: 'Download the latest refs from origin. This does not update your current branch yet.',
      code: 'git fetch origin',
    },
    {
      n: 2,
      title: 'Switch to the target branch',
      desc: `You stand on the branch you are moving code INTO — ${tb} — then pull so local ${tb} matches origin.`,
      code: `git checkout ${tb}\ngit pull origin ${tb}`,
    },
    {
      n: 3,
      title: 'Merge the source branch in',
      desc: `This is the actual “move”: origin/${sb}’s commits join ${tb}. Many teams do this via a Pull Request instead.`,
      code: `git merge origin/${sb}`,
    },
    {
      n: 4,
      title: 'Push the target branch',
      desc: 'Upload the merged branch so everyone — and the servers — get it.',
      code: `git push origin ${tb}`,
    },
    {
      n: 5,
      title: 'Deploy',
      desc: `The CI/CD pipeline sees the new ${tb} and deploys it to ${to}. Sometimes a human clicks “deploy” in a tool like Jenkins.`,
      code: '',
    },
  ];
});

const mergePathD = computed(() => {
  const y1 = branchY[sourceBranch.value];
  const y2 = branchY[targetBranch.value];
  return `M 470 ${y1} L 530 ${y1} L 530 ${y2} L 476 ${y2}`;
});

const shellEl = ref<HTMLElement | null>(null);
const mergePathEl = ref<SVGPathElement | null>(null);
const isFullscreen = ref(false);
const animating = ref(false);
const showTraveler = ref(false);
const showPath = ref(false);
const showNewCommit = ref(false);
const travelerX = ref(470);

let raf = 0;
const timers: number[] = [];

function later(fn: () => void, ms: number) {
  timers.push(window.setTimeout(fn, ms));
}

function prefersReducedMotion() {
  return import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function resetPathStroke() {
  const el = mergePathEl.value;
  if (!el) return;
  el.style.transition = 'none';
  el.style.strokeDasharray = '';
  el.style.strokeDashoffset = '';
}

function clearAnim() {
  cancelAnimationFrame(raf);
  raf = 0;
  while (timers.length) {
    const id = timers.pop();
    if (id != null) clearTimeout(id);
  }
  showTraveler.value = false;
  showPath.value = false;
  showNewCommit.value = false;
  travelerX.value = 470;
  animating.value = false;
  resetPathStroke();
}

watch([fromEnv, toEnv], () => {
  clearAnim();
});

function drawPath(instant: boolean) {
  showPath.value = true;
  return nextTick(() => {
    const el = mergePathEl.value;
    if (!el) return;
    const len = el.getTotalLength();
    if (instant) {
      el.style.transition = 'none';
      el.style.strokeDasharray = String(len);
      el.style.strokeDashoffset = '0';
      return;
    }
    el.style.transition = 'none';
    el.style.strokeDasharray = String(len);
    el.style.strokeDashoffset = String(len);
    requestAnimationFrame(() => {
      el.style.transition = 'stroke-dashoffset 800ms cubic-bezier(.4, 0, .2, 1)';
      el.style.strokeDashoffset = '0';
    });
  });
}

function playMove() {
  if (sameBranch.value || animating.value) return;
  clearAnim();
  animating.value = true;

  if (prefersReducedMotion()) {
    showNewCommit.value = true;
    drawPath(true).then(() => {
      animating.value = false;
    });
    return;
  }

  showTraveler.value = true;
  travelerX.value = 470;
  const start = performance.now();

  function anim(ts: number) {
    const p = Math.min((ts - start) / 700, 1);
    travelerX.value = 470 + 60 * p;
    if (p < 1) {
      raf = requestAnimationFrame(anim);
      return;
    }
    showTraveler.value = false;
    drawPath(false);
    later(() => {
      showNewCommit.value = true;
      animating.value = false;
    }, 820);
  }

  raf = requestAnimationFrame(anim);
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

onMounted(() => {
  document.addEventListener('fullscreenchange', onFs);
});

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFs);
  clearAnim();
});
</script>

<template>
  <div
    ref="shellEl"
    class="gm"
    :class="{ 'is-fs': isFullscreen, 'is-light': isLight, 'is-dark': !isLight }"
    :data-mode="mode"
    aria-label="How moving code from X to Y works"
  >
    <header class="gm-header">
      <NuxtLink to="/insights/notes" class="gm-brand">MOVE THE CODE</NuxtLink>
      <div class="gm-meta">
        <NoteViews slug="git-move" class="gm-step" />
        <button type="button" class="gm-tool" @click="toggleFullscreen">
          <Minimize2 v-if="isFullscreen" :size="14" />
          <Maximize2 v-else :size="14" />
        </button>
        <InsightsReadingToggle />
      </div>
    </header>

    <div class="gm-body">
      <div class="gm-inner">
        <p class="gm-kicker">Build note</p>
        <h1>How “move the code from X to Y” works</h1>
        <p class="gm-lead">
          Each environment runs a git branch. “Moving” code is merging one branch into another.
          The five commands stay on this page — pick a move, read them all, then play the graph
          if you want to see the merge travel.
        </p>

        <div class="gm-pills" aria-label="Environment chain">
          <template v-for="(env, i) in envs" :key="env">
            <span
              class="gm-pill"
              :class="{ 'is-prod': env === 'Production' }"
            >{{ env }}</span>
            <span v-if="i < envs.length - 1" class="gm-arrow" aria-hidden="true">→</span>
          </template>
        </div>

        <div class="gm-map" aria-label="Which branch each environment runs">
          <div class="gm-map-row">
            <span>Dev + QA</span>
            <code>develop</code>
          </div>
          <div class="gm-map-row">
            <span>Staging + UAT</span>
            <code>staging</code>
          </div>
          <div class="gm-map-row">
            <span>Production</span>
            <code>main</code>
          </div>
        </div>

        <div class="gm-controls">
          <label class="gm-field">
            <span>Move from</span>
            <select v-model="fromEnv">
              <option v-for="env in envs" :key="`from-${env}`" :value="env">{{ env }}</option>
            </select>
          </label>
          <label class="gm-field">
            <span>to</span>
            <select v-model="toEnv">
              <option v-for="env in envs" :key="`to-${env}`" :value="env">{{ env }}</option>
            </select>
          </label>
          <button
            type="button"
            class="gm-run"
            :disabled="sameBranch || animating"
            @click="playMove"
          >
            Show the move
          </button>
        </div>

        <p v-if="sameBranch" class="gm-same">
          {{ fromEnv }} and {{ toEnv }} both run
          <code>{{ sourceBranch }}</code>, so no merge is needed — you just redeploy that
          branch to the {{ toEnv }} server. Ask your lead: “do I just trigger a redeploy of
          {{ sourceBranch }} to {{ toEnv }}?”
        </p>

        <svg
          class="gm-svg"
          viewBox="0 0 640 250"
          role="img"
          :aria-label="`${sourceBranch} merging into ${targetBranch}`"
        >
          <defs>
            <marker
              id="git-move-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" class="gm-marker" />
            </marker>
          </defs>

          <g>
            <text x="8" y="49" class="gm-lane-name">develop</text>
            <text x="8" y="65" class="gm-lane-sub">runs Dev + QA</text>
            <line x1="120" y1="45" x2="600" y2="45" class="gm-lane" />
            <circle cx="180" cy="45" r="5" class="gm-dot" />
            <circle cx="300" cy="45" r="5" class="gm-dot" />
          </g>
          <g>
            <text x="8" y="129" class="gm-lane-name">staging</text>
            <text x="8" y="145" class="gm-lane-sub">runs Staging + UAT</text>
            <line x1="120" y1="125" x2="600" y2="125" class="gm-lane" />
            <circle cx="220" cy="125" r="5" class="gm-dot" />
            <circle cx="360" cy="125" r="5" class="gm-dot" />
          </g>
          <g>
            <text x="8" y="209" class="gm-lane-name">main</text>
            <text x="8" y="225" class="gm-lane-sub">runs Production</text>
            <line x1="120" y1="205" x2="600" y2="205" class="gm-lane" />
            <circle cx="260" cy="205" r="5" class="gm-dot" />
            <circle cx="400" cy="205" r="5" class="gm-dot" />
          </g>

          <circle
            v-if="!sameBranch"
            :cx="470"
            :cy="branchY[sourceBranch]"
            r="6"
            class="gm-src"
          />
          <path
            v-show="showPath && !sameBranch"
            ref="mergePathEl"
            :d="mergePathD"
            class="gm-merge"
            marker-end="url(#git-move-arrow)"
          />
          <circle
            v-show="showTraveler"
            :cx="travelerX"
            :cy="branchY[sourceBranch]"
            r="6"
            class="gm-src"
          />
          <circle
            v-show="showNewCommit && !sameBranch"
            :cx="470"
            :cy="branchY[targetBranch]"
            r="6"
            class="gm-new"
          />
        </svg>

        <ol v-if="!sameBranch" class="gm-steps">
          <li v-for="step in steps" :key="step.n" class="gm-card">
            <div class="gm-card-top">
              <span class="gm-n">{{ step.n }}</span>
              <h2>{{ step.title }}</h2>
            </div>
            <p>{{ step.desc }}</p>
            <code v-if="step.code">{{ step.code }}</code>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gm {
  --bg: var(--ri-bg, #111111);
  --panel: var(--ri-surface, #1a1a1a);
  --text: var(--ri-ink, #ffffff);
  --muted: var(--ri-sub, #888888);
  --line: var(--ri-border, rgba(255, 255, 255, 0.12));
  --accent: #4a9eff;
  --ok: #2da44e;
  height: calc(100dvh - var(--insights-nav-offset, 4rem));
  display: flex;
  flex-direction: column;
  background: var(--bg);
  color: var(--text);
  overflow: hidden;
}
.gm.is-fs {
  height: 100dvh;
}
.gm.is-light {
  --bg: #f8f9fa;
  --panel: #ffffff;
  --text: #111111;
  --muted: #6b7280;
  --line: rgba(17, 24, 39, 0.12);
}
.gm.is-dark {
  --bg: #111111;
  --panel: #1a1a1a;
  --text: #ffffff;
  --muted: #888888;
  --line: rgba(255, 255, 255, 0.12);
}
.gm-header {
  min-height: 52px;
  border-bottom: 1px solid var(--line);
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 16px 0 20px;
  flex-shrink: 0;
}
.gm-brand {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 0.06em;
  color: var(--text);
  text-decoration: none;
}
.gm-meta {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}
.gm-step {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  color: var(--muted);
}
.gm-tool {
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--line);
  background: var(--panel);
  color: var(--text);
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-family: 'DM Mono', ui-monospace, monospace;
}
.gm-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
.gm-inner {
  width: 100%;
  max-width: 44rem;
  margin: 0 auto;
  padding: 28px 24px 56px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-sizing: border-box;
}
.gm-kicker {
  margin: 0;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);
}
.gm-inner h1 {
  margin: 0;
  font-size: 1.55rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.25;
}
.gm-lead {
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  color: var(--muted);
}
.gm-pills {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.gm-pill {
  padding: 4px 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
}
.gm-pill.is-prod {
  border-color: var(--text);
  font-weight: 600;
}
.gm-arrow {
  color: var(--muted);
}
.gm-map {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
}
.gm-map-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid var(--line);
  background: var(--panel);
  font-size: 13px;
}
.gm-map-row span {
  color: var(--muted);
  font-size: 12px;
}
.gm-map-row code,
.gm-card code,
.gm-same code {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 13px;
  color: var(--accent);
}
.gm-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 10px;
}
.gm-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: var(--muted);
}
.gm-field select {
  font: inherit;
  color: var(--text);
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 7px 10px;
}
.gm-run {
  font: inherit;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: var(--text);
  color: var(--bg);
  cursor: pointer;
}
.gm-run:disabled {
  opacity: 0.45;
  cursor: default;
}
.gm-same {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--muted);
  border: 1px dashed var(--line);
  border-radius: 10px;
  padding: 12px 14px;
}
.gm-svg {
  width: 100%;
  display: block;
}
.gm-lane-name {
  font-size: 13px;
  font-weight: 600;
  fill: var(--text);
}
.gm-lane-sub {
  font-size: 11px;
  fill: var(--muted);
}
.gm-lane {
  stroke: var(--line);
  stroke-width: 2;
}
.gm-dot {
  fill: var(--panel);
  stroke: var(--muted);
  stroke-width: 1.5;
}
.gm-src {
  fill: var(--accent);
}
.gm-new {
  fill: var(--ok);
}
.gm-merge {
  fill: none;
  stroke: var(--muted);
  stroke-width: 1.5;
  stroke-dasharray: 5 4;
}
.gm-marker {
  fill: var(--muted);
}
.gm-steps {
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.gm-card {
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 12px 16px;
  background: var(--panel);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.gm-card-top {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.gm-n {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 12px;
  color: var(--accent);
}
.gm-card h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}
.gm-card p {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: var(--muted);
}
.gm-card code {
  display: block;
  background: color-mix(in srgb, var(--text) 6%, var(--bg));
  color: var(--text);
  padding: 8px 12px;
  border-radius: 8px;
  overflow-x: auto;
  white-space: pre;
}
@media (max-width: 640px) {
  .gm-inner {
    padding: 20px 16px 40px;
  }
  .gm-inner h1 {
    font-size: 1.3rem;
  }
}
</style>
