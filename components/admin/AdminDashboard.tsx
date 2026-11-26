"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  Activity, ArrowUpRight, Bell, Check, ChevronDown,
  CircleDollarSign, Clock3, LayoutDashboard, LogOut, Menu, Package,
  ImagePlus, MessageCircle, Search, ShoppingBag, Users, Utensils, X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { Product } from "@/lib/api";

type Order = {
  id: string; trackingId?: string; customerName: string; customerPhone?: string; deliveryAddress?: string; deliveryLandmark?: string; items: Array<{ productId?: string; productName: string; imageUrl?: string; quantity: number }>;
  total: number; status: string; paymentStatus?: string; estimatedDelivery?: string; createdAt?: string;
};
type Complaint = { id: string; customerName: string; customerEmail?: string; orderId?: string; category: string; message: string; reply?: string; status: string; createdAt?: string };
type CustomerAccount = { id: string; name: string; email: string; createdAt?: string | null; active: boolean; cashOnDeliveryAllowed: boolean };
type Section = "Overview" | "Orders" | "Menu" | "Complaints" | "Users";
const backend = "/api/backend";
const money = (amount: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount || 0);
const statuses = ["received", "preparing", "on-the-way", "delivered", "cancelled"];

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${backend}${path}`, { ...init, credentials: "same-origin", cache: "no-store", headers: { "Content-Type": "application/json", ...init?.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data as T;
}

async function uploadProductImage(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPEG, PNG, or WebP image.");
  }
  if (file.size > 5 * 1024 * 1024) throw new Error("Images must be 5 MB or smaller.");

  const response = await fetch(`${backend}/admin/product-images`, {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
    headers: { "Content-Type": file.type },
    body: file,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Image upload failed (${response.status}).`);
  return data.imageUrl as string;
}

const navItems: Array<{ name: Section; icon: typeof LayoutDashboard }> = [
  { name: "Overview", icon: LayoutDashboard }, { name: "Orders", icon: ShoppingBag }, { name: "Menu", icon: Utensils }, { name: "Complaints", icon: MessageCircle }, { name: "Users", icon: Users },
];

