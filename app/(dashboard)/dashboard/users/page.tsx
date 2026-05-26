"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Wifi, WifiOff, Users, Mail, UserPlus } from "lucide-react";
import Button from "@/components/ui/button";

interface Member {
  user_id: string;
  name: string;
  email: string;
  role: string;
  ai_apps: number;
  extension_connected: boolean;
  last_seen: string | null;
  joined: string;
}

const roleStyles: Record<string, string> = {
  owner: "bg-purple-400/10 text-purple-400 border-purple-400/20",
  admin: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  member: "bg-slate-400/10 text-slate-300 border-slate-400/20",
  viewer: "bg-slate-400/10 text-slate-500 border-slate-600/20",
  employee: "bg-amber-400/10 text-amber-400 border-amber-400/20",
};

export default function UsersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/users");
      if (res.ok) setMembers(await res.json());
    } catch {
      // Failed
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    setInviteMsg(null);
    try {
      const res = await fetch("/api/dashboard/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setInviteMsg({ type: "success", text: data.message || "Invitation sent!" });
        setInviteEmail("");
        fetchMembers();
        setTimeout(() => { setShowInvite(false); setInviteMsg(null); }, 2000);
      } else {
        setInviteMsg({ type: "error", text: data.error || "Failed to invite" });
      }
    } catch {
      setInviteMsg({ type: "error", text: "Network error" });
    } finally { setInviting(false); }
  };

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  const formatTimeAgo = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage team members and monitor their AI activity.
          </p>
        </div>
        <Dialog open={showInvite} onOpenChange={setShowInvite}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-10 px-5">
              <UserPlus className="h-4 w-4 mr-2" />Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0c0e1a] border-0 ring-1 ring-white/10 text-white max-w-sm rounded-2xl">
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription className="text-slate-400">Send an invitation to join your organization.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com" type="email"
                    className="pl-9 h-10 bg-white/[0.03] border-0 ring-1 ring-white/[0.06] text-white rounded-xl placeholder:text-slate-600" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="h-10 bg-white/[0.03] border-0 ring-1 ring-white/[0.06] text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c0e1a] border-0 ring-1 ring-white/10 rounded-xl">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {inviteMsg && (
                <p className={`text-sm ${inviteMsg.type === "success" ? "text-emerald-400" : "text-red-400"}`}>{inviteMsg.text}</p>
              )}
              <Button onClick={handleInvite} disabled={inviting || !inviteEmail}
                className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
                {inviting ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500"
        />
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
                Loading...
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Users className="h-8 w-8 text-slate-700 mb-3" />
              <h3 className="text-base font-semibold text-white mb-1">
                {members.length === 0 ? "No team members" : "No matching users"}
              </h3>
              <p className="text-sm text-slate-500">
                {members.length === 0
                  ? "Invite members to your organization to get started."
                  : "Try a different search term."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider p-4">User</th>
                    <th className="text-center text-xs font-medium text-slate-400 uppercase tracking-wider p-4">Role</th>
                    <th className="text-center text-xs font-medium text-slate-400 uppercase tracking-wider p-4">AI Apps</th>
                    <th className="text-center text-xs font-medium text-slate-400 uppercase tracking-wider p-4">Extension</th>
                    <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider p-4">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((member) => (
                    <tr key={member.user_id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-sm font-medium text-slate-300">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{member.name}</p>
                            <p className="text-xs text-slate-400">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${roleStyles[member.role] || roleStyles.member}`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-sm text-white">{member.ai_apps}</span>
                      </td>
                      <td className="p-4 text-center">
                        {member.extension_connected ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-400">
                            <Wifi className="h-3 w-3" />
                            Connected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <WifiOff className="h-3 w-3" />
                            Not connected
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right text-sm text-slate-400">
                        {formatTimeAgo(member.last_seen)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
