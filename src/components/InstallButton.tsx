'use client';

import { useEffect, useState } from 'react';

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

/** Bouton « Installer l'app » (Android/Chrome) + aide iPhone. */
export default function InstallButton({ className = 'btn btn-primary' }: { className?: string }) {
  const [evt, setEvt] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) setInstalled(true);
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as InstallEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed) return null;

  async function install() {
    if (evt) {
      await evt.prompt();
      await evt.userChoice;
      setEvt(null);
    } else {
      setShowHelp(true);
    }
  }

  return (
    <div className="inline-block text-left">
      <button type="button" onClick={install} className={className}>
        📲 Installer l&apos;app
      </button>
      {showHelp && (
        <p className="mt-2 max-w-xs rounded-xl bg-black/30 p-3 text-xs text-white">
          {isIOS
            ? "Sur iPhone : touche le bouton Partager de Safari, puis « Sur l'écran d'accueil »."
            : "Ouvre le menu de ton navigateur (⋮), puis « Installer l'application » ou « Ajouter à l'écran d'accueil »."}
        </p>
      )}
    </div>
  );
}
