import Link from 'next/link';
import type { QuestionRow } from '@/lib/types';
import { authorLine } from '@/lib/utils';
import TagChip from './TagChip';

export default function QuestionCard({ q }: { q: QuestionRow }) {
  const answersCount = q.answers?.[0]?.count ?? 0;
  return (
    <article className="card group transition-all duration-200 hover:-translate-y-0.5">
      <Link href={`/questions/${q.id}`} className="block">
        <h3 className="text-balance text-lg font-semibold leading-snug tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400">
          {q.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-pretty text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {q.body}
        </p>
      </Link>
      {q.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {q.tags.map((t) => (
            <TagChip key={t} tag={t} />
          ))}
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
        <span className="text-neutral-600 dark:text-neutral-400">
          {authorLine(q.profiles?.username, q.profiles?.country, q.created_at)}
        </span>
        <span className="flex items-center gap-3">
          {q.accepted_answer_id && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 font-semibold text-brand-700 ring-1 ring-brand-100 dark:bg-brand-950/70 dark:text-brand-100 dark:ring-brand-900/70">
              ✓ résolue
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            💬 {answersCount} réponse{answersCount > 1 ? 's' : ''}
          </span>
        </span>
      </div>
    </article>
  );
}
