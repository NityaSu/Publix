import { Readable } from 'node:stream';

const SLUG_PATTERN = /^[a-zA-Z0-9_-]+$/;

function parseSlug(raw: string): string {
  const slug = raw.replace(/\.mp3$/i, '');
  if (!SLUG_PATTERN.test(slug)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid slug' });
  }
  return slug;
}

export default defineEventHandler(async (event) => {
  const slug = parseSlug(getRouterParam(event, 'slug') ?? '');
  const config = useRuntimeConfig();
  const url = audioStorageUrl(slug);
  const rangeHeader = getRequestHeader(event, 'range');

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.supabaseKey}`,
      ...(rangeHeader ? { Range: rangeHeader } : {}),
    },
  });

  if (response.status === 404 || response.status === 400) {
    throw createError({ statusCode: 404, statusMessage: 'Audio not found' });
  }

  if (!response.ok || !response.body) {
    throw createError({
      statusCode: response.status === 404 ? 404 : 502,
      statusMessage:
        response.status === 404 ? 'Audio not found' : 'Failed to fetch audio',
    });
  }

  const contentLength = response.headers.get('content-length');
  const contentRange = response.headers.get('content-range');

  setResponseStatus(event, response.status);
  setResponseHeaders(event, {
    'Content-Type': 'audio/mpeg',
    ...(contentLength ? { 'Content-Length': contentLength } : {}),
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=31536000, immutable',
    ...(contentRange ? { 'Content-Range': contentRange } : {}),
  });

  return sendStream(event, Readable.fromWeb(response.body as import('node:stream/web').ReadableStream));
});
