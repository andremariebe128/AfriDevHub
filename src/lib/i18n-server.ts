import { cookies } from 'next/headers';
import { DICT, type Key, type Locale } from '@/lib/i18n';

export async function getLocale(): Promise<Locale> {
  const v = (await cookies()).get('adh-lang')?.value;
  return v === 'en' ? 'en' : 'fr';
}
export async function getT() {
  const locale = await getLocale();
  return { locale, t: (k: Key) => DICT[locale][k] };
}
