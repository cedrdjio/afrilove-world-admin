import { NextResponse } from "next/server";

/**
 * Lightweight diagnostic endpoint. Returns ONLY booleans (never secret values)
 * so you can confirm at a glance whether the deployment is configured.
 *   GET /api/health
 */
export const dynamic = "force-dynamic";

function has(...names: string[]) {
  return names.some((n) => !!process.env[n] && process.env[n]!.trim() !== "");
}

export async function GET() {
  const supabaseUrl = has("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_afro_SUPABASE_URL", "afro_SUPABASE_URL");
  const serviceKey = has("SUPABASE_SERVICE_ROLE_KEY", "afro_SUPABASE_SERVICE_ROLE_KEY");
  const authSecret = has("AUTH_SECRET", "afro_SUPABASE_JWT_SECRET", "SUPABASE_JWT_SECRET");

  const ok = supabaseUrl && serviceKey && authSecret;

  return NextResponse.json(
    {
      ok,
      env: { supabaseUrl, serviceKey, authSecret },
      hint: ok
        ? "All required environment variables are present."
        : "Missing one or more env vars. Set them on Vercel and redeploy.",
    },
    { status: ok ? 200 : 503 },
  );
}
