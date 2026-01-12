import { notFound } from "next/navigation";
import Link from "next/link";
import { PageItemsBoard } from "@/components/page/page-items-board";
import { buttonClasses } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { JournalPage, PageItem, Profile } from "@/lib/types";
import {
  createMarkerAction,
  deleteMarkerAction,
  updateMarkerAction,
} from "@/app/actions/markers";

type PageParams = {
  params: Promise<{ id: string }>;
};

export default async function PageDetail({ params }: PageParams) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: page, error } = await supabase
    .from("journal_pages")
    .select("*")
    .eq("id", id)
    .single();

  if (!page || error) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", page.user_id)
    .single();

  const { data: items } = await supabase
    .from("page_items")
    .select("*")
    .eq("page_id", page.id)
    .order("created_at", { ascending: true });

  const { data: imageUrlData } = supabase.storage
    .from("journal-pages")
    .getPublicUrl(page.image_path);

  const isOwner = user?.id === page.user_id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-600">
            {profile?.username ? `@${profile.username}` : "Journal page"}
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {page.title || "Untitled page"}
          </h1>
          <p className="text-sm text-slate-600">
            {new Date(page.page_date).toLocaleDateString()} · {page.visibility}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isOwner ? (
            <Link
              href="/new"
              className={buttonClasses("primary", "sm")}
            >
              New page
            </Link>
          ) : null}
          <Link href="/timeline" className="text-sm text-emerald-700 underline">
            My timeline
          </Link>
        </div>
      </div>

      {page.caption ? (
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-700">{page.caption}</p>
        </div>
      ) : null}

      <PageItemsBoard
        pageId={page.id}
        imageUrl={imageUrlData.publicUrl}
        items={items ?? []}
        canEdit={isOwner}
        onCreate={createMarkerAction}
        onUpdate={updateMarkerAction}
        onDelete={deleteMarkerAction}
      />
    </div>
  );
}
