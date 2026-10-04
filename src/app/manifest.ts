import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AfriDevHub',
    short_name: 'AfriDevHub',
    description: "La communauté des développeurs africains : apprendre, partager, collaborer.",
    start_url: '/questions',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#1670ad',
    theme_color: '#1670ad',
    lang: 'fr',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Poser une question', url: '/ask' },
      { name: 'Projets', url: '/projects' },
    ],
  };
}
