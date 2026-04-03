"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Award } from "lucide-react";

export default function Platters() {
  const items = [
    {
      title: "Mixed rice platters with assorted proteins",
      price: "From ₦8,500",
    },
    {
      title: "Small chops Section",
      price: "From ₦5,500",
    },
    {
      title: "Party packs for large gatherings",
      price: "From ₦15,000",
    },
  ];

  return (
    <section className="w-full bg-[#0B0F0E] py-16 md:py-20 px-4 sm:px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">

        {/* 🟠 LEFT CONTENT */}
        <div className="max-w-xl">

          {/* 🔥 PREMIUM BADGE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 
              bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 
              text-black px-4 py-1.5 rounded-full text-sm font-semibold mb-4 
              shadow-md shadow-yellow-500/30"
          >
            <Award size={16} className="text-black" />
            <span>Premium Platters</span>
          </motion.div>

          {/* MAIN HEADING */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight text-white"
          >
            Hosting? Go big With{" "}
            <span className="text-orange-500">
              Bellefood Platters
            </span>
          </motion.h2>

          {/* DESCRIPTION */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/70 mt-4 sm:mt-6 text-sm sm:text-base leading-relaxed"
          >
            Perfect for events, meetings, or when you’re feeding the squad.
            Our party platters serve 4–6 people and come with all your favorites.
          </motion.p>

          {/* 🔥 BULLETS WITH PRICE */}
          <div className="mt-6 space-y-5">
            {items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-start gap-3"
              >
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                
                <div>
                  <p className="text-white text-sm sm:text-base font-medium">
                    {item.title}
                  </p>
                  <p className="text-white/60 text-sm mt-1">
                    {item.price}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 🔥 BUTTONS */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">

            {/* PRIMARY */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center justify-center gap-2 
                bg-orange-500 text-white px-6 py-3 rounded-full 
                text-sm sm:text-base font-medium"
            >
              Order Now <ArrowRight size={18} />
            </motion.button>

            {/* SECONDARY */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.05, backgroundColor: "#ffffff10" }}
              className="border border-white/30 text-white px-6 py-3 rounded-full 
                text-sm sm:text-base font-medium"
            >
              View platters
            </motion.button>
          </div>
        </div>

        {/* 🍗 RIGHT IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="relative w-full h-[260px] sm:h-[320px] md:h-[520px]"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <Image
              src="/images/platter1.png"
              alt="platter"
              fill
              className="object-cover rounded-2xl"
              priority
            />
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}