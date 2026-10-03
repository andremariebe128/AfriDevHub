import type { Metadata, Viewport } from 'next';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import PWARegister from '@/components/PWARegister';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'AfriDevHub - la communauté des développeurs africains', template: '%s | AfriDevHub' },
  description:
    "AfriDevHub est la plateforme d'échange des développeurs africains : questions/réponses, projets, mentorat et opportunités.",
  applicationName: 'AfriDevHub',
  appleWebApp: { capable: true, title: 'AfriDevHub', statusBarStyle: 'black-translucent' },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b6e4f',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <PWARegister />
        <Header />
        <main className="relative mx-auto min-h-[70vh] max-w-6xl px-4 py-8 sm:px-6">{children}</main>
        <footer className="border-t border-white/60 bg-sand-50/80 py-8 pb-24 text-center text-sm text-neutral-600 backdrop-blur md:pb-8 dark:border-white/10 dark:bg-neutral-950/80 dark:text-neutral-400">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-base font-medium text-neutral-800 dark:text-neutral-100">
              AfriDevHub — La communauté des développeurs africains
            </p>
            <p className="mt-2 text-pretty">
              Apprendre, partager, collaborer. Pensé pour les réalités africaines : mobile-first, léger et PWA.
            </p>
            <p className="mt-4">
              © {new Date().getFullYear()} AfriDevHub · Tous droits réservés
            </p>
          </div>
        </footer>
        <BottomNav />
      </body>
    </html>
  );
}
