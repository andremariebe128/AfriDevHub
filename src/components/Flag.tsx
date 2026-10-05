import { BJ, CD, CI, CM, EG, GH, KE, MA, NG, RW, SN, ZA } from 'country-flag-icons/react/3x2';
import { COUNTRY_CODES } from '@/lib/seed';

const FLAGS = { BJ, CD, CI, CM, EG, GH, KE, MA, NG, RW, SN, ZA };

/** Drapeau SVG vectoriel (remplace les emojis de drapeaux, absents sous Windows). */
export default function Flag({ country, className = 'h-5 w-auto' }: { country: string; className?: string }) {
  const Svg = FLAGS[COUNTRY_CODES[country] as keyof typeof FLAGS];
  if (!Svg) return null;
  return <Svg title={country} className={`${className} rounded-[3px] shadow-[0_0_0_1px_rgba(0,0,0,0.08)]`} />;
}
