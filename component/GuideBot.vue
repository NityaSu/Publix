<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import { X } from 'lucide-vue-next';
import ProjectBot from '~/component/ProjectBot.vue';
import { projects } from '~/data/projects';
import { noteBySlug, buildNotePath } from '~/data/buildNotes';

const PRIORITY_PROJECT_IDS = ['botcab', 'supersynapse', 'autowallet'] as const;
const PRIORITY_NOTE_SLUGS = ['backend-from-first-principle', 'supercage'] as const;

const route = useRoute();
const open = ref(false);
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

const currentNoteSlug = computed(() => {
  const match = route.path.match(/\/insights\/notes\/([^/]+)/);
  return match?.[1] ?? '';
});

const onProjects = computed(() => route.path.startsWith('/projects'));

const projectPicks = computed(() =>
  PRIORITY_PROJECT_IDS.map((id) => projects.find((p) => p.id === id)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  ),
);

const notePicks = computed(() =>
  PRIORITY_NOTE_SLUGS.filter((slug) => slug !== currentNoteSlug.value)
    .map((slug) => noteBySlug(slug))
    .filter((n): n is NonNullable<typeof n> => Boolean(n)),
);

/** On Projects, push writing first. Everywhere else, Projects first. */
const writingFirst = computed(() => onProjects.value);

const close = () => {
  open.value = false;
};

const toggle = () => {
  open.value = !open.value;
};

const onEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') close();
};

watch(open, (isOpen) => {
  if (!import.meta.client) return;
  if (isOpen) window.addEventListener('keydown', onEscape);
  else window.removeEventListener('keydown', onEscape);
});

watch(
  () => route.path,
  () => close(),
);

onUnmounted(() => {
  if (!import.meta.client) return;
  window.removeEventListener('keydown', onEscape);
});
</script>

<template>
  <div
    class="guide-bot"
    :class="{ 'is-open': open, 'is-reduced': prefersReducedMotion }"
  >
    <div v-if="open" class="guide-panel" role="dialog" aria-labelledby="guide-title">
      <div class="guide-panel-head">
        <p id="guide-title" class="guide-panel-title">What to view next</p>
        <button type="button" class="guide-close" aria-label="Close" @click="close">
          <X :size="14" />
        </button>
      </div>
      <p class="guide-lead">
        These five first: BotCab, Supersynapse, AutoWallet, Backend From First Principle, and supercage.
      </p>

      <template v-if="!writingFirst">
        <p class="guide-label">Projects</p>
        <NuxtLink
          v-for="project in projectPicks"
          :key="project.id"
          :to="`/projects#${project.id}`"
          class="guide-link"
          @click="close"
        >
          <span class="guide-link-title">{{ project.title }}</span>
          <span class="guide-link-sub">{{ project.tagline }}</span>
        </NuxtLink>

        <p class="guide-label">Writing</p>
        <NuxtLink
          v-for="note in notePicks"
          :key="note.slug"
          :to="buildNotePath(note.slug)"
          class="guide-link"
          @click="close"
        >
          <span class="guide-link-title">{{ note.title }}</span>
          <span class="guide-link-sub">{{ note.summary }}</span>
        </NuxtLink>
      </template>
      <template v-else>
        <p class="guide-label">Writing</p>
        <NuxtLink
          v-for="note in notePicks"
          :key="note.slug"
          :to="buildNotePath(note.slug)"
          class="guide-link"
          @click="close"
        >
          <span class="guide-link-title">{{ note.title }}</span>
          <span class="guide-link-sub">{{ note.summary }}</span>
        </NuxtLink>

        <p class="guide-label">Projects</p>
        <NuxtLink
          v-for="project in projectPicks"
          :key="project.id"
          :to="`/projects#${project.id}`"
          class="guide-link"
          @click="close"
        >
          <span class="guide-link-title">{{ project.title }}</span>
          <span class="guide-link-sub">{{ project.tagline }}</span>
        </NuxtLink>
      </template>
    </div>

    <button
      v-show="!open"
      type="button"
      class="guide-hint"
      @click="toggle"
    >
      Click here
      <span>What to view next</span>
    </button>

    <button
      type="button"
      class="guide-fab"
      :aria-label="open ? 'Close guide' : 'Click here for what to view next'"
      :aria-expanded="open"
      @click="toggle"
    >
      <ProjectBot size="sm" version="v1" />
    </button>
  </div>
</template>

<style scoped>
.guide-bot {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 40;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  pointer-events: none;
}

.guide-bot:not(.is-reduced) {
  animation: guide-fly 7s ease-in-out infinite;
}

.guide-fab,
.guide-hint,
.guide-panel,
.guide-close {
  pointer-events: auto;
}

.guide-fab {
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  filter: drop-shadow(0 8px 18px rgba(58, 123, 213, 0.45));
}

.guide-hint {
  max-width: 180px;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: #151515;
  color: #4a9eff;
  font-size: 12px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}

.guide-hint span {
  display: block;
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.55);
  font-size: 11px;
  font-weight: 500;
  line-height: 1.35;
}

.guide-panel {
  width: min(calc(100vw - 32px), 300px);
  max-height: min(70vh, 420px);
  overflow: auto;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: #151515;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
}

.guide-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.guide-panel-title {
  margin: 0;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
}

.guide-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
}

.guide-close:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.guide-lead {
  margin: 8px 0 12px;
  color: rgba(255, 255, 255, 0.55);
  font-size: 12px;
  line-height: 1.45;
}

.guide-label {
  margin: 12px 0 6px;
  color: #4a9eff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.guide-label:first-of-type {
  margin-top: 0;
}

.guide-link {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 6px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  text-decoration: none;
}

.guide-link:hover {
  background: rgba(74, 158, 255, 0.12);
}

.guide-link-title {
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}

.guide-link-sub {
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@keyframes guide-fly {
  0%,
  100% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(-10px, -14px);
  }
  50% {
    transform: translate(6px, -8px);
  }
  75% {
    transform: translate(-6px, -16px);
  }
}

@media (min-width: 768px) {
  .guide-bot {
    right: 24px;
    bottom: 24px;
  }
}
</style>
