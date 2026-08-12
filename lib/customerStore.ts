import { create } from "zustand";

type CustomerState = {
  fullName: string;
  phone: string;
  email: string;
  paymentMethod: "card" | "bank";
  setFullName: (v: string) => void;
  setPhone: (v: string) => void;
  setEmail: (v: string) => void;
  setPaymentMethod: (v: "card" | "bank") => void;
  reset: () => void;
};

const initialState = {
  fullName: "",
  phone: "",
  email: "",
  paymentMethod: "card" as const,
};

export const useCustomerStore = create<CustomerState>((set) => ({
  ...initialState,
  setFullName: (fullName) => set({ fullName }),
  setPhone: (phone) => set({ phone }),
  setEmail: (email) => set({ email }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  reset: () => set(initialState),
}));

