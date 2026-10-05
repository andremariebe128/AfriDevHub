/** Squelette de liste (états de chargement des pages de listes). */
export default function ListSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-busy="true">
      <span className="sr-only">…</span>
      <div className="skeleton h-8 w-56" />
      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-4 border-b border-line p-4 last:border-b-0">
            <div className="skeleton h-12 w-14" />
            <div className="flex-1 space-y-2"><div className="skeleton h-4 w-4/5" /><div className="skeleton h-4 w-1/3" /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
