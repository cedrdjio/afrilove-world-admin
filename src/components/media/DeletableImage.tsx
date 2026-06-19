"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, ExternalLink } from "lucide-react";
import { deleteUserImage } from "@/lib/actions/media";
import { useToast } from "@/components/ui/Toaster";

export function DeletableImage({
  userId,
  url,
  kind,
  label,
  canDelete,
}: {
  userId: number;
  url: string;
  kind: "profile" | "gallery" | "identity";
  label?: string;
  canDelete: boolean;
}) {
  const toast = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const onDelete = () =>
    start(async () => {
      const fd = new FormData();
      fd.set("userId", String(userId));
      fd.set("kind", kind);
      fd.set("url", url);
      const res = await deleteUserImage(fd);
      toast(res.ok ? "success" : "error", res.message);
      setConfirming(false);
      router.refresh();
    });

  return (
    <div className="group relative overflow-hidden rounded-xl border border-espresso-500/10 bg-cream">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={label ?? ""} className="aspect-square w-full object-cover" loading="lazy" />

      {label && (
        <span className="absolute left-2 top-2 rounded-md bg-espresso/70 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-white">
          {label}
        </span>
      )}

      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="absolute right-2 top-2 rounded-md bg-white/80 p-1.5 text-espresso opacity-0 transition group-hover:opacity-100"
        title="Ouvrir en grand"
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </a>

      {canDelete && (
        <div className="absolute inset-x-0 bottom-0 p-2">
          {confirming ? (
            <div className="flex items-center gap-1.5 rounded-lg bg-espresso/85 p-1.5 backdrop-blur">
              <AlertTriangle className="h-4 w-4 shrink-0 text-gold" />
              <button onClick={onDelete} disabled={pending} className="flex-1 rounded-md bg-terracotta px-2 py-1 text-xs font-semibold text-white">
                Supprimer
              </button>
              <button onClick={() => setConfirming(false)} className="rounded-md px-2 py-1 text-xs text-white/80">
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-terracotta/90 py-1.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" /> Supprimer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
