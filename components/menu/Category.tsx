"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import { useCartStore } from "@/lib/cartStore";

type FoodItem = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  category: string;
  badge?: string;
};

const categories = [
  "All Items",
  "Rice",
  "Swallow",
  "Proteins",
  "Platters",
  "Drinks",
];

const foods: FoodItem[] = Array.from({ length: 9 }).map((_, i) => ({
  id: i + 1,
  name:
    i % 3 === 0
      ? "Party Jollof Rice"
      : i % 3 === 1
      ? "Swallow"
      : "Fried Rice",
  slug:
    i % 3 === 0
      ? "jollof-rice"
      : i % 3 === 1
      ? "swallow"
      : "fried-rice",
  description:
    "Smoky, perfectly seasoned jollof rice with the signature party flavor.",
  price: 4000,
  image: "/images/menu2.png",
  category: i % 3 === 1 ? "Swallow" : "Rice",
  badge:
    i === 0
      ? "Popular"
      : i === 1
      ? "Best Seller"
      : i === 2
      ? "Premium"
      : undefined,
}));

export default function MenuCategory() {
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [page, setPage] = useState(1);

  const cartRef = useRef<HTMLDivElement>(null);

  const [flyImage, setFlyImage] = useState<{
    image: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);

  // ✅ ZUSTAND STORE
  const cart = useCartStore((state) => state.cart);
  const addToCart = useCartStore((state) => state.addToCart);
  const increaseQty = useCartStore((state) => state.increaseQty);
  const decreaseQty = useCartStore((state) => state.decreaseQty);

  const itemsPerPage = 6;

  const filteredFoods =
    activeCategory === "All Items"
      ? foods
      : foods.filter((f) => f.category === activeCategory);

  const totalPages = Math.ceil(filteredFoods.length / itemsPerPage);

  const paginatedFoods = filteredFoods.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // ✅ ADD TO CART (ZUSTAND + ANIMATION)
  const addToCartHandler = (
    food: FoodItem,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cartRef.current) return;

    const img = e.currentTarget
      .closest(".food-card")
      ?.querySelector("img");

    if (!img) return;

    const imgRect = img.getBoundingClientRect();
    const cartRect = cartRef.current.getBoundingClientRect();

    setFlyImage({
      image: food.image,
      startX: imgRect.left,
      startY: imgRect.top,
      endX: cartRect.left,
      endY: cartRect.top,
    });

    addToCart({
      id: food.id,
      name: food.name,
      desc: food.description,
      price: food.price,
      qty: 1,
    });

    setTimeout(() => setFlyImage(null), 700);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <section className="bg-[#071311] py-10 md:py-16 px-4 md:px-6 relative min-h-screen overflow-hidden">

      {/* CART */}
      <motion.div
        ref={cartRef}
        animate={{ scale: totalItems ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50"
      >
        <Link href="/cart">
          <div className="relative bg-orange-500 p-3 md:p-4 rounded-full shadow-xl cursor-pointer hover:scale-110 transition">
            <ShoppingCart className="text-white" size={22} />

            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-black text-xs px-2 py-1 rounded-full font-semibold">
                {totalItems}
              </span>
            )}
          </div>
        </Link>
      </motion.div>

      {/* FLY IMAGE */}
      <AnimatePresence>
        {flyImage && (
          <motion.img
            src={flyImage.image}
            initial={{
              x: flyImage.startX,
              y: flyImage.startY,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              x: flyImage.endX,
              y: flyImage.endY,
              scale: 0.1,
              opacity: 0,
            }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="fixed w-16 h-16 md:w-20 md:h-20 rounded-full z-50 pointer-events-none shadow-2xl"
          />
        )}
      </AnimatePresence>

      {/* CATEGORY */}
      <div className="sticky top-0 z-40 bg-[#071311]/95 backdrop-blur-md pt-3 pb-5 mb-8 border-b border-[#1a1f1f]">
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-3 min-w-max">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setActiveCategory(cat);
                  setPage(1);
                }}
                className={`px-4 py-2 text-sm md:text-base rounded-full border whitespace-nowrap transition ${
                  activeCategory === cat
                    ? "bg-orange-500 text-white border-orange-500"
                    : "border-gray-600 text-gray-300 hover:border-orange-500"
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* GRID */}
      <motion.div
        key={activeCategory + page}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
      >
        {paginatedFoods.map((food) => {
          const quantity = cart.find((item) => item.id === food.id)?.qty;

          return (
            <Link key={food.id} href={`/product/${food.slug}`} className="block">
              <motion.div
                whileHover={{ y: -6 }}
                className="food-card bg-[#101414] rounded-2xl overflow-hidden shadow-lg cursor-pointer"
              >
                <div className="relative h-48 md:h-52">
                  <Image
                    src={food.image}
                    alt={food.name}
                    fill
                    className="object-cover"
                  />

                  {food.badge && (
                    <span className="absolute right-3 top-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                      {food.badge}
                    </span>
                  )}
                </div>

                <div className="p-5 md:p-6">
                  <h3 className="text-white text-lg md:text-xl font-semibold mb-2">
                    {food.name}
                  </h3>

                  <p className="text-gray-400 text-sm mb-4">
                    {food.description}
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="text-green-500 font-bold text-lg">
                      ₦{food.price.toLocaleString()}
                    </span>

                    {!quantity ? (
                      <button
                        onClick={(e) => addToCartHandler(food, e)}
                        className="bg-orange-500 px-4 py-2 rounded-full text-white flex items-center gap-2 hover:bg-orange-600 text-sm"
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 bg-orange-500 px-3 py-2 rounded-full">
                        <button onClick={(e) => decreaseQty(food.id)}>
                          <Minus size={16} className="text-white" />
                        </button>

                        <span className="text-white font-semibold">
                          {quantity}
                        </span>

                        <button onClick={(e) => increaseQty(food.id)}>
                          <Plus size={16} className="text-white" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>

      {/* PAGINATION */}
      <div className="mt-12 flex justify-between items-center">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="bg-[#101414] px-4 py-2 rounded-full text-white disabled:opacity-40"
        >
          <ArrowLeft size={16} />
        </button>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="bg-orange-500 px-4 py-2 rounded-full text-white disabled:opacity-40"
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}