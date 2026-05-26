"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Button from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShieldCheck,
  Plus,
  Shield,
  Ban,
  AlertTriangle,
  Eye,
  Layers,
  Target,
} from "lucide-react";
import type { PolicyAction } from "@/types";

interface PolicyItem {
  id: string;
  ai_tool_id: string | null;
  category: string | null;
  action: string;
  reason: string | null;
  enabled: boolean;
  created_at: string;
  ai_tools: { name: string } | null;
}

const getToolIcon = (toolId: string): string => {
  const domainMap: Record<string, string> = {
    chatgpt: "chat.openai.com", claude: "claude.ai", gemini: "gemini.google.com",
    midjourney: "midjourney.com", copilot: "github.com", perplexity: "perplexity.ai",
    huggingface: "huggingface.co", replicate: "replicate.com", stability: "stability.ai",
    jasper: "jasper.ai", writesonic: "writesonic.com", "copy-ai": "copy.ai",
    "notion-ai": "notion.so", cursor: "cursor.com", v0: "v0.dev",
  };
  const domain = domainMap[toolId] || `${toolId}.com`;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
};

const actionConfig: Record<string, { label: string; icon: typeof Eye; badge: string; cardRing: string }> = {
  monitor: {
    label: "Monitor",
    icon: Eye,
    badge: "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20",
    cardRing: "ring-blue-500/10 hover:ring-blue-500/20",
  },
  warn: {
    label: "Warn",
    icon: AlertTriangle,
    badge: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
    cardRing: "ring-amber-500/10 hover:ring-amber-500/20",
  },
  block: {
    label: "Block",
    icon: Ban,
    badge: "bg-red-500/10 text-red-400 ring-1 ring-red-500/20",
    cardRing: "ring-red-500/10 hover:ring-red-500/20",
  },
};

