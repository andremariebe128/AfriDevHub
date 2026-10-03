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
      <section className="rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 px-6 py-14 text-center text-white sm:px-12">
        <p className="mb-3 inline-block rounded-full bg-gold-400/20 px-3 py-1 text-xs font-semibold text-gold-400">
          Concours CADEV · Systalink
        </p>
        <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">
          La communauté des développeurs africains
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-brand-100">
          Poser des questions, partager vos projets, trouver des mentors et des opportunités. Apprendre, partager, collaborer.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/questions" className="btn bg-white text-brand-700 hover:bg-brand-50">
            Explorer les questions
          </Link>
          <InstallButton className="btn bg-gold-400 text-brand-900 hover:bg-gold-500" />
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold">Pourquoi AfriDevHub ?</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="card">
              <div className="text-2xl">{f.icon}</div>
              <h3 className="mt-2 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Dernières questions</h2>
          <Link href="/questions" className="text-sm font-semibold text-brand-600">Tout voir →</Link>
        </div>
        <div className="space-y-3">
          {questions.length === 0 ? (
            <p className="text-neutral-500">Aucune question pour le moment. Sois le premier à en poser une !</p>
          ) : (
            questions.map((q) => <QuestionCard key={q.id} q={q} />)
          )}
        </div>
      </section>

      <section className="card text-center">
        <h2 className="text-xl font-bold">Installe AfriDevHub sur ton téléphone</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-neutral-600 dark:text-neutral-400">
          Pas besoin de Play Store : AfriDevHub s&apos;installe depuis ton navigateur, prend très peu de place et reste utilisable avec une connexion instable.
        </p>
        <div className="mt-4">
          <InstallButton />
        </div>
      </section>
    </div>
  );
}
