"use client";

import { motion } from "framer-motion";

export default function DeliveryAddress() {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40 },
        show: { opacity: 1, y: 0 }
      }}
      className="bg-[#121212] border border-gray-800 rounded-2xl p-6"
    >
      <h2 className="text-white text-xl mb-6">Delivery Address</h2>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="card-option">Home</div>
        <div className="card-option">Office</div>
      </div>

      <textarea
        placeholder="Enter full delivery address..."
        className="input h-28 resize-none"
      />

      <input
        placeholder="e.g. Nearest bus stop"
        className="input mt-4"
      />
    </motion.div>
  );
}