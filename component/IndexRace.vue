<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import {
  clampIndexId,
  indexBranches,
  indexLeaves,
  indexRoot,
  indexSeekPath,
  indexUsers,
  shuffleIndexUsers,
  type IndexUser,
} from '~/data/databaseLab';

const SCAN_MS = 180;
const SEEK_MS = 250;
const ROW_H = 28;

const searchRaw = ref('17');
const heap = ref<IndexUser[]>([...indexUsers]);
const racing = ref(false);
const resultReady = ref(false);
const scanIndex = ref(-1);
const scanFound = ref(-1);
const scanChecks = ref(0);
const seekPath = ref<string[]>([]);
const seekChecks = ref(0);
const seekFound = ref(false);
const listEl = ref<HTMLElement | null>(null);

let raceGen = 0;
const timers: number[] = [];

const targetId = computed(() => clampIndexId(Number(searchRaw.value)));
const foundUser = computed(() => indexUsers.find((user) => user.id === targetId.value) ?? null);
const ratio = computed(() => {
  if (!seekChecks.value) return '0.0';
  return (scanChecks.value / seekChecks.value).toFixed(1);
});
const resultLine = computed(() => {
  const name = foundUser.value?.name ?? `id ${targetId.value}`;
  return `Table scan checked ${scanChecks.value} rows to find ${name}. Index seek checked ${seekChecks.value} nodes.`;
});

function leavesFor(branchId: string) {
  return indexLeaves.filter((leaf) => leaf.parent === branchId);
}

function nodeOn(id: string) {
  return seekPath.value.includes(id);
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    timers.push(window.setTimeout(resolve, ms));
  });
}

function clearTimers() {
  for (const id of timers) window.clearTimeout(id);
  timers.length = 0;
}

async function scrollScan(index: number) {
  await nextTick();
  const row = listEl.value?.querySelector<HTMLElement>(`[data-i="${index}"]`);
  row?.scrollIntoView({ block: 'nearest' });
}

async function runScan(target: number, gen: number) {
  for (let i = 0; i < heap.value.length; i += 1) {
    if (gen !== raceGen) return;
    scanIndex.value = i;
    scanChecks.value = i + 1;
    await scrollScan(i);
    await wait(SCAN_MS);
    if (heap.value[i]?.id === target) {
      scanFound.value = i;
      return;
    }
  }
}

async function runSeek(target: number, gen: number) {
  const path = indexSeekPath(target);
  for (let i = 0; i < path.length; i += 1) {
    if (gen !== raceGen) return;
    seekPath.value = path.slice(0, i + 1);
    seekChecks.value = i + 1;
    await wait(SEEK_MS);
  }
  seekFound.value = true;
}

function resetBoard() {
  raceGen += 1;
  clearTimers();
  racing.value = false;
  resultReady.value = false;
  scanIndex.value = -1;
  scanFound.value = -1;
  scanChecks.value = 0;
  seekPath.value = [];
  seekChecks.value = 0;
  seekFound.value = false;
  heap.value = shuffleIndexUsers();
}

async function startRace() {
  if (racing.value) return;
  const target = targetId.value;
  searchRaw.value = String(target);
  const gen = ++raceGen;
  clearTimers();
  racing.value = true;
  resultReady.value = false;
  scanIndex.value = -1;
  scanFound.value = -1;
  scanChecks.value = 0;
  seekPath.value = [];
  seekChecks.value = 0;
  seekFound.value = false;
  heap.value = shuffleIndexUsers();
  await nextTick();
  listEl.value?.scrollTo({ top: 0 });

  await Promise.all([runScan(target, gen), runSeek(target, gen)]);
  if (gen !== raceGen) return;
  racing.value = false;
  resultReady.value = true;
}

onMounted(() => {
  heap.value = shuffleIndexUsers();
});

onUnmounted(() => {
  raceGen += 1;
  clearTimers();
});

defineExpose({ resetBoard });
</script>

