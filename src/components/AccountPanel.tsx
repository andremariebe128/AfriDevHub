'use client';

import { useRouter } from 'next/navigation';
import { unsubscribePush } from '@/lib/webpush';
import { useEffect, useState } from 'react';
import { useT } from '@/components/I18n';
import { friendlyError } from '@/lib/errors';
import { supabaseBrowser } from '@/lib/supabase';

type Blocked = { id: string; username: string };

/** Utilisateurs bloqués, export des données (RGPD) et suppression définitive du compte. */
export default function AccountPanel({ userId }: { userId: string }) {
  const { t } = useT();
  const router = useRouter();
  const [blocked, setBlocked] = useState<Blocked[] | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const sb = supabaseBrowser();
        const { data: b } = await sb.from('user_blocks').select('blocked_id').eq('blocker_id', userId);
        const ids = ((b ?? []) as { blocked_id: string }[]).map((r) => r.blocked_id);
        if (!ids.length) return alive && setBlocked([]);
        const { data: p } = await sb.from('profiles_public').select('id, username').in('id', ids);
        const names = new Map(((p ?? []) as { id: string; username: string }[]).map((r) => [r.id, r.username]));
        if (alive) setBlocked(ids.map((id) => ({ id, username: names.get(id) ?? '—' })));
      } catch { if (alive) setBlocked([]); }
    })();
    return () => { alive = false; };
  }, [userId]);

  async function unblock(id: string) {
    const { error } = await supabaseBrowser().from('user_blocks').delete().eq('blocker_id', userId).eq('blocked_id', id);
    if (error) return setMsg({ ok: false, text: friendlyError(error.message, t) });
    setBlocked((l) => (l ?? []).filter((x) => x.id !== id));
  }

  async function exportData() {
    setBusy(true); setMsg(null);
    const { data, error } = await supabaseBrowser().rpc('export_my_data');
    setBusy(false);
    if (error) return setMsg({ ok: false, text: friendlyError(error.message, t) });
    const json = JSON.stringify(data, null, 2);
    try {
      const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url; a.download = 'mes-donnees.json'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMsg({ ok: true, text: t('acc.export.done') });
    } catch { setMsg({ ok: false, text: t('err.generic') }); }
  }

  async function deleteAccount() {
    setBusy(true); setMsg(null);
    const sb = supabaseBrowser();
    // Retire d'abord les fichiers par l'API de stockage (la suppression SQL seule les laisserait lisibles par URL).
    for (const bucket of ['avatars', 'covers', 'post-images']) {
      try {
        const { data: files } = await sb.storage.from(bucket).list(userId, { limit: 1000 });
        const paths = (files ?? []).map((f) => `${userId}/${f.name}`);
        if (paths.length) await sb.storage.from(bucket).remove(paths);
      } catch { /* meilleur effort */ }
    }
    const { error } = await sb.rpc('delete_my_account');
    if (error) { setBusy(false); return setMsg({ ok: false, text: friendlyError(error.message, t) }); }
    await unsubscribePush();
    try { await sb.auth.signOut(); } catch { /* session déjà invalide */ }
    router.push('/');
    router.refresh();
  }

  return (
    <>
      <section className="mt-2 grid gap-4 border-t border-line py-6 md:grid-cols-[12rem_1fr] md:gap-8" aria-labelledby="pf-blk">
        <h2 id="pf-blk" className="text-base font-semibold">{t('blk.list')}</h2>
        <div>
          {blocked === null ? null : blocked.length === 0 ? <p className="text-sm text-muted">{t('blk.none')}</p> : (
            <ul className="divide-y divide-line">
              {blocked.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="text-sm font-medium">@{b.username}</span>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => void unblock(b.id)}>{t('blk.undo')}</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="grid gap-4 border-t border-line py-6 md:grid-cols-[12rem_1fr] md:gap-8" aria-labelledby="pf-acc">
        <h2 id="pf-acc" className="text-base font-semibold">{t('acc.h')}</h2>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-muted">{t('acc.export.p')}</p>
            <button type="button" disabled={busy} className="btn btn-secondary btn-sm" onClick={() => void exportData()}>{t('acc.export')}</button>
          </div>
          {step === 0 ? (
            <button type="button" className="btn btn-secondary btn-sm text-red-700 dark:text-red-400" onClick={() => setStep(1)}>{t('acc.delete')}</button>
          ) : (
            <div className="space-y-2 rounded-lg border border-red-600/30 bg-red-600/[0.05] p-3" role="alertdialog" aria-labelledby="acc-del-h">
              <p id="acc-del-h" className="text-sm font-semibold">{step === 1 ? t('acc.delete.h') : t('acc.delete.h2')}</p>
              <p className="text-xs text-muted">{step === 1 ? t('acc.delete.p') : t('acc.delete.p2')}</p>
              <div className="flex gap-2">
                <button type="button" disabled={busy} className="btn btn-primary btn-sm" onClick={() => (step === 1 ? setStep(2) : void deleteAccount())}>{step === 1 ? t('acc.delete') : t('acc.delete.yes')}</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep(0)}>{t('ui.cancel')}</button>
              </div>
            </div>
          )}
          {msg && <p role="alert" className={`text-sm ${msg.ok ? 'text-success' : 'text-red-700 dark:text-red-400'}`}>{msg.text}</p>}
        </div>
      </section>
    </>
  );
}
