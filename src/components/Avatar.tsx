const TONES = ['bg-brand-700', 'bg-leaf-600', 'bg-[#1d6b6a]', 'bg-[#a4531b]', 'bg-brand-900', 'bg-[#6a4a1c]'];

/** Avatar à initiales : couleur stable déduite du pseudo. */
export default function Avatar({ name, size = 40, className = '' }: { name?: string | null; size?: number; className?: string }) {
  const label = (name ?? '?').replace(/^@/, '');
  const hash = Array.from(label).reduce((a, c) => a + c.charCodeAt(0), 0);
  const parts = label.split(/[\s_.-]+/).filter(Boolean);
  const initials = (parts.length > 1 ? parts[0][0] + parts[1][0] : label.slice(0, 2)).toUpperCase();
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold text-white ring-2 ring-surface ${TONES[hash % TONES.length]} ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {initials}
    </span>
  );
}
