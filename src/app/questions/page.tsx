import Link from 'next/link';
import type { Metadata } from 'next';
import { getT } from '@/lib/i18n-server';
import QACard from '@/components/QACard';
import { COUNTRY_FLAGS } from '@/lib/seed';
import { supabaseServer } from '@/lib/supabase';
import type { QuestionRow } from '@/lib/types';
import { POPULAR_TAGS } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ q?: string; tag?: string }> };

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await getT()).t('q.h') });

export default async function QuestionsPage({ searchParams }: Props) {
  const { t: tr } = await getT();
  const { q = '', tag } = await searchParams;

  let questions: QuestionRow[] = [];
  let failed = false;
  try {
    let query = supabaseServer()
      .from('questions')
      .select('*, profiles(username, country), answers(count)');
    if (q.trim()) query = query.ilike('title', `%${q.trim()}%`);
    if (tag) query = query.contains('tags', [tag]);
    const { data, error } = await query.order('created_at', { ascending: false }).limit(50);
    if (error) failed = true;
    questions = (data as QuestionRow[]) ?? [];
  } catch {
    failed = true;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{tr('q.forum')}</h1>
        <details className="relative">
          <summary className="cursor-pointer list-none rounded-xl bg-white px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-[#e3ecf2]">{tr('q.spaces')} ▾</summary>
          <div className="absolute right-0 z-10 mt-2 w-60 rounded-xl bg-white p-3 shadow-lg ring-1 ring-[#e3ecf2]">
            <ul className="flex flex-wrap gap-2">{Object.entries(COUNTRY_FLAGS).map(([c, f]) => <li key={c}><Link href={`/espaces?pays=${encodeURIComponent(c)}`} title={c} aria-label={c} className="text-2xl">{f}</Link></li>)}</ul>
          </div>
        </details>
        
      </div>

      <form action="/questions" method="get" className="mb-4 flex gap-2">
        <input name="q" defaultValue={q} placeholder={tr('q.search')} className="input" />
        {tag && <input type="hidden" name="tag" value={tag} />}
        <button type="submit" className="btn btn-primary">{tr('q.go')}</button>
      </form>

      <div className="mb-6 flex flex-wrap gap-2">
        {POPULAR_TAGS.map((tg, i) => (
          <Link
            key={tg}
            href={tag === tg ? '/questions' : `/questions?tag=${encodeURIComponent(tg)}`}
            className={`chip !px-3 !py-1.5 !text-sm ${tag === tg ? 'ring-2 ring-brand-600' : ''} ${i === 0 ? 'solid-0' : i === 1 ? 'solid-1' : `tag-${i % 3}`}`}
          >
            {tg}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {failed && <p className="text-red-600">{tr('err.load')}</p>}
        {!failed && questions.length === 0 && (
          <p className="text-neutral-500">{tr('q.none')}</p>
        )}
        {questions.map((item) => (
          <QACard key={item.id} q={item} />
        ))}
      </div>
    </div>
  );
}
