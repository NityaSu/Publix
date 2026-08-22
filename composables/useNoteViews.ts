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

function noteSlugFromPath(path: string) {
  const pathname = path.split('?')[0] ?? '';
  const match = pathname.match(/^\/insights\/notes\/([^/]+)$/);
  const slug = match?.[1];
  if (!slug || !isBuildNoteSlug(slug)) return null;
  return slug;
}

export function useAllNoteViews() {
  const counts = useViewCounts();
  const { data, status } = useFetch<AllViewsResponse>('/api/views', {
    key: 'all-note-views',
  });

  watch(
    data,
    (next) => {
      if (!next?.views) return;
      counts.value = { ...counts.value, ...next.views };
    },
    { immediate: true },
  );

  const ready = computed(
    () => status.value === 'success' || Object.keys(counts.value).length > 0,
  );

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
