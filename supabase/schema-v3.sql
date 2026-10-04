-- AfriDevHub v3 : profils enrichis
alter table public.profiles
  add column if not exists headline text check (char_length(headline) <= 80),
  add column if not exists website_url text,
  add column if not exists languages text[] not null default '{}',
  add column if not exists years_exp smallint check (years_exp between 0 and 60),
  add column if not exists open_to text[] not null default '{}' check (open_to <@ array['mentor','collab','work']);
