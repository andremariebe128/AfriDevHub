import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import QuestionCard from '@/components/QuestionCard';
import TagChip from '@/components/TagChip';
import { getT } from '@/lib/i18n-server';
import { supabaseServer } from '@/lib/supabase';
import type { QuestionRow } from '@/lib/types';
import type { Key } from '@/lib/i18n';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${decodeURIComponent(username)}` };
}

const OPEN: Record<string, Key> = { mentor: 'p.o.mentor', collab: 'p.o.collab', work: 'p.o.work' };

export default async function PublicProfile({ params }: Props) {
  const { username } = await params;
  const { t } = await getT();
  const sb = supabaseServer();
  const { data: p } = await sb.from('profiles').select('*').eq('username', decodeURIComponent(username)).maybeSingle();
  if (!p) notFound();

  const [{ data: qs }, { data: pjs }, { data: ans }] = await Promise.all([
    sb.from('questions').select('*, profiles(username, country), answers(count)').eq('author_id', p.id).order('created_at', { ascending: false }).limit(10),
    sb.from('projects').select('id, title, url, tags').eq('author_id', p.id).order('created_at', { ascending: false }).limit(10),
    sb.from('answers').select('score').eq('author_id', p.id),
  ]);
  const rep = (ans ?? []).reduce((n, a) => n + (a.score ?? 0), 0) + (ans?.length ?? 0) * 5;
  const initials = (p.full_name || p.username).split(/\s+/).map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
  const safe = (u?: string | null) => (u && /^https?:\/\//.test(u) ? u : null);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="kente rounded-full" aria-hidden="true" />
      <div className="pattern h-32 rounded-2xl sm:h-40" aria-hidden="true" />
      <header className="-mt-14 flex flex-col items-center gap-2 px-3 text-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-leaf-500 text-3xl font-black text-white ring-4 ring-white">{initials}</div>
        <h1 className="text-2xl font-bold">{p.full_name || `@${p.username}`}</h1>
        <p className="text-sm text-neutral-500">📍 {p.country ?? '—'} · @{p.username}{p.years_exp != null ? ` · ${p.years_exp} ${t('u.exp')}` : ''}</p>
        {p.headline && <p className="font-medium">{p.headline}</p>}
        <div className="flex flex-wrap justify-center gap-2">
          {(p.open_to ?? []).map((o: string) => OPEN[o] && <span key={o} className="chip tag-2">{t(OPEN[o])}</span>)}
          {safe(p.github_url) && <a className="chip tag-0" href={safe(p.github_url)!} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}
          {safe(p.website_url) && <a className="chip tag-0" href={safe(p.website_url)!} target="_blank" rel="noopener noreferrer">Web ↗</a>}
        </div>
        <p className="text-sm"><span className="font-bold text-brand-600">{rep}</span> <span className="text-neutral-500">{t('u.rep')}</span></p>
      </header>
      {p.bio && <p className="mx-auto max-w-2xl whitespace-pre-line text-center text-neutral-700">{p.bio}</p>}
      {(p.stack?.length > 0 || p.languages?.length > 0) && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {(p.stack ?? []).map((s: string) => <TagChip key={s} tag={s} />)}
          {(p.languages ?? []).map((l: string) => <span key={l} className="chip">🗣 {l}</span>)}
        </div>
      )}
      <section>
        <h2 className="mb-3 text-xl font-bold">{t('u.activity')}</h2>
        <div className="space-y-3">
          {(qs ?? []).length === 0 && <p className="text-neutral-500">{t('u.none')}</p>}
          {((qs as QuestionRow[]) ?? []).map((q) => <QuestionCard key={q.id} q={q} />)}
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-xl font-bold">{t('u.pj')}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {(pjs ?? []).length === 0 && <p className="text-neutral-500">{t('u.none')}</p>}
          {(pjs ?? []).map((j) => (
            <article key={j.id} className="card"><h3 className="font-semibold">{j.title}</h3>
              {safe(j.url) && <a href={safe(j.url)!} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand-600">{t('pj.open')}</a>}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
