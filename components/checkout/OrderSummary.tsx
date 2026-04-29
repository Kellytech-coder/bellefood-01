"use client";

import { motion, Variants, easeOut } from "framer-motion";
import { ShoppingCart, AlertCircle } from "lucide-react";

const container: Variants = {
  hidden: { opacity: 0, x: 60 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      staggerChildren: 0.12,
      duration: 0.5,
      ease: easeOut, // ✅ correct typing
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: easeOut,
    },
  },
};

export default function OrderSummary() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="bg-[#121212] border border-gray-800 rounded-2xl p-6 h-fit sticky top-100 shadow-lg"
    >
      {/* Title */}
      <motion.h2
        variants={item}
        className="text-white text-xl font-semibold mb-6"
      >
        Order Summary
      </motion.h2>

      {/* Items */}
      <div className="space-y-4 text-gray-300">
        <motion.div variants={item} className="flex justify-between">
          <span>Party Jollof Rice x 2</span>
          <span>₦12,000</span>
        </motion.div>

        <motion.div
          variants={item}
          className="flex justify-between text-green-400"
        >
          <span>Grilled Chicken x 1</span>
          <span>₦1,000</span>
        </motion.div>
      </div>

      {/* Divider */}
      <motion.div variants={item} className="border-t border-gray-800 my-6" />

      {/* Subtotal */}
      <motion.div
        variants={item}
        className="flex justify-between text-gray-400"
      >
        <span>Subtotal</span>
        <span>₦12,000</span>
      </motion.div>

      {/* Delivery */}
      <motion.div
        variants={item}
        className="flex justify-between text-green-400 mt-2"
      >
        <span>Delivery Fee</span>
        <span>₦1,000</span>
      </motion.div>

      {/* Divider */}
      <motion.div variants={item} className="border-t border-gray-800 my-6" />

      {/* Total */}
      <motion.div
        variants={item}
        className="flex justify-between text-xl font-semibold text-orange-500"
      >
        <span>Total</span>
        <span>₦13,000</span>
      </motion.div>

      {/* Alert Box */}
      <motion.div
        variants={item}
        className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3"
      >
        <AlertCircle className="text-red-400 mt-1" size={18} />
        <div>
          <p className="text-red-400 font-medium">
            Estimated Delivery
          </p>
          <p className="text-sm text-gray-400">
            Fill-in your details and select a delivery zone to continue
          </p>
        </div>
      </motion.div>

      {/* Button */}
      <motion.button
        variants={item}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="w-full mt-6 bg-orange-600 hover:bg-orange-500 transition py-3 rounded-full text-white font-medium flex items-center justify-center gap-2"
      >
        <motion.span
          whileHover={{ x: 3 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <ShoppingCart size={18} />
        </motion.span>
        Complete Order
      </motion.button>

      {/* Footer Note */}
      <motion.p
        variants={item}
        className="text-xs text-gray-500 mt-4 text-center leading-relaxed"
      >
        Your payment info is secure. By placing your order, you agree to our{" "}
        <span className="text-orange-500">Terms and Conditions</span>.
      </motion.p>
    </motion.div>
  );
}