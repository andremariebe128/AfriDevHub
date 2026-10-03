import Link from 'next/link';

export default function TagChip({ tag }: { tag: string }) {
  return (
    <Link href={`/questions?tag=${encodeURIComponent(tag)}`} className="chip">
      {tag}
    </Link>
  );
}
