import type { Metadata } from 'next';
import { getT } from '@/lib/i18n-server';

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await getT()).t('reset.h'), robots: { index: false, follow: false } });

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
