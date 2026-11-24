"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, MessageCircle, Send } from "lucide-react";
import { FormEvent, useState } from "react";

export default function ComplaintsPage() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/backend/complaints", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "We could not send your message.");
      setMessage(data.id); setSent(true); formElement.reset();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "We could not send your message."); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#f7f8f6] px-5 pb-20 pt-32 text-[#18231f] sm:pt-36">
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#758079] transition hover:text-orange-600"><ArrowLeft size={16}/> Back to BelleFood</Link>
      <div className="mt-7 rounded-[28px] border border-black/[.05] bg-white p-6 shadow-[0_25px_75px_-50px_rgba(20,40,30,.3)] sm:p-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600"><MessageCircle size={22}/></div>
        {sent ? <div className="py-8 text-center"><CheckCircle2 className="mx-auto text-emerald-500" size={46}/><h1 className="mt-5 text-3xl font-semibold tracking-tight">We’ve received your message</h1><p className="mt-3 text-sm leading-6 text-[#7c8780]">Our team will review it and follow up using the email you provided.</p><p className="mt-4 text-xs text-[#9aa39d]">Reference: {message}</p><Link href="/menu" className="mt-7 inline-flex rounded-xl bg-[#1b2b23] px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600">Back to menu</Link></div> : <><p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-orange-600">We’re here to help</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Tell us what happened</h1><p className="mt-3 text-sm leading-6 text-[#7c8780]">Share a concern about your order or experience. Our support team will get back to you.</p>
          <form onSubmit={submit} className="mt-8 space-y-5"><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Your name<input required name="customerName" maxLength={120} className="mt-2 w-full rounded-xl border border-[#e5e9e5] bg-[#fcfcfb] px-4 py-3 font-normal outline-none focus:border-orange-300" placeholder="Full name"/></label><label className="text-sm font-semibold">Email address<input type="email" name="customerEmail" className="mt-2 w-full rounded-xl border border-[#e5e9e5] bg-[#fcfcfb] px-4 py-3 font-normal outline-none focus:border-orange-300" placeholder="you@example.com"/></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Topic<select name="category" className="mt-2 w-full rounded-xl border border-[#e5e9e5] bg-[#fcfcfb] px-4 py-3 font-normal outline-none focus:border-orange-300"><option>Order issue</option><option>Delivery</option><option>Food quality</option><option>Payment</option><option>General</option></select></label><label className="text-sm font-semibold">Order ID <span className="font-normal text-[#9aa39d]">(optional)</span><input name="orderId" maxLength={120} className="mt-2 w-full rounded-xl border border-[#e5e9e5] bg-[#fcfcfb] px-4 py-3 font-normal outline-none focus:border-orange-300" placeholder="Your order reference"/></label></div><label className="block text-sm font-semibold">How can we help?<textarea required name="message" minLength={10} maxLength={3000} rows={5} className="mt-2 w-full resize-y rounded-xl border border-[#e5e9e5] bg-[#fcfcfb] px-4 py-3 font-normal leading-6 outline-none focus:border-orange-300" placeholder="Please tell us a little more…"/></label>{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50">{busy ? "Sending…" : "Send to support"}<Send size={15}/></button></form></>}
      </div>
    </motion.div>
  </main>;
}
