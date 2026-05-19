"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderOpen, Coins, TrendingUp, Upload } from "lucide-react";
import { pipelineApi } from "@/lib/api/pipeline";
import { useAuth } from "@/contexts/AuthContext";
import type { DashboardStats, JobStatus } from "@/types/pipeline";

const STATUS_LABEL: Record<JobStatus, string> = {
  pending:   "Pending",
  running:   "Processing",
  completed: "Completed",
  failed:    "Failed",
};

const STATUS_STYLES: Record<JobStatus, string> = {
  completed: "bg-green-50 text-green-700 border-green-100",
  running:   "bg-blue-50 text-blue-700 border-blue-100",
  pending:   "bg-gray-50 text-gray-600 border-gray-200",
  failed:    "bg-red-50 text-red-600 border-red-100",
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function relativeTime(iso: string): string {
  const diffMs  = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffH   = Math.floor(diffMin / 60);
  const diffD   = Math.floor(diffH / 24);
  if (diffMin < 1)  return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffD === 0)
    return `Today, ${new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (diffD === 1) return "Yesterday";
  return `${diffD} days ago`;
}

function fmt(n: number): string {
  return n.toLocaleString();
}

export function OverviewPage() {
  const { user } = useAuth();
  const router   = useRouter();
  const [stats, setStats]     = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    pipelineApi.getDashboardStats().then((res) => {
      setLoading(false);
      if (res.ok) setStats(res.data);
      else setError(res.error);
    });
  }, []);

  const firstName = user?.name?.split(" ")[0] ?? "there";

  const statCards = [
    {
      label: "Total analyses",
      value: stats ? fmt(stats.total_runs) : "—",
      delta: "All runs",
      positive: true,
      icon: TrendingUp,
      color: "bg-teal-50 text-teal-700",
    },
    {
      label: "Files",
      value: stats ? fmt(stats.total_files) : "—",
      delta: "Total outputs",
      positive: true,
      icon: FolderOpen,
      color: "bg-violet-50 text-violet-700",
    },
    {
      label: "Credits remaining",
      value: stats ? fmt(parseFloat(stats.credits)) : "—",
      delta: "Organisation balance",
      positive: false,
      icon: Coins,
      color: "bg-amber-50 text-amber-700",
    },
  ];

  return (
    <div className="space-y-8">

      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          {greeting()}, {firstName} 👋
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Here&apos;s a summary of your retinal analysis activity.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        {/* New analysis CTA card */}
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--surface-0)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-light)]">
            <Upload className="h-5 w-5 text-[var(--brand)]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-[var(--text-primary)]">New analysis</p>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">Submit a retinal scan</p>
          </div>
          <button
            onClick={() => router.push("/dashboard/pipeline/new")}
            className="rounded-lg bg-[var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--brand-dark)] transition-colors shadow-[var(--shadow-brand)]"
          >
            Start →
          </button>
        </div>

        {statCards.map(({ label, value, delta, positive, icon: Icon, color }) => (
          <div
            key={label}
            className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface-0)] p-5 shadow-[var(--shadow-sm)]"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color} mb-4`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">{label}</p>
            <p className={`mt-1 text-3xl font-bold text-[var(--text-primary)] ${loading ? "animate-pulse" : ""}`}>
              {value}
            </p>
            <p className={`mt-1 text-xs font-medium ${positive ? "text-green-600" : "text-amber-600"}`}>
              {delta}
            </p>
          </div>
        ))}
      </div>

      {/* Recent runs table */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-0)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recent analyses</h3>
          <Link
            href="/dashboard/pipeline"
            className="text-xs font-semibold text-[var(--brand)] hover:text-[var(--brand-dark)] transition-colors"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32 text-sm text-[var(--text-muted)]">
            Loading…
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32 text-sm text-red-500">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-1)]">
                  {["Run ID", "Patient", "Status", "Findings", "Date"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {(stats?.recent_runs ?? []).map((run) => (
                  <tr key={run.id} className="hover:bg-[var(--surface-1)] transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-[var(--text-muted)]">
                      #{run.id}
                    </td>
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)]">
                      {run.patient ? `Patient #${run.patient.number}` : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[run.status]}`}
                      >
                        {run.status === "running" && (
                          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                        )}
                        {STATUS_LABEL[run.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {run.features.length > 0 ? (
                          run.features.map((f) => (
                            <span
                              key={f.id}
                              className="rounded-full bg-[var(--brand-subtle)] px-2 py-0.5 text-xs font-medium text-[var(--brand)]"
                            >
                              {f.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[var(--text-muted)]">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-[var(--text-muted)]">
                      {relativeTime(run.created_at)}
                    </td>
                  </tr>
                ))}
                {stats?.recent_runs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-[var(--text-muted)]">
                      No runs yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
