import { isBuildNoteSlug } from '~/data/buildNotes';
import { formatViewCount } from '~/utils/views';

type ViewsMap = Record<string, number>;
type AllViewsResponse = {
  views: ViewsMap;
  formatted: Record<string, string>;
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

function noteSlugFromPath(path: string) {
  const pathname = path.split('?')[0] ?? '';
  const match = pathname.match(/^\/insights\/notes\/([^/]+)$/);
  const slug = match?.[1];
  if (!slug || !isBuildNoteSlug(slug)) return null;
  return slug;
}

/**
 * Load all note view counts in the browser.
 * Avoids SSR/prerender baking an empty map into the payload — that made refresh
 * always show 0 while client navigations (with in-memory POST updates) looked fine.
 */
export function useAllNoteViews() {
  const counts = useViewCounts();
  const hydrated = useViewsHydrated();

  const { data, status } = useFetch<AllViewsResponse>('/api/views', {
    key: 'all-note-views',
    server: false,
    lazy: true,
    // Never reuse a stale/empty payload from a previous visit or prerender.
    getCachedData: () => undefined,
  });

  watch(
    data,
    (next) => {
      if (!next?.views) return;
      counts.value = { ...counts.value, ...next.views };
      hydrated.value = true;
    },
    { immediate: true },
  );

  watch(status, (next) => {
    if (next === 'success' || next === 'error') hydrated.value = true;
  });

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
      counts.value = { ...counts.value, [next.slug]: next.views };
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
