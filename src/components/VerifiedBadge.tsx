import { IVerified } from '@/components/Icons';
import { isVerified } from '@/lib/news';

/** Pastille « compte vérifié » à côté d'un pseudo (n'affiche rien si l'abonnement n'est pas actif). */
export default function VerifiedBadge({ until, label }: { until?: string | null; label: string }) {
  if (!isVerified(until)) return null;
  return <span title={label} className="inline-flex shrink-0"><IVerified className="h-4 w-4 text-accent-fg" /><span className="sr-only">{label}</span></span>;
}
