<script setup lang="ts">
import { Maximize2, Minimize2, PanelRightClose, PanelRightOpen } from 'lucide-vue-next';
import DockerConfigMaster from '~/component/DockerConfigMaster.vue';
import DockerQuestGame from '~/component/DockerQuestGame.vue';
import InsightsReadingToggle from '~/component/InsightsReadingToggle.vue';
import InsightsSplitHandle from '~/component/InsightsSplitHandle.vue';
import { useInsightsSplit } from '~/composables/useInsightsSplit';

type SectionId = 'recipe' | 'kitchen' | 'cookies' | 'quest' | 'master';

const DK = '/docker-lesson';

function icon(folder: 'icons' | 'boxes' | 'notes', file: string) {
  return `${DK}/${folder}/${file}`;
}

const icons = {
  whale: icon('icons', 'whale.svg'),
  recipe: icon('icons', 'recipe.svg'),
  cookie: icon('icons', 'cookie.svg'),
  bulb: icon('icons', 'bulb.svg'),
  arrow: icon('icons', 'arrow_right.svg'),
  package: icon('icons', 'package.svg'),
  flour: icon('icons', 'flour.svg'),
  butter: icon('icons', 'butter.svg'),
  chocolate: icon('icons', 'chocolate_chips.svg'),
  eggs: icon('icons', 'eggs.svg'),
  sugar: icon('icons', 'sugar.svg'),
  oven: icon('icons', 'oven.svg'),
  hubBox: icon('boxes', 'docker_hub_box_plain.svg'),
  kitchenBox: icon('boxes', 'docker_kitchen_box_plain.svg'),
  containerBox: icon('boxes', 'container_box_plain.svg'),
} as const;

interface LessonSection {
  id: SectionId;
  n: number;
  label: string;
  tabIcon: string;
  title: string;
  titleIcon: string;
  blurb: string;
  tip: string;
  gist: string;
  remember: string[];
  adult: { kid: string; docker: string; meaning: string };
}

