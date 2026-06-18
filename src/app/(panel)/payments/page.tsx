import Link from "next/link";
import { Pencil } from "lucide-react";
import { getServiceClient } from "@/lib/supabase";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, THead, TBody, EmptyRow } from "@/components/ui/Table";
import { Badge, StatusBadge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const me = await requirePermission("plist", "Read");
  const canUpdate = can(me, "plist", "Update");

  const sb = getServiceClient();
  const { data: rows } = await sb.from("payment_gateways").select("*").order("id");

  return (
    <div>
      <PageHeader title="Payment gateways" subtitle="Enable and configure the payment providers shown in the app wallet." />
      <Table>
        <THead columns={[
          { label: "Gateway" }, { label: "Status" }, { label: "On wallet" },
          { label: "", className: "text-right" },
        ]} />
        <TBody>
          {(rows ?? []).map((g) => (
            <tr key={g.id} className="hover:bg-cream/60">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  {g.img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={g.img} alt="" className="h-9 w-9 rounded-lg border border-espresso-500/10 object-contain bg-white p-1" />
                  ) : (
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-cream text-xs font-bold text-espresso-500">{g.title?.[0]}</span>
                  )}
                  <div>
                    <p className="font-semibold text-espresso">{g.title}</p>
                    <p className="text-xs text-espresso-500">{g.subtitle || "—"}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3"><StatusBadge active={!!g.status} /></td>
              <td className="px-5 py-3">{g.p_show ? <Badge tone="success">Visible</Badge> : <Badge tone="neutral">Hidden</Badge>}</td>
              <td className="px-5 py-3 text-right">
                {canUpdate ? (
                  <Link href={`/payments/${g.id}/edit`} className="inline-flex rounded-lg p-2 text-espresso-500 hover:bg-cream hover:text-caramel">
                    <Pencil className="h-4 w-4" />
                  </Link>
                ) : <span className="text-espresso-500/40">—</span>}
              </td>
            </tr>
          ))}
          {(!rows || rows.length === 0) && <EmptyRow colSpan={4} message="No payment gateways configured. Insert rows into the payment_gateways table." />}
        </TBody>
      </Table>
    </div>
  );
}
