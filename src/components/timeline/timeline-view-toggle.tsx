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
    <div className="flex items-center gap-1 rounded-sm border border-[#5E657B]/30 bg-[#F1E6D2] p-1">
      <button
        onClick={() => setView("list")}
        className={`
          px-3 py-1.5 rounded-sm font-[family-name:var(--font-crimson)] text-sm transition-all
          ${
            currentView === "list"
              ? "bg-[#5E657B] text-[#F1E6D2]"
              : "text-[#5E657B] hover:bg-[#5E657B]/10"
          }
        `}
      >
        List
      </button>
      <button
        onClick={() => setView("visual")}
        className={`
          px-3 py-1.5 rounded-sm font-[family-name:var(--font-crimson)] text-sm transition-all
          ${
            currentView === "visual"
              ? "bg-[#5E657B] text-[#F1E6D2]"
              : "text-[#5E657B] hover:bg-[#5E657B]/10"
          }
        `}
      >
        Visual
      </button>
    </div>
  );
}
