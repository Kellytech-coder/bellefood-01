"use client";

import { motion, Variants } from "framer-motion";
import { User, Phone, Mail } from "lucide-react";

// ✅ Container animation (stagger)
const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

// ✅ Item animation (fixed easing type)
const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1], // ✅ smooth modern easing
    },
  },
};

export default function CustomerInfo() {
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
        Customer Information
      </motion.h2>

      <div className="space-y-5">
        {/* 👤 Full Name */}
        <motion.div variants={item} className="space-y-2">
          <label className="flex items-center gap-2 text-gray-300 text-sm">
            <User size={16} className="opacity-70" />
            Full Name
          </label>

          <input
            type="text"
            placeholder="Enter your name"
            className="w-full h-12 px-4 rounded-xl bg-transparent border border-gray-700 text-white placeholder-gray-500 outline-none transition-all duration-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40 hover:border-gray-500"
          />
        </motion.div>

        {/* 📞 + 📧 Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone */}
          <motion.div variants={item} className="space-y-2">
            <label className="flex items-center gap-2 text-gray-300 text-sm">
              <Phone size={16} className="opacity-70" />
              Phone Number
            </label>

            <input
              type="tel"
              placeholder="+234 000 000 000"
              className="w-full h-12 px-4 rounded-xl bg-transparent border border-gray-700 text-white placeholder-gray-500 outline-none transition-all duration-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40 hover:border-gray-500"
            />
          </motion.div>

          {/* Email */}
          <motion.div variants={item} className="space-y-2">
            <label className="flex items-center gap-2 text-gray-300 text-sm">
              <Mail size={16} className="opacity-70" />
              Email Address
            </label>

            <input
              type="email"
              placeholder="Your@email.com"
              className="w-full h-12 px-4 rounded-xl bg-transparent border border-gray-700 text-white placeholder-gray-500 outline-none transition-all duration-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40 hover:border-gray-500"
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}