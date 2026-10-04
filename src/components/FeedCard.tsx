'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import TagChip from '@/components/TagChip';
import { IChat, IHeart, IShare } from '@/components/Icons';

type Props = { id: string; username: string | null; country: string | null; ago: string; title: string; body: string; tags: string[]; answers: number; solved: boolean;
  labels: { like: string; comments: string; share: string; copied: string; solved: string } };

export default function FeedCard({ id, username, country, ago, title, body, tags, answers, solved, labels }: Props) {
  const [liked, setLiked] = useState(false);
  const [note, setNote] = useState('');
  useEffect(() => { try { setLiked(localStorage.getItem('like:' + id) === '1'); } catch {} }, [id]);
  function like() {
    const v = !liked; setLiked(v);
    try { localStorage.setItem('like:' + id, v ? '1' : '0'); } catch {}
  }
  async function share() {
    const url = `${location.origin}/questions/${id}`;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else { await navigator.clipboard.writeText(url); setNote(labels.copied); setTimeout(() => setNote(''), 2000); }
    } catch {}
  }
  const btn = 'inline-flex items-center gap-1.5 py-2 text-sm text-neutral-500 hover:text-brand-600';
  return (
    <article className="card">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-leaf-500 text-lg font-bold text-white" aria-hidden="true">{(username ?? '?')[0].toUpperCase()}</span>
        <div className="min-w-0">
          {username ? <Link href={`/u/${encodeURIComponent(username)}`} className="block truncate font-bold">{username}</Link> : <span className="font-bold">—</span>}
          <p className="text-sm text-neutral-500">{country ? `${country}, ` : ''}{ago}</p>
        </div>
        {solved && <span className="ml-auto rounded-full bg-leaf-500/10 px-2 py-0.5 text-xs font-semibold text-leaf-600">{labels.solved}</span>}
      </div>
      <Link href={`/questions/${id}`} className="mt-3 block">
        <h3 className="text-[15px] font-semibold leading-snug">{title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-neutral-700">{body}</p>
      </Link>
      {tags.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{tags.map((tg) => <TagChip key={tg} tag={tg} />)}</div>}
      <div className="mt-2 flex flex-wrap items-center gap-x-6">
        <button onClick={like} aria-pressed={liked} className={`${btn} ${liked ? '!text-red-500' : ''}`}><IHeart on={liked} className="h-5 w-5 text-red-500" />{labels.like}</button>
        <Link href={`/questions/${id}`} className={btn}><IChat className="h-5 w-5" />{labels.comments} · {answers}</Link>
        <button onClick={share} className={btn}><IShare />{labels.share}</button>
        {note && <span role="status" className="text-xs text-leaf-600">{note}</span>}
      </div>
    </article>
  );
}
