import Link from 'next/link';
import Directory from '@/components/Directory';
import { SPACES } from '@/lib/seed';
import { loadItems } from '@/lib/data';
import { getT } from '@/lib/i18n-server';

export default async function Page({ searchParams }: { searchParams: Promise<{ pays?: string }> }) {
  const { pays } = await searchParams;
  const { t } = await getT();
  const items = await loadItems('space', SPACES);
  return (
    <div className="space-y-6">
      <div className="kente rounded-full" aria-hidden="true" />
      <h1 className="text-3xl font-black sm:text-4xl">{t('sp.h')}</h1>
      <p className="max-w-2xl text-neutral-700 dark:text-neutral-300">{t('sp.p')}</p>
      
      <Directory items={items} initial={pays ?? ''} />
    </div>
  );
}
