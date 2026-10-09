'use client';
import { useEffect, useState } from 'react';
import CvTimeline from '@/components/CvTimeline';
import { useT } from '@/components/I18n';
import { ILock } from '@/components/Icons';
import { normalizeCv, type CvEntry } from '@/lib/cv';
import { supabaseBrowser } from '@/lib/supabase';

/**
 * Pour le propriétaire du profil uniquement : affiche sa bio / son parcours même s'ils ne sont pas publics, avec un indicateur.
 * Le contenu privé n'est jamais envoyé par le serveur : il est relu ici avec la session du propriétaire.
 */
export default function OwnerPrivate({ profileId, part, publicShown }: { profileId: string; part: 'bio' | 'cv'; publicShown: boolean }) {
  const { t } = useT();
  const [bio, setBio] = useState<string | null>(null);
  const [cv, setCv] = useState<CvEntry[]>([]);

  useEffect(() => {
    if (publicShown) return; // déjà visible pour tout le monde : rien à ajouter
    let alive = true;
    (async () => {
      try {
        const sb = supabaseBrowser();
        const { data: s } = await sb.auth.getSession();
        if (s.session?.user.id !== profileId) return;
        const { data } = await sb.from('profiles').select('*').eq('id', profileId).maybeSingle();
        if (!alive || !data) return;
        if (part === 'bio' && typeof data.bio === 'string' && data.bio.trim()) setBio(data.bio);
        if (part === 'cv') setCv(normalizeCv(data.cv));
      } catch { /* sans session ou hors ligne : rien à afficher */ }
    })();
    return () => { alive = false; };
  }, [profileId, part, publicShown]);

  const mine = (
    <span className="inline-flex items-center gap-1 rounded-md border border-line-strong bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted"><ILock />{t(part === 'bio' ? 'u.bio.mine' : 'u.cv.mine')}</span>
  );

  if (part === 'bio' && bio) {
    return (
      <div className="mt-2 max-w-2xl">
        <p className="whitespace-pre-line text-muted">{bio}</p>
        <p className="mt-1.5">{mine}</p>
      </div>
    );
  }
  if (part === 'cv' && cv.length > 0) {
    return (
      <section aria-labelledby="cv-h-own">
        <h2 id="cv-h-own" className="mb-2 text-lg font-semibold">{t('u.cv')}</h2>
        <p className="mb-4">{mine}</p>
        <CvTimeline entries={cv} />
      </section>
    );
  }
  return null;
}
