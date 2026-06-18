"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";
import { requirePermission } from "@/lib/auth";
import { uploadImage } from "@/lib/storage";
import { getResource, type ResourceField } from "@/lib/resources";

export interface ActionResult {
  ok: boolean;
  message: string;
}

/** Coerce a single form value according to its field type (with validation). */
async function readField(field: ResourceField, form: FormData): Promise<unknown | undefined> {
  switch (field.type) {
    case "text": {
      const v = String(form.get(field.name) ?? "").trim();
      if (field.required && !v) throw new Error(`${field.label} is required.`);
      return v;
    }
    case "textarea": {
      return String(form.get(field.name) ?? "").trim();
    }
    case "number": {
      const raw = String(form.get(field.name) ?? "").trim();
      if (!raw) {
        if (field.required) throw new Error(`${field.label} is required.`);
        return 0;
      }
      const n = Number(raw);
      if (Number.isNaN(n)) throw new Error(`${field.label} must be a number.`);
      return n;
    }
    case "switch":
    case "status": {
      // checkbox / select returns "on", "true", "1" when enabled
      const raw = form.get(field.name);
      return raw === "on" || raw === "true" || raw === "1";
    }
    case "image": {
      const file = form.get(field.name);
      if (file instanceof File && file.size > 0) {
        return await uploadImage(file, field.name);
      }
      // fallback: keep existing URL passed via hidden input
      const existing = String(form.get(`${field.name}_existing`) ?? "").trim();
      if (field.required && !existing) throw new Error(`${field.label} is required.`);
      return existing || undefined;
    }
  }
}

async function buildPayload(slug: string, form: FormData) {
  const resource = getResource(slug);
  if (!resource) throw new Error("Unknown resource.");
  const payload: Record<string, unknown> = {};
  for (const field of resource.fields) {
    const value = await readField(field, form);
    if (value !== undefined) payload[field.name] = value;
  }
  return { resource, payload };
}

export async function saveResource(slug: string, _prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const resource = getResource(slug);
  if (!resource) return { ok: false, message: "Unknown resource." };

  const idRaw = String(form.get("id") ?? "").trim();
  const isEdit = idRaw.length > 0;

  try {
    await requirePermission(resource.module, isEdit ? "Update" : "Write");
  } catch {
    return { ok: false, message: "You do not have permission to do that." };
  }

  let payload: Record<string, unknown>;
  try {
    ({ payload } = await buildPayload(slug, form));
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Invalid input." };
  }

  const sb = getServiceClient();
  if (isEdit) {
    const id = z.coerce.number().int().safeParse(idRaw);
    if (!id.success) return { ok: false, message: "Invalid id." };
    const { error } = await sb.from(resource.table).update(payload).eq("id", id.data);
    if (error) return { ok: false, message: error.message };
  } else {
    const { error } = await sb.from(resource.table).insert(payload);
    if (error) return { ok: false, message: error.message };
  }

  revalidatePath(`/${slug}`);
  return { ok: true, message: `${resource.singular} ${isEdit ? "updated" : "created"} successfully.` };
}

export async function deleteResource(slug: string, id: number): Promise<ActionResult> {
  const resource = getResource(slug);
  if (!resource) return { ok: false, message: "Unknown resource." };
  try {
    await requirePermission(resource.module, "Update");
  } catch {
    return { ok: false, message: "You do not have permission to do that." };
  }
  const parsed = z.coerce.number().int().safeParse(id);
  if (!parsed.success) return { ok: false, message: "Invalid id." };

  const sb = getServiceClient();
  const { error } = await sb.from(resource.table).delete().eq("id", parsed.data);
  if (error) return { ok: false, message: error.message };
  revalidatePath(`/${slug}`);
  return { ok: true, message: `${resource.singular} deleted.` };
}

export async function toggleResourceStatus(slug: string, id: number, status: boolean): Promise<ActionResult> {
  const resource = getResource(slug);
  if (!resource) return { ok: false, message: "Unknown resource." };
  try {
    await requirePermission(resource.module, "Update");
  } catch {
    return { ok: false, message: "You do not have permission to do that." };
  }
  const parsed = z.coerce.number().int().safeParse(id);
  if (!parsed.success) return { ok: false, message: "Invalid id." };

  const sb = getServiceClient();
  const { error } = await sb.from(resource.table).update({ status }).eq("id", parsed.data);
  if (error) return { ok: false, message: error.message };
  revalidatePath(`/${slug}`);
  return { ok: true, message: "Status updated." };
}
