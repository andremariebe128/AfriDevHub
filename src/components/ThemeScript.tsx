import { headers } from 'next/headers';

/** Script anti-flash (thème et mode éco data), exécuté avant le premier rendu. Il porte le nonce de la politique CSP. */
const CODE = `(function(){try{var d=document.documentElement,t=localStorage.getItem('adh-theme');var dark=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(dark)d.classList.add('dark');d.dataset.theme=(t==='dark'||t==='system')?t:'light';if(localStorage.getItem('adh-lite')==='1')d.setAttribute('data-lite','')}catch(e){}})();`;

export default async function ThemeScript() {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return <script nonce={nonce} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: CODE }} />;
}
