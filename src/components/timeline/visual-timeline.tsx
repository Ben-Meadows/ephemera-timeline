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
        label: `${monthNames[parseInt(month) - 1]} ${year}`,
        pages: pages.sort((a, b) => new Date(a.page_date).getTime() - new Date(b.page_date).getTime()),
      };
    });
}

export function VisualTimeline({ 
  pages, 
  label, 
  color = "#8b4513",
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

  // Mouse drag handlers for horizontal scrolling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // Wheel scroll handler - scroll horizontally when mouse wheel is used
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!scrollRef.current) return;
    
    // Prevent vertical page scroll when hovering over timeline
    e.preventDefault();
    
    // Convert vertical scroll to horizontal
    scrollRef.current.scrollLeft += e.deltaY * 1.5;
  }, []);

  // Add wheel event listener
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    scrollElement.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      scrollElement.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  // Empty state for individual timelines (compact)
  if (pages.length === 0 && !showEmptyMessage) {
    return (
      <div
        className="relative rounded-sm bg-[#f5efe6] overflow-hidden"
        style={{
          boxShadow: "0 2px 12px rgba(44, 24, 16, 0.04)",
          border: "1px solid rgba(139, 69, 19, 0.08)",
        }}
      >
        {/* Label header */}
        {label && (
          <div
            className="flex items-center gap-2 px-4 py-2 border-b"
            style={{ borderColor: `${color}20` }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="font-[family-name:var(--font-playfair)] text-sm font-semibold text-[#2c1810]">
              {label}
            </span>
            <span className="font-[family-name:var(--font-typewriter)] text-[10px] text-[#8b7355]">
              (empty)
            </span>
            {timelineId && (
              <Link
                href={`/timeline?filter=${timelineId}`}
                className="ml-auto font-[family-name:var(--font-typewriter)] text-[10px] text-[#8b4513] hover:underline"
              >
                Filter →
              </Link>
            )}
          </div>
        )}
        <div className="py-6 px-4 text-center">
          <p className="font-[family-name:var(--font-crimson)] text-sm text-[#8b7355]">
            No pages in this collection yet
          </p>
        </div>
      </div>
    );
  }

  // Empty state for master timeline (prominent)
  if (pages.length === 0 && showEmptyMessage) {
    return (
      <div
        className="relative rounded-sm bg-[#f5efe6] p-8 text-center"
        style={{
          boxShadow: "0 2px 12px rgba(44, 24, 16, 0.06)",
          border: "1px dashed rgba(139, 69, 19, 0.3)",
        }}
      >
        {label && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-[#2c1810]">
              {label}
            </span>
          </div>
        )}
        <p className="font-[family-name:var(--font-crimson)] text-[#5c4033]">
          No pages to display on the timeline.
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-sm bg-[#f5efe6] overflow-hidden"
      style={{
        boxShadow: "0 4px 20px rgba(44, 24, 16, 0.08)",
        border: "1px solid rgba(139, 69, 19, 0.12)",
      }}
    >
      {/* Label header */}
      {label && (
        <div
          className="flex items-center gap-2 px-4 py-3 border-b"
          style={{ borderColor: `${color}30` }}
        >
          <div
            className="w-4 h-4 rounded-full shadow-sm"
            style={{ backgroundColor: color }}
          />
          <span className="font-[family-name:var(--font-playfair)] text-base font-semibold text-[#2c1810]">
            {label}
          </span>
          <span className="font-[family-name:var(--font-typewriter)] text-[10px] text-[#8b7355]">
            {pages.length} {pages.length === 1 ? "page" : "pages"}
          </span>
          {timelineId && (
            <Link
              href={`/timeline?filter=${timelineId}`}
              className="ml-auto font-[family-name:var(--font-typewriter)] text-xs text-[#8b4513] hover:underline"
            >
              Filter →
            </Link>
          )}
        </div>
      )}

      {/* Scroll hint gradients */}
      <div className="pointer-events-none absolute left-0 top-12 bottom-0 w-20 bg-gradient-to-r from-[#f5efe6] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-12 bottom-0 w-20 bg-gradient-to-l from-[#f5efe6] to-transparent z-10" />

      {/* Scrollable container - centered content with proper spacing */}
      <div
        ref={scrollRef}
        className={`overflow-x-auto scrollbar-thin scrollbar-thumb-[#d4a574] scrollbar-track-transparent ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ scrollBehavior: isDragging ? "auto" : "smooth" }}
      >
        {/* Inner wrapper for vertical centering and padding */}
        <div className="flex items-center justify-start min-h-[320px] px-16 py-8">
          <div className="relative min-w-max flex items-center">
            {/* The timeline line - positioned to align with markers */}
            <div
              className="absolute left-0 right-0 h-0.5"
              style={{
                top: "50%",
                transform: "translateY(-50%)",
                background: `linear-gradient(to right, ${color}30, ${color}80, ${color}30)`,
              }}
            />

            {/* Timeline content */}
            <div className="flex items-center gap-6">
              {(() => {
                let globalPageIndex = 0;
                return monthGroups.map((group, groupIndex) => (
                  <div key={group.key} className="flex items-center">
                    {/* Month marker - subtle vertical line with label below */}
                    <div className="relative flex items-center justify-center mx-4">
                      <div
                        className="w-px h-6 z-10"
                        style={{ backgroundColor: `${color}60` }}
                      />
                      <span
                        className="absolute top-full mt-2 font-[family-name:var(--font-typewriter)] text-[10px] uppercase tracking-wider whitespace-nowrap"
                        style={{ color: `${color}` }}
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
                      <div
                        className="w-10 h-px"
                        style={{ backgroundColor: `${color}40` }}
                      />
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions - only show on first/master timeline */}
      {!timelineId && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#f5efe6]/80 px-3 py-1 rounded-full">
          <p className="font-[family-name:var(--font-typewriter)] text-[10px] text-[#8b7355]">
            Scroll or drag to navigate · Click a marker to view
          </p>
        </div>
      )}
    </div>
  );
}
