"use client";

import { useActionState, useEffect } from "react";
import { generateFakeUsers } from "@/lib/actions/fakeUsers";
import type { ActionResult } from "@/lib/actions/resource";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useToast } from "@/components/ui/Toaster";

export function FakeUserForm() {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(generateFakeUsers, null);
  const toast = useToast();
  useEffect(() => { if (state) toast(state.ok ? "success" : "error", state.message); }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={formAction} className="card max-w-2xl space-y-5 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">How many profiles</label>
          <input name="count" type="number" min={1} max={200} defaultValue={10} required className="input" />
          <p className="mt-1 text-xs text-espresso-500">Up to 200 at a time.</p>
        </div>
        <div>
          <label className="label">Gender</label>
          <select name="gender" className="input" defaultValue="RANDOM">
            <option value="RANDOM">Random</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>
        <div>
          <label className="label">Country code</label>
          <input name="ccode" defaultValue="+234" className="input" />
        </div>
        <div>
          <label className="label">Spread radius (km)</label>
          <input name="radius" type="number" min={0} max={500} defaultValue={25} className="input" />
        </div>
        <div>
          <label className="label">Center latitude</label>
          <input name="lat" type="number" step="any" defaultValue={6.5244} required className="input" />
        </div>
        <div>
          <label className="label">Center longitude</label>
          <input name="lng" type="number" step="any" defaultValue={3.3792} required className="input" />
        </div>
        <div>
          <label className="label">Random interests each</label>
          <input name="interestCount" type="number" min={0} max={10} defaultValue={3} className="input" />
        </div>
        <div>
          <label className="label">Random languages each</label>
          <input name="languageCount" type="number" min={0} max={10} defaultValue={2} className="input" />
        </div>
      </div>
      <SubmitButton>Generate profiles</SubmitButton>
    </form>
  );
}
