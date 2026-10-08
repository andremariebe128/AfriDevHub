'use client';
import Link from 'next/link';
import Flag from '@/components/Flag';
import { useT } from '@/components/I18n';
import { IArrow } from '@/components/Icons';
import { AFRICA } from '@/lib/countries';
import { countryName } from '@/lib/utils';

export type PulseCountry = { name: string; href: string; members: number };

/** Espaces par pays : les pays les plus actifs (compteurs réels) puis un lien vers les 54 espaces. */
export default function Pulse({ countries }: { countries: PulseCountry[] }) {
  const { t, locale } = useT();
  return (
    <div>
      <ul className="grid grid-cols-2 gap-1">
        {countries.map((c) => (
          <li key={c.name}>
            <Link href={c.href} className="flex min-h-11 items-center gap-2 rounded-md px-2 text-sm text-muted transition hover:bg-surface-2 hover:text-fg">
              <Flag country={c.name} className="h-3.5 w-auto shrink-0" />
              <span className="truncate">{countryName(c.name, locale)}</span>
              {c.members > 0 && <span className="ml-auto font-mono text-xs text-subtle tabular">{c.members}</span>}
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/espaces" className="mt-1 inline-flex min-h-11 items-center gap-1 px-2 text-sm font-medium text-accent-fg hover:underline md:min-h-8">
        {t('pulse.all').replace('{n}', String(AFRICA.length))}<IArrow />
      </Link>
    </div>
  );
}
