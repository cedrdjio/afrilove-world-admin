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

  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    return { ok: false, message: "Invalid email or password." };
  }

  await createSession(user);
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
