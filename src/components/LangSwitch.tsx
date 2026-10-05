'use client';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useT } from '@/components/I18n';

/** Sélecteur de langue FR / EN (cookie), segmenté. */
export default function LangSwitch({ className = '' }: { className?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const { locale } = useT();
  function set(next: 'fr' | 'en') {
    if (next === locale) return;
    document.cookie = `adh-lang=${next}; path=/; max-age=31536000; samesite=lax`;
    start(() => router.refresh());
  }
  const seg = (l: 'fr' | 'en') =>
    `flex h-10 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-bold tracking-wide transition md:h-8 ${locale === l ? 'bg-raised text-fg shadow-sm ring-1 ring-line' : 'text-muted hover:text-fg'}`;
  return (
    <div role="group" aria-label="Langue / Language" aria-busy={pending} className={`${pending ? 'opacity-60' : ''} inline-flex rounded-md border border-line bg-surface-2 p-0.5 ${className}`}>
      <button type="button" disabled={pending} lang="fr" onClick={() => set('fr')} aria-pressed={locale === 'fr'} aria-label="Français" className={seg('fr')}>FR</button>
      <button type="button" disabled={pending} lang="en" onClick={() => set('en')} aria-pressed={locale === 'en'} aria-label="English" className={seg('en')}>EN</button>
    </div>
  );
}
