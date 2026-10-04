'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Item } from '@/lib/seed';
import { useT } from '@/components/I18n';

export default function Directory({ items, initial = '' }: { items: Item[]; initial?: string }) {
  const { t } = useT();
  const kinds = useMemo(() => Array.from(new Set(items.map((i) => i.kind))), [items]);
  const [kind, setKind] = useState<string | null>(null);
  const [q, setQ] = useState(initial);
  const shown = items.filter((i) => (!kind || i.kind === kind) && `${i.title} ${i.text} ${i.tags.join(' ')}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-5">
      <input className="input" type="search" placeholder={t('dir.search')} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t('dir.search')} />
      <div className="flex flex-wrap gap-2" role="group" aria-label={t('dir.filters')}>
        {[null, ...kinds].map((k) => (
          <button key={k ?? 'all'} onClick={() => setKind(k)} aria-pressed={kind === k} className={`chip ${kind === k ? '!bg-brand-600 !text-white' : ''}`}>{k ?? t('dir.all')}</button>
        ))}
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400" aria-live="polite">{shown.length} {shown.length > 1 ? t('dir.many') : t('dir.one')}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {shown.map((i) => (
          <article key={i.title} className="card">
            <span className="pill">{i.kind}</span>
            <h3 className="mt-3 text-lg font-bold">{i.title}</h3>
            <p className="text-xs text-neutral-500">{i.meta}</p>
            <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">{i.text}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">{i.tags.map((tg) => <span key={tg} className="chip">{tg}</span>)}</div>
            {i.author && <Link href={`/u/${encodeURIComponent(i.author)}`} className="btn btn-soft mt-4 !py-1.5 !text-xs">👤 @{i.author}</Link>}
          </article>
        ))}
        {shown.length === 0 && <p className="card sm:col-span-2">{t('dir.none')}</p>}
      </div>
    </div>
  );
}
