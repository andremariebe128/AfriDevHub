import type { Metadata, Viewport } from 'next';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import Fab from '@/components/Fab';
import PWARegister from '@/components/PWARegister';
import StatusBar from '@/components/StatusBar';
import { I18nProvider } from '@/components/I18n';
import { getT } from '@/lib/i18n-server';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
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
  themeColor: '#1f6e9c',
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getT();
  return (
    <html lang={locale}>
      <body>
        <I18nProvider locale={locale}>
        <PWARegister />
        <Header />
        <main className="relative mx-auto min-h-[70vh] max-w-6xl px-4 py-8 sm:px-6">{children}</main>
        <footer className="border-t border-white/60 bg-sand-50/80 py-8 pb-44 text-center md:pb-8 text-sm text-neutral-600 backdrop-blur md:pb-8 dark:border-white/8 dark:bg-neutral-950 dark:text-neutral-400">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-base font-medium text-neutral-800 dark:text-neutral-100">
              {t('foot.tag')}
            </p>
            <p className="mt-2 text-pretty">
              {t('foot.sub')}
            </p>
            <p className="mt-4">
              © {new Date().getFullYear()} AfriDevHub · {t('foot.rights')}
            </p>
          </div>
        </footer>
        <Fab />
        <StatusBar />
        <BottomNav />
        </I18nProvider>
      </body>
    </html>
  );
}
