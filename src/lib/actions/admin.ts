"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";
import { requireAdmin, requirePermission, hashPassword, getCurrentUser, createSession } from "@/lib/auth";
import { MODULES, type PermissionMap, type ModuleKey, type PermAction } from "@/lib/permissions";
import { uploadImage } from "@/lib/storage";
import type { ActionResult } from "./resource";

// ─── Staff management (admin only) ─────────────────────────────────────────
const staffSchema = z.object({
  email: z.string().email("Enter a valid email."),
  name: z.string().min(1, "Name is required.").max(120),
  status: z.boolean(),
});

export async function saveStaff(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, message: "Admins only." };
  }

  const idRaw = String(form.get("id") ?? "").trim();
  const isEdit = idRaw.length > 0;

  const parsed = staffSchema.safeParse({
    email: form.get("email"),
    name: form.get("name"),
    status: form.get("status") === "true" || form.get("status") === "on",
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  // Build the permission map from the matrix checkboxes (module:action)
  const permissions: PermissionMap = {};
  for (const mod of MODULES) {
    const granted: PermAction[] = [];
    for (const action of mod.actions) {
      if (form.get(`perm_${mod.key}_${action}`)) granted.push(action);
    }
    if (granted.length) permissions[mod.key] = granted;
  }

  const password = String(form.get("password") ?? "");
  const sb = getServiceClient();

  if (isEdit) {
    const patch: Record<string, unknown> = {
      email: parsed.data.email.toLowerCase(),
      name: parsed.data.name,
      status: parsed.data.status,
      permissions,
    };
    if (password) {
      if (password.length < 8) return { ok: false, message: "Password must be at least 8 characters." };
      patch.password_hash = await hashPassword(password);
    }
    const { error } = await sb.from("admin_users").update(patch).eq("id", idRaw).eq("role", "staff");
    if (error) return { ok: false, message: error.message };
  } else {
    if (password.length < 8) return { ok: false, message: "Password must be at least 8 characters." };
    const { error } = await sb.from("admin_users").insert({
      email: parsed.data.email.toLowerCase(),
      name: parsed.data.name,
      status: parsed.data.status,
      role: "staff",
      permissions,
      password_hash: await hashPassword(password),
    });
    if (error) {
      return { ok: false, message: error.message.includes("duplicate") ? "That email is already in use." : error.message };
    }
  }

  revalidatePath("/staff");
  return { ok: true, message: `Staff member ${isEdit ? "updated" : "created"}.` };
}

export async function deleteStaff(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, message: "Admins only." };
  }
  const sb = getServiceClient();
  const { error } = await sb.from("admin_users").delete().eq("id", id).eq("role", "staff");
  if (error) return { ok: false, message: error.message };
  revalidatePath("/staff");
  return { ok: true, message: "Staff member removed." };
}

// ─── Global settings (admin only) ──────────────────────────────────────────
export async function saveSettings(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, message: "Admins only." };
  }

  const textFields = [
    "webname", "timezone", "currency", "mode", "fmode", "admob", "banner_id", "in_id",
    "ios_banner_id", "ios_in_id", "one_key", "one_hash", "sms_type", "auth_key", "otp_id",
    "acc_id", "auth_token", "twilio_number", "map_key", "otp_auth", "agora_app_id", "coin_fun",
  ];
  const patch: Record<string, unknown> = {};
  for (const f of textFields) {
    const v = form.get(f);
    if (v !== null) patch[f] = String(v);
  }
  patch.coin_amt = Number(form.get("coin_amt") ?? 0) || 0;
  patch.coin_limit = Math.trunc(Number(form.get("coin_limit") ?? 0) || 0);
  patch.scredit = Number(form.get("scredit") ?? 0) || 0;
  patch.updated_at = new Date().toISOString();

  const logo = form.get("weblogo");
  if (logo instanceof File && logo.size > 0) {
    try {
      patch.weblogo = await uploadImage(logo, "branding");
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : "Logo upload failed." };
    }
  }

  const sb = getServiceClient();
  const { error } = await sb.from("settings").update(patch).eq("id", 1);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/settings");
  return { ok: true, message: "Settings saved." };
}

