import { NextResponse } from "next/server";

/**
 * Lightweight diagnostic endpoint. Returns ONLY booleans/counts (never secret
 * values) so you can confirm at a glance whether the deployment is configured
 * AND can actually reach the database with a valid service-role key.
 *   GET /api/health
 */
export const dynamic = "force-dynamic";

function has(...names: string[]) {
  return names.some((n) => !!process.env[n] && process.env[n]!.trim() !== "");
}

export async function GET() {
  const env = {
    supabaseUrl: has("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_afro_SUPABASE_URL", "afro_SUPABASE_URL"),
    serviceKey: has("SUPABASE_SERVICE_ROLE_KEY", "afro_SUPABASE_SERVICE_ROLE_KEY"),
    authSecret: has("AUTH_SECRET", "afro_SUPABASE_JWT_SECRET", "SUPABASE_JWT_SECRET"),
  };

  // Live DB check: with a valid service-role key this bypasses RLS and counts
  // the admin accounts. adminCount >= 1 means login should work. adminCount 0
  // while reachable usually means the wrong key (publishable instead of
  // service_role) or the wrong project.
  const db: { reachable: boolean; adminCount: number | null; error: string | null } = {
    reachable: false,
    adminCount: null,
    error: null,
  };

  if (env.supabaseUrl && env.serviceKey) {
    try {
      const { getServiceClient } = await import("@/lib/supabase");
      const sb = getServiceClient();
      const { count, error } = await sb
        .from("admin_users")
        .select("*", { count: "exact", head: true });
      if (error) {
        db.error = error.message?.slice(0, 200) ?? "query error";
      } else {
        db.reachable = true;
        db.adminCount = count ?? 0;
      }
    } catch (e) {
      db.error = (e instanceof Error ? e.message : String(e)).slice(0, 200);
    }
  }

  const ok = env.supabaseUrl && env.serviceKey && env.authSecret && db.reachable && (db.adminCount ?? 0) >= 1;

  return NextResponse.json(
    {
      ok,
      env,
      db,
      hint: ok
        ? "Configuration OK — login should work."
        : !db.reachable
          ? "Cannot reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (must be the SECRET service_role key, not the publishable one)."
          : db.adminCount === 0
            ? "Connected, but no admin rows visible — the key is likely the publishable key (RLS-restricted) or points to the wrong project. Use the service_role / sb_secret key of the afrolove world project."
            : "Missing one or more env vars.",
    },
    { status: ok ? 200 : 503 },
  );
}
