import type { Key } from '@/lib/i18n';

/** Affichage seulement : traduit les messages bruts de Supabase en libellés FR/EN. */
export function friendlyError(msg: string, t: (k: Key) => string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login') || m.includes('invalid credentials')) return t('err.creds');
  if (m.includes('already registered') || m.includes('already exists') || m.includes('duplicate')) return t('err.exists');
  if (m.includes('rate limit') || m.includes('too many')) return t('err.rate');
  if (m.includes('fetch') || m.includes('network') || m.includes('failed') || m.includes('timeout')) return t('err.net');
  return t('err.generic');
}
