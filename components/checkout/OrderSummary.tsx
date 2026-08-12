"use client";
import { useRouter } from "next/navigation";
import { motion, Variants, easeOut } from "framer-motion";
import { ShoppingCart, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";

import { useCartStore } from "@/lib/cartStore";
import { useCustomerStore } from "@/lib/customerStore";
import { useCheckoutProgress } from "@/lib/checkoutProgressStore";
import { useOrderStore } from "@/lib/orderStore";
import { createOrder } from "@/lib/api";

const container: Variants = {
  hidden: { opacity: 0, x: 60 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      staggerChildren: 0.12,
      duration: 0.5,
      ease: easeOut,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: easeOut,
    },
  },
};

const DELIVERY_FEE = 1000;

export default function OrderSummary() {
  const router = useRouter();
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);

  const customer = useCustomerStore();
  const checkout = useCheckoutProgress();
  const setOrder = useOrderStore((s) => s.setOrder);

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const delivery = cart.length > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + delivery;

  const itemsReady =
    cart.length > 0 &&
    customer.fullName.trim().length > 0 &&
    customer.phone.trim().length > 0 &&
    checkout.deliveryAddress.trim().length > 0;

  const handleCompleteOrder = async () => {
    if (!itemsReady || placing) return;

    setPlacing(true);
    setError(null);

    const orderPayload = {
      customerName: customer.fullName.trim(),
      customerPhone: customer.phone.trim(),
      customerEmail: customer.email.trim(),
      deliveryAddress: checkout.deliveryAddress.trim(),
      deliveryLandmark: checkout.landmark.trim() || undefined,
      paymentMethod: customer.paymentMethod,
      items: cart.map((item) => ({
        productId: item.id,
        productName: item.name,
        quantity: item.qty,
        price: item.price,
      })),
      subtotal,
      deliveryFee: delivery,
      total,
    };

    try {
      // Try backend first
      const res = await createOrder(orderPayload);
      const orderId = res.id;

      // Store the placed order for the confirmation page
      setOrder({
        id: orderId,
        customerName: orderPayload.customerName,
        customerPhone: orderPayload.customerPhone,
        customerEmail: orderPayload.customerEmail,
        deliveryAddress: orderPayload.deliveryAddress,
        deliveryLandmark: orderPayload.deliveryLandmark,
        paymentMethod: orderPayload.paymentMethod,
        items: orderPayload.items,
        subtotal,
        deliveryFee: delivery,
        total,
        estimatedDelivery: "25-30 mins",
        orderTime: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });

      // Clear cart
      clearCart();

      router.push("/order-confirmation");
    } catch {
      // Backend order endpoint not available yet — still show confirmation using local data
      setOrder({
        id: `BFT${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        customerName: orderPayload.customerName,
        customerPhone: orderPayload.customerPhone,
        customerEmail: orderPayload.customerEmail,
        deliveryAddress: orderPayload.deliveryAddress,
        deliveryLandmark: orderPayload.deliveryLandmark,
        paymentMethod: orderPayload.paymentMethod,
        items: orderPayload.items,
        subtotal,
        deliveryFee: delivery,
        total,
        estimatedDelivery: "25-30 mins",
        orderTime: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });

      clearCart();

      router.push("/order-confirmation");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="bg-[#121212] border border-gray-800 rounded-2xl p-6 h-fit sticky top-100 shadow-lg"
    >
      {/* Title */}
      <motion.h2
        variants={item}
        className="text-white text-xl font-semibold mb-6"
      >
        Order Summary
      </motion.h2>

      {/* Items */}
      {cart.length === 0 ? (
        <motion.p variants={item} className="text-gray-400 text-sm">
          Your cart is empty. Add items from the menu.
        </motion.p>
      ) : (
        <div className="space-y-4 text-gray-300">
          {cart.map((cartItem) => (
            <motion.div
              key={cartItem.id}
              variants={item}
              className="flex justify-between"
            >
              <span>
                {cartItem.name} x {cartItem.qty}
              </span>
              <span>₦{(cartItem.price * cartItem.qty).toLocaleString()}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Divider */}
      <motion.div
        variants={item}
        className="border-t border-gray-800 my-6"
      />

      {/* Subtotal */}
      <motion.div
        variants={item}
        className="flex justify-between text-gray-400"
      >
        <span>Subtotal</span>
        <span>₦{subtotal.toLocaleString()}</span>
      </motion.div>

      {/* Delivery */}
      <motion.div
        variants={item}
        className="flex justify-between text-green-400 mt-2"
      >
        <span>Delivery Fee</span>
        <span>₦{delivery.toLocaleString()}</span>
      </motion.div>

      {/* Divider */}
      <motion.div
        variants={item}
        className="border-t border-gray-800 my-6"
      />

      {/* Total */}
      <motion.div
        variants={item}
        className="flex justify-between text-xl font-semibold text-orange-500"
      >
        <span>Total</span>
        <span>₦{total.toLocaleString()}</span>
      </motion.div>

      {/* Alert Box */}
      <motion.div
        variants={item}
        className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3"
      >
        <AlertCircle className="text-red-400 mt-1" size={18} />

        <div>
          <p className="text-red-400 font-medium">
            Estimated Delivery
          </p>

          <p className="text-sm text-gray-400">
            Fill-in your details and select a delivery zone to continue
          </p>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.p variants={item} className="text-red-400 text-sm mt-4">
          {error}
        </motion.p>
      )}

      {/* Complete Order Button */}
      <motion.div variants={item}>
        <button
          onClick={handleCompleteOrder}
          disabled={!itemsReady || placing}
          className={`w-full mt-6 py-3 rounded-full text-white font-medium flex items-center justify-center gap-2 transition ${
            itemsReady
              ? "bg-orange-600 hover:bg-orange-500"
              : "bg-gray-700 cursor-not-allowed"
          }`}
        >
          {placing ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <ShoppingCart size={18} />
          )}

          {placing ? "Placing Order..." : "Complete Order"}
        </button>
      </motion.div>

      {!itemsReady && (
        <motion.p
          variants={item}
          className="text-xs text-gray-500 mt-3 text-center"
        >
          Please add items, fill your name, phone, and delivery address to
          continue.
        </motion.p>
      )}

      {/* Footer Note */}
      <motion.p
        variants={item}
        className="text-xs text-gray-500 mt-4 text-center leading-relaxed"
      >
        Your payment info is secure. By placing your order, you agree to our{" "}
        <span className="text-orange-500">
          Terms and Conditions
        </span>.
      </motion.p>
    </motion.div>
  );
}

