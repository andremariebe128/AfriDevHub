import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** Compare deux versions « 1.2.3 » (le suffixe « +build » est ignoré). Retourne <0, 0 ou >0. */
function cmp(a: string, b: string): number {
  const p = (v: string) => v.split('+')[0].split('.').map((n) => parseInt(n, 10) || 0);
  const x = p(a), y = p(b);
  for (let i = 0; i < 3; i++) {
    const d = (x[i] ?? 0) - (y[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

const VERSION_RE = /^\d{1,4}\.\d{1,4}\.\d{1,4}(\+\d{1,6})?$/;

/**
 * Version publiée des applications (variables d'environnement LATEST_VERSION, MIN_VERSION, RELEASE_NOTES).
 * Les applications appellent cette route au démarrage ; aucune donnée personnelle n'est lue ni enregistrée.
 */
export function GET(req: Request) {
  const url = new URL(req.url);
  const current = url.searchParams.get('current') ?? '';
  const latest = VERSION_RE.test(process.env.LATEST_VERSION ?? '') ? (process.env.LATEST_VERSION as string) : '1.0.0';
  const min = VERSION_RE.test(process.env.MIN_VERSION ?? '') ? (process.env.MIN_VERSION as string) : '';
  const known = VERSION_RE.test(current);
  const notes = (process.env.RELEASE_NOTES ?? '').slice(0, 300);
  const body = {
    latestVersion: latest,
    updateAvailable: known && cmp(latest, current) > 0,
    forceUpdate: known && min !== '' && cmp(min, current) > 0,
    downloadUrl: `${url.origin}/download`,
    releaseNotes: notes || null,
  };
  return NextResponse.json(body, { headers: { 'Cache-Control': 'public, max-age=300', 'X-Content-Type-Options': 'nosniff' } });
}
