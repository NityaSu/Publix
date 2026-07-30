#!/usr/bin/env node
/**
 * Upload local public/assets media into the Supabase "site-media" bucket.
 *
 * Usage:
 *   node --env-file=.env scripts/upload-media.mjs
 *
 * Requires SUPABASE_URL + SUPABASE_KEY (service_role recommended).
 * Creates the bucket if missing. Object keys mirror paths under public/assets:
 *   public/assets/images/profile.jpg → site-media/images/profile.jpg
 */
import { createClient } from '@supabase/supabase-js';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MEDIA_BUCKET = 'site-media';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS_DIR = path.join(ROOT, 'public', 'assets');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(url, key);

async function ensureBucket() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error(
      'Could not list buckets. Use the service_role key in .env (not anon) for uploads.',
    );
    throw error;
  }

  if (buckets?.some((b) => b.name === MEDIA_BUCKET)) {
    console.log(`Bucket "${MEDIA_BUCKET}" already exists.`);
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(MEDIA_BUCKET, {
    public: false,
    fileSizeLimit: '50MB',
  });

  if (createError) {
    console.error(
      `Could not create bucket "${MEDIA_BUCKET}". Create it in the Supabase Dashboard (Storage → New bucket), then re-run.`,
    );
    throw createError;
  }

  console.log(`Created bucket "${MEDIA_BUCKET}".`);
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
      continue;
    }
    if (entry.name === '.gitkeep') continue;
    files.push(full);
  }

  return files;
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    case '.mp4':
      return 'video/mp4';
    case '.webm':
      return 'video/webm';
    default:
      return 'application/octet-stream';
  }
}

async function uploadAll() {
  await ensureBucket();

  const files = await walk(ASSETS_DIR);
  if (files.length === 0) {
    console.log('No media files found under public/assets.');
    return;
  }

  console.log(`Uploading ${files.length} file(s)...`);

  for (const file of files) {
    const objectPath = path.relative(ASSETS_DIR, file).split(path.sep).join('/');
    const body = await readFile(file);
    const size = (await stat(file)).size;

    const { error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(objectPath, body, {
        contentType: contentType(file),
        upsert: true,
      });

    if (error) {
      console.error(`✗ ${objectPath}: ${error.message}`);
      process.exitCode = 1;
      continue;
    }

    console.log(`✓ ${objectPath} (${Math.round(size / 1024)} KB)`);
  }
}

uploadAll().catch((error) => {
  console.error(error);
  process.exit(1);
});
