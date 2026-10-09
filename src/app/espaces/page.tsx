import Directory from '@/components/Directory';
import { loadSpaces } from '@/lib/data';
import type { Metadata } from 'next';
import { getT } from '@/lib/i18n-server';

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await getT()).t('sp.h') });

export default async function Page({ searchParams }: { searchParams: Promise<{ pays?: string }> }) {
  const { pays } = await searchParams;
  const { t, locale } = await getT();
  const items = await loadSpaces(locale);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold">{t('sp.h')}</h1></div>
      <p className="max-w-2xl text-neutral-700 dark:text-neutral-300">{t('sp.p')}</p>
      <Directory items={items} initial={pays ?? ''} empty={{ title: t('sp.empty.h'), text: t('sp.empty.p') }} />
    </div>
  );
}
