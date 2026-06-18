"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";
import { completePayout } from "@/lib/actions/payouts";
import { useToast } from "@/components/ui/Toaster";

export function CompletePayout({ id }: { id: number }) {
  const toast = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary px-3 py-1.5 text-xs">
        <CheckCircle2 className="h-4 w-4" /> Complete
      </button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-espresso/50 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-md animate-fade-in p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Complete payout #{id}</h3>
              <button onClick={() => setOpen(false)} className="text-espresso-500 hover:text-espresso"><X className="h-5 w-5" /></button>
            </div>
            <form
              action={(fd) =>
                start(async () => {
                  fd.set("id", String(id));
                  const res = await completePayout(fd);
                  toast(res.ok ? "success" : "error", res.message);
                  if (res.ok) { setOpen(false); router.refresh(); }
                })
              }
              className="space-y-4"
            >
              <div>
                <label className="label">Proof of payment (optional)</label>
                <input name="proof" type="file" accept="image/*" className="input" />
                <p className="mt-1 text-xs text-espresso-500">Upload a screenshot/receipt of the transfer.</p>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
                <button disabled={pending} className="btn-primary">Mark completed</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
