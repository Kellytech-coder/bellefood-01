"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

const partners = [
  { name: "Glovo", logo: "/images/glovo1.png" },
  { name: "Chowdeck", logo: "/images/chowdeck1.png" },
  { name: "Uber Eats", logo: "/images/Eat1.png" },
  { name: "Foodhub", logo: "/images/Foodhub1.png" },
];

export default function Partners() {
  return (
    <section className="relative bg-[#071311] py-16 md:py-24 overflow-hidden">

      {/* 🧠 TEXT (NORMAL FLOW ON MOBILE, FLOAT ON DESKTOP) */}
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
        <div className="backdrop-blur-md bg-white/5 border border-white/10 px-5 py-4 md:px-6 md:py-5 rounded-2xl shadow-xl max-w-xs md:max-w-sm">
          <h3 className="text-lg md:text-2xl font-semibold text-gray-200 leading-snug">
            Partnering with top leading
            <br />
            companies in Nigeria
          </h3>
        </div>
      </motion.div>

      {/* 🎭 LEFT MASK (ONLY ON DESKTOP) */}
      <div className="hidden md:block absolute left-0 top-0 h-full w-[45%] bg-gradient-to-r from-[#071311] via-[#071311]/95 to-transparent z-20" />

      {/* 🔥 MARQUEE */}
      <div className="relative flex items-center overflow-hidden z-10">

        {/* RIGHT EDGE FADE */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-20 md:w-32 bg-gradient-to-l from-[#071311] to-transparent z-10" />

        <motion.div
          className="flex gap-10 md:gap-20 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            duration: 18,
            ease: "linear",
          }}
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
      className="
        relative 
        w-[100px] h-[40px] 
        md:w-[140px] md:h-[50px] 
        flex-shrink-0 
        opacity-80 hover:opacity-100 transition
      "
    >
      {!loaded && (
        <div className="absolute inset-0 rounded-md bg-white/10 overflow-hidden">
          <div className="w-full h-full animate-pulse bg-gradient-to-r from-white/10 via-white/20 to-white/10" />
        </div>
      )}

      <Image
        src={partner.logo}
        alt={partner.name}
        fill
        onLoad={() => setLoaded(true)}
        className={`object-contain transition-all duration-700 ${
          loaded ? "opacity-100 blur-0" : "opacity-0 blur-md scale-105"
        }`}
      />
    </motion.div>
  );
}