'use client';
import { useMemo, useState } from 'react';
import type { Item } from '@/lib/seed';
import { useT } from '@/components/I18n';
import ListingRow from '@/components/ListingRow';
import { oppKind } from '@/lib/utils';

export default function Directory({ items, initial = '' }: { items: Item[]; initial?: string }) {
  const { t, locale } = useT();
  const kinds = useMemo(() => Array.from(new Set(items.map((i) => i.kind))), [items]);
  const [kind, setKind] = useState<string | null>(null);
  const [q, setQ] = useState(initial);
  const shown = items.filter((i) => (!kind || i.kind === kind) && `${i.title} ${i.text} ${i.tags.join(' ')}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="dir-q" className="sr-only">{t('dir.search')}</label>
        <input id="dir-q" className="input max-w-xl" type="search" placeholder={t('dir.search')} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('dir.filters')}>
        {[null, ...kinds].map((k) => (
          <button key={k ?? 'all'} type="button" onClick={() => setKind(k)} aria-pressed={kind === k} className={`chip min-h-9 !px-3 !text-[13px] ${kind === k ? '!border-brand-600 !bg-brand-600 !text-white' : ''}`}>{k ? oppKind(k, locale) : t('dir.all')}</button>
        ))}
      </div>
      <p className="text-sm text-subtle" aria-live="polite">{shown.length} {shown.length > 1 ? t('dir.many') : t('dir.one')}</p>
      {shown.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line-strong p-6 text-sm text-muted">{t('dir.none')}</p>
      ) : (
        <ul className="overflow-hidden rounded-lg border border-line bg-surface">
          {shown.map((i) => <ListingRow key={i.title} i={i} locale={locale} labels={{ members: t('sp.members'), weekly: t('sp.weekly') }} />)}
        </ul>
      )}
    </div>
  );
}
