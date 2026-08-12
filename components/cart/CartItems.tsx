"use client";

import { motion, Variants } from "framer-motion";
import { FiTrash2, FiPlus, FiMinus, FiLoader } from "react-icons/fi";
import Image from "next/image";
import { useCartStore } from "@/lib/cartStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getCart,
  addToCart as apiAddToCart,
  removeFromCart as apiRemoveFromCart,
  CartItemApi,
} from "@/lib/api";

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
  const addToCart = useCartStore((state) => state.addToCart);
  const increaseQty = useCartStore((state) => state.increaseQty);
  const decreaseQty = useCartStore((state) => state.decreaseQty);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  // ✅ LOAD CART FROM BACKEND ON MOUNT (if local cart is empty)
  useEffect(() => {
    let mounted = true;

    async function loadRemoteCart() {
      try {
        setSyncing(true);
        const remote: CartItemApi[] = await getCart();

        if (!mounted || !remote || remote.length === 0) return;

        // Merge: only seed if local cart is empty
        useCartStore.setState((state) => {
          if (state.cart.length > 0) return {};
          return {
            cart: remote.map((item) => ({
              id: item.productId || item.id,
              name: item.productName,
              desc: "",
              price: Number(item.price),
              qty: item.quantity,
              image: item.imageUrl,
            })),
          };
        });
      } catch {
        // Backend down — keep local cart
      } finally {
        if (mounted) setSyncing(false);
      }
    }

    loadRemoteCart();

    return () => {
      mounted = false;
    };
  }, []);

  // ✅ PERSIST TO BACKEND WHEN CART CHANGES (debounced)
  useEffect(() => {
    if (synced || syncing) return;

    const timer = setTimeout(async () => {
      if (cart.length === 0) return;

      try {
        setSyncing(true);

        for (const item of cart) {
          await apiAddToCart({
            productId: item.id,
            productName: item.name,
            quantity: item.qty,
            price: item.price,
            imageUrl: item.image || "",
          });
        }

        setSynced(true);
      } catch {
        // Backend down — local state is still the source of truth
      } finally {
        setSyncing(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [cart, synced, syncing]);

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

  const handleRemove = async (id: string) => {
    removeFromCart(id);
    // Try to delete from backend (fire and forget)
    try {
      await apiRemoveFromCart(id);
    } catch {
      // ignore
    }
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
          {cart.length === 0 && !syncing && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">Your cart is empty 🛒</p>
              <p className="text-sm mt-2">
                Add delicious meals from the menu
              </p>
            </div>
          )}

          {syncing && cart.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <FiLoader className="animate-spin mx-auto text-orange-500 mb-4" size={28} />
              <p className="text-sm">Loading your cart...</p>
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
                <div className="w-16 h-16 bg-gray-400 rounded-xl overflow-hidden relative">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                      {item.name.charAt(0)}
                    </div>
                  )}
                </div>

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
                  onClick={() => handleRemove(item.id)}
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

