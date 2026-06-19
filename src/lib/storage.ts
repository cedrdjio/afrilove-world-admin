import "server-only";
import { getServiceClient } from "./supabase";
import { validateImageFile } from "./uploads";

const BUCKET = "media";

/**
 * Upload an image File to Supabase Storage and return its public URL.
 * Validates MIME type and size — fixing the legacy unrestricted file upload.
 */
export async function uploadImage(file: File, folder = "uploads"): Promise<string> {
  const invalid = validateImageFile(file);
  if (invalid) throw new Error(invalid);

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const key = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const sb = getServiceClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await sb.storage.from(BUCKET).upload(key, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = sb.storage.from(BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

/**
 * Delete an image from Supabase Storage given its public URL.
 * Safely no-ops for URLs that don't belong to this project's storage
 * (e.g. images hosted elsewhere) — the caller still clears the DB reference.
 * Returns true if a storage object was removed.
 */
export async function deleteImageByUrl(url: string | null | undefined): Promise<boolean> {
  if (!url) return false;
  // Public storage URLs look like:
  //   https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const marker = "/storage/v1/object/public/";
  const idx = url.indexOf(marker);
  if (idx === -1) return false;

  const rest = url.slice(idx + marker.length); // "<bucket>/<path>"
  const slash = rest.indexOf("/");
  if (slash === -1) return false;
  const bucket = rest.slice(0, slash);
  const path = decodeURIComponent(rest.slice(slash + 1));
  if (!path) return false;

  const sb = getServiceClient();
  const { error } = await sb.storage.from(bucket).remove([path]);
  if (error) {
    // Don't block the moderation action if storage cleanup fails.
    console.error("[storage] delete failed:", error.message);
    return false;
  }
  return true;
}

