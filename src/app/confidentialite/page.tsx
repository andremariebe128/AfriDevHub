import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';
import { getT } from '@/lib/i18n-server';

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await getT()).t('legal.privacy') });

export default function Page() {
  return <LegalPage slug="confidentialite" />;
}
