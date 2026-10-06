-- AfriDevHub v5 : espaces (référentiel), notifications réelles, classement des contributeurs
create table if not exists public.spaces (
  slug text primary key,
  kind text not null check (kind in ('country','tech')),
  name text not null,
  tag text,
  desc_fr text not null default '',
  desc_en text not null default '',
  position int not null default 0
);
alter table public.spaces enable row level security;
drop policy if exists "espaces lisibles par tous" on public.spaces;
create policy "espaces lisibles par tous" on public.spaces for select using (true);
insert into public.spaces (slug, kind, name, tag, desc_fr, desc_en, position) values
('pays-benin','country','Bénin',null,'Cotonou et Porto-Novo : Laravel, MTN MoMo et Moov Money, premiers jobs et meetups.','Cotonou and Porto-Novo: Laravel, MTN MoMo and Moov Money, first jobs and meetups.',0),
('pays-nigeria','country','Nigeria',null,'Lagos et Abuja : fintech, Paystack et Flutterwave, travail à distance pour des équipes étrangères.','Lagos and Abuja: fintech, Paystack and Flutterwave, remote work for foreign teams.',1),
('pays-senegal','country','Sénégal',null,'Dakar : Wave et Orange Money, Flutter, communauté étudiante des écoles d’ingénieurs.','Dakar: Wave and Orange Money, Flutter, the engineering schools’ student community.',2),
('pays-cote-d-ivoire','country','Côte d’Ivoire',null,'Abidjan : DevOps, Wave, Orange Money et MTN MoMo, startups et grands groupes.','Abidjan: DevOps, Wave, Orange Money and MTN MoMo, startups and large companies.',3),
('pays-cameroun','country','Cameroun',null,'Douala et Yaoundé : développeurs bilingues FR/EN, data, Orange Money et MTN MoMo.','Douala and Yaoundé: bilingual FR/EN developers, data, Orange Money and MTN MoMo.',4),
('pays-ghana','country','Ghana',null,'Accra : MTN MoMo, sous-traitance, hubs tech et IA appliquée aux langues locales.','Accra: MTN MoMo, outsourcing, tech hubs and AI applied to local languages.',5),
('pays-kenya','country','Kenya',null,'Nairobi : M-Pesa et API Daraja, Go et PHP, open source et hackathons.','Nairobi: M-Pesa and the Daraja API, Go and PHP, open source and hackathons.',6),
('pays-rwanda','country','Rwanda',null,'Kigali : services publics numériques, React et Next.js, programmes d’accélération.','Kigali: digital public services, React and Next.js, accelerator programmes.',7),
('pays-maroc','country','Maroc',null,'Casablanca et Rabat : Django, NLP de l’arabe et de la darija, offshoring vers l’Europe.','Casablanca and Rabat: Django, Arabic and Darija NLP, offshoring to Europe.',8),
('pays-egypte','country','Égypte',null,'Le Caire : embarqué, IoT, Python, grandes équipes d’ingénierie et freelances.','Cairo: embedded, IoT, Python, large engineering teams and freelancers.',9),
('pays-afrique-du-sud','country','Afrique du Sud',null,'Johannesburg et Le Cap : Rust, Go, cloud, coupures d’électricité et énergie solaire.','Johannesburg and Cape Town: Rust, Go, cloud, load shedding and solar power.',10),
('pays-rd-congo','country','RD Congo',null,'Kinshasa et Lubumbashi : Android, PWA hors ligne, connexions instables, Airtel Money.','Kinshasa and Lubumbashi: Android, offline PWAs, unstable connections, Airtel Money.',11),
('tech-php-laravel','tech','PHP / Laravel','laravel','Files d’attente, webhooks de paiement idempotents, déploiement sur VPS à bas coût.','Queues, idempotent payment webhooks, low-cost VPS deployment.',100),
('tech-javascript-next-js','tech','JavaScript / Next.js','javascript','Rendu serveur, cache, performance sur réseaux 3G et téléphones d’entrée de gamme.','Server rendering, caching, performance on 3G networks and entry-level phones.',101),
('tech-flutter','tech','Flutter','flutter','Applications offline-first, synchronisation avec Supabase, publication sur Play Store.','Offline-first apps, Supabase sync, Play Store publishing.',102),
('tech-python-ia','tech','Python / IA','python','Modèles légers, quantification, jeux de données en langues africaines.','Light models, quantisation, African-language datasets.',103),
('tech-embarque-iot','tech','Embarqué / IoT','iot','ESP32, MQTT, capteurs solaires, tolérance aux coupures Wi-Fi.','ESP32, MQTT, solar sensors, tolerance to Wi-Fi drops.',104),
('tech-devops','tech','DevOps','ci-cd','CI/CD, conteneurs, supervision, réduire la facture cloud.','CI/CD, containers, monitoring, cutting the cloud bill.',105),
('tech-mobile-money-paiements','tech','Mobile Money & paiements','mobile-money','Wave, Orange Money, MTN MoMo, M-Pesa : intégrations, réconciliation, litiges.','Wave, Orange Money, MTN MoMo, M-Pesa: integrations, reconciliation, disputes.',106),
('tech-data-big-data','tech','Data & Big Data','sql','Nettoyage de gros fichiers, SQL, pipelines pour la santé et l’agriculture.','Cleaning large files, SQL, pipelines for health and agriculture.',107)
on conflict (slug) do nothing;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('answer','accepted','vote')),
  question_id uuid references public.questions(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
alter table public.notifications enable row level security;
drop policy if exists "notifications: lecture par le destinataire" on public.notifications;
create policy "notifications: lecture par le destinataire" on public.notifications for select to authenticated using (user_id = auth.uid());
drop policy if exists "notifications: marquer comme lue" on public.notifications;
create policy "notifications: marquer comme lue" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Nouvelle réponse -> notifier l'auteur de la question
create or replace function public.notify_on_answer() returns trigger language plpgsql security definer set search_path = public as $$
declare qa uuid;
begin
  select author_id into qa from public.questions where id = new.question_id;
  if qa is not null and qa <> new.author_id then
    insert into public.notifications (user_id, type, question_id, actor_id) values (qa, 'answer', new.question_id, new.author_id);
  end if;
  return new;
end $$;
drop trigger if exists answers_notify on public.answers;
create trigger answers_notify after insert on public.answers for each row execute function public.notify_on_answer();

-- Réponse acceptée -> notifier l'auteur de la réponse
create or replace function public.notify_on_accept() returns trigger language plpgsql security definer set search_path = public as $$
declare aa uuid;
begin
  if new.accepted_answer_id is not null and new.accepted_answer_id is distinct from old.accepted_answer_id then
    select author_id into aa from public.answers where id = new.accepted_answer_id;
    if aa is not null and aa <> new.author_id then
      insert into public.notifications (user_id, type, question_id, actor_id) values (aa, 'accepted', new.id, new.author_id);
    end if;
  end if;
  return new;
end $$;
drop trigger if exists questions_notify_accept on public.questions;
create trigger questions_notify_accept after update of accepted_answer_id on public.questions for each row execute function public.notify_on_accept();

-- Vote positif -> notifier l'auteur de la réponse
create or replace function public.notify_on_vote() returns trigger language plpgsql security definer set search_path = public as $$
declare aa uuid; qid uuid;
begin
  if new.value = 1 then
    select author_id, question_id into aa, qid from public.answers where id = new.answer_id;
    if aa is not null and aa <> new.user_id then
      insert into public.notifications (user_id, type, question_id, actor_id) values (aa, 'vote', qid, new.user_id);
    end if;
  end if;
  return new;
end $$;
drop trigger if exists answer_votes_notify on public.answer_votes;
create trigger answer_votes_notify after insert on public.answer_votes for each row execute function public.notify_on_vote();

-- Classement des contributeurs (réputation = somme des votes + 5 points par réponse)
create or replace view public.contributors with (security_invoker = true) as
select p.username, p.country, (coalesce(sum(a.score), 0) + 5 * count(a.id))::int as rep
from public.profiles p left join public.answers a on a.author_id = p.id
group by p.id;
grant select on public.contributors to anon, authenticated;
