'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import CountrySelect from '@/components/CountrySelect';
import { describedBy, Field, TagInput } from '@/components/Field';
import FormSkeleton from '@/components/FormSkeleton';
import { useT } from '@/components/I18n';
import { IAlert, IOk } from '@/components/Icons';
import ListingRow from '@/components/ListingRow';
import { norm } from '@/lib/countries';
import { todayISO } from '@/lib/dates';
import { friendlyError, isMissingColumn } from '@/lib/errors';
import { supabaseBrowser } from '@/lib/supabase';
import { CHALLENGE_KIND, oppKind } from '@/lib/utils';

const KINDS = { opportunity: ['Stage', 'Hackathon', 'Événement', 'Freelance', CHALLENGE_KIND], mentor: ['Mentor', 'Collab'] };
const EMPTY = { kind: '', title: '', meta: '', body: '', start: '', end: '' };
/** Catégories pour lesquelles les dates sont recommandées (hackathon, événement, défi / concours). */
const wantsDates = (kind: string) => /hackathon|evenement|event|defi|concours|challenge|contest/.test(norm(kind));

export default function PublishForm() {
  const { t, locale } = useT();
  const [uid, setUid] = useState<string | null | undefined>(undefined);
  const [section, setSection] = useState<'opportunity' | 'mentor'>('opportunity');
  const [f, setF] = useState(EMPTY);
  const [tags, setTags] = useState<string[]>([]);
  const [country, setCountry] = useState('');
  const [today, setToday] = useState<string | null>(null);
  const [partial, setPartial] = useState(false);
  const [msg, setMsg] = useState<'ok' | 'err' | null>(null);
  const [errText, setErrText] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { supabaseBrowser().auth.getSession().then(({ data }) => setUid(data.session?.user.id ?? null)); setToday(todayISO()); }, []);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;
    setTouched(true);
    if (f.kind.trim().length < 2 || f.title.trim().length < 3 || (isOpp && datesBad)) return;
    setBusy(true); setMsg(null); setErrText(null); setPartial(false);
    const base = { section, kind: f.kind.trim(), title: f.title.trim(), meta: f.meta.trim(), body: f.body.trim(), tags: tags.slice(0, 6), author_id: uid };
    const extra = isOpp ? { start_date: f.start || null, end_date: f.end || null, country: country || null } : {};
    const usedExtra = Object.values(extra).some((v) => v);
    const sb = supabaseBrowser();
    let { error } = await sb.from('listings').insert({ ...base, ...extra });
    // Tolérance : colonnes start_date / end_date / country absentes tant que schema-v6 n'est pas appliqué -> on retente sans.
    if (error && isMissingColumn(error) && Object.keys(extra).length) {
      ({ error } = await sb.from('listings').insert(base));
      if (!error && usedExtra) setPartial(true);
    }
    setBusy(false);
    setMsg(error ? 'err' : 'ok');
    if (error) setErrText(friendlyError(error.message, t)); else window.scrollTo({ top: 0 });
  }
  function again() { setF(EMPTY); setTags([]); setCountry(''); setPartial(false); setMsg(null); setTouched(false); }

  if (uid === undefined) return <FormSkeleton />;
  if (uid === null) {
    return <p className="rounded-lg border border-line bg-surface p-5">{t('pub.login')} <Link href="/login" className="font-semibold text-accent-fg underline">{t('h.login')}</Link></p>;
  }

  if (msg === 'ok') {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-leaf-500/40 bg-leaf-500/[0.06] p-6" role="status">
        <h1 className="flex items-center gap-2 text-xl font-bold text-success"><IOk className="h-5 w-5" />{t('pub.ok.h')}</h1>
        <p className="mt-2 text-sm text-muted">{t('pub.ok')}</p>
        {partial && <p className="mt-3 flex items-start gap-2 rounded-md border border-gold-400/40 bg-gold-400/10 px-3 py-2 text-sm text-warm"><IAlert className="mt-0.5 h-4 w-4 shrink-0" />{t('pub.partial')}</p>}
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={section === 'mentor' ? '/mentors' : '/opportunites'} className="btn btn-primary">{t('pub.see')}</Link>
          <button type="button" onClick={again} className="btn btn-secondary">{t('pub.again')}</button>
        </div>
      </div>
    );
  }

  const seg = (on: boolean) => `flex min-h-11 flex-1 items-center justify-center rounded px-3 text-sm font-semibold md:min-h-9 ${on ? 'bg-surface text-fg shadow-[0_0_0_1px_var(--line)]' : 'text-muted hover:text-fg'}`;
  const kindErr = touched && f.kind.trim().length < 2 ? t('pub.err.kind') : null;
  const titleErr = touched && f.title.trim().length < 3 ? t('err.title3') : null;
  const isOpp = section === 'opportunity';
  const datesBad = Boolean(f.start && f.end && f.end < f.start);
  const endErr = datesBad ? t('pub.err.dates') : null;
  const recommend = isOpp && wantsDates(f.kind) && !f.start && !f.end;
  const preview = {
    title: f.title.trim() || t('pub.untitled'), meta: f.meta.trim(), kind: f.kind.trim(), tags, text: f.body.trim(), author: undefined,
    startDate: isOpp && !datesBad ? f.start || null : null, endDate: isOpp && !datesBad ? f.end || null : null, country: isOpp ? country || null : null,
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold">{t('pub.h')}</h1>
      <p className="mt-1 max-w-2xl text-muted">{t('pub.p')}</p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <form onSubmit={submit} className="space-y-5" noValidate>
          <fieldset>
            <legend className="mb-1.5 text-sm font-semibold">{t('pub.section')}</legend>
            <div className="flex rounded-md border border-line bg-surface-2 p-0.5">
              {(['opportunity', 'mentor'] as const).map((s) => (
                <button type="button" key={s} aria-pressed={section === s} onClick={() => { setSection(s); if (KINDS.opportunity.includes(f.kind) || KINDS.mentor.includes(f.kind)) setF({ ...f, kind: '' }); }} className={seg(section === s)}>{s === 'opportunity' ? t('pub.opp') : t('pub.mentor')}</button>
              ))}
            </div>
          </fieldset>

          <div>
            <Field id="pb-kind" label={t('pub.kind.l')} error={kindErr}>
              <input id="pb-kind" className="input" required maxLength={30} value={f.kind} onChange={set('kind')} aria-invalid={!!kindErr} aria-describedby={[describedBy('pb-kind', { error: !!kindErr }), 'pb-kinds'].filter(Boolean).join(' ')} autoComplete="off" />
            </Field>
            <div id="pb-kinds" className="mt-2 flex flex-wrap items-center gap-1.5" role="group" aria-label={t('pub.kinds')}>
              {KINDS[section].map((k) => (
                <button key={k} type="button" aria-pressed={f.kind === k} onClick={() => setF({ ...f, kind: k })} className={`chip tap !text-[13px] ${f.kind === k ? '!border-brand-600 !bg-brand-600 !text-white' : ''}`}>{oppKind(k, locale)}</button>
              ))}
            </div>
          </div>

          <Field id="pb-title" label={t('pub.title')} error={titleErr} counter={{ n: f.title.trim().length, min: 3, max: 140 }}>
            <input id="pb-title" className="input" required maxLength={140} placeholder={t('pub.title.ph')} value={f.title} onChange={set('title')} aria-invalid={!!titleErr} aria-describedby={describedBy('pb-title', { counter: true, error: !!titleErr })} />
          </Field>
          {isOpp && (
            <fieldset>
              <legend className="sr-only">{t('pub.start')} / {t('pub.end')}</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="pb-start" label={t('pub.start')} optional={t('p.opt')}>
                  <input id="pb-start" type="date" className="input" value={f.start} max={f.end || undefined} onChange={set('start')} aria-describedby="pb-dates-hint" />
                </Field>
                <Field id="pb-end" label={t('pub.end')} optional={t('p.opt')} error={endErr}>
                  <input id="pb-end" type="date" className="input" value={f.end} min={f.start || undefined} onChange={set('end')} aria-invalid={!!endErr} aria-describedby={[describedBy('pb-end', { error: !!endErr }), 'pb-dates-hint'].filter(Boolean).join(' ')} />
                </Field>
              </div>
              <p id="pb-dates-hint" className={`mt-1.5 text-xs ${recommend ? 'font-medium text-warm' : 'text-subtle'}`}>{recommend ? t('pub.dates.reco') : t('pub.dates.hint')}</p>
            </fieldset>
          )}
          {isOpp && (
            <Field id="pb-country" label={t('pub.country.l')} hint={t('pub.country.hint')} optional={t('p.opt')}>
              <CountrySelect id="pb-country" value={country} onChange={setCountry} allowAll describedBy="pb-country-hint" />
            </Field>
          )}
          <Field id="pb-meta" label={t('pub.meta')} optional={t('p.opt')}>
            <input id="pb-meta" className="input" placeholder={t('pub.meta.ph')} value={f.meta} onChange={set('meta')} />
          </Field>
          <Field id="pb-body" label={t('pub.body')} counter={{ n: f.body.trim().length, max: 500 }} optional={t('p.opt')}>
            <textarea id="pb-body" className="input min-h-32" maxLength={500} value={f.body} onChange={set('body')} aria-describedby="pb-body-count" />
          </Field>
          <TagInput id="pb-tags" label={t('ask.tags.l')} value={tags} onChange={setTags} max={6} />

          <div aria-live="polite" className="empty:hidden">
            {msg === 'err' && <p className="flex items-start gap-2 rounded-md border border-red-600/40 bg-red-600/10 px-3 py-2 text-sm text-red-800 dark:text-red-300"><IAlert className="mt-0.5 h-4 w-4 shrink-0" />{errText ?? t('pub.err')}</p>}
          </div>
          <button className="btn btn-primary" disabled={busy || !uid} aria-busy={busy}>{busy ? t('busy.pub') : t('pub.send')}</button>
        </form>

        <aside aria-label={t('pub.preview')} className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-subtle">{t('pub.preview')}</h2>
          <ul className="overflow-hidden rounded-lg border border-line bg-surface">
            <ListingRow i={preview} locale={locale} today={today} />
          </ul>
        </aside>
      </div>
    </div>
  );
}
