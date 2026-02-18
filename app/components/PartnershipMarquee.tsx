"use client";

import Link from "next/link";
import { useRef, useState, useCallback } from "react";

const DRAG_SCROLL_MULTIPLIER = 1.5;

export type PartnershipExample = {
  businesses: string;
  result: string;
  description: string;
};

export function PartnershipMarquee({ examples }: { examples: PartnershipExample[] }) {
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);

  const handleMouseEnter = useCallback(() => setPaused(true), []);
  const handleMouseLeave = useCallback(() => {
    setPaused(false);
    isDragging.current = false;
    if (containerRef.current) containerRef.current.style.cursor = "grab";
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - containerRef.current.offsetLeft;
    scrollStart.current = containerRef.current.scrollLeft;
    containerRef.current.style.cursor = "grabbing";
    containerRef.current.style.userSelect = "none";
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab";
      containerRef.current.style.userSelect = "";
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    containerRef.current.scrollLeft = scrollStart.current - (x - startX.current) * DRAG_SCROLL_MULTIPLIER;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!paused || !containerRef.current) return;
    e.preventDefault();
    containerRef.current.scrollLeft += e.deltaY !== 0 ? e.deltaY : e.deltaX;
  }, [paused]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
      style={{
        overflow: paused ? "auto" : "hidden",
        cursor: paused ? "grab" : "default",
        paddingBottom: paused ? "8px" : "0",
      }}
    >
      <div
        className="flex gap-3"
        style={{
          width: "max-content",
          animation: paused ? "none" : "marquee 90s linear infinite",
        }}
      >
        {[...examples, ...examples].map((ex, i) => (
          <Link
            key={`${ex.businesses}-${i}`}
            href="/partnership-ideas"
            onClick={(e) => isDragging.current && e.preventDefault()}
            className="marquee-pill flex-shrink-0 transition-colors duration-200 hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] hover:border-[var(--color-ink)]"
            style={{
              border: "1px solid var(--color-rule)",
              padding: "12px 20px",
              background: "var(--color-paper)",
              color: "var(--color-ink)",
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "4px",
              maxWidth: "260px",
              textDecoration: "none",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: "100%",
              }}
            >
              {ex.businesses} → {ex.result}
            </span>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "11px",
                lineHeight: "1.4",
                color: "inherit",
                opacity: 0.65,
                whiteSpace: "normal",
                wordBreak: "break-word",
              }}
            >
              {ex.description}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
