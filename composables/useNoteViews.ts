import { isBuildNoteSlug } from '~/data/buildNotes';
import { formatViewCount } from '~/utils/views';
import type { Ref } from 'vue';

type ViewsMap = Record<string, number>;
type AllViewsResponse = {
  views: ViewsMap;
  formatted?: Record<string, string>;
};
type ViewPayload = {
  slug: string;
  views: number;
  viewsFormatted: string;
};

function useViewCounts() {
  return useState<ViewsMap>('note-views', () => ({}));
}

function useViewsHydrated() {
  return useState<boolean>('note-views-hydrated', () => false);
}

/** Shared in-flight load so every NoteViews on the list shares one request. */
let loadPromise: Promise<void> | null = null;

function noteSlugFromPath(path: string) {
  const pathname = path.split('?')[0] ?? '';
  const match = pathname.match(/^\/insights\/notes\/([^/]+)$/);
  const slug = match?.[1];
  if (!slug || !isBuildNoteSlug(slug)) return null;
  return slug;
}

function mergeViews(into: ViewsMap, next: ViewsMap) {
  return { ...into, ...next };
}

async function fetchAllViews(
  counts: Ref<ViewsMap>,
  hydrated: Ref<boolean>,
) {
  try {
    const next = await $fetch<AllViewsResponse>('/api/views');
    if (next?.views) {
      counts.value = mergeViews(counts.value, next.views);
    }
  } catch (err) {
    console.error('[views] client fetch failed', err);
  } finally {
    hydrated.value = true;
    loadPromise = null;
  }
}

function ensureViewsLoaded(
  counts: Ref<ViewsMap>,
  hydrated: Ref<boolean>,
) {
  if (!import.meta.client || hydrated.value || loadPromise) return;
  loadPromise = fetchAllViews(counts, hydrated);
}

/**
 * Load all note view counts in the browser (once).
 * The notes index only GETs — it never POSTs — so this must succeed
 * or refresh always looks like 0.
 */
export function useAllNoteViews() {
  const counts = useViewCounts();
  const hydrated = useViewsHydrated();

  ensureViewsLoaded(counts, hydrated);
  onMounted(() => ensureViewsLoaded(counts, hydrated));

  const ready = computed(() => hydrated.value);

  return { counts, ready };
}

export function useNoteViews(slug: MaybeRef<string>) {
  const { counts, ready } = useAllNoteViews();
  const key = computed(() => unref(slug));
  const views = computed(() => counts.value[key.value] ?? 0);
  const viewsFormatted = computed(() => formatViewCount(views.value));

  return { views, viewsFormatted, ready };
}

/**
 * Record one page view for the current Build note (production only).
 * Mirrors rauchg.com: the browser pings after mount so crawlers don't inflate.
 */
export function useRecordNoteView() {
  const route = useRoute();
  const counts = useViewCounts();
  const hydrated = useViewsHydrated();
  const lastSlug = ref('');

  async function record(slug: string) {
    if (import.meta.dev || !import.meta.client) return;
    if (slug === lastSlug.value) return;
    lastSlug.value = slug;
    try {
      const next = await $fetch<ViewPayload>(`/api/views/${slug}`, {
        method: 'POST',
      });
      counts.value = mergeViews(counts.value, { [next.slug]: next.views });
      hydrated.value = true;
    } catch {
      lastSlug.value = '';
    }
  }

  watch(
    () => route.path,
    (path) => {
      const slug = noteSlugFromPath(path);
      if (slug) void record(slug);
    },
    { immediate: true },
  );
}
