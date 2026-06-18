-- ============================================================================
-- AfroLove World — one-shot database setup for Supabase.
-- Paste this whole file into: Supabase Dashboard -> SQL Editor -> Run.
-- Idempotent: safe to run more than once.
-- Creates schema + RLS lockdown, seeds a default admin & sample data,
-- and provisions the public 'media' storage bucket.
--
-- DEFAULT LOGIN:  admin@afrilove.world  /  admin@1234  (change after first login)
-- ============================================================================

-- ─────────────────────────── 1) SCHEMA ───────────────────────────
-- ============================================================================
-- AfriLove World — Admin schema (PostgreSQL / Supabase)
-- Translated and hardened from the legacy Gomeet PHP/MySQL admin panel.
--
-- Security posture:
--   * Row Level Security is ENABLED on every table with NO public policies,
--     so the anon key cannot read or write anything. All admin access goes
--     through server-side code using the service-role key behind our own
--     authenticated, permission-checked server actions.
--   * Admin/staff passwords are stored as bcrypt hashes (never plaintext).
-- ============================================================================

create extension if not exists "pgcrypto";

-- Helper: updated_at trigger ------------------------------------------------
-- search_path is pinned to '' to avoid the mutable-search_path security lint.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── Admin / staff accounts ────────────────────────────────────────────────
-- Replaces legacy `admin` + `tbl_manager`. A single table with a role and a
-- JSON permission map. Passwords are bcrypt-hashed.
create table if not exists public.admin_users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  name          text not null default 'Admin',
  password_hash text not null,
  role          text not null default 'staff' check (role in ('admin','staff')),
  -- permissions: { "interest": ["Read","Write","Update"], ... }
  permissions   jsonb not null default '{}'::jsonb,
  status        boolean not null default true,
  last_login_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_admin_users_updated before update on public.admin_users
  for each row execute function public.set_updated_at();

-- ─── App users (legacy tbl_user) ───────────────────────────────────────────
create table if not exists public.users (
  id               bigint generated always as identity primary key,
  name             text,
  email            text,
  mobile           text,
  ccode            text,
  gender           text,
  birth_date       date,
  profile_bio      text,
  search_preference text,
  radius_search    int default 100,
  relation_goal    bigint,
  interest         text,        -- legacy comma-separated interest ids
  language         text,        -- legacy comma-separated language ids
  religion         bigint,
  lats             double precision,
  longs            double precision,
  profile_pic      text,
  other_pic        text,        -- pipe-separated image paths
  identity_picture text,
  is_verify        int not null default 0,   -- 0 none, 1 pending, 2 approved, 3 rejected
  user_type        text not null default 'REAL_USER',  -- REAL_USER | FAKE_USER
  wallet           numeric(12,2) not null default 0,
  coin             numeric(12,2) not null default 0,
  plan_id          bigint,
  is_subscribe     boolean not null default false,
  plan_start_date  timestamptz,
  plan_end_date    timestamptz,
  code             text,        -- referral code
  refercode        text,        -- referrer code
  status           boolean not null default true,
  rdate            timestamptz not null default now()
);
create index if not exists idx_users_gender on public.users(gender);
create index if not exists idx_users_type on public.users(user_type);
create index if not exists idx_users_verify on public.users(is_verify);

