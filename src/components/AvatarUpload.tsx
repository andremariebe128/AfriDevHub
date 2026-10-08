'use client';
import { useEffect, useRef, useState } from 'react';
import Avatar from '@/components/Avatar';
import { useT } from '@/components/I18n';
import { IAlert, ICamera, IOk, ITrash } from '@/components/Icons';
import { isMissingColumn, storageError } from '@/lib/errors';
import { AVATAR_BUCKET, AVATAR_TYPES, checkAvatarFile, squareAvatar } from '@/lib/image';
import { supabaseBrowser } from '@/lib/supabase';

type Pending = { blob: Blob; type: string; ext: string; preview: string };

/**
 * Photo de profil : clic, glisser-déposer ou appareil photo (mobile). Aperçu rond, recadrage carré, 512×512 WebP,
 * envoi vers le bucket public `avatars` puis URL enregistrée dans `profiles.avatar_url`.
 */
export default function AvatarUpload({ userId, name, url, onChange }: { userId: string; name: string; url: string | null; onChange: (url: string | null) => void }) {
  const { t } = useT();
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => () => { if (pending) URL.revokeObjectURL(pending.preview); }, [pending]);

  async function pick(file: File | undefined | null) {
    if (!file) return;
    setMsg(null);
    const bad = checkAvatarFile(file);
    if (bad) return setMsg({ ok: false, text: bad === 'type' ? t('av.err.type') : t('av.err.size') });
    setBusy(true);
    try {
      const r = await squareAvatar(file);
      setPending({ blob: r.blob, type: r.type, ext: r.ext, preview: URL.createObjectURL(r.blob) });
    } catch {
      setMsg({ ok: false, text: t('av.err.read') });
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  async function upload() {
    if (!pending) return;
    setBusy(true); setMsg(null);
    const sb = supabaseBrowser();
    const path = `${userId}/avatar.${pending.ext}`;
    const up = await sb.storage.from(AVATAR_BUCKET).upload(path, pending.blob, { upsert: true, contentType: pending.type, cacheControl: '3600' });
    if (up.error) { setBusy(false); return setMsg({ ok: false, text: storageError(up.error, t) }); }
    if (pending.ext === 'jpg') await sb.storage.from(AVATAR_BUCKET).remove([`${userId}/avatar.webp`]);
    const publicUrl = `${sb.storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
    const { error } = await sb.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);
    setBusy(false);
    if (error) return setMsg({ ok: false, text: isMissingColumn(error) ? t('err.partial') : storageError(error, t) });
    setPending(null);
    onChange(publicUrl);
    window.dispatchEvent(new CustomEvent('adh-avatar', { detail: publicUrl }));
    setMsg({ ok: true, text: t('av.saved') });
  }

  async function remove() {
    setConfirming(false);
    setBusy(true); setMsg(null);
    const sb = supabaseBrowser();
    await sb.storage.from(AVATAR_BUCKET).remove([`${userId}/avatar.webp`, `${userId}/avatar.jpg`]);
    const { error } = await sb.from('profiles').update({ avatar_url: null }).eq('id', userId);
    setBusy(false);
    if (error) return setMsg({ ok: false, text: isMissingColumn(error) ? t('err.partial') : storageError(error, t) });
    onChange(null);
    window.dispatchEvent(new CustomEvent('adh-avatar', { detail: null }));
    setMsg({ ok: true, text: t('av.removed') });
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); void pick(e.dataTransfer.files?.[0]); }}
      className={`flex flex-wrap items-center gap-4 rounded-lg border border-dashed p-4 transition ${drag ? 'border-brand-500 bg-brand-500/[0.06]' : 'border-line-strong'}`}
    >
      <div className="relative">
        {pending
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={pending.preview} alt={t('av.preview')} width={96} height={96} className="h-24 w-24 rounded-full object-cover ring-2 ring-surface" />
          : <Avatar name={name} src={url} size={96} />}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <input ref={input} id="pf-photo" type="file" accept={AVATAR_TYPES.join(',')} className="sr-only" onChange={(e) => void pick(e.target.files?.[0])} aria-label={t('av.h')} />
        {pending ? (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={upload} disabled={busy} aria-busy={busy} className="btn btn-primary btn-sm">{busy ? t('av.busy') : t('av.use')}</button>
            <button type="button" onClick={() => setPending(null)} disabled={busy} className="btn btn-secondary btn-sm">{t('av.cancel')}</button>
          </div>
        ) : confirming ? (
          <div className="flex flex-wrap items-center gap-2" role="alertdialog" aria-label={t('av.remove.q')}>
            <span className="text-sm font-medium">{t('av.remove.q')}</span>
            <button type="button" onClick={remove} autoFocus className="btn btn-primary btn-sm">{t('av.remove.yes')}</button>
            <button type="button" onClick={() => setConfirming(false)} className="btn btn-secondary btn-sm">{t('av.cancel')}</button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => input.current?.click()} disabled={busy} className="btn btn-secondary btn-sm"><ICamera />{url ? t('av.change') : t('av.choose')}</button>
            {url && <button type="button" onClick={() => setConfirming(true)} disabled={busy} className="btn btn-ghost btn-sm"><ITrash />{t('av.remove')}</button>}
          </div>
        )}
        <p className="text-xs text-subtle">{t('av.hint')} <span className="hidden sm:inline">{t('av.drop')}</span></p>
        <div aria-live="polite" className="empty:hidden">
          {msg && <p className={`flex items-center gap-1.5 text-sm font-medium ${msg.ok ? 'text-success' : 'text-red-700 dark:text-red-400'}`}>{msg.ok ? <IOk className="h-4 w-4 shrink-0" /> : <IAlert className="h-4 w-4 shrink-0" />}{msg.text}</p>}
        </div>
      </div>
    </div>
  );
}
