"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Eye,
  Search,
  Activity,
  Users,
  ShieldOff,
  ArrowUpDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

interface DetectedTool {
  id: string;
  name: string;
  category: string;
  risk: string;
  total_visits: number;
  unique_users: number;
  last_seen: string;
  policy_action: string;
  active_sessions: number;
  active_users: number;
}

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
  low: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
  high: "bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20",
  critical: "bg-red-500/10 text-red-400 ring-1 ring-red-500/20",
};

const policyBadge: Record<string, string> = {
  monitor: "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20",
  warn: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
  block: "bg-red-500/10 text-red-400 ring-1 ring-red-500/20",
  none: "bg-white/[0.04] text-slate-500 ring-1 ring-white/[0.06]",
};

const categoryLabels: Record<string, string> = {
  llm: "LLM",
  "image-gen": "Image Gen",
  code: "Code",
  search: "Search",
  writing: "Writing",
  "ml-platform": "ML Platform",
  productivity: "Productivity",
  unknown: "Unknown",
};

const categoryDot: Record<string, string> = {
  llm: "bg-blue-400",
  "image-gen": "bg-violet-400",
  code: "bg-emerald-400",
  search: "bg-amber-400",
  writing: "bg-pink-400",
  "ml-platform": "bg-cyan-400",
  productivity: "bg-indigo-400",
  unknown: "bg-slate-400",
};

export default function ShadowAiPage() {
  const [tools, setTools] = useState<DetectedTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  const fetchTools = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/shadow-ai");
      if (res.ok) setTools(await res.json());
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTools(); }, [fetchTools]);

  // Realtime refresh
  useEffect(() => {
    const channel = supabase
      .channel("shadow-ai-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_events" }, () => fetchTools())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, fetchTools]);

  const filtered = tools.filter(
    (t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalVisits = tools.reduce((s, t) => s + t.total_visits, 0);
  const blockedCount = tools.filter((t) => t.policy_action === "block").length;

  const formatTimeAgo = (dateStr: string) => {
    const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (s < 60) return "Just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[1.7rem] font-bold text-white tracking-tight">Shadow AI Detection</h1>
          <p className="text-sm text-slate-400 mt-1">Monitor and manage AI tools used across your organization.</p>
        </div>
        <span className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/8 px-3.5 py-2 rounded-full ring-1 ring-emerald-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          Live Monitoring
        </span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        {[
          { label: "AI Tools Detected", value: tools.length, icon: Eye, iconColor: "text-blue-400 bg-blue-500/10 ring-blue-500/20" },
          { label: "Total Visits", value: totalVisits, icon: Activity, iconColor: "text-violet-400 bg-violet-500/10 ring-violet-500/20" },
          { label: "Max Users on Tool", value: Math.max(0, ...tools.map((t) => t.unique_users)), icon: Users, iconColor: "text-cyan-400 bg-cyan-500/10 ring-cyan-500/20" },
          { label: "Blocked Tools", value: blockedCount, icon: ShieldOff, iconColor: "text-red-400 bg-red-500/10 ring-red-500/20", alert: blockedCount > 0 },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${c.iconColor}`}>
                <c.icon className="h-4 w-4" />
              </div>
              <span className="text-sm text-slate-400">{c.label}</span>
            </div>
            <p className={`text-3xl font-bold tracking-tight ${c.alert ? "text-red-400" : "text-white"}`}>
              {loading ? "—" : c.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Search AI tools..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 bg-white/[0.03] border-0 ring-1 ring-white/[0.06] text-white placeholder:text-slate-500 focus:ring-blue-500/40 rounded-xl"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-sm text-slate-600">
            <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-slate-700 border-t-blue-400 rounded-full animate-spin" />Loading...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 mb-4">
              <Eye className="h-7 w-7 text-slate-600" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">{tools.length === 0 ? "No AI tools detected yet" : "No matching tools"}</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              {tools.length === 0 ? "Connect the browser extension and visit AI tools to start detecting them." : "Try a different search term."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {["Tool", "Status", "Category", "Visits", "Users", "Last Seen", "Risk", "Policy"].map((h) => (
                    <th key={h} className={`text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-4 ${["Visits", "Users"].includes(h) ? "text-right" : ["Risk", "Policy", "Status"].includes(h) ? "text-center" : "text-left"}`}>
                      <span className="inline-flex items-center gap-1">{h}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((tool, i) => (
                  <tr key={tool.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={getToolIcon(tool.id)}
                          alt={tool.name}
                          className="h-9 w-9 rounded-xl bg-white/5 p-1.5 ring-1 ring-white/10 group-hover:ring-white/20 transition-all"
                        />
                        <span className="text-sm font-medium text-white">{tool.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {tool.active_sessions > 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                          </span>
                          {tool.active_sessions} active
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white/[0.03] text-slate-500 ring-1 ring-white/[0.05]">
                          Idle
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 text-sm text-slate-300">
                        <span className={`h-2 w-2 rounded-full ${categoryDot[tool.category] || categoryDot.unknown}`} />
                        {categoryLabels[tool.category] || tool.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-semibold tabular-nums text-white">{tool.total_visits.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm tabular-nums text-slate-300">{tool.unique_users}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-500">{formatTimeAgo(tool.last_seen)}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex text-[11px] font-medium px-2.5 py-1 rounded-lg ${riskBadge[tool.risk] || riskBadge.medium}`}>
                        {tool.risk}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex text-[11px] font-medium px-2.5 py-1 rounded-lg ${policyBadge[tool.policy_action] || policyBadge.none}`}>
                        {tool.policy_action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
