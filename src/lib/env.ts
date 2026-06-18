/**
 * Environment-variable resolver.
 *
 * The app only needs three things at runtime (all server-side):
 *   - the Supabase project URL
 *   - the Supabase service-role key
 *   - a secret for signing admin session JWTs
 *
 * To stay compatible with however the variables are named in Vercel, we accept
 * several aliases — including the `afro_`-prefixed names used by the AfroLove
 * World project. The first non-empty match wins.
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
    "afro_NEXT_PUBLIC_SUPABASE_URL",
  );
  if (!url) {
    throw new Error("Missing Supabase URL (set NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_afro_SUPABASE_URL).");
  }
  return url;
}

export function getServiceRoleKey(): string {
  const key = pick("SUPABASE_SERVICE_ROLE_KEY", "afro_SUPABASE_SERVICE_ROLE_KEY");
  if (!key) {
    throw new Error("Missing service-role key (set SUPABASE_SERVICE_ROLE_KEY or afro_SUPABASE_SERVICE_ROLE_KEY).");
  }
  return key;
}

export function getAuthSecret(): string {
  const secret = pick("AUTH_SECRET", "afro_SUPABASE_JWT_SECRET", "SUPABASE_JWT_SECRET");
  if (!secret) {
    throw new Error("Missing AUTH_SECRET (set AUTH_SECRET to a long random string).");
  }
  return secret;
}
