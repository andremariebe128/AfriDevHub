'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useT } from '@/components/I18n';
import { BlockPanel, ReportPanel } from '@/components/Moderation';
import { friendlyError } from '@/lib/errors';
import { supabaseBrowser } from '@/lib/supabase';

const btn = 'min-h-9 rounded px-2 text-sm font-medium text-muted hover:text-fg hover:underline';

/** Actions sur la question : modifier / supprimer (auteur), signaler / bloquer (autres). */
export default function QuestionActions({ questionId, authorId, authorName }: { questionId: string; authorId: string; authorName: string }) {
  const { t } = useT();
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [panel, setPanel] = useState<'report' | 'block' | 'delete' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabaseBrowser().auth.getSession().then(({ data }) => setUid(data.session?.user.id ?? null)).catch(() => {});
  }, []);
  if (!uid) return null;

  async function remove() {
    setBusy(true); setError(null);
    const { error: err } = await supabaseBrowser().from('questions').delete().eq('id', questionId);
    setBusy(false);
    if (err) return setError(friendlyError(err.message, t));
    router.push('/questions');
    router.refresh();
  }

  return (
    <div className="mt-2">
      <div className="flex flex-wrap gap-1">
        {uid === authorId ? (
          <>
            <Link href={`/ask?edit=${questionId}`} className={`${btn} inline-flex items-center`}>{t('ui.edit')}</Link>
            <button type="button" className={btn} onClick={() => setPanel('delete')}>{t('ui.delete')}</button>
          </>
        ) : (
          <>
            <button type="button" className={btn} onClick={() => setPanel('report')}>{t('rp.action')}</button>
            <button type="button" className={btn} onClick={() => setPanel('block')}>{t('blk.action')}</button>
          </>
        )}
      </div>
      {panel === 'delete' && (
        <div className="mt-2 space-y-2 rounded-lg border border-red-600/30 bg-red-600/[0.05] p-3">
          <p className="text-sm font-semibold">{t('del.q.h')}</p>
          <p className="text-xs text-muted">{t('del.q.p')}</p>
          <div className="flex gap-2">
            <button type="button" disabled={busy} className="btn btn-primary btn-sm" onClick={() => void remove()}>{t('ui.delete')}</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPanel(null)}>{t('ui.cancel')}</button>
          </div>
          {error && <p role="alert" className="text-xs text-red-700 dark:text-red-400">{error}</p>}
        </div>
      )}
      {panel === 'report' && <ReportPanel userId={uid} type="question" targetId={questionId} onClose={() => setPanel(null)} />}
      {panel === 'block' && <BlockPanel userId={uid} targetId={authorId} name={authorName} onClose={() => setPanel(null)} onBlocked={() => { setPanel(null); router.push('/questions'); router.refresh(); }} />}
    </div>
  );
}
