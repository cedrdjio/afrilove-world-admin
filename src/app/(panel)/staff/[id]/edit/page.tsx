import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { StaffForm } from "@/components/staff/StaffForm";

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin();

  const sb = getServiceClient();
  const { data: staff } = await sb
    .from("admin_users")
    .select("id,name,email,status,permissions,role")
    .eq("id", id)
    .eq("role", "staff")
    .maybeSingle();
  if (!staff) notFound();

  return (
    <div>
      <Link href="/staff" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-espresso-500 hover:text-caramel">
        <ArrowLeft className="h-4 w-4" /> Back to staff
      </Link>
      <PageHeader title={`Edit ${staff.name}`} />
      <StaffForm staff={staff as any} />
    </div>
  );
}
