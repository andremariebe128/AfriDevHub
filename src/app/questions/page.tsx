import Link from 'next/link';
import type { Metadata } from 'next';
import QuestionCard from '@/components/QuestionCard';
import { supabaseServer } from '@/lib/supabase';
import type { QuestionRow } from '@/lib/types';
import { POPULAR_TAGS } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Questions' };

type Props = { searchParams: Promise<{ q?: string; tag?: string }> };

export default async function QuestionsPage({ searchParams }: Props) {
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
        <h1 className="text-2xl font-bold">Questions</h1>
        <Link href="/ask" className="btn btn-primary">Poser une question</Link>
      </div>

      <form action="/questions" method="get" className="mb-4 flex gap-2">
        <input name="q" defaultValue={q} placeholder="Rechercher une question…" className="input" />
        {tag && <input type="hidden" name="tag" value={tag} />}
        <button type="submit" className="btn btn-primary">Rechercher</button>
      </form>

      <div className="mb-6 flex flex-wrap gap-2">
        {POPULAR_TAGS.map((t) => (
          <Link
            key={t}
            href={tag === t ? '/questions' : `/questions?tag=${encodeURIComponent(t)}`}
            className={`rounded-full border px-3 py-1 text-sm ${
              tag === t
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-neutral-300 hover:border-brand-500 dark:border-neutral-700'
            }`}
          >
            {t}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {failed && <p className="text-red-600">Impossible de charger les questions. Réessaie dans un instant.</p>}
        {!failed && questions.length === 0 && (
          <p className="text-neutral-500">Aucune question trouvée.</p>
        )}
        {questions.map((item) => (
          <QuestionCard key={item.id} q={item} />
        ))}
      </div>
    </div>
  );
}
