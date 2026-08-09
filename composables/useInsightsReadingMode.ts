import { computed, onMounted, ref, watch } from 'vue';

export type InsightsReadingMode = 'dark' | 'light';

const STORAGE_KEY = 'publix-insights-reading-mode';

/** Shared across all Insights pages (module singleton). */
const mode = ref<InsightsReadingMode>('dark');
const ready = ref(false);
let initialized = false;

function readStored(): InsightsReadingMode {
  if (import.meta.client) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  }
  return 'dark';
}

function ensureInitialized() {
  if (initialized || !import.meta.client) return;
  initialized = true;
  mode.value = readStored();
  ready.value = true;
  watch(mode, (next) => {
    localStorage.setItem(STORAGE_KEY, next);
  });
}

/**
 * Insights-only reading mode (light/dark). Does not affect the rest of the site.
 */
export function useInsightsReadingMode() {
  onMounted(() => {
    ensureInitialized();
  });

  const isLight = computed(() => mode.value === 'light');

  function toggle() {
    mode.value = mode.value === 'light' ? 'dark' : 'light';
  }

  function setMode(next: InsightsReadingMode) {
    mode.value = next;
  }

  return {
    mode,
    isLight,
    ready,
    toggle,
    setMode,
  };
}
