import Link from 'next/link';
import Flag from '@/components/Flag';
import { countryName, oppKind } from '@/lib/utils';
import type { Item } from '@/lib/types';
import type { Locale } from '@/lib/i18n';

type Labels = { members: string; weekly: string };

/** Ligne de liste partagée (espaces, opportunités, mentors) et aperçu dans « Publier ». */
export default function ListingRow({ i, locale, labels }: { i: Item; locale: Locale; labels: Labels }) {
  return (
    <li className="border-b border-line px-4 py-3.5 last:border-b-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <h3 className="flex items-center gap-2 text-base font-semibold">
          {i.flag && <Flag country={i.flag} className="h-4 w-auto" />}
          {i.href ? <Link href={i.href} className="hover:text-accent-fg hover:underline">{i.flag ? countryName(i.flag, locale) : i.title}</Link> : (i.flag ? countryName(i.flag, locale) : i.title)}
        </h3>
        {!i.flag && i.kind && <span className="badge">{oppKind(i.kind, locale)}</span>}
      </div>
      {i.members != null ? (
        <p className="mt-0.5 font-mono text-xs text-subtle tabular">{i.members} {labels.members} · {i.weekly} {labels.weekly}</p>
      ) : (
        i.meta && <p className="mt-0.5 text-xs text-subtle">{i.meta}</p>
      )}
      {i.text && <p className="mt-1.5 text-sm text-muted">{locale === 'en' && i.en ? i.en.text : i.text}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <div className="flex flex-wrap gap-1.5">{i.tags.map((tg) => <span key={tg} className="chip">{tg}</span>)}</div>
        {i.author && <Link href={`/u/${encodeURIComponent(i.author)}`} className="tap ml-auto text-xs font-medium text-muted hover:text-accent-fg">@{i.author}</Link>}
      </div>
    </li>
  );
}
