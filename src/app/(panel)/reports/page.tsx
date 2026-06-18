import Link from "next/link";
import { getServiceClient } from "@/lib/supabase";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, THead, TBody, EmptyRow } from "@/components/ui/Table";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  await requirePermission("report", "Read");
  const sb = getServiceClient();
  const { data: rows } = await sb
    .from("reports")
    .select("*, reported:uid(id,name,email), reporter:reporter_id(id,name,email)")
    .order("report_date", { ascending: false })
    .limit(200);

  return (
    <div>
      <PageHeader title="Reports" subtitle="Abuse complaints submitted by members." />
      <Table>
        <THead columns={[{ label: "Reported profile" }, { label: "Reported by" }, { label: "Reason" }, { label: "Date" }]} />
        <TBody>
          {(rows ?? []).map((r: any) => (
            <tr key={r.id} className="hover:bg-cream/60">
              <td className="px-5 py-3">
                {r.reported ? (
                  <Link href={`/users/${r.reported.id}`} className="font-semibold text-caramel hover:underline">
                    {r.reported.name || r.reported.email || `#${r.reported.id}`}
                  </Link>
                ) : <span className="text-espresso-500/50">—</span>}
              </td>
              <td className="px-5 py-3 text-espresso-600">
                {r.reporter ? (r.reporter.name || r.reporter.email || `#${r.reporter.id}`) : "—"}
              </td>
              <td className="px-5 py-3 max-w-md text-espresso-600">{r.comment || "—"}</td>
              <td className="px-5 py-3 text-espresso-500">{formatDateTime(r.report_date)}</td>
            </tr>
          ))}
          {(!rows || rows.length === 0) && <EmptyRow colSpan={4} message="No reports filed." />}
        </TBody>
      </Table>
    </div>
  );
}
