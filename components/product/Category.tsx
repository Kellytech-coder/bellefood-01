"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";

const MotionDiv = motion.create("div");

const foodData: any = {
  "jollof-rice": {
    name: "Party Jollof Rice",
    price: 4000,
    image: "/images/menu2.png",
    description:
      "Smoky, perfectly seasoned jollof rice with the signature party flavor.",
  },
  "fried-rice": {
    name: "Nigerian Fried Rice",
    price: 4000,
    image: "/images/menu2.png",
    description: "Colorful fried rice loaded with vegetables.",
  },
  "coconut-rice": {
    name: "Coconut Rice",
    price: 4000,
    image: "/images/menu2.png",
    description: "Fragrant coconut-infused rice.",
  },
  swallow: {
    name: "Swallow",
    price: 3500,
    image: "/images/menu2.png",
    description: "Traditional swallow served with rich soup.",
  },
};

const proteins = ["Chicken", "Beef", "Fish", "Goat Meat"];

const extras = [
  { name: "Plantain", price: 500 },
  { name: "Coleslaw", price: 300 },
  { name: "Stew sauce", price: 200 },
];

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();

  const slug = params.slug as string;
  const product = foodData[slug];

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#040D0C] text-white px-4">
        <p className="mb-4 text-lg text-center">Product not found</p>
        <button
          onClick={() => router.push("/menu")}
          className="bg-orange-500 px-5 py-2 rounded-lg"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  const [qty, setQty] = useState(1);
  const [selectedProtein, setSelectedProtein] = useState<string | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const toggleExtra = (extraName: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extraName)
        ? prev.filter((e) => e !== extraName)
        : [...prev, extraName]
    );
  };

  const extrasTotal = selectedExtras.reduce((sum, name) => {
    const item = extras.find((e) => e.name === name);
    return sum + (item?.price || 0);
  }, 0);

  const total = (product.price + extrasTotal) * qty;

  const handleAddToCart = () => {
    if (!selectedProtein) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }, 1000);
  };

  return (
    /* ✅ PUSH DOWN TO AVOID NAVBAR OVERLAP */
    <div className="min-h-screen bg-[#040D0C] text-white px-4 md:px-12 pt-24 pb-12">

      {/* BACK BUTTON */}
      <button
        onClick={() => router.push("/menu")}
        className="text-gray-400 mb-6 flex items-center gap-2 hover:text-white transition"
      >
        ← Back To Menu
      </button>

      {/* ✅ RESPONSIVE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">

        {/* IMAGE */}
        <MotionDiv
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="relative">
            <Image
              src={product.image}
              alt={product.name}
              width={700}
              height={550}
              className="rounded-2xl w-full h-[250px] sm:h-[320px] md:h-[420px] object-cover"
            />

            <span className="absolute top-3 right-3 bg-orange-500 text-black px-3 py-1 rounded-full text-xs sm:text-sm">
              Popular
            </span>

            <div className="absolute bottom-3 left-3 bg-green-600 px-3 py-1 rounded-lg text-xs sm:text-sm">
              ⏱ 30 Minutes Delivery
            </div>
          </div>

          {/* FEATURE BOXES */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { title: "Freshly Made", sub: "To Order" },
              { title: "Safe & Clean", sub: "Certified Hygiene" },
              { title: "Hot Delivery", sub: "Guaranteed" },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-[#111] rounded-xl p-2 sm:p-3 text-center"
              >
                <p className="text-xs sm:text-sm font-semibold">
                  {item.title}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400">
                  {item.sub}
                </p>
              </div>
            ))}
          </div>
        </MotionDiv>

        {/* DETAILS */}
        <MotionDiv
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-5 md:space-y-6"
        >
          <h1 className="text-2xl md:text-3xl font-bold">
            {product.name}
          </h1>

          <p className="text-gray-400 text-sm md:text-base">
            {product.description}
          </p>

          <div className="text-xs sm:text-sm text-gray-400">
            ⭐⭐⭐⭐⭐ (4.5 stars) • 1034 orders this week
          </div>

          {/* PRICE */}
          <div className="bg-[#111] p-4 md:p-5 rounded-xl">
            <p className="text-xs text-gray-400">TOTAL PRICE</p>
            <h2 className="text-2xl md:text-3xl text-orange-500 font-bold">
              ₦{total}
            </h2>
          </div>

          {/* PROTEIN */}
          <div className="bg-[#111] p-4 md:p-5 rounded-xl">
            <div className="flex justify-between mb-3 text-sm">
              <h3>Choose Your Protein</h3>
              <span className="text-orange-500 text-xs">REQUIRED</span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {proteins.map((protein) => (
                <button
                  key={protein}
                  onClick={() => setSelectedProtein(protein)}
                  className={`py-2 rounded-lg border text-sm transition ${
                    selectedProtein === protein
                      ? "bg-orange-500 text-black"
                      : "border-gray-600"
                  }`}
                >
                  {protein}
                </button>
              ))}
            </div>
          </div>

          {/* EXTRAS */}
          <div className="bg-[#111] p-4 md:p-5 rounded-xl">
            <div className="flex justify-between mb-3 text-sm">
              <h3>Extras</h3>
              <span className="text-gray-400 text-xs">OPTIONAL</span>
            </div>

            <div className="space-y-2 text-sm">
              {extras.map((extra) => (
                <div
                  key={extra.name}
                  className="flex justify-between items-center"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedExtras.includes(extra.name)}
                      onChange={() => toggleExtra(extra.name)}
                    />
                    {extra.name}
                  </label>
                  <span className="text-orange-400">
                    +₦{extra.price}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* QUANTITY + BUTTON */}
          <div className="bg-[#111] p-4 md:p-5 rounded-xl">
            <h3 className="mb-3 text-sm">Quantity</h3>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-1 bg-gray-700 rounded"
              >
                -
              </button>

              <span>{qty}</span>

              <button
                onClick={() => setQty((q) => q + 1)}
                className="px-3 py-1 bg-gray-700 rounded"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!selectedProtein || loading}
              className={`mt-4 w-full py-3 rounded-xl text-sm font-semibold transition ${
                selectedProtein
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
            >
              {loading
                ? "Adding..."
                : added
                ? "✅ Added!"
                : `🛒 Add to cart - ₦${total}`}
            </button>
          </div>
        </MotionDiv>
      </div>
    </div>
  );
}