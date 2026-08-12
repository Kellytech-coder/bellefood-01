"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, X, Loader2 } from "lucide-react";
import { useRef, useState, useEffect } from "react";

import { getProducts, Product } from "@/lib/api";
import { useCartStore } from "@/lib/cartStore";

const fallbackImages = [
  "/images/sign1.png",
  "/images/sign2.png",
  "/images/sign3.png",
  "/images/sign4.png",
  "/images/sign5.png",
  "/images/sign6.png",
  "/images/sign7.png",
  "/images/sign8.png",
];

export default function SignatureDishes() {
  const [open, setOpen] = useState(false);
  const [dishes, setDishes] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addToCart = useCartStore((state) => state.addToCart);

  // ✅ FETCH FEATURED DISHES FROM BACKEND
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await getProducts();
        if (!mounted) return;

        // Take top-rated/available products as "featured"
        const featured = data
          .filter((p) => p.available !== false)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 8);

        setDishes(featured);
      } catch {
        // Ignore - show empty state
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.offsetWidth;

    scrollRef.current.scrollBy({
      left: dir === "left" ? -width * 0.8 : width * 0.8,
      behavior: "smooth",
    });
  };

  const handleAddToCart = (dish: Product) => {
    addToCart({
      id: dish.id,
      name: dish.name,
      desc: dish.description,
      price: Number(dish.price),
      qty: 1,
      image: dish.imageUrl,
    });
  };

  return (
    <section className="bg-[#0e0f11] py-12 sm:py-16 px-4 sm:px-6 text-white">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8 sm:mb-10">
          <div>
            <p className="text-gray-400 text-xs sm:text-sm mb-2">Featured</p>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold">
              Signature <span className="text-orange-500">Dishes</span>
            </h2>

            <p className="text-gray-400 mt-2 text-sm sm:text-base">
              Our most loved meals.
            </p>
          </div>

          {dishes.length > 0 && (
            <button
              onClick={() => setOpen(true)}
              className="border border-white/20 px-4 py-2 rounded-full text-xs sm:text-sm hover:bg-white/10 w-fit self-start sm:self-auto"
            >
              View all
            </button>
          )}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-orange-500" size={30} />
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && dishes.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">
            Signature dishes coming soon.
          </div>
        )}

        {/* CAROUSEL */}
        {dishes.length > 0 && (
          <div className="relative">
            <div
              ref={scrollRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-4"
            >
              {dishes.map((dish, i) => (
                <motion.div
                  key={dish.id}
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.97 }}
                  className="min-w-[220px] sm:min-w-[260px] md:min-w-[300px] snap-start flex flex-col"
                >
                  {/* IMAGE */}
                  <Link href={`/product/${dish.id}`}>
                    <div className="h-[160px] sm:h-[200px] rounded-xl overflow-hidden mb-3 sm:mb-4">
                      <Image
                        src={dish.imageUrl || fallbackImages[i % fallbackImages.length]}
                        alt={dish.name}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>

                  {/* CONTENT */}
                  <div className="flex flex-col flex-1">
                    <Link href={`/product/${dish.id}`}>
                      <h3 className="font-semibold text-sm sm:text-lg mb-1">
                        {dish.name}
                      </h3>
                    </Link>

                    <p className="text-gray-400 text-xs sm:text-sm mb-2 line-clamp-2">
                      {dish.description}
                    </p>

                    {/* PUSH DOWN */}
                    <div className="mt-auto">
                      <p className="text-green-500 font-bold text-sm sm:text-lg mb-3">
                        ₦{Number(dish.price).toLocaleString()}
                      </p>

                      <button
                        onClick={() => handleAddToCart(dish)}
                        className="w-full bg-orange-500 hover:bg-orange-600 transition py-2 rounded-full text-xs sm:text-sm font-medium"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
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
        )}
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
                    <Link key={dish.id} href={`/product/${dish.id}`}>
                      <div>
                        <div className="h-[110px] sm:h-[140px] rounded-lg overflow-hidden mb-2">
                          <Image
                            src={dish.imageUrl || fallbackImages[i % fallbackImages.length]}
                            alt={dish.name}
                            width={300}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex justify-between text-xs sm:text-sm">
                          <span>{dish.name}</span>
                          <span>₦{Number(dish.price).toLocaleString()}</span>
                        </div>
                      </div>
                    </Link>
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

