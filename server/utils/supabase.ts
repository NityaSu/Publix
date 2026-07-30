import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const AUDIO_BUCKET = 'blog-audio';

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

export function audioObjectPath(slug: string) {
  return `${slug}.mp3`;
}

export function audioStorageUrl(slug: string) {
  const config = useRuntimeConfig();
  const path = audioObjectPath(slug);
  return `${config.supabaseUrl}/storage/v1/object/authenticated/${AUDIO_BUCKET}/${path}`;
}
