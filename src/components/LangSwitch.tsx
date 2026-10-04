'use client';
import { useRouter } from 'next/navigation';
import { useT } from '@/components/I18n';
import { ISearch } from '@/components/Icons';

/** Pastille « FR / EN » : bascule la langue (cookie). */
export default function LangSwitch() {
  const router = useRouter();
  const { locale } = useT();
  const next = locale === 'fr' ? 'en' : 'fr';
  function go() {
    document.cookie = `adh-lang=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }
  const on = 'font-extrabold text-neutral-900 dark:text-white';
  return (
    <button onClick={go} lang={next} aria-label={next === 'en' ? 'Switch to English' : 'Passer en français'}
      className="flex items-center gap-1.5 rounded-full bg-[#ececec] px-3.5 py-2 text-sm text-neutral-600">
      <ISearch className="h-4 w-4" />
      <span className={locale === 'fr' ? on : ''}>FR</span>/<span className={locale === 'en' ? on : ''}>EN</span>
    </button>
  );
}
