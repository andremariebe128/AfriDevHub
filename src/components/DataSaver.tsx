'use client';
import { useEffect, useState } from 'react';
import { useT } from '@/components/I18n';

/** Mode économie de data : coupe animations et décor, mémorisé sur l’appareil. */
export default function DataSaver() {
  const [on, setOn] = useState(false);
  const { t } = useT();
  useEffect(() => {
    try { setOn(localStorage.getItem('adh-lite') === '1'); } catch {}
  }, []);
  useEffect(() => {
    document.documentElement.toggleAttribute('data-lite', on);
    window.dispatchEvent(new Event('adh-lite'));
    try { localStorage.setItem('adh-lite', on ? '1' : '0'); } catch {}
  }, [on]);
  return (
    <button onClick={() => setOn(!on)} aria-pressed={on} title={t('h.eco')} className="btn btn-outline !px-2.5 !py-2">
      <span aria-hidden="true">{on ? '🍃' : '⚡'}</span>
      <span className="hidden lg:inline">{on ? t('h.lite') : t('h.eco')}</span>
    </button>
  );
}
