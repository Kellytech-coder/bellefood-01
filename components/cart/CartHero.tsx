"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";

export default function CartHero() {
  // Animation variants (fully typed)
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0, 0, 0.2, 1], // ✅ FIXED easing (replaces "easeOut")
      },
    },
  };

  return (
    <section className="w-full bg-[#071a14] py-20 md:py-28 text-white">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-6 text-center"
      >
        {/* Title */}
        <motion.h1
          variants={item}
          className="text-5xl md:text-6xl font-bold tracking-tight"
        >
          Your{" "}
          <span className="text-orange-500">
            Cart
          </span>
        </motion.h1>

        {/* Breadcrumb */}
        <motion.div
          variants={item}
          className="mt-6 flex items-center justify-center gap-3 text-gray-300 text-sm md:text-base"
        >
          <Link
            href="/"
            className="hover:text-orange-400 transition-colors duration-300"
          >
            Home
          </Link>

          <span className="opacity-60">›</span>

          <Link
            href="/menu"
            className="hover:text-orange-400 transition-colors duration-300"
          >
            Menu
          </Link>

          <span className="opacity-60">›</span>

          <span className="text-white font-medium">
            Cart
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}