const lessons: LessonSection[] = [
  {
    id: 'recipe',
    n: 1,
    label: 'Recipe',
    tabIcon: icons.recipe,
    title: 'Docker Image = A Recipe!',
    titleIcon: icons.recipe,
    blurb: 'Just like a cookie recipe tells you exactly what you need!',
    tip: 'A Docker Image is like this recipe — it’s a blueprint with all instructions, but you can’t eat it yet!',
    gist: 'An image is the packaged blueprint: app, deps, and steps. Same recipe → unlimited cookies. You cannot eat the recipe.',
    remember: [
      'Image = recipe. Not running yet.',
      'A Dockerfile is how you write the recipe.',
      'Pulling from Hub is borrowing a recipe from the library.',
    ],
    adult: {
      kid: 'Recipe',
      docker: 'image',
      meaning: 'Blueprint — packaged app + deps. Not running yet.',
    },
  },
  {
    id: 'kitchen',
    n: 2,
    label: 'Kitchen',
    tabIcon: icons.whale,
    title: 'Docker = The Magic Kitchen!',
    titleIcon: icons.whale,
    blurb: 'The special place where recipes come to life!',
    tip: 'Docker is like a super-smart kitchen robot that reads recipes and makes perfect cookies every time!',
    gist: 'Docker Engine is the kitchen. It reads an image and bakes a container the same way on your laptop, a server, or a teammate’s machine.',
    remember: [
      'Docker Hub = recipe library (registry).',
      'Docker Engine = the kitchen that runs images.',
      'Same kitchen tools → same cookie every time.',
    ],
    adult: {
      kid: 'Kitchen / Hub',
      docker: 'Docker Engine / registry',
      meaning: 'Runs images into containers; Hub is where recipes are shared.',
    },
  },
  {
    id: 'cookies',
    n: 3,
    label: 'Cookies',
    tabIcon: icons.cookie,
    title: 'Docker Container = The Cookie!',
    titleIcon: icons.cookie,
    blurb: 'The real, tasty thing you can actually eat!',
    tip: 'Containers are like cookies from the same recipe — they look the same but are separate! If one breaks, others are fine!',
    gist: 'A container is a live instance of an image. Bite one (crash it, delete it) and siblings stay fine — that isolation is why cages and sandboxes use Docker.',
    remember: [
      'Container = the cookie you can eat.',
      'One image → many containers.',
      'Isolation: one broken cookie does not ruin the tray.',
    ],
    adult: {
      kid: 'Cookie',
      docker: 'container',
      meaning: 'A live instance. Isolated from siblings.',
    },
  },
  {
    id: 'quest',
    n: 4,
    label: 'Quest',
    tabIcon: icons.package,
    title: 'Docker Quest — real configs',
    titleIcon: icons.package,
    blurb: 'Play five levels: match terms, fix docker run, order a Dockerfile, save DB data, wire compose DNS.',
    tip: 'Pick any level from the pills — you don’t have to play in order.',
    gist: 'A short game that teaches real docker run flags, Dockerfile layer order, volumes, and compose service DNS — the configs you’d write on a real project.',
    remember: [
      'Image / Container / Engine / Dockerfile map to recipe / cookie / kitchen / writing the recipe.',
      '`docker run` starts; port maps are host:container; volumes keep DB data alive.',
      'In compose, the service name is the hostname between containers.',
    ],
    adult: {
      kid: 'Quest levels',
      docker: 'run · Dockerfile · volumes · compose',
      meaning: 'Hands-on practice with production-shaped configs.',
    },
  },
  {
    id: 'master',
    n: 5,
    label: 'Master',
    tabIcon: icons.bulb,
    title: 'Docker Config Master — production stacks',
    titleIcon: icons.bulb,
    blurb: 'Harder configs: Redis, Postgres networks, healthchecks, multi-stage Dockerfiles, Nginx + .env.',
    tip: 'Pick any level from the pills — you don’t have to play in order.',
    gist: 'Practice real compose and Dockerfile patterns you’d ship: memory limits, named networks, healthchecks, multi-stage builds, restart policies, and service_healthy.',
    remember: [
      'Pin images (redis:7-alpine); map ports as host:container.',
      'Healthchecks + depends_on condition: service_healthy beat race conditions.',
      'Multi-stage: builder tools stay out of the slim runtime image.',
    ],
    adult: {
      kid: 'Master levels',
      docker: 'compose · healthcheck · multi-stage · prod',
      meaning: 'Copy-ready production config drills.',
    },
  },
];

const activeId = ref<SectionId>('recipe');
const isFullscreen = ref(false);
const shellEl = ref<HTMLElement | null>(null);
const lessonEl = ref<HTMLElement | null>(null);

const {
  bodyEl,
  leftPct,
  leftStyle,
  dragging,
  rightOpen,
  toggleRight,
  onHandlePointerDown,
  onHandleKeydown,
} = useInsightsSplit({ storageKey: 'docker-for-kids', defaultPct: 42 });

const active = computed(() => lessons.find((l) => l.id === activeId.value)!);
const activeIndex = computed(() => lessons.findIndex((l) => l.id === activeId.value));
const neighbors = computed(() => ({
  prev: activeIndex.value > 0 ? lessons[activeIndex.value - 1] : null,
  next: activeIndex.value < lessons.length - 1 ? lessons[activeIndex.value + 1] : null,
}));

const recipeItems = [
  { label: '2 cups flour', src: icons.flour },
  { label: '1 cup butter', src: icons.butter },
  { label: '1 cup chocolate chips', src: icons.chocolate },
  { label: '2 eggs', src: icons.eggs },
  { label: '1 cup sugar', src: icons.sugar },
  { label: 'Bake at 350°F', src: icons.oven },
] as const;

const flowSteps = [
  { src: icons.hubBox, term: 'Docker Hub', sub: 'Recipe Library' },
  { src: icons.kitchenBox, term: 'Docker', sub: 'Magic Kitchen', highlight: true },
  { src: icons.containerBox, term: 'Container', sub: 'Fresh Cookie!' },
] as const;

const cookies = ['Container 1', 'Container 2', 'Container 3', 'Container 4'] as const;

