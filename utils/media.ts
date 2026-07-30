/**
 * Build a proxied media URL served from Supabase via /api/media/*.
 *
 * Accepts either:
 * - "images/profile.jpg"
 * - "/assets/images/profile.jpg"
 */
export function mediaUrl(path: string) {
  const normalized = path
    .replace(/^\/+/, '')
    .replace(/^assets\//, '');

  return `/api/media/${normalized}`;
}
