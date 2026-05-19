"use client";

import { useEffect, useState } from "react";
import { Building2, Users, Mail, Coins, Plus, X, Pencil } from "lucide-react";
import { organisationApi } from "@/lib/api/organisation";
import type { Member, Organisation } from "@/types/organisation";

const ROLE_CX: Record<string, string> = {
  admin:  "bg-[var(--brand-subtle)] text-[var(--brand)]",
  member: "bg-blue-50 text-blue-700",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function creditPercent(credit: string): number {
  const n = parseFloat(credit);
  if (isNaN(n) || n <= 0) return 0;
  return Math.min(100, Math.round((n / 2000) * 100));
}

function AddUserDialog({ onClose, onAdded }: { onClose: () => void; onAdded: (m: Member) => void }) {
  const [name,       setName]       = useState("");
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [role,       setRole]       = useState<"member" | "admin">("member");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await organisationApi.addMember({ name, email, password, role });
    setSubmitting(false);
    if (!res.ok) setError(res.error);
    else onAdded(res.data);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface-0)] shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Add user</h2>
          <button onClick={onClose} className="rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="divide-y divide-[var(--border)]">
          <div className="px-6 py-5 space-y-4">

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="block w-full rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="block w-full rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Role
              </label>
              <div className="flex gap-3">
                {(["member", "admin"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 rounded-lg border-2 py-2 text-sm font-semibold capitalize transition-colors ${
                      role === r
                        ? "border-[var(--brand)] bg-[var(--brand-light)] text-[var(--brand)]"
                        : "border-[var(--border)] bg-[var(--surface-0)] text-[var(--text-secondary)] hover:bg-[var(--surface-1)]"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[var(--surface-1)]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-5 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-5 py-2 text-sm font-semibold text-white shadow-[var(--shadow-brand)] disabled:opacity-40"
            >
              {submitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              {submitting ? "Adding…" : "Add user"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditMemberDialog({ member, onClose, onSaved }: { member: Member; onClose: () => void; onSaved: (m: Member) => void }) {
  const [name,       setName]       = useState(member.name);
  const [email,      setEmail]      = useState(member.email);
  const [password,   setPassword]   = useState("");
  const [role,       setRole]       = useState<"member" | "admin">(member.role as "member" | "admin");
  const [isActive,   setIsActive]   = useState(member.is_active);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const payload: Record<string, unknown> = { name, email, role, is_active: isActive };
    if (password) payload.password = password;
    const res = await organisationApi.updateMember(member.id, payload);
    setSubmitting(false);
    if (!res.ok) setError(res.error);
    else onSaved(res.data);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface-0)] shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Edit member</h2>
          <button onClick={onClose} className="rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="divide-y divide-[var(--border)]">
          <div className="px-6 py-5 space-y-4">

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="block w-full rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                New password <span className="text-[var(--text-muted)] normal-case font-normal">(leave blank to keep current)</span>
              </label>
              <input
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={password ? 8 : undefined}
                className="block w-full rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Role</label>
              <div className="flex gap-3">
                {(["member", "admin"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 rounded-lg border-2 py-2 text-sm font-semibold capitalize transition-colors ${
                      role === r
                        ? "border-[var(--brand)] bg-[var(--brand-light)] text-[var(--brand)]"
                        : "border-[var(--border)] bg-[var(--surface-0)] text-[var(--text-secondary)] hover:bg-[var(--surface-1)]"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Active</span>
              <button
                type="button"
                onClick={() => setIsActive((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? "bg-[var(--brand)]" : "bg-gray-300"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[var(--surface-1)]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-5 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-5 py-2 text-sm font-semibold text-white shadow-[var(--shadow-brand)] disabled:opacity-40"
            >
              {submitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              {submitting ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function OrganisationPage() {
  const [org, setOrg]         = useState<Organisation | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [addOpen,       setAddOpen]       = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const [orgName, setOrgName]         = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [saving, setSaving]           = useState(false);
  const [saveMsg, setSaveMsg]         = useState<string | null>(null);

  useEffect(() => {
    organisationApi.getOrganisation().then((res) => {
      setLoading(false);
      if (res.ok) {
        setOrg(res.data);
        setOrgName(res.data.name);
        setContactEmail(res.data.contact_email);
      } else {
        setError(res.error);
      }
    });
  }, []);

  async function handleSaveOrg(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    const res = await organisationApi.updateOrganisation({
      name: orgName,
      contact_email: contactEmail,
    });
    setSaving(false);
    if (res.ok) {
      setOrg(res.data);
      setSaveMsg("Saved.");
    } else {
      setSaveMsg(res.error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-[var(--text-muted)]">
        Loading organisation…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-red-500">
        {error}
      </div>
    );
  }

  const credit  = parseFloat(org?.credit ?? "0");
  const pct     = creditPercent(org?.credit ?? "0");
  const members = org?.members ?? [];

  return (
    <div className="space-y-6 max-w-3xl">

      {addOpen && (
        <AddUserDialog
          onClose={() => setAddOpen(false)}
          onAdded={(m) => {
            setOrg((prev) => prev ? { ...prev, members: [...prev.members, m] } : prev);
            setAddOpen(false);
          }}
        />
      )}

      {editingMember && (
        <EditMemberDialog
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSaved={(updated) => {
            setOrg((prev) => prev
              ? { ...prev, members: prev.members.map((m) => m.id === updated.id ? updated : m) }
              : prev
            );
            setEditingMember(null);
          }}
        />
      )}

      {/* Org details */}
      <form
        onSubmit={handleSaveOrg}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface-0)] shadow-[var(--shadow-sm)] overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Organisation details</h3>
        </div>
        <div className="p-6 grid sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Organisation name</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="block w-full rounded-lg border border-[var(--border)] bg-[var(--surface-0)] pl-9 pr-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Contact email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
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

      {/* Credit balance */}
      <div className="rounded-xl border border-[var(--border)] bg-gradient-to-br from-teal-700 to-teal-900 p-6 text-white shadow-[var(--shadow-brand)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Coins className="h-5 w-5 text-teal-300" />
              <p className="text-sm font-semibold text-teal-200">Credit balance</p>
            </div>
            <p className="text-4xl font-extrabold">{credit.toLocaleString()}</p>
            <p className="mt-1 text-sm text-teal-300">≈ {credit.toLocaleString()} retinal analyses remaining</p>
          </div>
          <button className="rounded-xl bg-white/15 border border-white/20 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/25 transition-colors">
            Top up credits
          </button>
        </div>
        <div className="mt-4 h-2 rounded-full bg-teal-800 overflow-hidden">
          <div className="h-full rounded-full bg-teal-300" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-teal-400">{pct}% of monthly allocation used</p>
      </div>

      {/* Members */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-0)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[var(--text-muted)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Members{" "}
              <span className="ml-1 rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-xs text-[var(--text-muted)]">
                {members.length}
              </span>
            </h3>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--brand-dark)] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add user
          </button>
        </div>

        {members.length === 0 ? (
          <p className="px-6 py-8 text-sm text-center text-[var(--text-muted)]">No members found.</p>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--surface-1)] transition-colors"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                    m.is_active ? "bg-[var(--brand)]" : "bg-gray-300"
                  }`}
                >
                  {initials(m.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{m.name}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{m.email}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                    ROLE_CX[m.role] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {m.role}
                </span>
                {!m.is_active && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                    Inactive
                  </span>
                )}
                <button
                  onClick={() => setEditingMember(m)}
                  className="ml-1 rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