const summaryItems = [
  { id: 'recipe' as SectionId, src: icons.recipe, term: 'Image', sub: 'The Recipe' },
  { id: 'kitchen' as SectionId, src: icons.whale, term: 'Docker', sub: 'The Kitchen' },
  { id: 'cookies' as SectionId, src: icons.cookie, term: 'Container', sub: 'The Cookie' },
];

function selectLesson(id: SectionId) {
  activeId.value = id;
  if (import.meta.client) {
    history.replaceState(null, '', `#${id}`);
  }
  nextTick(() => {
    lessonEl.value?.scrollTo({ top: 0 });
  });
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

onMounted(() => {
  const hash = decodeURIComponent(window.location.hash.replace(/^#/, '')) as SectionId;
  if (lessons.some((l) => l.id === hash)) activeId.value = hash;
  document.addEventListener('fullscreenchange', onFullscreenChange);
});

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange);
});
</script>

<template>
  <div ref="shellEl" class="mf" :class="{ 'is-fs': isFullscreen }" aria-label="Docker kid version">
    <header class="mf-header">
      <NuxtLink to="/insights/notes" class="mf-brand">DOCKER IN KID VERSION</NuxtLink>
      <div class="mf-meta">
        <span class="mf-step">5 lessons</span>
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
        :style="leftStyle"
        aria-label="Cookie kitchen map"
      >
        <div class="mf-graph-head">
          <p class="mf-graph-title">Kitchen</p>
        </div>

        <div
          class="dk-stage"
          :class="{ 'is-quest': activeId === 'quest' || activeId === 'master' }"
        >
          <div class="dk-tabs dk-tabs-bar" role="tablist" aria-label="Docker analogy parts">
            <button
              v-for="lesson in lessons"
              :key="lesson.id"
              type="button"
              role="tab"
              class="dk-tab"
              :class="{
                'is-active': activeId === lesson.id,
                'is-on-dark': activeId === 'quest' || activeId === 'master',
              }"
              :aria-selected="activeId === lesson.id"
              :id="`dk-tab-${lesson.id}`"
              @click="selectLesson(lesson.id)"
            >
              <img :src="lesson.tabIcon" alt="" class="dk-tab-icon" width="18" height="18" />
              {{ lesson.label }}
            </button>
          </div>

          <DockerQuestGame v-if="activeId === 'quest'" />
          <DockerConfigMaster v-else-if="activeId === 'master'" />

          <div v-else class="dk" aria-label="Docker cookie analogy">
            <header class="dk-hero">
              <h2 class="dk-hero-title">
                <img :src="icons.whale" alt="" class="dk-hero-whale" width="40" height="40" />
                Docker for Kids!
              </h2>
              <p class="dk-hero-sub">
                Cookie analogy
                <img :src="icons.cookie" alt="" class="dk-inline-icon" width="18" height="18" />
              </p>
            </header>

            <div
              :id="`dk-panel-${active.id}`"
              role="tabpanel"
              class="dk-panel"
              :aria-labelledby="`dk-tab-${active.id}`"
            >
              <header class="dk-panel-head">
                <img :src="active.titleIcon" alt="" class="dk-panel-icon" width="32" height="32" />
                <div>
                  <h3 class="dk-panel-title">{{ active.title }}</h3>
                  <p class="dk-panel-blurb">{{ active.blurb }}</p>
                </div>
              </header>

              <div v-if="activeId === 'recipe'" class="dk-card">
                <p class="dk-card-label">
                  <img :src="icons.cookie" alt="" class="dk-inline-icon" width="18" height="18" />
                  Super Cookie Recipe
                </p>
                <ul class="dk-recipe" role="list">
                  <li v-for="item in recipeItems" :key="item.label" class="dk-recipe-item">
                    <img :src="item.src" alt="" class="dk-recipe-icon" width="24" height="24" />
                    <span>{{ item.label }}</span>
                  </li>
                </ul>
                <p class="dk-note">This recipe can make unlimited cookies!</p>
              </div>

              <div
                v-else-if="activeId === 'kitchen'"
                class="dk-flow"
                role="img"
                aria-label="Docker Hub to Docker to container"
              >
                <template v-for="(step, i) in flowSteps" :key="step.term">
                  <div class="dk-flow-box" :class="{ 'is-accent': 'highlight' in step && step.highlight }">
                    <img :src="step.src" :alt="step.term" class="dk-flow-art" width="72" height="72" />
                    <p class="dk-flow-term">{{ step.term }}</p>
                    <p class="dk-flow-sub">{{ step.sub }}</p>
                  </div>
                  <img
                    v-if="i < flowSteps.length - 1"
                    :src="icons.arrow"
                    alt=""
                    class="dk-arrow"
                    width="28"
                    height="28"
                  />
                </template>
              </div>

              <div v-else class="dk-card">
                <p class="dk-card-label">One Recipe → Many Cookies!</p>
                <ul class="dk-cookies" role="list">
                  <li
                    v-for="(cookie, i) in cookies"
                    :key="cookie"
                    class="dk-cookie"
                    :style="{ '--d': `${i * 0.12}s` }"
                  >
                    <img :src="icons.cookie" :alt="cookie" class="dk-cookie-art" width="40" height="40" />
                    <span class="dk-cookie-label">{{ cookie }}</span>
                  </li>
                </ul>
                <p class="dk-note">Each cookie is separate — if you bite one, the others are safe!</p>
              </div>

              <div class="dk-tip">
                <img :src="icons.bulb" alt="" class="dk-tip-icon" width="24" height="24" />
                <p>
                  <strong>Kid Tip:</strong>
                  {{ active.tip }}
                </p>
              </div>
            </div>

            <div class="dk-summary">
              <p class="dk-summary-label">Remember This!</p>
              <div class="dk-summary-grid">
                <button
                  v-for="item in summaryItems"
                  :key="item.term"
                  type="button"
                  class="dk-summary-item"
                  :class="{ 'is-on': activeId === item.id }"
                  @click="selectLesson(item.id)"
                >
                  <img :src="item.src" :alt="item.term" class="dk-summary-icon" width="32" height="32" />
                  <p class="dk-summary-term">{{ item.term }}</p>
                  <p class="dk-summary-sub">{{ item.sub }}</p>
                </button>
              </div>
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
        <article class="mf-page">
          <div class="mf-lesson-top">
            <p class="mf-kicker">
              Lesson {{ active.n.toString().padStart(2, '0') }}
              · {{ active.label }}
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
          <h1>{{ active.title }}</h1>
          <p class="mf-lead">{{ active.gist }}</p>

          <ul class="mf-bullets">
            <li v-for="line in active.remember" :key="line">{{ line }}</li>
          </ul>

          <section class="mf-block">
            <h2>Kid tip</h2>
            <div class="mf-kid">
              <p class="mf-kid-label">Kid version</p>
              <p>{{ active.tip }}</p>
            </div>
          </section>

          <section class="mf-block">
            <h2>Adult words, same picture</h2>
            <div class="mf-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Kid word</th>
                    <th>Docker word</th>
                    <th>What it is</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{{ active.adult.kid }}</td>
                    <td><code>{{ active.adult.docker }}</code></td>
                    <td>{{ active.adult.meaning }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-if="activeId === 'cookies'" class="mf-block">
            <h2>Where this shows up here</h2>
            <p>
              In
              <NuxtLink to="/insights/notes/supercage" class="mf-link-text">Building supercage</NuxtLink>,
              the “cage” is a throwaway cookie: a container baked from an image, with only the project
              workspace mounted. The host kitchen stays safe because the bite happens inside that cookie.
            </p>
          </section>

          <section v-if="activeId === 'quest'" class="mf-block">
            <h2>What you’ll practice</h2>
            <ul class="mf-bullets">
              <li><strong>Level 1</strong> — Match recipe/cookie/kitchen to Image / Container / Engine / Dockerfile.</li>
              <li><strong>Level 2</strong> — Fix a broken <code>docker run</code> (start vs create, <code>host:container</code> ports).</li>
              <li><strong>Level 3</strong> — Order Dockerfile layers for cache: FROM → RUN → COPY → CMD.</li>
              <li><strong>Level 4</strong> — Spot the missing volume before Postgres data disappears.</li>
              <li><strong>Level 5</strong> — Wire compose DNS: service name <code>db</code> is the hostname.</li>
            </ul>
            <div class="mf-callout">
              <p>Jump levels with the pills on the left — order is optional. Next only when you want it.</p>
            </div>
          </section>

          <section v-if="activeId === 'master'" class="mf-block">
            <h2>What you’ll configure</h2>
            <ul class="mf-bullets">
              <li><strong>Redis</strong> — pinned image, port map, memory + LRU eviction.</li>
              <li><strong>PG + Redis</strong> — env vars and a shared named network.</li>
              <li><strong>Health</strong> — <code>depends_on</code> + Postgres/Redis healthchecks.</li>
              <li><strong>Multi-stage</strong> — builder → slim runtime Dockerfile order.</li>
              <li><strong>Prod</strong> — Nginx proxy, <code>.env</code>, <code>unless-stopped</code>, <code>service_healthy</code>.</li>
            </ul>
            <div class="mf-callout">
              <p>Harder than Quest. Pick any level, then copy the fixed config into a real project.</p>
            </div>
          </section>

          <div class="mf-pager">
            <button
              v-if="neighbors.prev"
              type="button"
              @click="neighbors.prev && selectLesson(neighbors.prev.id)"
            >
              ← {{ neighbors.prev.n }}. {{ neighbors.prev.label }}
            </button>
            <span v-else />
            <button
              v-if="neighbors.next"
              type="button"
              @click="neighbors.next && selectLesson(neighbors.next.id)"
            >
              {{ neighbors.next.n }}. {{ neighbors.next.label }} →
            </button>
          </div>
        </article>
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
  text-decoration: none;
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
  cursor: pointer;
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

.mf-body.is-notes-closed :deep(.dq),
.mf-body.is-notes-closed :deep(.dcm) {
  max-width: min(56rem, 100%);
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
  overflow: auto;
}

.mf-graph-head {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  z-index: 10;
}

.mf-graph-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--mf-text);
}

