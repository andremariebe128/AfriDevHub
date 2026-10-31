import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/** Pages ouvertes sans connexion (chemins normalisés : minuscules, sans slash final). */
const PUBLIC = new Set(['/', '/login', '/reset', '/download', '/conditions', '/mentions-legales', '/confidentialite', '/api/version', '/api/link-preview']); // /api/link-preview : le jeton Bearer est vérifié par la route elle-même

/** Chemin canonique pour la comparaison : décodé, `//` réduits, sans slash final, en minuscules. */
function canonical(pathname: string): string | null {
  let p = pathname;
  try {
    // Décodage répété : %252F, %2e%2e, etc. ne doivent pas masquer le vrai chemin.
    for (let i = 0; i < 3 && p.includes('%'); i++) p = decodeURIComponent(p);
  } catch { return null; }
  if (/[\\\u0000-\u001f\u007f]/.test(p) || p.split('/').some((s) => s === '..' || s === '.')) return null;
  p = p.replace(/\/{2,}/g, '/').replace(/\/+$/, '').toLowerCase();
  return p === '' ? '/' : p;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const isDev = process.env.NODE_ENV !== 'production';

/** Politique de sécurité du contenu : scripts liés à un nonce par requête, Supabase seul domaine externe autorisé. */
function csp(nonce: string): string {
  let supa = '';
  let supaWs = '';
  try { const u = new URL(supabaseUrl); supa = u.origin; supaWs = `wss://${u.host}`; } catch { /* variable absente : pas d'origine externe */ }
  const d = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:${supa ? ` ${supa}` : ''}`,
    `font-src 'self'`,
    `connect-src 'self'${supa ? ` ${supa} ${supaWs}` : ''}`,
    `worker-src 'self'`,
    `manifest-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ];
  if (!isDev) d.push('upgrade-insecure-requests');
  return d.join('; ');
}

export async function proxy(req: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const policy = csp(nonce);
  const headers = new Headers(req.headers);
  headers.set('x-nonce', nonce);
  headers.set('content-security-policy', policy);

  const finish = (res: NextResponse) => {
    res.headers.set('content-security-policy', policy);
    return res;
  };

  let res = NextResponse.next({ request: { headers } });

  // Cookies lus directement depuis l'en-tête : les cookies de session fragmentés (sb-xxx-auth-token.0) contiennent des points.
  const parsedCookies = (req.headers.get('cookie') ?? '').split(';').reduce((acc, part) => {
    const [name, ...rest] = part.trim().split('=');
    if (name) {
      try { acc[name.trim()] = decodeURIComponent(rest.join('=')); } catch { acc[name.trim()] = rest.join('='); }
    }
    return acc;
  }, {} as Record<string, string>);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key',
    {
      cookies: {
        getAll: () => Object.entries(parsedCookies).map(([name, value]) => ({ name, value })),
        setAll: (list) => {
          list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    },
  );

  // Vérification côté serveur de la session (et renouvellement du jeton) pour chaque requête.
  let signedIn = false;
  try { signedIn = Boolean((await supabase.auth.getUser()).data.user); } catch { signedIn = false; }

  const path = canonical(req.nextUrl.pathname);
  if (!signedIn && !(path !== null && PUBLIC.has(path))) {
    const to = req.nextUrl.clone();
    const raw = req.nextUrl.pathname;
    to.pathname = '/login';
    to.search = '';
    // Seul un chemin interne est transmis ; la page de connexion le revalide avant toute redirection.
    if (raw.startsWith('/') && !raw.startsWith('//')) to.searchParams.set('next', raw + req.nextUrl.search);
    return finish(NextResponse.redirect(to));
  }
  return finish(res);
}

/**
 * Tout passe par le proxy, sauf les ressources statiques connues. Le point n'est PAS un critère d'exclusion :
 * un nom d'utilisateur (/u/jean.dupont) en contient et doit rester protégé.
 */
export const config = {
  matcher: ['/((?!_next/|icons/|builds/|logo-[a-z]+\\.(?:png|svg)$|favicon\\.ico$|robots\\.txt$|sitemap\\.xml$|manifest\\.webmanifest$|sw\\.js$|offline\\.html$).*)'],
};
