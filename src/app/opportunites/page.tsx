import Link from 'next/link';
import Directory from '@/components/Directory';
import { OPPS } from '@/lib/seed';
import { loadItems } from '@/lib/data';
import { getT } from '@/lib/i18n-server';

export default async function Page() {
  const { t } = await getT();
  const items = await loadItems('opportunity', OPPS);
  return (
    <div className="space-y-6">
      <div className="kente rounded-full" aria-hidden="true" />
      <h1 className="text-3xl font-black sm:text-4xl">{t('op.h')}</h1>
      <p className="max-w-2xl text-neutral-700 dark:text-neutral-300">{t('op.p')}</p>
      <Link href="/publier" className="btn btn-primary">{t('h.pub')}</Link>
      <Directory items={items} />
    </div>
  );
}
