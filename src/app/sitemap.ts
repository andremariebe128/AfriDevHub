import type { MetadataRoute } from 'next';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://afridevhub.vercel.app';
  const pages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/questions`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/projects`, changeFrequency: 'daily', priority: 0.6 },
    { url: `${base}/espaces`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/opportunites`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/mentors`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${base}/confidentialite`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/conditions`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/mentions-legales`, changeFrequency: 'yearly', priority: 0.2 },
  ];
  try {
    const { data } = await supabaseServer()
      .from('questions')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(500);
    for (const q of data ?? []) {
      pages.push({ url: `${base}/questions/${q.id}`, lastModified: q.created_at, priority: 0.7 });
    }
  } catch {
    /* sitemap partiel si Supabase est injoignable */
  }
  return pages;
}
