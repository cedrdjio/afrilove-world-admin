# Security — legacy flaws and how this rewrite fixes them

The original *Gomeet* PHP admin panel had a number of critical vulnerabilities.
This document maps each one to its remediation in the Next.js rewrite.

| # | Legacy flaw (PHP) | Remediation (this project) |
|---|-------------------|----------------------------|
| 1 | **SQL injection** everywhere — `$_GET`/`$_POST` concatenated straight into queries (`...where id=".$_GET['id']`) | All data access goes through the Supabase JS client, which sends **parameterized** requests. Every id is validated with `zod` (`z.coerce.number().int()`) before use. |
| 2 | **Login SQL injection / auth bypass** — `WHERE username='$u' AND password='$p'` | Login looks the user up by email only, then verifies with `bcrypt.compare`. No user input touches a query string. |
| 3 | **Plaintext passwords** — stored and even *displayed* on the staff list | Passwords are stored as **bcrypt hashes** (`password_hash` column). They are never returned to the client and never rendered. |
| 4 | **No CSRF protection** on any POST | Mutations are **React Server Actions** (same-origin, non-simple requests) guarded by an HTTP-only, signed session cookie with `SameSite=Lax`. |
| 5 | **Broken access control** — permission checks ran *after* the page had already queried/acted | Every server action and page calls `requireUser` / `requirePermission` / `requireAdmin` **before** doing any work; unauthorized requests are rejected up-front. |
| 6 | **Weak sessions** — no expiry, no regeneration, no secure flags | Sessions are signed JWTs (`jose`) in an `httpOnly`, `secure` (in prod), `SameSite=Lax` cookie with an **8-hour expiry**. Verified in middleware on every request. |
| 7 | **Unrestricted file upload** — extension-only, any type/size, written to web root | Uploads are validated for **MIME type and size (5 MB)** and stored in **Supabase Storage**, not in the deployable app. |
| 8 | **Hardcoded secrets** (DB creds, Google Maps key, API keys in source) | All secrets are **environment variables**. `.env*.local` is git-ignored. Nothing sensitive is committed. |
| 9 | **IDOR** — any id could be acted on with no checks | Ids are validated and every mutating action is permission-gated by module + action. |
| 10 | Anon database exposure | **Row Level Security** is enabled on every table with **no public policies** — the anon/public key can read nothing. The service-role key is used **server-side only** and never shipped to the browser. |

## Operational notes

- **Rotate any credential shared in plaintext.** If Supabase keys / Postgres
  password were pasted into a chat or ticket, regenerate them in the Supabase
  dashboard (Settings → API / Database) and update the environment variables.
- The default admin password (`admin@1234`) is for first login only — change it
  immediately via the Profile page.
- `AUTH_SECRET` must be a long random value and kept secret; rotating it
  invalidates all existing sessions.
