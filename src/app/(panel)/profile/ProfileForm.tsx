"use client";

import { useActionState, useEffect } from "react";
import { updateProfile } from "@/lib/actions/admin";
import type { ActionResult } from "@/lib/actions/resource";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useToast } from "@/components/ui/Toaster";
import type { SessionUser } from "@/lib/permissions";

export function ProfileForm({ user }: { user: SessionUser }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(updateProfile, null);
  const toast = useToast();
  useEffect(() => { if (state) toast(state.ok ? "success" : "error", state.message); }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={formAction} className="card max-w-xl space-y-5 p-6">
      <div>
        <label className="label">Full name</label>
        <input name="name" defaultValue={user.name} required className="input" />
      </div>
      <div>
        <label className="label">Email</label>
        <input name="email" type="email" defaultValue={user.email} required className="input" />
      </div>
      <div>
        <label className="label">New password</label>
        <input name="password" type="password" minLength={8} placeholder="Leave blank to keep current" className="input" />
        <p className="mt-1 text-xs text-espresso-500">At least 8 characters. Stored as a bcrypt hash.</p>
      </div>
      <SubmitButton>Update profile</SubmitButton>
    </form>
  );
}
