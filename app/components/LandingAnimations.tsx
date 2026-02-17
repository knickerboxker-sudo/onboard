"use client";

import { motion } from "framer-motion";
import { Children, ReactNode } from "react";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.08,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export function LandingAnimations({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="space-y-20 sm:space-y-24"
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
