'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import { parseTags } from '@/lib/utils';

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [f, setF] = useState({ username: '', full_name: '', country: '', bio: '', stack: '', github_url: '' });

  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const { data: s } = await sb.auth.getSession();
      const uid = s.session?.user.id ?? null;
      setUserId(uid);
      if (uid) {
        const { data } = await sb.from('profiles').select('*').eq('id', uid).single();
        if (data) {
          setF({
            username: data.username ?? '',
            full_name: data.full_name ?? '',
            country: data.country ?? '',
            bio: data.bio ?? '',
            stack: (data.stack ?? []).join(', '),
            github_url: data.github_url ?? '',
          });
        }
      }
      setReady(true);
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!/^[a-zA-Z0-9_.-]{3,}$/.test(f.username.trim())) {
      return setMsg({ ok: false, text: 'Pseudo : 3 caractères minimum (lettres, chiffres, _ . -).' });
    }
    setBusy(true);
    const { error } = await supabaseBrowser()
      .from('profiles')
      .update({
        username: f.username.trim(),
        full_name: f.full_name.trim() || null,
        country: f.country.trim() || null,
        bio: f.bio.trim() || null,
        stack: parseTags(f.stack),
        github_url: f.github_url.trim() || null,
      })
      .eq('id', userId);
    setBusy(false);
    setMsg(error ? { ok: false, text: error.code === '23505' ? 'Ce pseudo est déjà pris.' : error.message } : { ok: true, text: 'Profil enregistré.' });
  }

  if (!ready) return null;
  if (!userId) {
    return (
      <p>
        <Link href="/login" className="font-semibold text-brand-600 underline">Connecte-toi</Link> pour modifier ton profil.
      </p>
    );
  }

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-bold">Mon profil</h1>
      <form onSubmit={save} className="space-y-3">
        <input className="input" placeholder="Pseudo" value={f.username} onChange={set('username')} />
        <input className="input" placeholder="Nom complet" value={f.full_name} onChange={set('full_name')} />
        <input className="input" placeholder="Pays (ex : Bénin)" value={f.country} onChange={set('country')} />
        <textarea className="input min-h-24" placeholder="Bio" value={f.bio} onChange={set('bio')} />
        <input className="input" placeholder="Stack (virgules, 5 max)" value={f.stack} onChange={set('stack')} />
        <input className="input" placeholder="Lien GitHub" value={f.github_url} onChange={set('github_url')} />
        {msg && <p className={`text-sm ${msg.ok ? 'text-brand-600' : 'text-red-600'}`}>{msg.text}</p>}
        <button type="submit" disabled={busy} className="btn btn-primary">{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
      </form>
    </div>
  );
}
