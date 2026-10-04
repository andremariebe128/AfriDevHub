import { getT } from '@/lib/i18n-server';

export default async function Page() {
  const { t } = await getT();
  return (
    <div className="mx-auto max-w-xl space-y-4 text-center">
      <h1 className="text-3xl font-black">{t('notif.h')}</h1>
      <p className="card text-neutral-700 dark:text-neutral-300">{t('notif.p')}</p>
    </div>
  );
}
