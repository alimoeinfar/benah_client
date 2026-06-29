"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FlaskConical, Search, SlidersHorizontal, X } from "lucide-react";
import { pipelineApi } from "@/lib/api/pipeline";
import { Pagination } from "@/components/ui/Pagination";
import type { Job, JobStatus } from "@/types/pipeline";

const POLL_INTERVAL = 10_000;

const STATUS_LABEL: Record<JobStatus, string> = {
  pending:   "Pending",
  running:   "Processing",
  completed: "Completed",
  failed:    "Failed",
  rejected:  "Rejected",
};

const STATUS_CX: Record<JobStatus, string> = {
  completed: "bg-green-50 text-green-700 border-green-100",
  running:   "bg-blue-50 text-blue-700 border-blue-100",
  pending:   "bg-gray-50 text-gray-600 border-gray-200",
  failed:    "bg-red-50 text-red-600 border-red-100",
  rejected:  "bg-amber-50 text-amber-700 border-amber-100",
};

const STATUS_PILL: Record<JobStatus, string> = {
  completed: "border-green-200 bg-green-50 text-green-700 data-[active=true]:bg-green-600 data-[active=true]:text-white data-[active=true]:border-green-600",
  running:   "border-blue-200 bg-blue-50 text-blue-700 data-[active=true]:bg-blue-600 data-[active=true]:text-white data-[active=true]:border-blue-600",
  pending:   "border-gray-200 bg-gray-50 text-gray-600 data-[active=true]:bg-gray-600 data-[active=true]:text-white data-[active=true]:border-gray-600",
  failed:    "border-red-200 bg-red-50 text-red-600 data-[active=true]:bg-red-600 data-[active=true]:text-white data-[active=true]:border-red-600",
  rejected:  "border-amber-200 bg-amber-50 text-amber-700 data-[active=true]:bg-amber-600 data-[active=true]:text-white data-[active=true]:border-amber-600",
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

export function PipelinePage() {
  const router = useRouter();
  const [runs,       setRuns]       = useState<Job[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page,       setPage]       = useState(1);

  const [rawQuery,     setRawQuery]     = useState("");
  const [query,        setQuery]        = useState("");
  const [filtersOpen,  setFiltersOpen]  = useState(false);
  const [statusFilter, setStatus]       = useState<JobStatus | "">("");
  const [typeFilter,   setType]         = useState<"image" | "video" | "">("");
  const [dateFrom,     setDateFrom]     = useState("");
  const [dateTo,       setDateTo]       = useState("");

  // Debounce raw search input → committed query
  useEffect(() => {
    const t = setTimeout(() => setQuery(rawQuery), 400);
    return () => clearTimeout(t);
  }, [rawQuery]);

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [query, statusFilter, typeFilter, dateFrom, dateTo]);

  // Stable ref so the polling interval always uses the latest params
  const paramsRef = useRef({ page, query, statusFilter, typeFilter, dateFrom, dateTo });
  useEffect(() => {
    paramsRef.current = { page, query, statusFilter, typeFilter, dateFrom, dateTo };
  });

  // Main fetch + polling effect
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    function applyResult(data: Awaited<ReturnType<typeof pipelineApi.listJobs>>) {
      if (cancelled || !data.ok) {
        if (!cancelled && !data.ok) setError(data.error);
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
          pipelineApi.listJobs(paramsRef.current).then(applyResult);
        }, POLL_INTERVAL);
      } else if (!hasActive && intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }

    setLoading(true);
    pipelineApi.listJobs({ page, search: query, status: statusFilter, type: typeFilter, date_from: dateFrom, date_to: dateTo })
      .then(applyResult);

    return () => {
      cancelled = true;
      if (intervalId !== null) clearInterval(intervalId);
    };
  }, [page, query, statusFilter, typeFilter, dateFrom, dateTo]);

  const activeFilterCount = [statusFilter, typeFilter, dateFrom, dateTo].filter(Boolean).length;

  function clearFilters() {
    setStatus("");
    setType("");
    setDateFrom("");
    setDateTo("");
  }

  return (
    <div className="space-y-3">

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by ID, patient, type, status…"
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-0)] py-2 pl-9 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
          />
        </div>

        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            filtersOpen || activeFilterCount > 0
              ? "border-[var(--brand)] bg-[var(--brand-light)] text-[var(--brand)]"
              : "border-[var(--border)] bg-[var(--surface-0)] text-[var(--text-secondary)] hover:bg-[var(--surface-1)]"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand)] text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        <button
          onClick={() => router.push("/dashboard/pipeline/new")}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-dark)] shadow-[var(--shadow-brand)] transition-colors"
        >
          <Upload className="h-4 w-4" /> New analysis
        </button>
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-0)] shadow-[var(--shadow-sm)] p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Filters</span>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs font-medium text-[var(--brand)] hover:text-[var(--brand-dark)] transition-colors">
                <X className="h-3 w-3" /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-[var(--text-secondary)]">Status</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(STATUS_LABEL) as JobStatus[]).map((s) => (
                  <button
                    key={s}
                    data-active={statusFilter === s}
                    onClick={() => setStatus(statusFilter === s ? "" : s)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${STATUS_PILL[s]}`}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-[var(--text-secondary)]">Type</p>
              <div className="flex gap-2">
                {(["image", "video"] as const).map((t) => (
                  <button
                    key={t}
                    data-active={typeFilter === t}
                    onClick={() => setType(typeFilter === t ? "" : t)}
                    className="rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)] capitalize transition-colors data-[active=true]:border-[var(--brand)] data-[active=true]:bg-[var(--brand)] data-[active=true]:text-white"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-[var(--text-secondary)]">Date range</p>
              <div className="flex items-center gap-2">
                <input type="date" value={dateFrom} max={dateTo || undefined}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
                />
                <span className="text-xs text-[var(--text-muted)] shrink-0">to</span>
                <input type="date" value={dateTo} min={dateFrom || undefined}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
                />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-0)] shadow-[var(--shadow-sm)] overflow-hidden">

        {loading ? (
          <div className="flex items-center justify-center h-40 text-sm text-[var(--text-muted)]">
            Loading runs…
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-40 text-sm text-red-500">{error}</div>
        ) : runs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 h-40 text-[var(--text-muted)]">
            <FlaskConical className="h-8 w-8 opacity-30" />
            <p className="text-sm">{activeFilterCount > 0 || query ? "No runs match your filters." : "No runs yet."}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-1)]">
                    {["Run ID", "Patient", "Type", "Features", "Status", "Started", "Duration", ""].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {runs.map((run) => (
                    <tr key={run.id} className="hover:bg-[var(--surface-1)] transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-[var(--text-muted)]">#{run.id}</td>
                      <td className="px-6 py-4 font-medium text-[var(--text-primary)]">
                        {run.patient ? `Patient #${run.patient.number}` : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                          <FlaskConical className="h-3.5 w-3.5" />{run.type || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {run.features.length > 0 ? run.features.map((f) => (
                            <span key={f.id} className="rounded-full bg-[var(--brand-subtle)] px-2 py-0.5 text-xs font-medium text-[var(--brand)]">{f.name}</span>
                          )) : <span className="text-xs text-[var(--text-muted)]">—</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_CX[run.status]}`}
                          title={run.status === "rejected" && run.rejection_message ? run.rejection_message : undefined}
                        >
                          {run.status === "running" && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />}
                          {STATUS_LABEL[run.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[var(--text-muted)]">{relativeTime(run.created_at)}</td>
                      <td className="px-6 py-4 text-xs text-[var(--text-muted)]">{duration(run.created_at, run.updated_at, run.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => router.push(`/dashboard/pipeline/${run.id}`)} className="text-xs font-semibold text-[var(--brand)] hover:text-[var(--brand-dark)] transition-colors">
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              onPage={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
