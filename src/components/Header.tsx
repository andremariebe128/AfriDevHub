'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabaseBrowser } from '@/lib/supabase';

export default function Header() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const sb = supabaseBrowser();
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = sb.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabaseBrowser().auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-white/85 backdrop-blur-xl transition dark:border-white/10 dark:bg-neutral-950/80">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2 text-lg font-black tracking-tight"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-sm ring-1 ring-white/20 transition group-hover:scale-105">
            <span aria-hidden="true" className="text-sm">AD</span>
          </span>
          <span className="bg-gradient-to-r from-brand-700 to-brand-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-brand-300">
            AfriDevHub
          </span>
        </Link>
        <nav className="hidden flex-1 items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="/questions"
            className="text-neutral-700 transition hover:text-brand-600 dark:text-neutral-200 dark:hover:text-brand-400"
          >
            Questions
          </Link>
          <Link
            href="/projects"
            className="text-neutral-700 transition hover:text-brand-600 dark:text-neutral-200 dark:hover:text-brand-400"
          >
            Projets
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {session ? (
            <>
              <Link
                href="/ask"
                className="btn btn-primary hidden !py-2 md:inline-flex"
              >
                Poser une question
              </Link>
              <Link
                href="/profile"
                className="btn btn-ghost hidden !py-2 md:inline-flex"
              >
                Mon profil
              </Link>
              <button onClick={logout} className="btn btn-outline !py-2">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost !py-2">
                Connexion
              </Link>
              <Link href="/login" className="btn btn-primary !py-2">
                Rejoindre
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
