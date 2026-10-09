import Link from 'next/link';
import Directory from '@/components/Directory';
import { loadItems } from '@/lib/data';
import type { Metadata } from 'next';
import { getT } from '@/lib/i18n-server';
import { CHALLENGE_KIND } from '@/lib/utils';

const KINDS = ['Stage', 'Hackathon', 'Événement', 'Freelance', CHALLENGE_KIND];

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await getT()).t('op.h') });

export default async function Page() {
  const { t } = await getT();
  const items = await loadItems('opportunity');
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold">{t('op.h')}</h1></div>
      <p className="max-w-2xl text-neutral-700 dark:text-neutral-300">{t('op.p')}</p>
      {items.length > 0 && <Link href="/publier" className="btn btn-primary">{t('h.pub')}</Link>}
      <Directory items={items} fixedKinds={KINDS} periods empty={{ title: t('op.empty.h'), text: t('op.empty.p'), href: '/publier', cta: t('h.pub') }} />
    </div>
  );
}
