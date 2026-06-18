import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { getResource } from "@/lib/resources";
import { getServiceClient } from "@/lib/supabase";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, THead, TBody, EmptyRow } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { RowActions } from "@/components/resource/RowActions";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ResourceListPage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource: slug } = await params;
  const resource = getResource(slug);
  if (!resource) notFound();

  const user = await requirePermission(resource.module, "Read");
  const canWrite = can(user, resource.module, "Write");
  const canUpdate = can(user, resource.module, "Update");

  const sb = getServiceClient();
  const { data: rows } = await sb.from(resource.table).select("*").order("id", { ascending: false });

  const listFields = resource.fields.filter((f) => !f.listHidden && f.type !== "switch");
  const columns = [
    { label: "#" },
    ...listFields.map((f) => ({ label: f.label })),
    { label: "Actions", className: "text-right" },
  ];

  return (
    <div>
      <PageHeader title={resource.plural} subtitle={`Manage ${resource.plural.toLowerCase()} shown in the AfriLove app.`}>
        {canWrite && (
          <Link href={`/${slug}/new`} className="btn-primary">
            <Plus className="h-4 w-4" /> Add {resource.singular.toLowerCase()}
          </Link>
        )}
      </PageHeader>

      <Table>
        <THead columns={columns} />
        <TBody>
          {(rows ?? []).map((row) => (
            <tr key={row.id} className="hover:bg-cream/60">
              <td className="px-5 py-3 font-mono text-xs text-espresso-500">{row.id}</td>
              {listFields.map((f) => (
                <td key={f.name} className="px-5 py-3">
                  <Cell field={f.name} type={f.type} value={row[f.name]} />
                </td>
              ))}
              <td className="px-5 py-3 text-right">
                <RowActions slug={slug} id={row.id} status={!!row.status} canEdit={canUpdate} />
              </td>
            </tr>
          ))}
          {(!rows || rows.length === 0) && <EmptyRow colSpan={columns.length} message={`No ${resource.plural.toLowerCase()} yet.`} />}
        </TBody>
      </Table>
    </div>
  );
}

function Cell({ field, type, value }: { field: string; type: string; value: any }) {
  if (type === "status") return <StatusBadge active={!!value} />;
  if (type === "image") {
    return value ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={value} alt="" className="h-10 w-10 rounded-lg border border-espresso-500/10 object-cover" />
    ) : (
      <span className="text-espresso-500/40">—</span>
    );
  }
  if (type === "number") {
    if (field === "amt" || field === "price") return <span className="font-semibold">{formatCurrency(value)}</span>;
    return <span className="font-semibold">{Number(value ?? 0).toLocaleString()}</span>;
  }
  return <span className="text-espresso-600">{value ? String(value) : "—"}</span>;
}
