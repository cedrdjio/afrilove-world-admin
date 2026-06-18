import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, THead, TBody, EmptyRow } from "@/components/ui/Table";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { DeleteStaff } from "@/components/staff/DeleteStaff";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  await requireAdmin();
  const sb = getServiceClient();
  const { data: rows } = await sb
    .from("admin_users")
    .select("id,name,email,role,status,permissions,last_login_at,created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader title="Staff" subtitle="Manage admin & staff accounts and their permissions.">
        <Link href="/staff/new" className="btn-primary"><Plus className="h-4 w-4" /> Add staff</Link>
      </PageHeader>

      <Table>
        <THead columns={[
          { label: "Member" }, { label: "Role" }, { label: "Modules" },
          { label: "Last login" }, { label: "Status" }, { label: "", className: "text-right" },
        ]} />
        <TBody>
          {(rows ?? []).map((s: any) => {
            const moduleCount = s.role === "admin" ? "All" : Object.keys(s.permissions ?? {}).length;
            return (
              <tr key={s.id} className="hover:bg-cream/60">
                <td className="px-5 py-3">
                  <p className="font-semibold text-espresso">{s.name}</p>
                  <p className="text-xs text-espresso-500">{s.email}</p>
                </td>
                <td className="px-5 py-3">
                  {s.role === "admin" ? <Badge tone="gold">Admin</Badge> : <Badge tone="info">Staff</Badge>}
                </td>
                <td className="px-5 py-3 text-espresso-600">{moduleCount}</td>
                <td className="px-5 py-3 text-espresso-500">{s.last_login_at ? formatDate(s.last_login_at) : "Never"}</td>
                <td className="px-5 py-3"><StatusBadge active={!!s.status} /></td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {s.role === "staff" ? (
                      <>
                        <Link href={`/staff/${s.id}/edit`} className="rounded-lg p-2 text-espresso-500 hover:bg-cream hover:text-caramel"><Pencil className="h-4 w-4" /></Link>
                        <DeleteStaff id={s.id} />
                      </>
                    ) : (
                      <span className="text-xs text-espresso-500/50">Protected</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
          {(!rows || rows.length === 0) && <EmptyRow colSpan={6} message="No staff accounts." />}
        </TBody>
      </Table>
    </div>
  );
}
