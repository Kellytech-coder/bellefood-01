"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useRef, useState } from "react";

const dishes = [
  { name: "Jollof Rice & Chicken", price: 55, image: "/images/sign1.png" },
  { name: "Fried Rice Special", price: 55, image: "/images/sign2.png" },
  { name: "Grilled Chicken Plate", price: 55, image: "/images/sign3.png" },
  { name: "Ofada Rice Combo", price: 55, image: "/images/sign4.png" },
  { name: "Amala & Ewedu", price: 55, image: "/images/amala1.jpg" },
];

export default function SignatureDishes() {
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.offsetWidth;

    scrollRef.current.scrollBy({
      left: dir === "left" ? -width * 0.8 : width * 0.8,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-[#0e0f11] py-16 md:py-20 px-4 sm:px-6 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
          <div>
            <p className="text-gray-400 mb-2 text-sm">Featured</p>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Signature <span className="text-orange-500">Dishes</span>
            </h2>

            <p className="text-gray-400 mt-2 text-sm sm:text-base">
              Our most loved meals.
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="border border-white/20 px-4 py-2 rounded-full text-sm hover:bg-white/10 transition w-fit"
          >
            View all
          </button>
        </div>

        {/* CAROUSEL */}
        <div className="relative">

          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth no-scrollbar pb-2"
          >
            {dishes.map((dish, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8 }}
                className="min-w-[220px] sm:min-w-[260px] md:min-w-[280px] flex-shrink-0"
              >
                <div className="relative h-[180px] sm:h-[220px] rounded-2xl overflow-hidden mb-3">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full"
                  >
                    <Image
                      src={dish.image}
                      alt={dish.name}
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                </div>

                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-sm sm:text-base">
                    {dish.name}
                  </h3>
                  <span className="font-bold text-sm sm:text-base">
                    ${dish.price}
                  </span>
                </div>

                <p className="text-xs text-gray-400 mb-3">Variant</p>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{
                    backgroundColor: "#ff7a00",
                    color: "#fff",
                  }}
                  className="w-full border border-white/20 py-2 rounded-full text-xs sm:text-sm"
                >
                  Add to cart
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* CONTROLS (hide on small screens) */}
          <div className="hidden md:flex justify-end gap-3 mt-6">
            <button
              onClick={() => scroll("left")}
              className="bg-white text-black p-3 rounded-lg"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="bg-white text-black p-3 rounded-lg"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
            >
              <div
                className="bg-[#111] w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6 relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-3 right-3 text-white/70"
                >
                  <X />
                </button>

                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                  All Signature Dishes
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {dishes.map((dish, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      className="bg-[#1a1a1a] p-3 sm:p-4 rounded-xl"
                    >
                      <div className="relative h-[120px] sm:h-[140px] rounded-lg overflow-hidden mb-2">
                        <Image
                          src={dish.image}
                          alt={dish.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex justify-between text-xs sm:text-sm">
                        <span>{dish.name}</span>
                        <span>${dish.price}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}