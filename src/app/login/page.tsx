'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Field } from '@/components/Field';
import { useT } from '@/components/I18n';
import { GlassPanel, LiquidGlassBackground } from '@/components/LiquidGlass';
import { IAlert, IEye, IEyeOff, IGlobe, IOffline, IChat, IOk } from '@/components/Icons';
import { friendlyError } from '@/lib/errors';
import { supabaseBrowser } from '@/lib/supabase';
import { passwordOk, safeNext } from '@/lib/utils';

const USER_RE = /^[a-zA-Z0-9_.-]{3,}$/;
const CODE_CHARS = ['<', '>', '{', '}', ';', '/', '=', '(', ')', '*', '#'];

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- v12 : particules de code ---------- */
function CodeParticles() {
  const [parts, setParts] = useState<Array<{ id: number; char: string; x: number; delay: number; dur: number; size: number }>>([]);
  useEffect(() => {
    if (reduced()) { setParts([]); return; }
    setParts(Array.from({ length: 18 }, (_, i) => ({
      id: i, char: CODE_CHARS[i % CODE_CHARS.length],
      x: Math.random() * 100, delay: Math.random() * 8, dur: 6 + Math.random() * 6, size: 11 + Math.random() * 12,
    })));
  }, []);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {parts.map(p => (
        <span key={p.id} className="anim-particle absolute font-mono text-brand-500/35 dark:text-brand-300/30"
          style={{ left: `${p.x}%`, fontSize: p.size, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }}>
          {p.char}
        </span>
      ))}
    </div>
  );
}

/* ---------- v6 : checkmark anime (SVG) ---------- */
function AnimatedCheck({ ok }: { ok: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className="mt-px h-4 w-4 shrink-0">
      <circle cx="20" cy="20" r="16" fill="none"
        stroke={ok ? '#279160' : 'var(--line-strong)'} strokeWidth="2"
        strokeDasharray="100.5" strokeDashoffset={ok ? 0 : 100.5}
        className="transition-[stroke-dashoffset] duration-700 ease-out" />
      {ok && (
        <path d="M13 20.5 18 25.5 28 15" fill="none" stroke="#279160" strokeWidth="3"
          strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="30" strokeDashoffset="30"
          style={{ animation: 'check-draw 0.5s ease-out 0.4s forwards' }} />
      )}
    </svg>
  );
}

