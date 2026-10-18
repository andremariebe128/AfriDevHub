'use client';
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useT } from '@/components/I18n';
import ImageInsert from '@/components/ImageInsert';
import { friendlyError } from '@/lib/errors';
import { COVER_BUCKET } from '@/lib/image';
import { supabaseBrowser } from '@/lib/supabase';
import { parseTags, safeUrl } from '@/lib/utils';

export type ProjectInit = { id: string; title: string; description: string | null; url: string | null; tags: string[]; cover: string | null };

/** Formulaire de création ou de modification d'un projet (avec image de couverture). */
export function ProjectForm({ userId, initial, onDone, onCancel }: { userId: string; initial?: ProjectInit; onDone: () => void; onCancel?: () => void }) {
  const { t } = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cover, setCover] = useState<string | null>(initial?.cover ?? null);
  const [form, setForm] = useState({ title: initial?.title ?? '', description: initial?.description ?? '', url: initial?.url ?? '', tags: (initial?.tags ?? []).join(', ') });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.title.trim().length < 3) return setError(t('err.title3'));
    if (form.url.trim() && !safeUrl(form.url.trim())) return setError(t('err.url'));
    setBusy(true);
    const fields = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      url: form.url.trim() || null,
      tags: parseTags(form.tags),
      cover_url: cover,
    };
    const sb = supabaseBrowser();
    const { error: err } = initial
      ? await sb.from('projects').update(fields).eq('id', initial.id)
      : await sb.from('projects').insert({ author_id: userId, ...fields });
    setBusy(false);
    if (err) return setError(friendlyError(err.message, t));
    onDone();
  }

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <label className="sr-only" htmlFor="pj-title">{t('ask.title')}</label>
      <input id="pj-title" className="input" maxLength={120} placeholder={t('ask.title')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <label className="sr-only" htmlFor="pj-desc">{t('pj.desc')}</label>
      <textarea id="pj-desc" className="input min-h-20" maxLength={1000} placeholder={t('pj.desc')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <label className="sr-only" htmlFor="pj-link">{t('pj.link')}</label>
      <input id="pj-link" className="input" inputMode="url" placeholder={t('pj.link')} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
      <label className="sr-only" htmlFor="pj-tags">{t('pj.tags')}</label>
      <input id="pj-tags" className="input" placeholder={t('pj.tags')} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
      <div>
        <p className="mb-1.5 text-sm font-semibold">{t('pj.cover')}</p>
        <div className="flex items-center gap-3">
          {cover && <img src={cover} alt="" className="h-16 w-28 rounded-md border border-line object-cover" loading="lazy" />}
          <ImageInsert userId={userId} bucket={COVER_BUCKET} maxSide={1280} onUrl={setCover} onProblem={setError} label={t('pj.cover')}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-line-strong text-muted hover:bg-surface-2 hover:text-fg" />
          {cover && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCover(null)}>{t('av.remove')}</button>}
        </div>
        <p className="mt-1 text-xs text-subtle">{t('pj.cover.hint')}</p>
      </div>
      {error && <p role="alert" className="text-sm text-red-700 dark:text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="btn btn-primary">{busy ? t('busy.pub') : initial ? t('ui.save') : t('act.pub')}</button>
        {onCancel && <button type="button" className="btn btn-ghost" onClick={onCancel}>{t('ui.cancel')}</button>}
      </div>
    </form>
  );
}

export default function AddProjectForm({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const router = useRouter();
  const { t } = useT();
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [n, setN] = useState(0);

  useEffect(() => {
    supabaseBrowser()
      .auth.getSession()
      .then(({ data }) => { setUserId(data.session?.user.id ?? null); setReady(true); })
      .catch(() => setReady(true));
  }, []);

  if (!ready) return null;
  if (!userId) {
    return (
      <p className="text-sm">
        <Link href="/login" className="font-semibold text-brand-600 underline">{t('lnk.login')}</Link>{t('lnk.proj')}
      </p>
    );
  }

  return (
    <details id="add-project" className="card" open={defaultOpen || undefined}>
      <summary className="cursor-pointer font-semibold text-brand-600">{t('pj.add')}</summary>
      <div className="mt-4">
        <ProjectForm key={n} userId={userId} onDone={() => { setN(n + 1); router.refresh(); }} />
      </div>
    </details>
  );
}
