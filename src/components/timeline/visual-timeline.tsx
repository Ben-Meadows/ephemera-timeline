"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { TimelineMarker } from "./timeline-marker";
import type { JournalPage } from "@/lib/types";

type VisualTimelineProps = {
  pages: (JournalPage & { image_url?: string })[];
  label?: string;
  color?: string;
  timelineId?: string;
  showEmptyMessage?: boolean;
};

function groupPagesByMonth(pages: (JournalPage & { image_url?: string })[]) {
  const groups: Record<string, (JournalPage & { image_url?: string })[]> = {};

  pages.forEach((page) => {
    const date = new Date(page.page_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(page);
  });

  return Object.entries(groups)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, pages]) => {
      const [year, month] = key.split("-");
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return {
        key,
        label: `${monthNames[parseInt(month) - 1]} '${year.slice(2)}`,
        pages: pages.sort((a, b) => new Date(a.page_date).getTime() - new Date(b.page_date).getTime()),
      };
    });
}

export function VisualTimeline({
  pages,
  label,
  color = "#891D1A",
  timelineId,
  showEmptyMessage = false,
}: VisualTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const monthGroups = groupPagesByMonth(pages);

  // Scroll to end (most recent) on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!scrollRef.current) return;
    e.preventDefault();
    scrollRef.current.scrollLeft += e.deltaY * 1.5;
  }, []);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;
    scrollElement.addEventListener("wheel", handleWheel, { passive: false });
    return () => scrollElement.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // Empty state — compact (individual timelines)
  if (pages.length === 0 && !showEmptyMessage) {
    return (
      <div
        className="relative rounded-sm overflow-hidden"
        style={{
          backgroundColor: "#F1E6D2",
          border: "1px solid rgba(137, 29, 26, 0.1)",
        }}
      >
        {label && (
          <div
            className="flex items-center gap-2 px-4 py-2 border-b"
            style={{ borderColor: "rgba(137, 29, 26, 0.15)", backgroundColor: "#210706" }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="font-[family-name:var(--font-playfair)] text-sm font-semibold text-[#F1E6D2]">
              {label}
            </span>
            <span className="font-[family-name:var(--font-crimson)] text-xs text-[#F1E6D2]/50 italic">
              empty
            </span>
            {timelineId && (
              <Link
                href={`/timeline?filter=${timelineId}`}
                className="ml-auto font-[family-name:var(--font-crimson)] text-xs text-[#891D1A] hover:underline"
              >
                Filter →
              </Link>
            )}
          </div>
        )}
        <div className="py-5 px-4 text-center">
          <p className="font-[family-name:var(--font-crimson)] text-sm text-[#5E657B] italic">
            No pages in this collection yet
          </p>
        </div>
      </div>
    );
  }

  // Empty state — prominent (master timeline)
  if (pages.length === 0 && showEmptyMessage) {
    return (
      <div
        className="relative rounded-sm p-8 text-center"
        style={{
          backgroundColor: "#F1E6D2",
          border: "1px dashed rgba(137, 29, 26, 0.3)",
        }}
      >
        {label && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-[#210706]">
              {label}
            </span>
          </div>
        )}
        <p className="font-[family-name:var(--font-crimson)] text-[#5E657B]">
          No pages to display on the timeline.
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-sm overflow-hidden"
      style={{
        backgroundColor: "#F1E6D2",
        boxShadow: "0 4px 20px rgba(33, 7, 6, 0.1)",
        border: "1px solid rgba(137, 29, 26, 0.15)",
      }}
    >
      {/* Label header */}
      {label && (
        <div
          className="flex items-center gap-2 px-4 py-3 border-b"
          style={{
            backgroundColor: "#210706",
            borderColor: "rgba(137, 29, 26, 0.3)",
            borderLeft: `4px solid ${color}`,
          }}
        >
          <span className="font-[family-name:var(--font-playfair)] text-sm font-semibold text-[#F1E6D2]">
            {label}
          </span>
          <span className="font-[family-name:var(--font-crimson)] text-xs text-[#F1E6D2]/50 italic">
            {pages.length} {pages.length === 1 ? "page" : "pages"}
          </span>
          {timelineId && (
            <Link
              href={`/timeline?filter=${timelineId}`}
              className="ml-auto font-[family-name:var(--font-crimson)] text-xs text-[#891D1A] hover:underline"
            >
              Filter →
            </Link>
          )}
        </div>
      )}

      {/* Scroll fade gradients */}
      <div className="pointer-events-none absolute left-0 top-12 bottom-0 w-16 bg-gradient-to-r from-[#F1E6D2] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-12 bottom-0 w-16 bg-gradient-to-l from-[#F1E6D2] to-transparent z-10" />

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className={`overflow-x-auto scrollbar-thin scrollbar-thumb-[#891D1A]/30 scrollbar-track-transparent ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ scrollBehavior: isDragging ? "auto" : "smooth" }}
      >
        <div className="flex items-center justify-start min-h-[320px] px-16 py-8">
          <div className="relative min-w-max flex items-center">
            {/* Timeline rail — Tuscan Red */}
            <div
              className="absolute left-0 right-0 h-px"
              style={{
                top: "50%",
                transform: "translateY(-50%)",
                background: `linear-gradient(to right, transparent, #891D1A60, #891D1A80, #891D1A60, transparent)`,
              }}
            />

            {/* Timeline content */}
            <div className="flex items-center gap-6">
              {(() => {
                let globalPageIndex = 0;
                return monthGroups.map((group, groupIndex) => (
                  <div key={group.key} className="flex items-center">
                    {/* Month marker */}
                    <div className="relative flex items-center justify-center mx-4">
                      <div className="w-px h-5 z-10" style={{ backgroundColor: "#891D1A60" }} />
                      <span
                        className="absolute top-full mt-2 font-[family-name:var(--font-crimson)] text-[11px] italic whitespace-nowrap text-[#891D1A]"
                      >
                        {group.label}
                      </span>
                    </div>

                    {/* Pages in this month */}
                    <div className="flex items-center gap-14 px-2">
                      {group.pages.map((page) => {
                        const isAbove = globalPageIndex % 2 === 0;
                        const currentIndex = globalPageIndex;
                        globalPageIndex++;
                        return (
                          <TimelineMarker
                            key={page.id}
                            page={page}
                            imageUrl={page.image_url}
                            index={currentIndex}
                            color={color}
                            isAbove={isAbove}
                          />
                        );
                      })}
                    </div>

                    {/* Connector to next month */}
                    {groupIndex < monthGroups.length - 1 && (
                      <div className="w-8 h-px" style={{ backgroundColor: "#891D1A30" }} />
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll instructions */}
      {!timelineId && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#F1E6D2]/80 px-3 py-1 rounded-full">
          <p className="font-[family-name:var(--font-crimson)] text-[11px] italic text-[#5E657B]">
            Scroll or drag to navigate · Click a photo to view
          </p>
        </div>
      )}
    </div>
  );
}
