"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { classificationApi } from "@/lib/api/classification";
import { Pagination } from "@/components/ui/Pagination";
import type { ClassificationRun, ClassificationStatus } from "@/types/classification";

const POLL_INTERVAL = 5_000;

const STATUS_LABEL: Record<ClassificationStatus, string> = {
  pending:   "Pending",
  running:   "Processing",
  completed: "Completed",
  failed:    "Failed",
  rejected:  "Rejected",
};

const STATUS_CX: Record<ClassificationStatus, string> = {
  completed: "bg-green-50 text-green-700 border-green-100",
  running:   "bg-blue-50 text-blue-700 border-blue-100",
  pending:   "bg-gray-50 text-gray-600 border-gray-200",
  failed:    "bg-red-50 text-red-600 border-red-100",
  rejected:  "bg-amber-50 text-amber-700 border-amber-100",
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

export function IcpModulePage() {
  const router = useRouter();
  const [runs,       setRuns]       = useState<ClassificationRun[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page,       setPage]       = useState(1);

  const paramsRef = useRef({ page });
  useEffect(() => { paramsRef.current = { page }; });

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    function applyResult(data: Awaited<ReturnType<typeof classificationApi.listRuns>>) {
      if (cancelled || !data.ok) {
        if (!cancelled && !data.ok) setError(data.error ?? "Failed to load runs");
        return;
      }
      setRuns(data.data.results);
      setTotal(data.data.count);
      setTotalPages(data.data.total_pages);
      setLoading(false);

      const hasActive = data.data.results.some(
        (r) => r.status === "pending" || r.status === "running"
      );
      if (hasActive && intervalId === null) {
        intervalId = setInterval(() => {
          classificationApi.listRuns(paramsRef.current).then(applyResult);
        }, POLL_INTERVAL);
      } else if (!hasActive && intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }

    setLoading(true);
    classificationApi.listRuns({ page }).then(applyResult);

    return () => {
      cancelled = true;
      if (intervalId !== null) clearInterval(intervalId);
    };
  }, [page]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">ICP Module</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Papilledema classification runs
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/icp/new")}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-dark)] shadow-[var(--shadow-brand)] transition-colors"
        >
          <Upload className="h-4 w-4" /> New Analysis
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-0)] shadow-[var(--shadow-sm)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-[var(--text-muted)] text-sm">
            Loading…
          </div>
        ) : runs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[var(--text-muted)] text-sm">No classification runs yet.</p>
            <button
              onClick={() => router.push("/dashboard/icp/new")}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-dark)] transition-colors"
            >
              <Upload className="h-4 w-4" /> New Analysis
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface-1)] text-[var(--text-muted)] text-xs uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left font-medium">ID</th>
                <th className="px-5 py-3 text-left font-medium">Date</th>
                <th className="px-5 py-3 text-left font-medium">Patient</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Papilledema Probability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {runs.map((run) => (
                <tr
                  key={run.id}
                  onClick={() => router.push(`/dashboard/icp/${run.id}`)}
                  className="cursor-pointer hover:bg-[var(--surface-1)] transition-colors"
                >
                  <td className="px-5 py-3.5 font-mono text-[var(--text-secondary)]">
                    #{run.id}
                  </td>
                  <td className="px-5 py-3.5 text-[var(--text-secondary)]">
                    {relativeTime(run.created_at)}
                  </td>
                  <td className="px-5 py-3.5 text-[var(--text-secondary)]">
                    {run.patient ? `#${run.patient.number}` : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_CX[run.status]}`}
                      title={run.status === "rejected" && run.rejection_message ? run.rejection_message : undefined}
                    >
                      {STATUS_LABEL[run.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-[var(--text-primary)]">
                    {run.classification_result != null
                      ? `${(run.classification_result.papilledema_probability * 100).toFixed(2)}%`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          onPage={setPage}
        />
      )}
    </div>
  );
}
