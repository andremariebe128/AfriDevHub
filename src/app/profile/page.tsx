'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Avatar from '@/components/Avatar';
import { Field, TagInput } from '@/components/Field';
import FormSkeleton from '@/components/FormSkeleton';
import { useT } from '@/components/I18n';
import { IAlert, IArrow, ILogout, IOk } from '@/components/Icons';
import { COUNTRIES } from '@/lib/seed';
import { friendlyError } from '@/lib/errors';
import { supabaseBrowser } from '@/lib/supabase';
import { parseTags } from '@/lib/utils';
import type { Key } from '@/lib/i18n';

const OPEN: { v: string; k: Key }[] = [
  { v: 'mentor', k: 'p.o.mentor' }, { v: 'collab', k: 'p.o.collab' }, { v: 'work', k: 'p.o.work' },
];
const EMPTY = { username: '', full_name: '', country: '', headline: '', bio: '', github_url: '', website_url: '', years_exp: '' };
const isUrl = (v: string) => !v.trim() || /^https?:\/\//.test(v.trim());

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-line py-6 md:grid-cols-[12rem_1fr] md:gap-8">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export default function ProfilePage() {
  const { t } = useT();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [f, setF] = useState(EMPTY);
  const [stack, setStack] = useState<string[]>([]);
  const [langs, setLangs] = useState<string[]>([]);
  const [open, setOpen] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);
  const [loadFail, setLoadFail] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const sb = supabaseBrowser();
      let uid: string | null = null;
      try {
        const { data: s } = await sb.auth.getSession();
        uid = s.session?.user.id ?? null;
      } catch {}
      if (!alive) return;
      setUserId(uid);
      setReady(true); // le formulaire s'affiche dès que la session est connue
      if (!uid) return;
      setLoadFail(false);
      try {
        const res = await Promise.race([
          sb.from('profiles').select('*').eq('id', uid).single(),
          new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 3500)),
        ]);
        if (!alive) return;
        const data = res.data;
        if (data) {
          setF({
            username: data.username ?? '', full_name: data.full_name ?? '', country: data.country ?? '',
            headline: data.headline ?? '', bio: data.bio ?? '',
            github_url: data.github_url ?? '', website_url: data.website_url ?? '', years_exp: data.years_exp?.toString() ?? '',
          });
          setStack(data.stack ?? []);
          setLangs(data.languages ?? []);
          setOpen(data.open_to ?? []);
        } else setLoadFail(true);
      } catch {
        if (alive) setLoadFail(true);
      }
    })();
    return () => { alive = false; };
  }, [attempt]);

  const filled = [f.full_name, f.country, f.headline, f.bio, f.github_url].filter((x) => x.trim()).length + (stack.length ? 1 : 0) + (langs.length ? 1 : 0) + (open.length ? 1 : 0);
  const pct = Math.round((filled / 8) * 100);
  const userErr = touched && !/^[a-zA-Z0-9_.-]{3,}$/.test(f.username.trim()) ? t('err.user') : null;
  const ghErr = !isUrl(f.github_url) ? t('err.url') : null;
  const webErr = !isUrl(f.website_url) ? t('err.url') : null;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setTouched(true);
    if (!/^[a-zA-Z0-9_.-]{3,}$/.test(f.username.trim())) return setMsg({ ok: false, text: t('err.user') });
    if (!isUrl(f.github_url) || !isUrl(f.website_url)) return setMsg({ ok: false, text: t('err.url') });
    const years = f.years_exp.trim() === '' ? null : Math.min(60, Math.max(0, parseInt(f.years_exp, 10) || 0));
    setBusy(true);
    const { error } = await supabaseBrowser().from('profiles').update({
      username: f.username.trim(), full_name: f.full_name.trim() || null, country: f.country.trim() || null,
      headline: f.headline.trim().slice(0, 80) || null, bio: f.bio.trim() || null, stack: parseTags(stack.join(',')),
      github_url: f.github_url.trim() || null, website_url: f.website_url.trim() || null,
      languages: parseTags(langs.join(',')), years_exp: years, open_to: open,
    }).eq('id', userId);
    setBusy(false);
    setMsg(error ? { ok: false, text: error.code === '23505' ? t('err.taken') : friendlyError(error.message, t) } : { ok: true, text: t('p.saved') });
  }

  if (!ready) return <FormSkeleton narrow />;
  if (!userId) {
    return (
      <p className="rounded-lg border border-line bg-surface p-5">
        <Link href="/login" className="font-semibold text-accent-fg underline">{t('lnk.login')}</Link>{t('lnk.profile')}
      </p>
    );
  }
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <div className="mx-auto max-w-3xl">
      <header className="flex flex-wrap items-center gap-4 pb-6">
        <Avatar name={f.full_name || f.username || '?'} size={64} />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">{t('p.h')}</h1>
          {f.username && <Link href={`/u/${f.username}`} className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-accent-fg hover:underline md:min-h-8">{t('p.view')}<IArrow /></Link>}
        </div>
        <div className="w-full sm:w-64">
          <p className="mb-1.5 flex justify-between text-sm" aria-live="polite"><span className="font-medium">{t('p.done').replace('{n}', String(pct))}</span></p>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={t('p.done').replace('{n}', String(pct))}>
            <div className="h-full bg-brand-600 transition-all dark:bg-brand-400" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </header>

      {loadFail && (
        <p role="alert" className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-red-600/40 bg-red-600/10 px-3 py-2 text-sm text-red-800 dark:text-red-300">
          <IAlert className="h-4 w-4 shrink-0" />{t('p.loadfail')}
          <button type="button" onClick={() => setAttempt((n) => n + 1)} className="btn btn-secondary btn-sm">{t('ui.retry')}</button>
        </p>
      )}
      <form onSubmit={save} noValidate>
        <Section title={t('p.s.id')}>
          <Field id="pf-user" label={t('p.user')} hint={t('p.hint.user')} error={userErr}>
            <input id="pf-user" className="input" autoComplete="username" autoCapitalize="none" spellCheck={false} value={f.username} onChange={set('username')} aria-invalid={!!userErr} aria-describedby={userErr ? 'pf-user-err' : 'pf-user-hint'} />
          </Field>
          <Field id="pf-name" label={t('p.name')}>
            <input id="pf-name" className="input" autoComplete="name" value={f.full_name} onChange={set('full_name')} />
          </Field>
          <Field id="pf-head" label={t('p.head')} hint={t('p.hint.head')} counter={{ n: f.headline.length, max: 80 }}>
            <input id="pf-head" className="input" maxLength={80} value={f.headline} onChange={set('headline')} aria-describedby="pf-head-hint pf-head-count" />
          </Field>
          <Field id="pf-country" label={t('p.country')} hint={t('p.hint.country')}>
            <input id="pf-country" className="input" list="pf-countries" autoComplete="country-name" value={f.country} onChange={set('country')} aria-describedby="pf-country-hint" />
            <datalist id="pf-countries">{COUNTRIES.map((c) => <option key={c} value={c} />)}</datalist>
          </Field>
        </Section>

        <Section title={t('p.s.path')}>
          <Field id="pf-bio" label={t('p.bio')} optional={t('p.opt')}>
            <textarea id="pf-bio" className="input min-h-28" value={f.bio} onChange={set('bio')} />
          </Field>
          <TagInput id="pf-stack" label={t('p.stack')} value={stack} onChange={setStack} max={5} />
          <TagInput id="pf-langs" label={t('p.lang')} value={langs} onChange={setLangs} max={5} />
          <Field id="pf-years" label={t('p.years')} hint={t('p.hint.years')}>
            <input id="pf-years" className="input sm:max-w-[10rem]" type="number" inputMode="numeric" min={0} max={60} value={f.years_exp} onChange={set('years_exp')} aria-describedby="pf-years-hint" />
          </Field>
        </Section>

        <Section title={t('p.s.links')}>
          <Field id="pf-gh" label={t('p.gh')} hint={t('p.hint.url')} error={ghErr} optional={t('p.opt')}>
            <input id="pf-gh" className="input" type="url" inputMode="url" autoComplete="url" placeholder="https://github.com/…" value={f.github_url} onChange={set('github_url')} aria-invalid={!!ghErr} aria-describedby={ghErr ? 'pf-gh-err' : 'pf-gh-hint'} />
          </Field>
          <Field id="pf-web" label={t('p.site')} hint={t('p.hint.url')} error={webErr} optional={t('p.opt')}>
            <input id="pf-web" className="input" type="url" inputMode="url" autoComplete="url" placeholder="https://…" value={f.website_url} onChange={set('website_url')} aria-invalid={!!webErr} aria-describedby={webErr ? 'pf-web-err' : 'pf-web-hint'} />
          </Field>
        </Section>

        <Section title={t('p.s.open')}>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">{t('p.open')}</legend>
            <div className="flex flex-wrap gap-2">
              {OPEN.map((o) => {
                const on = open.includes(o.v);
                return (
                  <button type="button" key={o.v} aria-pressed={on} className={`chip min-h-11 !px-3.5 !text-sm md:min-h-9 ${on ? '!border-brand-600 !bg-brand-600 !text-white' : ''}`}
                    onClick={() => setOpen(on ? open.filter((x) => x !== o.v) : [...open, o.v])}>{on && <IOk className="h-3.5 w-3.5" />}{t(o.k)}</button>
                );
              })}
            </div>
          </fieldset>
        </Section>

        <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 -mx-4 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur-sm md:static md:mx-0 md:bg-transparent md:px-0 md:backdrop-blur-none">
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={busy} aria-busy={busy} className="btn btn-primary">{busy ? t('p.saving') : t('p.save')}</button>
            <div aria-live="polite" className="min-w-0 flex-1 empty:hidden">
              {msg && <p className={`flex items-center gap-1.5 text-sm font-medium ${msg.ok ? 'text-success' : 'text-red-700 dark:text-red-400'}`}>{msg.ok ? <IOk className="h-4 w-4 shrink-0" /> : <IAlert className="h-4 w-4 shrink-0" />}{msg.text}</p>}
            </div>
          </div>
        </div>
      </form>

      <section className="mt-8 grid gap-4 border-t border-line py-6 md:grid-cols-[12rem_1fr] md:gap-8" aria-labelledby="pf-session">
        <h2 id="pf-session" className="text-base font-semibold">{t('p.s.session')}</h2>
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-sm text-muted">{t('p.session.p')}</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={async () => { await supabaseBrowser().auth.signOut(); router.push('/'); router.refresh(); }}><ILogout />{t('h.logout')}</button>
        </div>
      </section>
    </div>
  );
}
