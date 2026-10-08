import type { Locale } from '@/lib/i18n';

/**
 * Référentiel des 54 pays d'Afrique (États membres de l'ONU).
 * La valeur stockée en base reste le nom FRANÇAIS (compatible avec les profils existants).
 * `ALL` désigne « ouvert à tous » dans les annonces.
 */
export const ALL_COUNTRIES = 'ALL';

export type Country = {
  code: string; fr: string; en: string; capFr: string; capEn: string; slug: string;
  /** Locatif : « au Bénin », « en Égypte », « à Maurice ». */
  inFr: string; inEn: string;
};

/* code, nom FR, nom EN, capitale FR, capitale EN (si différente), locatif FR, locatif EN (si différent de « in {nom} ») */
const RAW: [string, string, string, string, string | null, string, string | null][] = [
  ['DZ', 'Algérie', 'Algeria', 'Alger', 'Algiers', 'en Algérie', null],
  ['AO', 'Angola', 'Angola', 'Luanda', null, 'en Angola', null],
  ['BJ', 'Bénin', 'Benin', 'Porto-Novo', null, 'au Bénin', null],
  ['BW', 'Botswana', 'Botswana', 'Gaborone', null, 'au Botswana', null],
  ['BF', 'Burkina Faso', 'Burkina Faso', 'Ouagadougou', null, 'au Burkina Faso', null],
  ['BI', 'Burundi', 'Burundi', 'Gitega', null, 'au Burundi', null],
  ['CV', 'Cap-Vert', 'Cape Verde', 'Praia', null, 'au Cap-Vert', null],
  ['CM', 'Cameroun', 'Cameroon', 'Yaoundé', null, 'au Cameroun', null],
  ['CF', 'Centrafrique', 'Central African Republic', 'Bangui', null, 'en Centrafrique', 'in the Central African Republic'],
  ['KM', 'Comores', 'Comoros', 'Moroni', null, 'aux Comores', 'in the Comoros'],
  ['CG', 'Congo', 'Republic of the Congo', 'Brazzaville', null, 'au Congo', 'in the Republic of the Congo'],
  ['CD', 'RD Congo', 'DR Congo', 'Kinshasa', null, 'en RD Congo', null],
  ['CI', 'Côte d’Ivoire', 'Ivory Coast', 'Yamoussoukro', null, 'en Côte d’Ivoire', null],
  ['DJ', 'Djibouti', 'Djibouti', 'Djibouti', null, 'à Djibouti', null],
  ['EG', 'Égypte', 'Egypt', 'Le Caire', 'Cairo', 'en Égypte', null],
  ['ER', 'Érythrée', 'Eritrea', 'Asmara', null, 'en Érythrée', null],
  ['SZ', 'Eswatini', 'Eswatini', 'Mbabane', null, 'en Eswatini', null],
  ['ET', 'Éthiopie', 'Ethiopia', 'Addis-Abeba', 'Addis Ababa', 'en Éthiopie', null],
  ['GA', 'Gabon', 'Gabon', 'Libreville', null, 'au Gabon', null],
  ['GM', 'Gambie', 'Gambia', 'Banjul', null, 'en Gambie', 'in the Gambia'],
  ['GH', 'Ghana', 'Ghana', 'Accra', null, 'au Ghana', null],
  ['GN', 'Guinée', 'Guinea', 'Conakry', null, 'en Guinée', null],
  ['GW', 'Guinée-Bissau', 'Guinea-Bissau', 'Bissau', null, 'en Guinée-Bissau', null],
  ['GQ', 'Guinée équatoriale', 'Equatorial Guinea', 'Malabo', null, 'en Guinée équatoriale', null],
  ['KE', 'Kenya', 'Kenya', 'Nairobi', null, 'au Kenya', null],
  ['LS', 'Lesotho', 'Lesotho', 'Maseru', null, 'au Lesotho', null],
  ['LR', 'Libéria', 'Liberia', 'Monrovia', null, 'au Libéria', null],
  ['LY', 'Libye', 'Libya', 'Tripoli', null, 'en Libye', null],
  ['MG', 'Madagascar', 'Madagascar', 'Antananarivo', null, 'à Madagascar', null],
  ['MW', 'Malawi', 'Malawi', 'Lilongwe', null, 'au Malawi', null],
  ['ML', 'Mali', 'Mali', 'Bamako', null, 'au Mali', null],
  ['MA', 'Maroc', 'Morocco', 'Rabat', null, 'au Maroc', null],
  ['MU', 'Maurice', 'Mauritius', 'Port-Louis', 'Port Louis', 'à Maurice', null],
  ['MR', 'Mauritanie', 'Mauritania', 'Nouakchott', null, 'en Mauritanie', null],
  ['MZ', 'Mozambique', 'Mozambique', 'Maputo', null, 'au Mozambique', null],
  ['NA', 'Namibie', 'Namibia', 'Windhoek', null, 'en Namibie', null],
  ['NE', 'Niger', 'Niger', 'Niamey', null, 'au Niger', null],
  ['NG', 'Nigeria', 'Nigeria', 'Abuja', null, 'au Nigeria', null],
  ['UG', 'Ouganda', 'Uganda', 'Kampala', null, 'en Ouganda', null],
  ['RW', 'Rwanda', 'Rwanda', 'Kigali', null, 'au Rwanda', null],
  ['ST', 'Sao Tomé-et-Principe', 'São Tomé and Príncipe', 'São Tomé', null, 'à Sao Tomé-et-Principe', null],
  ['SN', 'Sénégal', 'Senegal', 'Dakar', null, 'au Sénégal', null],
  ['SC', 'Seychelles', 'Seychelles', 'Victoria', null, 'aux Seychelles', 'in the Seychelles'],
  ['SL', 'Sierra Leone', 'Sierra Leone', 'Freetown', null, 'en Sierra Leone', null],
  ['SO', 'Somalie', 'Somalia', 'Mogadiscio', 'Mogadishu', 'en Somalie', null],
  ['SD', 'Soudan', 'Sudan', 'Khartoum', null, 'au Soudan', null],
  ['SS', 'Soudan du Sud', 'South Sudan', 'Djouba', 'Juba', 'au Soudan du Sud', null],
  ['ZA', 'Afrique du Sud', 'South Africa', 'Pretoria', null, 'en Afrique du Sud', null],
  ['TZ', 'Tanzanie', 'Tanzania', 'Dodoma', null, 'en Tanzanie', null],
  ['TD', 'Tchad', 'Chad', 'N’Djamena', null, 'au Tchad', null],
  ['TG', 'Togo', 'Togo', 'Lomé', null, 'au Togo', null],
  ['TN', 'Tunisie', 'Tunisia', 'Tunis', null, 'en Tunisie', null],
  ['ZM', 'Zambie', 'Zambia', 'Lusaka', null, 'en Zambie', null],
  ['ZW', 'Zimbabwe', 'Zimbabwe', 'Harare', null, 'au Zimbabwe', null],
];

