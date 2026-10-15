-- AfriDevHub v6 : 54 pays, listings enrichis (dates + lien), espace pays
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Colonnes dates + lien pour les listings (opportunités, mentors, compétitions)
alter table if exists public.listings
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists link text;

-- 2. Index pour filtrer/trier par date
create index if not exists listings_start_date_idx on public.listings (start_date);
create index if not exists listings_end_date_idx on public.listings (end_date);

-- 3. Les 42 pays manquants (les 12 existants sont déjà en v5)
insert into public.spaces (slug, kind, name, tag, desc_fr, desc_en, position) values
('pays-algerie','country','Algérie',null,'Alger et Oran : Java, Spring, fintech, startups Yassir et Temtem.','Algiers and Oran: Java, Spring, fintech, Yassir and Temtem startups.',12),
('pays-angola','country','Angola',null,'Luanda : pétrole et gaz, fintech, applications mobiles.','Luanda: oil and gas, fintech, mobile apps.',13),
('pays-botswana','country','Botswana',null,'Gaborone : fintech, diamants, transformation numérique.','Gaborone: fintech, diamonds, digital transformation.',14),
('pays-burkina-faso','country','Burkina Faso',null,'Ouagadougou : agri-tech, mobile money, énergie solaire.','Ouagadougou: agri-tech, mobile money, solar energy.',15),
('pays-burundi','country','Burundi',null,'Gitega : agriculture, mobile money, développement rural.','Gitega: agriculture, mobile money, rural development.',16),
('pays-cabo-verde','country','Cabo Verde',null,'Praia : tourisme, numérique, services financiers.','Praia: tourism, digital, financial services.',17),
('pays-comores','country','Comores',null,'Moroni : pêche, agriculture, télécoms.','Moroni: fishing, agriculture, telecoms.',18),
('pays-congo','country','Congo',null,'Brazzaville : pétrole, fintech, applications mobiles.','Brazzaville: oil, fintech, mobile apps.',19),
('pays-djibouti','country','Djibouti',null,'Djibouti : logistique, ports, télécoms.','Djibouti: logistics, ports, telecoms.',20),
('pays-erythree','country','Érythrée',null,'Asmara : mining, infrastructure, télécoms.','Asmara: mining, infrastructure, telecoms.',21),
('pays-eswatini','country','Eswatini',null,'Mbabane : sucre, textile, numérique.','Mbabane: sugar, textile, digital.',22),
('pays-ethiopie','country','Éthiopie',null,'Addis-Abeba : fintech, agri-tech, télécoms.','Addis Ababa: fintech, agri-tech, telecoms.',23),
('pays-gabon','country','Gabon',null,'Libreville : pétrole, bois, numérique.','Libreville: oil, timber, digital.',24),
('pays-gambie','country','Gambie',null,'Banjul : tourisme, agriculture, télécoms.','Banjul: tourism, agriculture, telecoms.',25),
('pays-guinee','country','Guinée',null,'Conakry : mining, aluminium, télécoms.','Conakry: mining, aluminium, telecoms.',26),
('pays-guinee-bissau','country','Guinée-Bissau',null,'Bissau : agriculture, pêche, télécoms.','Bissau: agriculture, fishing, telecoms.',27),
('pays-guinee-equatoriale','country','Guinée équatoriale',null,'Malabo : pétrole, gaz, numérique.','Malabo: oil, gas, digital.',28),
('pays-lesotho','country','Lesotho',null,'Maseru : textile, eau, numérique.','Maseru: textile, water, digital.',29),
('pays-liberia','country','Liberia',null,'Monrovia : agriculture, mining, télécoms.','Monrovia: agriculture, mining, telecoms.',30),
('pays-libye','country','Libye',null,'Tripoli : pétrole, gaz, numérique.','Tripoli: oil, gas, digital.',31),
('pays-madagascar','country','Madagascar',null,'Antananarivo : vanille, textile, numérique.','Antananarivo: vanilla, textile, digital.',32),
('pays-malawi','country','Malawi',null,'Lilongwe : agriculture, tabac, numérique.','Lilongwe: agriculture, tobacco, digital.',33),
('pays-mali','country','Mali',null,'Bamako : or, agriculture, mobile money.','Bamako: gold, agriculture, mobile money.',34),
('pays-maurice','country','Maurice',null,'Port-Louis : fintech, tourisme, BPO.','Port Louis: fintech, tourism, BPO.',35),
('pays-mauritanie','country','Mauritanie',null,'Nouakchott : mining, pêche, télécoms.','Nouakchott: mining, fishing, telecoms.',36),
('pays-mozambique','country','Mozambique',null,'Maputo : gaz, agriculture, télécoms.','Maputo: gas, agriculture, telecoms.',37),
('pays-namibie','country','Namibie',null,'Windhoek : mining, tourisme, numérique.','Windhoek: mining, tourism, digital.',38),
('pays-niger','country','Niger',null,'Niamey : uranium, agriculture, télécoms.','Niamey: uranium, agriculture, telecoms.',39),
('pays-ouganda','country','Ouganda',null,'Kampala : fintech, agri-tech, mobile money.','Kampala: fintech, agri-tech, mobile money.',40),
('pays-sao-tome','country','São Tomé-et-Principe',null,'São Tomé : cacao, tourisme, télécoms.','São Tomé: cocoa, tourism, telecoms.',41),
('pays-seychelles','country','Seychelles',null,'Victoria : tourisme, pêche, fintech.','Victoria: tourism, fishing, fintech.',42),
('pays-sierra-leone','country','Sierra Leone',null,'Freetown : mining, agriculture, télécoms.','Freetown: mining, agriculture, telecoms.',43),
('pays-somalie','country','Somalie',null,'Mogadiscio : télécoms, pêche, mobile money.','Mogadishu: telecoms, fishing, mobile money.',44),
('pays-soudan','country','Soudan',null,'Khartoum : agriculture, pétrole, télécoms.','Khartoum: agriculture, oil, telecoms.',45),
('pays-soudan-du-sud','country','Soudan du Sud',null,'Juba : pétrole, agriculture, télécoms.','Juba: oil, agriculture, telecoms.',46),
('pays-tanzanie','country','Tanzanie',null,'Dar es Salaam : fintech, agri-tech, mobile money.','Dar es Salaam: fintech, agri-tech, mobile money.',47),
('pays-tchad','country','Tchad',null,'N''Djamena : pétrole, agriculture, télécoms.','N''Djamena: oil, agriculture, telecoms.',48),
('pays-togo','country','Togo',null,'Lomé : fintech, agriculture, mobile money.','Lomé: fintech, agriculture, mobile money.',49),
('pays-tunisie','country','Tunisie',null,'Tunis : fintech, numérique, outsourcing.','Tunis: fintech, digital, outsourcing.',50),
('pays-zambie','country','Zambie',null,'Lusaka : cuivre, agriculture, télécoms.','Lusaka: copper, agriculture, telecoms.',51),
('pays-zimbabwe','country','Zimbabwe',null,'Harare : agriculture, mining, fintech.','Harare: agriculture, mining, fintech.',52)
on conflict (slug) do nothing;

-- 4. Mettre à jour les descriptions des 12 pays existants pour inclure les 54
-- (déjà fait en v5, on garde les positions 0-11 pour les 12 premiers)
