"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/lib/cartStore";
import { useEffect, useState } from "react";

const navItems = ["Home", "Menu", "Track Orders"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>("Home");
  const [mobileOpen, setMobileOpen] = useState(false);

  // ✅ CART STORE
  const cart = useCartStore((state) => state.cart);
  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getHref = (item: string) => {
    if (item === "Home") return "/";
    if (item === "Menu") return "/menu";
    if (item === "Track Orders") return "/#track";
    return "/";
  };

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
          <div className="flex items-center">
            <Image
              src="/images/logo1.png"
              alt="BelleFood Logo"
              width={120}
              height={40}
              priority
              className="object-contain w-[95px] md:w-[115px] h-auto"
            />
          </div>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-5 text-sm font-semibold text-gray-950">
            {navItems.map((item) => (
              <div
                key={item}
                className="relative px-1 py-1"
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
                  href={getHref(item)}
                  className={`relative z-10 px-3 py-1.5 rounded-full transition ${
                    hovered === item ? "text-white" : "text-gray-950"
                  }`}
                >
                  {item}
                </Link>
              </div>
            ))}

            <div className="flex items-center gap-1 cursor-pointer text-sm">
              Services <ChevronDown size={14} />
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-2">
            <Link
              href="/contact"
              className="hidden md:block border px-3 py-1.5 rounded-full text-sm text-gray-950"
            >
              Contact
            </Link>

            {/* ✅ CART ICON WITH BADGE */}
            <div className="relative">
              <Link
                href="/cart"
                className="bg-orange-500 text-white p-2.5 rounded-full flex items-center justify-center hover:scale-105 transition"
              >
                <ShoppingCart size={17} />
              </Link>

              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </div>

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
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold">Menu</span>
                <button onClick={() => setMobileOpen(false)}>
                  <X />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item}
                    href={getHref(item)}
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