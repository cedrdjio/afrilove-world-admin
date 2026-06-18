"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveStaff } from "@/lib/actions/admin";
import type { ActionResult } from "@/lib/actions/resource";
import { MODULES, type PermissionMap } from "@/lib/permissions";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useToast } from "@/components/ui/Toaster";

export function StaffForm({ staff }: { staff?: { id: string; name: string; email: string; status: boolean; permissions: PermissionMap } }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(saveStaff, null);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!state) return;
    toast(state.ok ? "success" : "error", state.message);
    if (state.ok) router.push("/staff");
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const perms = staff?.permissions ?? {};

  return (
    <form action={formAction} className="space-y-6">
      {staff && <input type="hidden" name="id" value={staff.id} />}

      <div className="card grid gap-5 p-6 sm:grid-cols-2">
        <div>
          <label className="label">Full name</label>
          <input name="name" defaultValue={staff?.name ?? ""} required className="input" />
        </div>
        <div>
          <label className="label">Email</label>
          <input name="email" type="email" defaultValue={staff?.email ?? ""} required className="input" />
        </div>
        <div>
          <label className="label">{staff ? "New password (leave blank to keep)" : "Password"}</label>
          <input name="password" type="password" minLength={8} required={!staff} className="input" placeholder="••••••••" />
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={staff?.status === false ? "false" : "true"} className="input">
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-espresso-500/10 p-6">
          <h3 className="text-lg font-bold">Permissions</h3>
          <p className="text-sm text-espresso-500">Grant per-module access. Admins implicitly have everything.</p>
        </div>
        <div className="divide-y divide-espresso-500/5">
          {MODULES.map((mod) => {
            const granted = perms[mod.key] ?? [];
            return (
              <div key={mod.key} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-semibold text-espresso-600">{mod.label}</span>
                <div className="flex flex-wrap gap-4">
                  {mod.actions.map((action) => (
                    <label key={action} className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name={`perm_${mod.key}_${action}`}
                        defaultChecked={granted.includes(action)}
                        className="h-4 w-4 rounded border-espresso-500/30 text-caramel focus:ring-caramel"
                      />
                      {action}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <SubmitButton>{staff ? "Save changes" : "Create staff member"}</SubmitButton>
        <Link href="/staff" className="btn-ghost">Cancel</Link>
      </div>
    </form>
  );
}
