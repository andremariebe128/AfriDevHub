'use client';
import { useEffect, useState } from 'react';
import { useT } from '@/components/I18n';

/** Bandeau « Mode Lite » + indicateur hors ligne. */
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
    <div role="status" className="fixed inset-x-0 bottom-[calc(54px+env(safe-area-inset-bottom))] z-20 bg-[#3f3f3f] px-4 py-2 text-center text-xs text-white md:bottom-0">
      {off ? `✓ ${t('off.badge')}` : t('lite.banner')}
    </div>
  );
}
