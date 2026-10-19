'use client';
import { useEffect, useState } from 'react';
import { IAward, IChat, IThumb } from '@/components/Icons';
import { useT } from '@/components/I18n';
import NotificationRow from '@/components/NotificationRow';
import { supabaseBrowser } from '@/lib/supabase';
import { timeAgo } from '@/lib/utils';

type Row = { id: string; type: 'answer' | 'accepted' | 'vote' | 'comment'; question_id: string | null; created_at: string; read_at: string | null;
  actor: { username: string } | null; question: { title: string } | null };

/** Notifications de l'utilisateur connecté (alimentées par des triggers SQL). */
export default function NotificationsList() {
  const { t, locale } = useT();
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sb = supabaseBrowser();
      // Attendre que la session soit disponible avant de requêter
      const { data: sessionData } = await sb.auth.getSession();
      if (!sessionData.session) {
        if (!cancelled) setRows([]);
        return;
      }
      const { data, error } = await sb.from('notifications')
        .select('id, type, question_id, created_at, read_at, actor:profiles!actor_id(username), question:questions(title)')
        .order('created_at', { ascending: false }).limit(50);
      if (cancelled) return;
      if (error) return setRows([]);
      const list = (data ?? []) as unknown as Row[];
      setRows(list);
    })();
    return () => { cancelled = true; };
  }, []);

  const markAll = async () => {
    const now = new Date().toISOString();
    setRows((rs) => (rs ?? []).map((r) => (r.read_at ? r : { ...r, read_at: now })));
    await supabaseBrowser().from('notifications').update({ read_at: now }).is('read_at', null);
    window.dispatchEvent(new Event('adh-notif'));
  };
  const markOne = async (id: string) => {
    setRows((rs) => (rs ?? []).map((r) => (r.id === id && !r.read_at ? { ...r, read_at: new Date().toISOString() } : r)));
    await supabaseBrowser().from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id).is('read_at', null);
    window.dispatchEvent(new Event('adh-notif'));
  };
  const unreadCount = (rows ?? []).filter((r) => !r.read_at).length;

  if (rows === null) return <p className="mt-5 text-sm text-muted" aria-busy="true">…</p>;
  if (rows.length === 0) return (
    <section className="mt-5 rounded-lg border border-line bg-surface px-5 py-5">
      <h2 className="text-base font-semibold">{t('notif.empty.h')}</h2>
      <p className="mt-1 text-sm text-muted">{t('notif.empty.p')}</p>
    </section>
  );
  const icon = { answer: <IChat className="h-4 w-4" />, accepted: <IAward className="h-4 w-4" />, vote: <IThumb className="h-4 w-4" />, comment: <IChat className="h-4 w-4" /> };
  const label = { answer: t('nt.answer'), accepted: t('nt.accepted'), vote: t('nt.vote'), comment: t('nt.comment') };
  return (
    <>
    <div className="mt-5 flex items-center justify-between gap-3">
      <p className="text-sm text-muted" aria-live="polite">{unreadCount > 0 ? `${unreadCount} ${t('notif.unread')}` : t('notif.allread')}</p>
      <button type="button" onClick={markAll} disabled={unreadCount === 0} className="btn btn-secondary btn-sm disabled:opacity-50">{t('notif.markall')}</button>
    </div>
    <ul aria-label={t('notif.list')} className="mt-3 overflow-hidden rounded-lg border border-line bg-surface">
      {rows.map((r) => (
        <NotificationRow key={r.id} onOpen={() => markOne(r.id)} icon={icon[r.type] ?? icon.answer} n={{ id: r.id, title: `@${r.actor?.username ?? '—'} ${(label[r.type] ?? '')}`, text: r.question?.title,
          href: r.question_id ? `/questions/${r.question_id}` : '/questions', ago: timeAgo(r.created_at, locale), unread: !r.read_at }} />
      ))}
    </ul>
    </>
  );
}
