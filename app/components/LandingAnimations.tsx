"use client";

import { motion } from "framer-motion";
import { Children, ReactNode } from "react";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
  },
};

export function LandingAnimations({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="space-y-16"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {Children.map(children, (child) => (
        <motion.div variants={fadeInUp}>{child}</motion.div>
      ))}
    </motion.div>
  );
}
