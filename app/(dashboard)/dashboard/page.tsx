"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Eye,
  Activity,
  Users,
  Bell,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowRight,
  Shield,
  AlertTriangle,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Button from "@/components/ui/button";

interface DashboardStats {
  ai_tools_detected: number;
  total_events: number;
  active_users: number;
  open_alerts: number;
}

interface ActivityItem {
  id: string;
  event_type: string;
  created_at: string;
  ai_tools: { name: string; default_risk: string; id: string } | null;
  profiles: { full_name: string | null } | null;
}

interface AnalyticsData {
  daily_trend: { date: string; count: number }[];
  tool_breakdown: { tool_id: string; name: string; category: string; count: number }[];
  risk_distribution: { low: number; medium: number; high: number; critical: number };
}

// AI tool favicon URLs using Google's favicon service
const getToolIcon = (toolId: string): string => {
  const domainMap: Record<string, string> = {
    chatgpt: "chat.openai.com",
    claude: "claude.ai",
    gemini: "gemini.google.com",
    midjourney: "midjourney.com",
    copilot: "github.com",
    perplexity: "perplexity.ai",
    huggingface: "huggingface.co",
    replicate: "replicate.com",
    stability: "stability.ai",
    jasper: "jasper.ai",
    writesonic: "writesonic.com",
    "copy-ai": "copy.ai",
    "notion-ai": "notion.so",
    cursor: "cursor.com",
    v0: "v0.dev",
  };
  const domain = domainMap[toolId] || `${toolId}.com`;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
};

const riskBadge: Record<string, string> = {
  low: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  high: "bg-orange-500/10 text-orange-400 ring-orange-500/20",
  critical: "bg-red-500/10 text-red-400 ring-red-500/20",
};

