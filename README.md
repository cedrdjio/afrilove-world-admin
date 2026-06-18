# AfriLove World — Admin Panel

A complete **Next.js 15 + TypeScript + Tailwind + Supabase** rewrite of the legacy
*Gomeet* PHP/MySQL admin panel, restyled to match the
[AfriLove World landing page](https://afrolove-world-landing.vercel.app/) and
re-engineered to remove the security flaws of the original.

---

## ✨ What's inside

| Area | Modules |
|------|---------|
| **Overview** | Dashboard with KPIs, gender split, newest members, catalog counts |
| **Members** | Users (search, paginate, activate/deactivate, approve/reject verification), user detail (profile, wallet & coin management with transaction logs), fake-user generator, abuse reports |
| **Catalog** | Interests, Languages, Religions, Relation goals, Gifts, Pages, FAQs (full CRUD with image uploads) |
| **Monetization** | Subscription plans (feature flags), coin packages, payment gateways, payouts (mark complete + proof upload) |
| **Engage** | Push notifications (audience targeting + optional OneSignal delivery) |
| **Administration** | Staff accounts with a granular permission matrix, global settings, profile/password |

The catalog modules (interests, languages, religions, goals, gifts, packages,
pages, faqs, plans) are powered by a single **declarative resource engine**
(`src/lib/resources.ts` + `src/app/(panel)/[resource]/`), replacing ~20
near-identical PHP files.

---

## 🎨 Design system

Derived from the AfriLove landing page — warm African earth-tones:

- **Espresso** `#2C1B14` · **Caramel** `#A56B45` / `#D4A373` · **Terracotta** `#B9372A` · **Gold** `#E1AF3A` · **Cream** `#F8F4EE`
- Font: **Montserrat** (via `next/font`)
- Rounded corners, soft shadows, warm 135° gradients — fully responsive (mobile drawer + desktop sidebar).

See `tailwind.config.ts` and `src/app/globals.css`.

---

## 🔐 Security improvements over the legacy panel

The original PHP had critical vulnerabilities. This rewrite fixes them — see
[`SECURITY.md`](./SECURITY.md) for the full mapping. Highlights:

- **No SQL injection** — all DB access goes through the Supabase client (parameterized); ids are validated with `zod`.
- **Hashed passwords** — bcrypt (`password_hash`), never plaintext; never displayed in the UI.
- **Locked-down database** — Row Level Security is enabled on every table with **no public policies**, so the anon key can read nothing. Admin code uses the service-role key **server-side only**.
- **Signed, HTTP-only session cookies** (`jose` JWT), route-protected by middleware.
- **Server-side permission checks** on every mutation (no trusting the client).
- **Hardened file uploads** — MIME-type + size validation, stored in Supabase Storage.
- **No secrets in the repo** — everything is via environment variables.

---

## 🚀 Getting started

### 1. Install
```bash
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env.local` and fill in your Supabase project values:
```bash
cp .env.example .env.local
```
Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `AUTH_SECRET` — generate with `openssl rand -base64 48`

Optional (push): `ONESIGNAL_APP_ID`, `ONESIGNAL_REST_API_KEY`.

### 3. Apply the database schema
**Easiest:** open **Supabase Dashboard → SQL Editor → New query**, paste the
contents of [`supabase/setup.sql`](./supabase/setup.sql), and **Run**. It's
idempotent (safe to re-run) and does everything: schema + RLS lockdown, a
default admin, sample data, and the `media` storage bucket.

Or run the individual migrations in `supabase/migrations/` in order
(`0001_init.sql`, `0002_seed.sql`, `0003_storage.sql`), or via the CLI:
```bash
supabase db push   # if you've linked the project with the Supabase CLI
```

### 4. Run
```bash
npm run dev      # http://localhost:3000
```

### Default login
```
Email:    admin@afrilove.world
Password: admin@1234
```
> ⚠️ Change this immediately after first login (Profile page).
> To generate a hash for a different password: `npm run hash -- "new-password"`.

---

## ☁️ Deploy on Vercel

1. Import the repo into Vercel.
2. In **Project → Settings → Environment Variables**, provide the Supabase URL
   and service-role key (the `afro_`-prefixed names work as-is) **plus**
   `AUTH_SECRET`:
   - `NEXT_PUBLIC_afro_SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`)
   - `afro_SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`)
   - `AUTH_SECRET` — generate with `openssl rand -base64 48`
3. Deploy. (No build config needed — it's a standard Next.js app.)

---

## 🧱 Project structure

```
src/
  app/
    login/                 # auth screen
    (panel)/               # authenticated admin shell (sidebar + topbar)
      dashboard/
      users/  [id]/        # list + detail (wallet/coin mgmt)
      fake-users/
      reports/
      [resource]/          # generic CRUD engine (interests, plans, gifts, …)
      payments/  payouts/
      notifications/
      staff/  settings/  profile/
  components/              # UI primitives, shell, resource & domain components
  lib/
    auth.ts                # sessions, bcrypt, permission guards
    permissions.ts         # role/permission model
    supabase.ts            # server-only service-role client
    storage.ts             # validated image uploads
    resources.ts           # declarative CRUD config
    actions/               # server actions (mutations)
supabase/migrations/       # PostgreSQL schema, seed, storage
```
