"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { Label } from "@/components/ui/label";
import Button from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building06Icon,
  GlobeIcon,
  Key01Icon,
  Copy01Icon,
  CheckmarkCircle02Icon,
  ChromeIcon,
  Shield01Icon,
  Delete02Icon,
  PlusSignIcon,
  ComputerIcon,
  SecurityCheckIcon,
  ApiIcon,
  Settings01Icon,
  LinkSquare01Icon,
} from "@hugeicons/core-free-icons";

interface ExtensionToken {
  id: string;
  token: string;
  device_info: Record<string, unknown>;
  is_active: boolean;
  last_seen_at: string | null;
  created_at: string;
}

export default function SettingsPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [tokens, setTokens] = useState<ExtensionToken[]>([]);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState("");
  const [orgDomain, setOrgDomain] = useState("");
  const [savingOrg, setSavingOrg] = useState(false);
  const [orgSaved, setOrgSaved] = useState(false);

  // Enrollment state
  interface EnrollLink { id: string; code: string; label: string | null; max_uses: number | null; used_count: number; expires_at: string | null; is_active: boolean; created_at: string; }
  const [enrollLinks, setEnrollLinks] = useState<EnrollLink[]>([]);
  const [creatingLink, setCreatingLink] = useState(false);
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkMaxUses, setNewLinkMaxUses] = useState("");
  const [newLinkExpiry, setNewLinkExpiry] = useState("");
  const [showCreateLink, setShowCreateLink] = useState(false);
  const [bulkEmails, setBulkEmails] = useState("");
  const [bulkInviting, setBulkInviting] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ urls: { email: string; url: string }[] } | null>(null);

  // Confirmation dialog state
  const [confirmAction, setConfirmAction] = useState<{ type: "revoke-token" | "revoke-link"; id: string } | null>(null);

  // Fetch org data
  const fetchOrg = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/organization");
      if (res.ok) {
        const data = await res.json();
        setOrgName(data.name || "");
        setOrgDomain(data.domain || "");
      }
    } catch { /* */ }
  }, []);

  useEffect(() => { fetchOrg(); }, [fetchOrg]);

  const handleSaveOrg = async () => {
    setSavingOrg(true);
    setOrgSaved(false);
    try {
      const res = await fetch("/api/dashboard/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName, domain: orgDomain }),
      });
      if (res.ok) {
        setOrgSaved(true);
        setTimeout(() => setOrgSaved(false), 2000);
      }
    } catch { /* */ } finally { setSavingOrg(false); }
  };

  const fetchTokens = useCallback(async () => {
    try {
      const res = await fetch("/api/extension/tokens");
      if (res.ok) setTokens(await res.json());
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  const fetchEnrollLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/enrollment-links");
      if (res.ok) setEnrollLinks(await res.json());
    } catch { /* */ }
  }, []);

  useEffect(() => { fetchTokens(); fetchEnrollLinks(); }, [fetchTokens, fetchEnrollLinks]);

  const handleCreateLink = async () => {
    setCreatingLink(true);
    try {
      const res = await fetch("/api/dashboard/enrollment-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: newLinkLabel || undefined,
          maxUses: newLinkMaxUses ? parseInt(newLinkMaxUses) : undefined,
          expiresInDays: newLinkExpiry ? parseInt(newLinkExpiry) : undefined,
        }),
      });
      if (res.ok) {
        setShowCreateLink(false);
        setNewLinkLabel("");
        setNewLinkMaxUses("");
        setNewLinkExpiry("");
        fetchEnrollLinks();
      }
    } catch { /* */ } finally { setCreatingLink(false); }
  };

  const handleRevokeLink = async (id: string) => {
    await fetch(`/api/dashboard/enrollment-links/${id}`, { method: "DELETE" });
    setEnrollLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const handleBulkInvite = async () => {
    // Deduplicate, lowercase, filter valid emails
    const raw = bulkEmails.split(/[\n,]/).map((e) => e.trim().toLowerCase()).filter((e) => e.includes("@"));
    const emails = [...new Set(raw)];
    if (emails.length === 0) return;
    setBulkInviting(true);
    setBulkResult(null);
    try {
      const res = await fetch("/api/dashboard/employees/bulk-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });
      if (res.ok) {
        const data = await res.json();
        setBulkResult({ urls: data.enrollmentUrls });
        setBulkEmails("");
        fetchEnrollLinks();
      }
    } catch { /* */ } finally { setBulkInviting(false); }
  };

  const getEnrollUrl = (code: string) => `${window.location.origin}/enroll/${code}`;

  const handleGenerateToken = async () => {
    setGenerating(true);
    setNewToken(null);
    try {
      const res = await fetch("/api/extension/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_info: {
            browser: navigator.userAgent,
            generated_from: "dashboard",
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewToken(data.token);
        fetchTokens();
      }
    } catch {
      // Handle error silently
    } finally {
      setGenerating(false);
    }
  };

  const handleRevokeToken = async (tokenId: string) => {
    try {
      await fetch(`/api/extension/tokens/${tokenId}`, {
        method: "DELETE",
      });
      setTokens((prev) => prev.filter((t) => t.id !== tokenId));
    } catch {
      // Handle error silently
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeAgo = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    const seconds = Math.floor(
      (Date.now() - new Date(dateStr).getTime()) / 1000
    );
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 ring-1 ring-blue-500/20">
          <HugeiconsIcon icon={Settings01Icon} className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500">
            Manage your organization, extensions, and API configuration.
          </p>
        </div>
      </div>

      {/* Organization Settings */}
      <Card className="bg-white/[0.03] border-0 ring-1 ring-white/[0.06] rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-white/[0.04] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10">
              <HugeiconsIcon icon={Building06Icon} className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-white text-base font-semibold">Organization</CardTitle>
              <CardDescription className="text-slate-500 text-xs mt-0.5">Your organization profile and domain settings.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-slate-400 text-xs font-medium uppercase tracking-wider">Organization Name</Label>
              <Input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="h-10 bg-white/[0.03] border-0 ring-1 ring-white/[0.06] text-white rounded-xl focus:ring-blue-500/40"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400 text-xs font-medium uppercase tracking-wider">Domain</Label>
              <div className="relative">
                <HugeiconsIcon icon={GlobeIcon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <Input
                  value={orgDomain}
                  onChange={(e) => setOrgDomain(e.target.value)}
                  className="pl-9 h-10 bg-white/[0.03] border-0 ring-1 ring-white/[0.06] text-white rounded-xl focus:ring-blue-500/40"
                />
              </div>
              <p className="text-[11px] text-slate-600">
                Users with this email domain can auto-join your organization.
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveOrg} disabled={savingOrg} className="bg-blue-600 hover:bg-blue-500 text-white h-9 px-5 text-sm">
              {savingOrg ? "Saving..." : orgSaved ? "Saved!" : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Browser Extension */}
      <Card className="bg-white/[0.03] border-0 ring-1 ring-white/[0.06] rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-white/[0.04] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10">
              <HugeiconsIcon icon={ChromeIcon} className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-white text-base font-semibold">Browser Extension</CardTitle>
              <CardDescription className="text-slate-500 text-xs mt-0.5">Connect browsers to your NeuroVault workspace.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Setup Steps */}
          <div className="rounded-xl bg-white/[0.02] ring-1 ring-white/[0.04] p-5">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Quick Setup
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: "1", text: "Install the NeuroVault extension from the Chrome Web Store", icon: ChromeIcon },
                { step: "2", text: "Generate a new token below and copy it", icon: Key01Icon },
                { step: "3", text: "Click the extension icon and paste your token", icon: LinkSquare01Icon },
              ].map((s) => (
                <div key={s.step} className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600/15 text-xs font-bold text-blue-400">
                    {s.step}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Newly generated token */}
          {newToken && (
            <div className="rounded-xl bg-emerald-950/20 ring-1 ring-emerald-500/20 p-4">
              <div className="flex items-center gap-2 mb-3">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-emerald-400" />
                <p className="text-sm text-emerald-400 font-medium">
                  Token generated! Copy it now — it won&apos;t be shown again.
                </p>
              </div>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={newToken}
                  className="h-9 bg-white/[0.03] border-0 ring-1 ring-white/[0.06] text-white font-mono text-xs rounded-xl"
                />
                <Button
                  variant="outline"
                  onClick={() => handleCopy(newToken, "new")}
                  className="border-0 ring-1 ring-white/[0.06] text-slate-300 hover:bg-white/[0.05] hover:text-white shrink-0 h-9 w-9 p-0"
                >
                  {copied === "new" ? (
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <HugeiconsIcon icon={Copy01Icon} className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Generate + Token list */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Extension Tokens</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {tokens.length} active token{tokens.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Button
              onClick={handleGenerateToken}
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-500 text-white h-9 px-4 text-sm"
            >
              <HugeiconsIcon icon={PlusSignIcon} className="h-3.5 w-3.5 mr-1.5" />
              {generating ? "Generating..." : "Generate Token"}
            </Button>
          </div>

          {/* Active tokens list */}
          {loading ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-16 bg-white/[0.02] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : tokens.length === 0 ? (
            <div className="rounded-xl bg-white/[0.02] ring-1 ring-white/[0.04] py-10 flex flex-col items-center">
              <HugeiconsIcon icon={Key01Icon} className="h-6 w-6 text-slate-700 mb-2" />
              <p className="text-xs text-slate-500">
                No active tokens. Generate one to connect the browser extension.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className="flex items-center justify-between bg-white/[0.02] rounded-xl p-3.5 ring-1 ring-white/[0.04] hover:bg-white/[0.04] transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] ring-1 ring-white/[0.06]">
                      <HugeiconsIcon icon={ComputerIcon} className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white font-mono truncate">
                        {token.token.slice(0, 24)}...
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[11px] text-slate-600">
                          Created {formatDate(token.created_at)}
                        </span>
                        <span className="text-[11px] text-slate-600">
                          Last seen {formatTimeAgo(token.last_seen_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmAction({ type: "revoke-token", id: token.id })}
                    className="text-slate-600 hover:text-red-400 hover:bg-red-500/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Onboarding */}
      <Card className="bg-white/[0.03] border-0 ring-1 ring-white/[0.06] rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-white/[0.04] pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10">
                <HugeiconsIcon icon={LinkSquare01Icon} className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-white text-base font-semibold">Employee Onboarding</CardTitle>
                <CardDescription className="text-slate-500 text-xs mt-0.5">Onboard employees with enrollment links — no dashboard access needed.</CardDescription>
              </div>
            </div>
            <Button onClick={() => setShowCreateLink(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white h-9 px-4 text-sm rounded-xl">
              <HugeiconsIcon icon={PlusSignIcon} className="h-3.5 w-3.5 mr-1.5" />Generate Link
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          {/* Create link form (inline) */}
          {showCreateLink && (
            <div className="rounded-xl bg-white/[0.02] ring-1 ring-white/[0.04] p-5 space-y-4">
              <h4 className="text-sm font-semibold text-white">New Enrollment Link</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-slate-400 text-xs">Label (optional)</Label>
                  <Input value={newLinkLabel} onChange={(e) => setNewLinkLabel(e.target.value)}
                    placeholder="e.g., Engineering team"
                    className="h-9 bg-white/[0.03] border-0 ring-1 ring-white/[0.06] text-white text-sm rounded-xl placeholder:text-slate-600" />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-400 text-xs">Max uses</Label>
                  <Input value={newLinkMaxUses} onChange={(e) => setNewLinkMaxUses(e.target.value)}
                    placeholder="Unlimited" type="number"
                    className="h-9 bg-white/[0.03] border-0 ring-1 ring-white/[0.06] text-white text-sm rounded-xl placeholder:text-slate-600" />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-400 text-xs">Expires in (days)</Label>
                  <Input value={newLinkExpiry} onChange={(e) => setNewLinkExpiry(e.target.value)}
                    placeholder="Never" type="number"
                    className="h-9 bg-white/[0.03] border-0 ring-1 ring-white/[0.06] text-white text-sm rounded-xl placeholder:text-slate-600" />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setShowCreateLink(false)} className="text-slate-400 hover:text-white h-9 px-4 text-sm rounded-xl">Cancel</Button>
                <Button onClick={handleCreateLink} disabled={creatingLink} className="bg-emerald-600 hover:bg-emerald-500 text-white h-9 px-4 text-sm rounded-xl">
                  {creatingLink ? "Creating..." : "Create Link"}
                </Button>
              </div>
            </div>
          )}

          {/* Active links */}
          {enrollLinks.filter((l) => l.is_active).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Links</p>
              {enrollLinks.filter((l) => l.is_active).map((link) => (
                <div key={link.id} className="flex items-center justify-between rounded-xl bg-white/[0.02] ring-1 ring-white/[0.04] p-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <HugeiconsIcon icon={LinkSquare01Icon} className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate">{link.label || "Untitled link"}</p>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{getEnrollUrl(link.code)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-500">{link.used_count}{link.max_uses ? `/${link.max_uses}` : ""} used</span>
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(getEnrollUrl(link.code), `link-${link.id}`)}
                      className="text-slate-500 hover:text-white h-8 w-8 p-0">
                      {copied === `link-${link.id}` ? (
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <HugeiconsIcon icon={Copy01Icon} className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmAction({ type: "revoke-link", id: link.id })}
                      className="text-red-400/60 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0">
                      <HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {enrollLinks.filter((l) => l.is_active).length === 0 && !showCreateLink && (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500">No enrollment links yet. Generate one to start onboarding employees.</p>
            </div>
          )}

          {/* Bulk invite */}
          <div className="rounded-xl bg-white/[0.02] ring-1 ring-white/[0.04] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">Bulk Employee Invite</h4>
                <p className="text-xs text-slate-500 mt-0.5">Upload a CSV/Excel file or paste emails. Duplicates are automatically removed.</p>
              </div>
            </div>

            {/* File upload */}
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center justify-center gap-2 h-20 rounded-xl border-2 border-dashed border-white/[0.06] hover:border-blue-500/30 hover:bg-white/[0.02] transition-all">
                  <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-400">Upload CSV or Excel file</span>
                </div>
                <input type="file" accept=".csv,.xlsx,.xls,.txt" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const text = ev.target?.result as string;
                    if (!text) return;
                    // Parse CSV/text: extract anything that looks like an email
                    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
                    const found = text.match(emailRegex) || [];
                    // Deduplicate and lowercase
                    const unique = [...new Set(found.map((e) => e.toLowerCase()))];
                    // Merge with existing textarea content
                    const existing = bulkEmails.split(/[\n,]/).map((e) => e.trim().toLowerCase()).filter(Boolean);
                    const merged = [...new Set([...existing, ...unique])];
                    setBulkEmails(merged.join("\n"));
                  };
                  reader.readAsText(file);
                  e.target.value = ""; // reset so same file can be re-uploaded
                }} />
              </label>
            </div>

            {/* Email textarea */}
            <div className="relative">
              <textarea
                value={bulkEmails}
                onChange={(e) => setBulkEmails(e.target.value)}
                placeholder={"john@company.com\njane@company.com\nalex@company.com"}
                rows={5}
                className="w-full bg-white/[0.03] ring-1 ring-white/[0.06] text-white text-sm rounded-xl p-3 placeholder:text-slate-600 resize-none focus:outline-none focus:ring-blue-500/40 font-mono"
              />
              {bulkEmails.trim() && (
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 bg-white/[0.04] px-2 py-0.5 rounded-md">
                    {[...new Set(bulkEmails.split(/[\n,]/).map((e) => e.trim().toLowerCase()).filter((e) => e.includes("@")))].length} unique emails
                  </span>
                  <button onClick={() => setBulkEmails("")} className="text-[10px] text-slate-500 hover:text-red-400 bg-white/[0.04] px-2 py-0.5 rounded-md transition-colors">
                    Clear
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={handleBulkInvite} disabled={bulkInviting || !bulkEmails.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white h-9 px-5 text-sm rounded-xl">
                {bulkInviting ? "Generating..." : "Generate Enrollment Links"}
              </Button>
            </div>

            {bulkResult && (
              <div className="rounded-xl bg-emerald-950/20 ring-1 ring-emerald-500/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-emerald-400 font-medium flex items-center gap-1.5">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4" />
                    {bulkResult.urls.length} enrollment links generated
                  </p>
                  <Button variant="ghost" size="sm"
                    onClick={() => {
                      const all = bulkResult.urls.map((u) => `${u.email}: ${u.url}`).join("\n");
                      handleCopy(all, "bulk-all");
                    }}
                    className="text-emerald-400 hover:text-emerald-300 h-7 px-3 text-[11px]">
                    {copied === "bulk-all" ? "Copied all!" : "Copy all"}
                  </Button>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {bulkResult.urls.map((item) => (
                    <div key={item.email} className="flex items-center justify-between text-xs bg-white/[0.02] rounded-lg px-3 py-2">
                      <span className="text-slate-300 font-mono">{item.email}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(item.url, `bulk-${item.email}`)}
                        className="text-slate-500 hover:text-white h-6 px-2 text-[11px]">
                        {copied === `bulk-${item.email}` ? "Copied!" : "Copy URL"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* API Access */}
      <Card className="bg-white/[0.03] border-0 ring-1 ring-white/[0.06] rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-white/[0.04] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10">
              <HugeiconsIcon icon={ApiIcon} className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-white text-base font-semibold">API Access</CardTitle>
              <CardDescription className="text-slate-500 text-xs mt-0.5">Integrate with your existing security infrastructure.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="rounded-xl bg-white/[0.02] ring-1 ring-white/[0.04] p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-1">Base URL</p>
              <p className="font-mono text-sm text-white">https://api.neurovault.com/v1</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy("https://api.neurovault.com/v1", "api-url")}
              className="text-slate-500 hover:text-white h-8 w-8 p-0"
            >
              {copied === "api-url" ? (
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-emerald-400" />
              ) : (
                <HugeiconsIcon icon={Copy01Icon} className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-white/[0.02] ring-1 ring-white/[0.04] p-4">
            <div className="flex items-center gap-3">
              <HugeiconsIcon icon={SecurityCheckIcon} className="h-5 w-5 text-slate-500" />
              <div>
                <p className="text-sm font-medium text-white">API Keys</p>
                <p className="text-xs text-slate-500 mt-0.5">Manage authentication keys for API access.</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-0 ring-1 ring-white/[0.06] text-slate-300 hover:bg-white/[0.05] hover:text-white h-9 px-4 text-sm"
            >
              <HugeiconsIcon icon={Key01Icon} className="h-3.5 w-3.5 mr-1.5" />
              Manage Keys
            </Button>
          </div>

          <div className="flex items-center gap-2 px-1">
            <HugeiconsIcon icon={Shield01Icon} className="h-3.5 w-3.5 text-slate-600" />
            <p className="text-[11px] text-slate-600">
              All API requests are encrypted and authenticated. Rate limits apply.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={confirmAction?.type === "revoke-token" ? "Revoke Extension Token" : "Revoke Enrollment Link"}
        description={
          confirmAction?.type === "revoke-token"
            ? "This will disconnect the browser extension using this token. The user will need a new token to reconnect. This action cannot be undone."
            : "This will deactivate the enrollment link. Employees who haven't yet enrolled won't be able to use it. This action cannot be undone."
        }
        confirmLabel="Revoke"
        variant="danger"
        onConfirm={() => {
          if (!confirmAction) return;
          if (confirmAction.type === "revoke-token") {
            handleRevokeToken(confirmAction.id);
          } else {
            handleRevokeLink(confirmAction.id);
          }
          setConfirmAction(null);
        }}
      />
    </div>
  );
}
