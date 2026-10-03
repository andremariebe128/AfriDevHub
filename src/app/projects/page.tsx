import type { Metadata } from 'next';
import AddProjectForm from '@/components/AddProjectForm';
import TagChip from '@/components/TagChip';
import { supabaseServer } from '@/lib/supabase';
import type { ProjectRow } from '@/lib/types';
import { authorLine } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Projets' };

export default async function ProjectsPage() {
  let projects: ProjectRow[] = [];
  try {
    const { data } = await supabaseServer()
      .from('projects')
      .select('*, profiles(username)')
      .order('created_at', { ascending: false })
      .limit(50);
    projects = (data as ProjectRow[]) ?? [];
  } catch {
    projects = [];
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Projets</h1>
      <div className="mb-6">
        <AddProjectForm />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.length === 0 && <p className="text-neutral-500">Aucun projet partagé pour le moment.</p>}
        {projects.map((p) => (
          <article key={p.id} className="card flex flex-col">
            <h3 className="font-semibold">{p.title}</h3>
            {p.description && <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{p.description}</p>}
            {p.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <TagChip key={t} tag={t} />
                ))}
              </div>
            )}
            <div className="mt-auto flex items-center justify-between pt-3 text-xs text-neutral-500">
              <span>{authorLine(p.profiles?.username, null, p.created_at)}</span>
              {p.url && (
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600">
                  Ouvrir ↗
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
