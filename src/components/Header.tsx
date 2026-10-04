'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import DataSaver from '@/components/DataSaver';
import { useT } from '@/components/I18n';
import { IBell, ISearch } from '@/components/Icons';
import LangSwitch from '@/components/LangSwitch';
import Logo from '@/components/Logo';
import { supabaseBrowser } from '@/lib/supabase';

export default function Header() {
  const { t } = useT();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const sb = supabaseBrowser();
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const link = 'text-sm font-medium text-neutral-700 transition hover:text-brand-600 dark:text-neutral-200';
  const icon = 'flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-white/10';
  const initial = ((session?.user.user_metadata?.username as string | undefined) ?? session?.user.email ?? '?')[0].toUpperCase();

  return (
    <header className="sticky top-0 z-20 border-b border-[#e3ecf2] bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 sm:gap-4 sm:px-6">
        <Link href="/" aria-label="AfriDevHub" className="shrink-0"><Logo height={40} /></Link>
        <nav className="hidden flex-1 items-center gap-5 md:flex" aria-label="Principal">
          <Link href="/questions" className={link}>{t('nav.q')}</Link>
          <Link href="/projects" className={link}>{t('nav.p')}</Link>
          <Link href="/espaces" className={link}>{t('nav.s')}</Link>
          <Link href="/opportunites" className={link}>{t('nav.o')}</Link>
          <Link href="/mentors" className={link}>{t('nav.m')}</Link>
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <LangSwitch />
          <Link href="/questions" aria-label={t('h.search')} className={`${icon} hidden min-[400px]:flex`}><ISearch className="h-6 w-6" /></Link>
          <Link href="/notifications" aria-label={t('notif.h')} className={icon}><IBell className="h-6 w-6" /></Link>
          <span className="hidden sm:block"><DataSaver /></span>
          <Link href="/publier" className="btn btn-primary hidden !py-2 lg:inline-flex">{t('h.pub')}</Link>
          {session ? (
            <Link href="/profile" aria-label={t('h.profile')} className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-leaf-500 font-bold text-white">
              {initial}<span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-leaf-500" />
            </Link>
          ) : (
            <Link href="/login" className="btn btn-primary !px-3.5 !py-2">{t('h.join')}</Link>
          )}
        </div>
      </div>
      <div className="kente" aria-hidden="true" />
    </header>
  );
}
