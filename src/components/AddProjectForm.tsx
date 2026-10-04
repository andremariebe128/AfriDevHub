'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useT } from '@/components/I18n';
import { supabaseBrowser } from '@/lib/supabase';
import { parseTags } from '@/lib/utils';

export default function AddProjectForm() {
  const router = useRouter();
  const { t } = useT();
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
        <Link href="/login" className="font-semibold text-brand-600 underline">{t('lnk.login')}</Link>{t('lnk.proj')}
      </p>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.title.trim().length < 3) return setError(t('err.title3'));
    if (form.url.trim() && !/^https?:\/\//.test(form.url.trim())) return setError(t('err.url'));
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
      <summary className="cursor-pointer font-semibold text-brand-600">{t('pj.add')}</summary>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input className="input" placeholder={t('ask.title')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className="input min-h-20" placeholder={t('pj.desc')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="input" placeholder={t('pj.link')} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
        <input className="input" placeholder={t('pj.tags')} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className="btn btn-primary">{busy ? t('busy.pub') : t('act.pub')}</button>
      </form>
    </details>
  );
}
