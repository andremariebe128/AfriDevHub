import Link from 'next/link';
import Directory from '@/components/Directory';
import { loadItems } from '@/lib/data';
import type { Metadata } from 'next';
import { getT } from '@/lib/i18n-server';

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await getT()).t('me.h') });

export default async function Page() {
  const { t } = await getT();
  const items = await loadItems('mentor');
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold">{t('me.h')}</h1></div>
      <p className="max-w-2xl text-neutral-700 dark:text-neutral-300">{t('me.p')}</p>
      {items.length > 0 && <Link href="/publier" className="btn btn-primary">{t('h.pub')}</Link>}
      <Directory items={items} empty={{ title: t('me.empty.h'), text: t('me.empty.p'), href: '/publier', cta: t('h.pub') }} />
    </div>
  );
}
