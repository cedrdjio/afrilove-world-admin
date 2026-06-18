import Link from "next/link";
import { getServiceClient } from "@/lib/supabase";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, THead, TBody, EmptyRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { CompletePayout } from "@/components/payouts/CompletePayout";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PayoutsPage() {
  const me = await requirePermission("payout", "Read");
  const canUpdate = can(me, "payout", "Update");

  const sb = getServiceClient();
  const { data: rows } = await sb
    .from("payouts")
    .select("*, user:uid(id,name,email)")
    .order("r_date", { ascending: false })
    .limit(200);

  return (
    <div>
      <PageHeader title="Payouts" subtitle="Withdrawal requests from members." />
      <Table>
        <THead columns={[
          { label: "User" }, { label: "Method" }, { label: "Amount" },
          { label: "Requested" }, { label: "Status" }, { label: "Proof" },
          { label: "", className: "text-right" },
        ]} />
        <TBody>
          {(rows ?? []).map((p: any) => (
            <tr key={p.id} className="hover:bg-cream/60">
              <td className="px-5 py-3">
                {p.user ? (
                  <Link href={`/users/${p.user.id}`} className="font-semibold text-caramel hover:underline">
                    {p.user.name || p.user.email || `#${p.user.id}`}
                  </Link>
                ) : "—"}
              </td>
              <td className="px-5 py-3">
                <p className="font-medium text-espresso-600">{p.r_type || "—"}</p>
                <p className="text-xs text-espresso-500">
                  {p.upi_id || p.paypal_id || p.acc_number || p.bank_name || ""}
                </p>
              </td>
              <td className="px-5 py-3 font-semibold">{formatCurrency(p.amt)}</td>
              <td className="px-5 py-3 text-espresso-600">{formatDate(p.r_date)}</td>
              <td className="px-5 py-3">
                {p.status === "completed" ? <Badge tone="success">Completed</Badge> : <Badge tone="warning">Pending</Badge>}
              </td>
              <td className="px-5 py-3">
                {p.proof ? (
                  <a href={p.proof} target="_blank" rel="noreferrer" className="text-xs font-semibold text-caramel hover:underline">View</a>
                ) : <span className="text-espresso-500/40">—</span>}
              </td>
              <td className="px-5 py-3 text-right">
                {p.status !== "completed" && canUpdate ? <CompletePayout id={p.id} /> : <span className="text-espresso-500/40">—</span>}
              </td>
            </tr>
          ))}
          {(!rows || rows.length === 0) && <EmptyRow colSpan={7} message="No payout requests." />}
        </TBody>
      </Table>
    </div>
  );
}
