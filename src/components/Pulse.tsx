'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { COUNTRIES } from '@/lib/seed';
import { useT } from '@/components/I18n';
import type { Key } from '@/lib/i18n';

/** « Le pouls du continent » : démo visuelle de l’activité par pays (données illustratives). */
export default function Pulse() {
  const { t } = useT();
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((n) => n + 1), 3200); return () => clearInterval(t); }, []);
  const active = i % COUNTRIES.length;
  return (
    <div className="mx-auto w-full max-w-3xl text-left">
      <p className="mb-3 text-center text-sm font-semibold" aria-live="polite">
        {t(`pulse.${i % 4}` as Key).replace('{c}', COUNTRIES[active])}
      </p>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {COUNTRIES.map((c, n) => (
          <li key={c}>
            <Link href="/espaces" className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition ${n === active ? 'border-gold-400 bg-gold-50 text-brand-900 dark:bg-gold-500/10 dark:text-gold-400' : 'border-brand-100 bg-white/70 dark:border-white/10 dark:bg-white/5'}`}>
              <span className={`relative h-2.5 w-2.5 rounded-full ${n === active ? 'bg-gold-500' : 'bg-brand-500'}`}>
                {n === active && <span className="pulse-ring absolute inset-0 rounded-full bg-gold-400" />}
              </span>
              {c}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-center text-xs text-neutral-500">{t('pulse.note')}</p>
    </div>
  );
}
