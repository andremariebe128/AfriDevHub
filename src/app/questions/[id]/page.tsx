import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getT } from '@/lib/i18n-server';
import AnswerSection from '@/components/AnswerSection';
import Markdown from '@/components/Markdown';
import TagChip from '@/components/TagChip';
import { supabaseServer } from '@/lib/supabase';
import type { AnswerRow, QuestionRow } from '@/lib/types';
import { authorLine } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabaseServer()
    .from('questions')
    .select('title, body')
    .eq('id', id)
    .maybeSingle();
  if (!data) return { title: (await getT()).t('q.nf') };
  return { title: data.title, description: String(data.body).slice(0, 150) };
}

export default async function QuestionPage({ params }: Props) {
  const { locale } = await getT();
  const { id } = await params;
  const sb = supabaseServer();

  const { data: q, error } = await sb
    .from('questions')
    .select('*, profiles(username, country)')
    .eq('id', id)
    .maybeSingle();
  if (error || !q) notFound();
  const question = q as QuestionRow;

  const { data: answers } = await sb
    .from('answers')
    .select('*, profiles(username)')
    .eq('question_id', id)
    .order('score', { ascending: false })
    .order('created_at', { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-bold leading-snug">{question.title}</h1>
      <p className="mt-2 text-sm text-neutral-500">
        {authorLine(question.profiles?.username, question.profiles?.country, question.created_at, locale)}
      </p>
      {question.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {question.tags.map((tg) => (
            <TagChip key={tg} tag={tg} />
          ))}
        </div>
      )}
      <div className="card mt-5">
        <Markdown>{question.body}</Markdown>
      </div>

      <AnswerSection
        questionId={question.id}
        questionAuthorId={question.author_id}
        acceptedAnswerId={question.accepted_answer_id}
        answers={(answers as AnswerRow[]) ?? []}
      />
    </div>
  );
}
