import { isBuildNoteSlug } from '~/data/buildNotes';
import { formatViewCount } from '~/utils/views';

/** Redis hash key — same shape as rauchg.com (`HINCRBY views <id> 1`). */
const VIEWS_HASH = 'views';

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

function asCount(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export async function getViewCounts(): Promise<Record<string, number>> {
  const redis = useRedis();
  if (!redis) return {};

  try {
    const all = await redis.hgetall<Record<string, string | number>>(VIEWS_HASH);
    if (!all) return {};
    return Object.fromEntries(
      Object.entries(all).map(([slug, value]) => [slug, asCount(value)]),
    );
  } catch (err) {
    console.error('[views] redis hgetall failed', err);
    return {};
  }
}

export async function getViewCount(slug: string): Promise<number> {
  const redis = useRedis();
  if (!redis) return 0;

  try {
    const value = await redis.hget<string | number>(VIEWS_HASH, slug);
    return asCount(value);
  } catch (err) {
    console.error('[views] redis hget failed', err);
    return 0;
  }
}

export async function incrementViewCount(slug: string): Promise<number> {
  const redis = useRedis();
  if (!redis) return 0;

  try {
    return asCount(await redis.hincrby(VIEWS_HASH, slug, 1));
  } catch (err) {
    console.error('[views] redis hincrby failed', err);
    return getViewCount(slug);
  }
}
