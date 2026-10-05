'use client';
import { useEffect, useState } from 'react';
import { useT } from '@/components/I18n';
import { ILeaf, IZap } from '@/components/Icons';

/** Mode économie de data : coupe animations et décor, mémorisé sur l’appareil. */
export default function DataSaver({ className = '' }: { className?: string }) {
  const [on, setOn] = useState(false);
  const { t } = useT();
  useEffect(() => {
    try { setOn(localStorage.getItem('adh-lite') === '1'); } catch {}
  }, []);
  function toggle() {
    const next = !on;
    setOn(next);
    document.documentElement.toggleAttribute('data-lite', next);
    window.dispatchEvent(new Event('adh-lite'));
    try { localStorage.setItem('adh-lite', next ? '1' : '0'); } catch {}
  }
  return (
    <button type="button" onClick={toggle} aria-pressed={on} title={t('h.eco')}
      className={`inline-flex h-11 items-center gap-1.5 whitespace-nowrap rounded-md border px-3 text-[13px] font-semibold transition md:h-10 ${on ? 'border-leaf-500/40 bg-leaf-500/10 text-success' : 'border-line bg-surface text-muted hover:bg-surface-2 hover:text-fg'} ${className}`}>
      {on ? <ILeaf className="h-4 w-4" /> : <IZap className="h-4 w-4" />}
      <span>{on ? t('h.lite') : t('h.eco')}</span>
    </button>
  );
}
