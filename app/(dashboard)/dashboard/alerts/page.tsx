"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Button from "@/components/ui/button";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Bell, Plus, Check, X, Eye, AlertTriangle, Clock, Zap, Activity, Ban,
  CheckCircle2, XCircle, KeyRound, Timer, UserCheck,
} from "lucide-react";
import type { Alert, AlertRule, AlertRuleCondition, AlertSeverity } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface AccessRequest {
  id: string;
  user_id: string;
  ai_tool_id: string;
  status: string;
  reason: string | null;
  expires_at: string | null;
  created_at: string;
  ai_tools: { name: string; category: string } | null;
  profiles: { full_name: string | null } | null;
  user_email: string;
}

const getToolIcon = (toolId: string): string => {
  const map: Record<string, string> = {
    chatgpt: "chat.openai.com", claude: "claude.ai", gemini: "gemini.google.com",
    midjourney: "midjourney.com", copilot: "github.com", perplexity: "perplexity.ai",
    huggingface: "huggingface.co", stability: "stability.ai",
  };
  return `https://www.google.com/s2/favicons?domain=${map[toolId] || toolId + ".com"}&sz=32`;
};

const sevCfg: Record<string, { badge: string; dot: string }> = {
  low: { badge: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20", dot: "bg-emerald-400" },
  medium: { badge: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20", dot: "bg-amber-400" },
  high: { badge: "bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20", dot: "bg-orange-400" },
  critical: { badge: "bg-red-500/10 text-red-400 ring-1 ring-red-500/20", dot: "bg-red-400" },
};

const ruleTypes: Record<string, { label: string; icon: typeof Ban }> = {
  tool_blocked: { label: "Blocked Tool Access", icon: Ban },
  high_risk_visit: { label: "High Risk Visit", icon: AlertTriangle },
  threshold: { label: "Activity Threshold", icon: Activity },
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("open");
  const [showNewRule, setShowNewRule] = useState(false);
  const [tab, setTab] = useState<"alerts" | "requests" | "rules">("alerts");
  const [creatingRule, setCreatingRule] = useState(false);
  const [grantModal, setGrantModal] = useState<AccessRequest | null>(null);
  const [grantHours, setGrantHours] = useState("1");
  const [granting, setGranting] = useState(false);
  const [newRule, setNewRule] = useState({
    name: "", type: "tool_blocked" as AlertRuleCondition["type"],
    severity: "medium" as AlertSeverity, threshold_count: 10, threshold_window_minutes: 60,
  });
  const [confirmAction, setConfirmAction] = useState<{ type: "resolve" | "dismiss" | "deny"; id: string; title?: string } | null>(null);
  const supabase = createClient();

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/dashboard/alerts?${params}`);
      if (res.ok) setAlerts(await res.json());
    } catch { /* */ } finally { setLoading(false); }
  }, [statusFilter]);

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/alerts/rules");
      if (res.ok) setRules(await res.json());
    } catch { /* */ }
  }, []);

  const fetchAccessRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/access-requests");
      if (res.ok) setAccessRequests(await res.json());
    } catch { /* */ }
  }, []);

  useEffect(() => { fetchAlerts(); fetchRules(); fetchAccessRequests(); }, [fetchAlerts, fetchRules, fetchAccessRequests]);

  useEffect(() => {
    const channel = supabase.channel("alerts-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, () => fetchAlerts())
      .on("postgres_changes", { event: "*", schema: "public", table: "access_requests" }, () => fetchAccessRequests())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, fetchAlerts, fetchAccessRequests]);

  const updateAlertStatus = async (id: string, status: string) => {
    await fetch(`/api/dashboard/alerts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: status as Alert["status"] } : a));
    // Notify the topbar to refresh alert count
    window.dispatchEvent(new Event("neurovault:alerts-updated"));
  };

  const handleGrant = async (action: "approved" | "denied") => {
    if (!grantModal) return;
    setGranting(true);
    await fetch(`/api/dashboard/access-requests/${grantModal.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, expires_in_hours: action === "approved" ? parseFloat(grantHours) : undefined }),
    });
    setGrantModal(null);
    setGranting(false);
    fetchAccessRequests();
  };

  const handleDeny = async (id: string) => {
    await fetch(`/api/dashboard/access-requests/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "denied" }),
    });
    fetchAccessRequests();
  };

  const createRule = async () => {
    setCreatingRule(true);
    const condition: AlertRuleCondition = { type: newRule.type };
    if (newRule.type === "threshold") {
      condition.threshold_count = newRule.threshold_count;
      condition.threshold_window_minutes = newRule.threshold_window_minutes;
    }
    await fetch("/api/dashboard/alerts/rules", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newRule.name, condition, severity: newRule.severity }),
    });
    setShowNewRule(false);
    setNewRule({ name: "", type: "tool_blocked", severity: "medium", threshold_count: 10, threshold_window_minutes: 60 });
    setCreatingRule(false);
    fetchRules();
  };

  const fmt = (d: string) => {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (s < 60) return "Just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  const openCount = alerts.filter((a) => a.status === "open").length;
  const pendingRequests = accessRequests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-8">
      {/* Header + Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[1.7rem] font-bold text-white tracking-tight">Alerts</h1>
          <p className="text-sm text-slate-400 mt-0.5">Security alerts, access requests, and detection rules.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl ring-1 ring-white/[0.06]">
          {([
            { key: "alerts", label: "Alerts", count: openCount },
            { key: "requests", label: "Access Requests", count: pendingRequests },
            { key: "rules", label: "Rules", count: rules.length },
          ] as const).map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === t.key ? "bg-white/[0.08] text-white" : "text-slate-400 hover:text-white"}`}>
              {t.label}
              {t.count > 0 && (
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                  t.key === "alerts" && t.count > 0 ? "bg-red-500/20 text-red-400"
                  : t.key === "requests" && t.count > 0 ? "bg-amber-500/20 text-amber-400"
                  : "bg-white/[0.06] text-slate-500"
                }`}>{t.count}</span>
              )}
            </button>
          ))}
          </div>
        </div>
        {tab === "rules" && (
          <Dialog open={showNewRule} onOpenChange={setShowNewRule}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-9 px-4 text-sm">
                <Plus className="h-3.5 w-3.5 mr-1.5" />Create Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0c0e1a] border-0 ring-1 ring-white/10 text-white max-w-lg rounded-2xl">
              <DialogHeader>
                <DialogTitle>Create Alert Rule</DialogTitle>
                <DialogDescription className="text-slate-400">Define conditions that trigger alerts.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-sm">Name</Label>
                  <Input value={newRule.name} onChange={(e) => setNewRule((r) => ({ ...r, name: e.target.value }))}
                    placeholder="e.g., Blocked tool alert" className="h-10 bg-white/[0.03] border-0 ring-1 ring-white/[0.06] text-white rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-sm">Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.entries(ruleTypes) as [string, { label: string; icon: typeof Ban }][]).map(([k, v]) => {
                      const Icon = v.icon;
                      return (
                        <button key={k} onClick={() => setNewRule((r) => ({ ...r, type: k as AlertRuleCondition["type"] }))}
                          className={`p-3 rounded-xl ring-1 text-center transition-all ${newRule.type === k ? "ring-blue-500/40 bg-blue-500/5 text-white" : "ring-white/[0.06] text-slate-400 hover:bg-white/[0.03]"}`}>
                          <Icon className="h-4 w-4 mx-auto mb-1" />
                          <span className="text-[11px] font-medium">{v.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {newRule.type === "threshold" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-slate-300 text-xs">Events</Label>
                    <Input type="number" value={newRule.threshold_count} onChange={(e) => setNewRule((r) => ({ ...r, threshold_count: +e.target.value || 10 }))}
                      className="h-10 bg-white/[0.03] border-0 ring-1 ring-white/[0.06] text-white rounded-xl mt-1" /></div>
                    <div><Label className="text-slate-300 text-xs">Window (min)</Label>
                    <Input type="number" value={newRule.threshold_window_minutes} onChange={(e) => setNewRule((r) => ({ ...r, threshold_window_minutes: +e.target.value || 60 }))}
                      className="h-10 bg-white/[0.03] border-0 ring-1 ring-white/[0.06] text-white rounded-xl mt-1" /></div>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-sm">Severity</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["low","medium","high","critical"] as AlertSeverity[]).map((s) => (
                      <button key={s} onClick={() => setNewRule((r) => ({ ...r, severity: s }))}
                        className={`py-2 rounded-xl text-xs font-semibold capitalize ring-1 transition-all ${newRule.severity === s ? sevCfg[s].badge + " ring-2" : "ring-white/[0.06] text-slate-400"}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <Button onClick={createRule} disabled={!newRule.name || creatingRule} className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
                  {creatingRule ? "Creating..." : "Create Rule"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* ── ALERTS TAB ── */}
      {tab === "alerts" && (
        <>
          <div className="flex gap-2">
            {["open","acknowledged","resolved","all"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg ring-1 capitalize transition-all ${statusFilter === s ? "bg-white/[0.08] text-white ring-white/[0.12]" : "ring-white/[0.06] text-slate-500 hover:text-white"}`}>{s}</button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white/[0.03] rounded-2xl animate-pulse" />)}</div>
          ) : alerts.length === 0 ? (
            <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] flex flex-col items-center py-20">
              <Bell className="h-8 w-8 text-slate-700 mb-3" />
              <h3 className="text-sm font-semibold text-white mb-1">No {statusFilter === "all" ? "" : statusFilter} alerts</h3>
              <p className="text-xs text-slate-500">{statusFilter === "open" ? "Your organization is looking good!" : "Try a different filter."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {alerts.map((a) => {
                const sc = sevCfg[a.severity] || sevCfg.medium;
                return (
                  <div key={a.id} className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-4 hover:bg-white/[0.04] transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${sc.badge}`}>
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{a.title}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${sc.badge}`}>{a.severity}</span>
                            <span className="text-[10px] text-slate-600">{fmt(a.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      {a.status === "open" && (
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => setConfirmAction({ type: "resolve", id: a.id, title: a.title })} className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-emerald-400 hover:bg-emerald-500/10" title="Resolve"><Check className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setConfirmAction({ type: "dismiss", id: a.id, title: a.title })} className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/5" title="Dismiss"><X className="h-3.5 w-3.5" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── ACCESS REQUESTS TAB ── */}
      {tab === "requests" && (
        <>
          {accessRequests.length === 0 ? (
            <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] flex flex-col items-center py-20">
              <KeyRound className="h-8 w-8 text-slate-700 mb-3" />
              <h3 className="text-sm font-semibold text-white mb-1">No access requests</h3>
              <p className="text-xs text-slate-500">When users try to access blocked tools, their requests will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {accessRequests.map((req) => (
                <div key={req.id} className={`rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-5 transition-all ${req.status !== "pending" ? "opacity-60" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={getToolIcon(req.ai_tool_id)} alt="" className="h-10 w-10 rounded-xl bg-white/5 p-1.5 ring-1 ring-white/10" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{req.profiles?.full_name || "Unknown User"}</span>
                          <span className="text-xs text-slate-600">{req.user_email}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Requesting access to <span className="text-white font-medium">{req.ai_tools?.name || req.ai_tool_id}</span> · {fmt(req.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {req.status === "pending" ? (
                        <>
                          <Button size="sm" onClick={() => setGrantModal(req)} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-8 px-3 text-xs">
                            <Check className="h-3 w-3 mr-1" />Grant
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setConfirmAction({ type: "deny", id: req.id, title: req.ai_tools?.name })} className="text-red-400 hover:bg-red-500/10 rounded-xl h-8 px-3 text-xs">
                            <X className="h-3 w-3 mr-1" />Deny
                          </Button>
                        </>
                      ) : (
                        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-lg ${
                          req.status === "approved" ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20" : "bg-red-500/10 text-red-400 ring-1 ring-red-500/20"
                        }`}>
                          {req.status === "approved" && req.expires_at ? `Expires ${new Date(req.expires_at).toLocaleString()}` : req.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grant modal */}
          <Dialog open={!!grantModal} onOpenChange={(open) => !open && setGrantModal(null)}>
            <DialogContent className="bg-[#0c0e1a] border-0 ring-1 ring-white/10 text-white max-w-sm rounded-2xl">
              <DialogHeader>
                <DialogTitle>Grant Temporary Access</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Allow <span className="text-white font-medium">{grantModal?.profiles?.full_name}</span> to use <span className="text-white font-medium">{grantModal?.ai_tools?.name}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-sm flex items-center gap-1.5"><Timer className="h-3.5 w-3.5" />Access Duration</Label>
                  <Select value={grantHours} onValueChange={setGrantHours}>
                    <SelectTrigger className="h-10 bg-white/[0.03] border-0 ring-1 ring-white/[0.06] text-white rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#0c0e1a] border-0 ring-1 ring-white/10 rounded-xl">
                      <SelectItem value="0.5">30 minutes</SelectItem>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="2">2 hours</SelectItem>
                      <SelectItem value="4">4 hours</SelectItem>
                      <SelectItem value="8">8 hours (full day)</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleGrant("approved")} disabled={granting} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-10">
                    <UserCheck className="h-4 w-4 mr-1.5" />{granting ? "Granting..." : "Grant Access"}
                  </Button>
                  <Button variant="ghost" onClick={() => setGrantModal(null)} className="text-slate-400 hover:text-white rounded-xl h-10 px-4">Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* ── RULES TAB ── */}
      {tab === "rules" && (
        rules.length === 0 ? (
          <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] flex flex-col items-center py-20">
            <Zap className="h-8 w-8 text-slate-700 mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">No rules yet</h3>
            <p className="text-xs text-slate-500">Create rules to automatically trigger alerts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rules.map((rule) => {
              const sc = sevCfg[rule.severity] || sevCfg.medium;
              const rt = ruleTypes[rule.condition.type] || ruleTypes.tool_blocked;
              const Icon = rt.icon;
              return (
                <div key={rule.id} className={`rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-4 ${!rule.enabled ? "opacity-50" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                      <Icon className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{rule.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {rt.label}{rule.condition.type === "threshold" ? ` · ${rule.condition.threshold_count} in ${rule.condition.threshold_window_minutes}min` : ""}
                      </p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${sc.badge}`}>{rule.severity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={
          confirmAction?.type === "resolve" ? "Resolve Alert" :
          confirmAction?.type === "dismiss" ? "Dismiss Alert" :
          "Deny Access Request"
        }
        description={
          confirmAction?.type === "resolve"
            ? `Mark "${confirmAction.title || "this alert"}" as resolved. This indicates the issue has been addressed.`
            : confirmAction?.type === "dismiss"
            ? `Dismiss "${confirmAction.title || "this alert"}". Dismissed alerts won't appear in open alerts. Make sure this is not a real threat.`
            : `Deny access to ${confirmAction?.title || "this tool"}. The employee will not be granted temporary access.`
        }
        confirmLabel={
          confirmAction?.type === "resolve" ? "Resolve" :
          confirmAction?.type === "dismiss" ? "Dismiss" :
          "Deny Access"
        }
        variant={confirmAction?.type === "resolve" ? "info" : confirmAction?.type === "dismiss" ? "warning" : "danger"}
        onConfirm={() => {
          if (!confirmAction) return;
          if (confirmAction.type === "resolve") {
            updateAlertStatus(confirmAction.id, "resolved");
          } else if (confirmAction.type === "dismiss") {
            updateAlertStatus(confirmAction.id, "dismissed");
          } else {
            handleDeny(confirmAction.id);
          }
          setConfirmAction(null);
        }}
      />
    </div>
  );
}