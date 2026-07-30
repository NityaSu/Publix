import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const AUDIO_BUCKET = 'blog-audio';
const MEDIA_BUCKET = 'site-media';

export function useSupabase(): SupabaseClient {
  const config = useRuntimeConfig();

  if (!config.supabaseUrl || !config.supabaseKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Supabase is not configured',
    });
  }

  return createClient(config.supabaseUrl, config.supabaseKey);
}

export function useAudioBucket() {
  return AUDIO_BUCKET;
}

export function useMediaBucket() {
  return MEDIA_BUCKET;
}

export function audioObjectPath(slug: string) {
  return `${slug}.mp3`;
}

export function audioStorageUrl(slug: string) {
  const config = useRuntimeConfig();
  const path = audioObjectPath(slug);
  return `${config.supabaseUrl}/storage/v1/object/authenticated/${AUDIO_BUCKET}/${path}`;
}

export function mediaStorageUrl(objectPath: string) {
  const config = useRuntimeConfig();
  return `${config.supabaseUrl}/storage/v1/object/authenticated/${MEDIA_BUCKET}/${objectPath}`;
}

export function mediaContentType(objectPath: string) {
  const ext = objectPath.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'avif':
      return 'image/avif';
    case 'svg':
      return 'image/svg+xml';
    case 'mp4':
      return 'video/mp4';
    case 'webm':
      return 'video/webm';
    default:
      return 'application/octet-stream';
  }
}
