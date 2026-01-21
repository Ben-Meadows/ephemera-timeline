import { notFound } from "next/navigation";
import Link from "next/link";
import { PageContent } from "@/components/page/page-content";
import { PageCollectionsManager } from "@/components/page/page-collections-manager";
import { buttonClasses } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { JournalPage, PageItem, Profile, Timeline } from "@/lib/types";
import {
  createMarkerAction,
  deleteMarkerAction,
  updateMarkerAction,
} from "@/app/actions/markers";
import { assignPageToTimelinesAction } from "@/app/actions/timelines";

type PageParams = {
  params: Promise<{ id: string }>;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function visibilityLabel(visibility: string) {
  const labels: Record<string, { icon: string; text: string }> = {
    public: { icon: '🌍', text: 'Public' },
    private: { icon: '🔒', text: 'Private' },
    unlisted: { icon: '🔗', text: 'Unlisted' },
  };
  return labels[visibility] ?? labels.private;
}

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

  // Fetch user's timelines and this page's assigned timelines (for owner only)
  let userTimelines: Timeline[] = [];
  let assignedTimelineIds: string[] = [];

  if (isOwner && user) {
    const { data: timelinesData } = await supabase
      .from("timelines")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true });

    userTimelines = timelinesData ?? [];

    const { data: pageTimelinesData } = await supabase
      .from("page_timelines")
      .select("timeline_id")
      .eq("page_id", page.id);

    assignedTimelineIds = pageTimelinesData?.map((pt) => pt.timeline_id) ?? [];
  }
  const vis = visibilityLabel(page.visibility);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div 
        className="relative rounded-sm bg-[#f5efe6] p-6"
        style={{
          boxShadow: '0 2px 12px rgba(44, 24, 16, 0.06)',
          border: '1px solid rgba(139, 69, 19, 0.1)',
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Author tag */}
            {profile?.username && (
              <Link 
                href={`/u/${profile.username}`}
                className="inline-flex items-center gap-2 font-[family-name:var(--font-typewriter)] text-xs uppercase tracking-wider text-[#8b4513] hover:text-[#704214] transition-colors"
              >
                <span className="h-2 w-2 rounded-full bg-[#8b4513]" />
                @{profile.username}
              </Link>
            )}
            
            {/* Title */}
            <h1 className="mt-2 font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#2c1810]">
              {page.title || "Untitled Page"}
            </h1>
            
            {/* Meta info */}
            <div className="mt-2 flex flex-wrap items-center gap-4 font-[family-name:var(--font-crimson)] text-sm text-[#5c4033]">
              <span className="flex items-center gap-1.5">
                📅 {formatDate(page.page_date)}
              </span>
              <span className="flex items-center gap-1.5">
                {vis.icon} {vis.text}
              </span>
              <span className="flex items-center gap-1.5">
                📍 {items?.length ?? 0} markers
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {isOwner && (
              <Link
                href="/new"
                className={buttonClasses("secondary", "sm")}
              >
                + New Page
              </Link>
            )}
            <Link 
              href="/timeline" 
              className="font-[family-name:var(--font-crimson)] text-sm text-[#8b4513] underline decoration-[#d4a574] underline-offset-2 transition-colors hover:text-[#704214]"
            >
              My Timeline
            </Link>
          </div>
        </div>
      </div>

      {/* Caption */}
      {page.caption && (
        <div 
          className="rounded-sm bg-[#f5efe6] p-5"
          style={{
            boxShadow: 'inset 0 0 20px rgba(139, 69, 19, 0.03)',
            border: '1px solid rgba(139, 69, 19, 0.1)',
          }}
        >
          <p className="font-[family-name:var(--font-crimson)] text-[#5c4033] italic leading-relaxed">
            "{page.caption}"
          </p>
        </div>
      )}

      {/* Collections manager - only for owner */}
      {isOwner && (
        <PageCollectionsManager
          pageId={page.id}
          allTimelines={userTimelines}
          assignedTimelineIds={assignedTimelineIds}
          onAssign={assignPageToTimelinesAction}
        />
      )}

      {/* Image and markers - View/Edit mode */}
      <PageContent
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
