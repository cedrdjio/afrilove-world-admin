import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Cake, Wallet, Coins } from "lucide-react";
import { getServiceClient } from "@/lib/supabase";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { BalanceForm } from "@/components/users/BalanceForm";
import { formatCurrency, formatDate, formatDateTime, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await requirePermission("ulist", "Read");
  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();

  const sb = getServiceClient();
  const { data: u } = await sb.from("users").select("*").eq("id", numId).maybeSingle();
  if (!u) notFound();

  const [{ data: goal }, { data: religion }, { data: plan }, { data: walletTx }, { data: coinTx }] = await Promise.all([
    u.relation_goal ? sb.from("relation_goals").select("title").eq("id", u.relation_goal).maybeSingle() : Promise.resolve({ data: null }),
    u.religion ? sb.from("religions").select("title").eq("id", u.religion).maybeSingle() : Promise.resolve({ data: null }),
    u.plan_id ? sb.from("plans").select("title").eq("id", u.plan_id).maybeSingle() : Promise.resolve({ data: null }),
    sb.from("wallet_reports").select("*").eq("uid", numId).order("tdate", { ascending: false }).limit(10),
    sb.from("coin_reports").select("*").eq("uid", numId).order("tdate", { ascending: false }).limit(10),
  ]);

  const canWallet = can(me, "wallet", "Update");
  const canCoin = can(me, "coin", "Update");

  return (
    <div>
      <Link href="/users" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-espresso-500 hover:text-caramel">
        <ArrowLeft className="h-4 w-4" /> Back to users
      </Link>

      {/* Profile header */}
      <div className="card mb-6 overflow-hidden">
        <div className="h-24 bg-brand-gradient" />
        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
          <span className="-mt-10 grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-sand-gradient text-2xl font-bold text-espresso shadow-card">
            {u.profile_pic ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={u.profile_pic} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(u.name)
            )}
          </span>
          <div className="flex-1 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-espresso">{u.name || "Unnamed user"}</h1>
              {u.user_type === "FAKE_USER" && <Badge tone="warning">Fake</Badge>}
              {u.is_subscribe ? <Badge tone="gold">{plan?.title || "Premium"}</Badge> : <Badge tone="neutral">Free</Badge>}
              {u.status ? <Badge tone="success">Active</Badge> : <Badge tone="danger">Inactive</Badge>}
            </div>
            <p className="mt-1 text-sm text-espresso-500">{u.gender} {u.birth_date ? `· ${formatDate(u.birth_date)}` : ""}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: details */}
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-6">
            <h3 className="mb-4 text-lg font-bold">Profile</h3>
            {u.profile_bio && <p className="mb-4 text-sm text-espresso-600">{u.profile_bio}</p>}
            <dl className="grid gap-4 sm:grid-cols-2">
              <Info icon={<Mail className="h-4 w-4" />} label="Email" value={u.email} />
              <Info icon={<Phone className="h-4 w-4" />} label="Mobile" value={`${u.ccode || ""} ${u.mobile || ""}`.trim()} />
              <Info icon={<Cake className="h-4 w-4" />} label="Birth date" value={formatDate(u.birth_date)} />
              <Info icon={<MapPin className="h-4 w-4" />} label="Location" value={u.lats && u.longs ? `${u.lats}, ${u.longs}` : null} />
              <Info label="Relation goal" value={goal?.title} />
              <Info label="Religion" value={religion?.title} />
              <Info label="Search preference" value={u.search_preference} />
              <Info label="Search radius" value={u.radius_search ? `${u.radius_search} km` : null} />
              <Info label="Referral code" value={u.code} />
              <Info label="Registered" value={formatDateTime(u.rdate)} />
            </dl>
          </section>

          {/* Transactions */}
          <section className="grid gap-6 md:grid-cols-2">
            <TxList title="Wallet history" rows={walletTx ?? []} symbol="$" />
            <TxList title="Coin history" rows={coinTx ?? []} symbol="" />
          </section>
        </div>

        {/* Right: balances + management */}
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-success/10 text-success"><Wallet className="h-5 w-5" /></span>
              <div>
                <p className="text-sm text-espresso-500">Wallet balance</p>
                <p className="text-2xl font-extrabold text-espresso">{formatCurrency(u.wallet)}</p>
              </div>
            </div>
            {canWallet && <div className="mt-5"><BalanceForm userId={numId} kind="wallet" /></div>}
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold/15 text-caramel-dark"><Coins className="h-5 w-5" /></span>
              <div>
                <p className="text-sm text-espresso-500">Coin balance</p>
                <p className="text-2xl font-extrabold text-espresso">{Number(u.coin || 0).toLocaleString()}</p>
              </div>
            </div>
            {canCoin && <div className="mt-5"><BalanceForm userId={numId} kind="coin" /></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ icon, label, value }: { icon?: React.ReactNode; label: string; value?: string | null }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-espresso-500/60">
        {icon} {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-espresso">{value || "—"}</dd>
    </div>
  );
}

function TxList({ title, rows, symbol }: { title: string; rows: any[]; symbol: string }) {
  return (
    <div className="card p-6">
      <h3 className="mb-3 text-base font-bold">{title}</h3>
      <ul className="space-y-2">
        {rows.length === 0 && <li className="py-4 text-center text-sm text-espresso-500">No transactions.</li>}
        {rows.map((t) => (
          <li key={t.id} className="flex items-center justify-between rounded-lg bg-cream px-3 py-2">
            <div>
              <p className="text-sm font-medium text-espresso">{t.message || "—"}</p>
              <p className="text-xs text-espresso-500">{formatDate(t.tdate)}</p>
            </div>
            <span className={`text-sm font-bold ${t.status === "Credit" ? "text-success" : "text-terracotta"}`}>
              {t.status === "Credit" ? "+" : "−"}{symbol}{Number(t.amt || 0).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
