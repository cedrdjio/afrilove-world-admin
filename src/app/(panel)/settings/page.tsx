import { getServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdmin();
  const sb = getServiceClient();
  const { data: s } = await sb.from("settings").select("*").eq("id", 1).maybeSingle();

  return (
    <div>
      <PageHeader title="Settings" subtitle="Global application configuration." />
      <SettingsForm s={s ?? {}} />
    </div>
  );
}
