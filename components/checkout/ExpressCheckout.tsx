"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export default function ExpressCheckout() {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40 },
        show: { opacity: 1, y: 0 }
      }}
      className="bg-gradient-to-r from-orange-700 to-orange-900 p-[1px] rounded-2xl"
    >
      <div className="bg-[#1A1A1A] rounded-2xl p-5 flex items-center gap-4">
        <div className="bg-orange-500 p-3 rounded-full">
          <Zap size={18} />
        </div>
        <div>
          <h3 className="text-white font-semibold text-lg">
            Express Checkout
          </h3>
          <p className="text-gray-400 text-sm">
            Auto fill enabled - Secure payments - 30-min delivery
          </p>
        </div>
      </div>
    </motion.div>
  );
}