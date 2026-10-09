import type { Metadata } from 'next';
import AddProjectForm from '@/components/AddProjectForm';
import EmptyState from '@/components/EmptyState';
import ProjectsHub from '@/components/ProjectsHub';
import { loadProjects } from '@/lib/data';
import { getT } from '@/lib/i18n-server';

export const dynamic = 'force-dynamic';
export const generateMetadata = async (): Promise<Metadata> => ({ title: (await getT()).t('pj.h') });

export default async function ProjectsPage() {
  const { t } = await getT();
  const { data: items } = await loadProjects();
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{t('pj.explore')}</h1>
        
      </div>
      <div className="mb-4"><AddProjectForm defaultOpen={items.length === 0} /></div>
      {items.length === 0 ? <EmptyState title={t('empty.pj.h')} text={t('pj.empty.p')} href="#add-project" cta={t('pj.cta')} /> : <ProjectsHub items={items} />}
    </div>
  );
}
