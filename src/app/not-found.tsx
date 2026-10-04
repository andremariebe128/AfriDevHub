import Link from 'next/link';
import { getT } from '@/lib/i18n-server';

export default async function NotFound() {
  const { t } = await getT();
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-bold">{t('nf.h')}</h1>
      <p className="mt-2 text-neutral-500">{t('nf.p')}</p>
      <Link href="/questions" className="btn btn-primary mt-6">{t('nf.cta')}</Link>
    </div>
  );
}
