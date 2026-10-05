'use client';
import { useEffect, useRef } from 'react';
import { useT } from '@/components/I18n';
import { ISearch } from '@/components/Icons';

/** Recherche visible dans l'en-tête ; le raccourci « / » (ou Ctrl/Cmd + K) y place le curseur. */
export default function HeaderSearch({ className = '' }: { className?: string }) {
  const { t } = useT();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      const typing = !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
      const combo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k';
      if ((e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) || combo) {
        e.preventDefault();
        ref.current?.focus();
        ref.current?.select();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <form action="/questions" method="get" role="search" className={`group relative ${className}`}>
      <label htmlFor="header-search" className="sr-only">{t('h.searchlbl')}</label>
      <ISearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
      <input
        ref={ref}
        id="header-search"
        name="q"
        type="search"
        autoComplete="off"
        placeholder={t('dir.search')}
        className="h-10 w-full rounded-md border border-line bg-surface-2/70 pl-9 pr-10 text-sm text-fg outline-none transition placeholder:text-subtle hover:border-line-strong focus:border-brand-500 focus:bg-raised focus:ring-[3px] focus:ring-brand-500/35"
      />
      <kbd className="kbd pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 group-focus-within:opacity-0" aria-hidden="true">/</kbd>
    </form>
  );
}
