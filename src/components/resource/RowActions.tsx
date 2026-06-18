"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Power } from "lucide-react";
import { deleteResource, toggleResourceStatus } from "@/lib/actions/resource";
import { useToast } from "@/components/ui/Toaster";

export function RowActions({
  slug,
  id,
  status,
  canEdit,
}: {
  slug: string;
  id: number;
  status: boolean;
  canEdit: boolean;
}) {
  const toast = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (!canEdit) return <span className="text-xs text-espresso-500/50">—</span>;

  const onToggle = () =>
    start(async () => {
      const res = await toggleResourceStatus(slug, id, !status);
      toast(res.ok ? "success" : "error", res.message);
      router.refresh();
    });

  const onDelete = () =>
    start(async () => {
      const res = await deleteResource(slug, id);
      toast(res.ok ? "success" : "error", res.message);
      setConfirming(false);
      router.refresh();
    });

  return (
    <div className="flex items-center justify-end gap-1">
      <button onClick={onToggle} disabled={pending} title={status ? "Deactivate" : "Activate"}
        className="rounded-lg p-2 text-espresso-500 transition hover:bg-cream hover:text-caramel disabled:opacity-50">
        <Power className="h-4 w-4" />
      </button>
      <Link href={`/${slug}/${id}/edit`} title="Edit"
        className="rounded-lg p-2 text-espresso-500 transition hover:bg-cream hover:text-caramel">
        <Pencil className="h-4 w-4" />
      </Link>
      {confirming ? (
        <span className="flex items-center gap-1">
          <button onClick={onDelete} disabled={pending} className="rounded-lg bg-terracotta px-2 py-1 text-xs font-semibold text-white">
            Confirm
          </button>
          <button onClick={() => setConfirming(false)} className="rounded-lg px-2 py-1 text-xs text-espresso-500">
            Cancel
          </button>
        </span>
      ) : (
        <button onClick={() => setConfirming(true)} title="Delete"
          className="rounded-lg p-2 text-espresso-500 transition hover:bg-terracotta/10 hover:text-terracotta">
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
