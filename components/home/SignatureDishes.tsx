"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useRef, useState } from "react";

const dishes = [
  {
    name: "Fried Rice",
    price: 5500,
    desc: "Spicy tomato sauce rice with our signature seasoning",
    image: "/images/sign1.png",
  },
  {
    name: "Party Jollof Rice",
    price: 5500,
    desc: "Smoky jollof rice with grilled chicken & plantain",
    image: "/images/sign2.png",
  },
  {
    name: "Asun Rice",
    price: 5500,
    desc: "Rice served with spicy goat meat (asun)",
    image: "/images/sign3.png",
  },
  {
    name: "Noodles and Turkey",
    price: 5500,
    desc: "Stir-fried noodles with grilled turkey",
    image: "/images/sign5.png",
  },
  {
    name: "Ofada Rice & Sauce",
    price: 6000,
    desc: "Local Ofada rice with spicy ayamase sauce",
    image: "/images/sign4.png",
  },
  {
    name: "Amala & Ewedu",
    price: 5000,
    desc: "Soft amala served with ewedu and gbegiri soup",
    image: "/images/sign8.png",
  },
  {
    name: "Peppered Chicken",
    price: 6500,
    desc: "Grilled chicken tossed in spicy pepper sauce",
    image: "/images/sign7.png",
  },
  {
    name: "Goat Meat Pepper Soup",
    price: 7000,
    desc: "Hot and spicy goat meat pepper soup",
    image: "/images/sign6.png",
  },
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
    <section className="bg-[#0e0f11] py-12 sm:py-16 px-4 sm:px-6 text-white">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8 sm:mb-10">
          <div>
            <p className="text-gray-400 text-xs sm:text-sm mb-2">Featured</p>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold">
              Signature <span className="text-orange-500">Dishes</span>
            </h2>

            <p className="text-gray-400 mt-2 text-sm sm:text-base">
              Our most loved meals.
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="border border-white/20 px-4 py-2 rounded-full text-xs sm:text-sm hover:bg-white/10 w-fit"
          >
            View all
          </button>
        </div>

        {/* CAROUSEL */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-4"
          >
            {dishes.map((dish, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.97 }}
                className="min-w-[220px] sm:min-w-[260px] md:min-w-[300px] snap-start"
              >
                {/* IMAGE */}
                <div className="h-[160px] sm:h-[200px] rounded-xl overflow-hidden mb-3 sm:mb-4">
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* TEXT */}
                <h3 className="font-semibold text-sm sm:text-lg mb-1">
                  {dish.name}
                </h3>

                <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3">
                  {dish.desc}
                </p>

                <p className="text-green-500 font-bold text-sm sm:text-lg mb-3">
                  ₦{dish.price.toLocaleString()}
                </p>

                {/* BUTTON */}
                <button className="w-full bg-orange-500 hover:bg-orange-600 transition py-2 rounded-full text-xs sm:text-sm font-medium">
                  Add to Cart
                </button>
              </motion.div>
            ))}
          </div>

          {/* CONTROLS */}
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
              className="fixed inset-0 bg-black/80 z-50"
              onClick={() => setOpen(false)}
            />

            <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <div
                className="bg-[#111] w-full max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-3 right-3"
                >
                  <X />
                </button>

                <h3 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6">
                  All Signature Dishes
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {dishes.map((dish, i) => (
                    <div key={i}>
                      <div className="h-[110px] sm:h-[140px] rounded-lg overflow-hidden mb-2">
                        <Image
                          src={dish.image}
                          alt={dish.name}
                          width={300}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex justify-between text-xs sm:text-sm">
                        <span>{dish.name}</span>
                        <span>₦{dish.price.toLocaleString()}</span>
                      </div>
                    </div>
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