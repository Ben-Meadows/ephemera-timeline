"use client";

import { useRouter, useSearchParams } from "next/navigation";

type TimelineViewToggleProps = {
  currentView: "list" | "visual";
};

export function TimelineViewToggle({ currentView }: TimelineViewToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setView = (view: "list" | "visual") => {
    const params = new URLSearchParams(searchParams.toString());
    if (view === "list") {
      params.delete("view");
    } else {
      params.set("view", view);
    }
    router.push(`/timeline?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1 rounded-sm border border-[#d4a574]/50 bg-[#faf6f1] p-1">
      <button
        onClick={() => setView("list")}
        className={`
          px-3 py-1.5 rounded-sm font-[family-name:var(--font-typewriter)] text-xs uppercase tracking-wider transition-all
          ${
            currentView === "list"
              ? "bg-[#8b4513] text-white"
              : "text-[#5c4033] hover:bg-[#d4a574]/20"
          }
        `}
      >
        📋 List
      </button>
      <button
        onClick={() => setView("visual")}
        className={`
          px-3 py-1.5 rounded-sm font-[family-name:var(--font-typewriter)] text-xs uppercase tracking-wider transition-all
          ${
            currentView === "visual"
              ? "bg-[#8b4513] text-white"
              : "text-[#5c4033] hover:bg-[#d4a574]/20"
          }
        `}
      >
        ✨ Visual
      </button>
    </div>
  );
}
