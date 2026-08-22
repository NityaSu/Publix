import { isBuildNoteSlug } from '~/data/buildNotes';
import { formatViewCount } from '~/utils/views';

export type ViewPayload = {
  slug: string;
  views: number;
  viewsFormatted: string;
};

export function viewPayload(slug: string, views: number): ViewPayload {
  return {
    slug,
    views,
    viewsFormatted: formatViewCount(views),
  };
}

export function assertNoteSlug(raw: string): string {
  const slug = raw.trim();
  if (!isBuildNoteSlug(slug)) {
    throw createError({ statusCode: 400, statusMessage: 'Unknown note' });
  }
  return slug;
}

export async function getViewCounts(): Promise<Record<string, number>> {
  try {
    const supabase = useSupabase();
    const { data, error } = await supabase.from('page_views').select('slug, views');
    if (error || !data) return {};
    return Object.fromEntries(
      data.map((row) => [String(row.slug), Number(row.views) || 0]),
    );
  } catch {
    return {};
  }
}

export async function getViewCount(slug: string): Promise<number> {
  try {
    const supabase = useSupabase();
    const { data, error } = await supabase
      .from('page_views')
      .select('views')
      .eq('slug', slug)
      .maybeSingle();
    if (error || !data) return 0;
    return Number(data.views) || 0;
  } catch {
    return 0;
  }
}

export async function incrementViewCount(slug: string): Promise<number> {
  try {
    const supabase = useSupabase();
    const { data, error } = await supabase.rpc('increment_page_view', {
      page_slug: slug,
    });
    if (error) {
      console.error('[views] increment failed', error.message);
      return getViewCount(slug);
    }
    return Number(data) || 0;
  } catch {
    return 0;
  }
}
