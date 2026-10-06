/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pas de sharp (libvips est sous LGPL, interdite par le règlement CADEV) : images non optimisées côté serveur.
  images: { unoptimized: true },
};
export default nextConfig;
