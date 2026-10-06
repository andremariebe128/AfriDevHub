import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/** Pages ouvertes sans connexion : accueil, connexion, téléchargement et pages légales. */
const PUBLIC = new Set(['/', '/login', '/download', '/conditions', '/mentions-legales', '/confidentialite']);

export async function proxy(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key',
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
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
