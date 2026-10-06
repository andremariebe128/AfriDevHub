import Link from 'next/link';
import type { Metadata } from 'next';
import { getT } from '@/lib/i18n-server';
import EmptyState from '@/components/EmptyState';
import QACard from '@/components/QACard';
import QuestionTabs from '@/components/QuestionTabs';
import Flag from '@/components/Flag';
import { IArrow, IDown, ISearch } from '@/components/Icons';
import { loadQuestions, type Sort } from '@/lib/data';
import { COUNTRY_CODES } from '@/lib/countries';
import { POPULAR_TAGS } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ q?: string; tag?: string; sort?: string }> };

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await getT()).t('q.h') });

export default async function QuestionsPage({ searchParams }: Props) {
  const { t: tr } = await getT();
  const { q = '', tag, sort: rawSort } = await searchParams;
  const sort: Sort = rawSort === 'unanswered' || rawSort === 'top' ? rawSort : 'new';
  const { data: questions, demo } = await loadQuestions({ q, tag, limit: 50, sort });
  const extra = [q.trim() ? 'q=' + encodeURIComponent(q.trim()) : '', tag ? 'tag=' + encodeURIComponent(tag) : ''].filter(Boolean).join('&');
  const filtered = Boolean(q.trim() || tag);

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
            <div className="absolute right-0 z-10 mt-2 w-64 rounded-lg border border-line bg-raised p-3 shadow-card">
              <ul className="grid grid-cols-4 gap-2">
                {Object.keys(COUNTRY_CODES).map((c) => (
                  <li key={c}>
                    <Link href={`/espaces?pays=${encodeURIComponent(c)}`} title={c} aria-label={c} className="flex min-h-11 items-center justify-center rounded-lg hover:bg-surface-2">
                      <Flag country={c} className="h-5 w-auto" />
                    </Link>
                  </li>
                ))}
              </ul>
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
        <button type="submit" className="btn btn-primary">{tr('q.go')}</button>
      </form>

      <div className="scrollbar-none mb-4 -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:mb-6 sm:flex-wrap sm:px-0" role="group" aria-label={tr('side.tags')}>
        {POPULAR_TAGS.map((tg) => (
          <Link
            key={tg}
            href={tag === tg ? '/questions' : `/questions?tag=${encodeURIComponent(tg)}`}
            aria-pressed={tag === tg}
            className={`chip font-mono !px-3 !py-1.5 !text-[13px] ${tag === tg ? '!bg-brand-600 !text-white' : ''}`}
          >
            {tg}
          </Link>
        ))}
        {filtered && <Link href="/questions" className="btn btn-ghost btn-sm">{tr('q.clear')}</Link>}
      </div>

      <div className="mb-3"><QuestionTabs base="/questions" sort={sort} extra={extra ? extra + '&' : ''} /></div>
      {questions.length === 0 && <EmptyState title={tr('empty.q.h')} text={tr('q.hint')} href="/ask" cta={tr('q.new')} />}
      <div className="overflow-hidden rounded-lg border border-line bg-surface empty:hidden">
        
        {questions.map((item) => (
          <QACard key={item.id} q={item} excerpt />
        ))}
      </div>
    </div>
  );
}
