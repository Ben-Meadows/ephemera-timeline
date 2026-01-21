"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { JournalPage } from "@/lib/types";

// Zoom overlay component for the animation
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
    // Start zoom animation after mount
    const startTimer = requestAnimationFrame(() => {
      setPhase("zooming");
    });

    // Show spinner if navigation takes longer than expected
    const spinnerTimer = setTimeout(() => {
      setShowSpinner(true);
    }, 600);

    return () => {
      cancelAnimationFrame(startTimer);
      clearTimeout(spinnerTimer);
    };
  }, []);

  // Calculate center position
  const endWidth = Math.min(window.innerWidth * 0.85, 900);
  const endHeight = Math.min(window.innerHeight * 0.85, 700);
  const endLeft = (window.innerWidth - endWidth) / 2;
  const endTop = (window.innerHeight - endHeight) / 2;

  const isZooming = phase === "zooming" || phase === "complete";

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Background dim */}
      <div
        className="absolute inset-0 bg-[#2c1810]"
        style={{
          opacity: isZooming ? 0.95 : 0,
          transition: "opacity 500ms ease-out",
        }}
      />

      {/* Zooming image container */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: isZooming ? endLeft : startRect.left,
          top: isZooming ? endTop : startRect.top,
          width: isZooming ? endWidth : startRect.width,
          height: isZooming ? endHeight : startRect.height,
          borderRadius: isZooming ? "4px" : "9999px",
          boxShadow: isZooming
            ? "0 25px 50px rgba(0, 0, 0, 0.5)"
            : "0 4px 12px rgba(0, 0, 0, 0.2)",
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
          <div className="w-full h-full bg-[#e8dfd3] flex items-center justify-center">
            <span className="font-[family-name:var(--font-playfair)] text-2xl text-[#8b7355]">
              {title || "Loading..."}
            </span>
          </div>
        )}

        {/* Gradient overlay for text readability */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-[#2c1810]/60 via-transparent to-transparent"
          style={{
            opacity: isZooming ? 1 : 0,
            transition: "opacity 400ms ease-out 200ms",
          }}
        />
      </div>

      {/* Title and loading indicator */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center"
        style={{
          opacity: isZooming ? 1 : 0,
          transform: isZooming ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(10px)",
          transition: "all 400ms ease-out 300ms",
        }}
      >
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-white mb-2">
          {title || "Untitled"}
        </h2>
        
        {/* Loading indicator */}
        <div className="flex items-center justify-center gap-2">
          {showSpinner && isNavigating && (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          <p className="font-[family-name:var(--font-typewriter)] text-sm text-white/70">
            {isNavigating ? "Loading page..." : "Opening..."}
          </p>
        </div>
      </div>

      {/* Decorative corners */}
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
        <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-[#d4a574]" />
        <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-[#d4a574]" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-[#d4a574]" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-[#d4a574]" />
      </div>
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
  color = "#8b4513",
  isAbove = true,
}: TimelineMarkerProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [markerRect, setMarkerRect] = useState<DOMRect | null>(null);
  const [isPending, startTransition] = useTransition();
  const markerRef = useRef<HTMLButtonElement>(null);

  const date = new Date(page.page_date);
  const day = date.getDate();
  const formattedDate = date.toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric", 
    year: "numeric" 
  });

  // Truncate title if too long
  const displayTitle = page.title 
    ? (page.title.length > 24 ? page.title.slice(0, 22) + "..." : page.title)
    : "Untitled";

  // Prefetch on hover for faster navigation
  const handleMouseEnter = () => {
    setIsHovered(true);
    router.prefetch(`/p/${page.id}`);
  };

  // Handle click with zoom animation
  const handleClick = () => {
    if (!markerRef.current || isZooming) return;

    // Get marker position for animation origin
    const rect = markerRef.current.getBoundingClientRect();
    setMarkerRect(rect);
    setIsZooming(true);

    // Navigate using startTransition to track pending state
    setTimeout(() => {
      startTransition(() => {
        router.push(`/p/${page.id}`);
      });
    }, 300);
  };

  // Track if marker is visible for entrance animation
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Entrance animation using IntersectionObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Stagger the animation based on index
            setTimeout(() => {
              setIsVisible(true);
            }, Math.min(index * 80, 400));
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 50px 0px 50px",
      }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [index]);

  // Annotation component (title + date with connecting line)
  const Annotation = () => (
    <div 
      className={`absolute left-1/2 flex flex-col items-center transition-all duration-500 ${
        isAbove ? "bottom-full mb-3" : "top-full mt-3"
      } ${isVisible ? "opacity-100" : "opacity-0"}`}
      style={{
        transform: `translateX(-50%) ${isVisible ? "translateY(0)" : (isAbove ? "translateY(8px)" : "translateY(-8px)")}`,
      }}
    >
      {/* Connecting line */}
      <div 
        className={`w-px h-5 transition-all duration-300 ${isAbove ? "order-2" : "order-1"}`}
        style={{ 
          backgroundColor: `${color}50`,
          transform: isVisible ? "scaleY(1)" : "scaleY(0)",
          transformOrigin: isAbove ? "bottom" : "top",
        }}
      />
      
      {/* Text content */}
      <div 
        className={`text-center max-w-[130px] ${isAbove ? "order-1 pb-0.5" : "order-2 pt-0.5"}`}
      >
        <p 
          className="font-[family-name:var(--font-playfair)] text-[13px] font-semibold text-[#2c1810] leading-tight"
          title={page.title || "Untitled"}
        >
          {displayTitle}
        </p>
        <p 
          className="font-[family-name:var(--font-typewriter)] text-[9px] mt-0.5 uppercase tracking-wide"
          style={{ color: `${color}` }}
        >
          {formattedDate}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* The marker container with annotation */}
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
          className="relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4513] focus-visible:ring-offset-2 rounded-full disabled:cursor-wait z-10"
        >
          {/* Large marker circle with thumbnail */}
          <div
            className={`
              relative w-[88px] h-[88px] rounded-full overflow-hidden transition-all duration-300
              ${isHovered && !isZooming ? "scale-110 shadow-xl" : "shadow-lg"}
              ${isZooming ? "scale-105" : ""}
            `}
            style={{
              backgroundColor: "#e8dfd3",
              border: `3px solid ${isHovered || isZooming ? color : `${color}70`}`,
              boxShadow: isHovered
                ? `0 12px 32px rgba(44, 24, 16, 0.25), 0 0 0 4px ${color}20`
                : "0 6px 20px rgba(44, 24, 16, 0.15)",
            }}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={page.title || "Page"}
                fill
                sizes="88px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#e8dfd3]">
                <span className="font-[family-name:var(--font-typewriter)] text-lg text-[#8b7355]">
                  {day}
                </span>
              </div>
            )}

            {/* Subtle hover overlay */}
            <div
              className={`
                absolute inset-0 bg-gradient-to-t from-[#2c1810]/50 to-transparent 
                flex items-end justify-center pb-2 transition-opacity duration-200
                ${isHovered && !isZooming ? "opacity-100" : "opacity-0"}
              `}
            >
              <span className="text-white text-sm font-medium">View →</span>
            </div>
          </div>
        </button>

        {/* Always-visible annotation */}
        <Annotation />
      </div>

      {/* Zoom overlay */}
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
