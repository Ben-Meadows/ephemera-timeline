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
      <div
        className={`w-px h-4 bg-[#891D1A]/40 ${isAbove ? "order-2" : "order-1"}`}
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
            className="absolute left-1/2 w-2 h-2 rounded-full z-20"
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
