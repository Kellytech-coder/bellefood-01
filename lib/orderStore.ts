import { create } from "zustand";

export type PlacedOrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
};

export type PlacedOrder = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  deliveryLandmark?: string;
  paymentMethod: "card" | "bank";
  items: PlacedOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  estimatedDelivery: string;
  orderTime: string;
};

type OrderState = {
  order: PlacedOrder | null;
  setOrder: (order: PlacedOrder) => void;
  clearOrder: () => void;
};

export const useOrderStore = create<OrderState>((set) => ({
  order: null,
  setOrder: (order) => set({ order }),
  clearOrder: () => set({ order: null }),
}));

