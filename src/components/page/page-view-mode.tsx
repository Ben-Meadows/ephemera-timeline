"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import type { PageItem } from "@/lib/types";

type PageViewModeProps = {
  imageUrl: string;
  items: PageItem[];
};

type AnnotationPosition = {
  markerX: number;
  markerY: number;
  boxX: number;
  boxY: number;
  arrowEndX: number;
  arrowEndY: number;
  boxSide: "left" | "right" | "top" | "bottom";
};

function calculateAnnotationPosition(
  markerX: number,
  markerY: number,
  containerWidth: number,
  containerHeight: number
): AnnotationPosition {
  // Box dimensions in pixels
  const boxWidth = 280;
  const boxHeight = 200;
  const gap = 40; // Gap between marker and box
  const padding = 10; // Padding from edges

  // Convert to pixels for calculations
  const markerPxX = markerX * containerWidth;
  const markerPxY = markerY * containerHeight;

  let boxSide: "left" | "right" | "top" | "bottom";
  let boxPxX: number;
  let boxPxY: number;
  let arrowEndPxX: number;
  let arrowEndPxY: number;

  // PRIMARY RULE: Follow the marker's side of the image
  // If marker is on right half -> box goes to the RIGHT
  // If marker is on left half -> box goes to the LEFT
  const isOnRightSide = markerX > 0.5;

  // Calculate available space
  const spaceRight = containerWidth - markerPxX;
  const spaceLeft = markerPxX;
  const spaceBottom = containerHeight - markerPxY;
  const spaceTop = markerPxY;

  // Minimum space needed
  const minHorizontalSpace = boxWidth + gap + padding;
  const minVerticalSpace = boxHeight + gap + padding;

  if (isOnRightSide && spaceRight >= minHorizontalSpace) {
    // Marker on right side, box goes RIGHT (out to the edge)
    boxSide = "right";
    boxPxX = markerPxX + gap;
    // Vertically center box near marker, but keep within bounds
    boxPxY = Math.max(padding, Math.min(markerPxY - boxHeight / 2, containerHeight - boxHeight - padding));
    // Arrow connects to left edge of box, vertically centered
    arrowEndPxX = boxPxX;
    arrowEndPxY = boxPxY + boxHeight / 2;
  } else if (!isOnRightSide && spaceLeft >= minHorizontalSpace) {
    // Marker on left side, box goes LEFT
    boxSide = "left";
    boxPxX = markerPxX - gap - boxWidth;
    boxPxY = Math.max(padding, Math.min(markerPxY - boxHeight / 2, containerHeight - boxHeight - padding));
    // Arrow connects to right edge of box
    arrowEndPxX = boxPxX + boxWidth;
    arrowEndPxY = boxPxY + boxHeight / 2;
  } else if (spaceBottom >= minVerticalSpace) {
    // Fallback: box goes BELOW
    boxSide = "bottom";
    boxPxX = Math.max(padding, Math.min(markerPxX - boxWidth / 2, containerWidth - boxWidth - padding));
    boxPxY = markerPxY + gap;
    // Arrow connects to top edge of box, horizontally centered
    arrowEndPxX = boxPxX + boxWidth / 2;
    arrowEndPxY = boxPxY;
  } else if (spaceTop >= minVerticalSpace) {
    // Fallback: box goes ABOVE
    boxSide = "top";
    boxPxX = Math.max(padding, Math.min(markerPxX - boxWidth / 2, containerWidth - boxWidth - padding));
    boxPxY = markerPxY - gap - boxHeight;
    arrowEndPxX = boxPxX + boxWidth / 2;
    arrowEndPxY = boxPxY + boxHeight;
  } else {
    // Last resort: force to the side with more space
    if (spaceRight > spaceLeft) {
      boxSide = "right";
      boxPxX = Math.min(markerPxX + gap, containerWidth - boxWidth - padding);
      boxPxY = Math.max(padding, Math.min(markerPxY - boxHeight / 2, containerHeight - boxHeight - padding));
      arrowEndPxX = boxPxX;
      arrowEndPxY = boxPxY + boxHeight / 2;
    } else {
      boxSide = "left";
      boxPxX = Math.max(padding, markerPxX - gap - boxWidth);
      boxPxY = Math.max(padding, Math.min(markerPxY - boxHeight / 2, containerHeight - boxHeight - padding));
      arrowEndPxX = boxPxX + boxWidth;
      arrowEndPxY = boxPxY + boxHeight / 2;
    }
  }

  // Convert back to percentages
  return {
    markerX,
    markerY,
    boxX: boxPxX / containerWidth,
    boxY: boxPxY / containerHeight,
    arrowEndX: arrowEndPxX / containerWidth,
    arrowEndY: arrowEndPxY / containerHeight,
    boxSide,
  };
}

