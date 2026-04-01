"use client";

import Image from "next/image";
import { MapPin, ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Hero() {
  const [rating, setRating] = useState(0);

  // ✅ Avatar images
  const avatars = [
    "/images/avatar1.png",
    "/images/avatar2.png",
    "/images/avatar3.png",
    "/images/avatar4.png",
    "/images/avatar5.png",
    "/images/avatar6.png",
  ];

  useEffect(() => {
    let start = 0;
    const end = 4.9;

    const step = () => {
      start += 0.1;
      if (start <= end) {
        setRating(parseFloat(start.toFixed(1)));
        requestAnimationFrame(step);
      }
    };

    step();
  }, []);

  return (
    <section className="relative w-full h-[90vh] flex items-center overflow-hidden">
      
      {/* 🔥 Background Image */}
      <motion.div
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2 }}
        className="absolute inset-0"
      >
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="w-full h-full"
        >
          <Image
            src="/images/hero1.png"
            alt="Delicious food"
            fill
            priority
            className="object-cover"
          />
        </motion.div>
      </motion.div>

      {/* 🌑 Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* 📦 Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 w-full pt-24 md:pt-32">
        <div className="max-w-xl text-white space-y-5">

          {/* 📍 Location */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs md:text-sm text-gray-300"
          >
            <MapPin size={14} className="text-orange-500" />
            Delivering to:
            <span className="font-semibold text-white">
              Lagos, Nigeria
            </span>
          </motion.div>

          {/* 🧠 Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-[64px] font-extrabold leading-[1.1]"
          >
            Hot & Ready in
            <br />
            <motion.span
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"
            >
              30 Minutes
            </motion.span>
          </motion.h1>

          {/* 📝 Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gray-200 text-sm md:text-base leading-relaxed"
          >
            Bellefood delivers your favorite meals{" "}
            <span className="text-white font-semibold">
              hot and fresh
            </span>
            , straight from our kitchen to your doorstep.
          </motion.p>

          {/* 🔘 Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              className="bg-orange-500 px-5 py-3 rounded-full flex items-center justify-center gap-2 text-sm font-medium hover:bg-orange-600 transition"
            >
              Order Now <ArrowRight size={16} />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              className="border border-white/40 px-5 py-3 rounded-full text-sm font-medium hover:bg-white/10 transition"
            >
              Track Orders
            </motion.button>
          </motion.div>

          {/* ⭐ Rating Box */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full border border-white/20 w-fit backdrop-blur-md">

              {/* ✅ Avatars (FIXED) */}
              <div className="flex -space-x-2">
                {avatars.map((src, index) => (
                  <div
                    key={index}
                    className="relative w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-white overflow-hidden hover:scale-105 transition"
                  >
                    <Image
                      src={src}
                      alt={`user-${index}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Stars */}
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={13} fill="currentColor" />
                ))}
              </div>

              {/* Rating */}
              <span className="text-xs md:text-sm text-gray-200 font-semibold">
                {rating.toFixed(1)} (165K+ reviews)
              </span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}