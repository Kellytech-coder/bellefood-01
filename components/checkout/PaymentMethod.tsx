"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function PaymentMethod() {
  const [selected, setSelected] = useState("card");

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40 },
        show: { opacity: 1, y: 0 }
      }}
      className="bg-[#121212] border border-gray-800 rounded-2xl p-6"
    >
      <h2 className="text-white text-xl mb-6">Payment Method</h2>

      <div className="space-y-4">
        <div
          onClick={() => setSelected("card")}
          className={`payment-card ${
            selected === "card" && "active"
          }`}
        >
          Card Payment
        </div>

        <div
          onClick={() => setSelected("bank")}
          className={`payment-card ${
            selected === "bank" && "active"
          }`}
        >
          Bank Transfer
        </div>
      </div>
    </motion.div>
  );
}