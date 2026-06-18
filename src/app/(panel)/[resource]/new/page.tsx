import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getResource } from "@/lib/resources";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { ResourceForm } from "@/components/resource/ResourceForm";

export default async function NewResourcePage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource: slug } = await params;
  const resource = getResource(slug);
  if (!resource) notFound();
  await requirePermission(resource.module, "Write");

  return (
    <div>
      <Link href={`/${slug}`} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-espresso-500 hover:text-caramel">
        <ArrowLeft className="h-4 w-4" /> Back to {resource.plural.toLowerCase()}
      </Link>
      <PageHeader title={`New ${resource.singular.toLowerCase()}`} />
      <ResourceForm resource={resource} />
    </div>
  );
}
