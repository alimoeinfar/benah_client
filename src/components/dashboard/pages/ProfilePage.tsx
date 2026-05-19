"use client";

import { useState, useEffect } from "react";
import { UserCircle, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { organisationApi } from "@/lib/api/organisation";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ProfilePage() {
  const { user, setAuth, token } = useAuth();

  const [name, setName]   = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState<string | null>(null);

  const [pwFields, setPwFields] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    const res = await organisationApi.updateMe({ name, email });
    setSaving(false);
    if (res.ok) {
      setSaveMsg("Saved.");
      // keep auth context in sync
      if (token) {
        setAuth({
          access: token,
          refresh: "",
          user: res.data,
        });
      }
    } else {
      setSaveMsg(res.error);
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-[var(--text-muted)]">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Avatar card */}
      <div className="flex items-center gap-5 rounded-xl border border-[var(--border)] bg-[var(--surface-0)] p-6 shadow-[var(--shadow-sm)]">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand)] text-2xl font-bold text-white shrink-0">
          {initials(user.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-[var(--text-primary)]">{user.name}</p>
          {user.role && (
            <p className="text-sm text-[var(--text-muted)] capitalize">{user.role}</p>
          )}
        </div>
      </div>

      {/* Details form */}
      <form
        onSubmit={handleSaveProfile}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface-0)] shadow-[var(--shadow-sm)] overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Personal information</h3>
        </div>
        <div className="p-6 grid sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Name</label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-lg border border-[var(--border)] bg-[var(--surface-0)] pl-9 pr-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-[var(--border)] bg-[var(--surface-0)] pl-9 pr-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
              />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-end gap-3">
          {saveMsg && (
            <span className={`text-xs ${saveMsg === "Saved." ? "text-green-600" : "text-red-600"}`}>
              {saveMsg}
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-dark)] transition-colors shadow-[var(--shadow-brand)] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      {/* Change password */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-0)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Change password</h3>
        </div>
        <div className="p-6 space-y-4">
          {(["current", "next", "confirm"] as const).map((key) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">
                {key === "current" ? "Current password" : key === "next" ? "New password" : "Confirm new password"}
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={pwFields[key]}
                onChange={(e) => setPwFields((p) => ({ ...p, [key]: e.target.value }))}
                className="block w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
              />
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-[var(--border)] flex justify-end">
          <button className="rounded-lg bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-dark)] transition-colors shadow-[var(--shadow-brand)]">
            Update password
          </button>
        </div>
      </div>
    </div>
  );
}
