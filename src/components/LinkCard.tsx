import { IExternal } from '@/components/Icons';
import { newsLinkOk } from '@/lib/linkhosts';

/** Carte d'aperçu d'un lien vérifié : texte seulement (aucune image distante), lien externe isolé. */
export default function LinkCard({ url, title, desc, site }: { url: string; title?: string | null; desc?: string | null; site?: string | null }) {
  if (!newsLinkOk(url)) return null;
  const host = new URL(url).hostname.replace(/^www\./, '');
  return (
    <a href={url} target="_blank" rel="noopener noreferrer nofollow ugc"
      className="mt-3 block rounded-lg border border-line bg-surface-2/60 px-3 py-2.5 transition hover:border-brand-500">
      <span className="flex items-center gap-1.5 text-xs text-subtle"><IExternal className="h-3.5 w-3.5" />{site || host}</span>
      <span className="mt-0.5 block text-sm font-semibold leading-snug text-fg">{title || url}</span>
      {desc && <span className="mt-0.5 line-clamp-2 block text-sm text-muted">{desc}</span>}
      <span className="mt-1 block truncate text-xs text-accent-fg">{host}</span>
    </a>
  );
}
