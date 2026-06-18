"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendNotification } from "@/lib/actions/admin";
import type { ActionResult } from "@/lib/actions/resource";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useToast } from "@/components/ui/Toaster";

export function NotificationForm() {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(sendNotification, null);
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!state) return;
    toast(state.ok ? "success" : "error", state.message);
    if (state.ok) formRef.current?.reset();
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form ref={formRef} action={formAction} className="card max-w-xl space-y-5 p-6">
      <div>
        <label className="label">Audience</label>
        <select name="audience" className="input">
          <option value="all">All users</option>
          <option value="premium">Premium subscribers</option>
          <option value="free">Free users</option>
        </select>
      </div>
      <div>
        <label className="label">Title</label>
        <input name="title" required maxLength={120} className="input" placeholder="A new match is waiting! 💛" />
      </div>
      <div>
        <label className="label">Message</label>
        <textarea name="description" required rows={4} className="input resize-y" placeholder="Write your push notification…" />
      </div>
      <SubmitButton variant="gold">Send notification</SubmitButton>
    </form>
  );
}
