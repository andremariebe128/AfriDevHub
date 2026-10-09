'use client';
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import Avatar from '@/components/Avatar';
import Flag from '@/components/Flag';
import { useT } from '@/components/I18n';
import { IExternal } from '@/components/Icons';
import { sortCountries } from '@/lib/countries';
import { countryName } from '@/lib/utils';
import { IStar } from '@/components/Icons';
import { supabaseBrowser } from '@/lib/supabase';

export type Proj = { id: string; title: string; description?: string | null; tags: string[]; url: string | null; cover: string | null; username: string | null; avatar?: string | null; country: string | null; avg: number; count: number };

function Stars({ id, avg, count, label, reviews }: { id: string; avg: number; count: number; label: string; reviews: string }) {
  const router = useRouter();
  async function rate(n: number) {
    const sb = supabaseBrowser();
    const { data } = await sb.auth.getSession();
    if (!data.session) return router.push('/login');
    await sb.from('project_ratings').upsert({ project_id: id, user_id: data.session.user.id, stars: n });
    router.refresh();
  }
  return (
    <div className="flex items-center gap-0.5" role="group" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => rate(n)} aria-label={`${n}/5`}
          className={`flex h-6 w-5 items-center justify-center ${n <= Math.round(avg) ? 'text-muted' : 'text-line-strong'} hover:text-accent`}>
          <IStar on={n <= Math.round(avg)} className="h-3.5 w-3.5" />
        </button>
      ))}
      {count > 0 && <span className="ml-1.5 font-mono text-xs text-subtle tabular">{avg.toFixed(1)} · {count} {reviews}</span>}
    </div>
  );
}

export default function ProjectsHub({ items }: { items: Proj[] }) {
  const { t, locale } = useT();
  const [q, setQ] = useState(''); const [stack, setStack] = useState(''); const [country, setCountry] = useState('');
  const stacks = useMemo(() => Array.from(new Set(items.flatMap((i) => i.tags))).sort(), [items]);
  const countries = useMemo(() => sortCountries(Array.from(new Set(items.map((i) => i.country).filter(Boolean) as string[])), locale), [items, locale]);
  const shown = items.filter((i) => (!stack || i.tags.includes(stack)) && (!country || i.country === country) && i.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div className="mb-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_15rem_15rem]">
        <div>
          <label htmlFor="pj-q" className="sr-only">{t('h.search')}</label>
          <input id="pj-q" className="input" type="search" placeholder={t('dir.search')} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div>
          <label htmlFor="pj-stack" className="sr-only">{t('pj.stack')}</label>
          <select id="pj-stack" className="input" value={stack} onChange={(e) => setStack(e.target.value)}><option value="">{t('pj.stack')} : {t('pj.all')}</option>{stacks.map((s) => <option key={s}>{s}</option>)}</select>
        </div>
        <div>
          <label htmlFor="pj-country" className="sr-only">{t('pj.country')}</label>
          <select id="pj-country" className="input" value={country} onChange={(e) => setCountry(e.target.value)}><option value="">{t('pj.country')} : {t('pj.all')}</option>{countries.map((s) => <option key={s} value={s}>{countryName(s, locale)}</option>)}</select>
        </div>
      </div>
      <p className="mb-2 text-sm text-subtle" aria-live="polite">{shown.length} {shown.length > 1 ? t('dir.many') : t('dir.one')}</p>
      <ul className="overflow-hidden rounded-lg border border-line bg-surface">
        {shown.map((p) => (
          <li key={p.id} className="border-b border-line px-4 py-3.5 last:border-b-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              {p.url
                ? <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-base font-semibold text-fg hover:text-accent-fg">{p.title}<IExternal className="h-3.5 w-3.5 text-subtle" /></a>
                : <h3 className="text-base font-semibold">{p.title}</h3>}
              <Stars id={p.id} avg={p.avg} count={p.count} label={t('pj.rate')} reviews={t('pj.reviews')} />
            </div>
            {p.description && <p className="mt-1 text-sm text-muted">{p.description}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <div className="flex flex-wrap gap-1.5">{p.tags.map((tg) => <span key={tg} className="chip font-mono !text-[11.5px]">{tg}</span>)}</div>
              {p.username && (
                <Link href={`/u/${encodeURIComponent(p.username)}`}className="tap ml-auto flex items-center gap-1.5 text-xs text-subtle hover:text-accent-fg">
                  <Avatar name={p.username} src={p.avatar} size={20} className="!ring-0" />
                  {p.country && <Flag country={p.country} className="h-3 w-auto" />}
                  <span className="font-medium text-muted">@{p.username}</span>
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
