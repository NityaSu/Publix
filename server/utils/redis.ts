import { Redis } from '@upstash/redis';

/**
 * Upstash Redis client — same approach as rauchg.com (Vercel KV / Upstash).
 * Returns null when env is missing so the blog still renders with 0 views.
 */
export function useRedis(): Redis | null {
  const config = useRuntimeConfig();
  const url = String(config.kvRestApiUrl || '');
  const token = String(config.kvRestApiToken || '');

  if (!url || !token) return null;

  return new Redis({ url, token });
}
