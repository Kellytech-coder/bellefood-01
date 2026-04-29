"use client";

import { motion, Variants } from "framer-motion";
import { useState } from "react";
import { CreditCard, Landmark, CheckCircle, ShieldCheck } from "lucide-react";

// ✅ Animation system
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

export default function PaymentMethod() {
  const [selected, setSelected] = useState<"card" | "bank">("card");

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
        Payment Method
      </motion.h2>

      {/* 💳 Options */}
      <div className="space-y-4">
        {/* CARD PAYMENT */}
        <motion.button
          variants={item}
          onClick={() => setSelected("card")}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${
            selected === "card"
              ? "border-orange-500 bg-orange-500/10"
              : "border-gray-700 hover:border-gray-500"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg border border-gray-700">
              <CreditCard className="text-white opacity-80" size={20} />
            </div>

            <div className="text-left">
              <p className="text-white font-medium">Card Payment</p>
              <p className="text-gray-400 text-sm">
                Instant confirmation
              </p>
            </div>
          </div>

          {/* ✅ Active Indicator */}
          {selected === "card" ? (
            <CheckCircle className="text-orange-500" size={20} />
          ) : (
            <div className="w-5 h-5 rounded-full border border-gray-600" />
          )}
        </motion.button>

        {/* BANK TRANSFER */}
        <motion.button
          variants={item}
          onClick={() => setSelected("bank")}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${
            selected === "bank"
              ? "border-orange-500 bg-orange-500/10"
              : "border-gray-700 hover:border-gray-500"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg border border-gray-700">
              <Landmark className="text-white opacity-80" size={20} />
            </div>

            <div className="text-left">
              <p className="text-white font-medium">Bank Transfer</p>
              <p className="text-gray-400 text-sm">
                Confirm payments after transfer
              </p>
            </div>
          </div>

          {selected === "bank" ? (
            <CheckCircle className="text-orange-500" size={20} />
          ) : (
            <div className="w-5 h-5 rounded-full border border-gray-600" />
          )}
        </motion.button>
      </div>

      {/* 🔒 Security Info */}
      <motion.div
        variants={item}
        className="flex items-center gap-6 mt-6 text-gray-400 text-sm"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-green-500" />
          SSL Encrypted
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-green-500" />
          PCI Compliant
        </div>
      </motion.div>
    </motion.div>
  );
}