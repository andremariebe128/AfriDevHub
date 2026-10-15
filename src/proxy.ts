import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/** Pages ouvertes sans connexion. */
const PUBLIC = new Set(['/', '/login', '/download', '/conditions', '/mentions-legales', '/confidentialite']);

export async function proxy(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  // Lire les cookies directement depuis le header pour éviter les problèmes
  // de parsing des cookies fragmentés avec des points (sb-xxx-auth-token.0)
  const cookieHeader = req.headers.get('cookie') ?? '';
  const parsedCookies = cookieHeader.split(';').reduce((acc, part) => {
    const [name, ...rest] = part.trim().split('=');
    if (name) acc[name.trim()] = decodeURIComponent(rest.join('='));
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

  let signedIn = false;
  try { signedIn = Boolean((await supabase.auth.getUser()).data.user); } catch { signedIn = false; }

  if (!signedIn && !PUBLIC.has(req.nextUrl.pathname)) {
    const to = req.nextUrl.clone();
    to.pathname = '/login';
    to.search = '';
    to.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(to);
  }
  return res;
}

export const config = { matcher: ['/((?!_next/|.*\\..*).*)'] };
