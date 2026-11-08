import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = url && key ? createClient(url, key) : null;

// Normalisasi URL gambar produk. Google Drive share links bukan URL gambar langsung,
// sehingga dicoba beberapa endpoint thumbnail yang umum didukung Google Drive.
export function getImageCandidates(input) {
  if (!input) return [];
  const value = String(input).trim();
  if (!value) return [];

  const driveId =
    value.match(/drive\.google\.com\/(?:file\/d\/|thumbnail\?id=|open\?id=|uc\?.*?id=)([a-zA-Z0-9_-]+)/)?.[1] ||
    value.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1];

  if (driveId) {
    return [
      `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`,
      `https://lh3.googleusercontent.com/d/${driveId}=w1600`,
      `https://drive.google.com/uc?export=view&id=${driveId}`,
      `https://drive.usercontent.google.com/download?id=${driveId}&export=view&authuser=0`,
    ];
  }
  return [value];
}

export function formatImageUrl(input) {
  return getImageCandidates(input)[0] || '';
}

export function formatCanvaEmbedUrl(input) {
  try {
    const parsed = new URL(String(input));
    if (!/canva\.com$/i.test(parsed.hostname) && !parsed.hostname.endsWith('.canva.com')) return '';
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts[0] !== 'design' || !parts[1]) return '';
    return `https://www.canva.com/design/${parts[1]}/view?embed`;
  } catch { return ''; }
}
