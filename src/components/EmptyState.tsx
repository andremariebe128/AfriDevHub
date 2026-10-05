import Link from 'next/link';

/** État vide : petit losange kente + titre + texte + action. */
export default function EmptyState({ title, text, href, cta }: { title: string; text?: string; href?: string; cta?: string }) {
  return (
    <div className="flex flex-col items-start rounded-lg border border-dashed border-line-strong bg-surface px-6 py-10">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M20 2 38 20 20 38 2 20Z" className="stroke-line-strong" strokeWidth="1.5" />
        <path d="M20 12 28 20 20 28 12 20Z" fill="#eb9f2f" />
      </svg>
      <h3 className="mt-3 text-base font-semibold">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {href && cta && <Link href={href} className="btn btn-primary mt-4">{cta}</Link>}
    </div>
  );
}
