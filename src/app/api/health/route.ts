import { NextResponse } from "next/server";

/**
 * Lightweight diagnostic endpoint. Returns ONLY booleans/metadata (never the
 * secret values themselves) so you can confirm at a glance whether the
 * deployment is configured AND can actually reach the database with a valid
 * service-role/secret key.
 *   GET /api/health
 */
export const dynamic = "force-dynamic";

function val(...names: string[]): string | undefined {
  for (const n of names) {
    const v = process.env[n];
    if (v && v.trim()) return v.trim();
  }
  return undefined;
}

/** Classify the configured key WITHOUT revealing it. */
function classifyKey(key?: string): string {
  if (!key) return "missing";
  if (key.startsWith("sb_publishable_")) return "publishable (WRONG — public key)";
  if (key.startsWith("sb_secret_")) return "secret (OK)";
  if (key.startsWith("eyJ")) {
    // JWT — decode the payload to read the role claim
    try {
      const payload = JSON.parse(Buffer.from(key.split(".")[1], "base64").toString());
      const role = payload?.role ?? "unknown";
      return role === "service_role" ? "service_role JWT (OK)" : `${role} JWT (WRONG)`;
    } catch {
      return "JWT (unknown role)";
    }
  }
  return "unknown format";
}

export async function GET() {
  const urlVal = val("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_afro_SUPABASE_URL", "afro_SUPABASE_URL", "NEXT_PUBLIC_afri_SUPABASE_URL", "afri_SUPABASE_URL");
  const keyVal = val("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY", "afro_SUPABASE_SERVICE_ROLE_KEY", "afro_SUPABASE_SECRET_KEY", "afri_SUPABASE_SERVICE_ROLE_KEY", "afri_SUPABASE_SECRET_KEY");
  const authVal = val("AUTH_SECRET", "afro_SUPABASE_JWT_SECRET", "afri_SUPABASE_JWT_SECRET", "SUPABASE_JWT_SECRET");

  const projectRef = urlVal ? (() => { try { return new URL(urlVal).host.split(".")[0]; } catch { return null; } })() : null;

  const env = {
    supabaseUrl: !!urlVal,
    serviceKey: !!keyVal,
    authSecret: !!authVal,
    project: projectRef,
    keyType: classifyKey(keyVal),
  };

  const db: { reachable: boolean; adminCount: number | null; error: string | null } = {
    reachable: false,
    adminCount: null,
    error: null,
  };

  if (urlVal && keyVal) {
    try {
      const { getServiceClient } = await import("@/lib/supabase");
      const sb = getServiceClient();
      const { count, error } = await sb.from("admin_users").select("*", { count: "exact", head: true });
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

  let hint: string;
  if (ok) hint = "Configuration OK — login should work.";
  else if (!env.serviceKey) hint = "No service key set.";
  else if (db.error?.includes("does not exist") || db.error?.toLowerCase().includes("relation"))
    hint = `The schema is missing on project '${projectRef}'. Run supabase/setup.sql in that project's SQL Editor.`;
  else if (!db.reachable) hint = "Cannot reach Supabase. Check the URL and key.";
  else if (db.adminCount === 0)
    hint = `Connected to '${projectRef}' but no admin rows visible — key type is '${env.keyType}'. Use the SECRET / service_role key of the project that has the schema (afrolove world / sbvlkjaifqocakgxvdea).`;
  else hint = "Missing one or more env vars.";

  return NextResponse.json({ ok, env, db, hint }, { status: ok ? 200 : 503 });
}
