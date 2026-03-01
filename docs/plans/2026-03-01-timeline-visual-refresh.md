# Timeline Visual Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the timeline page and all timeline components from a sepia/typewriter aesthetic to an eclectic collage-board aesthetic using the new brand palette.

**Architecture:** Pure styling changes — no data fetching, server actions, or component structure altered. Six files need updating. The most complex change is `timeline-marker.tsx` which moves from circular thumbnails to polaroid-shaped cards with random tilt.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4 (use `[arbitrary]` values for non-standard sizes), TypeScript. No test framework is configured — verification is visual in the browser (`npm run dev`).

**Design doc:** `docs/plans/2026-03-01-timeline-visual-refresh-design.md`

---

## Color Reference

```
#210706  Olivewood     — headers, primary text, zoom overlay bg
#891D1A  Tuscan Red    — dates, timeline rail, active states, CTA buttons
#5E657B  Slate Blue    — controls, secondary text, metadata
#F1E6D2  Creamy Biscotti — page bg, card bg, text on dark surfaces
#FAFAF9  Polaroid white  — polaroid card background
```

---

## Task 1: Update `timeline-view-toggle.tsx`

**Files:**
- Modify: `src/components/timeline/timeline-view-toggle.tsx`

**Step 1: Replace the entire component content**

Replace with:

```tsx
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
```

**Step 2: Start the dev server and verify visually**

```bash
npm run dev
```

Navigate to `/timeline`. Confirm the toggle shows Slate Blue active pill with cream text, and inactive option shows Slate Blue text on transparent. Labels are "List" and "Visual" (no emoji, no caps).

**Step 3: Commit**

```bash
git add src/components/timeline/timeline-view-toggle.tsx
git commit -m "style: update view toggle to new color palette"
```

---

## Task 2: Update `timeline-filter.tsx`

**Files:**
- Modify: `src/components/timeline/timeline-filter.tsx`

**Step 1: Replace the entire component content**

```tsx
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
```

**Step 2: Verify visually**

On `/timeline`, the "Filter:" label should be Slate Blue in Crimson Text, and the dropdown should have a Biscotti background with Olivewood text and Slate Blue border/focus.

**Step 3: Commit**

```bash
git add src/components/timeline/timeline-filter.tsx
git commit -m "style: update collection filter to new color palette"
```

---

## Task 3: Update the page header in `timeline/page.tsx`

**Files:**
- Modify: `src/app/timeline/page.tsx` (lines 92–144 — the JSX header section only)

**Step 1: Replace only the header card JSX**

Find this block starting at line 92:
```tsx
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
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
```

Replace with:

```tsx
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Header */}
      <div
        className="rounded-sm overflow-hidden"
        style={{
          boxShadow: "0 2px 16px rgba(33, 7, 6, 0.18)",
          border: "1px solid rgba(137, 29, 26, 0.2)",
        }}
      >
        {/* Dark header band */}
        <div
          className="relative p-6"
          style={{
            backgroundColor: "#210706",
            borderLeft: "4px solid #891D1A",
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-[family-name:var(--font-crimson)] text-xs text-[#891D1A] italic">
                My Collection
              </p>
              <h1 className="mt-1 font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#F1E6D2]">
                {selectedTimeline ? (
                  <>
                    <span className="mr-2">{selectedTimeline.icon}</span>
                    {selectedTimeline.name}
                  </>
                ) : (
                  "Your Timeline"
                )}
              </h1>
              <p className="mt-1 font-[family-name:var(--font-crimson)] text-sm text-[#F1E6D2]/60">
                {selectedTimeline
                  ? selectedTimeline.description || "Filtered collection"
                  : "All pages arranged chronologically"}
              </p>
            </div>
            <Link
              href="/new"
              className="shrink-0 rounded-sm px-4 py-2 font-[family-name:var(--font-crimson)] text-sm font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: "#891D1A", color: "#F1E6D2" }}
            >
              + New Page
            </Link>
          </div>
        </div>

        {/* Controls row — cream background */}
        <div
          className="flex flex-wrap items-center gap-4 px-6 py-3"
          style={{
            backgroundColor: "#F1E6D2",
            borderTop: "2px solid rgba(137, 29, 26, 0.25)",
          }}
        >
          <TimelineViewToggle currentView={viewMode} />
          <TimelineFilter
            timelines={(timelines as Timeline[]) || []}
            currentFilter={filterTimelineId}
          />
          {filterTimelineId && (
            <Link
              href="/timeline"
              className="font-[family-name:var(--font-crimson)] text-sm text-[#891D1A] hover:underline"
            >
              × Clear filter
            </Link>
          )}
        </div>
      </div>
```