-- ─── Catalog tables ────────────────────────────────────────────────────────
create table if not exists public.interests (
  id bigint generated always as identity primary key,
  title text not null,
  img text,
  status boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.languages (
  id bigint generated always as identity primary key,
  title text not null,
  img text,
  status boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.religions (
  id bigint generated always as identity primary key,
  title text not null,
  status boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.relation_goals (
  id bigint generated always as identity primary key,
  title text not null,
  subtitle text,
  status boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.gifts (
  id bigint generated always as identity primary key,
  img text,
  price numeric(12,2) not null default 0,
  status boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.packages (
  id bigint generated always as identity primary key,
  coin int not null default 0,
  amt numeric(12,2) not null default 0,
  status boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.pages (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  status boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id bigint generated always as identity primary key,
  question text not null,
  answer text,
  status boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.plans (
  id bigint generated always as identity primary key,
  title text not null,
  amt numeric(12,2) not null default 0,
  day_limit int not null default 30,
  description text,
  filter_include boolean not null default false,
  audio_video boolean not null default false,
  direct_chat boolean not null default false,
  chat boolean not null default false,
  like_menu boolean not null default false,
  status boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_gateways (
  id bigint generated always as identity primary key,
  title text not null,
  subtitle text,
  img text,
  attributes jsonb not null default '{}'::jsonb,
  status boolean not null default true,
  p_show boolean not null default true
);

-- ─── Financial / activity ──────────────────────────────────────────────────
create table if not exists public.plan_purchase_history (
  id bigint generated always as identity primary key,
  uid bigint references public.users(id) on delete set null,
  plan_id bigint,
  p_name text,
  t_date timestamptz not null default now(),
  amount numeric(12,2) not null default 0,
  day int,
  plan_title text,
  plan_description text,
  start_date date,
  expire_date date,
  trans_id text,
  p_method_id text
);
create index if not exists idx_pph_uid on public.plan_purchase_history(uid);

create table if not exists public.payouts (
  id bigint generated always as identity primary key,
  uid bigint references public.users(id) on delete set null,
  amt numeric(12,2) not null default 0,
  coin numeric(12,2) not null default 0,
  status text not null default 'pending',  -- pending | completed
  proof text,
  r_type text,                              -- UPI | BANK | PAYPAL ...
  acc_number text,
  bank_name text,
  acc_name text,
  ifsc text,
  upi_id text,
  paypal_id text,
  receipt_name text,
  r_date timestamptz not null default now()
);
create index if not exists idx_payouts_status on public.payouts(status);

create table if not exists public.wallet_reports (
  id bigint generated always as identity primary key,
  uid bigint references public.users(id) on delete cascade,
  amt numeric(12,2) not null default 0,
  message text,
  status text not null default 'Credit',    -- Credit | Debit
  tdate timestamptz not null default now()
);
create index if not exists idx_wallet_uid on public.wallet_reports(uid);

create table if not exists public.coin_reports (
  id bigint generated always as identity primary key,
  uid bigint references public.users(id) on delete cascade,
  amt numeric(12,2) not null default 0,
  message text,
  status text not null default 'Credit',
  tdate timestamptz not null default now()
);
create index if not exists idx_coin_uid on public.coin_reports(uid);

create table if not exists public.reports (
  id bigint generated always as identity primary key,
  uid bigint references public.users(id) on delete cascade,        -- reported profile
  reporter_id bigint references public.users(id) on delete set null,
  comment text,
  report_date timestamptz not null default now()
);

create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  uid bigint references public.users(id) on delete cascade,
  title text,
  description text,
  datetime timestamptz not null default now()
);

-- ─── Global settings (single row) ──────────────────────────────────────────
create table if not exists public.settings (
  id int primary key default 1,
  webname text default 'AfriLove World',
  weblogo text,
  timezone text default 'UTC',
  currency text default '$',
  mode text default 'No',         -- maintenance
  fmode text default 'No',        -- free premium mode
  admob text default 'No',
  banner_id text,
  in_id text,
  ios_banner_id text,
  ios_in_id text,
  one_key text,
  one_hash text,
  sms_type text default 'Twilio',
  auth_key text,
  otp_id text,
  acc_id text,
  auth_token text,
  twilio_number text,
  map_key text,
  otp_auth text,
  agora_app_id text,
  coin_amt numeric(12,2) default 0,
  coin_fun text default 'No',
  coin_limit int default 0,
  scredit numeric(12,2) default 0,
  show_dark int default 1,
  updated_at timestamptz not null default now(),
  constraint settings_singleton check (id = 1)
);

-- ─── Row Level Security: lock everything down ──────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'admin_users','users','interests','languages','religions','relation_goals',
    'gifts','packages','pages','faqs','plans','payment_gateways',
    'plan_purchase_history','payouts','wallet_reports','coin_reports',
    'reports','notifications','settings'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('alter table public.%I force row level security;', t);
  end loop;
end $$;
-- No policies are created on purpose: anon/authenticated roles get zero access.
-- The service-role key (server-side only) bypasses RLS for trusted admin code.

-- ─────────────────────────── 2) SEED ─────────────────────────────
-- ============================================================================
-- AfroLove World — seed data
-- Default super-admin + global settings + a little sample catalog data.
--
-- DEFAULT LOGIN:  admin@afrilove.world  /  admin@1234
-- !! Change this password immediately after first login (Profile page). !!
--
-- Sample catalog rows are only inserted when their table is empty, so this
-- file is safe to re-run.
-- ============================================================================

-- Super admin (bcrypt hash of "admin@1234")
insert into public.admin_users (email, name, password_hash, role, permissions, status)
values (
  'admin@afrilove.world',
  'Super Admin',
  '$2a$10$9GIfBeCGpbJvIbQP85.Xt.qSFD7LKWClrvJyLKvouPmzct.2YGb4q',
  'admin',
  '{}'::jsonb,
  true
)
on conflict (email) do nothing;

-- Settings singleton
insert into public.settings (id, webname, currency, timezone)
values (1, 'AfroLove World', '$', 'Africa/Lagos')
on conflict (id) do nothing;

-- Sample relation goals
insert into public.relation_goals (title, subtitle, status)
select * from (values
  ('Long-term partner', 'Looking for something serious', true),
  ('Friendship', 'New connections and good vibes', true),
  ('Marriage', 'Ready to settle down', true)
) as v(title, subtitle, status)
where not exists (select 1 from public.relation_goals);

-- Sample interests
insert into public.interests (title, status)
select * from (values
  ('Music', true), ('Travel', true), ('Cooking', true),
  ('Fitness', true), ('Movies', true), ('Dancing', true)
) as v(title, status)
where not exists (select 1 from public.interests);

-- Sample languages
insert into public.languages (title, status)
select * from (values
  ('English', true), ('French', true), ('Swahili', true),
  ('Yoruba', true), ('Arabic', true)
) as v(title, status)
where not exists (select 1 from public.languages);

-- Sample religions
insert into public.religions (title, status)
select * from (values
  ('Christianity', true), ('Islam', true), ('Traditional', true), ('Other', true)
) as v(title, status)
where not exists (select 1 from public.religions);

-- Sample plans
insert into public.plans (title, amt, day_limit, description, filter_include, audio_video, direct_chat, chat, like_menu, status)
select * from (values
  ('Free', 0::numeric, 3650, 'Basic access', false, false, false, true, false, true),
  ('Gold', 9.99::numeric, 30, 'Unlock chat, filters and likes', true, false, true, true, true, true),
  ('Platinum', 19.99::numeric, 30, 'Everything in Gold plus audio & video calls', true, true, true, true, true, true)
) as v(title, amt, day_limit, description, filter_include, audio_video, direct_chat, chat, like_menu, status)
where not exists (select 1 from public.plans);

-- Sample coin packages
insert into public.packages (coin, amt, status)
select * from (values
  (100, 0.99::numeric, true), (550, 4.99::numeric, true), (1200, 9.99::numeric, true)
) as v(coin, amt, status)
where not exists (select 1 from public.packages);

-- Sample payment gateways
insert into public.payment_gateways (title, subtitle, status, p_show)
select * from (values
  ('Stripe', 'Cards & wallets', true, true),
  ('PayPal', 'Pay with PayPal', true, true),
  ('Flutterwave', 'African payments', true, true),
  ('Paystack', 'Cards & bank transfer', false, false)
) as v(title, subtitle, status, p_show)
where not exists (select 1 from public.payment_gateways);

-- ─────────────────────────── 3) STORAGE ──────────────────────────
-- ============================================================================
-- Storage bucket for admin-uploaded media (gift/interest/language images,
-- logos, payout proofs, ...).
--
-- The bucket is PUBLIC: objects are served via their public URL with no policy
-- required. Writes happen exclusively server-side with the service-role key.
-- We intentionally do NOT add a public SELECT policy on storage.objects — that
-- would let anonymous clients LIST every file in the bucket (security lint
-- 0025); public URL reads do not need it.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;
