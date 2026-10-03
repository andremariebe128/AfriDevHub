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
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-brand-600">
          AfriDevHub
        </Link>
        <nav className="hidden flex-1 items-center gap-4 text-sm font-medium md:flex">
          <Link href="/questions" className="hover:text-brand-600">Questions</Link>
          <Link href="/projects" className="hover:text-brand-600">Projets</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {session ? (
            <>
              <Link href="/ask" className="btn btn-primary hidden !py-1.5 md:inline-flex">Poser une question</Link>
              <Link href="/profile" className="btn btn-outline hidden !py-1.5 md:inline-flex">Profil</Link>
              <button onClick={logout} className="btn btn-outline !py-1.5">Déconnexion</button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary !py-1.5">Connexion</Link>
          )}
        </div>
      </div>
    </header>
  );
}
