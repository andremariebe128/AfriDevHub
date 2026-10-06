import type { Metadata } from 'next';
import InstallButton from '@/components/InstallButton';
import { getT } from '@/lib/i18n-server';

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await getT()).t('dl.h') });

/** Les liens viennent des variables d'environnement : tant qu'un binaire n'est pas publié, la carte indique « Bientôt disponible ». */
const PLATFORMS = [
  { id: 'android', name: 'Android', kind: 'APK', url: process.env.NEXT_PUBLIC_DL_ANDROID },
  { id: 'ios', name: 'iPhone / iPad', kind: 'TestFlight · App Store', url: process.env.NEXT_PUBLIC_DL_IOS },
  { id: 'windows', name: 'Windows', kind: 'Installateur .exe', url: process.env.NEXT_PUBLIC_DL_WINDOWS },
  { id: 'macos', name: 'macOS', kind: 'Image disque .dmg', url: process.env.NEXT_PUBLIC_DL_MACOS },
  { id: 'linux', name: 'Linux', kind: 'AppImage / .deb', url: process.env.NEXT_PUBLIC_DL_LINUX },
];

export default async function DownloadPage() {
  const { t } = await getT();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('dl.h')}</h1>
        <p className="mt-2 text-muted">{t('dl.p')}</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        <li className="rounded-lg border border-brand-600 bg-surface p-4 sm:col-span-2">
          <h2 className="font-semibold">{t('dl.pwa')}</h2>
          <p className="mt-1 text-sm text-muted">{t('dl.pwa.p')}</p>
          <div className="mt-3"><InstallButton className="btn btn-primary" /></div>
        </li>
        {PLATFORMS.map((p) => (
          <li key={p.id} className="rounded-lg border border-line bg-surface p-4">
            <h2 className="font-semibold">{p.name}</h2>
            <p className="mt-1 text-sm text-muted">{p.kind}</p>
            <div className="mt-3">
              {p.url
                ? <a href={p.url} className="btn btn-secondary" rel="noopener noreferrer">{t('dl.get')}</a>
                : <span className="btn btn-secondary pointer-events-none opacity-60" aria-disabled="true">{t('dl.soon')}</span>}
            </div>
          </li>
        ))}
      </ul>
      <p className="text-sm text-subtle">{t('dl.note')}</p>
    </div>
  );
}
