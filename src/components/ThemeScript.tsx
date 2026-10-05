'use client';

/** Script anti-flash : rendu uniquement côté serveur (jamais recréé côté client, donc sans avertissement React). */
const CODE = `(function(){try{var d=document.documentElement,t=localStorage.getItem('adh-theme');var dark=t==='dark'||((t!=='light')&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(dark)d.classList.add('dark');d.dataset.theme=(t==='light'||t==='dark')?t:'system';if(localStorage.getItem('adh-lite')==='1')d.setAttribute('data-lite','')}catch(e){}})();`;

export default function ThemeScript() {
  if (typeof window !== 'undefined') return null;
  return <script dangerouslySetInnerHTML={{ __html: CODE }} />;
}
