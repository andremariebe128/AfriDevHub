import Link from 'next/link';
import type { Metadata } from 'next';
import { getT } from '@/lib/i18n-server';
import EmptyState from '@/components/EmptyState';
import QACard from '@/components/QACard';
import QuestionTabs from '@/components/QuestionTabs';
import Flag from '@/components/Flag';
import { IArrow, IDown, ISearch } from '@/components/Icons';
import { loadPopularTags, loadQuestions, type Sort } from '@/lib/data';
import { AFRICA, COUNTRIES } from '@/lib/countries';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ q?: string; tag?: string; sort?: string; pays?: string }> };

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await getT()).t('q.h') });

export default async function QuestionsPage({ searchParams }: Props) {
  const { t: tr, locale } = await getT();
  const { q = '', tag, sort: rawSort, pays } = await searchParams;
  const sort: Sort = rawSort === 'unanswered' || rawSort === 'top' ? rawSort : 'new';
  const [{ data: questions }, popularRaw] = await Promise.all([
    loadQuestions({ q, tag, country: pays, limit: 50, sort }),
    loadPopularTags(10),
  ]);
  const popular = tag && !popularRaw.includes(tag) ? [tag, ...popularRaw] : popularRaw;
  const extra = [q.trim() ? 'q=' + encodeURIComponent(q.trim()) : '', tag ? 'tag=' + encodeURIComponent(tag) : '', pays ? 'pays=' + encodeURIComponent(pays) : ''].filter(Boolean).join('&');
  const filtered = Boolean(q.trim() || tag || pays);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{tr('q.forum')}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/ask" className="btn btn-primary btn-sm hidden md:inline-flex">{tr('q.new')}<IArrow /></Link>
          <details className="relative">
            <summary className="btn btn-secondary btn-sm cursor-pointer list-none">{tr('q.spaces')} <IDown className="h-4 w-4" /></summary>
            <div className="absolute right-0 z-10 mt-2 max-h-80 w-72 overflow-y-auto rounded-lg border border-line bg-raised p-3 shadow-float">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-subtle">{tr('q.bycountry')}</p>
              <ul className="grid grid-cols-4 gap-2">
                {COUNTRIES.map((c) => (
                  <li key={c}>
                    <Link
                      href={pays === c ? '/questions' : `/questions?pays=${encodeURIComponent(c)}`}
                      title={c} aria-label={c}
                      aria-current={pays === c ? 'page' : undefined}
                      className={`flex min-h-11 items-center justify-center rounded-lg hover:bg-surface-2 ${pays === c ? 'ring-2 ring-brand-500 ring-offset-1 ring-offset-raised' : ''}`}
                    >
                      <Flag country={c} className="h-5 w-auto" />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/espaces" className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-accent-fg hover:underline md:min-h-8">{tr('pulse.all').replace('{n}', String(AFRICA.length))}<IArrow /></Link>
            </div>
          </details>
        </div>
      </div>

      <form action="/questions" method="get" role="search" className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <label htmlFor="q-search" className="sr-only">{tr('q.search')}</label>
          <ISearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <input id="q-search" name="q" type="search" defaultValue={q} placeholder={tr('dir.search')} className="input !pl-10" />
        </div>
        {tag && <input type="hidden" name="tag" value={tag} />}
        {pays && <input type="hidden" name="pays" value={pays} />}
        <button type="submit" className="btn btn-primary">{tr('q.go')}</button>
      </form>

      {(popular.length > 0 || filtered) && <div className="scrollbar-none mb-4 -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:mb-6 sm:flex-wrap sm:px-0" role="group" aria-label={tr('side.tags')}>
        {popular.map((tg) => (
          <Link
            key={tg}
            href={tag === tg ? (pays ? `/questions?pays=${encodeURIComponent(pays)}` : '/questions') : `/questions?tag=${encodeURIComponent(tg)}${pays ? '&pays=' + encodeURIComponent(pays) : ''}`}
            aria-pressed={tag === tg}
            className={`chip font-mono !px-3 !py-1.5 !text-[13px] ${tag === tg ? '!bg-brand-600 !text-white' : ''}`}
          >
            {tg}
          </Link>
        ))}
        {pays && (
          <span className="chip !border-brand-600 !bg-brand-600 !text-white">
            <Flag country={pays} className="h-3.5 w-auto" />
            {pays}
            <Link href={q.trim() || tag ? `/questions${q.trim() ? '?q=' + encodeURIComponent(q.trim()) : ''}${tag ? (q.trim() ? '&' : '?') + 'tag=' + encodeURIComponent(tag) : ''}` : '/questions'} aria-label={tr('q.clear')}
              className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/20 hover:bg-white/30">×</Link>
          </span>
        )}
        {filtered && <Link href="/questions" className="btn btn-ghost btn-sm">{tr('q.clear')}</Link>}
      </div>}

      <div className="mb-3"><QuestionTabs base="/questions" sort={sort} extra={extra ? extra + '&' : ''} /></div>
      {questions.length === 0 && <EmptyState title={tr('empty.q.h')} text={tr('q.hint')} href="/ask" cta={tr('q.new')} />}
      <div className="overflow-hidden rounded-lg border border-line bg-surface empty:hidden">
        {questions.map((item) => (
          <QACard key={item.id} q={item} excerpt />
        ))}
      </div>

      {/* Section Espace par pays — 54 pays */}
      <section className="mt-10" aria-label={tr('q.spaces')}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-subtle">{tr('q.spaces')}</h2>
        <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-9">
          {AFRICA.map((c) => (
            <li key={c.code}>
              <Link
                href={`/questions?pays=${encodeURIComponent(c.fr)}`}
                title={locale === 'en' ? c.en : c.fr} aria-label={locale === 'en' ? c.en : c.fr}
                aria-current={pays === c.fr ? 'page' : undefined}
                className={`flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-lg border px-1 py-1.5 transition ${pays === c.fr ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40' : 'border-line bg-surface hover:border-line-strong'}`}
              >
                <Flag country={c.fr} className="h-5 w-auto" />
                <span className="max-w-full truncate text-[10px] text-muted">{locale === 'en' ? c.en : c.fr}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
