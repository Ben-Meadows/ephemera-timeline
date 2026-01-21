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
      <span className="font-[family-name:var(--font-typewriter)] text-xs text-[#8b7355]">
        Filter:
      </span>
      <select
        value={currentFilter || ""}
        onChange={(e) => setFilter(e.target.value || null)}
        className="
          rounded-sm border border-[#d4a574]/50 bg-[#faf6f1] px-3 py-1.5
          font-[family-name:var(--font-crimson)] text-sm text-[#2c1810]
          focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]
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
