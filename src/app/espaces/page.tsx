import Link from 'next/link';
import Directory from '@/components/Directory';
import { SPACES } from '@/lib/seed';
import { loadItems } from '@/lib/data';
import type { Metadata } from 'next';
import DemoBadge from '@/components/DemoBadge';
import { getT } from '@/lib/i18n-server';

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await getT()).t('sp.h') });

export default async function Page({ searchParams }: { searchParams: Promise<{ pays?: string }> }) {
  const { pays } = await searchParams;
  const { t } = await getT();
  const items = await loadItems('space', SPACES);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold">{t('sp.h')}</h1>{items === SPACES && <DemoBadge />}</div>
      <p className="max-w-2xl text-neutral-700 dark:text-neutral-300">{t('sp.p')}</p>
      
      <Directory items={items} initial={pays ?? ''} />
    </div>
  );
}