// SVG Arrow component with animation
function AnimatedArrow({
  startX,
  startY,
  endX,
  endY,
  containerWidth,
  containerHeight,
  isVisible,
  side,
}: {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  containerWidth: number;
  containerHeight: number;
  isVisible: boolean;
  side: "left" | "right" | "top" | "bottom";
}) {
  const [pathLength, setPathLength] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);

  // Convert percentages to pixels
  const x1 = startX * containerWidth;
  const y1 = startY * containerHeight;
  const x2 = endX * containerWidth;
  const y2 = endY * containerHeight;

  // Create a nice curved path based on direction
  let pathD: string;
  const curveAmount = 25;

  if (side === "right") {
    // Curve downward for right-going arrows
    const midX = (x1 + x2) / 2;
    const curveY = Math.min(y1, y2) + Math.abs(y2 - y1) / 2 + curveAmount;
    pathD = `M ${x1} ${y1} Q ${midX} ${curveY} ${x2} ${y2}`;
  } else if (side === "left") {
    // Curve downward for left-going arrows
    const midX = (x1 + x2) / 2;
    const curveY = Math.min(y1, y2) + Math.abs(y2 - y1) / 2 + curveAmount;
    pathD = `M ${x1} ${y1} Q ${midX} ${curveY} ${x2} ${y2}`;
  } else if (side === "bottom") {
    // Curve to the right for downward arrows
    const midY = (y1 + y2) / 2;
    const curveX = Math.max(x1, x2) + curveAmount;
    pathD = `M ${x1} ${y1} Q ${curveX} ${midY} ${x2} ${y2}`;
  } else {
    // Curve to the right for upward arrows
    const midY = (y1 + y2) / 2;
    const curveX = Math.max(x1, x2) + curveAmount;
    pathD = `M ${x1} ${y1} Q ${curveX} ${midY} ${x2} ${y2}`;
  }

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [x1, y1, x2, y2]);

  return (
    <svg
      className="absolute inset-0 pointer-events-none overflow-visible z-15"
      style={{ width: containerWidth, height: containerHeight }}
    >
      {/* Shadow/glow under the arrow */}
      <path
        d={pathD}
        fill="none"
        stroke="rgba(139, 69, 19, 0.2)"
        strokeWidth="6"
        strokeLinecap="round"
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: isVisible ? 0 : pathLength,
          transition: "stroke-dashoffset 350ms ease-out",
        }}
      />
      {/* Main arrow path */}
      <path
        ref={pathRef}
        d={pathD}
        fill="none"
        stroke="#8b4513"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: isVisible ? 0 : pathLength,
          transition: "stroke-dashoffset 350ms ease-out",
        }}
      />
      {/* Arrow head dot */}
      <circle
        cx={x2}
        cy={y2}
        r="5"
        fill="#8b4513"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "scale(1)" : "scale(0)",
          transformOrigin: `${x2}px ${y2}px`,
          transition: "all 200ms ease-out 250ms",
        }}
      />
      {/* Starting dot on marker */}
      <circle
        cx={x1}
        cy={y1}
        r="3"
        fill="#722f37"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: "opacity 150ms ease-out",
        }}
      />
    </svg>
  );
}

