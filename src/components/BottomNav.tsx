'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useT } from '@/components/I18n';
import { IChat, IFolder, IHome, IPlus, IUser } from '@/components/Icons';
import type { Key } from '@/lib/i18n';

type Item = { href: string; label: Key; Icon: typeof IHome };
const LEFT: Item[] = [
  { href: '/', label: 'nav.home', Icon: IHome },
  { href: '/questions', label: 'nav.q', Icon: IChat },
];
const RIGHT: Item[] = [
  { href: '/projects', label: 'nav.p', Icon: IFolder },
  { href: '/profile', label: 'nav.profile', Icon: IUser },
];

/** Barre du bas mobile : 4 destinations + une seule action principale (Poser) intégrée au centre. */
export default function BottomNav() {
  const path = usePathname();
  const { t } = useT();
  const active = (href: string) => (href === '/' ? path === '/' : path === href || path.startsWith(href + '/'));

  const cell = ({ href, label, Icon }: Item) => {
    const on = active(href);
    return (
      <li key={href} className="flex-1">
        <Link href={href} aria-current={on ? 'page' : undefined}
          className={`relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition ${on ? 'text-accent-fg' : 'text-muted'}`}>
          {on && <span className="absolute inset-x-5 top-0 h-0.5 bg-brand-600 dark:bg-brand-400" aria-hidden="true" />}
          <Icon className="h-[22px] w-[22px]" />
          <span>{t(label)}</span>
        </Link>
      </li>
    );
  };

  return (
    <nav aria-label={t('a.mobile')} className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <ul className="mx-auto flex max-w-md items-stretch">
        {LEFT.map(cell)}
        <li className="flex-1">
          <Link href="/ask" aria-label={t('h.ask')} className="flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-accent-fg">
            <span className="flex h-8 w-12 items-center justify-center rounded-md bg-brand-600 text-white dark:bg-brand-500"><IPlus className="h-5 w-5" /></span>
            <span>{t('nav.ask.short')}</span>
          </Link>
        </li>
        {RIGHT.map(cell)}
      </ul>
    </nav>
  );
}
