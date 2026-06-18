import Link from "next/link";
import { Search, Eye } from "lucide-react";
import { getServiceClient } from "@/lib/supabase";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, THead, TBody, EmptyRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { UserStatusToggle, VerifyActions } from "@/components/users/UserActions";
import { formatDate, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 20;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; type?: string }>;
}) {
  const { q = "", page = "1", type = "" } = await searchParams;
  const user = await requirePermission("ulist", "Read");
  const canEdit = can(user, "ulist", "Update");

  const pageNum = Math.max(1, parseInt(page) || 1);
  const from = (pageNum - 1) * PAGE_SIZE;

  const sb = getServiceClient();
  let query = sb.from("users").select("*", { count: "exact" }).order("rdate", { ascending: false });
  if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,mobile.ilike.%${q}%`);
  if (type === "fake") query = query.eq("user_type", "FAKE_USER");
  if (type === "real") query = query.eq("user_type", "REAL_USER");

  const { data: rows, count } = await query.range(from, from + PAGE_SIZE - 1);
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div>
      <PageHeader title="Users" subtitle={`${(count ?? 0).toLocaleString()} registered members.`} />

      {/* Filters */}
      <form className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-500/50" />
          <input name="q" defaultValue={q} placeholder="Search name, email or mobile…" className="input pl-10" />
        </div>
        <select name="type" defaultValue={type} className="input w-auto">
          <option value="">All users</option>
          <option value="real">Real users</option>
          <option value="fake">Fake users</option>
        </select>
        <button className="btn-primary">Search</button>
      </form>

      <Table>
        <THead columns={[
          { label: "Member" },
          { label: "Contact" },
          { label: "Joined" },
          { label: "Plan" },
          { label: "Verification" },
          { label: "Active" },
          { label: "", className: "text-right" },
        ]} />
        <TBody>
          {(rows ?? []).map((u) => (
            <tr key={u.id} className="hover:bg-cream/60">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-gradient text-xs font-bold text-white">
                    {u.profile_pic ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.profile_pic} alt="" className="h-full w-full object-cover" />
                    ) : (
                      initials(u.name)
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 font-semibold text-espresso">
                      {u.name || "—"}
                      {u.user_type === "FAKE_USER" && <Badge tone="warning">Fake</Badge>}
                    </p>
                    <p className="text-xs text-espresso-500">{u.gender || "—"}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3">
                <p className="text-espresso-600">{u.email || "—"}</p>
                <p className="text-xs text-espresso-500">{u.ccode} {u.mobile}</p>
              </td>
              <td className="px-5 py-3 text-espresso-600">{formatDate(u.rdate)}</td>
              <td className="px-5 py-3">
                {u.is_subscribe ? <Badge tone="gold">Premium</Badge> : <Badge tone="neutral">Free</Badge>}
              </td>
              <td className="px-5 py-3"><VerifyActions id={u.id} verify={u.is_verify} canEdit={canEdit} /></td>
              <td className="px-5 py-3"><UserStatusToggle id={u.id} status={!!u.status} canEdit={canEdit} /></td>
              <td className="px-5 py-3 text-right">
                <Link href={`/users/${u.id}`} className="inline-flex rounded-lg p-2 text-espresso-500 hover:bg-cream hover:text-caramel" title="View profile">
                  <Eye className="h-4 w-4" />
                </Link>
              </td>
            </tr>
          ))}
          {(!rows || rows.length === 0) && <EmptyRow colSpan={7} message="No users match your search." />}
        </TBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-espresso-500">Page {pageNum} of {totalPages}</p>
          <div className="flex gap-2">
            {pageNum > 1 && (
              <Link href={`/users?q=${encodeURIComponent(q)}&type=${type}&page=${pageNum - 1}`} className="btn-outline">Previous</Link>
            )}
            {pageNum < totalPages && (
              <Link href={`/users?q=${encodeURIComponent(q)}&type=${type}&page=${pageNum + 1}`} className="btn-outline">Next</Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
