import Link from 'next/link';
import Avatar from '@/components/Avatar';
import Flag from '@/components/Flag';
import { ICalendar, IGlobe } from '@/components/Icons';
import { ALL_COUNTRIES, findCountry } from '@/lib/countries';
import { daysLeft, formatRange, phaseOf, type Phase } from '@/lib/dates';
import { DICT, type Locale } from '@/lib/i18n';
import { countryName, oppKind } from '@/lib/utils';
import type { Item } from '@/lib/types';

const PHASE_CLASS: Record<Phase, string> = {
  upcoming: '!border-brand-500/40 !bg-brand-500/10 !text-accent-fg',
  ongoing: 'badge-success',
  ended: '!text-subtle',
};

/**
 * Ligne de liste partagée (espaces, opportunités, mentors) et aperçu dans « Publier ».
 * `today` (AAAA-MM-JJ, fuseau du visiteur) n'est connu qu'après l'hydratation : sans lui, les dates s'affichent sans statut.
 */
export default function ListingRow({ i, locale, today = null }: { i: Item; locale: Locale; today?: string | null }) {
  const T = DICT[locale];
  const range = formatRange(i.startDate ?? null, i.endDate ?? null, locale);
  const phase = today ? phaseOf(i.startDate ?? null, i.endDate ?? null, today) : null;
  const left = phase === 'ongoing' && today ? daysLeft(i.endDate ?? null, today) : null;
  const leftText = left == null ? null : left === 0 ? T['op.endstoday'] : left === 1 ? T['op.endsin1'] : T['op.endsin'].replace('{n}', String(left));
  const known = i.country ? findCountry(i.country) : null;
  const isAll = i.country === ALL_COUNTRIES;
  // Compteurs réels, affichés seulement s'ils sont > 0 (singulier / pluriel gérés).
  const counters: string[] = [];
  if ((i.members ?? 0) > 0) counters.push(`${i.members} ${i.members === 1 ? T['sp.member1'] : T['sp.members']}`);
  if ((i.weekly ?? 0) > 0) counters.push(`${i.weekly} ${i.weekly === 1 ? T['sp.weekly1'] : T['sp.weekly']}`);
  const hasFacts = Boolean(range || i.country);

  return (
    <li className="border-b border-line px-4 py-3.5 last:border-b-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="flex items-center gap-2 text-base font-semibold">
          {i.flag && <Flag country={i.flag} className="h-4 w-auto" />}
          {i.href ? <Link href={i.href} className="hover:text-accent-fg hover:underline">{i.flag ? countryName(i.flag, locale) : i.title}</Link> : (i.flag ? countryName(i.flag, locale) : i.title)}
        </h3>
        {!i.flag && i.kind && <span className="badge">{oppKind(i.kind, locale)}</span>}
        {phase && <span className={`badge ${PHASE_CLASS[phase]}`}>{T[`op.status.${phase}` as const]}</span>}
      </div>
      {counters.length > 0 ? (
        <p className="mt-0.5 font-mono text-xs text-subtle tabular">{counters.join(' · ')}</p>
      ) : (
        i.meta && <p className="mt-0.5 text-xs text-subtle">{i.meta}</p>
      )}
      {hasFacts && (
        <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          {range && (
            <span className="inline-flex items-center gap-1.5"><ICalendar className="h-4 w-4 shrink-0 text-subtle" />{range}</span>
          )}
          {leftText && <span className="font-medium text-warm">{leftText}</span>}
          {i.country && (
            <span className="inline-flex items-center gap-1.5">
              {isAll ? <IGlobe className="h-4 w-4 shrink-0 text-subtle" /> : known ? <Flag country={known.fr} className="h-3.5 w-auto" /> : null}
              {isAll ? T['ctry.all'] : countryName(i.country, locale)}
            </span>
          )}
        </p>
      )}
      {i.text && <p className="mt-1.5 text-sm text-muted">{locale === 'en' && i.en ? i.en.text : i.text}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <div className="flex flex-wrap gap-1.5">{i.tags.map((tg) => <span key={tg} className="chip">{tg}</span>)}</div>
        {i.author && (
          <Link href={`/u/${encodeURIComponent(i.author)}`} className="tap ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-accent-fg">
            <Avatar name={i.author} src={i.authorAvatar} size={20} className="!ring-0" />@{i.author}
          </Link>
        )}
      </div>
    </li>
  );
}
