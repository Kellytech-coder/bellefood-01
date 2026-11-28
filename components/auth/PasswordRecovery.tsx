"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Utensils } from "lucide-react";

const inputClass = "mt-2 w-full rounded-xl border border-[#e1e7e1] bg-white px-4 py-3.5 font-normal outline-none transition placeholder:text-[#a2aba4] focus:border-orange-400 focus:ring-4 focus:ring-orange-100";

export default function PasswordRecovery() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/backend/auth/forgot-password", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not connect to the account service.");
      setSuccess(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="grid min-h-[calc(100vh-150px)] bg-[#f7f8f5] pt-24 lg:grid-cols-2 lg:pt-0">
    <div className="relative hidden overflow-hidden bg-[#17251e] lg:block">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,20,14,.08),rgba(8,20,14,.85)),url('/images/hero1.png')] bg-cover bg-center" />
      <div className="relative flex h-full min-h-[680px] flex-col justify-between p-12 text-white xl:p-16">
        <Link href="/" className="flex w-fit items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500"><Utensils size={20}/></span><span className="text-lg font-bold tracking-tight">BelleFood</span></Link>
        <div className="max-w-lg pb-8"><span className="text-xs font-bold uppercase tracking-[.22em] text-orange-300">Your BelleFood account</span><h1 className="mt-5 text-5xl font-semibold leading-[1.08] tracking-tight xl:text-6xl">Back to the good stuff.</h1><p className="mt-5 max-w-md text-base leading-7 text-white/75">A quick password reset gets you back to your next delicious meal.</p></div>
      </div>
    </div>
    <div className="flex items-center justify-center px-5 py-12 sm:px-10 lg:px-14">
      <div className="w-full max-w-[440px]">
        <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-[#59665e] lg:hidden"><Utensils size={18} className="text-orange-500"/> BelleFood</Link>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-orange-600">Your BelleFood account</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1b2921]">Reset your password</h2>
        <p className="mt-2 text-sm leading-6 text-[#7b877f]">Enter your account email. Firebase will send a password reset link if an account exists.</p>
        {success ? <div role="status" className="mt-8 rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-800">If an account exists for that email, Firebase has sent a reset link. Check your inbox and follow the link to choose a new password.<Link href="/signin" className="mt-3 block font-semibold text-orange-700 hover:text-orange-800">Go to sign in</Link></div> : <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block text-sm font-semibold text-[#344239]">Email address<input required type="email" maxLength={254} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className={inputClass}/></label>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p>}
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60">{busy ? "Please wait…" : "Send reset link"}{!busy && <ArrowRight size={17}/>}</button>
        </form>}
        {!success && <p className="mt-7 text-center text-sm text-[#748078]">Remember your password? <Link href="/signin" className="font-semibold text-orange-600 hover:text-orange-700">Sign in</Link></p>}
        <Link href="/" className="mt-8 block text-center text-xs font-medium text-[#9aa39c] hover:text-[#56635a]">Continue browsing the menu</Link>
      </div>
    </div>
  </section>;
}