.dk-stage {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px 24px;
  box-sizing: border-box;
  gap: 0.75rem;
}

.dk-stage.is-quest {
  justify-content: flex-start;
  padding-top: 40px;
  overflow: auto;
}

.dk-tabs-bar {
  width: 100%;
  max-width: 38rem;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  justify-content: center;
}

.dk-tabs-bar .dk-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-family: var(--dk-font, 'Space Grotesk', sans-serif);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--mf-text);
  border: 2px solid var(--mf-line);
  border-radius: 999px;
  background: color-mix(in srgb, var(--mf-panel) 80%, transparent);
  padding: 0.32rem 0.65rem;
  cursor: pointer;
}

.dk-tabs-bar .dk-tab.is-active {
  border-color: #4a9eff;
  color: #4a9eff;
  background: color-mix(in srgb, #4a9eff 12%, transparent);
}

.dk-tabs-bar .dk-tab.is-on-dark {
  color: var(--mf-text);
  border-color: var(--mf-line);
  background: color-mix(in srgb, var(--mf-panel) 80%, transparent);
}

.dk-tabs-bar .dk-tab.is-on-dark.is-active {
  border-color: #4a9eff;
  color: #4a9eff;
  background: color-mix(in srgb, #4a9eff 12%, transparent);
}

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

.mf-block {
  margin-top: 36px;
}

.mf-page h2 {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--mf-line);
}

.mf-page p {
  font-size: 15px;
  line-height: 1.75;
  margin: 0 0 10px;
}

.mf-bullets {
  margin: 16px 0 0;
  padding-left: 1.2rem;
}

.mf-bullets li {
  font-size: 15px;
  line-height: 1.7;
  margin-bottom: 6px;
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

.mf-callout {
  margin: 16px 0;
  padding: 14px 16px;
  border: 1px solid var(--mf-line);
  border-radius: 6px;
  background: var(--mf-graph);
}

.mf-callout p {
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
}

.mf-table-wrap {
  overflow-x: auto;
  margin: 12px 0;
}

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

.mf-page code {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.9em;
  color: #4a9eff;
}

.mf-link-text {
  color: #4a9eff;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.mf-pager {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 48px;
  padding-top: 20px;
  border-top: 1px solid var(--mf-line);
}

/* —— left visual card —— */
.dk {
  --dk-purple: #8b7cff;
  --dk-blue: #4a9eff;
  --dk-ink: #111111;
  --dk-muted: #444444;
  --dk-card: #ffffff;
  --dk-card-ink: #222222;
  --dk-card-muted: #666666;
  --dk-accent: var(--dk-blue);
  --dk-gold: #e6b800;
  --dk-font: 'Space Grotesk', 'Space Grotesk fallback', Helvetica Neue, Arial, sans-serif;
  --dk-mono: 'DM Mono', 'DM Mono fallback', ui-monospace, monospace;
  box-sizing: border-box;
  width: 100%;
  max-width: 38rem;
  border: 1px solid color-mix(in srgb, var(--dk-purple) 40%, var(--dk-blue));
  border-radius: 12px;
  background: linear-gradient(180deg, #8b7cff 0%, #4a9eff 48%, #ffffff 100%);
  padding: 0.85rem 0.75rem 0.8rem;
  color: var(--dk-ink);
  box-shadow: 0 8px 28px rgba(17, 17, 17, 0.12);
}

.dk-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 0.7rem;
}

.dk-hero-title {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  font-family: var(--dk-font);
  font-size: 1.15rem;
  font-weight: 800;
  line-height: 1.15;
  color: #ffffff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  margin: 0;
}

.dk-hero-whale {
  width: 1.6rem;
  height: 1.6rem;
  object-fit: contain;
}

.dk-hero-sub {
  margin: 0.35rem 0 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.95);
  width: 100%;
}

.dk-inline-icon {
  width: 0.95rem;
  height: 0.95rem;
  object-fit: contain;
}

.dk-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  justify-content: center;
  margin-bottom: 0.7rem;
}

