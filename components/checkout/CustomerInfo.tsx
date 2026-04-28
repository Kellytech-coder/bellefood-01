"use client";

import { motion } from "framer-motion";

export default function CustomerInfo() {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40 },
        show: { opacity: 1, y: 0 }
      }}
      className="bg-[#121212] border border-gray-800 rounded-2xl p-6"
    >
      <h2 className="text-white text-xl mb-6">Customer Information</h2>

      <div className="space-y-4">
        <input
          placeholder="Enter your name"
          className="input"
        />

        <div className="grid md:grid-cols-2 gap-4">
          <input placeholder="+234 000 000 000" className="input" />
          <input placeholder="Your@email.com" className="input" />
        </div>
      </div>
    </motion.div>
  );
}