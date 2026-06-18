import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getServiceClient } from "@/lib/supabase";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { PaymentForm } from "./PaymentForm";

export default async function EditPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("plist", "Update");
  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();

  const sb = getServiceClient();
  const { data: gateway } = await sb.from("payment_gateways").select("*").eq("id", numId).maybeSingle();
  if (!gateway) notFound();

  return (
    <div>
      <Link href="/payments" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-espresso-500 hover:text-caramel">
        <ArrowLeft className="h-4 w-4" /> Back to gateways
      </Link>
      <PageHeader title={`Edit ${gateway.title}`} />
      <PaymentForm gateway={gateway} />
    </div>
  );
}
