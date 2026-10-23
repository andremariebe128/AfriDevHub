'use client';
import { useCallback, useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase';

/** Nombre de notifications non lues de l'utilisateur connecté (mis à jour en direct (événement `adh-notif`, émis par NotificationsLive), au retour sur l'onglet et, en secours, toutes les 2 minutes). */
export function useUnread(uid: string | undefined): number {
  const [n, setN] = useState(0);
  const load = useCallback(async () => {
    if (!uid) { setN(0); return; }
    try {
      const { count } = await supabaseBrowser().from('notifications')
        .select('id', { count: 'exact', head: true }).is('read_at', null);
      setN(count ?? 0);
    } catch { /* hors ligne : on garde la valeur précédente */ }
  }, [uid]);
  useEffect(() => {
    load();
    const id = window.setInterval(load, 120000);
    const vis = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', vis);
    window.addEventListener('adh-notif', load);
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', vis); window.removeEventListener('adh-notif', load); };
  }, [load]);
  return n;
}

export function Badge({ n }: { n: number }) {
  if (n <= 0) return null;
  return <span aria-hidden="true" className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">{n > 9 ? '9+' : n}</span>;
}
