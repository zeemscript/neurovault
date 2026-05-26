"use client";

import { useEffect, useState, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PuzzleIcon,
  Shield01Icon,
  ShieldBanIcon,
  Search01Icon,
  Alert02Icon,
  SecurityCheckIcon,
  Bug01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  ViewIcon,
  ArrowReloadHorizontalIcon,
  User02Icon,
  Globe02Icon,
  LockIcon,
} from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Button from "@/components/ui/button";
import { toast } from "sonner";

interface BrowserExtension {
  id: string;
  org_id: string;
  user_id: string;
  extension_id: string;
  name: string;
  version: string;
  description: string;
  enabled: boolean;
  install_type: string;
  risk_level: string;
  risk_score: number;
  risk_reasons: string[];
  status: string;
  permissions: string[];
  host_permissions: string[];
  homepage_url: string | null;
  update_url: string | null;
  first_seen: string;
  last_seen: string;
  profile: {
    full_name: string;
    avatar_url: string | null;
  };
}

const riskStyles: Record<string, string> = {
  critical: "bg-red-500/10 text-red-400 ring-1 ring-red-500/20",
  high: "bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20",
  medium: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
  low: "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20",
  safe: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
  unknown: "bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20",
};

const statusStyles: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20",
  allowed: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
  blocked: "bg-red-500/10 text-red-400 ring-1 ring-red-500/20",
  monitored: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
};