function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className={`flex items-start gap-2 text-xs ${ok ? 'text-success' : 'text-subtle'}`}>
      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${ok ? 'border-transparent' : 'border-line-strong'}`}>
        <AnimatedCheck ok={ok} />
      </span>
      <span>{children}</span>
    </li>
  );
}

export default function LoginPage() {
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

  const panelRef = useRef<HTMLDivElement>(null);
  const panelWrapRef = useRef<HTMLDivElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const submitWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sb = supabaseBrowser();
    sb.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u) setMe((u.user_metadata?.username as string | undefined) ?? u.email ?? '');
    }).catch(() => {});
    // Retour du lien de confirmation par e-mail (?code=…) : la session vient d'être créée => on entre directement.
    const { data: sub } = sb.auth.onAuthStateChange((ev, session) => {
      const p = new URLSearchParams(window.location.search);
      if (ev === 'SIGNED_IN' && session && (p.has('code') || window.location.hash.includes('access_token'))) {
        window.location.assign(safeNext(p.get('next')));
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  /* v8 : ombre portee dynamique qui suit la souris */
  useEffect(() => {
    const wrap = panelWrapRef.current, panel = panelRef.current;
    if (!wrap || !panel || reduced()) return;
    const onMove = (e: MouseEvent) => {
      const r = panel.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) / r.width;
      const y = (e.clientY - r.top - r.height / 2) / r.height;
      panel.style.boxShadow = `${-x * 20}px ${-y * 20}px 36px rgb(0 0 0 / 0.10)`;
    };
    const onLeave = () => { panel.style.boxShadow = ''; };
    wrap.addEventListener('mousemove', onMove);
    wrap.addEventListener('mouseleave', onLeave);
    return () => { wrap.removeEventListener('mousemove', onMove); wrap.removeEventListener('mouseleave', onLeave); };
  }, []);

  /* v7 : bouton magnetique */
  useEffect(() => {
    const wrap = submitWrapRef.current, btn = submitBtnRef.current;
    if (!wrap || !btn || reduced()) return;
    const onMove = (e: MouseEvent) => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px, ${(e.clientY - r.top - r.height / 2) * 0.2}px)`;
    };
    const onLeave = () => { btn.style.transform = ''; };
    wrap.addEventListener('mousemove', onMove);
    wrap.addEventListener('mouseleave', onLeave);
    return () => { wrap.removeEventListener('mousemove', onMove); wrap.removeEventListener('mouseleave', onLeave); };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (signup && !USER_RE.test(username.trim())) {
      return setError(t('err.user'));
    }
    if (signup ? !passwordOk(password) : password.length === 0) return setError(signup ? t('err.pass') : t('err.creds'));
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
    // Navigation complète : la session (cookie) est alors lue par le serveur dès la première requête.
    window.location.assign(safeNext(new URLSearchParams(window.location.search).get('next')));
  }

  async function forgot() {
    setError(null);
    setInfo(null);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return setError(t('login.reset.need'));
    setBusy(true);
    try {
      await supabaseBrowser().auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset` });
    } catch { /* même réponse dans tous les cas : ne révèle pas l'existence du compte */ }
    setBusy(false);
    setInfo(t('login.reset.sent'));
  }

  const tab = (on: boolean) =>
    `flex min-h-11 flex-1 items-center justify-center rounded px-3 text-sm font-semibold transition md:min-h-9 ${on ? 'bg-surface text-fg shadow-[0_0_0_1px_var(--line)]' : 'text-muted hover:text-fg'}`;
  const FACTS = [
    { Icon: IChat, t: t('login.f1.t'), p: t('login.f1.p') },
    { Icon: IOffline, t: t('login.f2.t'), p: t('login.f2.p') },
    { Icon: IGlobe, t: t('login.f3.t'), p: t('login.f3.p') },
  ];

  return (
    <div className="relative">
      <LiquidGlassBackground />
      <CodeParticles />

      {/* v9 : bande kente qui se dessine */}
      <div className="anim-kente-bar absolute left-0 right-0 top-0 h-1.5" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-5xl gap-8 py-10 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-16 lg:pt-14">
        <div ref={panelWrapRef}>
          <GlassPanel ref={panelRef} className="reveal transition-shadow duration-200 ease-out">
            <h1 key={`title-${signup}`} className="dev-reflow text-2xl font-bold">{signup ? t('login.title.up') : t('login.title.in')}</h1>

            {/* Prompt terminal : theme developpeur */}
            <div className="dev-prompt mt-3 flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap rounded-md px-3 py-2">
              <span className="tok-k">~/afidevhub</span>
              <span className="text-slate-500">$</span>
              <span key={`cmd-${signup}`} className="dev-reflow tok-f">{signup ? 'sign-up' : 'sign-in'}</span>
              <span className="caret" aria-hidden="true" />
            </div>

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

            {/* v11 : slide horizontal du contenu au changement de mode */}
            <div className="mt-5 overflow-hidden" key={`slider-${signup}`}>
              <div className={signup ? 'anim-slide-left' : 'anim-slide-right'}>
                <form onSubmit={submit} className="space-y-4" noValidate>
                  <div className="dev-reveal" data-open={signup}>
                    <div className="dev-reveal-inner">
                      <Field id="lg-user" label={t('login.user')}>
                        <input id="lg-user" className="input" autoComplete="username" autoCapitalize="none" spellCheck={false} value={username} onChange={(e) => setUsername(e.target.value)} aria-describedby="lg-rules" required />
                      </Field>
                    </div>
                  </div>
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

                  <div className="dev-reveal" data-open={signup}>
                    <div className="dev-reveal-inner">
                      <ul id="lg-rules" className="space-y-1.5">
                        <Rule ok={USER_RE.test(username.trim())}>{t('login.rule.user')}</Rule>
                        <Rule ok={passwordOk(password)}>{t('login.rule.pass')}</Rule>
                      </ul>
                    </div>
                  </div>

                  <div aria-live="polite" className="empty:hidden">
                    {error && <p className="flex items-start gap-2 rounded-md border border-red-600/40 bg-red-600/10 px-3 py-2 text-sm text-red-800 dark:text-red-300"><IAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
                    {info && <p className="flex items-start gap-2 rounded-md border border-leaf-500/40 bg-leaf-500/10 px-3 py-2 text-sm text-success"><IOk className="mt-0.5 h-4 w-4 shrink-0" />{info}</p>}
                  </div>

                  <div className="dev-reveal" data-open={signup}>
                    <div className="dev-reveal-inner">
                      <p className="text-xs leading-relaxed text-muted">
                        {t('login.consent').split(/({terms}|{privacy})/).map((part, i) =>
                          part === '{terms}' ? <Link key={i} href="/conditions" target="_blank" className="font-medium text-accent-fg underline underline-offset-2">{t('legal.terms')}</Link>
                          : part === '{privacy}' ? <Link key={i} href="/confidentialite" target="_blank" className="font-medium text-accent-fg underline underline-offset-2">{t('legal.privacy')}</Link>
                          : part)}
                      </p>
                    </div>
                  </div>

                  <div ref={submitWrapRef}>
                    <button ref={submitBtnRef} type="submit" disabled={busy} aria-busy={busy} className="btn btn-primary w-full transition-transform duration-200 ease-out">
                      {busy ? t('login.busy') : signup ? t('login.create') : t('login.in')}
                    </button>
                  </div>
                  {!signup && (
                    <p className="text-center">
                      <button type="button" onClick={forgot} disabled={busy} className="min-h-11 text-sm font-medium text-accent-fg underline underline-offset-2 md:min-h-9">{t('login.forgot')}</button>
                    </p>
                  )}
                </form>
              </div>
            </div>
          </GlassPanel>
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
    </div>
  );
}
