'use client';
import { useT } from '@/components/I18n';
import { IBriefcase, IExternal, IFolder, IAward, IGrad } from '@/components/Icons';
import { CV_TYPES, sortCv, type CvEntry, type CvType } from '@/lib/cv';
import { formatMonth } from '@/lib/dates';
import { safeUrl } from '@/lib/utils';

const ICONS: Record<CvType, (p: { className?: string }) => React.ReactElement> = { experience: IBriefcase, education: IGrad, project: IFolder, certification: IAward };

/** Période lisible : « mars 2022 – juin 2024 », « Depuis mars 2022 ». */
export function cvPeriod(e: CvEntry, locale: 'fr' | 'en', t: (k: 'cv.now' | 'cv.since') => string): string {
  const a = formatMonth(e.start, locale);
  if (e.current) return t('cv.since').replace('{d}', a);
  const b = formatMonth(e.end, locale);
  return !b || b === a ? a : `${a} – ${b}`;
}

/** Parcours public : frise sobre par type (expériences, formations, projets, certifications), triée par date. */
export default function CvTimeline({ entries }: { entries: CvEntry[] }) {
  const { t, locale } = useT();
  const groups = CV_TYPES.map((type) => ({ type, list: sortCv(entries.filter((e) => e.type === type)) })).filter((g) => g.list.length > 0);
  return (
    <div className="space-y-6">
      {groups.map(({ type, list }) => {
        const Icon = ICONS[type];
        return (
          <section key={type} aria-labelledby={`cv-h-${type}`}>
            <h3 id={`cv-h-${type}`} className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-subtle"><Icon className="h-4 w-4" />{t(`cv.h.${type}` as const)}</h3>
            <ol className="space-y-5 border-l border-line-strong pl-5">
              {list.map((e) => {
                const link = safeUrl(e.url);
                return (
                  <li key={e.id} className="relative">
                    <span className="absolute -left-[25.5px] top-2 h-2 w-2 rounded-full border border-line-strong bg-canvas" aria-hidden="true" />
                    <p className="font-semibold leading-snug">{e.title}</p>
                    <p className="mt-0.5 text-sm text-subtle">
                      {e.org && <>{e.org}{' · '}</>}<span className="font-mono text-xs tabular">{cvPeriod(e, locale, t)}</span>
                    </p>
                    {e.description && <p className="mt-1.5 max-w-2xl whitespace-pre-line text-sm text-muted">{e.description}</p>}
                    {link && <a href={link} target="_blank" rel="noopener noreferrer" className="tap mt-1 inline-flex items-center gap-1 text-sm font-medium text-accent-fg hover:underline">{t('cv.link')} <IExternal className="h-3.5 w-3.5" /></a>}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
