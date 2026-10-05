'use client';
import { usePathname } from 'next/navigation';

/** Conteneur de page : pleine largeur sur l'accueil (sections éditoriales), colonne centrée ailleurs. */
export default function MainShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const wide = path === '/';
  return (
    <main id="main" tabIndex={-1} className={wide ? 'relative min-h-[70vh] outline-none' : 'relative mx-auto min-h-[70vh] max-w-6xl px-4 py-8 outline-none sm:px-6 sm:py-10'}>
      {children}
    </main>
  );
}
