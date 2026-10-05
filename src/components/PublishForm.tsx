'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { describedBy, Field, TagInput } from '@/components/Field';
import FormSkeleton from '@/components/FormSkeleton';
import { useT } from '@/components/I18n';
import { IAlert, IOk } from '@/components/Icons';
import ListingRow from '@/components/ListingRow';
import { friendlyError } from '@/lib/errors';
import { supabaseBrowser } from '@/lib/supabase';
import { oppKind } from '@/lib/utils';

const KINDS = { opportunity: ['Stage', 'Hackathon', 'Événement', 'Freelance'], mentor: ['Mentor', 'Collab'] };
const EMPTY = { kind: '', title: '', meta: '', body: '' };

export default function PublishForm() {
  const { t, locale } = useT();
  const [uid, setUid] = useState<string | null | undefined>(undefined);
  const [section, setSection] = useState<'opportunity' | 'mentor'>('opportunity');
  const [f, setF] = useState(EMPTY);
  const [tags, setTags] = useState<string[]>([]);
  const [msg, setMsg] = useState<'ok' | 'err' | null>(null);
  const [errText, setErrText] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { supabaseBrowser().auth.getSession().then(({ data }) => setUid(data.session?.user.id ?? null)); }, []);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;
    setTouched(true);
    if (f.kind.trim().length < 2 || f.title.trim().length < 3) return;
    setBusy(true); setMsg(null); setErrText(null);
    const { error } = await supabaseBrowser().from('listings').insert({ section, kind: f.kind.trim(), title: f.title.trim(), meta: f.meta.trim(), body: f.body.trim(), tags: tags.slice(0, 6), author_id: uid });
    setBusy(false);
    setMsg(error ? 'err' : 'ok');
    if (error) setErrText(friendlyError(error.message, t));
  }
  function again() { setF(EMPTY); setTags([]); setMsg(null); setTouched(false); }

  if (uid === undefined) return <FormSkeleton />;
  if (uid === null) {
    return <p className="rounded-lg border border-line bg-surface p-5">{t('pub.login')} <Link href="/login" className="font-semibold text-accent-fg underline">{t('h.login')}</Link></p>;
  }

  if (msg === 'ok') {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-leaf-500/40 bg-leaf-500/[0.06] p-6" role="status">
        <h1 className="flex items-center gap-2 text-xl font-bold text-success"><IOk className="h-5 w-5" />{t('pub.ok.h')}</h1>
        <p className="mt-2 text-sm text-muted">{t('pub.ok')}</p>
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
  const preview = { title: f.title.trim() || t('pub.untitled'), meta: f.meta.trim(), kind: f.kind.trim(), tags, text: f.body.trim(), author: undefined };

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
            <ListingRow i={preview} locale={locale} labels={{ members: '', weekly: '' }} />
          </ul>
        </aside>
      </div>
    </div>
  );
}