**Step 2: Verify visually**

The header should show a dark Olivewood band with cream title text, a Tuscan Red left accent bar, and a Biscotti controls row below with a Tuscan Red separator line.

**Step 3: Commit**

```bash
git add src/app/timeline/page.tsx
git commit -m "style: update timeline page header to dark olivewood design"
```

---

## Task 4: Update `visual-timeline.tsx`

**Files:**
- Modify: `src/components/timeline/visual-timeline.tsx`

**Step 1: Replace the entire file content**

```tsx
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
```

**Step 2: Verify visually**

The visual timeline should now have:
- Biscotti background
- Dark Olivewood label header with cream text and Tuscan Red left accent
- Tuscan Red timeline rail (thin, gradient fade on edges)
- Month labels in Crimson italic Tuscan Red

**Step 3: Commit**

```bash
git add src/components/timeline/visual-timeline.tsx
git commit -m "style: update visual timeline container to new palette"
```

---

## Task 5: Update `timeline-marker.tsx` — polaroid style

This is the most significant change. The circular thumbnail becomes a polaroid card with random tilt. The annotation now shows only the title (date moves into the polaroid's white strip).

**Files:**
- Modify: `src/components/timeline/timeline-marker.tsx`

**Step 1: Replace the entire file content**

```tsx
"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { JournalPage } from "@/lib/types";

// Tilt angles that cycle based on marker index for collage feel
const TILTS = ["-2deg", "1.5deg", "-1deg", "2.5deg"];

function ZoomOverlay({
  imageUrl,
  title,
  startRect,
  isNavigating,
}: {
  imageUrl?: string;
  title: string | null;
  startRect: DOMRect;
  isNavigating: boolean;
}) {
  const [phase, setPhase] = useState<"start" | "zooming" | "complete">("start");
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    const startTimer = requestAnimationFrame(() => setPhase("zooming"));
    const spinnerTimer = setTimeout(() => setShowSpinner(true), 600);
    return () => {
      cancelAnimationFrame(startTimer);
      clearTimeout(spinnerTimer);
    };
  }, []);

  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const endWidth = Math.min(vw * 0.85, 900);
  const endHeight = Math.min(vh * 0.85, 700);
  const endLeft = (vw - endWidth) / 2;
  const endTop = (vh - endHeight) / 2;
  const isZooming = phase === "zooming" || phase === "complete";

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "#210706",
          opacity: isZooming ? 0.95 : 0,
          transition: "opacity 500ms ease-out",
        }}
      />

      <div
        className="absolute overflow-hidden"
        style={{
          left: isZooming ? endLeft : startRect.left,
          top: isZooming ? endTop : startRect.top,
          width: isZooming ? endWidth : startRect.width,
          height: isZooming ? endHeight : startRect.height,
          borderRadius: isZooming ? "4px" : "2px",
          boxShadow: isZooming
            ? "0 25px 50px rgba(0, 0, 0, 0.5)"
            : "0 4px 12px rgba(33, 7, 6, 0.3)",
          transition: "all 500ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title || "Page"}
            fill
            sizes="85vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#F1E6D2" }}>
            <span className="font-[family-name:var(--font-playfair)] text-2xl text-[#5E657B]">
              {title || "Loading..."}
            </span>
          </div>
        )}

        <div
          className="absolute inset-0 bg-gradient-to-t from-[#210706]/60 via-transparent to-transparent"
          style={{
            opacity: isZooming ? 1 : 0,
            transition: "opacity 400ms ease-out 200ms",
          }}
        />
      </div>

      {/* Title overlay */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center"
        style={{
          opacity: isZooming ? 1 : 0,
          transform: isZooming ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(10px)",
          transition: "all 400ms ease-out 300ms",
        }}
      >
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#F1E6D2] mb-2">
          {title || "Untitled"}
        </h2>
        <div className="flex items-center justify-center gap-2">
          {showSpinner && isNavigating && (
            <div className="w-4 h-4 border-2 border-[#F1E6D2]/30 border-t-[#F1E6D2] rounded-full animate-spin" />
          )}
          <p className="font-[family-name:var(--font-crimson)] text-sm text-[#F1E6D2]/70 italic">
            {isNavigating ? "Loading page..." : "Opening..."}
          </p>
        </div>
      </div>

      {/* Corner accents on zoomed frame */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: isZooming ? endLeft - 8 : startRect.left,
          top: isZooming ? endTop - 8 : startRect.top,
          width: isZooming ? endWidth + 16 : startRect.width,
          height: isZooming ? endHeight + 16 : startRect.height,
          opacity: isZooming ? 1 : 0,
          transition: "all 500ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-[#891D1A]" />
        <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-[#891D1A]" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-[#891D1A]" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-[#891D1A]" />
      </div>
    </div>
  );
}

type AnnotationProps = {
  isAbove: boolean;
  isVisible: boolean;
  displayTitle: string;
  pageTitle: string | null;
};

function Annotation({ isAbove, isVisible, displayTitle, pageTitle }: AnnotationProps) {
  return (
    <div
      className={`absolute left-1/2 flex flex-col items-center transition-all duration-500 ${
        isAbove ? "bottom-full mb-2" : "top-full mt-2"
      } ${isVisible ? "opacity-100" : "opacity-0"}`}
      style={{
        transform: `translateX(-50%) ${isVisible ? "translateY(0)" : (isAbove ? "translateY(6px)" : "translateY(-6px)")}`,
      }}
    >
      <div className={`w-px h-4 bg-[#891D1A]/40 ${isAbove ? "order-2" : "order-1"}`}
        style={{
          transform: isVisible ? "scaleY(1)" : "scaleY(0)",
          transformOrigin: isAbove ? "bottom" : "top",
          transition: "transform 0.3s",
        }}
      />
      <p
        className={`font-[family-name:var(--font-playfair)] text-[12px] font-semibold text-[#210706] leading-tight text-center max-w-[110px] ${
          isAbove ? "order-1 pb-0.5" : "order-2 pt-0.5"
        }`}
        title={pageTitle || "Untitled"}
      >
        {displayTitle}
      </p>
    </div>
  );
}

