"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserStatus, setVerifyStatus } from "@/lib/actions/users";
import { useToast } from "@/components/ui/Toaster";

export function UserStatusToggle({ id, status, canEdit }: { id: number; status: boolean; canEdit: boolean }) {
  const toast = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  if (!canEdit) return <span>{status ? "Active" : "Inactive"}</span>;
  return (
    <button
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await setUserStatus(id, !status);
          toast(res.ok ? "success" : "error", res.message);
          router.refresh();
        })
      }
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${status ? "bg-success" : "bg-espresso-500/25"} disabled:opacity-50`}
      title={status ? "Active — click to deactivate" : "Inactive — click to activate"}
    >
      <span className={`absolute h-5 w-5 rounded-full bg-white shadow transition ${status ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

export function VerifyActions({ id, verify, canEdit }: { id: number; verify: number; canEdit: boolean }) {
  const toast = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();

  const act = (v: number) =>
    start(async () => {
      const res = await setVerifyStatus(id, v);
      toast(res.ok ? "success" : "error", res.message);
      router.refresh();
    });

  if (verify === 2) return <span className="text-xs font-semibold text-success">Verified</span>;
  if (verify === 3) return <span className="text-xs font-semibold text-terracotta">Rejected</span>;
  if (verify === 0) return <span className="text-xs text-espresso-500/60">No document</span>;

  // pending review
  if (!canEdit) return <span className="text-xs text-gold">Pending</span>;
  return (
    <div className="flex items-center gap-1.5">
      <button disabled={pending} onClick={() => act(2)} className="rounded-lg bg-success/10 px-2 py-1 text-xs font-semibold text-success hover:bg-success/20">
        Approve
      </button>
      <button disabled={pending} onClick={() => act(3)} className="rounded-lg bg-terracotta/10 px-2 py-1 text-xs font-semibold text-terracotta hover:bg-terracotta/20">
        Reject
      </button>
    </div>
  );
}
