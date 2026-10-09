import {
  AO, BF, BI, BJ, BW, CD, CF, CG, CI, CM, CV, DJ, DZ, EG, ER, ET, GA, GH, GM, GN, GQ, GW, KE, KM, LR, LS, LY,
  MA, MG, ML, MR, MU, MW, MZ, NA, NE, NG, RW, SC, SD, SL, SN, SO, SS, ST, SZ, TD, TG, TN, TZ, UG, ZA, ZM, ZW,
} from 'country-flag-icons/react/3x2';
import { findCountry } from '@/lib/countries';

const FLAGS: Record<string, typeof BJ> = {
  AO, BF, BI, BJ, BW, CD, CF, CG, CI, CM, CV, DJ, DZ, EG, ER, ET, GA, GH, GM, GN, GQ, GW, KE, KM, LR, LS, LY,
  MA, MG, ML, MR, MU, MW, MZ, NA, NE, NG, RW, SC, SD, SL, SN, SO, SS, ST, SZ, TD, TG, TN, TZ, UG, ZA, ZM, ZW,
};

/** Drapeau SVG vectoriel (remplace les emojis de drapeaux, absents sous Windows).
 *  `country` : nom français ou anglais, code ISO ou slug d'un pays du référentiel. */
export default function Flag({ country, className = 'h-5 w-auto' }: { country: string; className?: string }) {
  const c = findCountry(country);
  const Svg = c ? FLAGS[c.code] : undefined;
  if (!c || !Svg) return null;
  return <Svg title={c.fr} className={`${className} rounded-[3px] shadow-[0_0_0_1px_rgba(0,0,0,0.08)]`} />;
}
