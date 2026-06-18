import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { getServiceClient } from "./supabase";
import type { SessionUser, ModuleKey, PermAction } from "./permissions";
import { can } from "./permissions";

const COOKIE_NAME = "afrilove_session";
const MAX_AGE = 60 * 60 * 8; // 8 hours

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET env var is required for session signing.");
  return new TextEncoder().encode(s);
}

/** Create a signed session cookie for the given user. */
export async function createSession(user: SessionUser): Promise<void> {
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Read + verify the current session. Returns null if unauthenticated. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      id: String(payload.sub),
      email: String(payload.email),
      name: String(payload.name ?? "Admin"),
      role: payload.role === "admin" ? "admin" : "staff",
      permissions: (payload.permissions as SessionUser["permissions"]) ?? {},
    };
  } catch {
    return null;
  }
}

/** Require an authenticated user; redirect to /login otherwise. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Require a specific permission; 404-style redirect to dashboard if missing. */
export async function requirePermission(
  module: ModuleKey,
  action: PermAction,
): Promise<SessionUser> {
  const user = await requireUser();
  if (!can(user, module, action)) redirect("/dashboard?denied=1");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard?denied=1");
  return user;
}

/**
 * Verify credentials against admin_users. Returns the session user on success.
 * Uses a constant-ish path (always runs bcrypt) to reduce user-enumeration.
 */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<SessionUser | null> {
  const sb = getServiceClient();
  const { data } = await sb
    .from("admin_users")
    .select("id,email,name,password_hash,role,permissions,status")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  // Dummy hash so timing is similar whether or not the user exists.
  const hash = data?.password_hash ?? "$2a$10$CwTycUXWue0Thq9StjUM0uJ8.bSj0c4Cj7xqVQ0o1z6w8uVnYp4Iu";
  const ok = await bcrypt.compare(password, hash);

  if (!data || !ok || data.status === false) return null;

  await sb.from("admin_users").update({ last_login_at: new Date().toISOString() }).eq("id", data.id);

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    role: data.role === "admin" ? "admin" : "staff",
    permissions: data.permissions ?? {},
  };
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}
