'use client';
import { useCallback, useEffect, useState } from 'react';
import { useT } from '@/components/I18n';
import { IMonitor, IMoon, ISun } from '@/components/Icons';
import type { Key } from '@/lib/i18n';

type Mode = 'light' | 'dark' | 'system';
const ORDER: Mode[] = ['light', 'dark', 'system'];
const LABEL: Record<Mode, Key> = { light: 'theme.light', dark: 'theme.dark', system: 'theme.system' };
const ICON = { light: ISun, dark: IMoon, system: IMonitor };

function apply(mode: Mode) {
  const dark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.dataset.theme = mode;
}

/** Bascule clair / sombre / système, mémorisée dans localStorage (le script anti-flash est dans le layout). */
export default function ThemeToggle({ variant = 'cycle' }: { variant?: 'cycle' | 'segmented' }) {
  const { t } = useT();
  const sep = t('theme.sep');
  const [mode, setMode] = useState<Mode>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let saved: Mode = 'system';
    try {
      const v = localStorage.getItem('adh-theme');
      if (v === 'light' || v === 'dark') saved = v;
    } catch {}
    setMode(saved);
    apply(saved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const on = () => apply('system');
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [mode]);

  const choose = useCallback((m: Mode) => {
    setMode(m);
    apply(m);
    try {
      if (m === 'system') localStorage.removeItem('adh-theme');
      else localStorage.setItem('adh-theme', m);
    } catch {}
  }, []);

  if (variant === 'segmented') {
    return (
      <div role="group" aria-label={t('theme.label')} className="inline-flex rounded-md border border-line bg-surface-2 p-1">
        {ORDER.map((m) => {
          const Icon = ICON[m];
          const on = mode === m;
          return (
            <button key={m} type="button" onClick={() => choose(m)} aria-pressed={on}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition ${on ? 'bg-raised text-fg shadow-sm ring-1 ring-line' : 'text-muted hover:text-fg'}`}>
              <Icon className="h-4 w-4" />{t(LABEL[m])}
            </button>
          );
        })}
      </div>
    );
  }

  const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
  const Icon = ICON[mode];
  return (
    <button type="button" onClick={() => choose(next)} title={`${t('theme.label')}${sep}${t(LABEL[mode])}`}
      aria-label={`${t('theme.label')}${sep}${t(LABEL[mode])}`}
      className="flex h-11 w-11 items-center justify-center rounded-md text-muted transition hover:bg-surface-2 hover:text-fg md:h-10 md:w-10">
      {mounted ? <Icon className="h-[18px] w-[18px]" /> : <span className="h-[18px] w-[18px]" aria-hidden="true" />}
    </button>
  );
}
