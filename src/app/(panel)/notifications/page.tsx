import { getServiceClient } from "@/lib/supabase";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { NotificationForm } from "./NotificationForm";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  await requirePermission("notification", "Write");
  const sb = getServiceClient();
  const { data: recent } = await sb
    .from("notifications")
    .select("title,description,datetime")
    .order("datetime", { ascending: false })
    .limit(8);

  return (
    <div>
      <PageHeader title="Push notifications" subtitle="Broadcast a message to your members." />
      <div className="grid gap-6 lg:grid-cols-2">
        <NotificationForm />
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-bold">Recent broadcasts</h3>
          <ul className="space-y-3">
            {(recent ?? []).map((n, i) => (
              <li key={i} className="rounded-xl bg-cream px-4 py-3">
                <p className="font-semibold text-espresso">{n.title}</p>
                <p className="text-sm text-espresso-600">{n.description}</p>
                <p className="mt-1 text-xs text-espresso-500">{formatDateTime(n.datetime)}</p>
              </li>
            ))}
            {(!recent || recent.length === 0) && <li className="py-6 text-center text-sm text-espresso-500">No notifications sent yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
