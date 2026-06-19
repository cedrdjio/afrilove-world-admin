import Link from "next/link";
import { ImageOff } from "lucide-react";
import { getServiceClient } from "@/lib/supabase";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import { DeletableImage } from "@/components/media/DeletableImage";
import { initials, splitGallery } from "@/lib/utils";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 24;

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page = "1" } = await searchParams;
  const me = await requirePermission("ulist", "Read");
  const canDelete = can(me, "ulist", "Update");

  const pageNum = Math.max(1, parseInt(page) || 1);
  const from = (pageNum - 1) * PAGE_SIZE;

  const sb = getServiceClient();
  const { data: users, count } = await sb
    .from("users")
    .select("id,name,gender,profile_pic,other_pic", { count: "exact" })
    .or("profile_pic.not.is.null,other_pic.not.is.null")
    .order("rdate", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const rows = users ?? [];

  return (
    <div>
      <PageHeader
        title="Modération des médias"
        subtitle="Photos de profil et galeries des membres. Supprimez celles qui posent un problème moral ou légal."
      />

      {rows.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-16 text-center">
          <ImageOff className="h-10 w-10 text-espresso-500/40" />
          <p className="text-espresso-500">Aucune image utilisateur pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {rows.map((u) => {
            const gallery = splitGallery(u.other_pic);
            return (
              <section key={u.id} className="card p-5">
                <div className="mb-4 flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-brand-gradient text-xs font-bold text-white">
                    {u.profile_pic ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.profile_pic} alt="" className="h-full w-full object-cover" />
                    ) : (
                      initials(u.name)
                    )}
                  </span>
                  <div>
                    <Link href={`/users/${u.id}`} className="font-semibold text-espresso hover:text-caramel">
                      {u.name || `#${u.id}`}
                    </Link>
                    <p className="text-xs text-espresso-500">{u.gender || "—"} · {gallery.length + (u.profile_pic ? 1 : 0)} image(s)</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                  {u.profile_pic && (
                    <DeletableImage userId={u.id} url={u.profile_pic} kind="profile" label="Profil" canDelete={canDelete} />
                  )}
                  {gallery.map((url) => (
                    <DeletableImage key={url} userId={u.id} url={url} kind="gallery" canDelete={canDelete} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <p className="text-espresso-500">Page {pageNum} / {totalPages}</p>
          <div className="flex gap-2">
            {pageNum > 1 && <Link href={`/media?page=${pageNum - 1}`} className="btn-outline">Précédent</Link>}
            {pageNum < totalPages && <Link href={`/media?page=${pageNum + 1}`} className="btn-outline">Suivant</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
