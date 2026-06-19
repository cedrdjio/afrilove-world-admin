import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { getServiceClient } from "@/lib/supabase";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { VerifyActions } from "@/components/users/UserActions";
import { DeletableImage } from "@/components/media/DeletableImage";
import { initials, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "pending", label: "En attente", verify: 1, tone: "warning" as const },
  { key: "approved", label: "Approuvés", verify: 2, tone: "success" as const },
  { key: "rejected", label: "Rejetés", verify: 3, tone: "danger" as const },
];

export default async function VerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "pending" } = await searchParams;
  const me = await requirePermission("ulist", "Read");
  const canEdit = can(me, "ulist", "Update");

  const active = TABS.find((t) => t.key === status) ?? TABS[0];

  const sb = getServiceClient();
  const { data: users } = await sb
    .from("users")
    .select("id,name,gender,birth_date,identity_picture,is_verify,rdate")
    .eq("is_verify", active.verify)
    .not("identity_picture", "is", null)
    .order("rdate", { ascending: false })
    .limit(60);

  // counts for the tab badges
  const counts = await Promise.all(
    TABS.map(async (t) => {
      const { count } = await sb
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("is_verify", t.verify)
        .not("identity_picture", "is", null);
      return count ?? 0;
    }),
  );

  const rows = users ?? [];

  return (
    <div>
      <PageHeader
        title="Vérification KYC"
        subtitle="Documents d'identité soumis par les membres. Approuvez, rejetez ou supprimez un document."
      />

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t, i) => (
          <Link
            key={t.key}
            href={`/verification?status=${t.key}`}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              t.key === active.key ? "bg-brand-gradient text-white shadow-soft" : "bg-white text-espresso-600 hover:bg-cream"
            }`}
          >
            {t.label}
            <span className={`rounded-full px-1.5 text-xs ${t.key === active.key ? "bg-white/20" : "bg-espresso-500/10"}`}>
              {counts[i]}
            </span>
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-16 text-center">
          <ShieldCheck className="h-10 w-10 text-espresso-500/40" />
          <p className="text-espresso-500">Aucun document « {active.label.toLowerCase()} ».</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((u) => (
            <div key={u.id} className="card overflow-hidden">
              <div className="relative">
                <DeletableImage
                  userId={u.id}
                  url={u.identity_picture as string}
                  kind="identity"
                  label="Document"
                  canDelete={canEdit}
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-gradient text-[0.65rem] font-bold text-white">
                    {initials(u.name)}
                  </span>
                  <div className="min-w-0">
                    <Link href={`/users/${u.id}`} className="block truncate text-sm font-semibold text-espresso hover:text-caramel">
                      {u.name || `#${u.id}`}
                    </Link>
                    <p className="text-xs text-espresso-500">{u.gender || "—"} · {formatDate(u.rdate)}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge tone={active.tone}>{active.label}</Badge>
                  <VerifyActions id={u.id} verify={u.is_verify} canEdit={canEdit} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
