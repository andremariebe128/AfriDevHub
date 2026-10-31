import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { fetchPreview } from '@/lib/linkpreview';
import { newsLinkOk } from '@/lib/linkhosts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const hits = new Map<string, number[]>(); // débit par membre (au mieux, par instance)

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });

/**
 * Aperçu sécurisé d'un lien (titre, description, site). Réservé aux membres connectés (jeton Bearer, vérifié auprès de Supabase),
 * limité à une liste blanche de domaines, HTTPS seulement, adresses privées refusées, aucune image reprise.
 */
export async function GET(req: Request) {
  const token = /^Bearer\s+(\S+)$/i.exec(req.headers.get('authorization') ?? '')?.[1];
  if (!token || !url || !anon) return json({ error: 'auth' }, 401);
  const { data, error } = await createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } }).auth.getUser(token);
  if (error || !data.user) return json({ error: 'auth' }, 401);

  const now = Date.now();
  const recent = (hits.get(data.user.id) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= 15) return json({ error: 'rate' }, 429);
  recent.push(now); hits.set(data.user.id, recent);
  if (hits.size > 5000) hits.clear();

  const target = new URL(req.url).searchParams.get('url') ?? '';
  if (!newsLinkOk(target)) return json({ error: 'link' }, 422);
  const preview = await fetchPreview(target);
  return json({ ok: true, preview });
}