const tooltipStyle = {
  backgroundColor: "#0c0e1a",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "12px",
  color: "#e2e8f0",
  fontSize: "12px",
  padding: "10px 14px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [trend, setTrend] = useState<{ date: string; count: number }[]>([]);
  const [topTools, setTopTools] = useState<{ tool_id: string; name: string; count: number }[]>([]);
  const [riskDist, setRiskDist] = useState({ low: 0, medium: 0, high: 0, critical: 0 });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, activityRes, analyticsRes] = await Promise.all([
        fetch("/api/dashboard/stats?days=7"),
        fetch("/api/dashboard/activity?limit=5"),
        fetch("/api/dashboard/analytics?days=7"),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (activityRes.ok) setActivity(await activityRes.json());
      if (analyticsRes.ok) {
        const data: AnalyticsData = await analyticsRes.json();
        setTrend(data.daily_trend);
        setTopTools((data.tool_breakdown || []).slice(0, 5));
        if (data.risk_distribution) setRiskDist(data.risk_distribution);
      }
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel("dashboard-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_events" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, fetchData]);

  const formatTimeAgo = (dateStr: string) => {
    const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (s < 60) return "Just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const totalRisk = riskDist.low + riskDist.medium + riskDist.high + riskDist.critical;

  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={`bg-white/5 rounded-xl animate-pulse ${className}`} />
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[1.7rem] font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Monitor and manage AI security across your organization.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/8 px-3.5 py-2 rounded-full ring-1 ring-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            Live
          </span>
          <Link href="/dashboard/settings">
            <Button variant="outline" className="rounded-xl border-white/8 text-slate-300 hover:bg-white/5 hover:text-white h-9 text-sm">
              Connect Extension
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Primary card */}
        <Link href="/dashboard/shadow-ai" className="group">
          <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 to-blue-700 p-6 shadow-xl shadow-blue-600/10 ring-1 ring-white/10 transition-all hover:shadow-blue-600/20 hover:ring-white/20 h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-medium text-blue-100">AI Apps Detected</span>
                <ArrowUpRight className="h-4 w-4 text-blue-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <p className="text-5xl font-bold text-white tracking-tight leading-none">
                {loading ? <Skeleton className="h-12 w-16" /> : (stats?.ai_tools_detected ?? 0)}
              </p>
              <p className="text-xs text-blue-200/60 mt-3 flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3" /> Across your organization
              </p>
            </div>
          </div>
        </Link>

        {[
          { title: "Events This Week", value: stats?.total_events ?? 0, icon: Activity, href: "/dashboard/analytics", sub: "Total activity events" },
          { title: "Active Users", value: stats?.active_users ?? 0, icon: Users, href: "/dashboard/users", sub: "Using AI tools" },
          { title: "Open Alerts", value: stats?.open_alerts ?? 0, icon: Bell, href: "/dashboard/alerts", sub: (stats?.open_alerts ?? 0) > 0 ? "Require attention" : "All clear", alert: (stats?.open_alerts ?? 0) > 0 },
        ].map((c) => (
          <Link key={c.title} href={c.href} className="group">
            <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06] hover:ring-white/10 hover:bg-white/[0.05] transition-all h-full">
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-medium text-slate-400">{c.title}</span>
                <ArrowUpRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>
              <p className={`text-5xl font-bold tracking-tight leading-none ${c.alert ? "text-red-400" : "text-white"}`}>
                {loading ? <Skeleton className="h-12 w-16" /> : c.value.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
                {c.alert ? <AlertTriangle className="h-3 w-3 text-red-400" /> : <c.icon className="h-3 w-3" />}
                {c.sub}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Row 2: Chart + Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white">Activity Overview</h3>
            <span className="text-xs text-slate-500">Last 7 days</span>
          </div>
          <div className="h-[280px]">
            {loading || trend.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-slate-600">
                {loading ? <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-slate-700 border-t-blue-400 rounded-full animate-spin" />Loading...</div> : "No activity data yet"}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" stroke="#334155" fontSize={11} tickLine={false} axisLine={false} tickFormatter={formatDate} />
                  <YAxis stroke="#334155" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} labelFormatter={formatDate} />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#areaGrad)" name="Events" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />Recent Activity
            </h3>
            <Link href="/dashboard/analytics" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : activity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Activity className="h-8 w-8 text-slate-700 mb-2" />
              <p className="text-sm text-slate-500">No activity yet</p>
              <p className="text-xs text-slate-600 mt-1">Connect the extension to start</p>
            </div>
          ) : (
            <div className="space-y-1">
              {activity.map((item) => {
                const risk = item.ai_tools?.default_risk || "low";
                const userName = item.profiles?.full_name || "Unknown User";
                const initials = userName.split(" ").map((n) => n[0]).join("").slice(0, 2);
                const toolId = item.ai_tools?.id;
                return (
                  <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors">
                    {toolId ? (
                      <img src={getToolIcon(toolId)} alt="" className="h-8 w-8 rounded-lg bg-white/5 p-1 ring-1 ring-white/10" />
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10 text-xs font-semibold text-slate-400 uppercase">{initials}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-medium truncate">{item.ai_tools?.name || "Unknown"}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ring-1 ${riskBadge[risk]}`}>{risk}</span>
                      </div>
                      <p className="text-xs text-slate-500">{userName} · {formatTimeAgo(item.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 3: Tools + Risk + Quick Actions ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Top Tools */}
        <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white">Top AI Tools</h3>
            <Link href="/dashboard/shadow-ai" className="text-xs text-blue-400 hover:text-blue-300">See all</Link>
          </div>
          <div className="h-[200px]">
            {loading || topTools.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-slate-600">{loading ? "Loading..." : "No data yet"}</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topTools} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" stroke="#334155" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={85} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} name="Events" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-6">
          <h3 className="text-sm font-semibold text-white mb-5">Risk Distribution</h3>
          <div className="space-y-5 pt-1">
            {[
              { label: "Low", value: riskDist.low, color: "bg-emerald-500", text: "text-emerald-400" },
              { label: "Medium", value: riskDist.medium, color: "bg-amber-500", text: "text-amber-400" },
              { label: "High", value: riskDist.high, color: "bg-orange-500", text: "text-orange-400" },
              { label: "Critical", value: riskDist.critical, color: "bg-red-500", text: "text-red-400" },
            ].map((item) => {
              const pct = totalRisk > 0 ? (item.value / totalRisk) * 100 : 0;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">{item.label}</span>
                    <span className={`text-sm font-semibold tabular-nums ${item.text}`}>
                      {loading ? "—" : item.value.toLocaleString()}
                      {!loading && totalRisk > 0 && <span className="text-slate-600 text-xs font-normal ml-1">({pct.toFixed(0)}%)</span>}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-6">
          <h3 className="text-sm font-semibold text-white mb-5">Quick Actions</h3>
          <div className="space-y-2.5">
            {[
              { label: "Shadow AI Detection", desc: "View detected AI tools", icon: Eye, href: "/dashboard/shadow-ai", color: "bg-blue-500/10 text-blue-400 ring-blue-500/20" },
              { label: "Manage Policies", desc: "Set allow/block rules", icon: Shield, href: "/dashboard/policies", color: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" },
              { label: "View Alerts", desc: "Check security alerts", icon: Zap, href: "/dashboard/alerts", color: "bg-orange-500/10 text-orange-400 ring-orange-500/20" },
              { label: "Analytics", desc: "Usage trends & insights", icon: TrendingUp, href: "/dashboard/analytics", color: "bg-violet-500/10 text-violet-400 ring-violet-500/20" },
            ].map((a) => (
              <Link key={a.label} href={a.href}>
                <div className="flex items-center gap-3 p-3 rounded-xl ring-1 ring-white/[0.04] hover:ring-white/[0.08] hover:bg-white/[0.03] transition-all group cursor-pointer">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${a.color}`}>
                    <a.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{a.label}</p>
                    <p className="text-xs text-slate-500">{a.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-700 group-hover:text-slate-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
