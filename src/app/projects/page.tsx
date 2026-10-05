import type { Metadata } from 'next';
import AddProjectForm from '@/components/AddProjectForm';
import DemoBadge from '@/components/DemoBadge';
import EmptyState from '@/components/EmptyState';
import ProjectsHub from '@/components/ProjectsHub';
import { loadProjects } from '@/lib/data';
import { getT } from '@/lib/i18n-server';

export const dynamic = 'force-dynamic';
export const generateMetadata = async (): Promise<Metadata> => ({ title: (await getT()).t('pj.h') });

export default async function ProjectsPage() {
  const { t } = await getT();
  const { data: items, demo } = await loadProjects();
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{t('pj.explore')}</h1>
        {demo && <DemoBadge />}
      </div>
      <div className="mb-4"><AddProjectForm /></div>
      {items.length === 0 ? <EmptyState title={t('empty.pj.h')} text={t('pj.none')} /> : <ProjectsHub items={items} />}
    </div>
  );
}
