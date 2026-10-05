import Link from 'next/link';
import { getT } from '@/lib/i18n-server';
import type { Sort } from '@/lib/data';

/** Onglets Récentes / Sans réponse / Les mieux notées (liens, état dans l'URL). */
export default async function QuestionTabs({ base, sort, extra = '' }: { base: string; sort: Sort; extra?: string }) {
  const { t } = await getT();
  const tabs: { k: Sort; label: string }[] = [
    { k: 'new', label: t('tab.new') },
    { k: 'unanswered', label: t('tab.unanswered') },
    { k: 'top', label: t('tab.top') },
  ];
  return (
    <div role="group" aria-label={t('tab.label')} className="inline-flex rounded-md border border-line bg-surface-2 p-0.5">
      {tabs.map(({ k, label }) => (
        <Link key={k} href={(() => { const p = (extra + (k === 'new' ? '' : 'sort=' + k)).replace(/&$/, ''); return p ? base + '?' + p : base; })()} scroll={false} aria-current={sort === k ? 'page' : undefined}
          className={`inline-flex min-h-11 items-center rounded px-3 text-[13px] font-medium md:min-h-8 ${sort === k ? 'bg-surface text-fg shadow-[0_0_0_1px_var(--line)]' : 'text-muted hover:text-fg'}`}>
          {label}
        </Link>
      ))}
    </div>
  );
}
