import Link from 'next/link';
import DataSaver from '@/components/DataSaver';
import InstallButton from '@/components/InstallButton';
import { IOffline, IPhone, IZap } from '@/components/Icons';
import LangSwitch from '@/components/LangSwitch';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { getT } from '@/lib/i18n-server';
import type { Key } from '@/lib/i18n';

const COL1: { href: string; label: Key }[] = [
  { href: '/questions', label: 'nav.q' },
  { href: '/projects', label: 'nav.p' },
  { href: '/espaces', label: 'nav.s' },
  { href: '/opportunites', label: 'nav.o' },
  { href: '/mentors', label: 'nav.m' },
];
const COL2: { href: string; label: Key }[] = [
  { href: '/ask', label: 'h.ask' },
  { href: '/publier', label: 'h.pub' },
  { href: '/profile', label: 'h.profile' },
  { href: '/notifications', label: 'notif.h' },
  { href: '/login', label: 'h.login' },
];

export default async function Footer() {
  const { t } = await getT();
  const link = 'inline-flex min-h-8 items-center rounded text-sm text-muted transition hover:text-fg';
  const head = 'mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle';
  return (
    <footer aria-label={t('a.footer')} className="mt-8 border-t border-line bg-surface-2/60 pb-28 md:pb-10">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Link href="/" aria-label={t('a.home')}><Logo height={34} /></Link>
          <p className="mt-4 max-w-xs font-display text-lg font-semibold leading-snug text-fg">{t('foot.tag')}</p>
          <p className="mt-2 max-w-xs text-sm text-muted">{t('foot.made')}</p>
        </div>

        <nav aria-label={t('foot.c1')}>
          <h2 className={head}>{t('foot.c1')}</h2>
          <ul className="space-y-0.5">{COL1.map((l) => <li key={l.href}><Link href={l.href} className={link}>{t(l.label)}</Link></li>)}</ul>
        </nav>

        <nav aria-label={t('foot.c2')}>
          <h2 className={head}>{t('foot.c2')}</h2>
          <ul className="space-y-0.5">{COL2.map((l) => <li key={l.href}><Link href={l.href} className={link}>{t(l.label)}</Link></li>)}</ul>
        </nav>

        <div>
          <h2 className={head}>{t('foot.c3')}</h2>
          <ul className="space-y-2.5 text-sm text-muted">
            <li className="flex items-start gap-2"><IPhone className="mt-0.5 h-4 w-4 shrink-0 text-accent-fg" />{t('foot.pwa')}</li>
            <li className="flex items-start gap-2"><IZap className="mt-0.5 h-4 w-4 shrink-0 text-warm" />{t('foot.eco')}</li>
            <li className="flex items-start gap-2"><IOffline className="mt-0.5 h-4 w-4 shrink-0 text-success" />{t('off.badge')}</li>
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <InstallButton className="btn btn-secondary btn-sm" />
            <DataSaver />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <div>
              <p className="mb-1.5 text-xs font-semibold text-subtle">{t('foot.lang')}</p>
              <LangSwitch />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold text-subtle">{t('foot.theme')}</p>
              <ThemeToggle variant="segmented" />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-subtle sm:px-6">
          <p>© {new Date().getFullYear()} AfriDevHub · {t('foot.rights')}</p>
          <nav aria-label={t('foot.legal')} className="flex flex-wrap gap-x-5 gap-y-1">
            <Link href="/confidentialite" className="hover:text-fg">{t('legal.privacy')}</Link>
            <Link href="/conditions" className="hover:text-fg">{t('legal.terms')}</Link>
            <Link href="/mentions-legales" className="hover:text-fg">{t('legal.notice')}</Link>
          </nav>
          <p className="w-full font-mono sm:w-auto">{t('foot.rules')}</p>
        </div>
      </div>
    </footer>
  );
}
