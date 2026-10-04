'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useT } from '@/components/I18n';
import { supabaseBrowser } from '@/lib/supabase';
import { parseTags } from '@/lib/utils';
import type { Key } from '@/lib/i18n';

const OPEN: { v: string; k: Key }[] = [
  { v: 'mentor', k: 'p.o.mentor' }, { v: 'collab', k: 'p.o.collab' }, { v: 'work', k: 'p.o.work' },
];
const EMPTY = { username: '', full_name: '', country: '', headline: '', bio: '', stack: '', github_url: '', website_url: '', languages: '', years_exp: '' };
const isUrl = (v: string) => !v.trim() || /^https?:\/\//.test(v.trim());

export default function ProfilePage() {
  const { t } = useT();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [f, setF] = useState(EMPTY);
  const [open, setOpen] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const { data: s } = await sb.auth.getSession();
      const uid = s.session?.user.id ?? null;
      setUserId(uid);
      if (uid) {
        const { data } = await sb.from('profiles').select('*').eq('id', uid).single();
        if (data) {
          setF({
            username: data.username ?? '', full_name: data.full_name ?? '', country: data.country ?? '',
            headline: data.headline ?? '', bio: data.bio ?? '', stack: (data.stack ?? []).join(', '),
            github_url: data.github_url ?? '', website_url: data.website_url ?? '',
            languages: (data.languages ?? []).join(', '), years_exp: data.years_exp?.toString() ?? '',
          });
          setOpen(data.open_to ?? []);
        }
      }
      setReady(true);
    })();
  }, []);

  const fields = [f.full_name, f.country, f.headline, f.bio, f.stack, f.github_url, f.languages];
  const pct = Math.round(((fields.filter((x) => x.trim()).length + (open.length ? 1 : 0)) / (fields.length + 1)) * 100);
  const initials = (f.full_name || f.username || '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!/^[a-zA-Z0-9_.-]{3,}$/.test(f.username.trim())) return setMsg({ ok: false, text: t('err.user') });
    if (!isUrl(f.github_url) || !isUrl(f.website_url)) return setMsg({ ok: false, text: t('err.url') });
    const years = f.years_exp.trim() === '' ? null : Math.min(60, Math.max(0, parseInt(f.years_exp, 10) || 0));
    setBusy(true);
    const { error } = await supabaseBrowser().from('profiles').update({
      username: f.username.trim(), full_name: f.full_name.trim() || null, country: f.country.trim() || null,
      headline: f.headline.trim().slice(0, 80) || null, bio: f.bio.trim() || null, stack: parseTags(f.stack),
      github_url: f.github_url.trim() || null, website_url: f.website_url.trim() || null,
      languages: parseTags(f.languages), years_exp: years, open_to: open,
    }).eq('id', userId);
    setBusy(false);
    setMsg(error ? { ok: false, text: error.code === '23505' ? t('err.taken') : error.message } : { ok: true, text: t('p.saved') });
  }

  if (!ready) return null;
  if (!userId) {
    return (
      <p>
        <Link href="/login" className="font-semibold text-brand-600 underline">{t('lnk.login')}</Link>{t('lnk.profile')}
      </p>
    );
  }
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="kente rounded-full" aria-hidden="true" />
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 text-xl font-black text-white">{initials}</div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{t('p.h')}</h1>
          {f.username && <Link href={`/u/${f.username}`} className="text-sm font-semibold text-brand-600">{t('p.view')}</Link>}
        </div>
      </div>
      <div>
        <p className="mb-1 text-sm font-medium" aria-live="polite">{t('p.done').replace('{n}', String(pct))}</p>
        <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-gold-400 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <form onSubmit={save} className="space-y-3">
        <input className="input" placeholder={t('p.user')} value={f.username} onChange={set('username')} />
        <input className="input" placeholder={t('p.name')} value={f.full_name} onChange={set('full_name')} />
        <input className="input" maxLength={80} placeholder={t('p.head')} value={f.headline} onChange={set('headline')} />
        <input className="input" placeholder={t('p.country')} value={f.country} onChange={set('country')} />
        <textarea className="input min-h-24" placeholder={t('p.bio')} value={f.bio} onChange={set('bio')} />
        <input className="input" placeholder={t('p.stack')} value={f.stack} onChange={set('stack')} />
        <input className="input" placeholder={t('p.lang')} value={f.languages} onChange={set('languages')} />
        <input className="input" type="number" min={0} max={60} placeholder={t('p.years')} value={f.years_exp} onChange={set('years_exp')} />
        <input className="input" placeholder={t('p.gh')} value={f.github_url} onChange={set('github_url')} />
        <input className="input" placeholder={t('p.site')} value={f.website_url} onChange={set('website_url')} />
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">{t('p.open')}</legend>
          <div className="flex flex-wrap gap-2">
            {OPEN.map((o) => (
              <button type="button" key={o.v} aria-pressed={open.includes(o.v)} className={`chip ${open.includes(o.v) ? '!bg-brand-600 !text-white' : ''}`}
                onClick={() => setOpen(open.includes(o.v) ? open.filter((x) => x !== o.v) : [...open, o.v])}>{t(o.k)}</button>
            ))}
          </div>
        </fieldset>
        {msg && <p role="status" className={`text-sm ${msg.ok ? 'text-brand-600' : 'text-red-600'}`}>{msg.text}</p>}
        <button type="submit" disabled={busy} className="btn btn-primary">{busy ? t('p.saving') : t('p.save')}</button>
        <button type="button" className="btn btn-outline ml-2" onClick={async () => { await supabaseBrowser().auth.signOut(); router.push('/'); router.refresh(); }}>{t('h.logout')}</button>
      </form>
    </div>
  );
}
