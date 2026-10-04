'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useT } from '@/components/I18n';
import { IBell, IChat, ICompass, IHome } from '@/components/Icons';
import type { Key } from '@/lib/i18n';

const ITEMS: { href: string; label: Key; Icon: typeof IHome }[] = [
  { href: '/', label: 'nav.home', Icon: IHome },
  { href: '/projects', label: 'nav.explore', Icon: ICompass },
  { href: '/questions', label: 'nav.chat', Icon: IChat },
  { href: '/notifications', label: 'nav.bell', Icon: IBell },
];

/** Barre du bas façon maquette : icônes seules, avatar à droite. */
export default function BottomNav() {
  const path = usePathname();
  const { t } = useT();
  const cls = (a: boolean) => `flex items-center justify-center py-3.5 ${a ? 'text-brand-600' : 'text-neutral-500'}`;
  return (
    <nav aria-label="Navigation mobile" className="fixed inset-x-0 bottom-0 z-20 border-t border-[#e3ecf2] bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {ITEMS.map(({ href, label, Icon }) => (
          <li key={href} className="flex-1"><Link href={href} aria-label={t(label)} className={cls(href === '/' ? path === '/' : path.startsWith(href))}><Icon className="h-7 w-7" /></Link></li>
        ))}
        <li className="flex-1"><Link href="/profile" aria-label={t('nav.profile')} className={cls(path.startsWith('/profile'))}>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-leaf-500 text-[11px] font-bold text-white">●</span></Link></li>
      </ul>
    </nav>
  );
}