// Annotation info box
function AnnotationBox({
  item,
  position,
  containerWidth,
  containerHeight,
  isVisible,
  onClose,
}: {
  item: PageItem;
  position: AnnotationPosition;
  containerWidth: number;
  containerHeight: number;
  isVisible: boolean;
  onClose: () => void;
}) {
  // Format date nicely
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  // Determine animation origin based on side
  const getTransformOrigin = () => {
    switch (position.boxSide) {
      case "left": return "right center";
      case "right": return "left center";
      case "top": return "center bottom";
      case "bottom": return "center top";
    }
  };

  return (
    <>
      {/* Arrow */}
      <AnimatedArrow
        startX={position.markerX}
        startY={position.markerY}
        endX={position.arrowEndX}
        endY={position.arrowEndY}
        containerWidth={containerWidth}
        containerHeight={containerHeight}
        isVisible={isVisible}
        side={position.boxSide}
      />

      {/* Info box */}
      <div
        className="absolute z-20 w-[280px]"
        style={{
          left: `${position.boxX * 100}%`,
          top: `${position.boxY * 100}%`,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "scale(1)" : "scale(0.9)",
          transformOrigin: getTransformOrigin(),
          transition: "all 300ms ease-out 150ms",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="bg-[#f5efe6] rounded-sm p-4 shadow-xl relative"
          style={{
            border: "2px solid rgba(139, 69, 19, 0.25)",
            boxShadow: "0 8px 32px rgba(44, 24, 16, 0.2), 0 2px 8px rgba(44, 24, 16, 0.1)",
          }}
        >
          {/* Decorative top edge */}
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#d4a574] to-transparent" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-[#8b7355] hover:text-[#2c1810] hover:bg-[#d4a574]/20 transition-colors text-lg"
          >
            ×
          </button>

          {/* Label */}
          <h4 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-[#2c1810] pr-6">
            {item.label}
          </h4>

          {/* Note */}
          {item.note && (
            <p className="mt-2 font-[family-name:var(--font-crimson)] text-sm text-[#5c4033] italic leading-relaxed">
              "{item.note}"
            </p>
          )}

          {/* Metadata */}
          <div className="mt-3 pt-3 border-t border-[#d4a574]/30 space-y-1.5">
            {item.category && (
              <div className="flex items-center gap-2">
                <span className="font-[family-name:var(--font-typewriter)] text-[10px] uppercase tracking-wider text-[#8b7355]">
                  Category:
                </span>
                <span className="rounded-sm border border-[#d4a574] bg-[#faf6f1] px-2 py-0.5 font-[family-name:var(--font-typewriter)] text-[10px] uppercase text-[#8b4513]">
                  {item.category}
                </span>
              </div>
            )}
            {item.source_date && (
              <div className="flex items-center gap-2">
                <span className="font-[family-name:var(--font-typewriter)] text-[10px] uppercase tracking-wider text-[#8b7355]">
                  Date:
                </span>
                <span className="font-[family-name:var(--font-crimson)] text-sm text-[#5c4033]">
                  {formatDate(item.source_date)}
                </span>
              </div>
            )}
            {item.source_location && (
              <div className="flex items-center gap-2">
                <span className="font-[family-name:var(--font-typewriter)] text-[10px] uppercase tracking-wider text-[#8b7355]">
                  Location:
                </span>
                <span className="font-[family-name:var(--font-crimson)] text-sm text-[#5c4033]">
                  📍 {item.source_location}
                </span>
              </div>
            )}
          </div>

          {/* Decorative corners */}
          <div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-[#d4a574] opacity-50" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-[#d4a574] opacity-50" />
        </div>
      </div>
    </>
  );
}

export function PageViewMode({ imageUrl, items }: PageViewModeProps) {
  const [selectedItem, setSelectedItem] = useState<PageItem | null>(null);
  const [annotationVisible, setAnnotationVisible] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Track container size for positioning calculations
  useEffect(() => {
    const updateSize = () => {
      if (imageContainerRef.current) {
        const rect = imageContainerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const selectItem = useCallback((item: PageItem) => {
    if (selectedItem?.id === item.id) {
      // Clicking same marker closes it
      setAnnotationVisible(false);
      setTimeout(() => setSelectedItem(null), 300);
    } else {
      // Clicking different marker
      if (selectedItem) {
        setAnnotationVisible(false);
        setTimeout(() => {
          setSelectedItem(item);
          setTimeout(() => setAnnotationVisible(true), 50);
        }, 200);
      } else {
        setSelectedItem(item);
        setTimeout(() => setAnnotationVisible(true), 50);
      }
    }
  }, [selectedItem]);

  const handleMarkerClick = useCallback((item: PageItem, e: React.MouseEvent) => {
    e.stopPropagation();
    selectItem(item);
  }, [selectItem]);

  const handleBackgroundClick = useCallback(() => {
    if (selectedItem) {
      setAnnotationVisible(false);
      setTimeout(() => setSelectedItem(null), 300);
    }
  }, [selectedItem]);

  const handleClose = useCallback(() => {
    setAnnotationVisible(false);
    setTimeout(() => setSelectedItem(null), 300);
  }, []);

  const annotationPosition = selectedItem
    ? calculateAnnotationPosition(
        selectedItem.x,
        selectedItem.y,
        containerSize.width,
        containerSize.height
      )
    : null;

  return (
    <div className="space-y-6">
      <div 
        ref={containerRef}
        className="flex justify-center"
      >
        <div
          className="relative w-full max-w-4xl cursor-pointer"
          onClick={handleBackgroundClick}
        >
          {/* Main image container */}
          <div
            ref={imageContainerRef}
            className="relative overflow-visible rounded-sm"
            style={{
              boxShadow: "0 8px 40px rgba(44, 24, 16, 0.15)",
              border: "6px solid #f5efe6",
              outline: "1px solid rgba(139, 69, 19, 0.15)",
            }}
          >
            {/* Photo corner accents */}
            <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-[#d4a574] opacity-50 z-10 pointer-events-none" />
            <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-[#d4a574] opacity-50 z-10 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-[#d4a574] opacity-50 z-10 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-[#d4a574] opacity-50 z-10 pointer-events-none" />

            {/* Image */}
            <div className="relative aspect-[4/3] w-full bg-[#e8dfd3]">
              <Image
                src={imageUrl}
                alt="Journal page"
                fill
                sizes="(min-width: 1024px) 896px, 100vw"
                className="object-contain"
                priority
              />

              {/* Markers overlay */}
              <div className="absolute inset-0">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-all duration-300 ${
                      selectedItem?.id === item.id
                        ? "bg-[#722f37] border-[#f5efe6] scale-150 shadow-lg z-10"
                        : "bg-[#8b4513] border-[#f5efe6] hover:scale-125 shadow-md"
                    }`}
                    style={{ 
                      left: `${item.x * 100}%`, 
                      top: `${item.y * 100}%`,
                    }}
                    onClick={(e) => handleMarkerClick(item, e)}
                  >
                    <span className="sr-only">{item.label}</span>
                    
                    {/* Pulse ring for selected marker */}
                    {selectedItem?.id === item.id && (
                      <span className="absolute inset-0 rounded-full border-2 border-[#722f37] animate-ping opacity-75" />
                    )}
                  </button>
                ))}
              </div>

              {/* Annotation box and arrow */}
              {selectedItem && annotationPosition && (
                <AnnotationBox
                  item={selectedItem}
                  position={annotationPosition}
                  containerWidth={containerSize.width}
                  containerHeight={containerSize.height}
                  isVisible={annotationVisible}
                  onClose={handleClose}
                />
              )}
            </div>
          </div>

          {/* Hint text */}
          {items.length > 0 && !selectedItem && (
            <p className="mt-4 text-center font-[family-name:var(--font-typewriter)] text-xs text-[#8b7355]">
              Click on a marker to see details
            </p>
          )}

          {items.length === 0 && (
            <p className="mt-4 text-center font-[family-name:var(--font-crimson)] text-sm text-[#5c4033] italic">
              No markers on this page yet
            </p>
          )}
        </div>
      </div>

      {/* Items list - clicking these also shows annotation */}
      {items.length > 0 && (
        <div
          className="rounded-sm bg-[#f5efe6] p-5"
          style={{
            boxShadow: "0 2px 12px rgba(44, 24, 16, 0.06)",
            border: "1px solid rgba(139, 69, 19, 0.1)",
          }}
        >
          <h3 className="font-[family-name:var(--font-typewriter)] text-xs uppercase tracking-wider text-[#8b4513]">
            ✦ Items on this page ({items.length})
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectItem(item)}
                className={`text-left rounded-sm p-3 border transition-all duration-200 ${
                  selectedItem?.id === item.id
                    ? "bg-[#8b4513]/10 border-[#8b4513]/40 shadow-md"
                    : "bg-[#faf6f1] border-[#d4a574]/20 hover:border-[#8b4513]/30 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className={`mt-1.5 h-2.5 w-2.5 rounded-full flex-shrink-0 transition-colors ${
                    selectedItem?.id === item.id ? "bg-[#722f37]" : "bg-[#8b4513]"
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="font-[family-name:var(--font-playfair)] font-semibold text-[#2c1810] text-sm">
                      {item.label}
                    </p>
                    {item.note && (
                      <p className="mt-0.5 font-[family-name:var(--font-crimson)] text-xs text-[#5c4033] italic truncate">
                        {item.note}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.category && (
                        <span className="rounded-sm border border-[#d4a574] bg-[#f5efe6] px-1.5 py-0.5 font-[family-name:var(--font-typewriter)] text-[9px] uppercase text-[#8b4513]">
                          {item.category}
                        </span>
                      )}
                      {item.source_location && (
                        <span className="font-[family-name:var(--font-typewriter)] text-[9px] text-[#8b7355]">
                          📍 {item.source_location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
