'use client';
import { useEffect, useId, useState } from 'react';
import { cvPeriod } from '@/components/CvTimeline';
import { describedBy, Field } from '@/components/Field';
import { useT } from '@/components/I18n';
import { IBriefcase, IAward, IDown, IEdit, IFolder, IGrad, IPlus, ITrash, IUp } from '@/components/Icons';
import { CV_MAX, CV_TYPES, newCvId, validateCv, type CvEntry, type CvIssue, type CvType } from '@/lib/cv';
import { safeUrl } from '@/lib/utils';

const ICONS: Record<CvType, (p: { className?: string }) => React.ReactElement> = { experience: IBriefcase, education: IGrad, project: IFolder, certification: IAward };
type Draft = { id: string | null; type: CvType; title: string; org: string; start: string; end: string; current: boolean; description: string; url: string };
const BLANK: Draft = { id: null, type: 'experience', title: '', org: '', start: '', end: '', current: false, description: '', url: '' };

/** Liste ordonnable des entrées du parcours (ajout, modification, suppression, haut / bas). Enregistrée avec le profil. */
export default function CvEditor({ value, onChange }: { value: CvEntry[]; onChange: (v: CvEntry[]) => void }) {
  const { t, locale } = useT();
  const uid = useId();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [touched, setTouched] = useState(false);

  const issues: CvIssue[] = draft ? validateCv({ title: draft.title, start: draft.start, end: draft.end || null, current: draft.current, url: draft.url || null }) : [];
  const err = (k: CvIssue) => (touched && issues.includes(k) ? t(`cv.err.${k}` as const) : null);
  const full = value.length >= CV_MAX;
  const fmtId = `${uid}-monthfmt`;
  const isOpen = draft !== null;
  const draftKey = draft?.id ?? 'new';

  // Focus : à l'ouverture de l'éditeur (ou changement d'entrée), sur le champ Titre.
  useEffect(() => {
    if (isOpen) document.getElementById(`${uid}-title`)?.focus();
  }, [isOpen, draftKey, uid]);

  function openNew() { setDraft({ ...BLANK }); setTouched(false); }
  function openEdit(e: CvEntry) {
    setDraft({ id: e.id, type: e.type, title: e.title, org: e.org, start: e.start, end: e.end ?? '', current: e.current, description: e.description, url: e.url ?? '' });
    setTouched(false);
  }
  function submit() {
    if (!draft) return;
    setTouched(true);
    if (issues.length) {
      // Focus sur le premier champ invalide.
      const first = issues.includes('title') ? 'title' : issues.includes('start') ? 'start' : issues.includes('end') || issues.includes('order') ? 'end' : 'url';
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    const entry: CvEntry = {
      id: draft.id ?? newCvId(), type: draft.type, title: draft.title.trim(), org: draft.org.trim(), start: draft.start,
      end: draft.current ? null : draft.end, current: draft.current, description: draft.description.trim(), url: draft.url.trim() ? safeUrl(draft.url) : null,
    };
    onChange(draft.id ? value.map((x) => (x.id === draft.id ? entry : x)) : [...value, entry]);
    setDraft(null);
  }
  function move(i: number, d: -1 | 1) {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }
  const up = (k: keyof Draft, v: string | boolean) => setDraft((d) => (d ? { ...d, [k]: v } : d));
  const iconBtn = 'tap flex h-11 w-11 items-center justify-center rounded-md text-subtle transition hover:bg-surface-2 hover:text-fg disabled:pointer-events-none disabled:opacity-35 md:h-9 md:w-9';

  return (
    <div className="space-y-3">
      <p className="text-xs text-subtle">{t('cv.hint').replace('{n}', String(CV_MAX))} <span className="font-mono tabular">{value.length}/{CV_MAX}</span></p>

      {value.length === 0 && !draft && <p className="rounded-lg border border-dashed border-line-strong p-4 text-sm text-muted">{t('cv.empty')}</p>}

      {value.length > 0 && (
        <ol className="overflow-hidden rounded-lg border border-line bg-surface">
          {value.map((e, i) => {
            const Icon = ICONS[e.type];
            return (
              <li key={e.id} className="flex flex-wrap items-center gap-x-2 border-b border-line py-1.5 pl-3 pr-1 last:border-b-0">
                <Icon className="h-4 w-4 shrink-0 text-subtle" />
                <div className="min-w-[10rem] flex-1 py-1">
                  <p className="break-words text-sm font-semibold">{e.title}</p>
                  <p className="break-words text-xs text-subtle">{t(`cv.t.${e.type}` as const)}{e.org ? ` · ${e.org}` : ''} · {cvPeriod(e, locale, t)}</p>
                </div>
                <div className="ml-auto flex shrink-0 items-center">
                  <button type="button" className={iconBtn} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`${t('cv.up')} : ${e.title}`}><IUp className="h-4 w-4" /></button>
                  <button type="button" className={iconBtn} onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label={`${t('cv.down')} : ${e.title}`}><IDown className="h-4 w-4" /></button>
                  <button type="button" className={iconBtn} onClick={() => openEdit(e)} aria-label={`${t('cv.edit')} : ${e.title}`}><IEdit className="h-4 w-4" /></button>
                  <button type="button" className={`${iconBtn} hover:!text-red-700 dark:hover:!text-red-400`} onClick={() => onChange(value.filter((x) => x.id !== e.id))} aria-label={`${t('cv.remove')} : ${e.title}`}><ITrash /></button>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {draft ? (
        <div className="space-y-4 rounded-lg border border-line-strong bg-surface-2/50 p-4" role="group" aria-label={draft.id ? t('cv.submit.edit') : t('cv.add')}>
          <fieldset>
            <legend className="mb-1.5 text-sm font-semibold">{t('cv.type')}</legend>
            <div className="flex flex-wrap gap-1.5">
              {CV_TYPES.map((ty) => (
                <button key={ty} type="button" aria-pressed={draft.type === ty} onClick={() => up('type', ty)} className={`chip min-h-11 !px-3 !text-sm md:min-h-9 ${draft.type === ty ? '!border-brand-600 !bg-brand-600 !text-white' : ''}`}>{t(`cv.t.${ty}` as const)}</button>
              ))}
            </div>
          </fieldset>
          <Field id={`${uid}-title`} label={t('cv.title')} error={err('title')} counter={{ n: draft.title.trim().length, min: 2, max: 100 }}>
            <input id={`${uid}-title`} className="input" maxLength={100} value={draft.title} onChange={(e) => up('title', e.target.value)} aria-invalid={!!err('title')} aria-describedby={describedBy(`${uid}-title`, { counter: true, error: !!err('title') })} />
          </Field>
          <Field id={`${uid}-org`} label={t('cv.org')} optional={t('p.opt')}>
            <input id={`${uid}-org`} className="input" maxLength={100} value={draft.org} onChange={(e) => up('org', e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id={`${uid}-start`} label={t('cv.start')} error={err('start')}>
              <input id={`${uid}-start`} className="input" type="month" placeholder="2024-03" pattern="\d{4}-\d{2}" value={draft.start} onChange={(e) => up('start', e.target.value)} aria-invalid={!!err('start')} aria-describedby={[describedBy(`${uid}-start`, { error: !!err('start') }), fmtId].filter(Boolean).join(' ')} />
            </Field>
            <Field id={`${uid}-end`} label={t('cv.end')} error={draft.current ? null : err('end') ?? err('order')}>
              <input id={`${uid}-end`} className="input" type="month" placeholder="2025-06" pattern="\d{4}-\d{2}" min={draft.start || undefined} disabled={draft.current} value={draft.current ? '' : draft.end} onChange={(e) => up('end', e.target.value)} aria-invalid={!draft.current && !!(err('end') ?? err('order'))} aria-describedby={[describedBy(`${uid}-end`, { error: !draft.current && !!(err('end') ?? err('order')) }), fmtId].filter(Boolean).join(' ')} />
            </Field>
          </div>
          <p id={fmtId} className="-mt-2 text-xs text-subtle">{t('month.fmt')}</p>
          <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm md:min-h-8">
            <input type="checkbox" className="h-4 w-4 accent-[var(--accent)]" checked={draft.current} onChange={(e) => up('current', e.target.checked)} />
            {t('cv.current')}
          </label>
          <Field id={`${uid}-desc`} label={t('cv.desc')} optional={t('p.opt')} counter={{ n: draft.description.trim().length, max: 300 }}>
            <textarea id={`${uid}-desc`} className="input min-h-20" maxLength={300} value={draft.description} onChange={(e) => up('description', e.target.value)} aria-describedby={describedBy(`${uid}-desc`, { counter: true })} />
          </Field>
          <Field id={`${uid}-url`} label={t('cv.url')} optional={t('p.opt')} error={err('url')} hint={t('p.hint.url')}>
            <input id={`${uid}-url`} className="input" type="url" inputMode="url" placeholder="https://…" value={draft.url} onChange={(e) => up('url', e.target.value)} aria-invalid={!!err('url')} aria-describedby={describedBy(`${uid}-url`, { hint: !err('url'), error: !!err('url') })} />
          </Field>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={submit} className="btn btn-primary btn-sm">{draft.id ? t('cv.submit.edit') : t('cv.submit.add')}</button>
            <button type="button" onClick={() => setDraft(null)} className="btn btn-secondary btn-sm">{t('cv.cancel')}</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={openNew} disabled={full} className="btn btn-secondary btn-sm"><IPlus className="h-4 w-4" />{t('cv.add')}</button>
          {full && <span className="text-xs text-warm">{t('cv.max')}</span>}
        </div>
      )}
      <p className="text-xs text-subtle">{t('cv.unsaved')}</p>
    </div>
  );
}
