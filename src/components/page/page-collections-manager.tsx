"use client";

import { useState, useTransition } from "react";
import type { Timeline } from "@/lib/types";
import type { AssignPageToTimelines } from "@/app/actions/timelines";

type Props = {
  pageId: string;
  allTimelines: Timeline[];
  assignedTimelineIds: string[];
  onAssign: AssignPageToTimelines;
};

export function PageCollectionsManager({
  pageId,
  allTimelines,
  assignedTimelineIds,
  onAssign,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(assignedTimelineIds)
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const hasChanges = 
    selectedIds.size !== assignedTimelineIds.length ||
    !assignedTimelineIds.every((id) => selectedIds.has(id));

  const toggleTimeline = (timelineId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(timelineId)) {
        next.delete(timelineId);
      } else {
        next.add(timelineId);
      }
      return next;
    });
  };

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await onAssign({
        page_id: pageId,
        timeline_ids: Array.from(selectedIds),
      });
      if (result?.error) {
        setError(result.error);
      } else {
        setIsOpen(false);
      }
    });
  };

  const handleCancel = () => {
    setSelectedIds(new Set(assignedTimelineIds));
    setError(null);
    setIsOpen(false);
  };

  // Get assigned timelines for display
  const assignedTimelines = allTimelines.filter((t) =>
    assignedTimelineIds.includes(t.id)
  );

  return (
    <div
      className="rounded-sm bg-[#f5efe6] p-5"
      style={{
        boxShadow: "0 2px 12px rgba(44, 24, 16, 0.06)",
        border: "1px solid rgba(139, 69, 19, 0.1)",
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-[family-name:var(--font-typewriter)] text-xs uppercase tracking-wider text-[#8b4513]">
            ✦ Collections
          </h3>
          {assignedTimelines.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {assignedTimelines.map((timeline) => (
                <span
                  key={timeline.id}
                  className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs"
                  style={{
                    backgroundColor: `${timeline.color}15`,
                    border: `1px solid ${timeline.color}40`,
                    color: timeline.color,
                  }}
                >
                  <span>{timeline.icon}</span>
                  <span className="font-[family-name:var(--font-crimson)] font-medium">
                    {timeline.name}
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 font-[family-name:var(--font-crimson)] text-sm text-[#5c4033] italic">
              Not in any collections yet
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="font-[family-name:var(--font-typewriter)] text-xs text-[#8b4513] underline decoration-[#d4a574] underline-offset-2 hover:text-[#704214] transition-colors"
        >
          {isOpen ? "Close" : "Manage"}
        </button>
      </div>

      {/* Expanded editor */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-[#d4a574]/30">
          {allTimelines.length === 0 ? (
            <p className="font-[family-name:var(--font-crimson)] text-sm text-[#5c4033] italic">
              You don&apos;t have any collections yet.{" "}
              <a
                href="/timelines"
                className="text-[#8b4513] underline decoration-[#d4a574] underline-offset-2"
              >
                Create one
              </a>
            </p>
          ) : (
            <>
              <p className="font-[family-name:var(--font-crimson)] text-sm text-[#5c4033] mb-3">
                Select which collections to add this page to:
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {allTimelines.map((timeline) => {
                  const isSelected = selectedIds.has(timeline.id);
                  return (
                    <button
                      key={timeline.id}
                      type="button"
                      onClick={() => toggleTimeline(timeline.id)}
                      disabled={isPending}
                      className={`flex items-center gap-3 rounded-sm p-3 text-left transition-all ${
                        isSelected
                          ? "bg-[#faf6f1] border-2"
                          : "bg-white/50 border border-transparent hover:bg-[#faf6f1]"
                      }`}
                      style={{
                        borderColor: isSelected ? timeline.color : undefined,
                      }}
                    >
                      {/* Checkbox */}
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-sm border-2 transition-colors ${
                          isSelected
                            ? "border-current text-white"
                            : "border-[#d4a574]"
                        }`}
                        style={{
                          backgroundColor: isSelected
                            ? timeline.color
                            : "transparent",
                          borderColor: isSelected
                            ? timeline.color
                            : undefined,
                        }}
                      >
                        {isSelected && (
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </span>

                      {/* Timeline info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span style={{ color: timeline.color }}>
                            {timeline.icon}
                          </span>
                          <span className="font-[family-name:var(--font-playfair)] text-sm font-medium text-[#2c1810] truncate">
                            {timeline.name}
                          </span>
                        </div>
                        {timeline.description && (
                          <p className="mt-0.5 font-[family-name:var(--font-crimson)] text-xs text-[#5c4033] truncate">
                            {timeline.description}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {error && (
                <p className="mt-3 font-[family-name:var(--font-crimson)] text-sm text-red-600">
                  {error}
                </p>
              )}

              {/* Actions */}
              <div className="mt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="font-[family-name:var(--font-typewriter)] text-xs text-[#5c4033] hover:text-[#2c1810] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending || !hasChanges}
                  className={`rounded-sm px-4 py-2 font-[family-name:var(--font-typewriter)] text-xs uppercase tracking-wider transition-all ${
                    hasChanges && !isPending
                      ? "bg-[#8b4513] text-white hover:bg-[#704214]"
                      : "bg-[#d4a574]/30 text-[#8b7355] cursor-not-allowed"
                  }`}
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
