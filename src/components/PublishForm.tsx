'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import { useT } from '@/components/I18n';

export default function PublishForm() {
  const { t } = useT();
  const [uid, setUid] = useState<string | null | undefined>(undefined);
  const [section, setSection] = useState<'opportunity' | 'mentor'>('opportunity');
  const [f, setF] = useState({ kind: '', title: '', meta: '', body: '', tags: '' });
  const [msg, setMsg] = useState<'ok' | 'err' | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { supabaseBrowser().auth.getSession().then(({ data }) => setUid(data.session?.user.id ?? null)); }, []);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;
    setBusy(true); setMsg(null);
    const tags = f.tags.split(',').map((x) => x.trim()).filter(Boolean).slice(0, 6);
    const { error } = await supabaseBrowser().from('listings').insert({ section, kind: f.kind.trim(), title: f.title.trim(), meta: f.meta.trim(), body: f.body.trim(), tags, author_id: uid });
    setBusy(false);
    setMsg(error ? 'err' : 'ok');
    if (!error) setF({ kind: '', title: '', meta: '', body: '', tags: '' });
  }

  if (uid === null) return <p className="card">{t('pub.login')} <Link href="/login" className="font-semibold text-brand-600 underline">{t('h.login')}</Link></p>;
  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-4">
      <div className="kente rounded-full" aria-hidden="true" />
      <h1 className="text-3xl font-black">{t('pub.h')}</h1>
      <p className="text-neutral-700 dark:text-neutral-300">{t('pub.p')}</p>
      <fieldset className="flex gap-2">
        <legend className="mb-2 text-sm font-semibold">{t('pub.section')}</legend>
        {(['opportunity', 'mentor'] as const).map((s) => (
          <button type="button" key={s} aria-pressed={section === s} onClick={() => setSection(s)} className={`chip ${section === s ? '!bg-brand-600 !text-white' : ''}`}>{s === 'opportunity' ? t('pub.opp') : t('pub.mentor')}</button>
        ))}
      </fieldset>
      <input className="input" required minLength={2} placeholder={t('pub.kind')} value={f.kind} onChange={set('kind')} />
      <input className="input" required minLength={3} maxLength={140} placeholder={t('pub.title')} value={f.title} onChange={set('title')} />
      <input className="input" placeholder={t('pub.meta')} value={f.meta} onChange={set('meta')} />
      <textarea className="input min-h-32" placeholder={t('pub.body')} value={f.body} onChange={set('body')} />
      <input className="input" placeholder={t('pub.tags')} value={f.tags} onChange={set('tags')} />
      <button className="btn btn-primary w-full" disabled={busy || !uid}>{t('pub.send')}</button>
      {msg && <p role="status" className="text-sm font-medium">{msg === 'ok' ? t('pub.ok') : t('pub.err')}</p>}
    </form>
  );
}
