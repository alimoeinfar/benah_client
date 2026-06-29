"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImageIcon, Upload, X } from "lucide-react";
import { classificationApi } from "@/lib/api/classification";
import { pipelineApi } from "@/lib/api/pipeline";
import type { PatientSummary } from "@/types/pipeline";

const ACCEPT = "image/jpeg,image/png,image/webp,image/tiff";

export function NewClassificationPage() {
  const router = useRouter();

  // --- patient combobox ---
  const [patientNumber, setPatientNumber] = useState("");
  const [patientQuery,  setPatientQuery]  = useState("");
  const [patients,      setPatients]      = useState<PatientSummary[]>([]);
  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const comboRef = useRef<HTMLDivElement>(null);

  // --- file upload ---
  const [file,        setFile]        = useState<File | null>(null);
  const [dragging,    setDragging]    = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- submit ---
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load existing patients for autocomplete
  useEffect(() => {
    pipelineApi.listPatients().then((res) => {
      if (res.ok) setPatients(res.data.results);
    });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (comboRef.current && !comboRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const patientMatches = useMemo(() => {
    const q = patientQuery.trim().toLowerCase();
    const pool = q
      ? patients.filter((p) => {
          if (String(p.number).includes(q)) return true;
          const name = [p.first_name, p.last_name].filter(Boolean).join(" ").toLowerCase();
          return name.includes(q);
        })
      : patients;
    return pool.slice(0, 8);
  }, [patients, patientQuery]);

  function handlePatientQueryChange(val: string) {
    setPatientQuery(val);
    setDropdownOpen(true);
    const digits = val.trim().replace(/^#/, "");
    if (digits && /^\d+$/.test(digits)) {
      setPatientNumber(digits);
    } else {
      setPatientNumber("");
    }
  }

  function selectPatient(p: PatientSummary) {
    setPatientNumber(String(p.number));
    const name = [p.first_name, p.last_name].filter(Boolean).join(" ");
    setPatientQuery(name ? `${name} — #${p.number}` : `#${p.number}`);
    setDropdownOpen(false);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  async function handleSubmit() {
    if (!file) return;
    setSubmitting(true);
    setSubmitError(null);

    const form = new FormData();
    form.append("file", file);
    if (patientNumber.trim()) form.append("patient_number", patientNumber.trim());

    const createRes = await classificationApi.createRun(form);
    if (!createRes.ok) {
      setSubmitError(createRes.error ?? "Failed to create run");
      setSubmitting(false);
      return;
    }

    const { id, input_path, output_dir } = createRes.data;
    const triggerRes = await classificationApi.triggerRun(id, input_path, output_dir);
    if (!triggerRes.ok) {
      setSubmitError(triggerRes.error ?? "Failed to trigger run");
      setSubmitting(false);
      return;
    }

    router.push(`/dashboard/icp/${id}`);
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 py-2">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">New ICP Analysis</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Upload a fundus image to classify papilledema probability.
        </p>
      </div>

      {/* Patient search */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
          Patient <span className="text-[var(--text-muted)] font-normal">(optional)</span>
        </label>
        <div ref={comboRef} className="relative">
          <input
            type="text"
            placeholder="Search by name or number, or type a number directly…"
            value={patientQuery}
            onChange={(e) => handlePatientQueryChange(e.target.value)}
            onFocus={() => setDropdownOpen(true)}
            className="block w-full rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
          />
          {dropdownOpen && patientMatches.length > 0 && (
            <div className="absolute z-20 left-0 right-0 mt-1 rounded-lg border border-[var(--border)] bg-[var(--surface-0)] shadow-lg overflow-hidden">
              {patientMatches.map((p) => {
                const name = [p.first_name, p.last_name].filter(Boolean).join(" ");
                return (
                  <button
                    key={p.id}
                    type="button"
                    onMouseDown={() => selectPatient(p)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[var(--surface-1)] transition-colors"
                  >
                    <span className="font-mono text-xs text-[var(--text-muted)] shrink-0">#{p.number}</span>
                    {name
                      ? <span className="text-sm text-[var(--text-primary)]">{name}</span>
                      : <span className="text-sm text-[var(--text-muted)]">—</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Upload zone */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
          Fundus image
        </label>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 transition-colors ${
            dragging
              ? "border-[var(--brand)] bg-[var(--brand-light)]"
              : "border-[var(--border)] bg-[var(--surface-0)] hover:border-[var(--brand)] hover:bg-[var(--brand-light)]"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }}
          />
          {file ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <ImageIcon className="h-8 w-8 text-[var(--brand)]" />
              <span className="text-sm font-medium text-[var(--text-primary)]">{file.name}</span>
              <span className="text-xs text-[var(--text-muted)]">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="mt-1 inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
              >
                <X className="h-3 w-3" /> Remove
              </button>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-[var(--text-muted)]" />
              <div className="text-center">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Drop a fundus image here
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">JPG, PNG, WEBP or TIFF</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!file || submitting}
        className="w-full rounded-lg bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-dark)] shadow-[var(--shadow-brand)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting…" : "Run Classification"}
      </button>
    </div>
  );
}
