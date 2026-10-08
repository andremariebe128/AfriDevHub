import type { MetadataRoute } from 'next';

/** Seules ces pages sont ouvertes sans connexion (voir src/proxy.ts) : le reste du site est réservé aux membres. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://afridevhub.vercel.app';
  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/login`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/download`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/confidentialite`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/conditions`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/mentions-legales`, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
