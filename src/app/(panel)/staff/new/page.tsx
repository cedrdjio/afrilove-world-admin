import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { StaffForm } from "@/components/staff/StaffForm";

export default async function NewStaffPage() {
  await requireAdmin();
  return (
    <div>
      <Link href="/staff" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-espresso-500 hover:text-caramel">
        <ArrowLeft className="h-4 w-4" /> Back to staff
      </Link>
      <PageHeader title="New staff member" />
      <StaffForm />
    </div>
  );
}
