import Link from 'next/link';
import InstallButton from '@/components/InstallButton';
import Logo from '@/components/Logo';
import Pulse from '@/components/Pulse';
import QuestionCard from '@/components/QuestionCard';
import { supabaseServer } from '@/lib/supabase';
import { getT } from '@/lib/i18n-server';
import type { QuestionRow } from '@/lib/types';

export const dynamic = 'force-dynamic';


async function latestQuestions(): Promise<QuestionRow[]> {
  try {
    const { data } = await supabaseServer()
      .from('questions')
      .select('*, profiles(username, country), answers(count)')
      .order('created_at', { ascending: false })
      .limit(5);
    return (data as QuestionRow[]) ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const questions = await latestQuestions();
  const { t } = await getT();
  const FEATURES = [
    { icon: '💬', title: t('f.qa.t'), text: t('f.qa.p') },
    { icon: '🚀', title: t('f.pr.t'), text: t('f.pr.p') },
    { icon: '🌍', title: t('f.af.t'), text: t('f.af.p') },
    { icon: '🎯', title: t('f.op.t'), text: t('f.op.p') },
    { icon: '🏆', title: t('f.re.t'), text: t('f.re.p') },
  ];

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-3 flex items-end justify-between">
          <h1 className="text-2xl font-bold">{t('feed.h')}</h1>
          <Link href="/questions" className="text-sm font-semibold text-brand-600">{t('home.all')}</Link>
        </div>
        <nav className="mb-4 flex flex-wrap gap-2" aria-label="Explorer">
          <Link href="/espaces" className="chip tag-0 !px-3 !py-1.5 !text-sm">🌍 {t('nav.s')}</Link>
          <Link href="/opportunites" className="chip tag-1 !px-3 !py-1.5 !text-sm">🎯 {t('nav.o')}</Link>
          <Link href="/mentors" className="chip tag-2 !px-3 !py-1.5 !text-sm">🤝 {t('nav.m')}</Link>
        </nav>
        <div className="space-y-3">
          {questions.length === 0 ? (
            <div className="card py-8 text-center">
              <h3 className="text-lg font-semibold">{t('home.empty.h')}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600">{t('home.empty.p')}</p>
              <Link href="/ask" className="btn btn-primary mt-4">{t('home.cta2')}</Link>
            </div>
          ) : (
            questions.map((q) => <QuestionCard key={q.id} q={q} />)
          )}
        </div>
      </section>

      <section className="card text-center">
        <div className="flex justify-center"><Logo variant="full" height={72} /></div>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-neutral-700 sm:text-base">{t('home.lead')}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Link href="/questions" className="btn btn-primary">{t('home.cta1')}</Link>
          <Link href="/ask" className="btn btn-soft">{t('home.cta2')}</Link>
          <InstallButton className="btn btn-soft" />
        </div>
      </section>

      <section className="card"><Pulse /></section>

      <section>
        <h2 className="text-xl font-bold">{t('home.prob.h')}</h2>
        <p className="mt-2 max-w-2xl text-sm text-neutral-700">{t('home.prob.p')}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {FEATURES.map((f) => (
            <article key={f.title} className="card">
              <span className="text-2xl" aria-hidden="true">{f.icon}</span>
              <h3 className="mt-2 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-neutral-600">{f.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
