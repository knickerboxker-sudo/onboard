"use client";

import { useEffect, useRef, ReactNode } from "react";

export function LandingAnimations({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Delay observer setup to ensure elements are laid out and painted
    const timeoutId = setTimeout(() => {
      const elements = container.querySelectorAll("[data-reveal]");
      if (elements.length === 0) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observerRef.current?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.05, rootMargin: "0px 0px 50px 0px" }
      );

      elements.forEach((el) => observerRef.current?.observe(el));
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observerRef.current?.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="space-y-20 sm:space-y-24">
      {children}
    </div>
  );
}
