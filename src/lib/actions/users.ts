"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";
import { requirePermission } from "@/lib/auth";
import type { ActionResult } from "./resource";

const idSchema = z.coerce.number().int().positive();

export async function setUserStatus(id: number, status: boolean): Promise<ActionResult> {
  try {
    await requirePermission("ulist", "Update");
  } catch {
    return { ok: false, message: "Permission denied." };
  }
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, message: "Invalid id." };

  const sb = getServiceClient();
  const { error } = await sb.from("users").update({ status }).eq("id", parsed.data);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/users");
  return { ok: true, message: `User ${status ? "activated" : "deactivated"}.` };
}

export async function setVerifyStatus(id: number, verify: number): Promise<ActionResult> {
  try {
    await requirePermission("ulist", "Update");
  } catch {
    return { ok: false, message: "Permission denied." };
  }
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, message: "Invalid id." };
  if (![0, 1, 2, 3].includes(verify)) return { ok: false, message: "Invalid status." };

  const sb = getServiceClient();
  // On reject, clear the uploaded identity document (legacy behaviour).
  const patch: Record<string, unknown> = { is_verify: verify };
  if (verify === 3) patch.identity_picture = null;
  const { error } = await sb.from("users").update(patch).eq("id", parsed.data);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/users");
  revalidatePath(`/users/${parsed.data}`);
  return { ok: true, message: "Verification status updated." };
}

const balanceSchema = z.object({
  id: idSchema,
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  op: z.enum(["add", "sub"]),
  kind: z.enum(["wallet", "coin"]),
  note: z.string().max(200).optional(),
});

/** Adjust a user's wallet or coin balance and write a transaction log row. */
export async function adjustBalance(form: FormData): Promise<ActionResult> {
  const kind = String(form.get("kind"));
  const module = kind === "coin" ? "coin" : "wallet";
  try {
    await requirePermission(module, "Update");
  } catch {
    return { ok: false, message: "Permission denied." };
  }

  const parsed = balanceSchema.safeParse({
    id: form.get("id"),
    amount: form.get("amount"),
    op: form.get("op"),
    kind: form.get("kind"),
    note: form.get("note") ?? undefined,
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { id, amount, op, note } = parsed.data;
  const field = parsed.data.kind; // 'wallet' | 'coin'
  const reportTable = parsed.data.kind === "coin" ? "coin_reports" : "wallet_reports";

  const sb = getServiceClient();
  const { data: user, error: readErr } = await sb.from("users").select(`id,${field}`).eq("id", id).maybeSingle();
  if (readErr || !user) return { ok: false, message: "User not found." };

  const current = Number((user as any)[field] || 0);
  const delta = op === "add" ? amount : -amount;
  const next = current + delta;
  if (next < 0) return { ok: false, message: "Insufficient balance." };

  const { error: updErr } = await sb.from("users").update({ [field]: next }).eq("id", id);
  if (updErr) return { ok: false, message: updErr.message };

  await sb.from(reportTable).insert({
    uid: id,
    amt: amount,
    status: op === "add" ? "Credit" : "Debit",
    message: note || (op === "add" ? "Admin credit" : "Admin debit"),
  });

  revalidatePath(`/users/${id}`);
  return { ok: true, message: `${parsed.data.kind === "coin" ? "Coins" : "Wallet"} updated successfully.` };
}
