/* eslint-disable @next/next/no-img-element */
/** Logotype AfriDevHub : marque (carte du continent) + mot-symbole en texte (suit le thème clair/sombre). */
export default function Logo({ height = 36, onDark = false }: { variant?: 'header' | 'full'; height?: number; onDark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ lineHeight: 1 }}>
      <img src="/logo-mark.png" alt="" width={height} height={height} style={{ height, width: 'auto' }} />
      <span
        className={`font-display font-extrabold ${onDark ? 'text-white' : 'text-fg'}`}
        style={{ fontSize: Math.max(height * 0.52, 17), letterSpacing: '-0.03em' }}
      >
        Afri<span className={onDark ? 'text-leaf-400' : 'text-leaf-600 dark:text-leaf-400'}>Dev</span>Hub
      </span>
    </span>
  );
}
