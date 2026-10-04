import { supabaseServer } from '@/lib/supabase';
import type { Item } from '@/lib/seed';

/** Lit la table `listings` ; retombe sur les données de démo si la base est vide ou injoignable. */
export async function loadItems(section: 'space' | 'opportunity' | 'mentor', fallback: Item[]): Promise<Item[]> {
  try {
    const { data, error } = await supabaseServer().from('listings').select('*, profiles(username)').eq('section', section).order('created_at', { ascending: false });
    if (error || !data?.length) return fallback;
    return data.map((r) => ({ title: r.title, meta: r.meta, kind: r.kind, tags: r.tags ?? [], text: r.body, author: r.profiles?.username }));
  } catch {
    return fallback;
  }
}
