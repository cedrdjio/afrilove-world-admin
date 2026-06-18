import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();
  return (
    <div>
      <PageHeader title="My profile" subtitle="Update your account name, email and password." />
      <ProfileForm user={user} />
    </div>
  );
}
