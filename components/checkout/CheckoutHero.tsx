"use client";

import { motion } from "framer-motion";
import Link from "next/link";



import {
  computeCheckoutProgressPercent,
  useCheckoutProgress,
} from "@/lib/checkoutProgressStore";

const steps = ["Home", "Menu", "Cart", "Checkout"];

export default function CheckoutHeader() {
  const progressState = useCheckoutProgress();
  const progress = computeCheckoutProgressPercent(progressState);

  const currentStep = steps.length - 1;
  const completedCount = progressState.selectedDeliveryOption ? 1 : 0;
  const deliveryAddressDone = progressState.deliveryAddress.trim().length > 0;
  const landmarkDone = progressState.landmark.trim().length > 0;
  const checkoutFieldsTotal = 3; // quick select + address + landmark
  const checkoutFieldsDone =
    completedCount + (deliveryAddressDone ? 1 : 0) + (landmarkDone ? 1 : 0);


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
          {steps.map((step, index) => {
            const href =
              step === "Home"
                ? "/"
                : step === "Menu"
                  ? "/menu"
                  : step === "Cart"
                    ? "/cart"
                    : "/checkout";

            const isLast = index === steps.length - 1;

            return (
              <motion.div
                key={step}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 },
                }}
                className="flex items-center gap-3"
              >
                {isLast ? (
                  <span className="text-white font-medium">{step}</span>
                ) : (
                  <Link
                    href={href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {step}
                  </Link>
                )}

                {!isLast && <span className="text-gray-500">›</span>}
              </motion.div>
            );
          })}
        </motion.div>


        {/* 📊 PROGRESS BAR */}
        <div className="w-full mt-8 flex items-center gap-4">
          <div className="flex-1 h-[6px] bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full"
            />
          </div>

          {/* 🔢 COUNTER */}
          <motion.span
            key={checkoutFieldsDone}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm md:text-base text-gray-300 whitespace-nowrap"
          >
            {checkoutFieldsDone}/{checkoutFieldsTotal} Completed
          </motion.span>
        </div>
      </div>
    </section>
  );
}