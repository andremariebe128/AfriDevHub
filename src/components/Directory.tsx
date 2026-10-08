'use client';
import { useEffect, useMemo, useState } from 'react';
import type { Item } from '@/lib/types';
import EmptyState from '@/components/EmptyState';
import { useT } from '@/components/I18n';
import ListingRow from '@/components/ListingRow';
import { norm } from '@/lib/countries';
import { phaseOf, todayISO, type Phase } from '@/lib/dates';
import { oppKind } from '@/lib/utils';

type Empty = { title: string; text?: string; href?: string; cta?: string };

/**
 * Annuaire filtrable (espaces, opportunités, mentors).
 * `fixedKinds` : catégories toujours proposées (même sans annonce) ; `periods` : filtre « À venir / En cours / Terminé » sur les dates.
 */
export default function Directory({ items, initial = '', fixedKinds = [], periods = false, empty }: {
  items: Item[]; initial?: string; fixedKinds?: string[]; periods?: boolean; empty?: Empty;
}) {
  const { t, locale } = useT();
  const kinds = useMemo(() => Array.from(new Set([...fixedKinds, ...items.map((i) => i.kind)])), [items, fixedKinds]);
  const [kind, setKind] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase | null>(null);
  const [q, setQ] = useState(initial);
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => { setToday(todayISO()); }, []);

  const needle = norm(q);
  const shown = items.filter((i) =>
    (!kind || i.kind === kind) &&
    (!phase || (today != null && phaseOf(i.startDate ?? null, i.endDate ?? null, today) === phase)) &&
    (!needle || norm(`${i.title} ${i.text} ${i.alt ?? ''} ${i.tags.join(' ')}`).includes(needle)));
  const hasDates = periods && items.some((i) => i.startDate || i.endDate);
  const chip = (on: boolean) => `chip min-h-9 !px-3 !text-[13px] ${on ? '!border-brand-600 !bg-brand-600 !text-white' : ''}`;

  if (items.length === 0 && empty) return <EmptyState {...empty} />;

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="dir-q" className="sr-only">{t('dir.search')}</label>
        <input id="dir-q" className="input max-w-xl" type="search" placeholder={t('dir.search')} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {kinds.length > 1 && (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('dir.filters')}>
          {[null, ...kinds].map((k) => (
            <button key={k ?? 'all'} type="button" onClick={() => setKind(k)} aria-pressed={kind === k} className={chip(kind === k)}>{k ? oppKind(k, locale) : t('dir.all')}</button>
          ))}
        </div>
      )}
      {hasDates && (
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={t('op.when.label')}>
          <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-subtle">{t('op.when')}</span>
          {([null, 'upcoming', 'ongoing', 'ended'] as const).map((p) => (
            <button key={p ?? 'all'} type="button" onClick={() => setPhase(p)} aria-pressed={phase === p} className={chip(phase === p)}>{p ? t(`op.status.${p}` as const) : t('dir.all')}</button>
          ))}
        </div>
      )}
      <p className="text-sm text-subtle" aria-live="polite">{shown.length} {shown.length > 1 ? t('dir.many') : t('dir.one')}</p>
      {shown.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line-strong p-6 text-sm text-muted">{t('dir.none')}</p>
      ) : (
        <ul className="overflow-hidden rounded-lg border border-line bg-surface">
          {shown.map((i) => <ListingRow key={i.id ?? i.href ?? i.title} i={i} locale={locale} today={today} />)}
        </ul>
      )}
    </div>
  );
}
