/** En-têtes de sécurité statiques. La politique CSP (avec nonce par requête) est posée par src/proxy.ts. */
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Pas de sharp (libvips est sous LGPL, interdite par le règlement CADEV) : images non optimisées côté serveur.
  images: { unoptimized: true },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Le service worker doit toujours être revalidé pour que les corrections se propagent.
      { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache, max-age=0' }, { key: 'Content-Type', value: 'text/javascript; charset=utf-8' }] },
    ];
  },
};
export default nextConfig;
