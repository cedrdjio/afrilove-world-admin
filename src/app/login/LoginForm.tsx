"use client";

import { useActionState } from "react";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { loginAction, type LoginState } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState | null, FormData>(loginAction, null);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {state && !state.ok && (
        <div className="flex items-center gap-2 rounded-xl bg-terracotta/10 px-4 py-3 text-sm font-medium text-terracotta">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.message}
        </div>
      )}

      <div>
        <label className="label" htmlFor="email">Email</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-500/50" />
          <input id="email" name="email" type="email" autoComplete="username" required
            className="input pl-10" placeholder="admin@afrilove.world" />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="password">Password</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-500/50" />
          <input id="password" name="password" type="password" autoComplete="current-password" required
            className="input pl-10" placeholder="••••••••" />
        </div>
      </div>

      <SubmitButton className="w-full">Sign in</SubmitButton>
    </form>
  );
}
