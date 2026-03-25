"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState, useEffect } from "react";

const categories = [
  { title: "Rice", image: "/images/cat-rice1.png" },
  { title: "Swallow", image: "/images/cat-swallow1.png" },
  { title: "Proteins", image: "/images/cat-turkey1.png" },
  { title: "Platter", image: "/images/cat-platter1.png" },
  { title: "Drinks", image: "/images/cat-drink1.png" },
  { title: "Snacks", image: "/images/cat-snack1.png" },
  { title: "Soups", image: "/images/cat-soup1.png" },
  { title: "Grills", image: "/images/cat-grill1.png" },
  { title: "Desserts", image: "/images/cat-jellof1.png" },
  { title: "Specials", image: "/images/cat-specials1.png" },
];

export default function Categories() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(4);

  // ✅ Responsive cards count
  useEffect(() => {
    const updateView = () => {
      if (window.innerWidth < 640) setCardsPerView(1);
      else if (window.innerWidth < 1024) setCardsPerView(2);
      else setCardsPerView(4);
    };

    updateView();
    window.addEventListener("resize", updateView);
    return () => window.removeEventListener("resize", updateView);
  }, []);

  const maxIndex = categories.length - cardsPerView;

  const next = () => {
    setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prev = () => {
    setIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  return (
    <section className="bg-[#0f1115] py-16 md:py-24 px-4 md:px-6 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6 mb-10 md:mb-14"
        >
          <div>
            <p className="text-gray-400 text-sm mb-2">Categories Menu</p>

            <h2 className="text-2xl sm:text-3xl md:text-5xl font-semibold leading-tight">
              What Are{" "}
              <span className="text-orange-500">You Craving</span>
              <br />
              <span className="text-orange-500">Today?</span>
            </h2>

            <p className="text-gray-400 mt-3 text-sm md:text-base">
              Checkout our meals available on the menu.
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="self-start border border-orange-500 px-5 py-2 text-sm rounded-full hover:bg-orange-500 transition"
          >
            View All
          </button>
        </motion.div>

        {/* CAROUSEL */}
        <div className="relative overflow-hidden">

          {/* TRACK */}
          <motion.div
            animate={{ x: `-${index * (100 / cardsPerView)}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="flex"
          >
            {categories.map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                className="flex-shrink-0 px-2"
                style={{ width: `${100 / cardsPerView}%` }}
              >
                <div className="relative w-full h-[180px] sm:h-[200px] md:h-[220px] rounded-2xl overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </div>

                <p className="mt-2 text-sm md:text-lg font-medium">
                  {item.title}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* CONTROLS */}
          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={prev}
              className="bg-white/10 p-2 md:p-3 rounded-full hover:bg-white/20"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={next}
              className="bg-white/10 p-2 md:p-3 rounded-full hover:bg-white/20"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] rounded-2xl p-5 md:p-8 max-w-5xl w-full relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4"
              >
                <X />
              </button>

              <h3 className="text-xl md:text-2xl mb-6 font-semibold">
                All Categories
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                {categories.map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className="cursor-pointer"
                  >
                    <div className="relative h-[120px] md:h-[150px] rounded-xl overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="mt-2 text-xs md:text-sm">
                      {item.title}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}