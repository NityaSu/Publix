import { Readable } from 'node:stream';

const PATH_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_./-]*$/;

function parseMediaPath(raw: string | string[] | undefined): string {
  const joined = Array.isArray(raw) ? raw.join('/') : (raw ?? '');
  const path = joined.replace(/^\/+/, '').replace(/\/+/g, '/');

  if (!path || path.includes('..') || !PATH_PATTERN.test(path)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid media path' });
  }

  return path;
}

export default defineEventHandler(async (event) => {
  const objectPath = parseMediaPath(getRouterParam(event, 'path'));
  const config = useRuntimeConfig();
  const url = mediaStorageUrl(objectPath);
  const rangeHeader = getRequestHeader(event, 'range');

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.supabaseKey}`,
      ...(rangeHeader ? { Range: rangeHeader } : {}),
    },
  });

  if (response.status === 404 || response.status === 400) {
    throw createError({ statusCode: 404, statusMessage: 'Media not found' });
  }

  if (!response.ok || !response.body) {
    throw createError({
      statusCode: response.status === 404 ? 404 : 502,
      statusMessage:
        response.status === 404 ? 'Media not found' : 'Failed to fetch media',
    });
  }

  const contentLength = response.headers.get('content-length');
  const contentRange = response.headers.get('content-range');

  setResponseStatus(event, response.status);
  setResponseHeaders(event, {
    'Content-Type': mediaContentType(objectPath),
    ...(contentLength ? { 'Content-Length': contentLength } : {}),
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=31536000, immutable',
    ...(contentRange ? { 'Content-Range': contentRange } : {}),
  });

  return sendStream(
    event,
    Readable.fromWeb(response.body as import('node:stream/web').ReadableStream),
  );
});
