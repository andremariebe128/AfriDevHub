'use client';
import { useState } from 'react';
import { useT } from '@/components/I18n';
import { IX } from '@/components/Icons';

/** Ids d'aide / d'erreur reliés au champ via aria-describedby. */
export const describedBy = (id: string, o: { hint?: boolean; error?: boolean; counter?: boolean }) =>
  [o.hint && `${id}-hint`, o.counter && `${id}-count`, o.error && `${id}-err`].filter(Boolean).join(' ') || undefined;

/** Libellé visible + contrôle + aide / compteur / erreur. Le contrôle reçoit id et aria-describedby du parent. */
export function Field({ id, label, hint, error, counter, optional, children }: {
  id: string; label: string; hint?: string; error?: string | null; counter?: { n: number; min?: number; max?: number }; optional?: string; children: React.ReactNode;
}) {
  const ok = counter && (counter.min == null || counter.n >= counter.min);
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-fg">{label}{optional && <span className="ml-1.5 font-normal text-subtle">({optional})</span>}</label>
        {counter && (
          <span id={`${id}-count`} className={`font-mono text-xs tabular ${ok ? 'text-subtle' : 'text-warm'}`}>
            {counter.n}{counter.max ? `/${counter.max}` : ''}{counter.min ? ` · min ${counter.min}` : ''}
          </span>
        )}
      </div>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1.5 text-xs text-subtle">{hint}</p>}
      {error && <p id={`${id}-err`} className="mt-1.5 text-xs font-medium text-red-700 dark:text-red-400">{error}</p>}
    </div>
  );
}

/** Saisie de tags en puces : Entrée ou virgule pour ajouter, Retour arrière pour retirer, suggestions cliquables. */
export function TagInput({ id, label, value, onChange, max, suggestions = [], hint }: {
  id: string; label: string; value: string[]; onChange: (v: string[]) => void; max: number; suggestions?: string[]; hint?: string;
}) {
  const { t } = useT();
  const [draft, setDraft] = useState('');
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9.+#\u00e0-\u00ff-]/g, '');
  const full = value.length >= max;
  function add(raw: string) {
    const v = norm(raw);
    if (!v || full || value.includes(v)) return setDraft('');
    onChange([...value, v]);
    setDraft('');
  }
  const sugg = suggestions.filter((s) => !value.includes(s) && s.includes(norm(draft))).slice(0, 6);
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-fg">{label}</label>
        <span className="font-mono text-xs tabular text-subtle">{value.length}/{max}</span>
      </div>
      <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-md border border-line-strong bg-raised px-2 py-1.5 focus-within:border-brand-500 focus-within:ring-[3px] focus-within:ring-brand-500/35">
        {value.map((tg) => (
          <span key={tg} className="chip !gap-1 font-mono !text-[12px]">
            {tg}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== tg))} aria-label={t('tag.remove').replace('{t}', tg)} className="tap -mr-1 flex h-5 w-5 items-center justify-center rounded text-subtle hover:text-fg"><IX className="h-3 w-3" /></button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          disabled={full}
          autoComplete="off"
          aria-describedby={`${id}-hint`}
          onChange={(e) => {
            const parts = e.target.value.split(/[,\n;]/);
            if (parts.length === 1) return setDraft(e.target.value);
            const rest = parts.pop() ?? '';
            const next = [...value];
            for (const p of parts) { const v = norm(p); if (v && !next.includes(v) && next.length < max) next.push(v); }
            onChange(next);
            setDraft(rest);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); add(draft); }
            else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={() => draft && add(draft)}
          placeholder={full ? t('tag.max') : value.length ? '' : t('tag.add')}
          className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-base text-fg outline-none placeholder:text-subtle disabled:cursor-not-allowed md:text-[15px]"
        />
      </div>
      <p id={`${id}-hint`} className="mt-1.5 text-xs text-subtle">{hint ?? t('tag.help').replace('{n}', String(max))}</p>
      {sugg.length > 0 && !full && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5" role="group" aria-label={t('tag.sugg')}>
          <span className="text-xs text-subtle">{t('tag.sugg')}</span>
          {sugg.map((s) => (
            <button key={s} type="button" onClick={() => add(s)} className="chip tap font-mono !text-[12px]">+ {s}</button>
          ))}
        </div>
      )}
    </div>
  );
}
