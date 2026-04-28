"use client";

import { motion } from "framer-motion";

export default function OrderSummary() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-[#121212] border border-gray-800 rounded-2xl p-6 h-fit sticky top-10"
    >
      <h2 className="text-white text-xl mb-6">Order Summary</h2>

      <div className="space-y-3 text-gray-300">
        <div className="flex justify-between">
          <span>Party Jollof Rice x 2</span>
          <span>₦12,000</span>
        </div>

        <div className="flex justify-between text-green-400">
          <span>Grilled Chicken x 1</span>
          <span>₦1,000</span>
        </div>
      </div>

      <div className="border-t border-gray-800 my-5" />

      <div className="flex justify-between text-gray-400">
        <span>Subtotal</span>
        <span>₦12,000</span>
      </div>

      <div className="flex justify-between text-green-400">
        <span>Delivery Fee</span>
        <span>₦1,000</span>
      </div>

      <div className="border-t border-gray-800 my-5" />

      <div className="flex justify-between text-xl font-semibold text-orange-500">
        <span>Total</span>
        <span>₦13,000</span>
      </div>

      <button className="w-full mt-6 bg-orange-600 hover:bg-orange-500 transition py-3 rounded-full text-white font-medium">
        Complete Order
      </button>
    </motion.div>
  );
}