"use client";

import { useRef, useState } from "react";
import { UploadCloud, AlertCircle, X } from "lucide-react";
import { validateImageFile, MAX_UPLOAD_MB, ALLOWED_IMAGE_LABEL } from "@/lib/uploads";
import { cn } from "@/lib/utils";

/**
 * Guard-railed image picker used across every form. Validates type & size on
 * the client BEFORE the server action runs, so users get a clear message
 * instead of a raw "Body exceeded 1 MB limit" 413.
 *
 * Emits two form fields:
 *   - `name`              the selected File (empty if unchanged)
 *   - `name`_existing     the current URL, so the server keeps it when no new
 *                         file is chosen
 */
export function ImageInput({
  name,
  defaultValue,
  required = false,
  help,
}: {
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  help?: string;
}) {
  const [preview, setPreview] = useState<string | null>(defaultValue ?? null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const invalid = validateImageFile(file);
    if (invalid) {
      setError(invalid);
      e.target.value = ""; // reject — don't let it reach the server
      return;
    }
    setPreview(URL.createObjectURL(file));
  }

  function clear() {
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <input type="hidden" name={`${name}_existing`} value={defaultValue ?? ""} />
      <div className="flex items-center gap-4">
        <div className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-espresso-500/10 bg-cream">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <UploadCloud className="h-6 w-6 text-espresso-500/40" />
          )}
          {preview && (
            <button type="button" onClick={clear} title="Retirer"
              className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-espresso/70 text-white">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <div>
          <button type="button" onClick={() => inputRef.current?.click()} className="btn-outline">
            Choisir une image
          </button>
          <p className="mt-1 text-xs text-espresso-500">{ALLOWED_IMAGE_LABEL}. Max {MAX_UPLOAD_MB} Mo.</p>
          {help && <p className="text-xs text-espresso-500">{help}</p>}
        </div>
        <input
          ref={inputRef}
          name={name}
          type="file"
          accept="image/*"
          required={required && !defaultValue}
          className="hidden"
          onChange={onChange}
        />
      </div>
      {error && (
        <p className={cn("mt-2 flex items-center gap-1.5 text-xs font-medium text-terracotta")}>
          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
