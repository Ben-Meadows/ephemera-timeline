import Image from "next/image";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { JournalPage } from "@/lib/types";

type PageCardProps = {
  page: JournalPage & { image_url?: string };
  href: string;
};

function visibilityBadge(visibility: string) {
  const styles: Record<string, string> = {
    public: "bg-emerald-100 text-emerald-700",
    private: "bg-slate-100 text-slate-600",
    unlisted: "bg-amber-50 text-amber-700",
  };
  return styles[visibility] ?? styles.private;
}

export async function PageCard({ page, href }: PageCardProps) {
  const supabase = await createSupabaseServerClient();
  const { data } = supabase.storage
    .from("journal-pages")
    .getPublicUrl(page.image_path);
  const imageUrl = page.image_url ?? data.publicUrl;

  return (
    <Link
      href={href}
      className="flex gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative h-28 w-24 overflow-hidden rounded-lg bg-slate-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={page.title ?? "Journal page"}
            fill
            sizes="120px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{new Date(page.page_date).toLocaleDateString()}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${visibilityBadge(page.visibility)}`}
          >
            {page.visibility}
          </span>
        </div>
        <p className="text-sm font-semibold text-slate-900">
          {page.title || "Untitled page"}
        </p>
        {page.caption ? (
          <p className="line-clamp-2 text-sm text-slate-600">{page.caption}</p>
        ) : null}
      </div>
    </Link>
  );
}
