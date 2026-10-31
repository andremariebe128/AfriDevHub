'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Avatar from '@/components/Avatar';
import VerifiedBadge from '@/components/VerifiedBadge';
import { useT } from '@/components/I18n';
import { IAlert, IDown, ISolved, IUp } from '@/components/Icons';
import ImageInsert from '@/components/ImageInsert';
import { BlockPanel, ReportPanel, type TargetType } from '@/components/Moderation';
import { friendlyError } from '@/lib/errors';
import { POST_BUCKET } from '@/lib/image';
import { supabaseBrowser } from '@/lib/supabase';
import type { AnswerRow, CommentRow } from '@/lib/types';
import { timeAgo } from '@/lib/utils';
import Markdown from './Markdown';

type Props = {
  questionId: string;
  questionAuthorId: string;
  acceptedAnswerId: string | null;
  answers: AnswerRow[];
  comments: CommentRow[];
};

type Panel = { kind: 'report' | 'block' | 'delete' | 'edit'; id: string } | null;

const linkBtn = 'min-h-9 rounded px-1.5 text-xs font-medium text-muted hover:text-fg hover:underline md:min-h-7';

/** Réponses, votes, acceptation, commentaires, modification, suppression, signalement, blocage et formulaire de réponse. */
export default function AnswerSection({ questionId, questionAuthorId, acceptedAnswerId, answers, comments }: Props) {
  const router = useRouter();
  const { t, locale } = useT();
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [myVotes, setMyVotes] = useState<Record<string, number>>({});
  const [list, setList] = useState(answers);
  const [cms, setCms] = useState(comments);
  const [accepted, setAccepted] = useState(acceptedAnswerId);
  const [text, setText] = useState('');
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => { setList(answers); setCms(comments); setAccepted(acceptedAnswerId); }, [answers, comments, acceptedAnswerId]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const sb = supabaseBrowser();
      let uid: string | null = null;
      try { uid = (await sb.auth.getSession()).data.session?.user.id ?? null; } catch { /* hors ligne */ }
      if (!alive) return;
      setUserId(uid);
      setReady(true);
      if (!uid) return;
      try {
        const [b, v] = await Promise.all([
          sb.from('user_blocks').select('blocked_id'),
          answers.length ? sb.from('answer_votes').select('answer_id, value').in('answer_id', answers.map((a) => a.id)) : Promise.resolve({ data: [] as { answer_id: string; value: number }[] }),
        ]);
        if (!alive) return;
        setBlocked(new Set(((b.data ?? []) as { blocked_id: string }[]).map((r) => r.blocked_id)));
        setMyVotes(Object.fromEntries(((v.data ?? []) as { answer_id: string; value: number }[]).map((r) => [r.answer_id, r.value])));
      } catch { /* les votes ne s'affichent pas : sans gravité */ }
    })();
    return () => { alive = false; };
  }, [answers]);

  const visible = useMemo(() => {
    const ok = list.filter((a) => !blocked.has(a.author_id));
    return [...ok.filter((a) => a.id === accepted), ...ok.filter((a) => a.id !== accepted)];
  }, [list, blocked, accepted]);
  const visibleComments = useMemo(() => cms.filter((c) => !blocked.has(c.author_id)), [cms, blocked]);
  const isAsker = userId === questionAuthorId;

  const fail = (msg: string) => setError(friendlyError(msg, t));

  async function vote(a: AnswerRow, value: 1 | -1) {
    if (!userId) return;
    const sb = supabaseBrowser();
    const old = myVotes[a.id] ?? 0;
    const next = old === value ? 0 : value;
    const delta = next - old;
    setMyVotes((m) => ({ ...m, [a.id]: next }));
    setList((l) => l.map((x) => (x.id === a.id ? { ...x, score: x.score + delta } : x)));
    const res = next === 0
      ? await sb.from('answer_votes').delete().eq('answer_id', a.id).eq('user_id', userId)
      : await sb.from('answer_votes').upsert({ answer_id: a.id, user_id: userId, value: next }, { onConflict: 'answer_id,user_id' });
    if (res.error) {
      setMyVotes((m) => ({ ...m, [a.id]: old }));
      setList((l) => l.map((x) => (x.id === a.id ? { ...x, score: x.score - delta } : x)));
      fail(res.error.message);
    }
  }

  async function accept(a: AnswerRow) {
    const was = accepted;
    const next = was === a.id ? null : a.id;
    setAccepted(next);
    const { error: err } = await supabaseBrowser().from('questions').update({ accepted_answer_id: next }).eq('id', questionId);
    if (err) { setAccepted(was); fail(err.message); } else router.refresh();
  }

  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim().length < 5) return setError(t('err.ans5'));
    setBusy(true); setError(null);
    const { error: err } = await supabaseBrowser().from('answers').insert({ question_id: questionId, author_id: userId, body: text.trim() });
    setBusy(false);
    if (err) return fail(err.message);
    setText(''); setPreview(false);
    router.refresh();
  }

  async function saveEdit(a: AnswerRow) {
    if (editText.trim().length < 5) return setError(t('err.ans5'));
    setBusy(true); setError(null);
    const { error: err } = await supabaseBrowser().from('answers').update({ body: editText.trim() }).eq('id', a.id);
    setBusy(false);
    if (err) return fail(err.message);
    setPanel(null);
    router.refresh();
  }

  async function remove(a: AnswerRow) {
    setBusy(true); setError(null);
    const { error: err } = await supabaseBrowser().from('answers').delete().eq('id', a.id);
    setBusy(false);
    if (err) return fail(err.message);
    setPanel(null);
    router.refresh();
  }

  async function addComment(answerId: string | null, body: string): Promise<string | null> {
    const { data, error: err } = await supabaseBrowser().from('comments')
      .insert({ question_id: questionId, answer_id: answerId, author_id: userId, body })
      .select('*, profiles(username, avatar_url)').single();
    if (err) return friendlyError(err.message, t);
    setCms((c) => [...c, data as unknown as CommentRow]);
    return null;
  }

  async function removeComment(c: CommentRow) {
    const { error: err } = await supabaseBrowser().from('comments').delete().eq('id', c.id);
    if (err) return fail(err.message);
    setCms((x) => x.filter((y) => y.id !== c.id));
  }

  const Who = ({ p, at, edited }: { p: { username: string; avatar_url?: string | null; verified_until?: string | null } | null; at: string; edited?: boolean }) => (
    <span className="flex flex-wrap items-center gap-1.5 text-xs text-subtle">
      {p?.username && <Avatar name={p.username} src={p.avatar_url} size={20} className="!ring-0" />}
      {p?.username ? <Link href={`/u/${encodeURIComponent(p.username)}`} className="font-medium text-muted hover:text-accent-fg">@{p.username}</Link> : <span>@{t('anon')}</span>}
      <VerifiedBadge until={p?.verified_until} label={t('news.verified')} />
      <span aria-hidden="true">·</span><span>{timeAgo(at, locale)}</span>
      {edited && <><span aria-hidden="true">·</span><span>{t('edited')}</span></>}
    </span>
  );

  const Comments = ({ answerId }: { answerId: string | null }) => {
    const mine = visibleComments.filter((c) => (c.answer_id ?? null) === answerId);
    const [open, setOpen] = useState(false);
    const [val, setVal] = useState('');
    const [err, setErr] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [rep, setRep] = useState<string | null>(null);
    async function send(e: React.FormEvent) {
      e.preventDefault();
      if (val.trim().length < 2) return setErr(t('err.comment2'));
      setSending(true); setErr(null);
      const r = await addComment(answerId, val.trim());
      setSending(false);
      if (r) return setErr(r);
      setVal(''); setOpen(false);
    }
    return (
      <div className="mt-3">
        {mine.map((c) => (
          <div key={c.id} className="border-t border-line py-2">
            <p className="whitespace-pre-wrap break-words text-sm text-muted">{c.body}</p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
              <Who p={c.profiles} at={c.created_at} />
              {userId && (c.author_id === userId
                ? <button type="button" className={linkBtn} onClick={() => void removeComment(c)}>{t('ui.delete')}</button>
                : <button type="button" className={linkBtn} onClick={() => setRep(rep === c.id ? null : c.id)}>{t('rp.action')}</button>)}
            </div>
            {rep === c.id && userId && <ReportPanel userId={userId} type="comment" targetId={c.id} onClose={() => setRep(null)} />}
          </div>
        ))}
        {userId && !open && <button type="button" className="min-h-9 text-xs font-semibold text-accent-fg hover:underline" onClick={() => setOpen(true)}>{t('cm.add')}</button>}
        {open && (
          <form onSubmit={send} className="mt-2 space-y-2">
            <label className="sr-only" htmlFor={`cm-${answerId ?? 'q'}`}>{t('cm.add')}</label>
            <textarea id={`cm-${answerId ?? 'q'}`} className="input min-h-16" maxLength={600} value={val} onChange={(e) => setVal(e.target.value)} placeholder={t('cm.ph')} autoFocus />
            {err && <p className="text-xs font-medium text-red-700 dark:text-red-400" role="alert">{err}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={sending} className="btn btn-primary btn-sm">{t('cm.send')}</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setOpen(false); setErr(null); }}>{t('ui.cancel')}</button>
            </div>
          </form>
        )}
      </div>
    );
  };

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold">{visible.length} {visible.length === 1 ? t('c.ans1') : t('c.ansn')}</h2>

      <div className="mt-2 border-t border-line">
        <h3 className="sr-only">{t('cm.add')}</h3>
        <Comments answerId={null} />
      </div>

      <div className="mt-4 space-y-3">
        {visible.length === 0 && <p className="text-sm text-muted">{t('ans.none')}</p>}
        {visible.map((a) => {
          const isAccepted = a.id === accepted;
          const own = userId === a.author_id;
          const mine = myVotes[a.id] ?? 0;
          const edited = !!a.updated_at && a.updated_at !== a.created_at;
          return (
            <article key={a.id} className={`card flex gap-3 ${isAccepted ? 'border-leaf-500/50 bg-leaf-500/[0.06]' : ''}`}>
              <div className="flex flex-col items-center text-subtle">
                <button type="button" aria-label={t('vote.up')} aria-pressed={mine === 1} disabled={!userId || own} onClick={() => void vote(a, 1)}
                  className={`flex h-11 w-11 items-center justify-center rounded-lg hover:bg-surface-2 disabled:opacity-40 disabled:hover:bg-transparent ${mine === 1 ? 'text-success' : 'hover:text-accent-fg'}`}>
                  <IUp className="h-6 w-6" />
                </button>
                <span className="font-display text-lg font-bold text-fg" aria-live="polite">{a.score}</span>
                <button type="button" aria-label={t('vote.down')} aria-pressed={mine === -1} disabled={!userId || own} onClick={() => void vote(a, -1)}
                  className={`flex h-11 w-11 items-center justify-center rounded-lg hover:bg-surface-2 disabled:opacity-40 disabled:hover:bg-transparent ${mine === -1 ? 'text-red-600' : 'hover:text-red-600'}`}>
                  <IDown className="h-6 w-6" />
                </button>
                {(isAsker || isAccepted) && (
                  <button type="button" aria-label={isAccepted ? t('ans.unaccept') : t('ans.accept')} title={isAccepted ? t('ans.unaccept') : t('ans.accept')} disabled={!isAsker} onClick={() => void accept(a)}
                    className={`flex h-11 w-11 items-center justify-center rounded-lg ${isAccepted ? 'text-success' : 'hover:bg-surface-2 hover:text-success'}`}>
                    <ISolved className="h-6 w-6" />
                  </button>
                )}
              </div>
              <div className="min-w-0 flex-1">
                {isAccepted && <p className="mb-1 inline-flex items-center gap-1.5 text-sm font-semibold text-success"><ISolved />{t('ans.accepted')}</p>}
                {panel?.kind === 'edit' && panel.id === a.id ? (
                  <div className="space-y-2">
                    <label htmlFor={`ed-${a.id}`} className="sr-only">{t('ed.answer')}</label>
                    <textarea id={`ed-${a.id}`} className="input min-h-32" value={editText} onChange={(e) => setEditText(e.target.value)} />
                    <div className="flex gap-2">
                      <button type="button" disabled={busy} className="btn btn-primary btn-sm" onClick={() => void saveEdit(a)}>{t('ui.save')}</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPanel(null)}>{t('ui.cancel')}</button>
                    </div>
                  </div>
                ) : <Markdown>{a.body}</Markdown>}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <Who p={a.profiles} at={a.created_at} edited={edited} />
                  {userId && (
                    <span className="flex flex-wrap gap-1">
                      {own ? (
                        <>
                          <button type="button" className={linkBtn} onClick={() => { setEditText(a.body); setPanel({ kind: 'edit', id: a.id }); }}>{t('ui.edit')}</button>
                          <button type="button" className={linkBtn} onClick={() => setPanel({ kind: 'delete', id: a.id })}>{t('ui.delete')}</button>
                        </>
                      ) : (
                        <>
                          <button type="button" className={linkBtn} onClick={() => setPanel({ kind: 'report', id: a.id })}>{t('rp.action')}</button>
                          <button type="button" className={linkBtn} onClick={() => setPanel({ kind: 'block', id: a.id })}>{t('blk.action')}</button>
                        </>
                      )}
                    </span>
                  )}
                </div>
                {panel?.id === a.id && panel.kind === 'delete' && (
                  <div className="mt-3 space-y-2 rounded-lg border border-red-600/30 bg-red-600/[0.05] p-3">
                    <p className="text-sm font-semibold">{t('del.answer.h')}</p>
                    <p className="text-xs text-muted">{t('del.answer.p')}</p>
                    <div className="flex gap-2">
                      <button type="button" disabled={busy} className="btn btn-primary btn-sm" onClick={() => void remove(a)}>{t('ui.delete')}</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPanel(null)}>{t('ui.cancel')}</button>
                    </div>
                  </div>
                )}
                {panel?.id === a.id && panel.kind === 'report' && userId && <ReportPanel userId={userId} type={'answer' satisfies TargetType} targetId={a.id} onClose={() => setPanel(null)} />}
                {panel?.id === a.id && panel.kind === 'block' && userId && (
                  <BlockPanel userId={userId} targetId={a.author_id} name={a.profiles?.username ?? t('anon')} onClose={() => setPanel(null)}
                    onBlocked={() => { setBlocked((s) => new Set(s).add(a.author_id)); setPanel(null); router.refresh(); }} />
                )}
                <Comments answerId={a.id} />
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6">
        <h3 className="mb-2 font-semibold">{t('ans.yours')}</h3>
        {!ready ? null : !userId ? (
          <p className="text-sm">
            <Link href="/login" className="font-semibold text-accent-fg underline">{t('lnk.login')}</Link>{t('ans.login')}
          </p>
        ) : (
          <form onSubmit={post} className="space-y-3" noValidate>
            <div className="flex items-center gap-1">
              <ImageInsert userId={userId} bucket={POST_BUCKET} maxSide={1600} onProblem={setError}
                className="flex h-10 w-10 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-fg md:h-8 md:w-8"
                onUrl={(u) => setText((v) => `${v}${v && !v.endsWith('\n') ? '\n' : ''}![${t('img.alt')}](${u})\n`)} />
              <button type="button" aria-pressed={preview} onClick={() => setPreview(!preview)} className="ml-auto min-h-9 rounded px-2 text-sm font-medium text-muted hover:text-fg">{preview ? t('ask.write') : t('ask.preview')}</button>
            </div>
            {preview ? (
              <div className="min-h-32 rounded-md border border-line bg-surface px-4 py-2">{text.trim() ? <Markdown>{text}</Markdown> : <p className="py-3 text-sm text-subtle">{t('ask.prevempty')}</p>}</div>
            ) : (
              <>
                <label htmlFor="answer-body" className="sr-only">{t('ans.yours')}</label>
                <textarea id="answer-body" className="input min-h-32" value={text} maxLength={20000} onChange={(e) => setText(e.target.value)} placeholder={t('ans.ph')} />
              </>
            )}
            <button type="submit" disabled={busy} aria-busy={busy} className="btn btn-primary">{busy ? t('busy.pub') : t('ans.post')}</button>
          </form>
        )}
        {error && <p role="alert" className="mt-2 flex items-start gap-2 text-sm text-red-700 dark:text-red-400"><IAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
      </div>
    </section>
  );
}
