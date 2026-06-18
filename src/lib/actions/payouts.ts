"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";
import { requirePermission } from "@/lib/auth";
import { uploadImage } from "@/lib/storage";
import type { ActionResult } from "./resource";

export async function completePayout(form: FormData): Promise<ActionResult> {
  try {
    await requirePermission("payout", "Update");
  } catch {
    return { ok: false, message: "Permission denied." };
  }

  const id = z.coerce.number().int().positive().safeParse(form.get("id"));
  if (!id.success) return { ok: false, message: "Invalid id." };

  let proofUrl: string | undefined;
  const proof = form.get("proof");
  if (proof instanceof File && proof.size > 0) {
    try {
      proofUrl = await uploadImage(proof, "payouts");
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : "Upload failed." };
    }
  }

  const sb = getServiceClient();
  const patch: Record<string, unknown> = { status: "completed" };
  if (proofUrl) patch.proof = proofUrl;
  const { error } = await sb.from("payouts").update(patch).eq("id", id.data);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/payouts");
  return { ok: true, message: "Payout marked as completed." };
}
