import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Avatar from '@/components/Avatar';
import EmptyState from '@/components/EmptyState';
import Flag from '@/components/Flag';
import CvTimeline from '@/components/CvTimeline';
import { IExternal, IFolder, IGlobe, ILang } from '@/components/Icons';
import OwnerPrivate from '@/components/OwnerPrivate';
import QuestionCard from '@/components/QuestionCard';
import TagChip from '@/components/TagChip';
import { loadProfile } from '@/lib/data';
import { getT } from '@/lib/i18n-server';
import { countryName, safeUrl } from '@/lib/utils';
import type { Key } from '@/lib/i18n';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const name = decodeURIComponent(username);
  const { data } = await loadProfile(name);
  if (!data) return { title: (await getT()).t('nf.h') };
  return { title: `@${name}` };
}

const OPEN: Record<string, Key> = { mentor: 'p.o.mentor', collab: 'p.o.collab', work: 'p.o.work' };

export default async function PublicProfile({ params }: Props) {
  const { username } = await params;
  const { t, locale } = await getT();
  const { data } = await loadProfile(decodeURIComponent(username));
  if (!data) notFound();
  const { profile: p, questions, projects, rep, cv } = data;
  const safe = safeUrl;
  const gh = safe(p.github_url);
  const web = safe(p.website_url);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar name={p.full_name || p.username} src={p.avatar_url} size={80} />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">{p.full_name || `@${p.username}`}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-subtle">
            <span className="font-mono">@{p.username}</span>
            {p.country && <><span aria-hidden="true">·</span><Flag country={p.country} className="h-3.5 w-auto" /><span>{countryName(p.country, locale)}</span></>}
            {p.years_exp != null && <><span aria-hidden="true">·</span><span>{p.years_exp} {t('u.exp')}</span></>}
          </p>
          {p.headline && <p className="mt-2 font-medium">{p.headline}</p>}
          {p.bio && <p className="mt-2 max-w-2xl whitespace-pre-line text-muted">{p.bio}</p>}
          <OwnerPrivate profileId={p.id} part="bio" publicShown={Boolean(p.bio)} />
          {(p.open_to ?? []).length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {(p.open_to ?? []).map((o: string) => OPEN[o] && <span key={o} className="badge">{t(OPEN[o])}</span>)}
            </div>
          )}
          {(gh || web) && (
            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={t('u.links')}>
              {gh && <a className="btn btn-secondary" href={gh} target="_blank" rel="noopener noreferrer"><IFolder className="h-4 w-4" />{t('u.gh')}<IExternal className="h-3.5 w-3.5 text-subtle" /></a>}
              {web && <a className="btn btn-secondary" href={web} target="_blank" rel="noopener noreferrer"><IGlobe className="h-4 w-4" />{t('u.web')}<IExternal className="h-3.5 w-3.5 text-subtle" /></a>}
            </div>
          )}
          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 border-t border-line pt-3">
            {[[rep, t('u.rep')], [questions.length, t('u.q')], [projects.length, t('u.pj')]].map(([n, label]) => (
              <div key={label as string} className="flex items-baseline gap-1.5">
                <dd className="font-mono text-sm font-semibold tabular">{n}</dd>
                <dt className="text-sm text-subtle">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {((p.stack?.length ?? 0) > 0 || (p.languages?.length ?? 0) > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {(p.stack ?? []).map((s: string) => <TagChip key={s} tag={s} />)}
          {(p.languages ?? []).map((l: string) => <span key={l} className="chip"><ILang className="h-3.5 w-3.5" />{l}</span>)}
        </div>
      )}
      {cv.length > 0 && (
        <section aria-labelledby="cv-h">
          <h2 id="cv-h" className="mb-4 text-lg font-semibold">{t('u.cv')}</h2>
          <CvTimeline entries={cv} />
        </section>
      )}
      <OwnerPrivate profileId={p.id} part="cv" publicShown={cv.length > 0} />
      <section aria-labelledby="act-h">
        <h2 id="act-h" className="mb-4 text-lg font-semibold">{t('u.activity')}</h2>
        {questions.length === 0 ? <EmptyState title={t('u.none')} /> : <div className="overflow-hidden rounded-lg border border-line bg-surface">{questions.map((q) => <QuestionCard key={q.id} q={q} />)}</div>}
      </section>
      <section aria-labelledby="pj-h">
        <h2 id="pj-h" className="mb-4 text-lg font-semibold">{t('u.pj')}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.length === 0 && <div className="sm:col-span-2"><EmptyState title={t('u.none')} /></div>}
          {projects.map((j) => (
            <article key={j.id} className="card card-hover">
              <h3 className="font-semibold">{j.title}</h3>
              {j.tags.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{j.tags.map((tg) => <span key={tg} className="chip font-mono !text-[11.5px]">{tg}</span>)}</div>}
              {safe(j.url) && <a href={safe(j.url)!} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-accent-fg hover:underline">{t('pj.open')} <IExternal className="h-3.5 w-3.5" /></a>}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
