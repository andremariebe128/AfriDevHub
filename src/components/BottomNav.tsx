'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/', label: 'Accueil', icon: '🏠' },
  { href: '/questions', label: 'Questions', icon: '💬' },
  { href: '/ask', label: 'Poser', icon: '➕' },
  { href: '/projects', label: 'Projets', icon: '🚀' },
  { href: '/profile', label: 'Profil', icon: '👤' },
];

/** Barre de navigation façon app mobile (visible uniquement sur petit écran). */
export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden dark:border-neutral-800 dark:bg-neutral-950/95"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {ITEMS.map((it) => {
          const active = it.href === '/' ? pathname === '/' : pathname.startsWith(it.href);
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                  active ? 'text-brand-600' : 'text-neutral-500'
                }`}
              >
                <span className="text-lg leading-none">{it.icon}</span>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
