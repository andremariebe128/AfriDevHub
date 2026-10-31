'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Avatar from '@/components/Avatar';
import { useT } from '@/components/I18n';
import { IAlert, IVerified, IX, ISend } from '@/components/Icons';
import { ReportPanel } from '@/components/Moderation';
import { friendlyError } from '@/lib/errors';
import { isVerified, MSG_SELECT, type NewsMsg, type NewsPost } from '@/lib/news';
import { supabaseBrowser } from '@/lib/supabase';
import { timeAgo } from '@/lib/utils';

const LIMIT = 300;

/** Discussion d'un sujet : messagerie en direct (répondre, modifier, supprimer pour de bon, signaler). */
export default function NewsChat({ post, userId, onClose, onCount }: { post: NewsPost; userId: string | null; onClose: () => void; onCount: (delta: number) => void }) {
  const { t, locale } = useT();
  const [msgs, setMsgs] = useState<NewsMsg[] | null>(null);
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<NewsMsg | null>(null);
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const byId = useMemo(() => new Map((msgs ?? []).map((m) => [m.id, m])), [msgs]);

  const fetchOne = useCallback(async (id: string) => {
    const { data } = await supabaseBrowser().from('news_messages').select(MSG_SELECT).eq('id', id).maybeSingle();
    return (data as unknown as NewsMsg | null) ?? null;
  }, []);

  // Chargement initial + blocages
  useEffect(() => {
    let alive = true;
    const sb = supabaseBrowser();
    (async () => {
      const { data, error: err } = await sb.from('news_messages').select(MSG_SELECT).eq('post_id', post.id).order('created_at', { ascending: false }).limit(LIMIT);
      if (!alive) return;
      if (err) { setError(friendlyError(err.message, t)); setMsgs([]); return; }
      setMsgs(((data ?? []) as unknown as NewsMsg[]).reverse());
      if (userId) {
        const { data: b } = await sb.from('user_blocks').select('blocked_id').eq('blocker_id', userId);
        if (alive) setBlocked(new Set((b ?? []).map((x: { blocked_id: string }) => x.blocked_id)));
      }
    })();
    return () => { alive = false; };
  }, [post.id, userId, t]);

  // Temps réel : nouveaux messages, modifications, suppressions
  useEffect(() => {
    const sb = supabaseBrowser();
    const ch = sb.channel(`news:${post.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'news_messages', filter: `post_id=eq.${post.id}` }, async (p) => {
        const id = (p.new as { id: string }).id;
        const m = await fetchOne(id);
        if (!m) return;
        setMsgs((l) => (l && !l.some((x) => x.id === m.id) ? [...l, m] : l));
        if (m.author_id !== userId) onCount(1);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'news_messages', filter: `post_id=eq.${post.id}` }, (p) => {
        const n = p.new as { id: string; body: string; edited_at: string | null };
        setMsgs((l) => l && l.map((x) => (x.id === n.id ? { ...x, body: n.body, edited_at: n.edited_at } : x)));
      })
      // Les suppressions n'embarquent que la clé : pas de filtre possible, on ne retire que ce qui est affiché ici.
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'news_messages' }, (p) => {
        const id = (p.old as { id?: string }).id;
        if (!id) return;
        setMsgs((l) => {
          if (!l || !l.some((x) => x.id === id)) return l;
          onCount(-1);
          return l.filter((x) => x.id !== id).map((x) => (x.reply_to === id ? { ...x, reply_to: null } : x));
        });
      })
      .subscribe();
    return () => { void sb.removeChannel(ch); };
  }, [post.id, userId, fetchOne, onCount]);

  // Défilement : reste en bas tant que l'utilisateur n'a pas remonté
  useEffect(() => {
    const el = listRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [msgs]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = prev; };
  }, [onClose]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || !userId || busy) return;
    setBusy(true); setError(null);
    const { data, error: err } = await supabaseBrowser().from('news_messages')
      .insert({ post_id: post.id, author_id: userId, reply_to: replyTo?.id ?? null, body }).select(MSG_SELECT).single();
    setBusy(false);
    if (err) return setError(err.code === '54000' ? t('news.rate') : friendlyError(err.message, t));
    const m = data as unknown as NewsMsg;
    stick.current = true;
    setMsgs((l) => (l && !l.some((x) => x.id === m.id) ? [...l, m] : l));
    onCount(1);
    setText(''); setReplyTo(null);
  }

  async function saveEdit() {
    if (!editing) return;
    const body = editing.text.trim();
    if (!body) return;
    setBusy(true); setError(null);
    const { error: err } = await supabaseBrowser().from('news_messages').update({ body }).eq('id', editing.id);
    setBusy(false);
    if (err) return setError(friendlyError(err.message, t));
    setMsgs((l) => l && l.map((x) => (x.id === editing.id ? { ...x, body, edited_at: new Date().toISOString() } : x)));
    setEditing(null);
  }

  async function remove(id: string) {
    setBusy(true); setError(null);
    const { error: err } = await supabaseBrowser().from('news_messages').delete().eq('id', id);
    setBusy(false);
    setConfirmDel(null);
    if (err) return setError(friendlyError(err.message, t));
    setMsgs((l) => (l ? l.filter((x) => x.id !== id).map((x) => (x.reply_to === id ? { ...x, reply_to: null } : x)) : l));
    if (replyTo?.id === id) setReplyTo(null);
    onCount(-1);
  }

  const visible = (msgs ?? []).filter((m) => !blocked.has(m.author_id));
  const btn = 'min-h-8 rounded px-1.5 text-xs font-medium text-subtle hover:text-fg';

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={t('news.chat.h')}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative flex h-[88dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-line bg-surface shadow-float sm:h-[80dvh] sm:rounded-2xl">
        <header className="flex items-start gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold">{t('news.chat.h')}</h2>
            <p className="mt-0.5 line-clamp-2 text-sm text-muted">{post.body}</p>
          </div>
          <button type="button" onClick={onClose} className="tap rounded-full p-2 text-muted hover:bg-surface-2" aria-label={t('ui.close')}><IX className="h-5 w-5" /></button>
        </header>

        <div ref={listRef} onScroll={(e) => { const el = e.currentTarget; stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; }}
          className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
          {msgs === null && <p className="text-sm text-muted" aria-busy="true">…</p>}
          {msgs !== null && visible.length === 0 && <p className="py-10 text-center text-sm text-muted">{t('news.chat.empty')}</p>}
          {visible.map((m) => {
            const mine = m.author_id === userId;
            const quoted = m.reply_to ? byId.get(m.reply_to) : null;
            const isEditing = editing?.id === m.id;
            return (
              <div key={m.id} id={`m-${m.id}`} className={`flex gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
                {!mine && <Avatar name={m.author?.username} src={m.author?.avatar_url} size={28} className="mt-1 !ring-0" />}
                <div className={`flex max-w-[82%] flex-col ${mine ? 'items-end' : 'items-start'}`}>
                  <p className="mb-0.5 flex items-center gap-1 text-xs text-subtle">
                    {mine ? t('news.chat.you') : (m.author?.username ? <Link href={`/u/${encodeURIComponent(m.author.username)}`} className="font-medium text-muted hover:text-accent-fg">@{m.author.username}</Link> : '@—')}
                    {isVerified(m.author?.verified_until) && <IVerified className="h-3.5 w-3.5 text-accent-fg" />}
                    <span aria-hidden="true">·</span>{timeAgo(m.created_at, locale)}{m.edited_at && <span className="italic">· {t('news.edited')}</span>}
                  </p>
                  <div className={`rounded-2xl px-3 py-2 text-sm ${mine ? 'rounded-tr-sm bg-brand-600 text-white dark:bg-brand-500' : 'rounded-tl-sm bg-surface-2 text-fg'}`}>
                    {m.reply_to && (
                      <button type="button" disabled={!quoted} onClick={() => document.getElementById(`m-${m.reply_to}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })}
                        className={`mb-1.5 block w-full rounded border-l-2 px-2 py-1 text-left text-xs ${mine ? 'border-white/60 bg-white/15' : 'border-brand-500 bg-black/5 dark:bg-white/5'}`}>
                        {quoted ? <><span className="font-semibold">@{quoted.author?.username ?? '—'}</span><span className="line-clamp-2 block opacity-80">{quoted.body}</span></> : <span className="italic opacity-70">{t('news.chat.gone')}</span>}
                      </button>
                    )}
                    {isEditing ? (
                      <div className="min-w-48 space-y-2">
                        <textarea className="input min-h-16 w-full !text-fg" maxLength={1000} value={editing.text} autoFocus onChange={(e) => setEditing({ id: m.id, text: e.target.value })} />
                        <div className="flex justify-end gap-2">
                          <button type="button" className="btn btn-ghost btn-sm !text-current" onClick={() => setEditing(null)}>{t('ui.cancel')}</button>
                          <button type="button" className="btn btn-secondary btn-sm" disabled={busy || !editing.text.trim()} onClick={() => void saveEdit()}>{t('news.edit.save')}</button>
                        </div>
                      </div>
                    ) : <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                  </div>
                  {!isEditing && userId && (
                    <div className="mt-0.5 flex flex-wrap items-center gap-0.5">
                      <button type="button" className={btn} onClick={() => { setReplyTo(m); }}>{t('news.chat.reply')}</button>
                      {mine ? (
                        confirmDel === m.id ? (
                          <>
                            <span className="text-xs text-muted">{t('news.del.confirm')}</span>
                            <button type="button" className={`${btn} !text-red-700 dark:!text-red-300`} disabled={busy} onClick={() => void remove(m.id)}>{t('ui.delete')}</button>
                            <button type="button" className={btn} onClick={() => setConfirmDel(null)}>{t('ui.cancel')}</button>
                          </>
                        ) : (
                          <>
                            <button type="button" className={btn} onClick={() => setEditing({ id: m.id, text: m.body })}>{t('ui.edit')}</button>
                            <button type="button" className={btn} onClick={() => setConfirmDel(m.id)}>{t('ui.delete')}</button>
                          </>
                        )
                      ) : <button type="button" className={btn} onClick={() => setReport(m.id)}>{t('rp.action')}</button>}
                    </div>
                  )}
                  {report === m.id && userId && <div className="w-72 max-w-full"><ReportPanel userId={userId} type="news_message" targetId={m.id} onClose={() => setReport(null)} /></div>}
                </div>
              </div>
            );
          })}
        </div>

        <footer className="border-t border-line bg-surface px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
          {error && <p role="alert" className="mb-2 flex items-start gap-2 text-sm text-red-700 dark:text-red-300"><IAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
          {!userId ? (
            <p className="py-2 text-sm text-muted"><Link href="/login" className="font-semibold text-accent-fg underline">{t('lnk.login')}</Link> — {t('news.chat.login')}</p>
          ) : (
            <form onSubmit={send}>
              {replyTo && (
                <div className="mb-2 flex items-start gap-2 rounded-lg border-l-2 border-brand-500 bg-surface-2 px-2 py-1.5 text-xs">
                  <div className="min-w-0 flex-1"><p className="font-semibold">{t('news.chat.replyto').replace('{u}', replyTo.author?.username ?? '—')}</p><p className="line-clamp-1 text-muted">{replyTo.body}</p></div>
                  <button type="button" className="tap rounded p-1 text-muted hover:bg-surface" onClick={() => setReplyTo(null)} aria-label={t('ui.cancel')}><IX className="h-4 w-4" /></button>
                </div>
              )}
              <div className="flex items-end gap-2">
                <textarea className="input max-h-32 min-h-11 flex-1 resize-none" rows={1} maxLength={1000} value={text} placeholder={t('news.chat.ph')} aria-label={t('news.chat.ph')}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(e as unknown as React.FormEvent); } }} />
                <button type="submit" disabled={busy || !text.trim()} className="btn btn-primary h-11 w-11 !p-0" aria-label={t('news.chat.send')}><ISend /></button>
              </div>
            </form>
          )}
        </footer>
      </div>
    </div>
  );
}
