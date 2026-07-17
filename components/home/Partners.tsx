"use client";

import Image from "next/image";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

const partners = [
  { name: "Glovo", logo: "/images/glovo1.png" },
  { name: "Chowdeck", logo: "/images/chowdeck1.png" },
  { name: "Uber Eats", logo: "/images/Eat1.png" },
  { name: "Foodhub", logo: "/images/Foodhub1.png" },
];

export default function Partners() {
  const controls = useAnimation();

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

  const stop = () => controls.stop();

  // ✅ start automatically
  useEffect(() => {
    start();
  }, []);

  return (
    <section className="relative bg-[#071311] py-12 sm:py-16 md:py-24 overflow-x-hidden">

      {/* TEXT */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="px-4 sm:px-6 md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2 z-30 mb-8 md:mb-0"
      >
        <h3 className="text-base sm:text-lg md:text-2xl font-semibold text-gray-200 leading-snug max-w-xs">
          Partnering with top leading
          <br />
          companies in Nigeria
        </h3>
      </motion.div>

      {/* LEFT MASK */}
      <div className="hidden md:block absolute left-0 top-0 h-full w-[40%] bg-gradient-to-r from-[#071311] via-[#071311]/95 to-transparent z-20" />

      {/* MARQUEE */}
      <div
        className="relative flex items-center overflow-hidden z-10"
        onTouchStart={stop}
        onTouchEnd={start}
        onMouseEnter={stop}
        onMouseLeave={start}
      >
        {/* RIGHT FADE */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-16 sm:w-20 md:w-32 bg-gradient-to-l from-[#071311] to-transparent z-10" />

        <motion.div
          className="flex gap-8 sm:gap-12 md:gap-20 w-max"
          animate={controls}
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
      whileTap={{ scale: 0.92 }}
      className="relative w-[90px] h-[35px] sm:w-[110px] sm:h-[40px] md:w-[140px] md:h-[50px] flex-shrink-0 opacity-80 hover:opacity-100 transition"
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
        sizes="(max-width: 640px) 90px,
               (max-width: 1024px) 110px,
               140px"
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