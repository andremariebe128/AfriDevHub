import Link from 'next/link';

export default function TagChip({ tag }: { tag: string }) {
  const n = Array.from(tag).reduce((a, c) => a + c.charCodeAt(0), 0) % 3;
  return (
    <Link href={`/questions?tag=${encodeURIComponent(tag)}`} className={`chip tag-${n}`}>
      {tag}
    </Link>
  );
}
