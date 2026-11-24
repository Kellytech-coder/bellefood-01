"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Bike, Check, CircleCheck, Clock3, PackageCheck, RefreshCw, Utensils } from "lucide-react";
import type { TrackedOrder } from "@/lib/api";

const progressSteps = [
  { id: "received", title: "Order received", detail: "We’ve received your order.", icon: CircleCheck },
  { id: "preparing", title: "Preparing", detail: "Our kitchen is preparing your meal.", icon: Utensils },
  { id: "on-the-way", title: "On the way", detail: "Your order is with the delivery rider.", icon: Bike },
  { id: "delivered", title: "Delivered", detail: "Enjoy your meal!", icon: PackageCheck },
];

const statusIndex: Record<string, number> = { received: 0, preparing: 1, "on-the-way": 2, delivered: 3 };

export default function OrderTracking() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("order");
    if (id) setOrderId(id);
  }, []);

  const loadOrder = useCallback(async (id: string, customerPhone: string, background = false) => {
    if (background) setRefreshing(true);
    else setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/backend/orders/track", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id.trim(), phone: customerPhone.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "We couldn’t load this order. Check the details and try again.");
      setOrder(data as TrackedOrder);
      setVerifiedPhone(customerPhone.trim());
      setOrderId(id.trim());
    } catch (reason) {
      if (!background) setOrder(null);
      setError(reason instanceof Error ? reason.message : "We couldn’t load this order. Try again.");
    } finally {
      setBusy(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!order || !verifiedPhone || ["delivered", "cancelled"].includes(order.status)) return;
    const refresh = () => void loadOrder(order.id, verifiedPhone, true);
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [loadOrder, order, verifiedPhone]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadOrder(orderId, phone);
  }

  const currentStep = order ? statusIndex[order.status] ?? -1 : -1;
  const isCancelled = order?.status === "cancelled";

  return <main className="min-h-screen bg-[#f5f7f3] px-5 pb-20 pt-28 sm:px-8 lg:pt-32">
    <div className="mx-auto max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }} className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[.14em] text-orange-600"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"/> Live order updates</span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#1b2921] sm:text-5xl">Your meal is on its way.</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#7b877f] sm:text-base">Enter your order number and the phone number used at checkout to see its latest status and delivery estimate.</p>
      </motion.div>

      <motion.form initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12, duration: .45 }} onSubmit={submit} className="mx-auto mt-9 grid max-w-4xl gap-4 rounded-[26px] border border-black/[.05] bg-white p-5 shadow-[0_22px_70px_-42px_rgba(20,40,30,.3)] sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-6">
        <label className="block text-left text-xs font-bold uppercase tracking-wider text-[#728077]">Order number<input required value={orderId} onChange={(event) => setOrderId(event.target.value)} placeholder="Paste your order number" className="mt-2.5 w-full rounded-xl border border-[#e2e8e2] bg-[#fbfcfa] px-4 py-3.5 text-sm font-medium normal-case tracking-normal text-[#26342b] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"/></label>
        <label className="block text-left text-xs font-bold uppercase tracking-wider text-[#728077]">Checkout phone number<input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="e.g. 08012345678" className="mt-2.5 w-full rounded-xl border border-[#e2e8e2] bg-[#fbfcfa] px-4 py-3.5 text-sm font-medium normal-case tracking-normal text-[#26342b] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"/></label>
        <button disabled={busy} className="inline-flex h-[50px] items-center justify-center gap-2 rounded-xl bg-[#1c2c23] px-6 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60">{busy ? "Finding order…" : "Track order"}{!busy && <ArrowRight size={16}/>}</button>
      </motion.form>

      {error && <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} role="alert" className="mx-auto mt-4 flex max-w-4xl items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle size={17}/>{error}</motion.p>}

      {order && <motion.section key={order.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }} className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-[28px] border border-black/[.05] bg-white shadow-[0_22px_70px_-42px_rgba(20,40,30,.25)]">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#1b2b23] px-6 py-6 text-white sm:px-8">
          <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-white/55">Order reference</p><p className="mt-1 text-lg font-bold tracking-wide">#{order.id.toUpperCase()}</p></div>
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-xs font-semibold"><span className={`h-2 w-2 rounded-full ${isCancelled ? "bg-red-400" : "animate-pulse bg-emerald-400"}`}/>{isCancelled ? "Cancelled" : order.status.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}</div>
        </div>

        {isCancelled ? <div className="px-6 py-10 text-center sm:px-8"><p className="text-lg font-semibold text-[#26342b]">This order was cancelled.</p><p className="mt-2 text-sm text-[#7b877f]">Please contact our support team if you need help.</p></div> : <>
          <div className="grid gap-4 border-b border-[#eef1ed] p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:px-8 sm:py-6">
            <div className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600"><Clock3 size={23}/></span><div><p className="text-xs font-semibold uppercase tracking-wider text-[#8b968e]">Estimated delivery</p><p className="mt-1 text-xl font-bold text-[#202f26]">{order.estimatedDelivery || "We’re confirming your delivery time"}</p></div></div>
            <button type="button" onClick={() => void loadOrder(order.id, verifiedPhone, true)} disabled={refreshing} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e5eae4] px-4 py-2.5 text-xs font-semibold text-[#5d6a61] transition hover:border-orange-200 hover:text-orange-600 disabled:opacity-50"><RefreshCw size={14} className={refreshing ? "animate-spin" : ""}/>Refresh status</button>
          </div>
          <div className="px-6 py-7 sm:px-8 sm:py-9">
            <div className="grid gap-6 sm:grid-cols-4">{progressSteps.map((step, index) => { const Icon = step.icon; const complete = index < currentStep; const active = index === currentStep; return <div key={step.id} className="relative flex gap-3 sm:block sm:text-center"><div className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors ${complete || active ? "bg-orange-500 text-white shadow-lg shadow-orange-200" : "bg-[#f1f4f0] text-[#a0aaa2]"}`}>{complete ? <Check size={19}/> : <Icon size={19}/>}</div><div className="sm:mt-3"><p className={`text-sm font-semibold ${active || complete ? "text-[#26342b]" : "text-[#9aa49c]"}`}>{step.title}</p><p className="mt-1 text-xs leading-5 text-[#89948c]">{step.detail}</p></div>{index < progressSteps.length - 1 && <div className={`absolute left-[21px] top-11 h-[calc(100%+8px)] w-0.5 sm:left-[calc(50%+28px)] sm:top-[21px] sm:h-0.5 sm:w-[calc(100%-56px)] ${complete ? "bg-orange-400" : "bg-[#e7ebe6]"}`}/>}</div>; })}</div>
          </div>
          <div className="grid gap-5 border-t border-[#eef1ed] bg-[#fbfcfa] px-6 py-5 sm:grid-cols-[1fr_auto] sm:px-8">
            <div><p className="text-xs font-bold uppercase tracking-wider text-[#87928a]">In this order</p><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">{order.items.map((item, index) => <span key={`${item.name}-${index}`} className="text-sm text-[#526057]">{item.quantity} × {item.name}</span>)}</div></div>
            <p className="self-end text-xs text-[#9aa39d]">{refreshing ? "Updating…" : "Status refreshes automatically every 30 seconds"}</p>
          </div>
        </>}
      </motion.section>}
    </div>
  </main>;
}