.dk-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-family: var(--dk-font);
  font-size: 0.72rem;
  font-weight: 700;
  color: #ffffff;
  border: 2px solid rgba(255, 255, 255, 0.85);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  padding: 0.32rem 0.65rem;
  cursor: pointer;
}

.dk-tab.is-active {
  background: rgba(255, 255, 255, 0.55);
  color: #1a1a1a;
}

.dk-tab-icon {
  width: 0.95rem;
  height: 0.95rem;
  object-fit: contain;
}

.dk-panel {
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  padding: 0.65rem 0.6rem 0.7rem;
}

.dk-panel-head {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  margin-bottom: 0.55rem;
}

.dk-panel-icon {
  width: 1.5rem;
  height: 1.5rem;
  object-fit: contain;
  flex-shrink: 0;
}

.dk-panel-title {
  font-family: var(--dk-font);
  font-size: 0.88rem;
  font-weight: 700;
  line-height: 1.25;
  margin: 0;
}

.dk-panel-blurb {
  margin-top: 0.15rem;
  font-size: 0.7rem;
  line-height: 1.4;
  color: var(--dk-muted);
}

.dk-card {
  background: var(--dk-card);
  color: var(--dk-card-ink);
  border-radius: 10px;
  padding: 0.6rem 0.65rem 0.7rem;
  box-shadow: 0 2px 10px rgba(17, 17, 17, 0.08);
}

