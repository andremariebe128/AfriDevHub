import Link from 'next/link';
import type { QuestionRow } from '@/lib/types';
import { authorLine } from '@/lib/utils';
import TagChip from './TagChip';

export default function QuestionCard({ q }: { q: QuestionRow }) {
  const answersCount = q.answers?.[0]?.count ?? 0;
  return (
    <article className="card transition hover:border-brand-500">
      <Link href={`/questions/${q.id}`} className="block">
        <h3 className="text-base font-semibold leading-snug">{q.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">{q.body}</p>
      </Link>
      {q.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {q.tags.map((t) => (
            <TagChip key={t} tag={t} />
          ))}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
        <span>{authorLine(q.profiles?.username, q.profiles?.country, q.created_at)}</span>
        <span className="flex items-center gap-3">
          {q.accepted_answer_id && <span className="font-semibold text-brand-600">✓ résolue</span>}
          <span>💬 {answersCount}</span>
        </span>
      </div>
    </article>
  );
}
