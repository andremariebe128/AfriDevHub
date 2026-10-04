'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useT } from '@/components/I18n';
import { supabaseBrowser } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useT();
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (signup && !/^[a-zA-Z0-9_.-]{3,}$/.test(username.trim())) {
      return setError(t('err.user'));
    }
    if (password.length < 6) return setError(t('err.pass'));
    setBusy(true);
    const sb = supabaseBrowser();
    if (signup) {
      const { data, error: err } = await sb.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { username: username.trim() } },
      });
      setBusy(false);
      if (err) return setError(err.message);
      if (!data.session) return setInfo(t('login.check'));
    } else {
      const { error: err } = await sb.auth.signInWithPassword({ email: email.trim(), password });
      setBusy(false);
      if (err) return setError(err.message);
    }
    router.push('/questions');
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-center text-2xl font-bold text-brand-600">AfriDevHub</h1>
      <p className="mb-6 mt-1 text-center text-sm text-neutral-500">{t('login.tag')}</p>
      <form onSubmit={submit} className="card space-y-3">
        {signup && (
          <input className="input" placeholder={t('login.user')} value={username} onChange={(e) => setUsername(e.target.value)} />
        )}
        <input className="input" type="email" placeholder={t('login.mail')} value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder={t('login.pass')} value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-brand-600">{info}</p>}
        <button type="submit" disabled={busy} className="btn btn-primary w-full">
          {busy ? '…' : signup ? t('login.create') : t('login.in')}
        </button>
        <button type="button" onClick={() => setSignup(!signup)} className="w-full text-center text-sm text-brand-600">
          {signup ? t('login.have') : t('login.none')}
        </button>
      </form>
    </div>
  );
}
