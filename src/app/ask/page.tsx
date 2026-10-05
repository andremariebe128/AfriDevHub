'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { describedBy, Field, TagInput } from '@/components/Field';
import FormSkeleton from '@/components/FormSkeleton';
import { useT } from '@/components/I18n';
import { IAlert, IBold, IBraces, ICode, ILink, ITip } from '@/components/Icons';
import Markdown from '@/components/Markdown';
import { friendlyError } from '@/lib/errors';
import { supabaseBrowser } from '@/lib/supabase';
import { parseTags, POPULAR_TAGS } from '@/lib/utils';

export default function AskPage() {
  const router = useRouter();
  const { t } = useT();
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [pane, setPane] = useState<'write' | 'preview'>('write');
  const area = useRef<HTMLTextAreaElement>(null);

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
    setTouched(true);
    if (title.trim().length < 10) return setError(t('err.title10'));
    if (body.trim().length < 20) return setError(t('err.body20'));
    setBusy(true);
    const { data, error: err } = await supabaseBrowser()
      .from('questions')
      .insert({ author_id: userId, title: title.trim(), body: body.trim(), tags: parseTags(tags.join(',')) })
      .select('id')
      .single();
    setBusy(false);
    if (err) return setError(friendlyError(err.message, t));
    router.push(`/questions/${data.id}`);
  }

  /** Entoure la sélection (ou insère un modèle) dans le textarea. */
  function wrap(before: string, after: string, fallback: string) {
    const el = area.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const sel = body.slice(s, e) || fallback;
    const next = body.slice(0, s) + before + sel + after + body.slice(e);
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  }

  if (!ready) return <FormSkeleton />;
  if (!userId) {
    return (
      <p className="rounded-lg border border-line bg-surface p-5">
        <Link href="/login" className="font-semibold text-accent-fg underline">{t('lnk.login')}</Link>{t('lnk.ask')}
      </p>
    );
  }

  const tb = 'flex h-10 w-10 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-fg md:h-8 md:w-8';
  const tabCls = (on: boolean) => `flex min-h-11 flex-1 items-center justify-center rounded px-3 text-sm font-semibold ${on ? 'bg-surface text-fg shadow-[0_0_0_1px_var(--line)]' : 'text-muted'}`;
  const titleErr = touched && title.trim().length < 10 ? t('err.title10') : null;
  const bodyErr = touched && body.trim().length < 20 ? t('err.body20') : null;

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-6 text-2xl font-bold">{t('ask.h')}</h1>
      <form onSubmit={submit} className="space-y-5" noValidate>
        <Field id="ask-title" label={t('ask.title')} hint={t('ask.title.hint')} error={titleErr} counter={{ n: title.trim().length, min: 10, max: 150 }}>
          <input id="ask-title" className="input" maxLength={150} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('ask.ph')}
            aria-invalid={!!titleErr} aria-describedby={describedBy('ask-title', { hint: !titleErr, counter: true, error: !!titleErr })} />
        </Field>

        <div role="group" aria-label={t('ask.det')} className="flex rounded-md border border-line bg-surface-2 p-0.5 lg:hidden">
          <button type="button" aria-pressed={pane === 'write'} onClick={() => setPane('write')} className={tabCls(pane === 'write')}>{t('ask.write')}</button>
          <button type="button" aria-pressed={pane === 'preview'} onClick={() => setPane('preview')} className={tabCls(pane === 'preview')}>{t('ask.preview')}</button>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className={pane === 'write' ? '' : 'hidden lg:block'}>
            <Field id="ask-body" label={t('ask.det')} error={bodyErr} counter={{ n: body.trim().length, min: 20 }}>
              <div className="rounded-md border border-line-strong bg-raised focus-within:border-brand-500 focus-within:ring-[3px] focus-within:ring-brand-500/35">
                <div role="toolbar" aria-label={t('ask.tb')} className="flex items-center gap-0.5 border-b border-line px-1.5 py-1">
                  <button type="button" className={tb} title={t('ask.tb.bold')} aria-label={t('ask.tb.bold')} onClick={() => wrap('**', '**', t('ask.tb.boldph'))}><IBold /></button>
                  <button type="button" className={tb} title={t('ask.tb.code')} aria-label={t('ask.tb.code')} onClick={() => wrap('`', '`', t('ask.tb.codeph'))}><ICode className="h-4 w-4" /></button>
                  <button type="button" className={tb} title={t('ask.tb.block')} aria-label={t('ask.tb.block')} onClick={() => wrap('\n```\n', '\n```\n', t('ask.tb.codeph'))}><IBraces /></button>
                  <button type="button" className={tb} title={t('ask.tb.link')} aria-label={t('ask.tb.link')} onClick={() => wrap('[', '](https://)', t('ask.tb.linkph'))}><ILink /></button>
                </div>
                <textarea id="ask-body" ref={area} value={body} onChange={(e) => setBody(e.target.value)} placeholder={t('ask.detph')}
                  aria-invalid={!!bodyErr} aria-describedby={describedBy('ask-body', { counter: true, error: !!bodyErr })}
                  className="block min-h-72 w-full resize-y rounded-b-md bg-transparent px-3.5 py-3 font-mono text-[14px] leading-relaxed text-fg outline-none placeholder:font-sans placeholder:text-subtle" />
              </div>
            </Field>
          </div>
          <div className={pane === 'preview' ? '' : 'hidden lg:block'}>
            <p className="mb-1.5 text-sm font-semibold">{t('ask.preview')}</p>
            <div className="min-h-72 rounded-md border border-line bg-surface px-4 py-2">
              {body.trim() ? <Markdown>{body}</Markdown> : <p className="py-3 text-sm text-subtle">{t('ask.prevempty')}</p>}
            </div>
          </div>
        </div>

        <TagInput id="ask-tags" label={t('ask.tags.l')} value={tags} onChange={setTags} max={5} suggestions={POPULAR_TAGS} />

        <details className="rounded-md border border-line bg-surface-2/60 px-4 py-2.5">
          <summary className="flex min-h-9 cursor-pointer list-none items-center gap-2 text-sm font-semibold"><ITip className="h-4 w-4 text-accent-fg" />{t('ask.tips.h')}</summary>
          <ul className="mt-2 list-disc space-y-1 pb-1 pl-9 text-sm text-muted">
            <li>{t('ask.tips.1')}</li><li>{t('ask.tips.2')}</li><li>{t('ask.tips.3')}</li><li>{t('ask.tips.4')}</li>
          </ul>
        </details>

        <div aria-live="polite" className="empty:hidden">
          {error && <p className="flex items-start gap-2 rounded-md border border-red-600/40 bg-red-600/10 px-3 py-2 text-sm text-red-800 dark:text-red-300"><IAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
        </div>
        <button type="submit" disabled={busy} className="btn btn-primary">{busy ? t('busy.pub') : t('act.pub')}</button>
      </form>
    </div>
  );
}
