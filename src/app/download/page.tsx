import type { Metadata } from 'next';
import InstallButton from '@/components/InstallButton';
import { getT } from '@/lib/i18n-server';

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await getT()).t('dl.h') });

const PLATFORMS = [
  { id: 'pwa', name: 'Application Web (PWA)', kind: 'S’installe depuis le navigateur', url: null, logo: null, accent: 'brand' },
  { id: 'android', name: 'Android', kind: 'APK', url: '/builds/android.apk', logo: '/icons/os-android.svg', accent: '#3DDC84' },
  { id: 'ios', name: 'iPhone / iPad', kind: 'App Store', url: null, logo: '/icons/os-apple.svg', accent: '#888' },
  { id: 'windows', name: 'Windows', kind: 'Installateur .exe', url: '/builds/AfriDevHub-Setup-1.0.0.exe', logo: '/icons/os-windows.svg', accent: '#00adef' },
  { id: 'macos', name: 'macOS', kind: 'Image disque .dmg', url: null, logo: '/icons/os-apple.svg', accent: '#888' },
  { id: 'linux', name: 'Linux', kind: 'Paquet .deb', url: null, logo: '/icons/os-linux.svg', accent: '#FCC624' },
] as const;

export default async function DownloadPage() {
  const { t } = await getT();
  return (
    <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      {/* En-tête */}
      <header className="mb-12 text-center sm:mb-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('dl.h')}</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted sm:text-lg">{t('dl.p')}</p>
      </header>

      {/* Grille 6 cartes — alignement parfait, responsive 1/2/3 cols */}
      <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
        {PLATFORMS.map((p) => {
          const isPwa = p.id === 'pwa';
          return (
            <li
              key={p.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-float"
            >
              {/* Liseré coloré en haut */}
              <div
                className="absolute inset-x-0 top-0 h-1 opacity-80 transition-opacity group-hover:opacity-100"
                style={{ background: p.accent ? `linear-gradient(90deg, transparent, ${p.accent}, transparent)` : 'var(--accent)' }}
              />

              {/* Logo */}
              <div className="mb-5 flex h-14 items-center">
                {isPwa ? (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-[0_4px_14px_rgba(31,110,156,0.3)]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7"><rect x="5" y="2" width="14" height="20" rx="3" /><path d="M11 18.5h2" /></svg>
                  </div>
                ) : (
                  <img src={p.logo!} alt="" className="h-12 w-12 drop-shadow-sm transition-transform duration-300 group-hover:scale-110" />
                )}
              </div>

              {/* Texte */}
              <h2 className="text-lg font-semibold">{p.name}</h2>
              <p className="mt-1 text-sm text-muted">{p.kind}</p>

              {/* Bouton */}
              <div className="mt-auto pt-6">
                {isPwa ? (
                  <InstallButton className="btn btn-primary w-full" />
                ) : p.url ? (
                  <a href={p.url} className="btn btn-primary w-full transition-transform duration-150 group-active:scale-[0.98]">
                    {t('dl.get')}
                  </a>
                ) : (
                  <span className="btn btn-secondary w-full cursor-not-allowed opacity-50" aria-disabled="true">
                    {t('dl.soon')}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Note */}
      <p className="mt-10 text-center text-sm text-subtle">{t('dl.note')}</p>
    </div>
  );
}
