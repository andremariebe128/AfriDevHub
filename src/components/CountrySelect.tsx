'use client';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Flag from '@/components/Flag';
import { useT } from '@/components/I18n';
import { IChevron, IGlobe, IX } from '@/components/Icons';
import { ALL_COUNTRIES, AFRICA, countryLabel, findCountry, norm } from '@/lib/countries';
import { countryName } from '@/lib/utils';

/**
 * Liste déroulante recherchable des 54 pays d'Afrique (combobox ARIA).
 * `value` : nom français (valeur stockée), `ALL` (ouvert à tous) ou ''. Une valeur inconnue est affichée telle quelle.
 */
export default function CountrySelect({ id, value, onChange, allowAll = false, describedBy, invalid }: {
  id: string; value: string; onChange: (v: string) => void; allowAll?: boolean; describedBy?: string; invalid?: boolean;
}) {
  const { t, locale } = useT();
  const listId = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);

  type Opt = { value: string; label: string; all?: boolean };
  const options = useMemo<Opt[]>(() => {
    const needle = typing ? norm(q) : '';
    const list: Opt[] = [];
    if (allowAll && (!needle || norm(t('ctry.all.long')).includes(needle) || 'international'.includes(needle))) list.push({ value: ALL_COUNTRIES, label: t('ctry.all.long'), all: true });
    const sorted = [...AFRICA].sort((a, b) => countryLabel(a, locale).localeCompare(countryLabel(b, locale), locale));
    for (const c of sorted) {
      if (!needle || norm(c.fr).includes(needle) || norm(c.en).includes(needle) || norm(c.capFr).includes(needle) || norm(c.capEn).includes(needle)) list.push({ value: c.fr, label: countryLabel(c, locale) });
    }
    return list;
  }, [q, typing, allowAll, locale, t]);

  const shown = value ? countryName(value, locale) : '';
  const known = value && value !== ALL_COUNTRIES ? findCountry(value) : null;

  useEffect(() => { setActive(0); }, [q, typing]);
  useEffect(() => {
    if (!open) return;
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open, listId]);

  function close() { setOpen(false); setTyping(false); setQ(''); }
  function pick(o: Opt) { onChange(o.value); close(); }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) setOpen(true); else setActive((a) => Math.min(a + 1, options.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && open) { e.preventDefault(); if (options[active]) pick(options[active]); }
    else if (e.key === 'Escape' && open) { e.preventDefault(); close(); }
  }

  return (
    <div ref={wrap} className="relative" onBlur={(e) => { if (!wrap.current?.contains(e.relatedTarget as Node | null)) close(); }}>
      <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center text-subtle" aria-hidden="true">
        {value === ALL_COUNTRIES ? <IGlobe className="h-4 w-4" /> : known ? <Flag country={known.fr} className="h-3.5 w-auto" /> : <IGlobe className="h-4 w-4" />}
      </span>
      <input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && options[active] ? `${listId}-${active}` : undefined}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        autoComplete="off"
        spellCheck={false}
        className="input !pl-9 !pr-16"
        placeholder={t('ctry.search')}
        value={typing ? q : shown}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onChange={(e) => { setTyping(true); setQ(e.target.value); setOpen(true); }}
        onKeyDown={onKey}
      />
      <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center">
        {value && (
          <button type="button" onClick={() => { onChange(''); close(); }} aria-label={t('ctry.clear')} className="tap flex h-8 w-8 items-center justify-center rounded text-subtle hover:text-fg">
            <IX className="h-3.5 w-3.5" />
          </button>
        )}
        <button type="button" tabIndex={-1} aria-label={t('ctry.choose')} onMouseDown={(e) => e.preventDefault()} onClick={() => { setOpen((o) => !o); document.getElementById(id)?.focus(); }} className="flex h-8 w-7 items-center justify-center text-subtle">
          <IChevron className={`h-4 w-4 transition ${open ? '-rotate-90' : 'rotate-90'}`} />
        </button>
      </div>
      {open && (
        <ul id={listId} role="listbox" aria-label={t('pub.country.l')} className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-md border border-line-strong bg-raised py-1 shadow-float">
          {options.length === 0 && <li className="px-3 py-2 text-sm text-subtle" role="presentation">{t('ctry.none')}</li>}
          {options.map((o, idx) => {
            const sel = o.value === value || (!o.all && findCountry(value)?.fr === o.value);
            return (
              <li
                key={o.value}
                id={`${listId}-${idx}`}
                role="option"
                aria-selected={sel}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(o)}
                onMouseMove={() => setActive(idx)}
                className={`flex min-h-11 cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm md:min-h-9 ${idx === active ? 'bg-surface-2' : ''} ${sel ? 'font-semibold text-fg' : 'text-muted'}`}
              >
                {o.all ? <IGlobe className="h-4 w-4 shrink-0" /> : <Flag country={o.value} className="h-3.5 w-auto shrink-0" />}
                <span className="min-w-0 truncate">{o.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
