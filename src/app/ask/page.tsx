'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import { parseTags } from '@/lib/utils';

export default function AskPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (title.trim().length < 10) return setError('Le titre doit faire 10 caractères minimum.');
    if (body.trim().length < 20) return setError('Les détails doivent faire 20 caractères minimum.');
    setBusy(true);
    const { data, error: err } = await supabaseBrowser()
      .from('questions')
      .insert({ author_id: userId, title: title.trim(), body: body.trim(), tags: parseTags(tags) })
      .select('id')
      .single();
    setBusy(false);
    if (err) return setError(err.message);
    router.push(`/questions/${data.id}`);
  }

  if (!ready) return null;
  if (!userId) {
    return (
      <p>
        <Link href="/login" className="font-semibold text-brand-600 underline">Connecte-toi</Link> pour poser une question.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Poser une question</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Titre</label>
          <input className="input" maxLength={150} value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex : Comment intégrer Mobile Money dans Laravel ?" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Détails</label>
          <textarea className="input min-h-48" value={body} onChange={(e) => setBody(e.target.value)}
            placeholder="Décris ton problème. Markdown accepté (```code```)." />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Tags (virgules, 5 max)</label>
          <input className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="flutter, supabase, mobile-money" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className="btn btn-primary">{busy ? 'Publication…' : 'Publier'}</button>
      </form>
    </div>
  );
}
