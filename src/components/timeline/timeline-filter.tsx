"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Timeline } from "@/lib/types";

type TimelineFilterProps = {
  timelines: Timeline[];
  currentFilter: string | null;
};

export function TimelineFilter({ timelines, currentFilter }: TimelineFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setFilter = (timelineId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (timelineId) {
      params.set("filter", timelineId);
    } else {
      params.delete("filter");
    }
    router.push(`/timeline?${params.toString()}`);
  };

  if (timelines.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-[family-name:var(--font-crimson)] text-sm text-[#5E657B]">
        Filter:
      </span>
      <select
        value={currentFilter || ""}
        onChange={(e) => setFilter(e.target.value || null)}
        className="
          rounded-sm border border-[#5E657B]/40 bg-[#F1E6D2] px-3 py-1.5
          font-[family-name:var(--font-crimson)] text-sm text-[#210706]
          focus:border-[#5E657B] focus:outline-none focus:ring-1 focus:ring-[#5E657B]
        "
      >
        <option value="">All Pages</option>
        {timelines.map((timeline) => (
          <option key={timeline.id} value={timeline.id}>
            {timeline.icon} {timeline.name}
          </option>
        ))}
      </select>
    </div>
  );
}
