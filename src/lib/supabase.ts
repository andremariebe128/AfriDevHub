import { createBrowserClient } from '@supabase/ssr';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key';

let browserClient: SupabaseClient | null = null;

/** Client navigateur : la session est stockée dans des cookies, lisibles par le proxy (accès réservé aux connectés). */
export function supabaseBrowser(): SupabaseClient {
  if (!browserClient) browserClient = createBrowserClient(url, anon);
  return browserClient;
}

/** Client serveur : lectures avec la clé anon (les politiques RLS décident de ce qui est lisible). */
export function supabaseServer(): SupabaseClient {
  return createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
}
