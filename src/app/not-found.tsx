import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-bold">Page introuvable</h1>
      <p className="mt-2 text-neutral-500">Cette page n&apos;existe pas ou a été supprimée.</p>
      <Link href="/questions" className="btn btn-primary mt-6">Voir les questions</Link>
    </div>
  );
}
