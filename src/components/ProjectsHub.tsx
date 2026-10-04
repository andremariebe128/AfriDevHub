'use client';
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useT } from '@/components/I18n';
import { supabaseBrowser } from '@/lib/supabase';

export type Proj = { id: string; title: string; tags: string[]; url: string | null; cover: string | null; username: string | null; country: string | null; avg: number; count: number };

function Stars({ id, avg, count, label }: { id: string; avg: number; count: number; label: string }) {
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
        <button key={n} onClick={() => rate(n)} aria-label={`${n}/5`} className={`text-lg leading-none ${n <= Math.round(avg) ? 'text-gold-400' : 'text-neutral-300'}`}>★</button>
      ))}
      {count > 0 && <span className="ml-1 text-xs text-neutral-500">({count})</span>}
    </div>
  );
}

export default function ProjectsHub({ items }: { items: Proj[] }) {
  const { t } = useT();
  const [q, setQ] = useState(''); const [stack, setStack] = useState(''); const [country, setCountry] = useState('');
  const stacks = useMemo(() => Array.from(new Set(items.flatMap((i) => i.tags))).sort(), [items]);
  const countries = useMemo(() => Array.from(new Set(items.map((i) => i.country).filter(Boolean) as string[])).sort(), [items]);
  const shown = items.filter((i) => (!stack || i.tags.includes(stack)) && (!country || i.country === country) && i.title.toLowerCase().includes(q.toLowerCase()));
  const lab = 'mb-1 mt-3 block text-sm font-semibold';
  return (
    <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-6">
      <details className="card mb-4 h-fit lg:sticky lg:top-24 lg:mb-0 lg:open:block" open>
        <summary className="cursor-pointer text-sm font-bold lg:pointer-events-none">{t('pj.filters')}</summary>
        <input className="input mt-3 !rounded-lg" type="search" placeholder={t('h.search')} value={q} onChange={(e) => setQ(e.target.value)} />
        <label className={lab}>{t('pj.stack')}</label>
        <select className="input !rounded-lg" value={stack} onChange={(e) => setStack(e.target.value)}><option value="">{t('pj.all')}</option>{stacks.map((s) => <option key={s}>{s}</option>)}</select>
        <label className={lab}>{t('pj.country')}</label>
        <select className="input !rounded-lg" value={country} onChange={(e) => setCountry(e.target.value)}><option value="">{t('pj.all')}</option>{countries.map((s) => <option key={s}>{s}</option>)}</select>
      </details>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {shown.map((p) => (
          <article key={p.id} className="flex flex-col overflow-hidden rounded-2xl border border-[#e3ecf2] bg-white shadow-[0_1px_3px_rgba(20,60,90,0.06)]">
            {p.cover
              ? <img src={p.cover} alt="" loading="lazy" className="h-24 w-full object-cover sm:h-32" />
              : <div className={`cover-${Array.from(p.title).reduce((a, c) => a + c.charCodeAt(0), 0) % 4} flex h-24 items-center justify-center sm:h-32`} aria-hidden="true"><img src="/logo-mark.png" alt="" className="h-14 w-auto opacity-60 brightness-0 invert" /></div>}
            <div className="flex flex-1 flex-col gap-1.5 p-3">
              <h3 className="font-bold leading-tight">{p.title}</h3>
              {p.tags.length > 0 && <p className="text-xs text-neutral-500">({p.tags.join(', ')})</p>}
              <Stars id={p.id} avg={p.avg} count={p.count} label={t('pj.rate')} />
              <div className="mt-auto space-y-2 pt-1.5">
                {p.url
                  ? <a href={p.url} target="_blank" rel="noopener noreferrer" className="block rounded-lg bg-[#ecf7fa] py-2 text-center text-sm font-bold text-brand-600">{t('pj.view')}</a>
                  : <span className="block rounded-lg bg-[#f1f4f6] py-2 text-center text-sm font-bold text-neutral-400">{t('pj.view')}</span>}
                {p.username && <Link href={`/u/${encodeURIComponent(p.username)}`} className="block rounded-lg border border-brand-600 py-2 text-center text-sm font-semibold text-brand-600">{t('pj.contact')}</Link>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
