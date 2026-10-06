import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import EmptyState from '@/components/EmptyState';
import Flag from '@/components/Flag';
import QACard from '@/components/QACard';
import { loadSpace } from '@/lib/data';
import { getT } from '@/lib/i18n-server';
import { countryName } from '@/lib/utils';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await loadSpace((await params).slug);
  return { title: r?.space.name ?? 'AfriDevHub' };
}

export default async function SpacePage({ params }: Props) {
  const { slug } = await params;
  const [{ t, locale }, r] = await Promise.all([getT(), loadSpace(slug)]);
  if (!r) notFound();
  const { space, questions } = r;
  const isCountry = space.kind === 'country';
  return (
    <div className="space-y-5">
      <Link href="/espaces" className="text-sm text-muted hover:text-accent-fg">← {t('sp.h')}</Link>
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          {isCountry && <Flag country={space.name} className="h-5 w-auto" />}
          {isCountry ? countryName(space.name, locale) : space.name}
        </h1>
        <Link href="/ask" className="btn btn-primary ml-auto">{t('sp.ask')}</Link>
      </header>
      <p className="max-w-2xl text-muted">{locale === 'en' ? space.desc_en : space.desc_fr}</p>
      {questions.length === 0 ? (
        <EmptyState title={t('sp.none')} text="" href="/ask" cta={t('sp.ask')} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface">{questions.map((q) => <QACard key={q.id} q={q} />)}</div>
      )}
    </div>
  );
}
