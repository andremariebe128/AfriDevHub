'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useT } from '@/components/I18n';
import EmptyState from '@/components/EmptyState';
import NewsCard from '@/components/NewsCard';
import NewsChat from '@/components/NewsChat';
import NewsComposer from '@/components/NewsComposer';
import { friendlyError } from '@/lib/errors';
import { PAGE_SIZE, POST_SELECT, type NewsPost, type NewsStatus } from '@/lib/news';
import { supabaseBrowser } from '@/lib/supabase';

/** Page « Actu Dev » : fil des publications, publication (si autorisé) et discussion par sujet. */
export default function NewsFeed() {
  const { t } = useT();
  const sp = useSearchParams();
  const [uid, setUid] = useState<string | null | undefined>(undefined);
  const [status, setStatus] = useState<NewsStatus | null>(null);
  const [posts, setPosts] = useState<NewsPost[] | null>(null);
  const [more, setMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fresh, setFresh] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const [gone, setGone] = useState(false);
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const uidRef = useRef<string | null>(null);

  const load = useCallback(async (reset: boolean, before?: string) => {
    const sb = supabaseBrowser();
    let q = sb.from('news_posts').select(POST_SELECT).order('created_at', { ascending: false }).limit(PAGE_SIZE + 1);
    if (before) q = q.lt('created_at', before);
    const { data, error: err } = await q;
    if (err) { setError(friendlyError(err.message, t)); setPosts((l) => l ?? []); return; }
    const rows = (data ?? []) as unknown as NewsPost[];
    setMore(rows.length > PAGE_SIZE);
    const page = rows.slice(0, PAGE_SIZE);
    setPosts((l) => (reset || !l ? page : [...l, ...page.filter((p) => !l.some((x) => x.id === p.id))]));
    if (reset) setFresh(0);
  }, [t]);

  useEffect(() => {
    const sb = supabaseBrowser();
    (async () => {
      const { data } = await sb.auth.getSession();
      const id = data.session?.user.id ?? null;
      uidRef.current = id; setUid(id);
      if (id) {
        const [{ data: st }, { data: b }] = await Promise.all([sb.rpc('news_status'), sb.from('user_blocks').select('blocked_id').eq('blocker_id', id)]);
        setStatus((st as NewsStatus | null) ?? null);
        setBlocked(new Set((b ?? []).map((x: { blocked_id: string }) => x.blocked_id)));
      }
      await load(true);
    })().catch(() => setPosts([]));
  }, [load]);

  // Nouvelles publications et suppressions en direct
  useEffect(() => {
    const sb = supabaseBrowser();
    const ch = sb.channel('news:feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'news_posts' }, (p) => {
        if ((p.new as { author_id?: string }).author_id !== uidRef.current) setFresh((n) => n + 1);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'news_posts' }, (p) => {
        const id = (p.old as { id?: string }).id;
        if (id) setPosts((l) => (l ? l.filter((x) => x.id !== id) : l));
      })
      .subscribe();
    return () => { void sb.removeChannel(ch); };
  }, []);

  // Lien direct /actu?post=… : ouvre la discussion (le sujet est ajouté en tête s'il n'est pas dans la page chargée)
  const wanted = sp.get('post');
  useEffect(() => {
    if (!wanted || !/^[0-9a-f-]{36}$/i.test(wanted) || posts === null) return;
    if (posts.some((p) => p.id === wanted)) { setOpen(wanted); return; }
    (async () => {
      const { data } = await supabaseBrowser().from('news_posts').select(POST_SELECT).eq('id', wanted).maybeSingle();
      if (!data) return setGone(true);
      setPosts((l) => (l ? [data as unknown as NewsPost, ...l] : l));
      setOpen(wanted);
    })();
  }, [wanted, posts]);

  const bump = useCallback((id: string) => (delta: number) => {
    setPosts((l) => l && l.map((p) => (p.id === id ? { ...p, msg_count: Math.max(0, p.msg_count + delta) } : p)));
  }, []);
  const openPost = posts?.find((p) => p.id === open) ?? null;
  const closeChat = useCallback(() => setOpen(null), []);
  const onCount = useCallback((d: number) => { if (open) bump(open)(d); }, [open, bump]);
  const visible = (posts ?? []).filter((p) => !blocked.has(p.author_id));

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-5">
        <h1 className="text-2xl font-bold">{t('news.h')}</h1>
        <p className="mt-1 text-sm text-muted">{t('news.p')}</p>
      </header>

      {uid && status?.can_post && <div className="mb-5"><NewsComposer userId={uid} onPosted={(p) => setPosts((l) => [p, ...(l ?? [])])} /></div>}
      {uid && status && !status.can_post && (
        <section className="mb-5 rounded-lg border border-dashed border-line-strong bg-surface px-4 py-3">
          <h2 className="text-sm font-semibold">{t('news.locked.h')}</h2>
          <p className="mt-1 text-sm text-muted">{t('news.locked.p').replace('{min}', String(status.min_rep)).replace('{rep}', String(status.rep))}</p>
          <Link href="/questions?sort=unanswered" className="mt-2 inline-block text-sm font-medium text-accent-fg hover:underline">{t('q.forum')}</Link>
        </section>
      )}
      {uid === null && <p className="mb-5 text-sm text-muted"><Link href="/login" className="font-semibold text-accent-fg underline">{t('lnk.login')}</Link></p>}

      {fresh > 0 && (
        <button type="button" onClick={() => void load(true)} className="btn btn-secondary btn-sm mb-4 w-full">{t('news.new').replace('{n}', String(fresh))}</button>
      )}
      {error && <p role="alert" className="mb-4 text-sm text-red-700 dark:text-red-300">{error}</p>}
      {gone && <p role="status" className="mb-4 text-sm text-muted">{t('news.deleted')}</p>}

      {posts === null ? <p className="text-sm text-muted" aria-busy="true">…</p> : visible.length === 0 ? (
        <EmptyState title={t('news.empty.h')} text={t('news.empty.p')} />
      ) : (
        <div className="space-y-4">
          {visible.map((p) => (
            <NewsCard key={p.id} post={p} userId={uid ?? null} onDiscuss={() => setOpen(p.id)}
              onDeleted={() => { setPosts((l) => (l ? l.filter((x) => x.id !== p.id) : l)); if (open === p.id) setOpen(null); }}
              onEdited={(body) => setPosts((l) => l && l.map((x) => (x.id === p.id ? { ...x, body, edited_at: new Date().toISOString() } : x)))} />
          ))}
          {more && <button type="button" className="btn btn-secondary w-full" onClick={() => void load(false, posts[posts.length - 1].created_at)}>{t('news.more')}</button>}
        </div>
      )}

      {openPost && <NewsChat key={openPost.id} post={openPost} userId={uid ?? null} onClose={closeChat} onCount={onCount} />}
    </div>
  );
}
