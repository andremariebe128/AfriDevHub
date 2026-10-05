import type { Metadata, Viewport } from 'next';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import MainShell from '@/components/MainShell';
import PWARegister from '@/components/PWARegister';
import StatusBar from '@/components/StatusBar';
import ThemeScript from '@/components/ThemeScript';
import { I18nProvider } from '@/components/I18n';
import { getT } from '@/lib/i18n-server';
import '@fontsource-variable/bricolage-grotesque/index.css';
import '@fontsource-variable/instrument-sans/index.css';
import '@fontsource-variable/jetbrains-mono/index.css';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
  title: { default: t('meta.title'), template: '%s | AfriDevHub' },
  description: t('meta.desc'),
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
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f5f4ef',
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getT();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <I18nProvider locale={locale}>
          <a href="#main" className="sr-only z-50 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
            {t('a.skip')}
          </a>
          <PWARegister />
          <Header />
          <MainShell>{children}</MainShell>
          <Footer />
          <StatusBar />
          <BottomNav />
        </I18nProvider>
      </body>
    </html>
  );
}
