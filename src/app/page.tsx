import Link from 'next/link';
import Avatar from '@/components/Avatar';
import DemoBadge from '@/components/DemoBadge';
import EmptyState from '@/components/EmptyState';
import Flag from '@/components/Flag';
import { IArrow, IGlobe, ISearch } from '@/components/Icons';
import Pulse from '@/components/Pulse';
import QACard from '@/components/QACard';
import QuestionTabs from '@/components/QuestionTabs';
import { loadContributors, loadQuestions, loadStats, type Sort } from '@/lib/data';
import { getT } from '@/lib/i18n-server';
import { OPPS } from '@/lib/seed';
import { POPULAR_TAGS, countryName, oppKind } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const wrap = 'mx-auto max-w-6xl px-4 sm:px-6';
const sideHead = 'text-xs font-semibold uppercase tracking-wide text-subtle';

export default async function HomePage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const { sort: rawSort } = await searchParams;
  const sort: Sort = rawSort === 'unanswered' || rawSort === 'top' ? rawSort : 'new';
  const [{ t, locale }, questions, stats, top] = await Promise.all([getT(), loadQuestions({ limit: 10, sort }), loadStats(), loadContributors(5)]);
  const nf = new Intl.NumberFormat(locale);
  const demo = questions.demo || stats.demo;
  const s = stats.data;
  const facts = [
    [s.members, t('stat.members')],
    [s.countries, t('stat.countries')],
    [s.solved, t('stat.solved')],
    [s.projects, t('stat.projects')],
  ] as const;

  return (
    <div>
      <section className="border-b border-line bg-surface">
        <div className={`${wrap} py-8 sm:py-12`}>
          <div className="max-w-3xl">
            <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.03em] sm:text-4xl">{t('home.title')}</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{t('home.hook')}</p>

            <form action="/questions" method="get" role="search" className="mt-5 flex max-w-xl gap-2">
              <div className="relative min-w-0 flex-1">
                <label htmlFor="hero-q" className="sr-only">{t('q.search')}</label>
                <ISearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
                <input id="hero-q" name="q" type="search" placeholder={t('dir.search')} className="input !pl-9" />
              </div>
              <button type="submit" className="btn btn-secondary">{t('q.go')}</button>
              <Link href="/ask" className="btn btn-primary hidden sm:inline-flex">{t('home.cta2')}</Link>
            </form>
            <Link href="/ask" className="btn btn-primary mt-3 sm:hidden">{t('home.cta2')}<IArrow /></Link>
          </div>

          <dl className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-line pt-4">
            {facts.map(([n, label]) => (
              <div key={label} className="flex items-baseline gap-1.5">
                <dd className="font-mono text-sm font-semibold tabular">{nf.format(n)}</dd>
                <dt className="text-sm text-subtle">{label}</dt>
              </div>
            ))}
            {demo && <DemoBadge className="sm:ml-auto" />}
          </dl>
        </div>
      </section>

      <div className={`${wrap} grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_19rem]`}>
        <section aria-labelledby="feed-h">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 id="feed-h" className="text-lg font-semibold">{t('home.last.h')}</h2>
            <QuestionTabs base="/" sort={sort} />
          </div>
          {questions.data.length === 0 ? (
            <EmptyState title={t('home.empty.h')} text={t('home.empty.p')} href="/ask" cta={t('home.cta2')} />
          ) : (
            <div className="overflow-hidden rounded-lg border border-line bg-surface">
              {questions.data.map((q) => <QACard key={q.id} q={q} />)}
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 rounded-lg border border-line bg-surface-2/60 px-4 py-2 text-sm text-muted">
            <p><span className="font-medium text-fg">{t('strip.t')}</span> <Link href="/ask" className="tap text-accent-fg hover:underline">{t('strip.a')}</Link></p>
            <Link href="/?sort=unanswered" className="inline-flex min-h-11 items-center gap-1 text-accent-fg hover:underline md:min-h-8">{t('strip.b')}<IArrow /></Link>
          </div>
        </section>

        <aside className="space-y-7 lg:sticky lg:top-24 lg:self-start" aria-label={t('side.tags')}>
          <nav aria-label={t('side.tags')}>
            <h3 className={sideHead}>{t('side.tags')}</h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {POPULAR_TAGS.map((tg) => (
                <li key={tg}><Link href={`/questions?tag=${encodeURIComponent(tg)}`} className="chip tap font-mono !text-[12px]">{tg}</Link></li>
              ))}
            </ul>
          </nav>

          <section>
            <h3 className={sideHead}>{t('side.top')}</h3>
            <ol className="mt-1 divide-y divide-line border-y border-line">
              {top.data.map((c, i) => (
                <li key={c.username}>
                  <Link href={`/u/${encodeURIComponent(c.username)}`} className="flex min-h-11 items-center gap-3 py-1.5 hover:text-accent-fg">
                    <span className="w-3 font-mono text-xs text-subtle">{i + 1}</span>
                    <Avatar name={c.username} size={26} />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">@{c.username}</span>
                    {c.country && <Flag country={c.country} className="h-3 w-auto" />}
                    {c.rep > 0 && <span className="font-mono text-xs text-subtle tabular">{nf.format(c.rep)}</span>}
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h3 className={sideHead}>{t('side.opps')}</h3>
            <ul className="mt-1 divide-y divide-line border-y border-line">
              {OPPS.slice(0, 3).map((o) => (
                <li key={o.title}>
                  <Link href="/opportunites" className="block py-2.5 hover:text-accent-fg">
                    <span className="text-xs text-subtle">{oppKind(o.kind, locale)}</span>
                    <span className="mt-0.5 block text-sm font-medium leading-snug">{o.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className={`${sideHead} flex items-center gap-1.5`}><IGlobe className="h-3.5 w-3.5" />{t('q.spaces')}</h3>
            <div className="mt-1"><Pulse /></div>
          </section>
        </aside>
      </div>
    </div>
  );
}
