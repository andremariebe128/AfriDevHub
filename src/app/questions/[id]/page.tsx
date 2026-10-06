import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getT } from '@/lib/i18n-server';
import AnswerSection from '@/components/AnswerSection';
import Avatar from '@/components/Avatar';
import Flag from '@/components/Flag';
import Markdown from '@/components/Markdown';
import TagChip from '@/components/TagChip';
import { loadQuestion } from '@/lib/data';
import { plainPreview, timeAgo } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { data } = await loadQuestion(id);
  if (!data) return { title: (await getT()).t('q.nf') };
  return { title: data.question.title, description: plainPreview(data.question.body, 150) };
}

export default async function QuestionPage({ params }: Props) {
  const { locale, t } = await getT();
  const { id } = await params;
  const { data, demo } = await loadQuestion(id);
  if (!data) notFound();
  const { question, answers } = data;
  const user = question.profiles?.username;
  const country = question.profiles?.country;

  return (
    <article className="mx-auto max-w-3xl">
      
      <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">{question.title}</h1>
      <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-subtle">
        <Avatar name={user} size={28} />
        <span className="font-semibold text-muted">@{user ?? t('anon')}</span>
        {country && <Flag country={country} className="h-3.5 w-auto" />}
        {country && <span>{country}</span>}
        <span aria-hidden="true">·</span>
        <span>{t('q.asked')} {timeAgo(question.created_at, locale)}</span>
      </p>
      {question.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {question.tags.map((tg) => (
            <TagChip key={tg} tag={tg} />
          ))}
        </div>
      )}
      <div className="card mt-6">
        <Markdown>{question.body}</Markdown>
      </div>

      <AnswerSection
        questionId={question.id}
        questionAuthorId={question.author_id}
        acceptedAnswerId={question.accepted_answer_id}
        answers={answers}
        readOnly={demo}
      />
    </article>
  );
}
