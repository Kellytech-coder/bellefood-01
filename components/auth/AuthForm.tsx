"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, Utensils } from "lucide-react";

export default function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (isSignup && password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`/api/backend/auth/${mode}`, {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not connect to the account service.");
      window.dispatchEvent(new Event("bellefood-auth-changed"));
      router.push("/");
      router.refresh();
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
        <div className="max-w-lg pb-8"><span className="text-xs font-bold uppercase tracking-[.22em] text-orange-300">Good food, good moments</span><h1 className="mt-5 text-5xl font-semibold leading-[1.08] tracking-tight xl:text-6xl">A seat at the table is waiting.</h1><p className="mt-5 max-w-md text-base leading-7 text-white/75">Create an account to make your next BelleFood order a little easier.</p></div>
      </div>
    </div>

    <div className="flex items-center justify-center px-5 py-12 sm:px-10 lg:px-14">
      <div className="w-full max-w-[440px]">
        <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-[#59665e] lg:hidden"><Utensils size={18} className="text-orange-500"/> BelleFood</Link>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-orange-600">Your BelleFood account</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1b2921]">{isSignup ? "Create your account" : "Welcome back"}</h2>
        <p className="mt-2 text-sm leading-6 text-[#7b877f]">{isSignup ? "Sign up to get started with your next order." : "Sign in to continue to your next delicious meal."}</p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          {isSignup && <label className="block text-sm font-semibold text-[#344239]">Full name<input required maxLength={120} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" className="mt-2 w-full rounded-xl border border-[#e1e7e1] bg-white px-4 py-3.5 font-normal outline-none transition placeholder:text-[#a2aba4] focus:border-orange-400 focus:ring-4 focus:ring-orange-100"/></label>}
          <label className="block text-sm font-semibold text-[#344239]">Email address<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-[#e1e7e1] bg-white px-4 py-3.5 font-normal outline-none transition placeholder:text-[#a2aba4] focus:border-orange-400 focus:ring-4 focus:ring-orange-100"/></label>
          <label className="block text-sm font-semibold text-[#344239]">Password<span className="relative mt-2 block"><input required minLength={8} maxLength={128} type={showPassword ? "text" : "password"} autoComplete={isSignup ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={isSignup ? "At least 8 characters" : "Enter your password"} className="w-full rounded-xl border border-[#e1e7e1] bg-white px-4 py-3.5 pr-12 font-normal outline-none transition placeholder:text-[#a2aba4] focus:border-orange-400 focus:ring-4 focus:ring-orange-100"/><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#87928a] hover:text-[#344239]">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span></label>
          {!isSignup && <div className="-mt-1 text-right"><Link href="/forgot-password" className="text-sm font-semibold text-orange-600 hover:text-orange-700">Forgot password?</Link></div>}
          {isSignup && <label className="block text-sm font-semibold text-[#344239]">Confirm password<input required minLength={8} maxLength={128} type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter your password again" className="mt-2 w-full rounded-xl border border-[#e1e7e1] bg-white px-4 py-3.5 font-normal outline-none transition placeholder:text-[#a2aba4] focus:border-orange-400 focus:ring-4 focus:ring-orange-100"/></label>}
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p>}
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60">{busy ? "Please wait…" : isSignup ? "Create account" : "Sign in"}{!busy && <ArrowRight size={17}/>}</button>
        </form>

        <p className="mt-7 text-center text-sm text-[#748078]">{isSignup ? "Already have an account?" : "New to BelleFood?"} <Link href={isSignup ? "/signin" : "/signup"} className="font-semibold text-orange-600 hover:text-orange-700">{isSignup ? "Sign in" : "Create an account"}</Link></p>
        <Link href="/" className="mt-8 block text-center text-xs font-medium text-[#9aa39c] hover:text-[#56635a]">Continue browsing the menu</Link>
      </div>
    </div>
  </section>;
}