.dk-card-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-family: var(--dk-font);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--dk-purple);
  margin-bottom: 0.5rem;
  text-align: center;
}

.dk-recipe {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.dk-recipe-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 0.35rem 0.4rem;
  font-size: 0.68rem;
  text-align: center;
}

.dk-recipe-icon {
  width: 1.1rem;
  height: 1.1rem;
  object-fit: contain;
  flex-shrink: 0;
}

.dk-note {
  margin-top: 0.5rem;
  text-align: center;
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.4;
  color: var(--dk-accent);
}

.dk-flow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.3rem 0.35rem;
}

.dk-flow-box {
  width: 5.75rem;
  background: var(--dk-card);
  color: var(--dk-card-ink);
  border-radius: 10px;
  padding: 0.45rem 0.3rem 0.5rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(17, 17, 17, 0.08);
}

.dk-flow-box.is-accent {
  border: 2px solid var(--dk-accent);
}

.dk-flow-art {
  width: 2.75rem;
  height: 2.75rem;
  object-fit: contain;
  margin: 0 auto 0.2rem;
  display: block;
}

.dk-flow-term {
  font-family: var(--dk-font);
  font-weight: 700;
  color: var(--dk-purple);
  font-size: 0.72rem;
}

.dk-flow-sub {
  margin-top: 0.1rem;
  font-size: 0.62rem;
  color: var(--dk-card-muted);
}

