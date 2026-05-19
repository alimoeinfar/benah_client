"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Search, SlidersHorizontal, X, UserPlus } from "lucide-react";
import { pipelineApi } from "@/lib/api/pipeline";
import { Pagination } from "@/components/ui/Pagination";
import type { PatientSummary } from "@/types/pipeline";


function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function patientName(p: PatientSummary) {
  const name = [p.first_name, p.last_name].filter(Boolean).join(" ");
  return name || null;
}

interface AddPatientDialogProps {
  onClose: () => void;
  onAdded: (p: PatientSummary) => void;
}

function AddPatientDialog({ onClose, onAdded }: AddPatientDialogProps) {
  const [number,     setNumber]    = useState("");
  const [firstName,  setFirstName] = useState("");
  const [lastName,   setLastName]  = useState("");
  const [dob,        setDob]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]     = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = parseInt(number, 10);
    if (!number || isNaN(num) || num < 1) {
      setError("Patient number must be a positive integer.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await pipelineApi.createPatient({
      number: num,
      ...(firstName && { first_name:    firstName }),
      ...(lastName  && { last_name:     lastName  }),
      ...(dob       && { date_of_birth: dob       }),
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
    } else {
      onAdded({ ...res.data, run_count: 0, last_run_date: null });
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface-0)] shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Add patient</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="divide-y divide-[var(--border)]">
          <div className="px-6 py-5 space-y-4">

            {/* Patient number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Patient number <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                step={1}
                placeholder="e.g. 1829"
                value={number}
                onChange={(e) => setNumber(e.target.value.replace(/\D/g, ""))}
                className="block w-full rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                required
              />
            </div>

            {/* First / Last name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                  First name
                </label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="block w-full rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                  Last name
                </label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="block w-full rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
                />
              </div>
            </div>

            {/* Date of birth */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Date of birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="block w-full rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {/* Footer */}
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
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-5 py-2 text-sm font-semibold text-white shadow-[var(--shadow-brand)] transition-opacity disabled:opacity-40"
            >
              {submitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              {submitting ? "Adding…" : "Add patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function PatientsPage() {
  const router = useRouter();
  const [patients,   setPatients]   = useState<PatientSummary[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page,       setPage]       = useState(1);
  const [addOpen,    setAddOpen]    = useState(false);

  const [rawQuery,     setRawQuery]     = useState("");
  const [query,        setQuery]        = useState("");
  const [filtersOpen,  setFiltersOpen]  = useState(false);
  const [runsFilter,   setRunsFilter]   = useState<"" | "has_runs" | "no_runs">("");
  const [dateFrom,     setDateFrom]     = useState("");
  const [dateTo,       setDateTo]       = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setQuery(rawQuery), 400);
    return () => clearTimeout(t);
  }, [rawQuery]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [query, runsFilter, dateFrom, dateTo]);

  // Fetch from server
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    pipelineApi.listPatients({ page, search: query, runs_filter: runsFilter, date_from: dateFrom, date_to: dateTo })
      .then((res) => {
        if (cancelled) return;
        setLoading(false);
        if (res.ok) {
          setPatients(res.data.results);
          setTotal(res.data.count);
          setTotalPages(res.data.total_pages);
        } else {
          setError(res.error);
        }
      });
    return () => { cancelled = true; };
  }, [page, query, runsFilter, dateFrom, dateTo]);

  const activeFilterCount = [runsFilter, dateFrom, dateTo].filter(Boolean).length;

  function clearFilters() {
    setRunsFilter("");
    setDateFrom("");
    setDateTo("");
  }

  return (
    <div className="space-y-3">

      {addOpen && (
        <AddPatientDialog
          onClose={() => setAddOpen(false)}
          onAdded={() => {
            setAddOpen(false);
            setPage(1);
            setQuery("");
            setRawQuery("");
          }}
        />
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by patient number or name…"
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
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-dark)] shadow-[var(--shadow-brand)] transition-colors"
        >
          <UserPlus className="h-4 w-4" /> Add patient
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-[var(--text-secondary)]">Activity</p>
              <div className="flex gap-2">
                {([{ value: "has_runs", label: "Has runs" }, { value: "no_runs", label: "No runs" }] as const).map(({ value, label }) => (
                  <button
                    key={value}
                    data-active={runsFilter === value}
                    onClick={() => setRunsFilter(runsFilter === value ? "" : value)}
                    className="rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)] transition-colors data-[active=true]:border-[var(--brand)] data-[active=true]:bg-[var(--brand)] data-[active=true]:text-white"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-[var(--text-secondary)]">Last run date</p>
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
          <div className="flex items-center justify-center h-40 text-sm text-[var(--text-muted)]">Loading patients…</div>
        ) : error ? (
          <div className="flex items-center justify-center h-40 text-sm text-red-500">{error}</div>
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 h-40 text-[var(--text-muted)]">
            <Users className="h-8 w-8 opacity-30" />
            <p className="text-sm">{activeFilterCount > 0 || query ? "No patients match your filters." : "No patients found."}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-1)]">
                    {["Patient #", "Name", "Date of Birth", "Runs", "Last Run"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {patients.map((p) => (
                    <tr key={p.id} onClick={() => router.push(`/dashboard/patients/${p.id}`)} className="hover:bg-[var(--surface-1)] transition-colors cursor-pointer">
                      <td className="px-6 py-4 font-medium text-[var(--text-primary)]">#{p.number}</td>
                      <td className="px-6 py-4 text-[var(--text-secondary)]">
                        {patientName(p) ?? <span className="text-[var(--text-muted)]">—</span>}
                      </td>
                      <td className="px-6 py-4 text-xs text-[var(--text-muted)]">{p.date_of_birth ? formatDate(p.date_of_birth) : "—"}</td>
                      <td className="px-6 py-4 text-[var(--text-secondary)]">{p.run_count}</td>
                      <td className="px-6 py-4 text-xs text-[var(--text-muted)]">{formatDate(p.last_run_date)}</td>
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
