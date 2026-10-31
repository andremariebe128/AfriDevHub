'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useT } from '@/components/I18n';
import { IBell, IBriefcase, IChat, IFolder, IGlobe, INews, IMentor, IPlus, IUser, IX } from '@/components/Icons';
import { Badge, useUnread } from '@/components/useUnread';
import { supabaseBrowser } from '@/lib/supabase';
import type { Key } from '@/lib/i18n';

type Item = { href: string; label: Key; Icon: typeof INews };
const LEFT: Item[] = [
  { href: '/actu', label: 'nav.news', Icon: INews },
  { href: '/questions', label: 'nav.q', Icon: IChat },
];
const MORE: Item[] = [
  { href: '/opportunites', label: 'nav.o', Icon: IBriefcase },
  { href: '/espaces', label: 'nav.s', Icon: IGlobe },
  { href: '/mentors', label: 'nav.m', Icon: IMentor },
  { href: '/notifications', label: 'notif.h', Icon: IBell },
  { href: '/profile', label: 'nav.profile', Icon: IUser },
];

/** Barre du bas mobile : 3 destinations, l'action principale (Poser) au centre et un menu « Plus » (Opportunités, Espaces, Mentors, Notifications, Profil). */
export default function BottomNav() {
  const path = usePathname();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [uid, setUid] = useState<string | undefined>();
  const unread = useUnread(uid);
  const active = (href: string) => (href === '/' ? path === '/' : path === href || path.startsWith(href + '/'));

  useEffect(() => {
    const sb = supabaseBrowser();
    sb.auth.getSession().then(({ data }) => setUid(data.session?.user.id)).catch(() => {});
    const { data } = sb.auth.onAuthStateChange((_e, s) => setUid(s?.user.id));
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open]);

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
  const moreOn = MORE.some((m) => active(m.href));

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setOpen(false)} aria-hidden="true">
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}
      {open && (
        <div id="more-sheet" role="dialog" aria-label={t('nav.more')}
          className="fixed inset-x-0 bottom-16 z-50 mx-auto max-w-md rounded-t-xl border border-b-0 border-line bg-surface pb-[env(safe-area-inset-bottom)] shadow-lg md:hidden">
          <ul className="p-2">
            {MORE.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link href={href} aria-current={active(href) ? 'page' : undefined}
                  className={`flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-semibold hover:bg-surface-2 ${active(href) ? 'text-accent-fg' : 'text-fg'}`}>
                  <Icon className="h-5 w-5" />
                  <span className="flex-1">{t(label)}</span>
                  {href === '/notifications' && unread > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <nav aria-label={t('a.mobile')} className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <ul className="mx-auto flex max-w-md items-stretch">
          {LEFT.map(cell)}
          <li className="flex-1">
            <Link href="/ask" aria-label={t('h.ask')} className="flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-accent-fg">
              <span className="flex h-8 w-12 items-center justify-center rounded-md bg-brand-600 text-white dark:bg-brand-500"><IPlus className="h-5 w-5" /></span>
              <span>{t('nav.ask.short')}</span>
            </Link>
          </li>
          {cell({ href: '/projects', label: 'nav.p', Icon: IFolder })}
          <li className="flex-1">
            <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="more-sheet"
              className={`relative flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-semibold transition ${open || moreOn ? 'text-accent-fg' : 'text-muted'}`}>
              {open ? <IX className="h-[22px] w-[22px]" /> : <MoreDots />}
              <span>{t('nav.more')}</span>
              {!open && <Badge n={unread} />}
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}

function MoreDots() {
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}
