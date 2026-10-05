import type { Metadata } from 'next';
import { getT } from '@/lib/i18n-server';

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await getT()).t('pub.h') });

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
