import Link from 'next/link';

export type Notif = { id: string; title: string; text?: string; href: string; ago: string; unread?: boolean };

/** Ligne de notification réutilisable (la liste est vide tant qu'aucune donnée n'arrive). */
export default function NotificationRow({ n, icon }: { n: Notif; icon: React.ReactNode }) {
  return (
    <li className="border-b border-line last:border-b-0">
      <Link href={n.href} className="flex min-h-14 items-start gap-3 px-4 py-3 hover:bg-surface-2/60">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-surface-2 text-muted">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-fg">{n.title}</span>
          {n.text && <span className="mt-0.5 block text-sm text-muted">{n.text}</span>}
        </span>
        <span className="flex shrink-0 items-center gap-2 text-xs text-subtle">
          {n.unread && <span className="h-2 w-2 rounded-full bg-brand-600 dark:bg-brand-400" aria-label="•" />}
          {n.ago}
        </span>
      </Link>
    </li>
  );
}
