"use client";

import { motion, Variants } from "framer-motion";
import { FiTrash2, FiPlus, FiMinus } from "react-icons/fi";
import { useCartStore } from "@/lib/cartStore";
import { useRouter } from "next/navigation";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemAnim: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function CartItems() {
  const router = useRouter();

  // Zustand store
  const cart = useCartStore((state) => state.cart);
  const increaseQty = useCartStore((state) => state.increaseQty);
  const decreaseQty = useCartStore((state) => state.decreaseQty);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  const delivery = cart.length > 0 ? 1000 : 0;
  const total = subtotal + delivery;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    router.push("/checkout");
  };

  return (
    <section className="bg-[#071a14] text-white py-16">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-10">

        {/* LEFT SIDE */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="lg:col-span-2 space-y-6"
        >
          {cart.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">Your cart is empty 🛒</p>
              <p className="text-sm mt-2">
                Add delicious meals from the menu
              </p>
            </div>
          )}

          {cart.map((item) => (
            <motion.div
              key={item.id}
              variants={itemAnim}
              className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#1c1c1e] p-5 rounded-2xl border border-gray-700 gap-4"
            >
              {/* ITEM INFO */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-400 rounded-xl" />

                <div>
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                  <p className="text-orange-500 font-semibold mt-1">
                    ₦{item.price.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-4">

                {/* Quantity */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => decreaseQty(item.id)}
                    className="text-gray-300 hover:text-white"
                  >
                    <FiMinus />
                  </button>

                  <span>{item.qty}</span>

                  <button
                    onClick={() => increaseQty(item.id)}
                    className="bg-orange-500 p-2 rounded-lg hover:scale-110 transition"
                  >
                    <FiPlus />
                  </button>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <FiTrash2 />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* RIGHT SIDE */}
        <motion.div
          variants={itemAnim}
          initial="hidden"
          animate="show"
          className="bg-[#1c1c1e] p-6 rounded-2xl border border-gray-700 h-fit"
        >
          <h2 className="text-2xl font-semibold mb-6">
            Order Summary
          </h2>

          <div className="flex justify-between mb-3 text-gray-300">
            <span>Subtotal ({cart.length} Items)</span>
            <span>₦{subtotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between mb-4">
            <span className="text-gray-300">Delivery Fee</span>
            <span className="text-green-500">
              ₦{delivery.toLocaleString()}
            </span>
          </div>

          <hr className="border-gray-700 mb-4" />

          <div className="flex justify-between text-lg font-semibold mb-6">
            <span>Total</span>
            <span className="text-orange-500">
              ₦{total.toLocaleString()}
            </span>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className={`w-full py-3 rounded-full font-medium transition ${
              cart.length === 0
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-orange-500 hover:scale-105"
            }`}
          >
            Proceed to Checkout →
          </button>
        </motion.div>
      </div>
    </section>
  );
}