// ─── Payment gateway (Read/Update) ─────────────────────────────────────────
export async function savePaymentGateway(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  try {
    await requirePermission("plist", "Update");
  } catch {
    return { ok: false, message: "Permission denied." };
  }
  const id = z.coerce.number().int().positive().safeParse(form.get("id"));
  if (!id.success) return { ok: false, message: "Invalid id." };

  let attributes: unknown = {};
  const attrRaw = String(form.get("attributes") ?? "").trim();
  if (attrRaw) {
    try {
      attributes = JSON.parse(attrRaw);
    } catch {
      return { ok: false, message: "Attributes must be valid JSON." };
    }
  }

  const patch: Record<string, unknown> = {
    subtitle: String(form.get("subtitle") ?? ""),
    attributes,
    status: form.get("status") === "true" || form.get("status") === "on",
    p_show: form.get("p_show") === "true" || form.get("p_show") === "on",
  };
  const img = form.get("img");
  if (img instanceof File && img.size > 0) {
    try {
      patch.img = await uploadImage(img, "gateways");
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : "Upload failed." };
    }
  }

  const sb = getServiceClient();
  const { error } = await sb.from("payment_gateways").update(patch).eq("id", id.data);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/payments");
  return { ok: true, message: "Payment gateway updated." };
}

// ─── Admin profile (self) ──────────────────────────────────────────────────
export async function updateProfile(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const me = await getCurrentUser();
  if (!me) return { ok: false, message: "Not authenticated." };

  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  if (!name) return { ok: false, message: "Name is required." };
  if (!z.string().email().safeParse(email).success) return { ok: false, message: "Enter a valid email." };

  const patch: Record<string, unknown> = { name, email };
  if (password) {
    if (password.length < 8) return { ok: false, message: "Password must be at least 8 characters." };
    patch.password_hash = await hashPassword(password);
  }

  const sb = getServiceClient();
  const { error } = await sb.from("admin_users").update(patch).eq("id", me.id);
  if (error) {
    return { ok: false, message: error.message.includes("duplicate") ? "That email is already in use." : error.message };
  }

  // Refresh the session so the topbar reflects the new name/email.
  await createSession({ ...me, name, email });
  revalidatePath("/profile");
  return { ok: true, message: "Profile updated." };
}

// ─── Push notifications ────────────────────────────────────────────────────
export async function sendNotification(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  try {
    await requirePermission("notification", "Write");
  } catch {
    return { ok: false, message: "Permission denied." };
  }

  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const audience = String(form.get("audience") ?? "all");
  if (!title) return { ok: false, message: "Title is required." };
  if (!description) return { ok: false, message: "Message is required." };

  const sb = getServiceClient();

  // Resolve recipients
  let userQuery = sb.from("users").select("id");
  if (audience === "premium") userQuery = userQuery.eq("is_subscribe", true);
  if (audience === "free") userQuery = userQuery.eq("is_subscribe", false);
  const { data: recipients } = await userQuery;
  const ids = (recipients ?? []).map((r) => r.id);

  if (ids.length === 0) return { ok: false, message: "No recipients match that audience." };

  // Persist a notification row per user (chunked to stay within payload limits).
  const rows = ids.map((uid) => ({ uid, title, description }));
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await sb.from("notifications").insert(rows.slice(i, i + 500));
    if (error) return { ok: false, message: error.message };
  }

  // Best-effort OneSignal delivery if configured.
  let delivered = false;
  if (process.env.ONESIGNAL_APP_ID && process.env.ONESIGNAL_REST_API_KEY) {
    try {
      const res = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        },
        body: JSON.stringify({
          app_id: process.env.ONESIGNAL_APP_ID,
          included_segments: ["Subscribed Users"],
          headings: { en: title },
          contents: { en: description },
        }),
      });
      delivered = res.ok;
    } catch {
      delivered = false;
    }
  }

  return {
    ok: true,
    message: `Notification queued for ${ids.length.toLocaleString()} user(s)${delivered ? " and pushed via OneSignal" : ""}.`,
  };
}
