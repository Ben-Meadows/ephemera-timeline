import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buttonClasses } from "@/components/ui/button";
import { TimelineCard } from "@/components/timeline/timeline-card";
import { CreateTimelineButton } from "@/components/timeline/create-timeline-button";
import type { TimelineWithPages } from "@/lib/types";

export default async function TimelinesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  // Fetch timelines with page counts
  const { data: timelines } = await supabase
    .from("timelines")
    .select(`
      *,
      page_timelines(count)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Transform the data to include page_count
  const timelinesWithCounts: TimelineWithPages[] = (timelines ?? []).map((t) => ({
    ...t,
    page_count: t.page_timelines?.[0]?.count ?? 0,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div
        className="rounded-sm bg-[#f5efe6] p-6"
        style={{
          boxShadow: "0 2px 12px rgba(44, 24, 16, 0.06)",
          border: "1px solid rgba(139, 69, 19, 0.1)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-[family-name:var(--font-typewriter)] text-xs uppercase tracking-[0.2em] text-[#8b4513]">
              ✦ Organize Your Collection
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#2c1810]">
              My Timelines
            </h1>
            <p className="mt-1 font-[family-name:var(--font-crimson)] text-sm text-[#5c4033]">
              Create themed collections like &ldquo;Holiday&rdquo;, &ldquo;Monthly&rdquo;, or &ldquo;Travel&rdquo;
            </p>
          </div>
          <CreateTimelineButton />
        </div>
      </div>

      {/* Timelines grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {timelinesWithCounts.length > 0 ? (
          timelinesWithCounts.map((timeline) => (
            <TimelineCard key={timeline.id} timeline={timeline} />
          ))
        ) : (
          <div
            className="col-span-full relative rounded-sm bg-[#f5efe6] p-8 text-center"
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
              <span className="text-2xl">📁</span>
            </div>
            <p className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-[#2c1810]">
              No timelines yet
            </p>
            <p className="mt-2 font-[family-name:var(--font-crimson)] text-sm text-[#5c4033]">
              Create your first timeline to start organizing your pages into themed collections.
            </p>
          </div>
        )}
      </div>

      {/* Back to timeline link */}
      <div className="text-center">
        <Link
          href="/timeline"
          className="font-[family-name:var(--font-crimson)] text-sm text-[#8b4513] hover:underline"
        >
          ← Back to all pages
        </Link>
      </div>
    </div>
  );
}
