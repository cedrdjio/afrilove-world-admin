import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DonutChart } from "@/components/charts/DonutChart";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Dashboard — AfriLove Admin" };
export const dynamic = "force-dynamic";

async function count(table: string, filter?: (q: any) => any): Promise<number> {
  const sb = getServiceClient();
  let q = sb.from(table).select("*", { count: "exact", head: true });
  if (filter) q = filter(q);
  const { count } = await q;
  return count ?? 0;
}

export default async function DashboardPage() {
  const user = await requireUser();
  const sb = getServiceClient();

  const [
    totalUsers, maleUsers, femaleUsers, fakeUsers, verifiedUsers,
    subscribers, interests, languages, religions, goals, plans, gifts, packages, faqs, pages,
    pendingPayouts, pendingKyc,
  ] = await Promise.all([
    count("users"),
    count("users", (q) => q.eq("gender", "MALE")),
    count("users", (q) => q.eq("gender", "FEMALE")),
    count("users", (q) => q.eq("user_type", "FAKE_USER")),
    count("users", (q) => q.eq("is_verify", 2)),
    count("users", (q) => q.eq("is_subscribe", true)),
    count("interests"), count("languages"), count("religions"), count("relation_goals"),
    count("plans"), count("gifts"), count("packages"), count("faqs"), count("pages"),
    count("payouts", (q) => q.eq("status", "pending")),
    count("users", (q) => q.eq("is_verify", 1).not("identity_picture", "is", null)),
  ]);

  const { data: earningsRows } = await sb.from("plan_purchase_history").select("amount");
  const totalEarnings = (earningsRows ?? []).reduce((s, r) => s + Number(r.amount || 0), 0);

  const { data: recentUsers } = await sb
    .from("users")
    .select("id,name,email,gender,user_type,rdate,is_subscribe")
    .order("rdate", { ascending: false })
    .limit(6);

  const otherGender = Math.max(totalUsers - maleUsers - femaleUsers, 0);

  return (
    <div>
      <PageHeader title={`Welcome back, ${user.name.split(" ")[0]} 👋`} subtitle="Here's what's happening across AfriLove World today." />

      {/* KPI cards */}
      <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={totalUsers} icon="Users" tone="caramel" />
        <StatCard label="Subscribers" value={subscribers} icon="BadgeCheck" tone="gold" />
        <StatCard label="Total earnings" value={totalEarnings} prefix="$" decimals={2} icon="Coins" tone="success" />
        <StatCard label="Pending payouts" value={pendingPayouts} icon="Banknote" tone="terracotta" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Gender split */}
        <div className="card p-6 lg:col-span-1">
          <h3 className="mb-4 text-lg font-bold">Gender split</h3>
          <DonutChart
            data={[
              { label: "Female", value: femaleUsers, color: "#B9372A" },
              { label: "Male", value: maleUsers, color: "#A56B45" },
              { label: "Other", value: otherGender, color: "#E1AF3A" },
            ]}
          />
          <div className="mt-5 flex items-center justify-between rounded-xl bg-cream px-4 py-3 text-sm">
            <span className="font-medium text-espresso-500">Fake profiles</span>
            <Badge tone="warning">{fakeUsers.toLocaleString()}</Badge>
          </div>
          <div className="mt-2 flex items-center justify-between rounded-xl bg-cream px-4 py-3 text-sm">
            <span className="font-medium text-espresso-500">Verified profiles</span>
            <Badge tone="success">{verifiedUsers.toLocaleString()}</Badge>
          </div>
          <Link href="/verification" className="mt-2 flex items-center justify-between rounded-xl bg-cream px-4 py-3 text-sm transition hover:bg-cream-dark">
            <span className="font-medium text-espresso-500">KYC en attente</span>
            <Badge tone={pendingKyc > 0 ? "warning" : "neutral"}>{pendingKyc.toLocaleString()}</Badge>
          </Link>
        </div>

        {/* Recent users */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-espresso-500/10 p-6">
            <h3 className="text-lg font-bold">Newest members</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-espresso-500/60">
                  <th className="px-6 py-3 font-semibold">Name</th>
                  <th className="px-6 py-3 font-semibold">Gender</th>
                  <th className="px-6 py-3 font-semibold">Joined</th>
                  <th className="px-6 py-3 font-semibold">Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-espresso-500/5">
                {(recentUsers ?? []).map((u) => (
                  <tr key={u.id} className="hover:bg-cream/60">
                    <td className="px-6 py-3">
                      <p className="font-semibold text-espresso">{u.name || "—"}</p>
                      <p className="text-xs text-espresso-500">{u.email || "—"}</p>
                    </td>
                    <td className="px-6 py-3 text-espresso-600">{u.gender || "—"}</td>
                    <td className="px-6 py-3 text-espresso-600">{formatDate(u.rdate)}</td>
                    <td className="px-6 py-3">
                      {u.is_subscribe ? <Badge tone="gold">Premium</Badge> : <Badge tone="neutral">Free</Badge>}
                    </td>
                  </tr>
                ))}
                {(!recentUsers || recentUsers.length === 0) && (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-espresso-500">No users yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Catalog counts */}
      <div className="stagger mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Interests" value={interests} icon="Heart" tone="espresso" />
        <StatCard label="Languages" value={languages} icon="Languages" tone="espresso" />
        <StatCard label="Religions" value={religions} icon="Church" tone="espresso" />
        <StatCard label="Relation goals" value={goals} icon="Target" tone="espresso" />
        <StatCard label="Plans" value={plans} icon="BadgeCheck" tone="espresso" />
        <StatCard label="Gifts" value={gifts} icon="Gift" tone="espresso" />
        <StatCard label="Coin packages" value={packages} icon="Coins" tone="espresso" />
        <StatCard label="FAQs" value={faqs} icon="HelpCircle" tone="espresso" />
        <StatCard label="Pages" value={pages} icon="FileText" tone="espresso" />
      </div>
    </div>
  );
}
