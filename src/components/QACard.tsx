import Link from 'next/link';
import TagChip from '@/components/TagChip';
import { IChat } from '@/components/Icons';
import { getT } from '@/lib/i18n-server';
import { authorLine } from '@/lib/utils';
import type { QuestionRow } from '@/lib/types';

/** Carte « Questions & Forum » : titre, méta, tags, Répondre. */
export default async function QACard({ q }: { q: QuestionRow }) {
  const { t, locale } = await getT();
  const n = q.answers?.[0]?.count ?? 0;
  return (
    <article className="card">
      <Link href={`/questions/${q.id}`} className="block text-[15px] font-semibold leading-snug">{q.title}</Link>
      <p className="mt-1 text-sm text-neutral-500">{authorLine(q.profiles?.username, q.profiles?.country, q.created_at, locale)}{q.accepted_answer_id ? ` · ${t('c.solved')}` : ''}</p>
      {q.tags.length > 0 && <div className="mt-2 flex flex-wrap items-center gap-1.5 text-sm text-neutral-500">Tags: {q.tags.map((tg) => <TagChip key={tg} tag={tg} />)}</div>}
      <div className="mt-3 flex items-center gap-4 border-t border-[#e3ecf2] pt-2 text-sm text-neutral-500">
        <span className="inline-flex items-center gap-1.5"><IChat className="h-4 w-4" />{n}</span>
        <Link href={`/questions/${q.id}`} className="font-medium text-brand-600">{t('q.reply')}</Link>
      </div>
    </article>
  );
}
