import { isDraftNote } from '~/data/buildNotes';

const COOKIE_NAME = 'draft_access';

function draftSlugFromPath(path: string) {
  const pathname = path.split('?')[0] ?? '';
  const match = pathname.match(/^\/insights\/notes\/([^/]+)/);
  if (!match) return null;
  const slug = match[1];
  if (!slug || slug.startsWith('_')) return null;
  return slug;
}

export default defineEventHandler((event) => {
  const slug = draftSlugFromPath(event.path);
  if (!slug || !isDraftNote(slug)) return;

  const secret = String(useRuntimeConfig(event).draftSecret || '');
  if (!secret) {
    if (process.env.NODE_ENV !== 'production') return;
    throw createError({ statusCode: 404, statusMessage: 'Page not found' });
  }

  const query = getQuery(event);
  const queryKey = typeof query.key === 'string' ? query.key : '';
  const cookie = getCookie(event, COOKIE_NAME);

  if (queryKey === secret || cookie === secret) {
    if (queryKey === secret) {
      setCookie(event, COOKIE_NAME, secret, {
        maxAge: 60 * 60 * 24 * 90,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      });
    }
    return;
  }

  throw createError({ statusCode: 404, statusMessage: 'Page not found' });
});
