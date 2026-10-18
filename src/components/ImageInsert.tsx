'use client';
import { useRef, useState } from 'react';
import { useT } from '@/components/I18n';
import { ICamera } from '@/components/Icons';
import { storageError } from '@/lib/errors';
import { checkSourceImage, fitImage, newImageName } from '@/lib/image';
import { supabaseBrowser } from '@/lib/supabase';

/**
 * Bouton « Ajouter une photo » : réduit l'image dans le navigateur, l'envoie dans le dossier de l'utilisateur
 * (`<bucket>/<uid>/…`) et renvoie son adresse publique.
 */
export default function ImageInsert({ userId, bucket, maxSide, onUrl, onProblem, className, label }: {
  userId: string; bucket: string; maxSide: number; onUrl: (url: string) => void; onProblem?: (msg: string) => void; className?: string; label?: string;
}) {
  const { t } = useT();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function pick(file: File | undefined | null) {
    if (!file) return;
    const bad = checkSourceImage(file);
    if (bad) return onProblem?.(bad === 'type' ? t('av.err.type') : t('av.err.size'));
    setBusy(true);
    try {
      const r = await fitImage(file, maxSide);
      const sb = supabaseBrowser();
      const path = `${userId}/${newImageName()}.${r.ext}`;
      const up = await sb.storage.from(bucket).upload(path, r.blob, { contentType: r.type, cacheControl: '3600' });
      if (up.error) return onProblem?.(storageError(up.error, t));
      onUrl(sb.storage.from(bucket).getPublicUrl(path).data.publicUrl);
    } catch {
      onProblem?.(t('av.err.read'));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => void pick(e.target.files?.[0])} />
      <button type="button" className={className} disabled={busy} aria-busy={busy} title={label ?? t('img.add')} aria-label={label ?? t('img.add')} onClick={() => input.current?.click()}>
        <ICamera className="h-4 w-4" />
      </button>
    </>
  );
}
