"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaXTwitter,
} from "react-icons/fa6";

export default function Footer() {
  const MotionLink = motion(Link);

  const container: Variants = {
    hidden: { opacity: 0, y: 60 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.15,
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const quickLinks = [
    { name: "Menu", href: "/menu" },
    { name: "Track Order", href: "/track-order" },
    { name: "About Us", href: "/about" },
    { name: "Delivery", href: "/delivery" },
  ];

  const hours = ["Mon - Sun", "10:00AM - 11:00PM"];

  const socials = [
    FaFacebookF,
    FaInstagram,
    FaXTwitter,
    FaLinkedinIn,
    FaYoutube,
  ];

  return (
    <footer className="relative w-full bg-gradient-to-b from-[#0B0F0E] to-black text-white pt-16 md:pt-20 pb-10 px-4 sm:px-6 md:px-12 overflow-hidden">

      {/* Glow Background (FIXED CLICK ISSUE) */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-orange-500/20 blur-[120px] md:blur-[140px] rounded-full pointer-events-none z-0" />

      {/* MAIN CONTAINER */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 max-w-7xl mx-auto bg-white text-black rounded-2xl p-6 sm:p-8 md:p-14 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 shadow-2xl"
      >

        {/* LEFT */}
        <motion.div variants={item} className="space-y-6">

          {/* LOGO */}
          <motion.div whileHover={{ scale: 1.05 }} className="w-fit">
            <Image
              src="/images/logo1.png"
              alt="BelleFood Logo"
              width={140}
              height={40}
              className="object-contain"
              priority
            />
          </motion.div>

          {/* ADDRESS */}
          <div>
            <h4 className="font-semibold mb-1 text-sm md:text-base">
              Address:
            </h4>
            <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
              Level 1, 12 Sample St, Sydney NSW 2000
            </p>
          </div>

          {/* CONTACT */}
          <div>
            <h4 className="font-semibold mb-1 text-sm md:text-base">
              Contact:
            </h4>
            <p className="text-xs md:text-sm text-gray-700">
              1800 123 4567
            </p>
            <p className="text-xs md:text-sm text-gray-700">
              email@example.com
            </p>
          </div>

          {/* SOCIALS */}
          <div className="flex items-center gap-4 pt-2">
            {socials.map((Icon, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.15, y: -4 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 rounded-full bg-black text-white hover:bg-orange-500 transition cursor-pointer"
              >
                <Icon size={14} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* QUICK LINKS (FIXED NAVIGATION) */}
        <motion.div variants={item} className="space-y-4">

          <h4 className="font-semibold text-sm md:text-base">
            Quick Links
          </h4>

          {quickLinks.map((link, i) => (
            <MotionLink
              key={i}
              href={link.href}
              whileHover={{ x: 6 }}
              whileTap={{ scale: 0.96 }}
              className="block text-xs md:text-sm text-gray-700 hover:text-orange-500 transition relative z-20 cursor-pointer"
            >
              {link.name}
            </MotionLink>
          ))}

        </motion.div>

        {/* HOURS */}
        <motion.div variants={item} className="space-y-4">

          <h4 className="font-semibold text-sm md:text-base">
            Hours
          </h4>

          {hours.map((time, i) => (
            <p key={i} className="text-xs md:text-sm text-gray-700">
              {time}
            </p>
          ))}

        </motion.div>

      </motion.div>

      {/* BOTTOM */}
      <div className="relative z-10 max-w-7xl mx-auto mt-8 md:mt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm text-gray-400 text-center md:text-left">

        <p>© 2024 BelleFood. All rights reserved.</p>

        <div className="flex flex-wrap justify-center md:justify-end items-center gap-4 md:gap-6">

          {["Privacy Policy", "Terms of Service", "Cookies Settings"].map(
            (text, i) => (
              <motion.span
                key={i}
                whileHover={{ scale: 1.05, color: "#fff" }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer"
              >
                {text}
              </motion.span>
            )
          )}

        </div>

      </div>
    </footer>
  );
}