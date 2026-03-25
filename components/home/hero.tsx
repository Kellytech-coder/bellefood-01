"use client";

import Image from "next/image";
import { MapPin, ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Hero() {
  const [rating, setRating] = useState(0);

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
    <section className="relative w-full min-h-[600px] md:h-[90vh] flex items-center overflow-hidden">

      {/* Background */}
      <motion.div
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2 }}
        className="absolute inset-0"
      >
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
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

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 w-full">
        <div className="max-w-xl text-white">

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs md:text-sm mb-4 text-gray-300"
          >
            <MapPin size={14} className="text-orange-500" />
            Delivering to:
            <span className="font-semibold text-white">
              Lagos, Nigeria
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-5"
          >
            Hot & Ready in
            <br />
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"
            >
              30 Minutes
            </motion.span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gray-200 mb-6 text-sm sm:text-base md:text-lg leading-relaxed"
          >
            Bellefood delivers your favorite meals{" "}
            <span className="text-white font-semibold">
              hot and fresh
            </span>
            , straight from our kitchen to your doorstep.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-3 mb-8"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-orange-500 px-5 py-3 rounded-full flex items-center justify-center gap-2 text-sm md:text-base"
            >
              Order Now <ArrowRight size={16} />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              className="border border-white/40 px-5 py-3 rounded-full text-sm md:text-base"
            >
              Track Orders
            </motion.button>
          </motion.div>

          {/* Ratings */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center gap-4"
          >
            {/* Avatars */}
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="relative w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white overflow-hidden"
                >
                  <Image
                    src={`/images/avatar${item}.jpg`}
                    alt="user"
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full border border-white/20">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>

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