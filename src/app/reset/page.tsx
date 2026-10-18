'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Field } from '@/components/Field';
import { useT } from '@/components/I18n';
import { IAlert, IOk } from '@/components/Icons';
import { friendlyError } from '@/lib/errors';
import { supabaseBrowser } from '@/lib/supabase';
import { passwordOk } from '@/lib/utils';

/** Choix d'un nouveau mot de passe après le lien reçu par e-mail (la session de récupération est créée par le lien). */
export default function ResetPage() {
  const { t } = useT();
  const [state, setState] = useState<'wait' | 'ready' | 'invalid' | 'done'>('wait');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sb = supabaseBrowser();
    let alive = true;
    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (alive && session && (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN')) setState((s) => (s === 'done' ? s : 'ready'));
    });
    // Le jeton du lien est échangé au chargement ; on laisse un court délai avant de conclure à un lien invalide.
    const timer = window.setTimeout(async () => {
      const { data } = await sb.auth.getSession();
      if (alive) setState((s) => (s === 'wait' ? (data.session ? 'ready' : 'invalid') : s));
    }, 2500);
    return () => { alive = false; window.clearTimeout(timer); sub.subscription.unsubscribe(); };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!passwordOk(password)) return setError(t('err.pass'));
    setBusy(true);
    const sb = supabaseBrowser();
    const { error: err } = await sb.auth.updateUser({ password });
    if (err) {
      setBusy(false);
      return setError(friendlyError(err.message, t));
    }
    await sb.auth.signOut();
    setBusy(false);
    setState('done');
  }

  return (
    <div className="mx-auto max-w-md py-12">
      <h1 className="text-2xl font-bold">{t('reset.h')}</h1>
      {state === 'wait' && <p role="status" className="mt-4 text-muted">{t('reset.wait')}</p>}
      {state === 'invalid' && (
        <div className="mt-4 space-y-4">
          <p className="flex items-start gap-2 rounded-md border border-red-600/40 bg-red-600/10 px-3 py-2 text-sm text-red-800 dark:text-red-300"><IAlert className="mt-0.5 h-4 w-4 shrink-0" />{t('reset.invalid')}</p>
          <Link href="/login" className="btn btn-primary">{t('h.login')}</Link>
        </div>
      )}
      {state === 'done' && (
        <div className="mt-4 space-y-4">
          <p role="status" className="flex items-start gap-2 rounded-md border border-leaf-500/40 bg-leaf-500/10 px-3 py-2 text-sm text-success"><IOk className="mt-0.5 h-4 w-4 shrink-0" />{t('reset.done')}</p>
          <Link href="/login" className="btn btn-primary">{t('h.login')}</Link>
        </div>
      )}
      {state === 'ready' && (
        <form onSubmit={submit} className="mt-4 space-y-4" noValidate>
          <p className="text-muted">{t('reset.p')}</p>
          <Field id="rs-pass" label={t('reset.new')} hint={t('login.rule.pass')}>
            <input id="rs-pass" className="input" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          <div aria-live="polite" className="empty:hidden">
            {error && <p className="flex items-start gap-2 rounded-md border border-red-600/40 bg-red-600/10 px-3 py-2 text-sm text-red-800 dark:text-red-300"><IAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
          </div>
          <button type="submit" disabled={busy} aria-busy={busy} className="btn btn-primary w-full">{t('reset.save')}</button>
        </form>
      )}
    </div>
  );
}
