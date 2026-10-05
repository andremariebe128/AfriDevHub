'use client';
import { useEffect, useState } from 'react';
import { useT } from '@/components/I18n';
import { IOffline } from '@/components/Icons';

/** Bandeau « Mode Lite » + indicateur hors ligne, posé au-dessus de la barre du bas. */
export default function StatusBar() {
  const { t } = useT();
  const [lite, setLite] = useState(false);
  const [off, setOff] = useState(false);
  useEffect(() => {
    const sync = () => setLite(document.documentElement.hasAttribute('data-lite'));
    const net = () => setOff(!navigator.onLine);
    sync(); net();
    window.addEventListener('adh-lite', sync);
    window.addEventListener('online', net);
    window.addEventListener('offline', net);
    return () => { window.removeEventListener('adh-lite', sync); window.removeEventListener('online', net); window.removeEventListener('offline', net); };
  }, []);
  if (!lite && !off) return null;
  return (
    <div role="status" className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-line bg-brand-950 px-4 py-2 text-center text-xs font-medium text-white md:bottom-0">
      {off ? <span className="inline-flex items-center gap-1.5"><IOffline />{t('off.badge')}</span> : t('lite.banner')}
    </div>
  );
}
