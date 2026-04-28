"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const steps = ["Home", "Menu", "Cart", "Checkout"];

export default function CheckoutHeader() {
  const [currentStep, setCurrentStep] = useState(0);

  // Simulate progress (replace with real logic later)
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentStep(0); // change dynamically when integrating
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const progress = (currentStep / steps.length) * 100;

  return (
    <section className="w-full bg-[#020D0B] py-16 md:py-20 px-6 md:px-12 text-white overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col items-center">

        {/* 🟢 TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-4xl md:text-6xl font-semibold tracking-tight"
        >
          Checkout
        </motion.h1>

        {/* 🧭 BREADCRUMB */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
          className="flex items-center gap-3 mt-6 text-sm md:text-base text-gray-300"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step}
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0 },
              }}
              className="flex items-center gap-3"
            >
              <span
                className={`${
                  index === steps.length - 1
                    ? "text-white font-medium"
                    : "text-gray-400"
                }`}
              >
                {step}
              </span>

              {index !== steps.length - 1 && (
                <span className="text-gray-500">›</span>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* 📊 PROGRESS BAR */}
        <div className="w-full mt-8 flex items-center gap-4">
          <div className="flex-1 h-[6px] bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
            />
          </div>

          {/* 🔢 COUNTER */}
          <motion.span
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-sm md:text-base text-gray-300 whitespace-nowrap"
          >
            {currentStep}/{steps.length} Completed
          </motion.span>
        </div>
      </div>
    </section>
  );
}