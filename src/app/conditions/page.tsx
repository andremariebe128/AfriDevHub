import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';
import { getT } from '@/lib/i18n-server';

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await getT()).t('legal.terms') });

export default function Page() {
  return <LegalPage slug="conditions" />;
}
