import type { Key } from '@/lib/i18n';

type Err = { message?: string; code?: string; statusCode?: string | number; status?: number } | null | undefined;

/**
 * Vrai si Supabase signale une colonne inconnue : la migration (docs/backend-a-faire.md) n'est pas encore passée.
 * Codes Postgres 42703 (undefined_column) et PostgREST PGRST204 / PGRST200 (colonne ou relation introuvable dans le cache de schéma).
 */
export function isMissingColumn(err: Err): boolean {
  if (!err) return false;
  if (err.code === '42703' || err.code === 'PGRST204') return true;
  const m = (err.message ?? '').toLowerCase();
  return (m.includes('column') && (m.includes('does not exist') || m.includes('could not find'))) || m.includes('schema cache');
}

/** Bucket de stockage absent. */
export function isBucketMissing(err: Err): boolean {
  const m = (err?.message ?? '').toLowerCase();
  return m.includes('bucket not found') || (m.includes('bucket') && m.includes('not found'));
}

/** Envoi refusé (politiques RLS du stockage, session expirée). */
export function isDenied(err: Err): boolean {
  const m = (err?.message ?? '').toLowerCase();
  const status = String(err?.statusCode ?? err?.status ?? '');
  return status === '403' || status === '401' || m.includes('row-level security') || m.includes('unauthorized') || m.includes('not allowed') || m.includes('permission denied');
}

/** Affichage seulement : traduit les messages bruts de Supabase en libellés FR/EN. */
export function friendlyError(msg: string, t: (k: Key) => string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login') || m.includes('invalid credentials')) return t('err.creds');
  if (m.includes('already registered') || m.includes('already exists') || m.includes('duplicate')) return t('err.exists');
  if (m.includes('rate limit') || m.includes('too many')) return t('err.rate');
  if (m.includes('bucket not found')) return t('err.bucket');
  if (m.includes('row-level security') || m.includes('unauthorized')) return t('err.denied');
  if (m.includes('fetch') || m.includes('network') || m.includes('failed') || m.includes('timeout')) return t('err.net');
  return t('err.generic');
}

/** Message d'un envoi vers le stockage (photo de profil). */
export function storageError(err: Err, t: (k: Key) => string): string {
  if (isBucketMissing(err)) return t('err.bucket');
  if (isDenied(err)) return t('err.denied');
  return friendlyError(err?.message ?? '', t);
}
