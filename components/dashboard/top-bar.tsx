"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Search, Bell, Mail } from "lucide-react";

export function TopBar() {
  const [user, setUser] = useState<{ full_name: string | null; email: string | null }>({ full_name: null, email: null });
  const [alertCount, setAlertCount] = useState(0);
  const prevAlertCount = useRef(0);
  const supabase = createClient();

  // Fetch user info
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser) {
        setUser({
          full_name: authUser.user_metadata?.full_name || null,
          email: authUser.email || null,
        });
      }
    });
  }, [supabase]);

  // Fetch open alert count
  const fetchAlertCount = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/alerts?status=open&limit=1");
      if (res.ok) {
        const data = await res.json();
        const newCount = Array.isArray(data) ? data.length : 0;

        // If count increased, send browser notification
        if (newCount > prevAlertCount.current && prevAlertCount.current > 0) {
          sendBrowserNotification(newCount);
        }
        prevAlertCount.current = newCount;
        setAlertCount(newCount);
      }
    } catch { /* */ }
  }, []);

  // Fetch full count properly
  const fetchFullAlertCount = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/alerts?status=open&limit=200");
      if (res.ok) {
        const data = await res.json();
        const newCount = Array.isArray(data) ? data.length : 0;

        if (newCount > prevAlertCount.current && prevAlertCount.current >= 0 && prevAlertCount.current !== newCount) {
          sendBrowserNotification(newCount);
        }
        prevAlertCount.current = newCount;
        setAlertCount(newCount);
      }
    } catch { /* */ }
  }, []);

  useEffect(() => { fetchFullAlertCount(); }, [fetchFullAlertCount]);

  // Realtime: listen for new/updated alerts
  useEffect(() => {
    const channel = supabase
      .channel("topbar-alerts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "alerts" }, () => {
        fetchFullAlertCount();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "alerts" }, () => {
        // Small delay to ensure DB transaction has committed
        setTimeout(fetchFullAlertCount, 300);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, fetchFullAlertCount]);

  // Listen for custom event from alerts page (fallback if realtime is slow)
  useEffect(() => {
    const handler = () => {
      setTimeout(fetchFullAlertCount, 200);
    };
    window.addEventListener("neurovault:alerts-updated", handler);
    return () => window.removeEventListener("neurovault:alerts-updated", handler);
  }, [fetchFullAlertCount]);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const sendBrowserNotification = (count: number) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification("NeuroVault Security Alert", {
        body: `You have ${count} open security alert${count > 1 ? "s" : ""} requiring attention.`,
        icon: "/neurovault.png",
        badge: "/neurovault.png",
        tag: "neurovault-alert", // Replaces previous notification
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        window.location.href = "/dashboard/alerts";
        notification.close();
      };
    }
  };

  const initials = user.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user.email?.[0]?.toUpperCase() || "U";

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-sm px-4 gap-4">
      {/* Left */}
      <div className="flex items-center gap-3 flex-1">
        <SidebarTrigger className="text-slate-400 hover:text-white" />
        <Separator orientation="vertical" className="h-6 bg-white/[0.06]" />
        <div className="relative max-w-md flex-1 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search..."
            className="pl-9 h-9 bg-white/[0.03] border-0 ring-1 ring-white/[0.06] text-white text-sm placeholder:text-slate-500 focus:ring-blue-500/40 rounded-lg"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center text-[10px] text-slate-600 bg-white/[0.04] ring-1 ring-white/[0.06] rounded px-1.5 py-0.5 font-mono">/</kbd>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors">
          <Mail className="h-4 w-4" />
        </button>

        {/* Alert bell with live count */}
        <Link href="/dashboard/alerts" className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors">
          <Bell className="h-4 w-4" />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-[10px] font-bold text-white px-1 ring-2 ring-slate-950">
              {alertCount > 99 ? "99+" : alertCount}
            </span>
          )}
        </Link>

        <Separator orientation="vertical" className="h-6 bg-white/[0.06] mx-1" />

        <div className="flex items-center gap-3 pl-1">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-white leading-tight">{user.full_name || "User"}</p>
            <p className="text-[11px] text-slate-500 leading-tight">{user.email || ""}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-blue-700 text-xs font-bold text-white shadow-lg shadow-blue-500/20">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
