"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Utensils } from "lucide-react";

export default function CheckoutGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/backend/auth/session", { credentials: "same-origin", cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Sign in required");
        return response.json();
      })
      .then(() => { if (active) setAllowed(true); })
      .catch(() => { if (active) router.replace("/signin"); });
    return () => { active = false; };
  }, [router]);

  if (!allowed) return <div className="flex min-h-[55vh] items-center justify-center bg-[#020D0B] text-white"><div className="flex items-center gap-3 text-sm"><Utensils size={18} className="animate-pulse text-orange-400"/> Checking your account…</div></div>;
  return <>{children}</>;
}
