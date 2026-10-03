'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import { parseTags } from '@/lib/utils';

export default function AddProjectForm() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', url: '', tags: '' });

  useEffect(() => {
    supabaseBrowser()
      .auth.getSession()
      .then(({ data }) => {
        setUserId(data.session?.user.id ?? null);
        setReady(true);
      });
  }, []);

  if (!ready) return null;
  if (!userId) {
    return (
      <p className="text-sm">
        <Link href="/login" className="font-semibold text-brand-600 underline">Connecte-toi</Link> pour partager un projet.
      </p>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.title.trim().length < 3) return setError('Le titre doit faire 3 caractères minimum.');
    if (form.url.trim() && !/^https?:\/\//.test(form.url.trim())) return setError('Le lien doit commencer par http.');
    setBusy(true);
    const { error: err } = await supabaseBrowser().from('projects').insert({
      author_id: userId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      url: form.url.trim() || null,
      tags: parseTags(form.tags),
    });
    setBusy(false);
    if (err) return setError(err.message);
    setForm({ title: '', description: '', url: '', tags: '' });
    router.refresh();
  }

  return (
    <details className="card">
      <summary className="cursor-pointer font-semibold text-brand-600">+ Partager un projet</summary>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input className="input" placeholder="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className="input min-h-20" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="input" placeholder="Lien (GitHub, démo…)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
        <input className="input" placeholder="Tags (virgules)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className="btn btn-primary">{busy ? 'Publication…' : 'Publier'}</button>
      </form>
    </details>
  );
}