/** Normalise pour comparer : minuscules, sans accents, apostrophes et tirets unifiés. */
export const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’'`´]/g, '').replace(/[-–\s]+/g, ' ').trim();

export const slugify = (s: string) => norm(s.replace(/[’'`´]/g, ' ')).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/** Les 54 pays, triés par nom français. */
export const AFRICA: Country[] = RAW.map(([code, fr, en, capFr, capEn, inFr, inEn]) => ({
  code, fr, en, capFr, capEn: capEn ?? capFr, slug: `pays-${slugify(fr)}`, inFr, inEn: inEn ?? `in ${en}`,
})).sort((a, b) => a.fr.localeCompare(b.fr, 'fr'));

const INDEX = new Map<string, Country>();
for (const c of AFRICA) for (const k of [c.fr, c.en, c.code, c.slug]) INDEX.set(norm(k), c);

/** Retrouve un pays par nom français, nom anglais, code ISO ou slug (`pays-benin`). */
export function findCountry(value?: string | null): Country | null {
  if (!value) return null;
  return INDEX.get(norm(value)) ?? null;
}

/** Nom canonique à stocker (français) : renvoie la saisie telle quelle si le pays n'est pas dans le référentiel. */
export const canonicalCountry = (value: string) => findCountry(value)?.fr ?? value.trim();

export const countryLabel = (c: Country, locale: Locale) => (locale === 'en' ? c.en : c.fr);

/** Compatibilité : nom français -> code ISO. */
export const COUNTRY_CODES: Record<string, string> = Object.fromEntries(AFRICA.map((c) => [c.fr, c.code]));
/** Compatibilité : liste des noms français (valeurs stockées). */
export const COUNTRIES: string[] = AFRICA.map((c) => c.fr);

/** Tri alphabétique localisé de pays (valeurs stockées = noms français). */
export function sortCountries(values: string[], locale: Locale): string[] {
  const label = (v: string) => { const c = findCountry(v); return c ? countryLabel(c, locale) : v; };
  return [...values].sort((a, b) => label(a).localeCompare(label(b), locale));
}

/** Description neutre d'un espace pays, sans statistique ni fait inventé. */
export function countryBlurb(c: Country, locale: Locale): string {
  return locale === 'en'
    ? `Conversations among developers ${c.inEn}. Capital: ${c.capEn}.`
    : `Échanges entre développeurs ${c.inFr}. Capitale : ${c.capFr}.`;
}
