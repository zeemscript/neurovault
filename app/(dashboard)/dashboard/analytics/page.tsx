"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ActivityIcon,
  EyeIcon,
  User02Icon,
  Shield01Icon,
  Analytics01Icon,
  Calendar01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
  ChartLegend, ChartLegendContent, type ChartConfig,
} from "@/components/ui/chart";

interface AnalyticsData {
  daily_trend: { date: string; count: number }[];
  tool_breakdown: {
    tool_id: string; name: string; category: string; risk: string; count: number;
  }[];
  category_breakdown: { category: string; count: number }[];
  event_type_breakdown: { type: string; count: number }[];
  top_users: { user_id: string; count: number }[];
  risk_distribution: { low: number; medium: number; high: number; critical: number };
  total_events: number;
  period_days: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  llm: "hsl(217, 91%, 60%)", "image-gen": "hsl(263, 90%, 51%)",
  code: "hsl(160, 84%, 39%)", search: "hsl(38, 92%, 50%)",
  writing: "hsl(330, 81%, 60%)", "ml-platform": "hsl(189, 94%, 43%)",
  productivity: "hsl(239, 84%, 67%)", unknown: "hsl(215, 16%, 47%)",
};

const CATEGORY_LABELS: Record<string, string> = {
  llm: "LLM", "image-gen": "Image Gen", code: "Code", search: "Search",
  writing: "Writing", "ml-platform": "ML Platform", productivity: "Productivity",
};

const trendConfig = {
  count: { label: "Events", color: "hsl(217, 91%, 60%)" },
} satisfies ChartConfig;

