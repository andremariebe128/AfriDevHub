'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useT } from '@/components/I18n';
import { IPlus } from '@/components/Icons';

/** Accueil : « Poser une question » + « + » + « Publier un projet ». Forum : bouton crayon. */
export default function Fab() {
  const { t } = useT();
  const path = usePathname();
  const pill = 'whitespace-nowrap rounded-xl bg-white px-2.5 py-3 text-[11px] font-bold text-brand-600 shadow-md ring-1 ring-[#e3ecf2]';
  if (path === '/questions')
    return <Link href="/ask" aria-label={t('q.new')} className="fixed bottom-[calc(76px+env(safe-area-inset-bottom))] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl md:hidden">
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H5a1 1 0 00-1 1v14a1 1 0 001 1h14a1 1 0 001-1v-6M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4z" /></svg></Link>;
  if (path !== '/') return null;
  return (
    <div className="fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-30 flex items-center justify-center gap-2 md:hidden">
      <Link href="/ask" className={pill}>{t('fab.ask')}</Link>
      <Link href="/publier" aria-label={t('h.pub')} className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl"><IPlus /></Link>
      <Link href="/projects" className={pill}>{t('fab.post')}</Link>
    </div>
  );
}
