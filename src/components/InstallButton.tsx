'use client';

import { useEffect, useState } from 'react';
import { useT } from '@/components/I18n';
import { IDownload } from '@/components/Icons';

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

/** Bouton « Installer l'app » (Android/Chrome) + aide iPhone. */
export default function InstallButton({ className = 'btn btn-primary' }: { className?: string }) {
  const { t } = useT();
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
        <IDownload />{t('in.btn')}
      </button>
      {showHelp && (
        <p role="status" className="mt-2 max-w-xs rounded-md border border-line bg-surface p-3 text-xs leading-relaxed text-muted shadow-card">
          {isIOS ? t('in.ios') : t('in.and')}
        </p>
      )}
    </div>
  );
}
