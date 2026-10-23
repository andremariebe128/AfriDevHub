import { supabaseBrowser } from '@/lib/supabase';

const KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

export const pushSupported = () =>
  typeof window !== 'undefined' && !!KEY && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

function toKey(b64: string): Uint8Array<ArrayBuffer> {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function registration(): Promise<ServiceWorkerRegistration | null> {
  // Le service worker n'est enregistré qu'en production : on n'attend pas indéfiniment en dev.
  return Promise.race([navigator.serviceWorker.ready, new Promise<null>((r) => setTimeout(() => r(null), 4000))]);
}

/** Abonne ce navigateur au push et l'enregistre pour l'utilisateur connecté. Silencieux en cas d'échec. */
export async function subscribePush(): Promise<boolean> {
  try {
    if (!pushSupported() || Notification.permission !== 'granted') return false;
    const reg = await registration();
    if (!reg) return false;
    const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKey(KEY) }));
    const j = sub.toJSON();
    if (!j.endpoint || !j.keys?.p256dh || !j.keys?.auth) return false;
    const { error } = await supabaseBrowser().rpc('register_web_push', { p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth });
    return !error;
  } catch { return false; }
}

/** À appeler AVANT la déconnexion : retire l'abonnement de ce navigateur côté serveur. */
export async function unsubscribePush(): Promise<void> {
  try {
    if (!pushSupported()) return;
    const reg = await registration();
    const sub = await reg?.pushManager.getSubscription();
    if (!sub) return;
    await supabaseBrowser().rpc('unregister_web_push', { p_endpoint: sub.endpoint });
    await sub.unsubscribe();
  } catch { /* meilleur effort */ }
}
