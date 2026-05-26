"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Button from "@/components/ui/button";
import {
  Shield,
  User,
  Mail,
  Copy,
  Check,
  AlertCircle,
  Chrome,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function EnrollPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const code = params.code as string;
  const prefillEmail = searchParams.get("email") || "";

  const [state, setState] = useState<"loading" | "invalid" | "form" | "success">("loading");
  const [orgName, setOrgName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(prefillEmail);
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState(false);

  // Validate the enrollment link on mount
  useEffect(() => {
    fetch(`/api/enroll/${code}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setOrgName(data.orgName);
          setState("form");
        } else {
          setErrorMsg(data.error || "Invalid link");
          setState("invalid");
        }
      })
      .catch(() => {
        setErrorMsg("Could not validate enrollment link");
        setState("invalid");
      });
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, name, email }),
      });
      const data = await res.json();

      if (res.ok) {
        setToken(data.token);
        setState("success");
      } else {
        setErrorMsg(data.error || "Enrollment failed");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">NeuroVault</span>
          </div>
        </div>

        {/* Loading */}
        {state === "loading" && (
          <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-12 text-center">
            <Loader2 className="h-8 w-8 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-400">Validating enrollment link...</p>
          </div>
        )}

        {/* Invalid */}
        {state === "invalid" && (
          <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 mx-auto mb-5">
              <AlertCircle className="h-7 w-7 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Link Unavailable</h2>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">{errorMsg}</p>
            <p className="text-xs text-slate-600 mt-6">Contact your organization's IT administrator for a new enrollment link.</p>
          </div>
        )}

        {/* Form */}
        {state === "form" && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Set Up Security Monitoring</h1>
              <p className="text-sm text-slate-400">
                <span className="text-white font-medium">{orgName}</span> uses NeuroVault to monitor AI tool usage. Complete the setup below.
              </p>
            </div>

            <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-8">
              {errorMsg && (
                <div className="mb-5 p-3 rounded-xl bg-red-500/10 ring-1 ring-red-500/20 text-sm text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />{errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-sm">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      value={name} onChange={(e) => setName(e.target.value)} required minLength={2}
                      placeholder="Your full name"
                      className="pl-9 h-11 bg-white/[0.03] border-0 ring-1 ring-white/[0.06] text-white rounded-xl placeholder:text-slate-600 focus:ring-blue-500/40"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-sm">Work Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      value={email} onChange={(e) => setEmail(e.target.value)} required type="email"
                      placeholder="you@company.com" readOnly={!!prefillEmail}
                      className={`pl-9 h-11 bg-white/[0.03] border-0 ring-1 ring-white/[0.06] text-white rounded-xl placeholder:text-slate-600 focus:ring-blue-500/40 ${prefillEmail ? "opacity-70" : ""}`}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={submitting || !name || !email}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20">
                  {submitting ? (
                    <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Setting up...</span>
                  ) : (
                    <span className="flex items-center gap-2">Get Started <ArrowRight className="h-4 w-4" /></span>
                  )}
                </Button>
              </form>
            </div>
          </>
        )}

        {/* Success */}
        {state === "success" && (
          <>
            <div className="text-center mb-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20 mx-auto mb-5">
                <Check className="h-7 w-7 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">You're All Set!</h1>
              <p className="text-sm text-slate-400">Follow the steps below to complete your setup.</p>
            </div>

            <div className="space-y-4">
              {/* Token display */}
              <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Your Extension Token</p>
                <div className="flex gap-2">
                  <div className="flex-1 h-10 bg-white/[0.03] ring-1 ring-white/[0.06] rounded-xl flex items-center px-3 overflow-hidden">
                    <code className="text-xs text-slate-300 font-mono truncate">{token}</code>
                  </div>
                  <Button onClick={handleCopy}
                    className={`h-10 w-10 p-0 rounded-xl ${copied ? "bg-emerald-600" : "bg-white/[0.05] hover:bg-white/[0.08]"} ring-1 ring-white/[0.06]`}>
                    {copied ? <Check className="h-4 w-4 text-white" /> : <Copy className="h-4 w-4 text-slate-400" />}
                  </Button>
                </div>
                <p className="text-[11px] text-amber-400/80 mt-2">Copy this token now — it won't be shown again.</p>
              </div>

              {/* Setup steps */}
              <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Setup Steps</p>
                <div className="space-y-4">
                  {[
                    { step: "1", icon: Chrome, title: "Install the extension", desc: "Add the NeuroVault extension to Chrome from your IT admin" },
                    { step: "2", icon: Copy, title: "Copy your token", desc: "Click the copy button above to copy your unique token" },
                    { step: "3", icon: Shield, title: "Paste & connect", desc: "Click the extension icon in Chrome and paste your token" },
                  ].map((s) => (
                    <div key={s.step} className="flex items-start gap-3.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 ring-1 ring-blue-500/20 text-xs font-bold text-blue-400">
                        {s.step}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{s.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-700 mt-8 flex items-center justify-center gap-1.5">
          <Shield className="h-3 w-3" /> Protected by NeuroVault · Enterprise Security
        </p>
      </div>
    </div>
  );
}
