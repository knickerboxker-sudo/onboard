"use client";

import { motion } from "framer-motion";

/**
 * Sortir's signature brand element — a subtle animated mesh gradient
 * that gives the brand a distinctive, premium identity.
 * Used as a background accent in hero sections and CTA blocks.
 */
export function SortirMeshGradient({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <motion.div
        className="absolute -top-1/2 -right-1/4 h-[600px] w-[600px] rounded-full opacity-[0.07]"
        style={{
          background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-1/3 -left-1/4 h-[500px] w-[500px] rounded-full opacity-[0.05]"
        style={{
          background: "radial-gradient(circle, #34d399 0%, transparent 70%)",
        }}
        animate={{
          x: [0, -20, 0],
          y: [0, 25, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/4 left-1/3 h-[400px] w-[400px] rounded-full opacity-[0.04]"
        style={{
          background: "radial-gradient(circle, #ea7e3e 0%, transparent 70%)",
        }}
        animate={{
          x: [0, 15, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

/**
 * Compact version for smaller sections like cards or feature blocks.
 */
export function SortirGlow({ color = "lavender", className = "" }: { color?: "lavender" | "spearmint" | "creamsicle"; className?: string }) {
  const colors = {
    lavender: "#8b5cf6",
    spearmint: "#34d399",
    creamsicle: "#ea7e3e",
  };

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div
        className="absolute -top-1/2 -right-1/2 h-[300px] w-[300px] rounded-full opacity-[0.06]"
        style={{
          background: `radial-gradient(circle, ${colors[color]} 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}