export default function AdminDashboard() {
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [section, setSection] = useState<Section>("Overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [customers, setCustomers] = useState<CustomerAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [saving, setSaving] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);

  const loadData = useCallback(async (showError = true) => {
    setLoading(true); setError("");
    try {
      const [nextOrders, nextProducts, nextComplaints, nextCustomers] = await Promise.all([
        api<Order[]>("/admin/orders"), fetch(`${backend}/products`, { cache: "no-store" }).then(async (r) => { if (!r.ok) throw new Error("Could not load menu products."); return r.json() as Promise<Product[]>; }), api<Complaint[]>("/admin/complaints"), api<CustomerAccount[]>("/admin/customers"),
      ]);
      setOrders(nextOrders); setProducts(nextProducts); setComplaints(nextComplaints); setCustomers(nextCustomers); setAuthenticated(true);
    } catch (e) { if (showError) setError(e instanceof Error ? e.message : "Could not connect to the admin API."); setAuthenticated(false); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    void loadData(false);
  }, [loadData]);

  useEffect(() => {
    if (!authenticated) return;
    const timer = window.setInterval(() => void loadData(), 30_000);
    return () => window.clearInterval(timer);
  }, [authenticated, loadData]);

  const todayOrders = useMemo(() => {
    const today = new Date().toDateString();
    return orders.filter((order) => order.createdAt && new Date(order.createdAt).toDateString() === today);
  }, [orders]);
  const revenue = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const activeOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.status));
  const filteredOrders = orders.filter((order) => `${order.id} ${order.trackingId || ""} ${order.customerName}`.toLowerCase().includes(query.toLowerCase()));
  const filteredProducts = products.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase()));
  const filteredComplaints = complaints.filter((item) => `${item.customerName} ${item.orderId} ${item.category} ${item.message}`.toLowerCase().includes(query.toLowerCase()));
  const filteredCustomers = customers.filter((item) => `${item.name} ${item.email}`.toLowerCase().includes(query.toLowerCase()));
  const hourlyActivity = Array.from({ length: 12 }, (_, index) => todayOrders.filter((order) => new Date(order.createdAt!).getHours() === index + 9).length);
  const activityPeak = Math.max(1, ...hourlyActivity);

  async function updateOrder(order: Order, updates: Partial<Pick<Order, "status" | "paymentStatus" | "estimatedDelivery">>) {
    setSaving(order.id); setError("");
    try { const updated = await api<Order>(`/admin/orders/${encodeURIComponent(order.id)}`, { method: "PATCH", body: JSON.stringify(updates) }); setOrders((current) => current.map((item) => item.id === order.id ? updated : item)); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not update order."); }
    finally { setSaving(""); }
  }

  async function toggleProduct(product: Product) {
    setSaving(product.id); setError("");
    try { const updated = await api<Product>(`/admin/products/${encodeURIComponent(product.id)}`, { method: "PATCH", body: JSON.stringify({ available: !product.available }) }); setProducts((current) => current.map((item) => item.id === product.id ? updated : item)); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not update product."); }
    finally { setSaving(""); }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Delete ${product.name} from the menu? This cannot be undone.`)) return;
    setSaving(product.id); setError("");
    try {
      await api(`/admin/products/${encodeURIComponent(product.id)}`, { method: "DELETE" });
      setProducts((current) => current.filter((item) => item.id !== product.id));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not delete product."); }
    finally { setSaving(""); }
  }

  async function updateProductDetails(product: Product, updates: { salePrice: number | null; label: string }) {
    setSaving(`details-${product.id}`); setError("");
    try {
      const updated = await api<Product>(`/admin/products/${encodeURIComponent(product.id)}`, { method: "PATCH", body: JSON.stringify(updates) });
      setProducts((current) => current.map((item) => item.id === product.id ? updated : item));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not update promotion."); }
    finally { setSaving(""); }
  }

  async function updateProductImage(product: Product, file: File) {
    setSaving(`image-${product.id}`); setError("");
    try {
      const imageUrl = await uploadProductImage(file);
      const updated = await api<Product>(`/admin/products/${encodeURIComponent(product.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ imageUrl }),
      });
      setProducts((current) => current.map((item) => item.id === product.id ? updated : item));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not upload product image."); }
    finally { setSaving(""); }
  }

  async function createProduct(product: Omit<Product, "id" | "rating">) {
    setSaving("new-product"); setError("");
    try { const created = await api<Product>("/admin/products", { method: "POST", body: JSON.stringify(product) }); setProducts((current) => [created, ...current]); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not publish menu item."); throw e; }
    finally { setSaving(""); }
  }

  async function updateComplaint(complaint: Complaint, updates: { status: string; reply: string }) {
    setSaving(complaint.id); setError("");
    try { const updated = await api<Complaint>(`/admin/complaints/${encodeURIComponent(complaint.id)}`, { method: "PATCH", body: JSON.stringify(updates) }); setComplaints((current) => current.map((item) => item.id === complaint.id ? updated : item)); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not update complaint."); }
    finally { setSaving(""); }
  }

  async function toggleCustomer(customer: CustomerAccount) {
    setSaving(customer.id); setError("");
    try {
      const updated = await api<CustomerAccount>(`/admin/customers/${encodeURIComponent(customer.id)}`, { method: "PATCH", body: JSON.stringify({ active: !customer.active }) });
      setCustomers((current) => current.map((item) => item.id === customer.id ? updated : item));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not update customer account."); }
    finally { setSaving(""); }
  }

  async function toggleCashOnDelivery(customer: CustomerAccount) {
    setSaving(`cod-${customer.id}`); setError("");
    try {
      const updated = await api<CustomerAccount>(`/admin/customers/${encodeURIComponent(customer.id)}`, { method: "PATCH", body: JSON.stringify({ cashOnDeliveryAllowed: !customer.cashOnDeliveryAllowed }) });
      setCustomers((current) => current.map((item) => item.id === customer.id ? updated : item));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not update cash on delivery access."); }
    finally { setSaving(""); }
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      await api<{ email: string }>("/admin/login", { method: "POST", body: JSON.stringify({ email: emailInput, password: passwordInput }) });
      setPasswordInput("");
      await loadData();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not sign in."); setAuthenticated(false); setLoading(false); }
  }

  async function logout() {
    try { await api("/admin/logout", { method: "POST" }); } catch { /* Clear the dashboard locally even if the server is unreachable. */ }
    finally { setAuthenticated(false); setOrders([]); setProducts([]); setComplaints([]); setCustomers([]); }
  }

  if (!authenticated) return <main className="flex min-h-screen items-center justify-center px-5 py-16">
    <motion.form initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} onSubmit={signIn} className="w-full max-w-md rounded-[28px] border border-black/[.06] bg-white p-8 shadow-[0_24px_80px_-40px_rgba(20,40,30,.28)] sm:p-10">
      <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white"><Utensils size={22} /></div>
      <p className="text-xs font-bold uppercase tracking-[.2em] text-orange-600">BelleFood operations</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Admin sign in</h1><p className="mt-2 text-sm leading-6 text-[#758079]">Sign in with your administrator email and password.</p>
      <label className="mt-7 block text-sm font-semibold">Email address<input value={emailInput} onChange={(e) => setEmailInput(e.target.value)} type="email" autoComplete="username" required placeholder="admin@example.com" className="mt-2 w-full rounded-xl border border-[#e4e9e5] bg-[#fafbf9] px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100" /></label>
      <label className="mt-4 block text-sm font-semibold">Password<input value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} type="password" autoComplete="current-password" required placeholder="Enter your password" className="mt-2 w-full rounded-xl border border-[#e4e9e5] bg-[#fafbf9] px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100" /></label>
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      <button disabled={loading || !emailInput.trim() || !passwordInput} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#18231f] px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50">{loading ? <Activity className="animate-spin" size={17} /> : null}{loading ? "Signing in…" : "Sign in"}</button>
    </motion.form>
  </main>;

  return <div className="min-h-screen">
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-black/[.05] bg-white px-5 py-6 transition-transform lg:translate-x-0 ${mobileNav ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex items-center gap-3 px-2"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white"><Utensils size={19} /></div><div><p className="font-bold tracking-tight">BelleFood</p><p className="text-[11px] font-medium text-[#929b95]">ADMIN CONSOLE</p></div><button onClick={() => setMobileNav(false)} className="ml-auto rounded-lg p-2 text-[#717c75] lg:hidden" aria-label="Close navigation"><X size={18} /></button></div>
      <p className="mb-3 mt-10 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#9aa39d]">Workspace</p>
      <nav className="space-y-1">{navItems.map(({ name, icon: Icon }) => <button key={name} onClick={() => { setSection(name); setQuery(""); setMobileNav(false); }} className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition ${section === name ? "bg-[#fff2e9] text-[#e66a21]" : "text-[#6f7a73] hover:bg-[#f5f7f4] hover:text-[#26332c]"}`}><Icon size={18} strokeWidth={1.8} />{name}{name === "Orders" && activeOrders.length > 0 && <span className="ml-auto rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700">{activeOrders.length}</span>}{name === "Complaints" && complaints.filter((item) => item.status !== "resolved").length > 0 && <span className="ml-auto rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700">{complaints.filter((item) => item.status !== "resolved").length}</span>}</button>)}</nav>
      <div className="mt-auto rounded-2xl bg-[#f7f8f6] p-4"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500"/><span className="text-xs font-semibold">Backend connected</span></div><p className="mt-2 text-[11px] leading-5 text-[#8b958e]">Your dashboard is reading live data from Firestore.</p></div>
      <button onClick={logout} className="mt-4 flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-[#79837c] transition hover:bg-red-50 hover:text-red-600"><LogOut size={17} />Sign out</button>
    </aside>
    {mobileNav && <button aria-label="Close navigation overlay" onClick={() => setMobileNav(false)} className="fixed inset-0 z-30 bg-black/30 lg:hidden"/>}

    <div className="min-h-screen lg:pl-[260px]">
      <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-black/[.05] bg-[#f6f7f5]/90 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
        <div className="flex items-center gap-3"><button onClick={() => setMobileNav(true)} className="rounded-lg p-2 text-[#5f6a63] lg:hidden" aria-label="Open navigation"><Menu size={20}/></button><div><p className="text-xs text-[#8b958e]">BelleFood / {section}</p><p className="mt-0.5 text-sm font-semibold">{section === "Overview" ? "Overview" : section === "Orders" ? "Order management" : section === "Menu" ? "Menu management" : section === "Users" ? "User management" : "Customer support"}</p></div></div>
        <div className="flex items-center gap-2 sm:gap-4"><span className="hidden items-center gap-2 rounded-full border border-[#e6eae6] bg-white px-3 py-2 text-xs font-medium text-[#637068] sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/>Live data</span><button onClick={() => void loadData()} className="rounded-xl border border-[#e5e9e5] bg-white p-2.5 text-[#66736b] transition hover:text-orange-600" aria-label="Refresh dashboard"><Activity size={17} className={loading ? "animate-spin" : ""}/></button><button className="relative rounded-xl border border-[#e5e9e5] bg-white p-2.5 text-[#66736b]" aria-label="Notifications"><Bell size={17}/>{activeOrders.length > 0 && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-orange-500"/>}</button><div className="hidden h-9 w-9 items-center justify-center rounded-full bg-[#24372e] text-xs font-bold text-white sm:flex">BF</div></div>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
        <AnimatePresence>{error && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-5 flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error"><X size={16}/></button></motion.div>}</AnimatePresence>
        <motion.div key={section} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .28 }}>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-[#8a948d]">{new Intl.DateTimeFormat("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date())}</p><h1 className="mt-1 text-[28px] font-semibold tracking-[-.04em] sm:text-[34px]">{section === "Overview" ? "Good day, Admin" : section === "Orders" ? "Orders" : section === "Menu" ? "Your menu" : section === "Complaints" ? "Customer complaints" : "Customer accounts"}<span className="ml-2">{section === "Overview" ? "👋" : ""}</span></h1><p className="mt-1 text-sm text-[#849087]">{section === "Overview" ? "Here’s what’s happening with your kitchen today." : section === "Orders" ? "Accept incoming orders, confirm payments, and keep ETAs current." : section === "Menu" ? "Publish new meals and control what customers can order." : section === "Complaints" ? "Respond to customer concerns and keep cases moving." : "Review registrations and manage customer access."}</p></div>{section !== "Overview" && !(section === "Menu" && showProductForm) && <div className="relative w-full sm:w-72"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aa39d]" size={16}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={section === "Orders" ? "Search orders…" : section === "Menu" ? "Search menu…" : section === "Complaints" ? "Search complaints…" : "Search customers…"} className="w-full rounded-xl border border-[#e6eae6] bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"/></div>}</div>

          {section === "Overview" && <>
            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
              { label: "Today's revenue", value: money(revenue), icon: CircleDollarSign, trend: "From today’s orders", color: "orange" },
              { label: "Orders today", value: String(todayOrders.length), icon: ShoppingBag, trend: `${activeOrders.length} currently active`, color: "green" },
              { label: "Active orders", value: String(activeOrders.length), icon: Clock3, trend: "Need your attention", color: "blue" },
              { label: "Menu items", value: String(products.length), icon: Package, trend: `${products.filter((item) => item.available).length} available to order`, color: "purple" },
            ].map(({ label, value, icon: Icon, trend, color }, index) => <motion.article key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .06 }} className="rounded-2xl border border-black/[.045] bg-white p-5 shadow-[0_8px_30px_-24px_rgba(18,37,26,.24)]"><div className="flex items-center justify-between"><span className="text-sm font-medium text-[#78837b]">{label}</span><span className={`rounded-xl p-2.5 ${color === "orange" ? "bg-orange-50 text-orange-600" : color === "green" ? "bg-emerald-50 text-emerald-600" : color === "blue" ? "bg-blue-50 text-blue-600" : "bg-violet-50 text-violet-600"}`}><Icon size={18}/></span></div><p className="mt-5 text-[28px] font-semibold tracking-tight">{value}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-[#97a099]">{index < 2 ? <ArrowUpRight size={13} className="text-emerald-500"/> : <Activity size={13}/ >}{trend}</p></motion.article>)}</div>
            <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]"><section className="rounded-2xl border border-black/[.045] bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Recent orders</h2><p className="mt-1 text-xs text-[#97a099]">Latest activity from your kitchen</p></div><button onClick={() => setSection("Orders")} className="text-xs font-semibold text-orange-600 hover:text-orange-700">View all</button></div><div className="mt-5 space-y-1">{orders.slice(0, 5).map((order) => <OrderRow key={order.id} order={order} />)}{orders.length === 0 && <EmptyState icon={ShoppingBag} title="No orders yet" detail="New customer orders will show up here."/>}</div></section>
              <section className="rounded-2xl bg-[#1b2b23] p-6 text-white"><div className="flex items-start justify-between"><div><p className="text-sm text-white/55">Kitchen pulse</p><h2 className="mt-1 text-xl font-semibold">Orders by hour</h2></div><span className="rounded-xl bg-white/10 p-2.5 text-orange-300"><Activity size={18}/></span></div><div className="mt-8 flex h-32 items-end gap-2">{hourlyActivity.map((count, i) => { const height = count === 0 ? 3 : Math.max(12, count / activityPeak * 100); return <div key={i} title={`${count} ${count === 1 ? "order" : "orders"}`} className="group relative flex-1 rounded-t-md bg-white/10" style={{ height: `${height}%` }}><div className="absolute inset-x-0 bottom-0 rounded-t-md bg-gradient-to-t from-orange-500 to-orange-300 transition-all group-hover:brightness-110" style={{ height: "100%" }}/></div>; })}</div><div className="mt-3 flex justify-between text-[10px] text-white/40"><span>9 AM</span><span>12 PM</span><span>3 PM</span><span>6 PM</span><span>8 PM</span></div><div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5"><div><p className="text-xs text-white/50">Open orders</p><p className="mt-1 text-2xl font-semibold">{activeOrders.length}</p></div><div className="text-right"><p className="text-xs text-white/50">Completed today</p><p className="mt-1 text-2xl font-semibold">{todayOrders.filter((order) => order.status === "delivered").length}</p></div></div></section></div>
            <section className="mt-5 rounded-2xl border border-black/[.045] bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Popular menu items</h2><p className="mt-1 text-xs text-[#97a099]">Manage what’s available today</p></div><button onClick={() => setSection("Menu")} className="text-xs font-semibold text-orange-600">Manage menu</button></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{products.slice(0, 4).map((product) => <div key={product.id} className="flex items-center gap-3 rounded-xl bg-[#f8f9f7] p-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-orange-50 text-orange-500"><Utensils size={18}/></div><div className="min-w-0"><p className="truncate text-sm font-semibold">{product.name}</p><p className="mt-0.5 text-xs text-[#8f9992]">{money(product.price)} · {product.available ? "Available" : "Paused"}</p></div></div>)}</div></section>
          </>}

          {section === "Orders" && <section className="mt-7 overflow-hidden rounded-2xl border border-black/[.045] bg-white"><div className="flex items-center justify-between border-b border-[#f0f2ef] px-5 py-4"><div><h2 className="font-semibold">All orders</h2><p className="mt-1 text-xs text-[#97a099]">Latest {orders.length} orders</p></div><span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">{activeOrders.length} active</span></div><div className="divide-y divide-[#f0f2ef]">{filteredOrders.map((order) => <OrderManagementRow key={order.id} order={order} products={products} saving={saving === order.id} onUpdate={(updates) => void updateOrder(order, updates)}/>)}{filteredOrders.length === 0 && <EmptyState icon={ShoppingBag} title={query ? "No matching orders" : "Your orders will appear here"} detail={query ? "Try a different name or order ID." : "Once a customer places an order, you can manage it here."}/>}</div></section>}

          {section === "Menu" && <section className="mt-7 rounded-2xl border border-black/[.045] bg-white"><div className="flex items-center justify-between border-b border-[#f0f2ef] px-5 py-4"><div><h2 className="font-semibold">Menu items</h2><p className="mt-1 text-xs text-[#97a099]">Publish meals or pause unavailable items</p></div><button onClick={() => setShowProductForm((current) => !current)} className="rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-orange-600">{showProductForm ? "Close form" : "+ Add food"}</button></div>{showProductForm && <ProductForm saving={saving === "new-product"} onCancel={() => setShowProductForm(false)} onCreate={async (product) => { await createProduct(product); setShowProductForm(false); }}/>}<div className="divide-y divide-[#f0f2ef]">{filteredProducts.map((product) => <MenuProductRow key={product.id} product={product} busy={saving === product.id || saving === `image-${product.id}`} detailsBusy={saving === `details-${product.id}`} onToggle={() => void toggleProduct(product)} onDelete={() => void deleteProduct(product)} onUpload={(file) => void updateProductImage(product, file)} onSaveDetails={(updates) => void updateProductDetails(product, updates)}/>)}{filteredProducts.length === 0 && <EmptyState icon={Utensils} title="No menu items found" detail="Try another search term."/>}</div></section>}

          {section === "Complaints" && <section className="mt-7 overflow-hidden rounded-2xl border border-black/[.045] bg-white"><div className="flex items-center justify-between border-b border-[#f0f2ef] px-5 py-4"><div><h2 className="font-semibold">Customer concerns</h2><p className="mt-1 text-xs text-[#97a099]">{complaints.filter((item) => item.status !== "resolved").length} cases need attention</p></div></div><div className="divide-y divide-[#f0f2ef]">{filteredComplaints.map((complaint) => <ComplaintCard key={complaint.id} complaint={complaint} saving={saving === complaint.id} onSave={(updates) => void updateComplaint(complaint, updates)}/>)}{filteredComplaints.length === 0 && <EmptyState icon={MessageCircle} title={query ? "No matching complaints" : "No complaints received"} detail={query ? "Try a different search term." : "Customer submissions will appear here."}/>}</div></section>}
          {section === "Users" && <section className="mt-7 overflow-hidden rounded-2xl border border-black/[.045] bg-white"><div className="flex items-center justify-between border-b border-[#f0f2ef] px-5 py-4"><div><h2 className="font-semibold">Registered customers</h2><p className="mt-1 text-xs text-[#97a099]">{customers.length} accounts created</p></div></div><div className="divide-y divide-[#f0f2ef]">{filteredCustomers.map((customer) => <article key={customer.id} className="flex flex-wrap items-center gap-3 px-5 py-4 sm:gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff2e9] text-sm font-bold text-orange-700">{customer.name.slice(0, 1).toUpperCase() || "?"}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{customer.name}</p><p className="truncate text-xs text-[#839087]">{customer.email}</p><p className="mt-1 text-[10px] text-[#a0a9a2]">Joined {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" }) : "date unavailable"}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${customer.active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{customer.active ? "Active" : "Disabled"}</span><button disabled={saving === customer.id} onClick={() => void toggleCustomer(customer)} className={`rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50 ${customer.active ? "border border-red-100 text-red-600 hover:bg-red-50" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>{saving === customer.id ? "Saving…" : customer.active ? "Disable account" : "Enable account"}</button><button disabled={saving === `cod-${customer.id}`} onClick={() => void toggleCashOnDelivery(customer)} className={`rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50 ${customer.cashOnDeliveryAllowed ? "border border-amber-200 text-amber-700 hover:bg-amber-50" : "border border-emerald-200 text-emerald-700 hover:bg-emerald-50"}`}>{saving === `cod-${customer.id}` ? "Saving…" : customer.cashOnDeliveryAllowed ? "Remove COD" : "Restore COD"}</button></article>)}{filteredCustomers.length === 0 && <EmptyState icon={Users} title={query ? "No matching accounts" : "No customer accounts yet"} detail={query ? "Try another name or email." : "New sign-ups will appear here."}/>}</div></section>}
        </motion.div>
        <footer className="mt-10 flex items-center justify-between border-t border-black/[.06] py-5 text-[11px] text-[#9aa39d]"><span>© {new Date().getFullYear()} BelleFood</span><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/>All systems operational</span></footer>
      </main>
    </div>
  </div>;
}

function OrderRow({ order }: { order: Order }) {
  return <div className="flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-[#fafbf9]"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f1f5f1] text-xs font-bold text-[#506257]">{order.customerName?.slice(0, 1).toUpperCase() || "?"}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{order.customerName}</p><p className="mt-0.5 truncate text-xs text-[#9aa39d]">{order.items?.length || 0} items · #{order.trackingId || order.id}</p></div><span className="hidden text-xs text-[#839087] sm:inline">{order.createdAt ? new Date(order.createdAt).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" }) : "—"}</span><span className="text-sm font-semibold">{money(order.total)}</span><StatusBadge status={order.status}/></div>;
}

function OrderManagementRow({ order, products, saving, onUpdate }: { order: Order; products: Product[]; saving: boolean; onUpdate: (updates: Partial<Pick<Order, "status" | "paymentStatus" | "estimatedDelivery">>) => void }) {
  const [eta, setEta] = useState(order.estimatedDelivery || "25-30 mins");

  return (
    <div className="px-5 py-4">
      <div className="grid gap-3 md:grid-cols-[1.1fr_1fr_1.1fr_0.7fr_1.4fr] md:items-center md:gap-4">
        <div className="flex items-center justify-between md:block">
          <p className="text-xs text-[#9aa39d] md:hidden">Order</p>
          <p className="break-all text-sm font-semibold">#{order.trackingId || order.id}</p>
          <p className="mt-1 text-[11px] text-[#9aa39d]">{order.createdAt ? new Date(order.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "Time unavailable"}</p>
        </div>
        <div className="flex items-center justify-between md:block">
          <p className="text-xs text-[#9aa39d] md:hidden">Customer</p>
          <p className="text-sm font-medium">{order.customerName}</p>
          <p className="mt-1 text-[11px] text-[#9aa39d]">{order.customerPhone || "Phone not provided"}</p>
        </div>
        <div className="flex justify-between md:block">
          <p className="text-xs text-[#9aa39d] md:hidden">Items</p>
          <div className="flex flex-wrap gap-2">
            {order.items?.map((item, index) => {
              const imageUrl = item.imageUrl || products.find((product) => product.id === item.productId)?.imageUrl;
              return (
                <div key={`${item.productId || item.productName}-${index}`} className="flex items-center gap-2 rounded-lg bg-[#f8f9f7] p-1.5">
                  {imageUrl ? <Image src={imageUrl} alt={item.productName} width={44} height={44} unoptimized className="h-11 w-11 rounded-md object-cover" /> : <div className="flex h-11 w-11 items-center justify-center rounded-md bg-orange-50 text-orange-500"><Utensils size={17} /></div>}
                  <span className="max-w-28 text-xs text-[#526057]">{item.quantity}× {item.productName}</span>
                </div>
              );
            })}
            {order.items?.length === 0 && <span className="text-xs text-[#718077]">No items listed</span>}
          </div>
        </div>
        <div className="flex justify-between md:block">
          <p className="text-xs text-[#9aa39d] md:hidden">Total</p>
          <p className="text-sm font-semibold">{money(order.total)}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 md:justify-start">
          <StatusBadge status={order.status} />
          <label className="relative">
            <span className="sr-only">Update status for order {order.id}</span>
            <select disabled={saving} value={order.status} onChange={(event) => onUpdate({ status: event.target.value })} className="max-w-[150px] appearance-none rounded-lg border border-[#e9ece9] bg-white py-2 pl-3 pr-8 text-xs font-medium capitalize outline-none focus:border-orange-300 disabled:opacity-50">
              {statuses.map((status) => <option key={status} value={status}>{status.replaceAll("-", " ")}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a948d]" size={13} />
          </label>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-[#f8f9f7] p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#8c968f]">Delivery address</p>
        <p className="mt-1 break-words text-sm text-[#28362e]">{order.deliveryAddress || "No delivery address recorded"}</p>
        {order.deliveryLandmark && <p className="mt-1 text-xs text-[#718077]">Landmark: {order.deliveryLandmark}</p>}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl bg-[#f8f9f7] p-3">
        <label className="text-[10px] font-bold uppercase tracking-wider text-[#8c968f]">Estimated delivery
          <input value={eta} onChange={(event) => setEta(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); onUpdate({ estimatedDelivery: eta }); } }} placeholder="e.g. 25-30 mins" className="mt-1.5 block w-36 rounded-lg border border-[#e5e9e5] bg-white px-3 py-2 text-xs font-medium normal-case tracking-normal text-[#28362e] outline-none focus:border-orange-300" />
        </label>
        <button disabled={saving || eta === order.estimatedDelivery} onClick={() => onUpdate({ estimatedDelivery: eta })} className="rounded-lg border border-[#e5e9e5] bg-white px-3 py-2 text-xs font-semibold text-[#68746c] hover:text-orange-600 disabled:opacity-40">{saving ? "Saving…" : "Update ETA"}</button>
        <label className="text-[10px] font-bold uppercase tracking-wider text-[#8c968f]">Payment status
          <select disabled={saving} value={order.paymentStatus || "pending"} onChange={(event) => onUpdate({ paymentStatus: event.target.value })} className="mt-1.5 block rounded-lg border border-[#e5e9e5] bg-white px-3 py-2 text-xs font-semibold normal-case tracking-normal text-[#28362e] outline-none focus:border-orange-300">
            {["pending", "paid", "failed", "refunded"].map((status) => <option key={status} value={status}>{status === "paid" ? "Confirmed paid" : status[0].toUpperCase() + status.slice(1)}</option>)}
          </select>
        </label>
        {order.status === "received" && <button disabled={saving} onClick={() => onUpdate({ status: "preparing" })} className="ml-auto rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50">Accept order</button>}
        {order.status === "received" && <button disabled={saving} onClick={() => onUpdate({ status: "cancelled" })} className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50">Decline</button>}
      </div>
    </div>
  );
}
function ProductForm({ saving, onCancel, onCreate }: { saving: boolean; onCancel: () => void; onCreate: (product: Omit<Product, "id" | "rating">) => Promise<void> }) {
  const [name, setName] = useState(""); const [category, setCategory] = useState(""); const [price, setPrice] = useState(""); const [salePrice, setSalePrice] = useState(""); const [label, setLabel] = useState(""); const [description, setDescription] = useState(""); const [imageFile, setImageFile] = useState<File | null>(null); const [formError, setFormError] = useState("");
  return <form onSubmit={async (event) => { event.preventDefault(); setFormError(""); if (!imageFile) { setFormError("Upload a product image before publishing."); return; } try { const imageUrl = await uploadProductImage(imageFile); await onCreate({ name: name.trim(), category: category.trim(), price: Number(price), salePrice: salePrice ? Number(salePrice) : null, label: label.trim(), description: description.trim(), imageUrl, available: true }); } catch (error) { setFormError(error instanceof Error ? error.message : "Could not publish this item."); } }} className="border-b border-[#f0f2ef] bg-[#fcfcfb] p-5"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Food or drink name" className="rounded-xl border border-[#e5e9e5] bg-white px-3.5 py-3 text-sm outline-none focus:border-orange-300"/><input required value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (e.g. Rice, Drinks)" className="rounded-xl border border-[#e5e9e5] bg-white px-3.5 py-3 text-sm outline-none focus:border-orange-300"/><input required min="1" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Regular price in NGN" className="rounded-xl border border-[#e5e9e5] bg-white px-3.5 py-3 text-sm outline-none focus:border-orange-300"/><input min="1" type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="Promotion price (optional)" className="rounded-xl border border-[#e5e9e5] bg-white px-3.5 py-3 text-sm outline-none focus:border-orange-300"/><input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={30} placeholder="Item label (e.g. Bestseller)" className="rounded-xl border border-[#e5e9e5] bg-white px-3.5 py-3 text-sm outline-none focus:border-orange-300"/><input required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" className="rounded-xl border border-[#e5e9e5] bg-white px-3.5 py-3 text-sm outline-none focus:border-orange-300"/><label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[#dce2dc] bg-white px-3.5 py-3 text-sm text-[#647168] hover:border-orange-300"><ImagePlus size={17}/><span className="truncate">{imageFile ? imageFile.name : "Upload item photo (required)"}</span><input required type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}/></label></div>{formError && <p role="alert" className="mt-3 text-xs text-red-600">{formError}</p>}<div className="mt-4 flex justify-end gap-2"><button type="button" onClick={onCancel} className="rounded-lg px-3 py-2 text-xs font-semibold text-[#738077]">Cancel</button><button disabled={saving || !imageFile} className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50">{saving ? "Publishing…" : "Publish food"}</button></div></form>;
}

function MenuProductRow({ product, busy, detailsBusy, onToggle, onDelete, onUpload, onSaveDetails }: { product: Product; busy: boolean; detailsBusy: boolean; onToggle: () => void; onDelete: () => void; onUpload: (file: File) => void; onSaveDetails: (updates: { salePrice: number | null; label: string }) => void }) {
  const [salePrice, setSalePrice] = useState(product.salePrice ? String(product.salePrice) : ""); const [label, setLabel] = useState(product.label || "");
  return <div className="flex flex-col gap-3 px-5 py-4"><div className="flex items-center gap-3 sm:gap-4"><ProductImageControl product={product} busy={busy} onUpload={onUpload}/><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{product.name}{product.label && <span className="ml-2 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700">{product.label}</span>}</p><p className="mt-1 text-xs text-[#8d978f]">{product.category} · {money(product.price)}{product.salePrice ? <span className="ml-1 font-semibold text-orange-600">Sale {money(product.salePrice)}</span> : null}</p></div><span className={`hidden rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-flex ${product.available ? "bg-emerald-50 text-emerald-700" : "bg-[#f1f2f0] text-[#848d86]"}`}>{product.available ? "Available" : "Paused"}</span><button disabled={busy} onClick={onToggle} className="rounded-lg border border-[#e8ebe8] px-3 py-2 text-xs font-semibold text-[#6e7971] disabled:opacity-50">{busy ? "Saving…" : product.available ? "Pause" : "Enable"}</button><button disabled={busy} onClick={onDelete} className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">Delete</button></div><div className="flex flex-wrap items-end gap-2 pl-14"><label className="text-[10px] font-semibold text-[#869189]">Sale price<input type="number" min="1" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="Off" className="mt-1 block w-32 rounded-lg border border-[#e5e9e5] px-2.5 py-2 text-xs text-[#26332c]"/></label><label className="text-[10px] font-semibold text-[#869189]">Label<input value={label} maxLength={30} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Popular" className="mt-1 block w-40 rounded-lg border border-[#e5e9e5] px-2.5 py-2 text-xs text-[#26332c]"/></label><button disabled={detailsBusy || (salePrice === (product.salePrice ? String(product.salePrice) : "") && label === (product.label || ""))} onClick={() => onSaveDetails({ salePrice: salePrice ? Number(salePrice) : null, label: label.trim() })} className="rounded-lg bg-[#1b2b23] px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">{detailsBusy ? "Saving…" : "Save promotion / label"}</button></div></div>;
}

function ProductImageControl({ product, busy, onUpload }: { product: Product; busy: boolean; onUpload: (file: File) => void }) {
  return <label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs font-medium text-[#69766e] hover:text-orange-600" title={product.imageUrl ? "Change product image" : "Add product image"}>
    <span className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-[#fff4eb] text-orange-500">
      {product.imageUrl ? <Image src={product.imageUrl} alt={product.name} width={48} height={48} unoptimized className="h-full w-full object-cover"/> : <ImagePlus size={19}/>}
      {busy && <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-[8px] font-semibold text-white">Uploading</span>}
    </span>
    <span className="hidden sm:inline">{busy ? "Uploading…" : product.imageUrl ? "Change image" : "Add image"}</span>
    <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(file); event.target.value = ""; }}/>
  </label>;
}

function ComplaintCard({ complaint, saving, onSave }: { complaint: Complaint; saving: boolean; onSave: (updates: { status: string; reply: string }) => void }) {
  const [reply, setReply] = useState(complaint.reply || ""); const [status, setStatus] = useState(complaint.status);
  return <article className="px-5 py-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#f2f4f1] px-2.5 py-1 text-[10px] font-semibold text-[#69766e]">{complaint.category}</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${status === "resolved" ? "bg-emerald-50 text-emerald-700" : status === "in-progress" ? "bg-amber-50 text-amber-700" : "bg-orange-50 text-orange-700"}`}>{status.replaceAll("-", " ")}</span>{complaint.orderId && <span className="text-[11px] text-[#929c95]">Tracking ID #{complaint.orderId}</span>}</div><p className="mt-3 text-sm font-semibold">{complaint.customerName}<span className="ml-2 font-normal text-[#929c95]">{complaint.customerEmail}</span></p><p className="mt-1 text-[11px] text-[#a1aaa3]">{complaint.createdAt ? new Date(complaint.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : ""}</p></div><select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-[#e5e9e5] bg-white px-3 py-2 text-xs font-medium capitalize outline-none focus:border-orange-300">{["open", "in-progress", "resolved"].map((value) => <option key={value} value={value}>{value.replaceAll("-", " ")}</option>)}</select></div><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#536158]">{complaint.message}</p><div className="mt-4 flex flex-col gap-2 sm:flex-row"><div className="min-w-0 flex-1"><textarea value={reply} onChange={(e) => setReply(e.target.value)} maxLength={2000} rows={2} placeholder="Record the response shared with this customer…" className="w-full resize-y rounded-xl border border-[#e5e9e5] bg-[#fcfcfb] px-3.5 py-3 text-sm outline-none focus:border-orange-300"/><p className="mt-1 text-[10px] text-[#9aa39d]">Saved to the support record; this does not send an email.</p></div><button disabled={saving} onClick={() => onSave({ status, reply })} className="self-end rounded-xl bg-[#1b2b23] px-4 py-3 text-xs font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50">{saving ? "Saving…" : "Save response"}</button></div>{complaint.reply && <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800"><span className="font-semibold">Saved response:</span> {complaint.reply}</p>}</article>;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = { received: "bg-blue-50 text-blue-700", preparing: "bg-amber-50 text-amber-700", "on-the-way": "bg-violet-50 text-violet-700", delivered: "bg-emerald-50 text-emerald-700", cancelled: "bg-red-50 text-red-700" };
  return <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${styles[status] || "bg-gray-100 text-gray-700"}`}>{status === "delivered" ? <Check size={11}/> : null}{status.replaceAll("-", " ")}</span>;
}

function EmptyState({ icon: Icon, title, detail }: { icon: typeof Users; title: string; detail: string }) {
  return <div className="flex flex-col items-center px-5 py-12 text-center"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4f6f3] text-[#96a098]"><Icon size={20}/></span><p className="mt-4 text-sm font-semibold">{title}</p><p className="mt-1 text-xs text-[#98a19b]">{detail}</p></div>;
}