export default function SafeBrowsingPage() {
  const [extensions, setExtensions] = useState<BrowserExtension[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "high-risk" | "blocked" | "new">("all");
  const [selected, setSelected] = useState<BrowserExtension | null>(null);

  const fetchExtensions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/safe-browsing");
      if (res.ok) setExtensions(await res.json());
    } catch {
      toast.error("Failed to load extensions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExtensions();
  }, [fetchExtensions]);

  const handleAction = async (extensionId: string, action: string) => {
    try {
      const res = await fetch("/api/dashboard/safe-browsing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extensionId, action }),
      });
      if (res.ok) {
        toast.success(`Extension ${action}.`);
        setSelected(null);
        fetchExtensions();
      } else {
        toast.error("Action failed.");
      }
    } catch {
      toast.error("Network error.");
    }
  };

  const filtered = extensions.filter((ext) => {
    const matchesSearch =
      ext.name.toLowerCase().includes(search.toLowerCase()) ||
      ext.extension_id.toLowerCase().includes(search.toLowerCase()) ||
      ext.profile.full_name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === "high-risk") return ext.risk_level === "high" || ext.risk_level === "critical";
    if (activeTab === "blocked") return ext.status === "blocked";
    if (activeTab === "new") return ext.status === "new";
    return true;
  });

  const totalCount = extensions.length;
  const riskyCount = extensions.filter((e) => e.risk_level === "high" || e.risk_level === "critical").length;
  const blockedCount = extensions.filter((e) => e.status === "blocked").length;
  const newCount = extensions.filter((e) => e.status === "new").length;

  const formatTimeAgo = (dateStr: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 ring-1 ring-blue-500/20">
            <HugeiconsIcon icon={PuzzleIcon} className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Safe Browsing</h1>
            <p className="text-sm text-slate-500">
              Detect and manage risky browser extensions across your organization.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Extensions", value: totalCount, icon: PuzzleIcon, iconColor: "text-blue-400 bg-blue-600/10 ring-blue-500/20" },
          { label: "Risky", value: riskyCount, icon: Bug01Icon, iconColor: riskyCount > 0 ? "text-red-400 bg-red-600/10 ring-red-500/20" : "text-slate-400 bg-white/5 ring-white/10" },
          { label: "Blocked", value: blockedCount, icon: ShieldBanIcon, iconColor: "text-amber-400 bg-amber-600/10 ring-amber-500/20" },
          { label: "New / Unreviewed", value: newCount, icon: Alert02Icon, iconColor: newCount > 0 ? "text-blue-400 bg-blue-600/10 ring-blue-500/20" : "text-slate-400 bg-white/5 ring-white/10" },
        ].map((c, idx) => (
          <div key={idx} className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{c.label}</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl ring-1 ${c.iconColor}`}>
                <HugeiconsIcon icon={c.icon} className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold tracking-tight text-white">{loading ? "—" : c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center bg-white/[0.02] ring-1 ring-white/[0.06] rounded-xl p-1 gap-0.5">
          {[
            { id: "all", label: "All" },
            { id: "high-risk", label: "High Risk" },
            { id: "blocked", label: "Blocked" },
            { id: "new", label: "New" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-sm flex-1">
          <HugeiconsIcon icon={Search01Icon} className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search extensions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-white/[0.03] border-0 ring-1 ring-white/[0.06] text-white placeholder:text-slate-600 focus:ring-blue-500/40 rounded-xl w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
              Scanning extensions...
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 mb-4">
              <HugeiconsIcon icon={PuzzleIcon} className="h-7 w-7 text-slate-600" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">
              {extensions.length === 0 ? "No extensions detected yet" : "No matching extensions"}
            </h3>
            <p className="text-sm text-slate-500 max-w-md">
              {extensions.length === 0
                ? "Extensions will appear as the Chrome extension scans connected browsers."
                : "Try adjusting your search or filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-4">Extension</th>
                  <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-4">User</th>
                  <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-4 text-center">Install</th>
                  <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-4 text-center">Permissions</th>
                  <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-4 text-center">Risk</th>
                  <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-4 text-center">Status</th>
                  <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filtered.map((ext) => (
                  <tr key={ext.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <span className="text-sm font-semibold text-white block">{ext.name}</span>
                        <span className="text-[10px] text-slate-600 font-mono">{ext.version} · {ext.extension_id.slice(0, 12)}...</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/5 ring-1 ring-white/10 text-[9px] font-bold text-slate-400">
                          {ext.profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm text-slate-300">{ext.profile.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-xs text-slate-400 capitalize">{ext.install_type}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-xs text-slate-400">{ext.permissions.length + ext.host_permissions.length}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-lg capitalize ${riskStyles[ext.risk_level]}`}>
                        {ext.risk_level}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-lg capitalize ${statusStyles[ext.status]}`}>
                        {ext.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        onClick={() => setSelected(ext)}
                        className="bg-white/5 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg h-8 px-3 ring-1 ring-white/10 hover:ring-blue-500 transition-all text-xs font-semibold cursor-pointer"
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="bg-[#0a0c15] border border-white/10 text-white max-w-lg rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <HugeiconsIcon icon={PuzzleIcon} className="h-5 w-5 text-blue-400" />
              Extension Details
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Review permissions and manage this extension.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-5 pt-4">
              {/* Extension info */}
              <div className="p-4 rounded-xl bg-white/[0.03] ring-1 ring-white/[0.05] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{selected.name}</h4>
                    <p className="text-xs text-slate-500 font-mono">{selected.extension_id}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg capitalize ${riskStyles[selected.risk_level]}`}>
                    {selected.risk_level} ({selected.risk_score}/100)
                  </span>
                </div>

                {selected.description && (
                  <p className="text-xs text-slate-400 leading-relaxed">{selected.description}</p>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Version</span>
                    <span className="text-white block mt-0.5">{selected.version}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Install Type</span>
                    <span className="text-white block mt-0.5 capitalize">{selected.install_type}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">User</span>
                    <span className="text-white block mt-0.5">{selected.profile.full_name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Last Seen</span>
                    <span className="text-white block mt-0.5">{formatTimeAgo(selected.last_seen)}</span>
                  </div>
                </div>
              </div>

              {/* Risk reasons */}
              {selected.risk_reasons.length > 0 && (
                <div className="p-4 rounded-xl bg-red-500/5 ring-1 ring-red-500/10 space-y-2">
                  <h5 className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">Risk Factors</h5>
                  <ul className="space-y-1">
                    {selected.risk_reasons.map((reason, i) => (
                      <li key={i} className="text-xs text-red-300 flex items-start gap-2">
                        <HugeiconsIcon icon={Alert02Icon} className="h-3.5 w-3.5 mt-0.5 shrink-0 text-red-400" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Permissions */}
              {(selected.permissions.length > 0 || selected.host_permissions.length > 0) && (
                <div className="p-4 rounded-xl bg-white/[0.02] ring-1 ring-white/[0.05] space-y-2">
                  <h5 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Permissions ({selected.permissions.length + selected.host_permissions.length})
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.permissions.map((p) => (
                      <span key={p} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300 ring-1 ring-white/10">
                        {p}
                      </span>
                    ))}
                    {selected.host_permissions.map((h) => (
                      <span key={h} className="text-[10px] px-2 py-0.5 rounded bg-amber-500/5 text-amber-300 ring-1 ring-amber-500/10 font-mono">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2.5">
                <button
                  onClick={() => handleAction(selected.id, "allowed")}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-600 hover:border-emerald-600 transition-all text-left group cursor-pointer"
                >
                  <div>
                    <h5 className="text-sm font-bold text-white">Allow</h5>
                    <p className="text-xs text-slate-400 group-hover:text-emerald-100">Mark as trusted for this organization.</p>
                  </div>
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-emerald-400 group-hover:text-white" />
                </button>

                <button
                  onClick={() => handleAction(selected.id, "monitored")}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/5 transition-all text-left group cursor-pointer"
                >
                  <div>
                    <h5 className="text-sm font-bold text-white">Monitor</h5>
                    <p className="text-xs text-slate-400">Keep tracking this extension.</p>
                  </div>
                  <HugeiconsIcon icon={ViewIcon} className="h-4 w-4 text-slate-400 group-hover:text-white" />
                </button>

                <button
                  onClick={() => handleAction(selected.id, "blocked")}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-600 hover:border-red-600 transition-all text-left group cursor-pointer"
                >
                  <div>
                    <h5 className="text-sm font-bold text-white">Block</h5>
                    <p className="text-xs text-slate-400 group-hover:text-red-100">Flag as blocked across the organization.</p>
                  </div>
                  <HugeiconsIcon icon={ShieldBanIcon} className="h-4 w-4 text-red-400 group-hover:text-white" />
                </button>
              </div>

              <Button
                variant="outline"
                onClick={() => setSelected(null)}
                className="w-full h-9 border-white/10 hover:bg-white/5 text-slate-300 rounded-xl"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