<template>
  <div class="idx-race">
    <form class="idx-controls" @submit.prevent="startRace">
      <label class="idx-label" for="idx-search">Find user id</label>
      <input
        id="idx-search"
        v-model="searchRaw"
        class="idx-input"
        type="number"
        min="1"
        max="20"
        step="1"
        :disabled="racing"
        aria-label="User id from 1 to 20"
      />
      <button class="idx-race-btn" type="submit" :disabled="racing">
        {{ racing ? 'Racing…' : 'Race!' }}
      </button>
    </form>

    <div class="idx-cards">
      <article class="idx-card is-scan">
        <header class="idx-card-head">
          <span>Table scan (no index)</span>
          <span class="idx-count">{{ scanChecks }} checks</span>
        </header>
        <div ref="listEl" class="idx-scan-list">
          <div
            class="idx-scanner"
            :class="{ show: scanIndex >= 0 && scanFound < 0 }"
            :style="{ transform: `translateY(${Math.max(0, scanIndex) * ROW_H}px)` }"
          />
          <div
            v-for="(row, index) in heap"
            :key="`${row.id}-${index}`"
            class="idx-scan-row"
            :data-i="index"
            :class="{
              checking: index === scanIndex && scanFound !== index,
              found: index === scanFound,
            }"
          >
            <span class="idx-id">{{ row.id }}</span>
            <span>{{ row.name }}</span>
          </div>
        </div>
      </article>

      <article class="idx-card is-seek">
        <header class="idx-card-head">
          <span>Index seek (B-tree)</span>
          <span class="idx-count">{{ seekChecks }} checks</span>
        </header>
        <div class="idx-tree">
          <div
            class="idx-node is-root"
            :class="{ on: nodeOn(indexRoot.id), found: seekFound }"
          >
            {{ indexRoot.label }}
          </div>
          <div class="idx-stem" aria-hidden="true" />
          <div class="idx-cols">
            <div v-for="branch in indexBranches" :key="branch.id" class="idx-col">
              <div
                class="idx-node is-branch"
                :class="{ on: nodeOn(branch.id), found: seekFound && nodeOn(branch.id) }"
              >
                {{ branch.label }}
              </div>
              <div class="idx-stem is-short" aria-hidden="true" />
              <div class="idx-leaf-row">
                <div
                  v-for="leaf in leavesFor(branch.id)"
                  :key="leaf.id"
                  class="idx-node is-leaf"
                  :class="{ on: nodeOn(leaf.id), found: seekFound && nodeOn(leaf.id) }"
                >
                  <span
                    v-for="id in leaf.ids"
                    :key="id"
                    class="idx-chip"
                    :class="{ hit: seekFound && id === targetId }"
                  >
                    {{ id }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div class="idx-banner" :class="{ show: resultReady }">
      <p class="idx-faster">{{ ratio }}× faster</p>
      <p>{{ resultLine }}</p>
    </div>
  </div>
</template>

<style scoped>
.idx-race {
  --idx-scan: #3b82f6;
  --idx-seek: #10b981;
  --idx-magenta: #d946ef;
  --idx-navy: #0f0f1a;
  width: 640px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.idx-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.idx-label {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--mf-muted);
}

.idx-input {
  width: 72px;
  height: 36px;
  border: 1px solid var(--mf-line);
  border-radius: 8px;
  background: var(--mf-graph);
  color: var(--mf-text);
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.idx-input:focus {
  outline: 2px solid color-mix(in srgb, var(--idx-magenta) 55%, transparent);
  outline-offset: 1px;
}

.idx-race-btn {
  height: 36px;
  padding: 0 18px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(90deg, #8b7cff, var(--idx-magenta));
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
}

.idx-race-btn:hover:not(:disabled) {
  filter: brightness(1.06);
}

.idx-race-btn:disabled {
  opacity: 0.65;
  cursor: wait;
}

.idx-cards {
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: 12px;
  align-items: stretch;
}

.idx-card {
  border: 1px solid var(--mf-line);
  border-radius: 10px;
  overflow: hidden;
  background: var(--mf-panel);
  min-width: 0;
}

.idx-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--idx-navy);
  color: #f8f8ff;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.idx-card.is-scan .idx-count {
  color: #93c5fd;
}

.idx-card.is-seek .idx-count {
  color: #6ee7b7;
}

.idx-scan-list {
  position: relative;
  height: 280px;
  overflow: auto;
}

.idx-scanner {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 28px;
  background: color-mix(in srgb, var(--idx-scan) 22%, transparent);
  border-left: 3px solid var(--idx-scan);
  pointer-events: none;
  opacity: 0;
  transition: transform 0.16s linear, opacity 0.12s ease;
  z-index: 1;
}

.idx-scanner.show {
  opacity: 1;
}

.idx-scan-row {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 28px;
  padding: 0 12px;
  font-size: 13px;
  color: var(--mf-text);
  border-bottom: 1px solid color-mix(in srgb, var(--mf-line) 70%, transparent);
}

.idx-scan-row.checking {
  background: color-mix(in srgb, var(--idx-scan) 16%, transparent);
  color: var(--idx-scan);
  font-weight: 600;
}

.idx-scan-row.found {
  background: color-mix(in srgb, var(--idx-seek) 22%, transparent);
  color: var(--idx-seek);
  font-weight: 700;
}

.idx-id {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  width: 24px;
  color: var(--mf-muted);
}

.idx-scan-row.checking .idx-id,
.idx-scan-row.found .idx-id {
  color: inherit;
}

.idx-tree {
  padding: 12px 10px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 280px;
}

.idx-stem {
  width: 1px;
  height: 12px;
  background: var(--mf-line);
}

.idx-stem.is-short {
  height: 8px;
}

.idx-cols {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  width: 100%;
}

.idx-col {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.idx-leaf-row {
  display: flex;
  gap: 4px;
  width: 100%;
  justify-content: center;
}

.idx-node {
  border: 1px solid var(--mf-line);
  border-radius: 6px;
  background: var(--mf-graph);
  color: var(--mf-muted);
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.02em;
  text-align: center;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.idx-node.is-root {
  padding: 8px 14px;
  font-size: 11px;
  font-weight: 600;
}

.idx-node.is-branch {
  padding: 7px 6px;
  width: 100%;
}

.idx-node.is-leaf {
  padding: 6px 4px;
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2px;
}

.idx-node.on {
  border-color: var(--idx-seek);
  background: color-mix(in srgb, var(--idx-seek) 16%, var(--mf-panel));
  color: var(--idx-seek);
  font-weight: 700;
}

.idx-node.found {
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--idx-seek) 50%, transparent);
}

.idx-chip {
  display: inline-block;
  min-width: 14px;
}

.idx-chip.hit {
  color: var(--idx-seek);
  font-weight: 800;
}

.idx-banner {
  border: 1px solid var(--mf-line);
  border-radius: 10px;
  padding: 12px 14px;
  background: color-mix(in srgb, var(--idx-seek) 10%, var(--mf-graph));
  opacity: 0;
  transform: translateY(6px);
  pointer-events: none;
  min-height: 58px;
}

.idx-banner.show {
  opacity: 1;
  transform: none;
  pointer-events: auto;
}

.idx-faster {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--idx-seek);
}

.idx-banner p:last-child {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--mf-muted);
}

@media (max-width: 860px) {
  .idx-race {
    width: 100%;
  }

  .idx-cards {
    grid-template-columns: 1fr;
  }

  .idx-scan-list,
  .idx-tree {
    min-height: 220px;
    height: auto;
  }

  .idx-scan-list {
    height: 220px;
  }
}
</style>
