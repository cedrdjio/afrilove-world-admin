import Link from "next/link";
import { Users } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { FakeUserForm } from "./FakeUserForm";

export default async function FakeUsersPage() {
  await requirePermission("fakeuser", "Update");
  return (
    <div>
      <PageHeader title="Fake users" subtitle="Seed demo profiles to populate the app during testing.">
        <Link href="/users?type=fake" className="btn-outline"><Users className="h-4 w-4" /> View fake users</Link>
      </PageHeader>
      <FakeUserForm />
    </div>
  );
}
