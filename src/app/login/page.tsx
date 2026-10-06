'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Field } from '@/components/Field';
import { useT } from '@/components/I18n';
import { IAlert, ICheck, IEye, IEyeOff, IGlobe, IOffline, IChat, IOk } from '@/components/Icons';
import { friendlyError } from '@/lib/errors';
import { supabaseBrowser } from '@/lib/supabase';

const USER_RE = /^[a-zA-Z0-9_.-]{3,}$/;

function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className={`flex items-start gap-2 text-xs ${ok ? 'text-success' : 'text-subtle'}`}>
      <span className={`mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${ok ? 'border-leaf-500 bg-leaf-500/15' : 'border-line-strong'}`}>{ok && <ICheck className="h-2.5 w-2.5" />}</span>
      <span>{children}</span>
    </li>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { t } = useT();
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [me, setMe] = useState<string | null>(null);

  useEffect(() => {
    supabaseBrowser().auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u) setMe((u.user_metadata?.username as string | undefined) ?? u.email ?? '');
    }).catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (signup && !USER_RE.test(username.trim())) {
      return setError(t('err.user'));
    }
    if (password.length < 6) return setError(t('err.pass'));
    setBusy(true);
    const sb = supabaseBrowser();
    if (signup) {
      const { data, error: err } = await sb.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { username: username.trim() }, emailRedirectTo: `${window.location.origin}/login` },
      });
      setBusy(false);
      if (err) return setError(friendlyError(err.message, t));
      if (!data.session) return setInfo(t('login.check'));
    } else {
      const { error: err } = await sb.auth.signInWithPassword({ email: email.trim(), password });
      setBusy(false);
      if (err) return setError(friendlyError(err.message, t));
    }
    const nx = new URLSearchParams(window.location.search).get('next');
    router.push(nx && nx.startsWith('/') && !nx.startsWith('//') ? nx : '/questions');
    router.refresh();
  }

  const tab = (on: boolean) =>
    `flex min-h-11 flex-1 items-center justify-center rounded px-3 text-sm font-semibold transition md:min-h-9 ${on ? 'bg-surface text-fg shadow-[0_0_0_1px_var(--line)]' : 'text-muted hover:text-fg'}`;
  const FACTS = [
    { Icon: IChat, t: t('login.f1.t'), p: t('login.f1.p') },
    { Icon: IOffline, t: t('login.f2.t'), p: t('login.f2.p') },
    { Icon: IGlobe, t: t('login.f3.t'), p: t('login.f3.p') },
  ];

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-16 lg:pt-6">
      <div>
        <h1 className="text-2xl font-bold">{signup ? t('login.title.up') : t('login.title.in')}</h1>

        {me !== null && (
          <p role="status" className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-leaf-500/40 bg-leaf-500/10 px-3 py-2 text-sm text-success">
            <span>{t('login.already').replace('{u}', me)}</span>
            <Link href="/profile" className="font-semibold underline">{t('nav.profile')}</Link>
          </p>
        )}

        <div role="group" aria-label={t('h.login')} className="mt-5 flex rounded-md border border-line bg-surface-2 p-0.5">
          <button type="button" aria-pressed={!signup} onClick={() => { setSignup(false); setError(null); setInfo(null); }} className={tab(!signup)}>{t('login.tab.in')}</button>
          <button type="button" aria-pressed={signup} onClick={() => { setSignup(true); setError(null); setInfo(null); }} className={tab(signup)}>{t('login.tab.up')}</button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
          {signup && (
            <div>
              <Field id="lg-user" label={t('login.user')}>
                <input id="lg-user" className="input" autoComplete="username" autoCapitalize="none" spellCheck={false} value={username} onChange={(e) => setUsername(e.target.value)} aria-describedby="lg-rules" required />
              </Field>
            </div>
          )}
          <Field id="lg-mail" label={t('login.mail')}>
            <input id="lg-mail" className="input" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field id="lg-pass" label={t('login.pass')}>
            <div className="relative">
              <input id="lg-pass" className="input !pr-12" type={show ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} aria-describedby={signup ? 'lg-rules' : undefined} required />
              <button type="button" onClick={() => setShow(!show)} aria-pressed={show} aria-label={show ? t('login.hide') : t('login.show')}
                className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-fg">
                {show ? <IEyeOff /> : <IEye />}
              </button>
            </div>
          </Field>

          {signup && (
            <ul id="lg-rules" className="space-y-1.5">
              <Rule ok={USER_RE.test(username.trim())}>{t('login.rule.user')}</Rule>
              <Rule ok={password.length >= 6}>{t('login.rule.pass')}</Rule>
            </ul>
          )}

          <div aria-live="polite" className="empty:hidden">
            {error && <p className="flex items-start gap-2 rounded-md border border-red-600/40 bg-red-600/10 px-3 py-2 text-sm text-red-800 dark:text-red-300"><IAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
            {info && <p className="flex items-start gap-2 rounded-md border border-leaf-500/40 bg-leaf-500/10 px-3 py-2 text-sm text-success"><IOk className="mt-0.5 h-4 w-4 shrink-0" />{info}</p>}
          </div>

          {signup && (
            <p className="text-xs leading-relaxed text-muted">
              {t('login.consent').split(/({terms}|{privacy})/).map((part, i) =>
                part === '{terms}' ? <Link key={i} href="/conditions" target="_blank" className="font-medium text-accent-fg underline underline-offset-2">{t('legal.terms')}</Link>
                : part === '{privacy}' ? <Link key={i} href="/confidentialite" target="_blank" className="font-medium text-accent-fg underline underline-offset-2">{t('legal.privacy')}</Link>
                : part)}
            </p>
          )}

          <button type="submit" disabled={busy} aria-busy={busy} className="btn btn-primary w-full">
            {busy ? t('login.busy') : signup ? t('login.create') : t('login.in')}
          </button>
        </form>
      </div>

      <aside className="border-t border-line pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-1" aria-label={t('login.f.h')}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-subtle">{t('login.f.h')}</h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {FACTS.map(({ Icon, t: title, p }) => (
            <li key={title} className="flex gap-4 py-4">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent-fg" />
              <div>
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="mt-0.5 text-sm text-muted">{p}</p>
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
