'use client';
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useState } from 'react';
import Avatar from '@/components/Avatar';
import Flag from '@/components/Flag';
import { useT } from '@/components/I18n';
import { IChat, IShare, IVerified } from '@/components/Icons';
import LinkCard from '@/components/LinkCard';
import { ReportPanel } from '@/components/Moderation';
import { friendlyError } from '@/lib/errors';
import { POST_BUCKET } from '@/lib/image';
import { isVerified, type NewsPost } from '@/lib/news';
import { supabaseBrowser } from '@/lib/supabase';
import { storageImage, timeAgo } from '@/lib/utils';

/** Une publication : texte, photo, lien vérifié, bouton « Discuter » (à la place de « Commenter »). */
export default function NewsCard({ post, userId, onDiscuss, onDeleted, onEdited }: {
  post: NewsPost; userId: string | null; onDiscuss: () => void; onDeleted: () => void; onEdited: (body: string) => void;
}) {
  const { t, locale } = useT();
  const mine = userId === post.author_id;
  const [mode, setMode] = useState<null | 'edit' | 'delete' | 'report'>(null);
  const [draft, setDraft] = useState(post.body);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const img = storageImage(post.image_url, POST_BUCKET);
  const a = post.author;
  const btn = 'min-h-9 rounded px-2 text-sm font-medium text-muted hover:bg-surface-2 hover:text-fg';

  async function save() {
    const body = draft.trim();
    if (!body) return;
    setBusy(true); setError(null);
    const { error: err } = await supabaseBrowser().from('news_posts').update({ body }).eq('id', post.id);
    setBusy(false);
    if (err) return setError(friendlyError(err.message, t));
    onEdited(body); setMode(null);
  }
  async function remove() {
    setBusy(true); setError(null);
    const { error: err } = await supabaseBrowser().from('news_posts').delete().eq('id', post.id);
    setBusy(false);
    if (err) return setError(friendlyError(err.message, t));
    onDeleted();
  }
  async function share() {
    try { await navigator.clipboard.writeText(`${window.location.origin}/actu?post=${post.id}`); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* presse-papiers indisponible */ }
  }

  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <header className="flex items-center gap-3">
        <Avatar name={a?.username} src={a?.avatar_url} size={40} className="!ring-0" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-1.5 text-sm">
            {a?.username ? <Link href={`/u/${encodeURIComponent(a.username)}`} className="font-semibold text-fg hover:text-accent-fg">@{a.username}</Link> : <span className="font-semibold">@—</span>}
            {isVerified(a?.verified_until) && <span title={t('news.verified')} className="inline-flex"><IVerified className="h-4 w-4 text-accent-fg" /><span className="sr-only">{t('news.verified')}</span></span>}
            {a?.country && <Flag country={a.country} className="h-3 w-auto" />}
          </p>
          <p className="text-xs text-subtle">{timeAgo(post.created_at, locale)}{post.edited_at && <span className="italic"> · {t('news.edited')}</span>}</p>
        </div>
      </header>

      {mode === 'edit' ? (
        <div className="mt-3 space-y-2">
          <textarea className="input min-h-24 w-full" maxLength={2000} value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus />
          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setMode(null); setDraft(post.body); }}>{t('ui.cancel')}</button>
            <button type="button" className="btn btn-primary btn-sm" disabled={busy || !draft.trim()} onClick={() => void save()}>{t('news.edit.save')}</button>
          </div>
        </div>
      ) : <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-fg">{post.body}</p>}

      {img && <img src={img} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" className="mt-3 max-h-[28rem] w-full rounded-lg border border-line object-cover" />}
      {post.link_url && <LinkCard url={post.link_url} title={post.link_title} desc={post.link_desc} site={post.link_site} />}

      {error && <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>}
      <footer className="mt-3 flex flex-wrap items-center gap-1 border-t border-line pt-2">
        <button type="button" onClick={onDiscuss} className="btn btn-secondary btn-sm"><IChat className="h-4 w-4" />{t('news.discuss')}{post.msg_count > 0 && <span className="tabular font-mono text-xs">({post.msg_count})</span>}</button>
        <button type="button" className={btn} onClick={() => void share()} aria-label={t('news.share')} title={t('news.share')}><IShare className="inline h-4 w-4" /> {copied && <span className="text-xs">{t('news.copied')}</span>}</button>
        <span className="ml-auto flex items-center gap-1">
          {mine ? (
            mode === 'delete' ? (
              <>
                <span className="text-sm text-muted">{t('news.del.confirm')}</span>
                <button type="button" className={`${btn} !text-red-700 dark:!text-red-300`} disabled={busy} onClick={() => void remove()}>{t('ui.delete')}</button>
                <button type="button" className={btn} onClick={() => setMode(null)}>{t('ui.cancel')}</button>
              </>
            ) : (
              <>
                <button type="button" className={btn} onClick={() => setMode('edit')}>{t('ui.edit')}</button>
                <button type="button" className={btn} onClick={() => setMode('delete')}>{t('ui.delete')}</button>
              </>
            )
          ) : userId ? <button type="button" className={btn} onClick={() => setMode(mode === 'report' ? null : 'report')}>{t('rp.action')}</button> : null}
        </span>
      </footer>
      {mode === 'report' && userId && <ReportPanel userId={userId} type="news_post" targetId={post.id} onClose={() => setMode(null)} />}
    </article>
  );
}
