import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getResource } from "@/lib/resources";
import { getServiceClient } from "@/lib/supabase";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { ResourceForm } from "@/components/resource/ResourceForm";

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource: slug, id } = await params;
  const resource = getResource(slug);
  if (!resource) notFound();
  await requirePermission(resource.module, "Update");

  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();

  const sb = getServiceClient();
  const { data: record } = await sb.from(resource.table).select("*").eq("id", numId).maybeSingle();
  if (!record) notFound();

  return (
    <div>
      <Link href={`/${slug}`} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-espresso-500 hover:text-caramel">
        <ArrowLeft className="h-4 w-4" /> Back to {resource.plural.toLowerCase()}
      </Link>
      <PageHeader title={`Edit ${resource.singular.toLowerCase()}`} />
      <ResourceForm resource={resource} record={record} />
    </div>
  );
}
