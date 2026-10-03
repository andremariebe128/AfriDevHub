'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import { authorLine } from '@/lib/utils';
import type { AnswerRow } from '@/lib/types';
import Markdown from './Markdown';

type Props = {
  questionId: string;
  questionAuthorId: string;
  acceptedAnswerId: string | null;
  answers: AnswerRow[];
};

type Result = { error: { message: string } | null };

export default function AnswerSection({ questionId, questionAuthorId, acceptedAnswerId, answers }: Props) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabaseBrowser()
      .auth.getSession()
      .then(({ data }) => {
        setUserId(data.session?.user.id ?? null);
        setReady(true);
      });
  }, []);

  async function run(action: () => PromiseLike<Result>) {
    setBusy(true);
    setError(null);
    const { error: err } = await action();
    setBusy(false);
    if (err) setError(err.message);
    else router.refresh();
  }

  const vote = (answerId: string, value: 1 | -1) =>
    run(() =>
      supabaseBrowser()
        .from('answer_votes')
        .upsert({ answer_id: answerId, user_id: userId, value }, { onConflict: 'answer_id,user_id' }),
    );

  const accept = (answerId: string) =>
    run(() => supabaseBrowser().from('questions').update({ accepted_answer_id: answerId }).eq('id', questionId));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim().length < 5) {
      setError('Ta réponse est trop courte (5 caractères minimum).');
      return;
    }
    await run(async () => {
      const res = await supabaseBrowser()
        .from('answers')
        .insert({ question_id: questionId, author_id: userId, body: text.trim() });
      if (!res.error) setText('');
      return res;
    });
  }

  const ordered = [
    ...answers.filter((a) => a.id === acceptedAnswerId),
    ...answers.filter((a) => a.id !== acceptedAnswerId),
  ];
  const isQuestionAuthor = userId === questionAuthorId;

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">
        {answers.length} réponse{answers.length > 1 ? 's' : ''}
      </h2>

      <div className="mt-4 space-y-3">
        {ordered.length === 0 && (
          <p className="text-sm text-neutral-500">Pas encore de réponse. Aide ta communauté !</p>
        )}
        {ordered.map((a) => {
          const isAccepted = a.id === acceptedAnswerId;
          return (
            <div
              key={a.id}
              className={`card flex gap-3 ${isAccepted ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/30' : ''}`}
            >
              <div className="flex flex-col items-center text-neutral-500">
                <button
                  aria-label="Voter pour"
                  disabled={!userId || busy}
                  onClick={() => vote(a.id, 1)}
                  className="px-2 hover:text-brand-600 disabled:opacity-40"
                >
                  ▲
                </button>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{a.score}</span>
                <button
                  aria-label="Voter contre"
                  disabled={!userId || busy}
                  onClick={() => vote(a.id, -1)}
                  className="px-2 hover:text-red-600 disabled:opacity-40"
                >
                  ▼
                </button>
              </div>
              <div className="min-w-0 flex-1">
                {isAccepted && <p className="mb-1 text-sm font-semibold text-brand-600">✓ Réponse acceptée</p>}
                <Markdown>{a.body}</Markdown>
                <p className="mt-2 text-xs text-neutral-500">{authorLine(a.profiles?.username, null, a.created_at)}</p>
                {isQuestionAuthor && !isAccepted && (
                  <button onClick={() => accept(a.id)} disabled={busy} className="btn btn-outline mt-2 !py-1 !text-xs">
                    Accepter cette réponse
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <h3 className="mb-2 font-semibold">Ta réponse</h3>
        {!ready ? null : !userId ? (
          <p className="text-sm">
            <Link href="/login" className="font-semibold text-brand-600 underline">Connecte-toi</Link> pour répondre et voter.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <textarea
              className="input min-h-32"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Écris ta réponse (Markdown accepté)…"
            />
            <button type="submit" disabled={busy} className="btn btn-primary">
              {busy ? 'Envoi…' : 'Publier la réponse'}
            </button>
          </form>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </section>
  );
}
