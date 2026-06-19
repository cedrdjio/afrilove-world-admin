"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { verifyCredentials, createSession, destroySession } from "@/lib/auth";

export interface LoginState {
  ok: boolean;
  message: string;
}

const schema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

export async function loginAction(_prev: LoginState | null, form: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: form.get("email"),
    password: form.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  let user;
  try {
    user = await verifyCredentials(parsed.data.email, parsed.data.password);
  } catch (e) {
    // Most commonly: missing/invalid Supabase env vars on the server.
    console.error("[login] credential check failed:", e);
    return {
      ok: false,
      message:
        "Erreur de configuration serveur : connexion à la base impossible. Vérifiez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sur Vercel.",
    };
  }

  if (!user) {
    return { ok: false, message: "Email ou mot de passe invalide." };
  }

  try {
    await createSession(user);
  } catch (e) {
    console.error("[login] session creation failed:", e);
    return {
      ok: false,
      message: "Erreur de configuration serveur : AUTH_SECRET manquant sur Vercel.",
    };
  }

  redirect("/dashboard"); // throws NEXT_REDIRECT (handled by Next) — keep outside try/catch
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
