import Link from 'next/link';
import Avatar from '@/components/Avatar';
import Flag from '@/components/Flag';
import TagChip from '@/components/TagChip';
import { ISolved } from '@/components/Icons';
import { getT } from '@/lib/i18n-server';
import { compact, countryName, plainPreview, timeAgo } from '@/lib/utils';
import type { QuestionRow } from '@/lib/types';

/** Ligne dense d'une liste de questions : votes, réponses, vues, titre, tags, auteur, pays, date. */
export default async function QACard({ q, excerpt = false }: { q: QuestionRow; excerpt?: boolean }) {
  const { t, locale } = await getT();
  const n = q.answers?.[0]?.count ?? 0;
  const solved = !!q.accepted_answer_id;
  const country = q.profiles?.country;
  const box = solved
    ? 'border-leaf-500/60 bg-leaf-500/10 text-success'
    : n > 0
      ? 'border-line-strong text-fg'
      : 'border-transparent text-subtle';
  return (
    <article className="flex flex-col gap-1.5 border-b border-line px-4 py-3.5 last:border-b-0 hover:bg-surface-2/50 sm:flex-row sm:gap-4">
      <div className="flex shrink-0 flex-row flex-wrap items-center gap-x-3 gap-y-1 text-xs text-subtle sm:w-[5.5rem] sm:flex-col sm:items-end sm:pt-0.5">
        {q.votes != null && <span className="tabular"><span className="font-mono font-medium text-muted">{q.votes}</span> {t('c.votes')}</span>}
        <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-xs font-semibold tabular ${box}`}>
          {solved && <ISolved className="h-3 w-3" />}{n} <span className="font-sans font-normal">{n === 1 ? t('c.ans1') : t('c.ansn')}</span>
        </span>
        {q.views != null && <span className="tabular"><span className="font-mono">{compact(q.views)}</span> {t('c.views')}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <Link href={`/questions/${q.id}`} className="block text-base font-semibold leading-snug text-fg hover:text-accent-fg">{q.title}</Link>
        {excerpt && <p className="mt-1 line-clamp-1 text-sm text-muted">{plainPreview(q.body, 150)}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <div className="flex flex-wrap gap-1.5">{q.tags.map((tg) => <TagChip key={tg} tag={tg} />)}</div>
          <p className="ml-auto flex flex-wrap items-center gap-x-1.5 text-xs text-subtle">
            {q.profiles?.username ? <Link href={`/u/${encodeURIComponent(q.profiles.username)}`} className="tap inline-flex items-center gap-1.5 font-medium text-muted hover:text-accent-fg"><Avatar name={q.profiles.username} src={q.profiles.avatar_url} size={20} className="!ring-0" />@{q.profiles.username}</Link> : <span>@{t('anon')}</span>}
            {country && <Flag country={country} className="h-3 w-auto" />}
            {country && <span className="hidden sm:inline">{countryName(country, locale)}</span>}
            <span aria-hidden="true">·</span>
            <span>{timeAgo(q.created_at, locale)}</span>
          </p>
        </div>
      </div>
    </article>
  );
}
