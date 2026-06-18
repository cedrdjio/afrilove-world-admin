"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteStaff } from "@/lib/actions/admin";
import { useToast } from "@/components/ui/Toaster";

export function DeleteStaff({ id }: { id: string }) {
  const toast = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);

  if (confirm) {
    return (
      <span className="flex items-center justify-end gap-1">
        <button disabled={pending} onClick={() => start(async () => {
          const res = await deleteStaff(id);
          toast(res.ok ? "success" : "error", res.message);
          router.refresh();
        })} className="rounded-lg bg-terracotta px-2 py-1 text-xs font-semibold text-white">Confirm</button>
        <button onClick={() => setConfirm(false)} className="rounded-lg px-2 py-1 text-xs text-espresso-500">Cancel</button>
      </span>
    );
  }
  return (
    <button onClick={() => setConfirm(true)} className="rounded-lg p-2 text-espresso-500 hover:bg-terracotta/10 hover:text-terracotta" title="Remove">
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
