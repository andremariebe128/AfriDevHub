'use client';
import { createContext, useContext } from 'react';
import { DICT, type Key, type Locale } from '@/lib/i18n';

const Ctx = createContext<Locale>('fr');
export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <Ctx.Provider value={locale}>{children}</Ctx.Provider>;
}
export function useT() {
  const locale = useContext(Ctx);
  return { locale, t: (k: Key) => DICT[locale][k] };
}