const categoryLabels: Record<string, string> = {
  llm: "All LLM Tools", "image-gen": "All Image Gen Tools", code: "All Code Tools",
  search: "All Search Tools", writing: "All Writing Tools",
  "ml-platform": "All ML Platforms", productivity: "All Productivity Tools",
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<PolicyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    ai_tool_id: "", category: "", action: "monitor" as PolicyAction, reason: "",
  });

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/policies");
      if (res.ok) setPolicies(await res.json());
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPolicies(); }, [fetchPolicies]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/dashboard/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ai_tool_id: newPolicy.ai_tool_id || null,
          category: newPolicy.category || null,
          action: newPolicy.action,
          reason: newPolicy.reason || null,
        }),
      });
      if (res.ok) {
        setShowCreate(false);
        setNewPolicy({ ai_tool_id: "", category: "", action: "monitor", reason: "" });
        fetchPolicies();
      }
    } catch { /* */ } finally { setCreating(false); }
  };

  const getPolicyLabel = (p: PolicyItem) => {
    if (p.ai_tools?.name) return p.ai_tools.name;
    if (p.category) return categoryLabels[p.category] || p.category;
    return "All Tools";
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  // Group by action type
  const grouped = {
    block: policies.filter((p) => p.action === "block"),
    warn: policies.filter((p) => p.action === "warn"),
    monitor: policies.filter((p) => p.action === "monitor"),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[1.7rem] font-bold text-white tracking-tight">Policies</h1>
          <p className="text-sm text-slate-400 mt-1">Define rules to monitor, warn, or block AI tool usage across your organization.</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-10 px-5">
              <Plus className="h-4 w-4 mr-2" />Create Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0c0e1a] border-0 ring-1 ring-white/10 text-white max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-white text-lg">Create New Policy</DialogTitle>
              <DialogDescription className="text-slate-400">Set rules for how AI tools are handled in your organization.</DialogDescription>
            </DialogHeader>
            <div className="space-y-5 pt-3">
              {/* Action selection — visual cards */}
              <div>
                <Label className="text-slate-300 text-sm mb-3 block">Action</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(["monitor", "warn", "block"] as PolicyAction[]).map((act) => {
                    const config = actionConfig[act];
                    const Icon = config.icon;
                    const selected = newPolicy.action === act;
                    return (
                      <button
                        key={act}
                        type="button"
                        onClick={() => setNewPolicy((p) => ({ ...p, action: act }))}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl ring-1 transition-all ${
                          selected
                            ? `${config.badge} ring-2`
                            : "ring-white/[0.06] text-slate-400 hover:ring-white/[0.12] hover:bg-white/[0.03]"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs font-semibold">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-sm">Target AI Tool <span className="text-slate-500 font-normal">(optional)</span></Label>
                <Input
                  value={newPolicy.ai_tool_id}
                  onChange={(e) => setNewPolicy((p) => ({ ...p, ai_tool_id: e.target.value }))}
                  placeholder="e.g., chatgpt, midjourney, claude"
                  className="h-11 bg-white/[0.03] border-0 ring-1 ring-white/[0.06] text-white placeholder:text-slate-600 focus:ring-blue-500/40 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-sm">Or target a category</Label>
                <Select value={newPolicy.category} onValueChange={(v) => setNewPolicy((p) => ({ ...p, category: v }))}>
                  <SelectTrigger className="h-11 bg-white/[0.03] border-0 ring-1 ring-white/[0.06] text-white rounded-xl">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c0e1a] border-0 ring-1 ring-white/10 rounded-xl">
                    {Object.entries(categoryLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k} className="text-slate-300 focus:bg-white/5 focus:text-white rounded-lg">{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-sm">Reason</Label>
                <Input
                  value={newPolicy.reason}
                  onChange={(e) => setNewPolicy((p) => ({ ...p, reason: e.target.value }))}
                  placeholder="Why this policy exists..."
                  className="h-11 bg-white/[0.03] border-0 ring-1 ring-white/[0.06] text-white placeholder:text-slate-600 focus:ring-blue-500/40 rounded-xl"
                />
              </div>

              <Button
                onClick={handleCreate}
                disabled={creating || !newPolicy.action}
                className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl"
              >
                {creating ? "Creating..." : "Create Policy"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-5">
        {[
          { label: "Block", count: grouped.block.length, icon: Ban, color: "text-red-400 bg-red-500/10 ring-red-500/20" },
          { label: "Warn", count: grouped.warn.length, icon: AlertTriangle, color: "text-amber-400 bg-amber-500/10 ring-amber-500/20" },
          { label: "Monitor", count: grouped.monitor.length, icon: Eye, color: "text-blue-400 bg-blue-500/10 ring-blue-500/20" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-5 flex items-center gap-4">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{loading ? "—" : s.count}</p>
              <p className="text-xs text-slate-500">{s.label} policies</p>
            </div>
          </div>
        ))}
      </div>

      {/* Policies list */}
      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white/[0.03] rounded-2xl animate-pulse" />)}</div>
      ) : policies.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] flex flex-col items-center justify-center py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 mb-4">
            <Shield className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">No policies yet</h3>
          <p className="text-sm text-slate-500 max-w-sm text-center">Create policies to control how AI tools are used in your organization.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {policies.map((policy) => {
            const config = actionConfig[policy.action] || actionConfig.monitor;
            const Icon = config.icon;
            return (
              <div
                key={policy.id}
                className={`rounded-2xl bg-white/[0.03] ring-1 ${config.cardRing} p-5 transition-all ${!policy.enabled ? "opacity-50" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {policy.ai_tool_id ? (
                      <img src={getToolIcon(policy.ai_tool_id)} alt="" className="h-10 w-10 rounded-xl bg-white/5 p-1.5 ring-1 ring-white/10" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                        <Layers className="h-5 w-5 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-sm font-semibold text-white">{getPolicyLabel(policy)}</h3>
                        {policy.ai_tool_id && (
                          <span className="text-[10px] text-slate-500 bg-white/[0.04] ring-1 ring-white/[0.06] px-2 py-0.5 rounded-md">
                            <Target className="h-2.5 w-2.5 inline mr-1" />Tool-specific
                          </span>
                        )}
                        {!policy.ai_tool_id && policy.category && (
                          <span className="text-[10px] text-slate-500 bg-white/[0.04] ring-1 ring-white/[0.06] px-2 py-0.5 rounded-md">
                            <Layers className="h-2.5 w-2.5 inline mr-1" />Category-wide
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{policy.reason || "No reason specified"} · Created {formatDate(policy.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg ${config.badge}`}>
                      <Icon className="h-3 w-3" />
                      {config.label}
                    </span>
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-lg ${policy.enabled ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20" : "bg-white/[0.04] text-slate-500 ring-1 ring-white/[0.06]"}`}>
                      {policy.enabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
