import type { Metadata } from "next";
import OrderTracking from "@/components/tracking/OrderTracking";

export const metadata: Metadata = { title: "Track your order" };

export default function TrackOrderPage() {
  return <OrderTracking />;
}
