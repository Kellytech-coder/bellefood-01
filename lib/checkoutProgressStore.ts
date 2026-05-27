"use client";

import { useEffect, useMemo, useState } from "react";

type ProgressState = {
  selectedDeliveryOption: "home" | "office" | null;
  deliveryAddress: string;
  landmark: string;
};

const DEFAULT_STATE: ProgressState = {
  selectedDeliveryOption: null,
  deliveryAddress: "",
  landmark: "",
};

let listeners: Array<(s: ProgressState) => void> = [];
let state: ProgressState = DEFAULT_STATE;

function emit() {
  for (const l of listeners) l(state);
}

export function setCheckoutProgress(partial: Partial<ProgressState>) {
  state = { ...state, ...partial };
  emit();
}

export function resetCheckoutProgress() {
  state = DEFAULT_STATE;
  emit();
}

export function useCheckoutProgress() {
  const [local, setLocal] = useState<ProgressState>(state);

  useEffect(() => {
    const handler = (s: ProgressState) => setLocal(s);
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((x) => x !== handler);
    };
  }, []);

  return local;
}

export function __resetCheckoutProgressForTests() {
  resetCheckoutProgress();
}


export function computeCheckoutProgressPercent(s: ProgressState) {
  // Steps shown in header: Home -> Menu -> Cart -> Checkout
  // We map "interactive" progress within Checkout to fields we have right now.
  // Base: selecting delivery option counts as starting Checkout.

  // Checkout section items:
  // 1) Quick select (home/office)
  // 2) Delivery address textarea
  // 3) Landmark (optional)
  const itemsTotal = 3;

  let itemsDone = 0;
  if (s.selectedDeliveryOption) itemsDone += 1;
  if (s.deliveryAddress.trim().length > 0) itemsDone += 1;
  if (s.landmark.trim().length > 0) itemsDone += 1;

  // If nothing is provided, progress should be 0.
  if (!s.selectedDeliveryOption &&
      s.deliveryAddress.trim().length === 0 &&
      s.landmark.trim().length === 0) {
    return 0;
  }

  const checkoutPercent = (itemsDone / itemsTotal) * 100;

  // For an interactive checkout form, the progress bar should start at 0
  // and reach 100 as the delivery inputs are completed.
  return Math.max(0, Math.min(100, checkoutPercent));
}


export function useCheckoutProgressActions() {
  return useMemo(
    () => ({
      setSelectedDeliveryOption: (v: ProgressState["selectedDeliveryOption"]) =>
        setCheckoutProgress({ selectedDeliveryOption: v }),
      setDeliveryAddress: (v: string) => setCheckoutProgress({ deliveryAddress: v }),
      setLandmark: (v: string) => setCheckoutProgress({ landmark: v }),
      reset: () => resetCheckoutProgress(),
    }),
    []
  );
}

