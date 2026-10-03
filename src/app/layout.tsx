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
        <main className="mx-auto min-h-[70vh] max-w-5xl px-4 py-8">{children}</main>
        <footer className="border-t border-neutral-200 py-6 pb-24 text-center text-sm text-neutral-500 md:pb-6 dark:border-neutral-800">
          © {new Date().getFullYear()} AfriDevHub · Apprendre, partager, collaborer.
        </footer>
        <BottomNav />
      </body>
    </html>
  );
}
