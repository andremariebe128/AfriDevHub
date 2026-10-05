import Link from 'next/link';
import type { Metadata } from 'next';
import { IArrow, IAward, IChat, IReply, IThumb } from '@/components/Icons';
import NotificationRow, { type Notif } from '@/components/NotificationRow';
import { getT } from '@/lib/i18n-server';

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await getT()).t('notif.h') });

export default async function Page() {
  const { t } = await getT();
  const items: Notif[] = []; // la liste sera alimentée quand les données arriveront
  const triggers = [
    { Icon: IChat, title: t('notif.t1'), text: t('notif.t1p') },
    { Icon: IAward, title: t('notif.t2'), text: t('notif.t2p') },
    { Icon: IThumb, title: t('notif.t3'), text: t('notif.t3p') },
    { Icon: IReply, title: t('notif.t4'), text: t('notif.t4p') },
  ];
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">{t('notif.h')}</h1>

      {items.length > 0 ? (
        <ul aria-label={t('notif.list')} className="mt-5 overflow-hidden rounded-lg border border-line bg-surface">
          {items.map((n) => <NotificationRow key={n.id} n={n} icon={<IChat className="h-4 w-4" />} />)}
        </ul>
      ) : (
        <section className="mt-5 rounded-lg border border-line bg-surface" aria-labelledby="ne-h">
          <div className="border-b border-line px-5 py-5">
            <h2 id="ne-h" className="text-base font-semibold">{t('notif.empty.h')}</h2>
            <p className="mt-1 text-sm text-muted">{t('notif.empty.p')}</p>
          </div>
          <ul className="divide-y divide-line">
            {triggers.map(({ Icon, title, text }) => (
              <li key={title} className="flex gap-4 px-5 py-3.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-surface-2 text-muted"><Icon className="h-4 w-4" /></span>
                <div>
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <p className="mt-0.5 text-sm text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-line px-5 py-3">
            <Link href="/?sort=unanswered" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-accent-fg hover:underline">{t('notif.cta')}<IArrow /></Link>
          </div>
        </section>
      )}
    </div>
  );
}
