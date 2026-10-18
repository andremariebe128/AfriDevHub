'use client';
/* eslint-disable @next/next/no-img-element */
import { useSyncExternalStore } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import { storageImage } from '@/lib/utils';

const IMAGE_BUCKET = 'post-images';
const LINK_PROTOCOLS = ['http:', 'https:', 'mailto:'];

/** Mode éco data : lu sur <html data-lite> (posé par DataSaver et le script anti-flash). */
function subscribe(cb: () => void) {
  window.addEventListener('adh-lite', cb);
  return () => window.removeEventListener('adh-lite', cb);
}
const isLite = () => document.documentElement.hasAttribute('data-lite');

/** Liens http(s) et mailto uniquement ; le reste (javascript:, data:, liens relatifs) est supprimé. */
function allowedLink(href: string): string {
  try {
    const u = new URL(href.trim());
    return LINK_PROTOCOLS.includes(u.protocol) ? u.href : '';
  } catch { return ''; }
}

const COMPONENTS = (lite: boolean): Components => ({
  a: ({ href, children }) => {
    const safe = href ? allowedLink(href) : '';
    return safe
      ? <a href={safe} target="_blank" rel="noopener noreferrer nofollow ugc">{children}</a>
      : <span>{children}</span>;
  },
  img: ({ src, alt }) => {
    const safe = typeof src === 'string' ? storageImage(src, IMAGE_BUCKET) : null;
    if (!safe || lite) return alt ? <span className="text-subtle">[{alt}]</span> : null;
    return <img src={safe} alt={alt ?? ''} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="my-3 h-auto max-w-full rounded-lg" />;
  },
});

/** Rendu Markdown sûr : HTML brut ignoré, liens et images filtrés, images désactivées en mode éco data. */
export default function Markdown({ children }: { children: string }) {
  const lite = useSyncExternalStore(subscribe, isLite, () => false);
  return (
    <div className="md">
      <ReactMarkdown skipHtml urlTransform={(url, key) => (key === 'src' ? url : allowedLink(url))} components={COMPONENTS(lite)}>{children}</ReactMarkdown>
    </div>
  );
}
