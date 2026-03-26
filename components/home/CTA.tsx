"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative w-full bg-[#0B0F0E] py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 overflow-hidden">

      {/* 🍗 BACKGROUND IMAGE */}
      <div className="absolute inset-0">
        <Image
          src="/images/platter1.png"
          alt="Delicious Food"
          fill
          className="object-cover"
          priority
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-black/70" />

        {/* LEFT GRADIENT */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      </div>

      {/* 🔥 GLOW (optimized for mobile) */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-orange-500/20 blur-[90px] sm:blur-[120px] rounded-full top-[-80px] left-[-80px]"
      />

      {/* 🟠 CONTENT */}
      <motion.div
        whileTap={{ scale: 0.99 }} // ✅ subtle mobile feedback
        className="relative z-10 max-w-7xl mx-auto"
      >
        <div className="max-w-xl space-y-3">

          {/* HEADLINE */}
          <motion.h2
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }} // ✅ MOBILE
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.1]"
          >
            Ready to Satisfy <br />
            <span className="text-orange-500">Your Cravings?</span>
          </motion.h2>

          {/* SUBTEXT */}
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.99 }} // ✅ MOBILE
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-white/80 mt-6 text-base sm:text-lg md:text-xl leading-relaxed"
          >
            Your food could be on the way in minutes. Fresh, hot, and made just for you.
          </motion.p>

          {/* BUTTONS */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            {/* PRIMARY */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }} // ✅ MOBILE STRONG FEEDBACK
              className="flex items-center gap-2 bg-orange-500 text-white px-7 py-3.5 text-sm sm:text-base rounded-full shadow-lg shadow-orange-500/30"
            >
              Start Ordering <ArrowRight size={18} />
            </motion.button>

            {/* SECONDARY */}
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#ffffff10" }}
              whileTap={{ scale: 0.92 }} // ✅ FIXED (was missing)
              className="border border-white/30 text-white px-7 py-3.5 text-sm sm:text-base rounded-full"
            >
              View Menu
            </motion.button>
          </motion.div>

        </div>
      </motion.div>
    </section>
  );
}