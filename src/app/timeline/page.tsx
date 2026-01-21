import Link from "next/link";
import { redirect } from "next/navigation";
import { PageCard } from "@/components/page/page-card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buttonClasses } from "@/components/ui/button";
import { TimelineViewToggle } from "@/components/timeline/timeline-view-toggle";
import { TimelineFilter } from "@/components/timeline/timeline-filter";
import { VisualTimeline } from "@/components/timeline/visual-timeline";
import type { Timeline, JournalPage } from "@/lib/types";

type SearchParams = Promise<{ view?: string; filter?: string }>;

type PageWithUrl = JournalPage & { image_url?: string };

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  // Get view mode from URL params
  const viewMode = params.view === "visual" ? "visual" : "list";
  const filterTimelineId = params.filter || null;

  // Fetch user's timelines for the filter dropdown
  const { data: timelines } = await supabase
    .from("timelines")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  // Helper to add image URLs to pages
  const addImageUrls = (pages: JournalPage[]): PageWithUrl[] => {
    return pages.map((page) => {
      const { data } = supabase.storage
        .from("journal-pages")
        .getPublicUrl(page.image_path);
      return {
        ...page,
        image_url: data.publicUrl,
      };
    });
  };

  // Fetch ALL pages for the master timeline (always needed for visual view)
  const { data: allPages } = await supabase
    .from("journal_pages")
    .select("*")
    .eq("user_id", user.id)
    .order("page_date", { ascending: false });

  const allPagesWithUrls = addImageUrls(allPages || []);

  // Fetch pages for each timeline (for visual stacked view)
  const { data: allPageTimelines } = await supabase
    .from("page_timelines")
    .select("page_id, timeline_id");

  // Group pages by timeline
  const timelinePageMap = new Map<string, Set<string>>();
  (allPageTimelines || []).forEach((pt) => {
    if (!timelinePageMap.has(pt.timeline_id)) {
      timelinePageMap.set(pt.timeline_id, new Set());
    }
    timelinePageMap.get(pt.timeline_id)!.add(pt.page_id);
  });

  // Create timeline data with their pages
  const timelinesWithPages = ((timelines as Timeline[]) || []).map((timeline) => {
    const pageIds = timelinePageMap.get(timeline.id) || new Set();
    const timelinePages = allPagesWithUrls.filter((p) => pageIds.has(p.id));
    return {
      ...timeline,
      pages: timelinePages,
    };
  });

  // For list view filtering
  let filteredPages: PageWithUrl[] = [];
  if (filterTimelineId) {
    const pageIds = timelinePageMap.get(filterTimelineId) || new Set();
    filteredPages = allPagesWithUrls.filter((p) => pageIds.has(p.id));
  } else {
    filteredPages = allPagesWithUrls;
  }

  // Find the selected timeline name for display
  const selectedTimeline = filterTimelineId
    ? timelines?.find((t) => t.id === filterTimelineId)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="rounded-sm bg-[#f5efe6] p-6"
        style={{
          boxShadow: "0 2px 12px rgba(44, 24, 16, 0.06)",
          border: "1px solid rgba(139, 69, 19, 0.1)",
        }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-[family-name:var(--font-typewriter)] text-xs uppercase tracking-[0.2em] text-[#8b4513]">
              ✦ My Collection
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#2c1810]">
              {selectedTimeline ? (
                <>
                  <span className="mr-2">{selectedTimeline.icon}</span>
                  {selectedTimeline.name}
                </>
              ) : (
                "Your Timeline"
              )}
            </h1>
            <p className="mt-1 font-[family-name:var(--font-crimson)] text-sm text-[#5c4033]">
              {selectedTimeline
                ? selectedTimeline.description || "Filtered collection"
                : "All pages arranged chronologically"}
            </p>
          </div>
          <Link href="/new" className={buttonClasses("primary", "md")}>
            + New Page
          </Link>
        </div>

        {/* Controls row */}
        <div className="mt-4 flex flex-wrap items-center gap-4 pt-4 border-t border-[#d4a574]/30">
          <TimelineViewToggle currentView={viewMode} />
          <TimelineFilter
            timelines={(timelines as Timeline[]) || []}
            currentFilter={filterTimelineId}
          />
          {filterTimelineId && (
            <Link
              href="/timeline"
              className="font-[family-name:var(--font-typewriter)] text-xs text-[#722f37] hover:underline"
            >
              × Clear filter
            </Link>
          )}
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === "visual" ? (
        filterTimelineId ? (
          // Filtered: show only the selected timeline
          <VisualTimeline
            pages={filteredPages}
            label={selectedTimeline ? `${selectedTimeline.icon} ${selectedTimeline.name}` : undefined}
            color={selectedTimeline?.color}
          />
        ) : (
          // Unfiltered: show master + all user timelines stacked
          <div className="space-y-6">
            {/* Master Timeline - All Pages */}
            <VisualTimeline
              pages={allPagesWithUrls}
              label="📚 All Pages"
              color="#8b4513"
              showEmptyMessage={true}
            />

            {/* Individual Timelines */}
            {timelinesWithPages.map((timeline) => (
              <VisualTimeline
                key={timeline.id}
                pages={timeline.pages}
                label={`${timeline.icon} ${timeline.name}`}
                color={timeline.color}
                timelineId={timeline.id}
              />
            ))}

            {/* Prompt to create timelines if none exist */}
            {timelinesWithPages.length === 0 && (
              <div
                className="rounded-sm bg-[#f5efe6] p-6 text-center"
                style={{
                  border: "1px dashed rgba(139, 69, 19, 0.3)",
                }}
              >
                <p className="font-[family-name:var(--font-crimson)] text-sm text-[#5c4033]">
                  Create collections to organize your pages.{" "}
                  <Link
                    href="/timelines"
                    className="font-semibold text-[#8b4513] underline"
                  >
                    Manage Collections →
                  </Link>
                </p>
              </div>
            )}
          </div>
        )
      ) : (
        <div className="grid gap-4">
          {filteredPages.length > 0 ? (
            filteredPages.map((page) => (
              <PageCard key={page.id} page={page} href={`/p/${page.id}`} />
            ))
          ) : (
            <div
              className="relative rounded-sm bg-[#f5efe6] p-8 text-center"
              style={{
                boxShadow: "0 2px 12px rgba(44, 24, 16, 0.06)",
                border: "1px dashed rgba(139, 69, 19, 0.3)",
              }}
            >
              {/* Decorative corners */}
              <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-[#d4a574] opacity-50" />
              <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-[#d4a574] opacity-50" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-[#d4a574] opacity-50" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-[#d4a574] opacity-50" />

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[#d4a574]">
                <span className="text-2xl">📄</span>
              </div>
              <p className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-[#2c1810]">
                {filterTimelineId
                  ? "No pages in this collection"
                  : "Your collection is empty"}
              </p>
              <p className="mt-2 font-[family-name:var(--font-crimson)] text-sm text-[#5c4033]">
                {filterTimelineId ? (
                  <>
                    Add pages to this timeline from the{" "}
                    <Link
                      className="font-semibold text-[#8b4513] underline decoration-[#d4a574] underline-offset-2"
                      href="/new"
                    >
                      new page form
                    </Link>
                  </>
                ) : (
                  <>
                    Start preserving your ephemera.{" "}
                    <Link
                      className="font-semibold text-[#8b4513] underline decoration-[#d4a574] underline-offset-2"
                      href="/new"
                    >
                      Create your first page
                    </Link>
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
