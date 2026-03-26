"use client";

import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="relative w-full py-20 md:py-28 px-6 md:px-12 bg-[#0B0F0E] overflow-hidden">

      {/* 🔥 BACKGROUND GLOW */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-[500px] h-[500px] bg-orange-500/30 blur-[120px] rounded-full top-[-100px] left-[-100px]"
      />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-[400px] h-[400px] bg-yellow-400/20 blur-[120px] rounded-full bottom-[-100px] right-[-100px]"
      />

      <div className="relative max-w-4xl mx-auto text-center">

        {/* 🟠 HEADLINE */}
        <motion.h2
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight"
        >
          Ready to Taste Something Amazing?
        </motion.h2>

        {/* 📝 SUBTEXT */}
        <motion.p
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-white/60 mt-5 text-sm sm:text-base md:text-lg"
        >
          Order now and experience premium meals delivered fast to your doorstep.
        </motion.p>

        {/* 🚀 BUTTON */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-10 flex justify-center"
        >
          <motion.button
            whileHover={{
              scale: 1.1,
              boxShadow: "0px 0px 30px rgba(255,165,0,0.6)",
            }}
            whileTap={{ scale: 0.9 }}
            className="relative px-8 py-4 text-sm md:text-base font-medium text-black bg-orange-400 rounded-full overflow-hidden"
          >
            {/* 🔥 SHIMMER EFFECT */}
            <motion.span
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            />

            <span className="relative z-10">
              Order Now
            </span>
          </motion.button>
        </motion.div>

        {/* ⚡ FLOATING BADGE (EXTRA DETAIL) */}
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
          className="mt-8 text-xs text-white/40"
        >
          ⚡ Fast delivery • Fresh meals • Trusted by 1,000+ customers
        </motion.div>

      </div>
    </section>
  );
}