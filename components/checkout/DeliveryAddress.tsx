"use client";

import { motion, Variants } from "framer-motion";
import { MapPin } from "lucide-react";
import { useCheckoutProgress, useCheckoutProgressActions } from "@/lib/checkoutProgressStore";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function DeliveryAddress() {
  const progress = useCheckoutProgress();
  const actions = useCheckoutProgressActions();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full rounded-2xl border border-gray-800 bg-[#121212]/90 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-xl md:p-8"
    >
      <motion.h2 variants={item} className="mb-6 text-xl font-semibold text-white md:text-2xl">
        Delivery Address
      </motion.h2>

      <motion.div variants={item} className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <MapPin size={16} className="opacity-70" />
          Delivery Address
        </label>
        <textarea
          autoComplete="off"
          placeholder="Enter full delivery address..."
          value={progress.deliveryAddress}
          onChange={(event) => actions.setDeliveryAddress(event.target.value)}
          className="h-32 w-full resize-none rounded-xl border border-gray-700 bg-transparent p-4 text-white outline-none transition-all duration-300 placeholder:text-gray-500 hover:border-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40"
        />
      </motion.div>

      <motion.div variants={item} className="mt-5 space-y-2">
        <label className="text-sm text-gray-400">
          Landmark (Optional - helps rider find you faster)
        </label>
        <input
          type="text"
          autoComplete="off"
          placeholder="e.g. Nearest bus stop"
          value={progress.landmark}
          onChange={(event) => actions.setLandmark(event.target.value)}
          className="h-12 w-full rounded-xl border border-gray-700 bg-transparent px-4 text-white outline-none transition-all duration-300 placeholder:text-gray-500 hover:border-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40"
        />
      </motion.div>
    </motion.div>
  );
}
