"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";
import { requirePermission } from "@/lib/auth";
import { deleteImageByUrl } from "@/lib/storage";
import { splitGallery } from "@/lib/utils";
import type { ActionResult } from "./resource";

const idSchema = z.coerce.number().int().positive();

/**
 * Remove a single problematic image from a user.
 * `kind` = "profile" clears profile_pic; "gallery" removes one URL from
 * other_pic; "identity" clears the KYC document (and resets verification).
 * The storage object is deleted too when it lives in this project's bucket.
 */
export async function deleteUserImage(form: FormData): Promise<ActionResult> {
  try {
    await requirePermission("ulist", "Update");
  } catch {
    return { ok: false, message: "Permission denied." };
  }

  const parsed = z
    .object({
      userId: idSchema,
      kind: z.enum(["profile", "gallery", "identity"]),
      url: z.string().min(1),
    })
    .safeParse({
      userId: form.get("userId"),
      kind: form.get("kind"),
      url: form.get("url"),
    });
  if (!parsed.success) return { ok: false, message: "Invalid input." };

  const { userId, kind, url } = parsed.data;
  const sb = getServiceClient();

  const { data: user, error } = await sb
    .from("users")
    .select("profile_pic, other_pic, identity_picture")
    .eq("id", userId)
    .maybeSingle();
  if (error || !user) return { ok: false, message: "User not found." };

  const patch: Record<string, unknown> = {};
  if (kind === "profile") {
    patch.profile_pic = null;
  } else if (kind === "identity") {
    patch.identity_picture = null;
    patch.is_verify = 3; // mark as rejected when the document is removed
  } else {
    const remaining = splitGallery(user.other_pic).filter((u) => u !== url);
    patch.other_pic = remaining.length ? remaining.join("|") : null;
  }

  const { error: updErr } = await sb.from("users").update(patch).eq("id", userId);
  if (updErr) return { ok: false, message: updErr.message };

  await deleteImageByUrl(url);

  revalidatePath("/media");
  revalidatePath(`/users/${userId}`);
  revalidatePath("/verification");
  return { ok: true, message: "Image supprimée." };
}
