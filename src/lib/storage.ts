import "server-only";
import { getServiceClient } from "./supabase";

const BUCKET = "media";
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Upload an image File to Supabase Storage and return its public URL.
 * Validates MIME type and size — fixing the legacy unrestricted file upload.
 */
export async function uploadImage(file: File, folder = "uploads"): Promise<string> {
  if (!ALLOWED.includes(file.type)) {
    throw new Error("Unsupported file type. Allowed: JPG, PNG, WEBP, GIF, SVG.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("File too large (max 5MB).");
  }

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
