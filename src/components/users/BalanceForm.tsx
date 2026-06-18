"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus } from "lucide-react";
import { adjustBalance } from "@/lib/actions/users";
import { useToast } from "@/components/ui/Toaster";

export function BalanceForm({ userId, kind }: { userId: number; kind: "wallet" | "coin" }) {
  const toast = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [op, setOp] = useState<"add" | "sub">("add");

  return (
    <form
      action={(fd) =>
        start(async () => {
          fd.set("id", String(userId));
          fd.set("kind", kind);
          fd.set("op", op);
          const res = await adjustBalance(fd);
          toast(res.ok ? "success" : "error", res.message);
          if (res.ok) router.refresh();
        })
      }
      className="space-y-3"
    >
      <div className="flex gap-1 rounded-xl bg-cream p-1">
        <button type="button" onClick={() => setOp("add")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-semibold transition ${op === "add" ? "bg-success text-white shadow-soft" : "text-espresso-500"}`}>
          <Plus className="h-4 w-4" /> Add
        </button>
        <button type="button" onClick={() => setOp("sub")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-semibold transition ${op === "sub" ? "bg-terracotta text-white shadow-soft" : "text-espresso-500"}`}>
          <Minus className="h-4 w-4" /> Subtract
        </button>
      </div>
      <input name="amount" type="number" step="any" min="0" required placeholder={`${kind === "coin" ? "Coins" : "Amount"}`} className="input" />
      <input name="note" type="text" maxLength={200} placeholder="Note (optional)" className="input" />
      <button disabled={pending} className="btn-primary w-full">
        {op === "add" ? "Credit" : "Debit"} {kind === "coin" ? "coins" : "wallet"}
      </button>
    </form>
  );
}
