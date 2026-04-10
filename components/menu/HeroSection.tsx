"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function HeroSection() {
  const [location, setLocation] = useState("Lagos, Nigeria");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");

  // 📍 Auto-detect location
  useEffect(() => {
    if (!navigator.geolocation) return;

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();

          const city =
            data.address.city ||
            data.address.town ||
            data.address.state ||
            "Your location";

          setLocation(`${city}, Nigeria`);
        } catch {
          setLocation("Lagos, Nigeria");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLocation("Lagos, Nigeria");
        setLoading(false);
      }
    );
  }, []);

  // ✏️ Handle manual change
  const handleUpdateLocation = () => {
    if (!input.trim()) return;
    setLocation(input);
    setEditing(false);
    setInput("");
  };

  return (
    <section className="relative w-full h-[75vh] md:h-[85vh] overflow-hidden">

      {/* 🍲 Background */}
      <Image
        src="/images/menu1.png"
        alt="Food background"
        fill
        priority
        className="object-cover"
      />

      {/* 🌑 Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* CONTENT */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">

        {/* 🧠 Title */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold text-white"
        >
          Our <span className="text-orange-500">Menu</span>
        </motion.h1>

        {/* 📄 Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-white/80 max-w-xl text-sm md:text-base"
        >
          Checkout our signature dishes available on the menu
        </motion.p>
      </div>

      {/* 🔻 BOTTOM BAR (RESPONSIVE) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-6 left-0 w-full px-4 md:px-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">

          {/* 🔗 BREADCRUMB */}
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Link
              href="/"
              className="cursor-pointer hover:text-white transition"
            >
              Home
            </Link>

            <ChevronRight size={16} className="text-white/50" />

            <span className="text-white font-medium">
              Menu
            </span>
          </div>

          {/* 📍 LOCATION */}
          <div className="flex flex-col items-start md:items-end gap-1 w-full md:w-auto">

            {/* DISPLAY */}
            <div className="flex items-center gap-2 text-white text-xs md:text-sm bg-black/50 px-3 md:px-4 py-2 rounded-full backdrop-blur-md w-full md:w-auto">
              <MapPin size={16} className="text-orange-500 flex-shrink-0" />

              <span className="truncate">
                Delivering to:{" "}
                <strong>
                  {loading ? "Detecting..." : location}
                </strong>
              </span>
            </div>

            {/* CHANGE */}
            <button
              onClick={() => setEditing(true)}
              className="text-white/60 text-xs hover:text-orange-400 transition ml-1 md:ml-6"
            >
              Change
            </button>

            {/* EDIT INPUT */}
            {editing && (
              <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full md:w-auto">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter location..."
                  className="px-3 py-2 rounded-md text-black text-sm outline-none w-full sm:w-auto"
                />
                <button
                  onClick={handleUpdateLocation}
                  className="bg-orange-500 px-3 py-2 rounded-md text-sm text-white w-full sm:w-auto"
                >
                  Save
                </button>
              </div>
            )}
          </div>

        </div>
      </motion.div>
    </section>
  );
}