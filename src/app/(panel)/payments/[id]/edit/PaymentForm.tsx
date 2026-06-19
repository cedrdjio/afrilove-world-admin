"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { savePaymentGateway } from "@/lib/actions/admin";
import type { ActionResult } from "@/lib/actions/resource";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ImageInput } from "@/components/ui/ImageInput";
import { useToast } from "@/components/ui/Toaster";

export function PaymentForm({ gateway }: { gateway: any }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(savePaymentGateway, null);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!state) return;
    toast(state.ok ? "success" : "error", state.message);
    if (state.ok) router.push("/payments");
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={formAction} className="card max-w-2xl space-y-5 p-6">
      <input type="hidden" name="id" value={gateway.id} />
      <div>
        <label className="label">Subtitle</label>
        <input name="subtitle" defaultValue={gateway.subtitle ?? ""} className="input" />
      </div>
      <div>
        <label className="label">Configuration (JSON)</label>
        <textarea name="attributes" rows={8} className="input font-mono text-xs"
          defaultValue={JSON.stringify(gateway.attributes ?? {}, null, 2)} />
        <p className="mt-1 text-xs text-espresso-500">API keys / merchant IDs for this provider, as a JSON object.</p>
      </div>
      <div>
        <label className="label">Logo</label>
        <ImageInput name="img" defaultValue={gateway.img ?? null} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={gateway.status ? "true" : "false"} className="input">
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div>
          <label className="label">Show on wallet</label>
          <select name="p_show" defaultValue={gateway.p_show ? "true" : "false"} className="input">
            <option value="true">Visible</option>
            <option value="false">Hidden</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <SubmitButton>Save changes</SubmitButton>
      </div>
    </form>
  );
}
