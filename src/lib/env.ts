/**
 * Environment-variable resolver.
 *
 * The app only needs three things at runtime (all server-side):
 *   - the Supabase project URL
 *   - the Supabase service-role / secret key (bypasses RLS)
 *   - a secret for signing admin session JWTs
 *
 * To stay compatible with however the variables are named in Vercel, we accept
 * many aliases — canonical names first (highest priority), then the
 * `afro_`- and `afri_`-prefixed names used across the AfroLove/AfriLove
 * projects, and both the legacy `SERVICE_ROLE_KEY` and the newer `SECRET_KEY`
 * naming. The first non-empty match wins.
 *
 * NOTE: kept free of `server-only` so the edge middleware can import it too.
 */

function pick(...names: string[]): string | undefined {
  for (const n of names) {
    const v = process.env[n];
    if (v && v.trim()) return v.trim();
  }
  return undefined;
}

export function getSupabaseUrl(): string {
  const url = pick(
    "SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_afro_SUPABASE_URL",
    "afro_SUPABASE_URL",
    "NEXT_PUBLIC_afri_SUPABASE_URL",
    "afri_SUPABASE_URL",
  );
  if (!url) {
    throw new Error("Missing Supabase URL (set NEXT_PUBLIC_SUPABASE_URL or an *_SUPABASE_URL alias).");
  }
  return url;
}

export function getServiceRoleKey(): string {
  const key = pick(
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SECRET_KEY",
    "afro_SUPABASE_SERVICE_ROLE_KEY",
    "afro_SUPABASE_SECRET_KEY",
    "afri_SUPABASE_SERVICE_ROLE_KEY",
    "afri_SUPABASE_SECRET_KEY",
  );
  if (!key) {
    throw new Error(
      "Missing service-role/secret key (set SUPABASE_SERVICE_ROLE_KEY — the SECRET key, not the publishable one).",
    );
  }
  return key;
}

export function getAuthSecret(): string {
  const secret = pick(
    "AUTH_SECRET",
    "afro_SUPABASE_JWT_SECRET",
    "afri_SUPABASE_JWT_SECRET",
    "SUPABASE_JWT_SECRET",
  );
  if (!secret) {
    throw new Error("Missing AUTH_SECRET (set AUTH_SECRET to a long random string).");
  }
  return secret;
}

/** The project ref (subdomain) of the configured Supabase URL, for diagnostics. */
export function getSupabaseRef(): string | null {
  try {
    const host = new URL(getSupabaseUrl()).host; // e.g. abcd.supabase.co
    return host.split(".")[0] || null;
  } catch {
    return null;
  }
}
