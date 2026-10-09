'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import Avatar from '@/components/Avatar';
import HeaderSearch from '@/components/HeaderSearch';
import { useT } from '@/components/I18n';
import { IBell, ISearch } from '@/components/Icons';
import LangSwitch from '@/components/LangSwitch';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { supabaseBrowser } from '@/lib/supabase';
import { safeUrl } from '@/lib/utils';
import type { Key } from '@/lib/i18n';

const NAV: { href: string; label: Key }[] = [
  { href: '/questions', label: 'nav.q' },
  { href: '/projects', label: 'nav.p' },
  { href: '/espaces', label: 'nav.s' },
  { href: '/opportunites', label: 'nav.o' },
  { href: '/mentors', label: 'nav.m' },
];

export default function Header() {
  const { t } = useT();
  const path = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const uid = session?.user.id;

  useEffect(() => {
    const sb = supabaseBrowser();
    sb.auth.getSession().then(({ data }) => setSession(data.session)).catch(() => {});
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  // Photo de profil de l'utilisateur connecté (colonne avatar_url : absente tant que la migration n'est pas passée).
  useEffect(() => {
    if (!uid) { setAvatar(null); return; }
    let alive = true;
    supabaseBrowser().from('profiles').select('*').eq('id', uid).maybeSingle()
      .then(({ data }) => { if (alive) setAvatar(safeUrl(data?.avatar_url)); }, () => {});
    const onChange = (e: Event) => setAvatar(safeUrl((e as CustomEvent<string | null>).detail));
    window.addEventListener('adh-avatar', onChange);
    return () => { alive = false; window.removeEventListener('adh-avatar', onChange); };
  }, [uid]);

  const icon = 'flex h-11 w-11 items-center justify-center rounded-md text-muted transition hover:bg-surface-2 hover:text-fg md:h-10 md:w-10';
  const initial = ((session?.user.user_metadata?.username as string | undefined) ?? session?.user.email ?? '?')[0].toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-3 sm:gap-3 sm:px-6">
        <Link href="/" aria-label={t('a.home')} className="mr-1 shrink-0 rounded-lg lg:mr-4"><Logo height={32} /></Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label={t('a.main')}>
          {NAV.map(({ href, label }) => {
            const on = path === href || path.startsWith(href + '/');
            return (
              <Link key={href} href={href} aria-current={on ? 'page' : undefined}
                className={`relative rounded-lg px-3 py-2 text-sm font-medium transition ${on ? 'text-fg' : 'text-muted hover:bg-surface-2 hover:text-fg'}`}>
                {t(label)}
                {on && <span className="absolute inset-x-3 -bottom-[13px] h-0.5 bg-brand-600 dark:bg-brand-400" aria-hidden="true" />}
              </Link>
            );
          })}
        </nav>

        <HeaderSearch className="ml-auto hidden min-w-0 max-w-xs flex-1 xl:ml-4 xl:block" />

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1 xl:ml-0">
          <Link href="/questions" aria-label={t('h.search')} className={`${icon} hidden min-[390px]:flex xl:hidden`}><ISearch className="h-[18px] w-[18px]" /></Link>
          <LangSwitch className="mx-0.5" />
          <ThemeToggle />
          <Link href="/notifications" aria-label={t('notif.h')} className={`${icon} hidden sm:flex`}><IBell className="h-[18px] w-[18px]" /></Link>
                    {session ? (
            <Link href="/profile" aria-label={t('h.profile')} className="relative ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 font-display text-sm font-bold text-white ring-2 ring-canvas">
              {avatar ? <Avatar name={(session.user.user_metadata?.username as string | undefined) ?? session.user.email} src={avatar} size={40} className="!ring-0" /> : initial}<span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-canvas bg-leaf-500" />
            </Link>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm ml-1">{t('h.join')}</Link>
          )}
        </div>
      </div>
      <div className="kente-thin" aria-hidden="true" />
    </header>
  );
}
