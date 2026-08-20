import { computed, onMounted, onUnmounted, ref } from 'vue';

const STORAGE_PREFIX = 'publix-insights-split:';

export interface InsightsSplitOptions {
  /** Unique per page so widths don’t clash. */
  storageKey: string;
  defaultPct?: number;
  minPct?: number;
  maxPct?: number;
  /** Match the stacked layout breakpoint used by mf pages. */
  collapseBelow?: number;
}

/**
 * Draggable left/right split for Insights map+lesson shells.
 * Persists width in localStorage; disables itself under the mobile breakpoint.
 */
export function useInsightsSplit(options: InsightsSplitOptions) {
  const {
    storageKey,
    defaultPct = 42,
    minPct = 28,
    maxPct = 68,
    collapseBelow = 860,
  } = options;

  const bodyEl = ref<HTMLElement | null>(null);
  const leftPct = ref(defaultPct);
  const dragging = ref(false);
  const narrow = ref(false);
  /** When false, the right notes/lesson panel is hidden so the left can fill the row. */
  const rightOpen = ref(true);

  const leftStyle = computed(() => {
    if (narrow.value) return undefined;
    if (!rightOpen.value) {
      return {
        flex: '1 1 100%',
        width: '100%',
        maxWidth: 'none',
        minWidth: '0',
      } as Record<string, string>;
    }
    return {
      flex: `0 0 ${leftPct.value}%`,
      width: `${leftPct.value}%`,
      maxWidth: 'none',
      minWidth: '0',
    } as Record<string, string>;
  });

  function clamp(pct: number) {
    return Math.min(maxPct, Math.max(minPct, pct));
  }

  function persist() {
    if (!import.meta.client) return;
    localStorage.setItem(`${STORAGE_PREFIX}${storageKey}`, String(leftPct.value));
  }

  function persistRight() {
    if (!import.meta.client) return;
    localStorage.setItem(
      `${STORAGE_PREFIX}${storageKey}:right`,
      rightOpen.value ? '1' : '0',
    );
  }

  function readStored() {
    if (!import.meta.client) return;
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${storageKey}`);
    const n = raw == null ? NaN : Number(raw);
    if (Number.isFinite(n)) leftPct.value = clamp(n);
    const right = localStorage.getItem(`${STORAGE_PREFIX}${storageKey}:right`);
    if (right === '0') rightOpen.value = false;
    if (right === '1') rightOpen.value = true;
  }

  function setRightOpen(open: boolean) {
    rightOpen.value = open;
    persistRight();
  }

  function toggleRight() {
    setRightOpen(!rightOpen.value);
  }

  function setFromClientX(clientX: number) {
    const el = bodyEl.value;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    leftPct.value = clamp(((clientX - rect.left) / rect.width) * 100);
  }

  function onPointerMove(event: PointerEvent) {
    if (!dragging.value) return;
    setFromClientX(event.clientX);
  }

  function onPointerUp() {
    if (!dragging.value) return;
    dragging.value = false;
    persist();
    document.body.style.removeProperty('cursor');
    document.body.style.removeProperty('user-select');
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
  }

  function onHandlePointerDown(event: PointerEvent) {
    if (narrow.value || !rightOpen.value) return;
    if (event.button != null && event.button !== 0) return;
    event.preventDefault();
    dragging.value = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    setFromClientX(event.clientX);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }

  function onHandleKeydown(event: KeyboardEvent) {
    if (narrow.value || !rightOpen.value) return;
    const step = event.shiftKey ? 4 : 2;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      leftPct.value = clamp(leftPct.value - step);
      persist();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      leftPct.value = clamp(leftPct.value + step);
      persist();
    } else if (event.key === 'Home') {
      event.preventDefault();
      leftPct.value = minPct;
      persist();
    } else if (event.key === 'End') {
      event.preventDefault();
      leftPct.value = maxPct;
      persist();
    }
  }

  let media: MediaQueryList | null = null;
  function onMediaChange() {
    narrow.value = !!media?.matches;
  }

  onMounted(() => {
    readStored();
    if (!import.meta.client) return;
    media = window.matchMedia(`(max-width: ${collapseBelow}px)`);
    onMediaChange();
    media.addEventListener('change', onMediaChange);
  });

  onUnmounted(() => {
    onPointerUp();
    media?.removeEventListener('change', onMediaChange);
  });

  return {
    bodyEl,
    leftPct,
    leftStyle,
    dragging,
    narrow,
    rightOpen,
    setRightOpen,
    toggleRight,
    onHandlePointerDown,
    onHandleKeydown,
  };
}
