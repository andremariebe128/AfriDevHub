import type { Metadata } from 'next';
import { Suspense } from 'react';
import NewsFeed from '@/components/NewsFeed';
import { getT } from '@/lib/i18n-server';

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await getT()).t('news.h') });

export default function ActuPage() {
  return <Suspense fallback={null}><NewsFeed /></Suspense>;
}
