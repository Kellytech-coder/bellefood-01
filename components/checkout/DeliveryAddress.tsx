"use client";

import { motion, Variants } from "framer-motion";
import { MapPin } from "lucide-react";
import { useState } from "react";

// ✅ Animation setup
const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function DeliveryAddress() {
  const [selected, setSelected] = useState<"home" | "office" | null>(null);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full bg-[#121212]/90 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 md:p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]"
    >
      {/* 🧾 Title */}
      <motion.h2
        variants={item}
        className="text-white text-xl md:text-2xl font-semibold mb-6"
      >
        Delivery Address
      </motion.h2>

      {/* ⚡ Quick Select */}
      <motion.div variants={item} className="mb-5">
        <p className="text-gray-400 text-sm mb-3">Quickly Select</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Home */}
          <button
            onClick={() => setSelected("home")}
            className={`text-left rounded-xl border p-4 transition-all duration-300 ${
              selected === "home"
                ? "border-orange-500 bg-orange-500/5"
                : "border-gray-700 hover:border-gray-500"
            }`}
          >
            <p className="text-white font-medium">Home</p>
            <p className="text-gray-400 text-sm mt-1">
              15, Admiralty Way, Lekki Phase 1
            </p>
          </button>

          {/* Office */}
          <button
            onClick={() => setSelected("office")}
            className={`text-left rounded-xl border p-4 transition-all duration-300 ${
              selected === "office"
                ? "border-orange-500 bg-orange-500/5"
                : "border-gray-700 hover:border-gray-500"
            }`}
          >
            <p className="text-white font-medium">Office</p>
            <p className="text-gray-400 text-sm mt-1">
              42, Adeola Odeku street, Victoria Island
            </p>
          </button>
        </div>
      </motion.div>

      {/* 📍 Address */}
      <motion.div variants={item} className="space-y-2">
        <label className="flex items-center gap-2 text-gray-300 text-sm">
          <MapPin size={16} className="opacity-70" />
          Delivery Address
        </label>

        <textarea
          placeholder="Enter full delivery address..."
          className="w-full h-32 p-4 rounded-xl bg-transparent border border-gray-700 text-white placeholder-gray-500 outline-none resize-none transition-all duration-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40 hover:border-gray-500"
        />
      </motion.div>

      {/* 🧭 Landmark */}
      <motion.div variants={item} className="mt-5 space-y-2">
        <label className="text-gray-400 text-sm">
          Landmark (Optional - helps rider find you faster)
        </label>

        <input
          type="text"
          placeholder="e.g. Nearest bus stop"
          className="w-full h-12 px-4 rounded-xl bg-transparent border border-gray-700 text-white placeholder-gray-500 outline-none transition-all duration-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40 hover:border-gray-500"
        />
      </motion.div>
    </motion.div>
  );
}