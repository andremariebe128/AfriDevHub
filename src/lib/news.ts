import type { SupabaseClient } from '@supabase/supabase-js';

export type NewsAuthor = { username: string; avatar_url: string | null; country: string | null; verified_until: string | null };
export type NewsPost = {
  id: string; author_id: string; body: string; image_url: string | null;
  link_url: string | null; link_title: string | null; link_desc: string | null; link_site: string | null;
  msg_count: number; created_at: string; edited_at: string | null; author: NewsAuthor | null;
};
export type NewsMsg = {
  id: string; post_id: string; author_id: string; reply_to: string | null; body: string; created_at: string; edited_at: string | null;
  author: { username: string; avatar_url: string | null; verified_until: string | null } | null;
};
export type NewsStatus = { can_post: boolean; rep: number; min_rep: number; verified: boolean };

export const POST_SELECT = 'id, author_id, body, image_url, link_url, link_title, link_desc, link_site, msg_count, created_at, edited_at, author:profiles!author_id(username, avatar_url, country, verified_until)';
export const MSG_SELECT = 'id, post_id, author_id, reply_to, body, created_at, edited_at, author:profiles!author_id(username, avatar_url, verified_until)';
export const PAGE_SIZE = 15;

export const isVerified = (until: string | null | undefined) => !!until && new Date(until).getTime() > Date.now();

/** Aperçu d'un lien via la route serveur sécurisée (liste blanche, HTTPS, adresses privées refusées). */
export async function loadPreview(sb: SupabaseClient, url: string): Promise<{ title: string | null; description: string | null; site: string } | null> {
  try {
    const { data } = await sb.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return null;
    const r = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (!r.ok) return null;
    const j = (await r.json()) as { preview?: { title: string | null; description: string | null; site: string } | null };
    return j.preview ?? null;
  } catch { return null; }
}
