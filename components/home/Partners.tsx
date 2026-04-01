"use client";

import Image from "next/image";
import { motion, useAnimation } from "framer-motion";
import { useState } from "react";

const partners = [
  { name: "Glovo", logo: "/images/glovo1.png" },
  { name: "Chowdeck", logo: "/images/chowdeck1.png" },
  { name: "Uber Eats", logo: "/images/Eat1.png" },
  { name: "Foodhub", logo: "/images/Foodhub1.png" },
];

export default function Partners() {
  const controls = useAnimation();

  // ▶️ Start marquee
  const start = () => {
    controls.start({
      x: ["0%", "-50%"],
      transition: {
        repeat: Infinity,
        duration: 18,
        ease: "linear",
      },
    });
  };

  // ⏸ Pause on touch
  const stop = () => {
    controls.stop();
  };

  return (
    <section className="relative bg-[#071311] py-16 md:py-24 overflow-hidden">

      {/* TEXT (container removed; only text visible) */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="
          relative md:absolute
          md:left-0 md:top-1/2 md:-translate-y-1/2
          z-30 px-4 md:pl-6 mb-10 md:mb-0
        "
      >
        <h3 className="text-lg md:text-2xl font-semibold text-gray-200 leading-snug">
          Partnering with top leading
          <br />
          companies in Nigeria
        </h3>
      </motion.div>

      {/* LEFT MASK */}
      <div className="hidden md:block absolute left-0 top-0 h-full w-[45%] bg-gradient-to-r from-[#071311] via-[#071311]/95 to-transparent z-20" />

      {/* MARQUEE */}
      <div
        className="relative flex items-center overflow-hidden z-10"
        onTouchStart={stop}   // ✅ pause on mobile touch
        onTouchEnd={start}    // ✅ resume
        onMouseEnter={stop}   // desktop hover pause
        onMouseLeave={start}
      >
        {/* RIGHT FADE */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-20 md:w-32 bg-gradient-to-l from-[#071311] to-transparent z-10" />

        <motion.div
          className="flex gap-10 md:gap-20 w-max"
          animate={controls}
          onViewportEnter={start}
        >
          {[...partners, ...partners].map((partner, index) => (
            <LogoItem key={index} partner={partner} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function LogoItem({ partner }: any) {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }} // ✅ MOBILE PRESS
      className="
        relative 
        w-[100px] h-[40px] 
        md:w-[140px] md:h-[50px] 
        flex-shrink-0 
        opacity-80 hover:opacity-100 transition
        active:opacity-100
      "
    >
      {/* Skeleton */}
      {!loaded && (
        <div className="absolute inset-0 rounded-md bg-white/10 overflow-hidden">
          <div className="w-full h-full animate-pulse bg-gradient-to-r from-white/10 via-white/20 to-white/10" />
        </div>
      )}

      {/* Logo */}
      <Image
        src={partner.logo}
        alt={partner.name}
        fill
        onLoad={() => setLoaded(true)}
        className={`object-contain transition-all duration-700 ${
          loaded
            ? "opacity-100 blur-0 scale-100"
            : "opacity-0 blur-md scale-110"
        }`}
      />
    </motion.div>
  );
}