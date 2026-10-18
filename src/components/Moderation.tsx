'use client';
import { useState } from 'react';
import { useT } from '@/components/I18n';
import { IAlert, IOk } from '@/components/Icons';
import { friendlyError } from '@/lib/errors';
import { supabaseBrowser } from '@/lib/supabase';

export type TargetType = 'question' | 'answer' | 'comment' | 'user' | 'project' | 'listing';
const REASONS = ['spam', 'abuse', 'offtopic', 'scam', 'other'] as const;

/** Formulaire de signalement en ligne : motif + précisions facultatives, envoyé dans la table `reports`. */
export function ReportPanel({ userId, type, targetId, onClose }: { userId: string; type: TargetType; targetId: string; onClose: () => void }) {
  const { t } = useT();
  const [reason, setReason] = useState<(typeof REASONS)[number]>('spam');
  const [detail, setDetail] = useState('');
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<{ ok: boolean; text: string } | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const text = detail.trim() ? `${reason}: ${detail.trim()}` : reason;
    const { error } = await supabaseBrowser().from('reports').insert({ reporter_id: userId, target_type: type, target_id: targetId, reason: text });
    setBusy(false);
    setState(error ? { ok: false, text: friendlyError(error.message, t) } : { ok: true, text: t('rp.thanks') });
  }

  return (
    <form onSubmit={send} className="mt-3 space-y-3 rounded-lg border border-line bg-surface-2/60 p-3" aria-label={t('rp.h')}>
      <p className="text-sm font-semibold">{t('rp.h')}</p>
      <p className="text-xs text-muted">{t('rp.p')}</p>
      <div role="radiogroup" aria-label={t('rp.h')} className="flex flex-wrap gap-2">
        {REASONS.map((r) => (
          <button key={r} type="button" role="radio" aria-checked={reason === r} onClick={() => setReason(r)}
            className={`min-h-9 rounded-full border px-3 text-sm ${reason === r ? 'border-brand-500 bg-brand-500/10 font-semibold text-accent-fg' : 'border-line-strong text-muted hover:text-fg'}`}>{t(`rp.${r}` as 'rp.spam')}</button>
        ))}
      </div>
      <textarea className="input min-h-16" maxLength={400} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder={t('rp.detail')} aria-label={t('rp.detail')} />
      <div aria-live="polite" className="empty:hidden">
        {state && <p className={`flex items-start gap-2 text-sm ${state.ok ? 'text-success' : 'text-red-700 dark:text-red-300'}`}>{state.ok ? <IOk className="mt-0.5 h-4 w-4" /> : <IAlert className="mt-0.5 h-4 w-4" />}{state.text}</p>}
      </div>
      <div className="flex gap-2">
        {!state?.ok && <button type="submit" disabled={busy} className="btn btn-primary btn-sm">{t('rp.send')}</button>}
        <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">{state?.ok ? t('ui.close') : t('ui.cancel')}</button>
      </div>
    </form>
  );
}

/** Blocage en deux temps (bouton, puis confirmation). Appelle [onBlocked] une fois enregistré. */
export function BlockPanel({ userId, targetId, name, onClose, onBlocked }: { userId: string; targetId: string; name: string; onClose: () => void; onBlocked: () => void }) {
  const { t } = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function block() {
    setBusy(true);
    setError(null);
    const { error: err } = await supabaseBrowser().from('user_blocks').upsert({ blocker_id: userId, blocked_id: targetId }, { onConflict: 'blocker_id,blocked_id', ignoreDuplicates: true });
    setBusy(false);
    if (err) return setError(friendlyError(err.message, t));
    onBlocked();
  }

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-red-600/30 bg-red-600/[0.05] p-3">
      <p className="text-sm font-semibold">{t('blk.h').replace('{u}', name)}</p>
      <p className="text-xs text-muted">{t('blk.p')}</p>
      {error && <p className="text-sm text-red-700 dark:text-red-300" role="alert">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={block} disabled={busy} className="btn btn-primary btn-sm">{t('blk.yes')}</button>
        <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">{t('ui.cancel')}</button>
      </div>
    </div>
  );
}
