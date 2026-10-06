import type { Metadata } from 'next';
import NotificationsList from '@/components/NotificationsList';
import { getT } from '@/lib/i18n-server';

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await getT()).t('notif.h') });

export default async function Page() {
  const { t } = await getT();
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">{t('notif.h')}</h1>
      <NotificationsList />
    </div>
  );
}
