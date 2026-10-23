'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { IX } from '@/components/Icons';
import { useT } from '@/components/I18n';
import { supabaseBrowser } from '@/lib/supabase';

type Live = { id: string; type: 'answer' | 'accepted' | 'vote' | 'comment'; question_id: string | null;
  actor: { username: string } | null; question: { title: string } | null };

/**
 * Notifications en temps réel : écoute la table `notifications` (Supabase Realtime, filtrée par les politiques RLS),
 * met à jour les badges, affiche une alerte brève et, si l'utilisateur l'a autorisé, une notification du navigateur
 * quand l'onglet n'est pas au premier plan.
 */
export default function NotificationsLive() {
  const { t } = useT();
  const path = usePathname();
  const pathRef = useRef(path);
  const [uid, setUid] = useState<string | undefined>();
  const [toast, setToast] = useState<{ key: string; title: string; text: string; href: string } | null>(null);
  pathRef.current = path;

  useEffect(() => {
    const sb = supabaseBrowser();
    sb.auth.getSession().then(({ data }) => setUid(data.session?.user.id)).catch(() => {});
    const { data } = sb.auth.onAuthStateChange((_e, s) => setUid(s?.user.id));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!uid) return;
    const sb = supabaseBrowser();
    const label = { answer: t('nt.answer'), accepted: t('nt.accepted'), vote: t('nt.vote'), comment: t('nt.comment') };
    const channel = sb.channel(`notifs:${uid}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` }, async (payload) => {
        window.dispatchEvent(new Event('adh-notif'));
        window.dispatchEvent(new Event('adh-notif-new'));
        const id = (payload.new as { id?: string }).id;
        if (!id) return;
        const { data } = await sb.from('notifications')
          .select('id, type, question_id, actor:profiles!actor_id(username), question:questions(title)').eq('id', id).maybeSingle();
        const n = data as unknown as Live | null;
        if (!n) return;
        const title = `@${n.actor?.username ?? '—'} ${label[n.type] ?? ''}`.trim();
        const text = n.question?.title ?? '';
        const href = n.question_id ? `/questions/${n.question_id}` : '/notifications';
        if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
          try {
            const note = new Notification(title, { body: text, icon: '/icons/icon-192.png', tag: n.id });
            note.onclick = () => { window.focus(); window.location.assign(href); note.close(); };
          } catch { /* certains navigateurs mobiles exigent un service worker : l'alerte intégrée suffit */ }
        } else if (pathRef.current !== '/notifications') {
          setToast({ key: n.id, title, text, href });
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` }, () => {
        window.dispatchEvent(new Event('adh-notif'));
      })
      .subscribe();
    return () => { sb.removeChannel(channel); };
  }, [uid, t]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 7000);
    return () => window.clearTimeout(id);
  }, [toast]);

  if (!toast) return null;
  return (
    <div role="status" aria-live="polite"
      className="fixed inset-x-3 bottom-[5.5rem] z-[60] mx-auto max-w-sm rounded-lg border border-line bg-surface p-3 shadow-lg md:inset-x-auto md:bottom-6 md:right-6 md:mx-0 md:w-96 md:max-w-none">
      <div className="flex items-start gap-3">
        <Link href={toast.href} onClick={() => setToast(null)} className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-fg">{toast.title}</span>
          {toast.text && <span className="mt-0.5 line-clamp-2 block text-sm text-muted">{toast.text}</span>}
          <span className="mt-1 block text-xs font-semibold text-accent-fg">{t('notif.see')}</span>
        </Link>
        <button type="button" onClick={() => setToast(null)} aria-label={t('ui.close')} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-fg"><IX /></button>
      </div>
    </div>
  );
}
