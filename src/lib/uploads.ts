/**
 * Upload limits & validation — shared by the client (pre-upload guard rails)
 * and the server (storage.ts). Keep this file free of server-only imports so
 * client components can use it.
 */

export const MAX_UPLOAD_MB = 8;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

export const ALLOWED_IMAGE_LABEL = "JPG, PNG, WEBP, GIF ou SVG";

/** Returns a human error message if the file is invalid, else null. */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `Format non supporté. Autorisés : ${ALLOWED_IMAGE_LABEL}.`;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return `Image trop lourde (${mb} Mo). Maximum ${MAX_UPLOAD_MB} Mo.`;
  }
  return null;
}
