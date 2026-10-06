'use client';
import { useEffect, useState } from 'react';
import { IAward, IChat, IThumb } from '@/components/Icons';
import { useT } from '@/components/I18n';
import NotificationRow from '@/components/NotificationRow';
import { supabaseBrowser } from '@/lib/supabase';
import { timeAgo } from '@/lib/utils';

type Row = { id: string; type: 'answer' | 'accepted' | 'vote'; question_id: string | null; created_at: string; read_at: string | null;
  actor: { username: string } | null; question: { title: string } | null };

/** Notifications de l'utilisateur connecté (alimentées par des triggers SQL). */
export default function NotificationsList() {
  const { t, locale } = useT();
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const { data, error } = await sb.from('notifications')
        .select('id, type, question_id, created_at, read_at, actor:profiles!actor_id(username), question:questions(title)')
        .order('created_at', { ascending: false }).limit(50);
      if (error) return setRows([]);
      const list = (data ?? []) as unknown as Row[];
      setRows(list);
      if (list.some((r) => !r.read_at)) await sb.from('notifications').update({ read_at: new Date().toISOString() }).is('read_at', null);
    })();
  }, []);
  if (rows === null) return <p className="mt-5 text-sm text-muted" aria-busy="true">…</p>;
  if (rows.length === 0) return (
    <section className="mt-5 rounded-lg border border-line bg-surface px-5 py-5">
      <h2 className="text-base font-semibold">{t('notif.empty.h')}</h2>
      <p className="mt-1 text-sm text-muted">{t('notif.empty.p')}</p>
    </section>
  );
  const icon = { answer: <IChat className="h-4 w-4" />, accepted: <IAward className="h-4 w-4" />, vote: <IThumb className="h-4 w-4" /> };
  const label = { answer: t('nt.answer'), accepted: t('nt.accepted'), vote: t('nt.vote') };
  return (
    <ul aria-label={t('notif.list')} className="mt-5 overflow-hidden rounded-lg border border-line bg-surface">
      {rows.map((r) => (
        <NotificationRow key={r.id} icon={icon[r.type]} n={{ id: r.id, title: `@${r.actor?.username ?? '—'} ${label[r.type]}`, text: r.question?.title,
          href: r.question_id ? `/questions/${r.question_id}` : '/questions', ago: timeAgo(r.created_at, locale), unread: !r.read_at }} />
      ))}
    </ul>
  );
}
