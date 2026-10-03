'use client';

import { useEffect } from 'react';

/** Enregistre le service worker (production uniquement). */
export default function PWARegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* l'app fonctionne sans service worker */
    });
  }, []);
  return null;
}
