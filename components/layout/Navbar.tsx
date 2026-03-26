"use client";

import Link from "next/link";
import {
  ShoppingCart,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const navItems = ["Home", "Menu", "Track Orders"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>("Home");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 w-full z-50 flex justify-center"
      >
        <motion.div
          animate={{
            scale: scrolled ? 0.95 : 1,
            backdropFilter: scrolled ? "blur(16px)" : "blur(0px)",
          }}
          className={`relative flex items-center justify-between w-[95%] max-w-6xl px-4 md:px-8 py-3 md:py-4 mt-4 rounded-full border 
          ${
            scrolled
              ? "bg-white/70 shadow-2xl border-white/20"
              : "bg-white shadow-md border-transparent"
          }`}
        >
          {/* LOGO */}
          <div className="flex items-center gap-2 cursor-pointer">
            <span>🍴</span>
            <span className="text-lg md:text-2xl font-extrabold">
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Belle
              </span>
              <span className="text-orange-600">FOOD</span>
            </span>
          </div>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-8 text-base font-semibold text-gray-700">
            {navItems.map((item) => (
              <div
                key={item}
                className="relative px-2 py-1"
                onMouseEnter={() => setHovered(item)}
                onMouseLeave={() => setHovered(null)}
              >
                {hovered === item && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-black rounded-full"
                  />
                )}

                <Link
                  href={`/${
                    item === "Home"
                      ? ""
                      : item.toLowerCase().replace(" ", "")
                  }`}
                  className={`relative z-10 px-5 py-2 rounded-full ${
                    hovered === item ? "text-white" : "text-gray-700"
                  }`}
                >
                  {item}
                </Link>
              </div>
            ))}

            <div className="flex items-center gap-1 cursor-pointer">
              Services <ChevronDown size={16} />
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            {/* Contact (desktop only) */}
            <Link
              href="/contact"
              className="hidden md:block border px-4 py-2 rounded-full text-sm"
            >
              Contact
            </Link>

            {/* Cart */}
            <button className="bg-orange-500 text-white p-2.5 md:p-3 rounded-full">
              <ShoppingCart size={18} />
            </button>

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2"
            >
              <Menu />
            </button>
          </div>
        </motion.div>
      </motion.nav>

      {/* 📱 MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
          >
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", stiffness: 120 }}
              className="bg-white w-full p-6 rounded-b-3xl"
            >
              {/* TOP BAR */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold">Menu</span>
                <button onClick={() => setMobileOpen(false)}>
                  <X />
                </button>
              </div>

              {/* LINKS */}
              <div className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item}
                    href={`/${
                      item === "Home"
                        ? ""
                        : item.toLowerCase().replace(" ", "")
                    }`}
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-medium"
                  >
                    {item}
                  </Link>
                ))}

                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-medium"
                >
                  Contact
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}