const riskConfig = {
  low: { label: "Low", color: "hsl(142, 71%, 45%)" },
  medium: { label: "Medium", color: "hsl(38, 92%, 50%)" },
  high: { label: "High", color: "hsl(25, 95%, 53%)" },
  critical: { label: "Critical", color: "hsl(0, 84%, 60%)" },
} satisfies ChartConfig;

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/analytics?days=${days}`);
      if (res.ok) setData(await res.json());
    } catch { /* */ } finally { setLoading(false); }
  }, [days]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Derived data
  const riskPieData = data
    ? Object.entries(data.risk_distribution)
        .filter(([, v]) => v > 0)
        .map(([key, value]) => ({ name: key, value, fill: `var(--color-${key})` }))
    : [];

  const categoryPieData = (data?.category_breakdown || []).map((c) => ({
    name: CATEGORY_LABELS[c.category] || c.category,
    value: c.count,
    fill: CATEGORY_COLORS[c.category] || CATEGORY_COLORS.unknown,
  }));

  const categoryConfig = Object.fromEntries(
    categoryPieData.map((c) => [c.name, { label: c.name, color: c.fill }])
  ) satisfies ChartConfig;

  const toolBarData = data?.tool_breakdown.slice(0, 8).map((t) => ({
    ...t,
    fill: CATEGORY_COLORS[t.category] || CATEGORY_COLORS.unknown,
  })) || [];

  const toolConfig = Object.fromEntries(
    toolBarData.map((t) => [t.name, { label: t.name, color: t.fill }])
  ) satisfies ChartConfig;

  // Event type radial data
  const eventTypeData = (data?.event_type_breakdown || []).map((item, i) => {
    const colors = ["hsl(217, 91%, 60%)", "hsl(263, 90%, 51%)", "hsl(160, 84%, 39%)", "hsl(38, 92%, 50%)", "hsl(330, 81%, 60%)", "hsl(189, 94%, 43%)"];
    const pct = data && data.total_events > 0 ? (item.count / data.total_events) * 100 : 0;
    return { name: item.type, value: pct, count: item.count, fill: colors[i % colors.length] };
  });

  const eventConfig = Object.fromEntries(
    eventTypeData.map((e) => [e.name, { label: e.name.charAt(0).toUpperCase() + e.name.slice(1), color: e.fill }])
  ) satisfies ChartConfig;

  const totalRisk = data ? Object.values(data.risk_distribution).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 ring-1 ring-blue-500/20">
            <HugeiconsIcon icon={Analytics01Icon} className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Analytics</h1>
            <p className="text-sm text-slate-500">AI usage trends, risk analysis, and security insights.</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-white/[0.03] p-1 rounded-xl ring-1 ring-white/[0.06]">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                days === d ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white/[0.03] rounded-2xl ring-1 ring-white/[0.06] animate-pulse" />
          ))}
        </div>
      ) : !data ? (
        <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] flex flex-col items-center py-20">
          <HugeiconsIcon icon={Analytics01Icon} className="h-8 w-8 text-slate-700 mb-3" />
          <h3 className="text-sm font-semibold text-white mb-1">No analytics data</h3>
          <p className="text-xs text-slate-500">Activity data will appear once the extension starts reporting.</p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Events", value: data.total_events.toLocaleString(), icon: ActivityIcon, color: "blue" },
              { label: "AI Tools Used", value: data.tool_breakdown.length.toString(), icon: EyeIcon, color: "blue" },
              { label: "Active Users", value: data.top_users.length.toString(), icon: User02Icon, color: "blue" },
              {
                label: "High Risk Events",
                value: (data.risk_distribution.high + data.risk_distribution.critical).toLocaleString(),
                icon: Shield01Icon,
                color: "orange",
              },
            ].map((stat, i) => (
              <div key={i} className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.color === "orange" ? "bg-orange-600/10" : "bg-blue-600/10"}`}>
                    <HugeiconsIcon icon={stat.icon} className={`h-4 w-4 ${stat.color === "orange" ? "text-orange-400" : "text-blue-400"}`} />
                  </div>
                </div>
                <p className={`text-2xl font-bold ${stat.color === "orange" ? "text-orange-400" : "text-white"}`}>{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Daily Trend — Full Width */}
          <Card className="bg-white/[0.03] border-0 ring-1 ring-white/[0.06] rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-white/[0.04] pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-base font-semibold">Daily Activity Trend</CardTitle>
                  <CardDescription className="text-slate-500 text-xs mt-0.5">Events per day over the selected period</CardDescription>
                </div>
                <span className="text-[11px] text-slate-600 flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1 rounded-lg ring-1 ring-white/[0.04]">
                  <HugeiconsIcon icon={Calendar01Icon} className="h-3 w-3" />
                  Last {days} days
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-6 px-2 sm:px-6">
              <ChartContainer config={trendConfig} className="aspect-auto h-[250px] w-full">
                <AreaChart data={data.daily_trend}>
                  <defs>
                    <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date" tickLine={false} axisLine={false}
                    tickMargin={8} minTickGap={32}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => {
                          return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                        }}
                        indicator="dot"
                      />
                    }
                  />
                  <Area
                    dataKey="count" type="natural"
                    fill="url(#fillCount)" stroke="var(--color-count)"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Row: Top AI Tools + Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tool Usage — 2 cols */}
            <Card className="lg:col-span-2 bg-white/[0.03] border-0 ring-1 ring-white/[0.06] rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-white/[0.04] pb-4">
                <CardTitle className="text-white text-base font-semibold">Top AI Tools</CardTitle>
                <CardDescription className="text-slate-500 text-xs mt-0.5">Most used AI applications by event count</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ChartContainer config={toolConfig} className="h-[300px] w-full">
                  <BarChart data={toolBarData} layout="vertical" accessibilityLayer margin={{ left: 10 }}>
                    <CartesianGrid horizontal={false} stroke="hsl(215, 20%, 15%)" />
                    <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} stroke="hsl(215, 16%, 35%)" />
                    <YAxis
                      dataKey="name" type="category"
                      tickLine={false} axisLine={false}
                      fontSize={11} stroke="hsl(215, 16%, 35%)" width={90}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Events">
                      {toolBarData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Category Donut — 1 col */}
            <Card className="bg-white/[0.03] border-0 ring-1 ring-white/[0.06] rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-white/[0.04] pb-4">
                <CardTitle className="text-white text-base font-semibold">Categories</CardTitle>
                <CardDescription className="text-slate-500 text-xs mt-0.5">AI tool usage by category</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ChartContainer config={categoryConfig} className="mx-auto aspect-square h-[220px]">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                    <Pie
                      data={categoryPieData} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                      paddingAngle={3} strokeWidth={0}
                    >
                      {categoryPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                {/* Legend */}
                <div className="grid grid-cols-2 gap-2 mt-2 px-2">
                  {categoryPieData.map((c) => (
                    <div key={c.name} className="flex items-center gap-2 text-xs">
                      <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: c.fill }} />
                      <span className="text-slate-400 truncate">{c.name}</span>
                      <span className="text-white font-medium ml-auto">{c.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row: Risk Distribution + Event Types */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution */}
            <Card className="bg-white/[0.03] border-0 ring-1 ring-white/[0.06] rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-white/[0.04] pb-4">
                <CardTitle className="text-white text-base font-semibold">Risk Distribution</CardTitle>
                <CardDescription className="text-slate-500 text-xs mt-0.5">Event severity breakdown</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ChartContainer config={riskConfig} className="mx-auto aspect-square h-[220px]">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                    <Pie
                      data={riskPieData} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" innerRadius={50} outerRadius={85}
                      paddingAngle={3} strokeWidth={0}
                    />
                    <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                  </PieChart>
                </ChartContainer>
                {/* Risk counts below */}
                <div className="grid grid-cols-4 gap-3 mt-4 px-1">
                  {Object.entries(data.risk_distribution).map(([key, value]) => {
                    const cfg = riskConfig[key as keyof typeof riskConfig];
                    const pct = totalRisk > 0 ? ((value / totalRisk) * 100).toFixed(0) : "0";
                    return (
                      <div key={key} className="text-center">
                        <p className="text-lg font-bold text-white">{value}</p>
                        <p className="text-[10px] font-medium capitalize" style={{ color: cfg?.color }}>{key}</p>
                        <p className="text-[10px] text-slate-600">{pct}%</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Event Types */}
            <Card className="bg-white/[0.03] border-0 ring-1 ring-white/[0.06] rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-white/[0.04] pb-4">
                <CardTitle className="text-white text-base font-semibold">Event Types</CardTitle>
                <CardDescription className="text-slate-500 text-xs mt-0.5">Breakdown by event category</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {data.event_type_breakdown.map((item) => {
                    const pct = data.total_events > 0 ? (item.count / data.total_events) * 100 : 0;
                    return (
                      <div key={item.type}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-300 capitalize font-medium">{item.type}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white font-semibold tabular-nums">
                              {item.count.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-600 bg-white/[0.04] px-1.5 py-0.5 rounded-md tabular-nums">
                              {pct.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {data.event_type_breakdown.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-10">No event data yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