.dk-arrow {
  width: 1.25rem;
  height: 1.25rem;
  object-fit: contain;
  flex-shrink: 0;
}

.dk-cookies {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.55rem 0.85rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.dk-cookie {
  display: grid;
  justify-items: center;
  gap: 0.2rem;
}

.dk-cookie-art {
  width: 2rem;
  height: 2rem;
  object-fit: contain;
  animation: dk-bob 1.1s ease-in-out infinite;
  animation-delay: var(--d, 0s);
}

.dk-cookie-label {
  font-family: var(--dk-mono);
  font-size: 9px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--dk-card-muted);
}

.dk-tip {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  margin-top: 0.55rem;
  background: color-mix(in srgb, var(--dk-gold) 16%, #ffffff);
  border: 1.5px solid var(--dk-gold);
  border-radius: 10px;
  padding: 0.5rem 0.55rem;
  font-size: 0.7rem;
  line-height: 1.4;
}

.dk-tip-icon {
  width: 1.1rem;
  height: 1.1rem;
  object-fit: contain;
  flex-shrink: 0;
}

.dk-summary {
  margin-top: 0.7rem;
  padding: 0.6rem 0.5rem 0.55rem;
  border: 1.5px dashed color-mix(in srgb, var(--dk-blue) 45%, #111111);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.72);
}

.dk-summary-label {
  font-family: var(--dk-font);
  font-size: 0.78rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.45rem;
}

.dk-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.3rem;
}

.dk-summary-item {
  background: color-mix(in srgb, var(--dk-blue) 8%, #ffffff);
  border: 1px solid color-mix(in srgb, var(--dk-purple) 18%, transparent);
  border-radius: 8px;
  padding: 0.45rem 0.25rem;
  text-align: center;
  cursor: pointer;
}

.dk-summary-item.is-on {
  border-color: var(--dk-blue);
  box-shadow: 0 0 0 1px var(--dk-blue);
}

.dk-summary-icon {
  width: 1.4rem;
  height: 1.4rem;
  object-fit: contain;
  margin: 0 auto 0.2rem;
  display: block;
}

.dk-summary-term {
  font-family: var(--dk-font);
  font-weight: 700;
  font-size: 0.72rem;
  margin: 0;
}

.dk-summary-sub {
  margin: 0.1rem 0 0;
  font-size: 0.6rem;
  color: var(--dk-muted);
}

@keyframes dk-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

@media (max-width: 860px) {
  .mf-body {
    flex-direction: column;
  }

  .mf-graph {
    width: 100% !important;
    flex: 0 0 46vh !important;
    min-height: 260px;
    border-bottom: 1px solid var(--mf-line);
  }

  .mf-lesson {
    flex: 1 1 auto;
  }

  .dk-stage {
    padding: 40px 12px 16px;
  }

  .mf-page h1 {
    font-size: 28px;
  }
}

@media (max-width: 600px) {
  .dk-recipe {
    grid-template-columns: 1fr;
  }

  .dk-flow {
    flex-direction: column;
  }

  .dk-arrow {
    transform: rotate(90deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .dk-cookie-art {
    animation: none;
  }
}
</style>
