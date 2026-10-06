'use client';
import Link from 'next/link';
import Flag from '@/components/Flag';
import { useT } from '@/components/I18n';
import { COUNTRIES } from '@/lib/countries';
import { countryName } from '@/lib/utils';

/** Espaces par pays : grille de drapeaux (vrais SVG) vers les espaces. */
export default function Pulse() {
  const { locale } = useT();
  return (
    <ul className="grid grid-cols-2 gap-1">
      {COUNTRIES.map((c) => (
        <li key={c}>
          <Link href={`/espaces?pays=${encodeURIComponent(c)}`} className="flex min-h-11 items-center gap-2 rounded-md px-2 text-sm text-muted transition hover:bg-surface-2 hover:text-fg">
            <Flag country={c} className="h-3.5 w-auto shrink-0" />
            <span className="truncate">{countryName(c, locale)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
