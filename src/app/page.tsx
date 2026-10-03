import Link from 'next/link';
import InstallButton from '@/components/InstallButton';
import QuestionCard from '@/components/QuestionCard';
import { supabaseServer } from '@/lib/supabase';
import type { QuestionRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

const FEATURES = [
  { icon: '💬', title: 'Questions & réponses', text: 'Pose tes questions techniques et reçois des réponses de devs qui connaissent ta réalité.' },
  { icon: '🚀', title: 'Projets', text: 'Partage ce que tu construis, trouve des collaborateurs et gagne en visibilité.' },
  { icon: '🌍', title: 'Pensé pour l’Afrique', text: 'Application web installable, mobile-first, légère, en français : Mobile Money, connexions limitées, marchés locaux.' },
  { icon: '🏆', title: 'Réputation', text: 'Votes et réponses acceptées : les meilleures contributions remontent naturellement.' },
];

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

  return (
    <div className="space-y-16">
      <section className="relative isolate overflow-hidden rounded-[2.5rem] bg-hero px-6 py-16 text-center sm:px-10 sm:py-20">
        <div className="african-blob" aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <div className="absolute inset-x-0 -bottom-40 -z-10 h-80 bg-gradient-to-t from-sand-50 to-transparent dark:from-neutral-950" aria-hidden="true" />

        <div className="relative mx-auto flex max-w-4xl flex-col items-center">
          <span className="pill mb-6 border-brand-200/80 bg-brand-50/95 text-brand-700 shadow-sm dark:border-brand-900/80 dark:bg-brand-950/90 dark:text-brand-100">
            La communauté des développeurs africains
          </span>
          <h1 className="text-balance text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Apprendre, partager,
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700 bg-clip-text text-transparent">
              {' '}collaborer
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-neutral-700 sm:text-xl dark:text-neutral-200">
            AfriDevHub connecte les développeurs africains pour poser des questions, partager leurs projets, trouver des mentors et des collaborateurs, et accéder aux opportunités du continent (stages, hackathons, événements).
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/questions" className="btn btn-primary group">
              Explorer les questions
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 01.75-.75h9.69l-2.72-2.72a.75.75 0 111.06-1.06l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3.75A.75.75 0 013 10z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            <Link href="/ask" className="btn btn-ghost">
              Poser une question
            </Link>
            <InstallButton className="btn btn-outline" />
          </div>
          <p className="mt-6 text-sm text-neutral-600 dark:text-neutral-400">
            Pensé mobile-first • Léger • Français &amp; Anglais • Fonctionne hors-ligne (PWA)
          </p>
        </div>
      </section>

      <section className="relative">
        <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="pill mb-3">Le problème qu'on résout</span>
            <h2 className="text-balance text-2xl font-black sm:text-3xl md:text-4xl">
              Des développeurs africains dispersés
            </h2>
            <p className="mt-3 max-w-2xl text-pretty text-base text-neutral-700 dark:text-neutral-200">
              Les développeurs africains sont dispersés sur des plateformes mondiales où leur réalité locale (connexion, paiement, marché, langues) est peu prise en compte. AfriDevHub crée un espace qui leur est fait sur-mesure.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <article key={f.title} className="card group h-full">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-2xl ring-1 ring-brand-100 transition group-hover:scale-105 dark:bg-brand-950/70 dark:ring-brand-900/70">
                <span aria-hidden="true">{f.icon}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">
                {f.title}
              </h3>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {f.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="pill mb-3">Communauté active</span>
            <h2 className="text-balance text-2xl font-black sm:text-3xl">
              Dernières questions
            </h2>
            <p className="mt-2 max-w-xl text-pretty text-base text-neutral-700 dark:text-neutral-200">
              Rejoins les échanges entre étudiants, développeurs juniors et confirmés, freelances et startups tech d&apos;Afrique.
            </p>
          </div>
          <Link
            href="/questions"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Tout voir
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h9.69l-2.72-2.72a.75.75 0 111.06-1.06l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3.75A.75.75 0 013 10z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
        <div className="space-y-3">
          {questions.length === 0 ? (
            <div className="card text-center py-10">
              <h3 className="text-lg font-semibold">Pas encore de questions</h3>
              <p className="mt-2 mx-auto max-w-md text-sm text-neutral-600 dark:text-neutral-400">
                Sois le premier à poser une question et lancer un échange dans la communauté.
              </p>
              <div className="mt-4">
                <Link href="/ask" className="btn btn-primary">
                  Poser une question
                </Link>
              </div>
            </div>
          ) : (
            questions.map((q) => <QuestionCard key={q.id} q={q} />)
          )}
        </div>
      </section>

      <section className="relative isolate overflow-hidden rounded-[2.5rem] border border-white/70 bg-gradient-to-br from-brand-700 via-brand-700 to-brand-800 px-6 py-12 text-center text-white shadow-lg dark:border-white/10 sm:px-10 sm:py-16">
        <div
          className="absolute inset-0 -z-10 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 70%), radial-gradient(circle at bottom right, rgba(242,177,52,0.22), transparent 70%)',
          }}
          aria-hidden="true"
        />
        <div className="absolute -left-24 -top-24 -z-10 h-64 w-64 rounded-full bg-gold-400/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -right-24 -z-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />

        <h2 className="text-balance text-2xl font-black sm:text-3xl md:text-4xl">
          Prêt à rejoindre la communauté tech africaine ?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-brand-50 sm:text-lg">
          Étudiants, développeurs juniors et confirmés, freelances et startups tech d&apos;Afrique. Apprends, partage, trouve des collaborateurs et accède aux opportunités du continent.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/questions" className="btn bg-white text-brand-700 shadow-sm hover:bg-brand-50">
            Explorer les questions
          </Link>
          <Link href="/ask" className="btn border border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/15">
            Poser une question
          </Link>
          <InstallButton className="btn bg-gold-400 text-brand-900 shadow-sm hover:bg-gold-500" />
        </div>
        <p className="mt-6 text-sm text-brand-50/90">
          Installe AfriDevHub en PWA • Fonctionne avec connexion instable • Multilingue (FR/EN)
        </p>
      </section>
    </div>
  );
}
