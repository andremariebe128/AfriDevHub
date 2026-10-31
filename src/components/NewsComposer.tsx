'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/components/I18n';
import { IAlert, ILink, IX } from '@/components/Icons';
import ImageInsert from '@/components/ImageInsert';
import LinkCard from '@/components/LinkCard';
import { friendlyError } from '@/lib/errors';
import { POST_BUCKET } from '@/lib/image';
import { newsLinkOk } from '@/lib/linkhosts';
import { loadPreview, POST_SELECT, type NewsPost } from '@/lib/news';
import { supabaseBrowser } from '@/lib/supabase';
import { storageImage } from '@/lib/utils';

/** Formulaire de publication : texte, photo, lien vérifié avec aperçu automatique. */
export default function NewsComposer({ userId, onPosted }: { userId: string; onPosted: (p: NewsPost) => void }) {
  const { t } = useT();
  const [body, setBody] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [showLink, setShowLink] = useState(false);
  const [link, setLink] = useState('');
  const [prev, setPrev] = useState<{ title: string | null; description: string | null; site: string } | null>(null);
  const [prevState, setPrevState] = useState<'idle' | 'loading' | 'none'>('idle');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seq = useRef(0);

  const linkTrim = link.trim();
  const linkValid = linkTrim !== '' && newsLinkOk(linkTrim);
  const linkBad = linkTrim !== '' && !linkValid;

  // Aperçu automatique dès que le lien est valide (avec un court délai pour ne pas interroger à chaque frappe)
  useEffect(() => {
    setPrev(null);
    if (!linkValid) { setPrevState('idle'); return; }
    const n = ++seq.current;
    setPrevState('loading');
    const timer = setTimeout(async () => {
      const p = await loadPreview(supabaseBrowser(), linkTrim);
      if (n !== seq.current) return;
      setPrev(p); setPrevState(p ? 'idle' : 'none');
    }, 450);
    return () => clearTimeout(timer);
  }, [linkTrim, linkValid]);

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || busy || linkBad) return;
    setBusy(true); setError(null);
    const row = {
      author_id: userId, body: body.trim(), image_url: image,
      link_url: linkValid ? linkTrim : null,
      link_title: linkValid ? prev?.title ?? null : null, link_desc: linkValid ? prev?.description ?? null : null, link_site: linkValid ? prev?.site ?? null : null,
    };
    const { data, error: err } = await supabaseBrowser().from('news_posts').insert(row).select(POST_SELECT).single();
    setBusy(false);
    if (err) return setError(err.code === '54000' ? t('news.rate') : friendlyError(err.message, t));
    onPosted(data as unknown as NewsPost);
    setBody(''); setImage(null); setLink(''); setShowLink(false); setPrev(null);
  }

  const img = storageImage(image, POST_BUCKET);
  return (
    <form onSubmit={publish} className="rounded-lg border border-line bg-surface p-4">
      <textarea className="input min-h-24 w-full" maxLength={2000} value={body} onChange={(e) => setBody(e.target.value)} placeholder={t('news.ph')} aria-label={t('news.ph')} />
      {img && (
        <div className="relative mt-2 inline-block">
          <img src={img} alt="" className="max-h-48 rounded-lg border border-line" />
          <button type="button" onClick={() => setImage(null)} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white" aria-label={t('news.photo.remove')}><IX className="h-4 w-4" /></button>
        </div>
      )}
      {showLink && (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <input className="input flex-1" type="url" inputMode="url" maxLength={500} value={link} onChange={(e) => setLink(e.target.value)} placeholder={t('news.link.ph')} aria-label={t('news.link.ph')} aria-invalid={linkBad} />
            <button type="button" className="tap rounded p-2 text-muted hover:bg-surface-2" aria-label={t('news.link.remove')} onClick={() => { setLink(''); setShowLink(false); }}><IX className="h-4 w-4" /></button>
          </div>
          {linkBad && <p role="alert" className="mt-1.5 flex items-start gap-1.5 text-sm text-red-700 dark:text-red-300"><IAlert className="mt-0.5 h-4 w-4 shrink-0" />{t('news.link.bad')}</p>}
          {linkValid && prevState === 'loading' && <p className="mt-1.5 text-sm text-muted" aria-busy="true">{t('news.link.loading')}</p>}
          {linkValid && prevState === 'none' && <p className="mt-1.5 text-sm text-muted">{t('news.link.none')}</p>}
          {linkValid && prev && <LinkCard url={linkTrim} title={prev.title} desc={prev.description} site={prev.site} />}
        </div>
      )}
      {error && <p role="alert" className="mt-2 flex items-start gap-1.5 text-sm text-red-700 dark:text-red-300"><IAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
      <div className="mt-3 flex items-center gap-1">
        <ImageInsert userId={userId} bucket={POST_BUCKET} maxSide={1600} onUrl={setImage} onProblem={setError} className="tap rounded p-2 text-muted hover:bg-surface-2" />
        <button type="button" className="tap rounded p-2 text-muted hover:bg-surface-2" title={t('news.link.add')} aria-label={t('news.link.add')} aria-pressed={showLink} onClick={() => setShowLink((v) => !v)}><ILink className="h-4 w-4" /></button>
        <span className="ml-auto mr-2 text-xs tabular text-subtle">{body.length}/2000</span>
        <button type="submit" className="btn btn-primary btn-sm" disabled={busy || !body.trim() || linkBad}>{t('news.publish')}</button>
      </div>
    </form>
  );
}
