'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import { authorLine } from '@/lib/utils';
import type { AnswerRow } from '@/lib/types';
import { useT } from '@/components/I18n';
import { IDown, ISolved, IUp } from '@/components/Icons';
import Markdown from './Markdown';

type Props = {
  questionId: string;
  questionAuthorId: string;
  acceptedAnswerId: string | null;
  answers: AnswerRow[];
  /** Données de démonstration : lecture seule (aucune écriture possible). */
  readOnly?: boolean;
};

type Result = { error: { message: string } | null };

export default function AnswerSection({ questionId, questionAuthorId, acceptedAnswerId, answers, readOnly = false }: Props) {
  const router = useRouter();
  const { t, locale } = useT();
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
      setError(t('err.ans5'));
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
      <h2 className="text-xl font-bold">
        {answers.length} {answers.length > 1 ? t('c.ansn') : t('c.ans1')}
      </h2>

      <div className="mt-4 space-y-3">
        {ordered.length === 0 && (
          <p className="text-sm text-neutral-500">{t('an.none')}</p>
        )}
        {ordered.map((a) => {
          const isAccepted = a.id === acceptedAnswerId;
          return (
            <div
              key={a.id}
              className={`card flex gap-3 ${isAccepted ? 'border-leaf-500/50 bg-leaf-500/[0.06]' : ''}`}
            >
              <div className="flex flex-col items-center text-neutral-500">
                <button
                  aria-label={t('an.up')}
                  disabled={!userId || busy || readOnly}
                  onClick={() => vote(a.id, 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-surface-2 hover:text-accent-fg disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <IUp className="h-6 w-6" />
                </button>
                <span className="font-display text-lg font-bold text-fg">{a.score}</span>
                <button
                  aria-label={t('an.down')}
                  disabled={!userId || busy || readOnly}
                  onClick={() => vote(a.id, -1)}
                  className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-surface-2 hover:text-red-600 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <IDown className="h-6 w-6" />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                {isAccepted && <p className="mb-1 inline-flex items-center gap-1.5 text-sm font-semibold text-success"><ISolved />{t('an.accepted')}</p>}
                <Markdown>{a.body}</Markdown>
                <p className="mt-2 text-xs text-neutral-500">{authorLine(a.profiles?.username, null, a.created_at, locale)}</p>
                {isQuestionAuthor && !isAccepted && (
                  <button onClick={() => accept(a.id)} disabled={busy} className="btn btn-outline mt-2 !py-1 !text-xs">
                    {t('an.accept')}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <h3 className="mb-2 font-semibold">{t('an.your')}</h3>
        {readOnly ? (
          <p className="rounded-md border border-gold-400/40 bg-gold-400/10 p-3.5 text-sm text-muted">{t("q.demo.reply")}</p>
        ) : !ready ? null : !userId ? (
          <p className="text-sm">
            <Link href="/login" className="font-semibold text-accent-fg underline">{t('lnk.login')}</Link>{t('lnk.ans')}
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <label htmlFor="answer-body" className="sr-only">{t("an.your")}</label>
            <textarea
              id="answer-body"
              className="input min-h-32"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('an.ph')}
            />
            <button type="submit" disabled={busy} className="btn btn-primary">
              {busy ? t('an.busy') : t('an.send')}
            </button>
          </form>
        )}
        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    </section>
  );
}
