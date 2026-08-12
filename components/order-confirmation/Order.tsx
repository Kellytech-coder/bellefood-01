"use client";

import {
  CheckCircle2,
  Clock3,
  MapPin,
  Phone,
  ArrowRight,
  Mail,
} from "lucide-react";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { useOrderStore } from "@/lib/orderStore";

const fallbackItems = [
  {
    name: "Party Jollof Rice",
    qty: 2,
    price: "₦7,000",
  },
  {
    name: "Grilled Chicken",
    qty: 2,
    price: "₦5,000",
  },
  {
    name: "Chapman",
    qty: 1,
    price: "₦1,500",
  },
];

export default function OrderSuccess() {
  const router = useRouter();
  const order = useOrderStore((s) => s.order);

  const items =
    order && order.items.length > 0
      ? order.items.map((item) => ({
          name: item.productName,
          qty: item.quantity,
          price: `₦${(item.price * item.quantity).toLocaleString()}`,
        }))
      : fallbackItems;

  const orderId = order?.id || "BFT9YHCC80";
  const total = order ? order.total : 13500;
  const deliveryTime = order?.estimatedDelivery || "25-30 mins";
  const deliveryAddress = order?.deliveryAddress || "24 Admiralty Way, Lekki Phase 1, Lagos";
  const customerPhone = order?.customerPhone || "+234 800 123 4567";
  const customerEmail = order?.customerEmail || "customer@example.com";

  return (
    <main className="min-h-screen bg-[#050B08] flex justify-center py-14 px-5 overflow-hidden">

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: .8
        }}
        className="w-full max-w-2xl"
      >
        {/* Success Icon */}

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 180
          }}
          className="flex justify-center"
        >
          <div className="w-24 h-24 rounded-full bg-orange-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(255,115,0,.35)]">

            <CheckCircle2
              size={54}
              className="text-orange-500"
            />

          </div>
        </motion.div>

        <motion.h1
          className="text-center text-5xl font-bold mt-8 text-white"
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{delay:.3}}
        >
          Order Confirmed!
        </motion.h1>

        <p className="text-center text-gray-400 mt-4">
          Your delicious meal is now being prepared with love.
        </p>

        {/* Order ID */}

        <motion.div
          whileHover={{scale:1.02}}
          className="bg-[#1D1D1F] rounded-3xl mt-12 p-8 border border-white/5 backdrop-blur-lg"
        >

          <p className="text-center text-gray-400">
            Order ID
          </p>

          <h2 className="text-center text-4xl font-bold text-orange-500 mt-3 tracking-wider">
            {orderId}
          </h2>

        </motion.div>

        {/* Delivery */}

        <motion.div
          whileHover={{scale:1.02}}
          className="mt-8 rounded-3xl bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 p-8 shadow-2xl"
        >
          <div className="flex items-center gap-3">

            <motion.div
              animate={{
                scale:[1,1.2,1]
              }}
              transition={{
                repeat:Infinity,
                duration:2
              }}
            >
              <Clock3 className="text-white"/>
            </motion.div>

            <span className="text-white font-medium">
              Estimated Delivery
            </span>

          </div>

          <h2 className="text-5xl font-bold text-white mt-4">
            {deliveryTime}
          </h2>

          {order?.orderTime && (
            <p className="text-white/90 mt-2">
              Ordered at {order.orderTime}
            </p>
          )}

        </motion.div>

        {/* Order Summary */}

        <motion.div
          whileHover={{y:-4}}
          className="mt-8 rounded-3xl bg-[#1D1D1F] p-8 border border-white/5"
        >
          <h2 className="text-3xl font-semibold text-white mb-8">
            Order Summary
          </h2>

          {items.map((item) => (

            <motion.div
              key={item.name}
              whileHover={{x:8}}
              className="flex justify-between py-5 border-b border-white/10"
            >
              <div>

                <h3 className="text-white font-semibold">
                  {item.name}
                </h3>

                <p className="text-gray-400">
                  Qty: {item.qty}
                </p>

              </div>

              <span className="text-orange-500 font-bold">
                {item.price}
              </span>

            </motion.div>

          ))}

          <div className="flex justify-between mt-8">

            <span className="text-2xl text-white font-semibold">
              Total
            </span>

            <span className="text-4xl font-bold text-orange-500">
              ₦{total.toLocaleString()}
            </span>

          </div>

        </motion.div>

        {/* Delivery Information */}

        <motion.div
          whileHover={{y:-4}}
          className="mt-8 rounded-3xl bg-[#1D1D1F] p-8 border border-white/5"
        >
          <h2 className="text-3xl font-semibold text-white mb-8">
            Delivery Information
          </h2>

          <div className="space-y-7">

            <div className="flex gap-4">

              <MapPin className="text-orange-500"/>

              <div>

                <p className="text-gray-400">
                  Delivery Address
                </p>

                <h3 className="text-white font-medium">
                  {deliveryAddress}
                </h3>

              </div>

            </div>

            <div className="flex gap-4">

              <Phone className="text-orange-500"/>

              <div>

                <p className="text-gray-400">
                  Customer Number
                </p>

                <h3 className="text-white">
                  {customerPhone}
                </h3>

              </div>

            </div>

            {customerEmail && customerEmail !== "customer@example.com" && (
              <div className="flex gap-4">

                <Mail className="text-orange-500"/>

                <div>

                  <p className="text-gray-400">
                    Customer Email
                  </p>

                  <h3 className="text-white">
                    {customerEmail}
                  </h3>

                </div>

              </div>
            )}

          </div>

        </motion.div>

        {/* Buttons */}

        <div className="grid md:grid-cols-2 gap-5 mt-10">

          <motion.button
            whileHover={{
              scale:1.05
            }}
            whileTap={{
              scale:.95
            }}
            onClick={() => router.push("/")}
            className="h-14 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold flex justify-center items-center gap-2 shadow-xl"
          >
            Track Order
            <ArrowRight size={18}/>
          </motion.button>

          <motion.button
            whileHover={{
              scale:1.05
            }}
            whileTap={{
              scale:.95
            }}
            onClick={() => router.push("/menu")}
            className="h-14 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 transition"
          >
            Order Again
          </motion.button>

        </div>

        <motion.p
          initial={{opacity:0}}
          animate={{opacity:1}}
          transition={{delay:1}}
          className="text-center text-gray-400 mt-10"
        >
          Need Help?{" "}
          <span className="text-orange-500 font-semibold cursor-pointer hover:underline">
            Contact Support
          </span>
        </motion.p>

      </motion.div>

    </main>
  );
}

