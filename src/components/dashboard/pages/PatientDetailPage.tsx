"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { pipelineApi } from "@/lib/api/pipeline";
import type { Job, JobStatus } from "@/types/pipeline";

interface Props {
  patientId: number;
}

const STATUS_LABEL: Record<JobStatus, string> = {
  pending:   "Pending",
  running:   "Processing",
  completed: "Completed",
  failed:    "Failed",
};

const STATUS_CX: Record<JobStatus, string> = {
  completed: "bg-green-50 text-green-700 border-green-100",
  running:   "bg-blue-50 text-blue-700 border-blue-100",
  pending:   "bg-gray-50 text-gray-600 border-gray-200",
  failed:    "bg-red-50 text-red-600 border-red-100",
};

function relativeTime(iso: string): string {
  const diffMs  = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffH   = Math.floor(diffMin / 60);
  const diffD   = Math.floor(diffH / 24);
  if (diffMin < 1)  return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffD === 0)
    return `Today ${new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (diffD === 1) return "Yesterday";
  return `${diffD} days ago`;
}

function duration(start: string, end: string, status: JobStatus): string {
  if (status === "pending" || status === "running") return "—";
  const sec = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000);
  if (sec <= 0) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function PatientDetailPage({ patientId }: Props) {
  const router = useRouter();
  const [runs, setRuns]       = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    pipelineApi.getPatientRuns(patientId).then((res) => {
      setLoading(false);
      if (res.ok) setRuns(res.data);
      else setError(res.error);
    });
  }, [patientId]);

  return (
    <div className="space-y-6">

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Patients
      </button>

      {/* Table */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-0)] shadow-[var(--shadow-sm)] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-1)]">
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">Patient #{patientId}</p>
            {!loading && !error && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {runs.length} run{runs.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40 text-sm text-[var(--text-muted)]">
            Loading runs…
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-40 text-sm text-red-500">
            {error}
          </div>
        ) : runs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 h-40 text-[var(--text-muted)]">
            <FlaskConical className="h-8 w-8 opacity-30" />
            <p className="text-sm">No runs for this patient.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-1)]">
                  {["Run ID", "Type", "Features", "Status", "Started", "Duration"].map((h) => (
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
                {runs.map((run) => (
                  <tr key={run.id} onClick={() => router.push(`/dashboard/pipeline/${run.id}`)} className="hover:bg-[var(--surface-1)] transition-colors cursor-pointer">
                    <td className="px-6 py-4 font-mono text-xs text-[var(--text-muted)]">
                      #{run.id}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                        <FlaskConical className="h-3.5 w-3.5" />
                        {run.type || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {run.features.length > 0 ? run.features.map((f) => (
                          <span
                            key={f.id}
                            className="rounded-full bg-[var(--brand-subtle)] px-2 py-0.5 text-xs font-medium text-[var(--brand)]"
                          >
                            {f.name}
                          </span>
                        )) : (
                          <span className="text-xs text-[var(--text-muted)]">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_CX[run.status]}`}>
                        {run.status === "running" && (
                          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                        )}
                        {STATUS_LABEL[run.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[var(--text-muted)]">
                      {relativeTime(run.created_at)}
                    </td>
                    <td className="px-6 py-4 text-xs text-[var(--text-muted)]">
                      {duration(run.created_at, run.updated_at, run.status)}
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
