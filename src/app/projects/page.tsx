import type { Metadata } from 'next';
import AddProjectForm from '@/components/AddProjectForm';
import ProjectsHub, { type Proj } from '@/components/ProjectsHub';
import { getT } from '@/lib/i18n-server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const generateMetadata = async (): Promise<Metadata> => ({ title: (await getT()).t('pj.h') });

export default async function ProjectsPage() {
  const { t } = await getT();
  const sb = supabaseServer();
  let rows: any[] = [];
  try {
    let r = await sb.from('projects').select('*, profiles(username, country), project_ratings(stars)').order('created_at', { ascending: false }).limit(60);
    if (r.error) r = await sb.from('projects').select('*, profiles(username, country)').order('created_at', { ascending: false }).limit(60);
    rows = r.data ?? [];
  } catch { rows = []; }
  const ok = (u?: string | null) => (u && /^https?:\/\//.test(u) ? u : null);
  const items: Proj[] = rows.map((p) => {
    const st: number[] = (p.project_ratings ?? []).map((x: { stars: number }) => x.stars);
    return { id: p.id, title: p.title, tags: p.tags ?? [], url: ok(p.url), cover: ok(p.cover_url), username: p.profiles?.username ?? null, country: p.profiles?.country ?? null,
      avg: st.length ? st.reduce((a, b) => a + b, 0) / st.length : 0, count: st.length };
  });
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{t('pj.explore')}</h1>
      <div className="mb-4"><AddProjectForm /></div>
      {items.length === 0 ? <p className="text-neutral-500">{t('pj.none')}</p> : <ProjectsHub items={items} />}
    </div>
  );
}
