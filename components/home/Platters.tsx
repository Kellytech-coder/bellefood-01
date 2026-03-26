"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Platters() {
  return (
    <section className="w-full bg-[#0B0F0E] py-16 md:py-20 px-4 sm:px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">

        {/* 🟠 LEFT CONTENT */}
        <div className="max-w-xl">

          {/* SMALL LABEL */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-white/60 mb-3 text-sm"
          >
            Premium Platters
          </motion.p>

          {/* MAIN HEADING */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight text-white"
          >
            Hosting? Go big With{" "}
            <span className="text-orange-500">
              Bellefood Platters
            </span>
          </motion.h2>

          {/* DESCRIPTION */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/70 mt-4 sm:mt-6 text-sm sm:text-base leading-relaxed"
          >
            Perfect for events, meetings, or when you’re feeding the squad.
            Our party platters serve 4–6 people and comes with all your favorites.
          </motion.p>

          {/* BULLETS */}
          <div className="mt-5 sm:mt-6 space-y-3 sm:space-y-4">
            {[
              "Mixed rice platters with assorted proteins",
              "Small chops selection",
              "Party packs for large gatherings",
            ].map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileTap={{ scale: 0.97, x: 4 }} // ✅ MOBILE
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-start gap-3 cursor-pointer"
              >
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                <p className="text-white/80 text-sm sm:text-base">
                  {text}
                </p>
              </motion.div>
            ))}
          </div>

          {/* BUTTONS */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">

            {/* PRIMARY BUTTON */}
            <motion.button
              whileTap={{ scale: 0.94 }} // ✅ MOBILE
              whileHover={{ scale: 1.05 }}
              className="flex items-center justify-center gap-2 bg-orange-500 text-white px-5 py-3 rounded-full text-sm sm:text-base"
            >
              Order Now <ArrowRight size={18} />
            </motion.button>

            {/* SECONDARY BUTTON */}
            <motion.button
              whileTap={{ scale: 0.94 }} // ✅ MOBILE
              whileHover={{
                backgroundColor: "#ffffff10",
                scale: 1.05,
              }}
              className="border border-white/30 text-white px-5 py-3 rounded-full text-sm sm:text-base"
            >
              Learn More
            </motion.button>
          </div>
        </div>

        {/* 🍗 RIGHT IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          whileTap={{ scale: 0.98 }} // ✅ MOBILE
          viewport={{ once: true }}
          className="relative w-full h-[260px] sm:h-[320px] md:h-[520px]"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 1.03 }} // ✅ MOBILE
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <Image
              src="/images/platter1.png"
              alt="platter"
              fill
              className="object-cover rounded-2xl"
              priority
            />
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}