type TimelineMarkerProps = {
  page: JournalPage;
  imageUrl?: string;
  index: number;
  color?: string;
  isAbove?: boolean;
};

export function TimelineMarker({
  page,
  imageUrl,
  index,
  color = "#891D1A",
  isAbove = true,
}: TimelineMarkerProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [markerRect, setMarkerRect] = useState<DOMRect | null>(null);
  const [isPending, startTransition] = useTransition();
  const markerRef = useRef<HTMLButtonElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const date = new Date(page.page_date);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const displayTitle = page.title
    ? page.title.length > 20 ? page.title.slice(0, 18) + "…" : page.title
    : "Untitled";

  const tilt = TILTS[index % TILTS.length];

  const handleMouseEnter = () => {
    setIsHovered(true);
    router.prefetch(`/p/${page.id}`);
  };

  const handleClick = () => {
    if (!markerRef.current || isZooming) return;
    const rect = markerRef.current.getBoundingClientRect();
    setMarkerRect(rect);
    setIsZooming(true);
    setTimeout(() => {
      startTransition(() => router.push(`/p/${page.id}`));
    }, 300);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setIsVisible(true), Math.min(index * 80, 400));
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 50px 0px 50px" }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [index]);

  return (
    <>
      <div
        ref={containerRef}
        className={`relative flex flex-col items-center transition-all duration-500 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{
          transform: isVisible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.9)",
        }}
      >
        <button
          ref={markerRef}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setIsHovered(false)}
          disabled={isZooming}
          className="relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#891D1A] focus-visible:ring-offset-2 disabled:cursor-wait z-10"
        >
          {/* Polaroid card */}
          <div
            style={{
              backgroundColor: "#FAFAF9",
              padding: "7px 7px 0 7px",
              transform: isHovered ? "rotate(0deg) scale(1.08)" : `rotate(${tilt}) scale(1)`,
              transformOrigin: "center bottom",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              boxShadow: isHovered
                ? "0 12px 28px rgba(33, 7, 6, 0.35)"
                : "0 4px 12px rgba(33, 7, 6, 0.22)",
              border: "1px solid rgba(33, 7, 6, 0.08)",
            }}
          >
            {/* Photo area */}
            <div className="relative w-[86px] h-[86px] overflow-hidden bg-[#F1E6D2]">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={page.title || "Page"}
                  fill
                  sizes="86px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-[family-name:var(--font-playfair)] text-lg text-[#5E657B]">
                    {date.getDate()}
                  </span>
                </div>
              )}

              {/* Hover overlay */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#210706]/50 to-transparent flex items-end justify-center pb-1.5 transition-opacity duration-200"
                style={{ opacity: isHovered && !isZooming ? 1 : 0 }}
              >
                <span className="font-[family-name:var(--font-crimson)] text-[#F1E6D2] text-xs italic">
                  View →
                </span>
              </div>
            </div>

            {/* White date strip */}
            <div className="flex items-center justify-center h-7 px-1">
              <span
                className="font-[family-name:var(--font-crimson)] text-[11px] italic whitespace-nowrap"
                style={{ color: "#891D1A" }}
              >
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Dot on the timeline rail */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full z-20"
            style={{
              top: "50%",
              transform: "translateX(-50%) translateY(-50%)",
              backgroundColor: color,
            }}
          />
        </button>

        {/* Title annotation */}
        <Annotation
          isAbove={isAbove}
          isVisible={isVisible}
          displayTitle={displayTitle}
          pageTitle={page.title}
        />
      </div>

      {isZooming && markerRect && (
        <ZoomOverlay
          imageUrl={imageUrl}
          title={page.title}
          startRect={markerRect}
          isNavigating={isPending}
        />
      )}
    </>
  );
}
```

**Step 2: Verify visually**

On the visual timeline, markers should now look like tilted polaroid photos — square photo with a white frame and a white date strip at the bottom. Hovering should straighten the tilt and scale it up. The title annotation should appear above/below alternating. The timeline rail dot should be Tuscan Red.

Check that the zoom animation still works when clicking a marker (it should zoom from the polaroid card's position).

**Step 3: Commit**

```bash
git add src/components/timeline/timeline-marker.tsx
git commit -m "style: replace circular markers with polaroid-style cards"
```

---

## Task 6: Update `page-card.tsx` — list view

**Files:**
- Modify: `src/components/page/page-card.tsx`

**Step 1: Replace the entire file content**

```tsx
import Image from "next/image";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPageImageUrl } from "@/lib/supabase/storage";
import type { JournalPage } from "@/lib/types";

type PageCardProps = {
  page: JournalPage & { image_url?: string };
  href: string;
};

function visibilityBadge(visibility: string) {
  // All badges use Slate Blue tint in the new palette
  return "bg-[#5E657B]/10 text-[#5E657B] border-[#5E657B]/30";
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return {
    day: date.getDate(),
    month: months[date.getMonth()],
    year: date.getFullYear(),
  };
}

export async function PageCard({ page, href }: PageCardProps) {
  let imageUrl = page.image_url;
  if (!imageUrl) {
    const supabase = await createSupabaseServerClient();
    imageUrl = await getPageImageUrl(supabase, page.image_path, page.visibility);
  }
  const dateInfo = formatDate(page.page_date);

  return (
    <Link
      href={href}
      className="group relative flex gap-5 rounded-sm bg-[#F1E6D2] p-5 transition-all duration-300 hover:-translate-y-1"
      style={{
        boxShadow: '2px 3px 12px rgba(33, 7, 6, 0.08), 0 1px 3px rgba(33, 7, 6, 0.05)',
        border: '1px solid rgba(137, 29, 26, 0.12)',
      }}
    >
      {/* Tape decoration */}
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-4 opacity-50"
        style={{
          background: 'linear-gradient(180deg, rgba(137, 29, 26, 0.35) 0%, rgba(137, 29, 26, 0.2) 100%)',
          transform: 'translateX(-50%) rotate(-1deg)',
        }}
      />

      {/* Polaroid-style photo */}
      <div
        className="relative flex-shrink-0 overflow-hidden"
        style={{
          width: '108px',
          height: '124px',
          backgroundColor: '#FAFAF9',
          padding: '6px 6px 0 6px',
          boxShadow: '0 3px 10px rgba(33, 7, 6, 0.18)',
          border: '1px solid rgba(33, 7, 6, 0.06)',
        }}
      >
        {/* Photo area */}
        <div className="relative w-full overflow-hidden bg-[#F1E6D2]" style={{ height: '88px' }}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={page.title ?? "Journal page"}
              fill
              sizes="96px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-[family-name:var(--font-crimson)] text-xs italic text-[#5E657B]">
                No image
              </span>
            </div>
          )}
        </div>
        {/* Polaroid date strip */}
        <div className="flex items-center justify-center h-[30px]">
          <span className="font-[family-name:var(--font-crimson)] text-[10px] italic text-[#891D1A]">
            {dateInfo.month} {dateInfo.day}, {dateInfo.year}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between py-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          {/* Postmark-style date circle */}
          <div
            className="flex flex-col items-center justify-center rounded-full border-2 border-[#891D1A] px-3 py-1 opacity-80"
            style={{ transform: 'rotate(-8deg)' }}
          >
            <span className="font-[family-name:var(--font-crimson)] text-[9px] leading-none text-[#891D1A] italic">
              {dateInfo.month}
            </span>
            <span className="font-[family-name:var(--font-playfair)] text-lg font-bold leading-none text-[#891D1A]">
              {dateInfo.day}
            </span>
            <span className="font-[family-name:var(--font-crimson)] text-[9px] leading-none text-[#891D1A] italic">
              {dateInfo.year}
            </span>
          </div>

          {/* Visibility badge */}
          <span
            className={`rounded-sm border px-2 py-0.5 font-[family-name:var(--font-crimson)] text-[10px] italic ${visibilityBadge(page.visibility)}`}
          >
            {page.visibility}
          </span>
        </div>

        {/* Title and caption */}
        <div className="mt-2 space-y-1">
          <h3 className="font-[family-name:var(--font-playfair)] text-base font-semibold text-[#210706] group-hover:text-[#891D1A] transition-colors">
            {page.title || "Untitled page"}
          </h3>
          {page.caption && (
            <p className="font-[family-name:var(--font-crimson)] text-sm text-[#5E657B] line-clamp-2 italic">
              {page.caption}
            </p>
          )}
        </div>
      </div>

      {/* Hover indicator */}
      <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="font-[family-name:var(--font-crimson)] text-xs italic text-[#891D1A]">
          View →
        </span>
      </div>
    </Link>
  );
}
```

**Step 2: Verify visually**

Switch to list view on `/timeline`. Cards should use Biscotti background with a polaroid-style image (photo + white strip with date), an Olivewood title (hover Tuscan Red), Slate Blue caption, and Tuscan Red date postmark circle. Tape decoration is more subtle (red-tinted).

**Step 3: Commit**

```bash
git add src/components/page/page-card.tsx
git commit -m "style: update page card list view to new palette with polaroid photo"
```

---

## Final: Verify end-to-end

1. Visit `/timeline` — confirm dark Olivewood header, Biscotti body, Slate Blue controls
2. Switch to visual view — confirm Biscotti container, Tuscan Red rail, polaroid markers with tilt
3. Click a marker — confirm zoom animation starts from the polaroid card
4. Switch back to list view — confirm polaroid-style cards with correct colors
5. Open a filtered timeline view — confirm header shows collection name in same dark style

---

## Optional follow-up (out of scope for this plan)

- Apply the same palette to `/timelines` (collections management page) — not covered here
- Apply the same palette to `/p/[id]` (page detail header) — not covered here
- Add Olivewood/Tuscan Red to the global nav (`nav.tsx`) — not covered here
