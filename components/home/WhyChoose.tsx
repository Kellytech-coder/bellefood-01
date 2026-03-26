"use client";

import { motion } from "framer-motion";
import {
  Clock,
  Truck,
  Package,
  CreditCard,
} from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "30-Minutes Delivery",
    desc: "Hot meals delivered fast across Lagos.",
  },
  {
    icon: Truck,
    title: "Real-time Tracking",
    desc: "Watch your order move from our kitchen to your doorstep.",
  },
  {
    icon: Package,
    title: "Premium Packaging",
    desc: "Sealed, clean, and ready to enjoy.",
  },
  {
    icon: CreditCard,
    title: "Secure payments",
    desc: "Fast and reliable online checkout.",
  },
];

export default function WhyChoose() {
  return (
    <section className="relative bg-[#061311] py-16 sm:py-20 md:py-24 px-4 sm:px-6 overflow-hidden">
      
      {/* 🌌 Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-80px] sm:top-[-100px] left-1/2 -translate-x-1/2 w-[300px] sm:w-[500px] md:w-[600px] h-[300px] sm:h-[500px] md:h-[600px] bg-orange-500/10 blur-[100px] md:blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">

        {/* Header */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-gray-400 mb-3 text-sm"
        >
          Benefits
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3"
        >
          Why Choose{" "}
          <span className="text-orange-500">Bellefood?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 mb-10 md:mb-16 text-sm sm:text-base"
        >
          Premium food, delivered fast.
        </motion.p>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((item, i) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 60, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.15,
                  type: "spring",
                  stiffness: 120,
                }}
                whileHover={{ y: -8, scale: 1.03 }}
                whileTap={{ y: -4, scale: 0.98 }} // ✅ MOBILE
                className="relative group rounded-2xl p-[1px] bg-gradient-to-br from-orange-500/40 to-transparent"
              >
                {/* Glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 group-active:opacity-100 blur-lg bg-orange-500/20 transition duration-500" />

                {/* Card */}
                <div className="relative bg-[#121212] rounded-2xl p-5 sm:p-6 h-full flex flex-col justify-between border border-white/5 group-hover:border-orange-500/30 group-active:border-orange-500/30 transition">

                  {/* Icon */}
                  <motion.div
                    whileHover={{
                      rotate: [0, -8, 8, 0],
                      scale: 1.15,
                    }}
                    whileTap={{
                      rotate: [0, -6, 6, 0], // ✅ MOBILE
                      scale: 1.1,
                    }}
                    transition={{ duration: 0.5 }}
                    className="text-orange-500 mb-4"
                  >
                    <Icon size={26} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />
                  </motion.div>

                  {/* Text */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  {/* Hover Line */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-[2px] bg-orange-500"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    whileTap={{ width: "100%" }} // ✅ MOBILE
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}