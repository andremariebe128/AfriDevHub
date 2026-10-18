'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useT } from '@/components/I18n';
import { friendlyError } from '@/lib/errors';
import { supabaseBrowser } from '@/lib/supabase';

/** Bouton « Supprimer » visible seulement pour l'auteur de l'annonce, avec confirmation en ligne. */
export default function ListingOwnerActions({ id, authorId }: { id: string; authorId: string }) {
  const { t } = useT();
  const router = useRouter();
  const [mine, setMine] = useState(false);
  const [ask, setAsk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabaseBrowser().auth.getSession().then(({ data }) => setMine(data.session?.user.id === authorId)).catch(() => {});
  }, [authorId]);
  if (!mine) return null;

  async function remove() {
    setBusy(true); setError(null);
    const { error: err } = await supabaseBrowser().from('listings').delete().eq('id', id);
    setBusy(false);
    if (err) return setError(friendlyError(err.message, t));
    router.refresh();
  }

  return (
    <div className="mt-2">
      {!ask ? (
        <button type="button" className="min-h-9 rounded px-2 text-sm font-medium text-muted hover:text-fg hover:underline" onClick={() => setAsk(true)}>{t('ui.delete')}</button>
      ) : (
        <div className="space-y-2 rounded-lg border border-red-600/30 bg-red-600/[0.05] p-3">
          <p className="text-sm font-semibold">{t('del.listing.h')}</p>
          <p className="text-xs text-muted">{t('del.listing.p')}</p>
          {error && <p role="alert" className="text-xs text-red-700 dark:text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button type="button" disabled={busy} className="btn btn-primary btn-sm" onClick={() => void remove()}>{t('ui.delete')}</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAsk(false)}>{t('ui.cancel')}</button>
          </div>
        </div>
      )}
    </div>
  );
}
