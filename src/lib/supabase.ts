import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseUrl, getServiceRoleKey } from "./env";

/**
 * Server-only Supabase client using the service-role key.
 *
 * This key bypasses Row Level Security and must NEVER reach the browser.
 * It is only imported from server actions, route handlers and server
 * components. All access through it is gated by our own authentication and
 * permission checks (see src/lib/auth.ts and src/lib/permissions.ts).
 */
let cached: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (cached) return cached;

  const url = getSupabaseUrl();
  const serviceKey = getServiceRoleKey();

  cached = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
