import FeedCard from '@/components/FeedCard';
import { getT } from '@/lib/i18n-server';
import { timeAgo } from '@/lib/utils';
import type { QuestionRow } from '@/lib/types';

export default async function QuestionCard({ q }: { q: QuestionRow }) {
  const { t, locale } = await getT();
  return (
    <FeedCard id={q.id} username={q.profiles?.username ?? null} country={q.profiles?.country ?? null} ago={timeAgo(q.created_at, locale)}
      title={q.title} body={q.body} tags={q.tags} answers={q.answers?.[0]?.count ?? 0} solved={!!q.accepted_answer_id}
      labels={{ like: t('feed.like'), comments: t('feed.comments'), share: t('feed.share'), copied: t('feed.copied'), solved: t('c.solved') }} />
  );
}
