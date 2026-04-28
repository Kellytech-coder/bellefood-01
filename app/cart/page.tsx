"use client";

import CartHero from "@/components/cart/CartHero";
import CartItems from "@/components/cart/CartItems"; // ✅ must match default export

export default function Home() {
  return (
    <>
      <CartHero />
      <CartItems />
    </>
  );
}