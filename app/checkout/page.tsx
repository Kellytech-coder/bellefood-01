"use client";

import { motion } from "framer-motion";
import CheckoutHero from "@/components/checkout/CheckoutHero";
import CustomerInfo from "@/components/checkout/CustomerInfo";
import DeliveryAddress from "@/components/checkout/DeliveryAddress";
import PaymentMethod from "@/components/checkout/PaymentMethod";
import OrderSummary from "@/components/checkout/OrderSummary";
import ExpressCheckout from "@/components/checkout/ExpressCheckout";

export default function CheckoutInfo() {
  return (
    <section className="bg-[#020D0B] min-h-screen py-12 px-4 md:px-10">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">

        {/* LEFT SIDE */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.2 }
            }
          }}
          className="lg:col-span-2 space-y-6"
        >
          <CheckoutHero />
          <ExpressCheckout />
          <CustomerInfo />
          <DeliveryAddress /> 
          <PaymentMethod />
        </motion.div>

        {/* RIGHT SIDE */}
         <OrderSummary />
      </div>
    </section>
  );
}