"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  ImageIcon,
  Video,
  X,
  FlaskConical,
  CheckSquare,
  Square,
  Archive,
} from "lucide-react";
import { pipelineApi } from "@/lib/api/pipeline";
import type { Feature, PatientSummary } from "@/types/pipeline";

type RunType = "image" | "video";
type SegMode = "dual";

const BATCH_MAX_MB = 500;

const ACCEPT: Record<RunType, string> = {
  image: "image/jpeg,image/png,image/webp,image/tiff",
  video: "video/mp4,video/quicktime,video/x-msvideo,video/x-matroska",
};

const ACCEPT_LABEL: Record<RunType, string> = {
  image: "JPG, PNG, WEBP or TIFF",
  video: "MP4, MOV, AVI or MKV",
};

// Keys that are not applicable for a given run type are hidden entirely.
// Keys that are applicable but required are shown locked.
const VIDEO_LOCKED_KEYS  = new Set(["stabilization"]);
const IMAGE_VISIBLE_KEYS = new Set(["segmentation"]);

export function NewAnalysisPage() {
  const router = useRouter();

  const [patientNumber, setPatientNumber] = useState("");
  const [patientQuery,  setPatientQuery]  = useState("");
  const [patients,      setPatients]      = useState<PatientSummary[]>([]);
  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const comboRef = useRef<HTMLDivElement>(null);
  const [runType, setRunType]             = useState<RunType>("image");
  const [file, setFile]                   = useState<File | null>(null);
  const [dragging, setDragging]           = useState(false);

  const [features, setFeatures]           = useState<Feature[]>([]);
  const [selectedKeys, setSelectedKeys]   = useState<Set<string>>(new Set());
  const [featuresLoading, setFeaturesLoading] = useState(true);
  const [segMode, setSegMode]             = useState<SegMode>("dual");
  const [submitting, setSubmitting]       = useState(false);
  const [submitError, setSubmitError]     = useState<string | null>(null);

  const inputRef      = useRef<HTMLInputElement>(null);
  const batchInputRef = useRef<HTMLInputElement>(null);

  const [batchFile,       setBatchFile]       = useState<File | null>(null);
  const [batchDragging,   setBatchDragging]   = useState(false);
  const [batchSubmitting, setBatchSubmitting] = useState(false);
  const [batchError,      setBatchError]      = useState<string | null>(null);
  const [batchSegMode,    setBatchSegMode]    = useState<SegMode>("dual");

  useEffect(() => {
    pipelineApi.listPatients().then((res) => {
      if (res.ok) setPatients(res.data.results);
    });
  }, []);

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

  // Fetch org-allowed features on mount and pre-select all of them.
  useEffect(() => {
    pipelineApi.listOrgFeatures().then((res) => {
      if (res.ok) {
        setFeatures(res.data);
        setSelectedKeys(new Set(res.data.map((f) => f.pipeline_key)));
      }
      setFeaturesLoading(false);
    });
  }, []);

  // Derive per-render which features are visible and which are locked.
  const visibleFeatures = runType === "image"
    ? features.filter((f) => IMAGE_VISIBLE_KEYS.has(f.pipeline_key))
    : features;

  const isLocked = (key: string) =>
    runType === "image"
      ? IMAGE_VISIBLE_KEYS.has(key)   // image: segmentation is locked (only option)
      : VIDEO_LOCKED_KEYS.has(key);   // video: stabilization is locked (base step)

  const toggleFeature = (key: string) => {
    if (isLocked(key)) return;
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleFile = useCallback((f: File) => {
    setFile(f);
  }, []);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) handleFile(picked);
  };

  // Clear the file when run type changes so the wrong file type can't linger
  const handleRunTypeChange = (type: RunType) => {
    setRunType(type);
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  function handleBatchFile(f: File) {
    setBatchError(null);
    if (f.size > BATCH_MAX_MB * 1024 * 1024) {
      setBatchError(`ZIP must not exceed ${BATCH_MAX_MB} MB.`);
      return;
    }
    setBatchFile(f);
  }

  async function handleBatchSubmit() {
    if (!batchFile || batchSubmitting) return;
    setBatchSubmitting(true);
    setBatchError(null);
    try {
      const form = new FormData();
      form.append("file", batchFile);
      form.append("segmentation_mode", batchSegMode);
      const res = await pipelineApi.batchUpload(form);
      if (!res.ok) {
        setBatchError(res.error);
      } else {
        router.push("/dashboard/pipeline");
      }
    } catch {
      setBatchError("Unexpected error. Please try again.");
    } finally {
      setBatchSubmitting(false);
    }
  }

  const isReady = patientNumber.trim() !== "" && file !== null && visibleFeatures.length > 0;

  const handleSubmit = async () => {
    if (!isReady || submitting || !file) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const form = new FormData();
      form.append("patient_number", patientNumber);
      form.append("type", runType);
      form.append("file", file);
      const effectiveKeys = visibleFeatures
        .map((f) => f.pipeline_key)
        .filter((k) => selectedKeys.has(k));
      form.append("selected_features", JSON.stringify(effectiveKeys));
      if (runType === "image") {
        form.append("segmentation_mode", segMode);
      }

      const createRes = await pipelineApi.createJob(form);
      if (!createRes.ok) {
        setSubmitError(createRes.error);
        return;
      }

      const { id, input_path, output_dir } = createRes.data;

      const triggerRes = await pipelineApi.triggerJob(id, input_path, output_dir);
      if (!triggerRes.ok) {
        setSubmitError(triggerRes.error);
        return;
      }

      router.push("/dashboard/pipeline");
    } catch {
      setSubmitError("Unexpected error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Pipeline
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

      {/* Form card */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-0)] shadow-[var(--shadow-sm)] overflow-hidden divide-y divide-[var(--border)]">

        {/* Patient search */}
        <div className="p-6 space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            Patient
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

        {/* Run type */}
        <div className="p-6 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            Run type
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(["image", "video"] as RunType[]).map((type) => {
              const Icon    = type === "image" ? ImageIcon : Video;
              const label   = type === "image" ? "Image" : "Video";
              const active  = runType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleRunTypeChange(type)}
                  className={`flex items-center gap-3 rounded-xl border-2 px-5 py-4 text-sm font-semibold transition-colors ${
                    active
                      ? "border-[var(--brand)] bg-[var(--brand-light)] text-[var(--brand)]"
                      : "border-[var(--border)] bg-[var(--surface-0)] text-[var(--text-secondary)] hover:bg-[var(--surface-1)]"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "text-[var(--brand)]" : "text-[var(--text-muted)]"}`} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload */}
        <div className="p-6 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            Upload file
          </p>

          {file ? (
            <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-light)]">
                {runType === "image"
                  ? <ImageIcon className="h-4 w-4 text-[var(--brand)]" />
                  : <Video className="h-4 w-4 text-[var(--brand)]" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{file.name}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="shrink-0 rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 cursor-pointer transition-colors ${
                dragging
                  ? "border-[var(--brand)] bg-[var(--brand-light)]"
                  : "border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--brand)] hover:bg-[var(--brand-light)]"
              }`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                dragging ? "bg-[var(--brand)] text-white" : "bg-[var(--surface-2)] text-[var(--text-muted)]"
              }`}>
                <Upload className="h-5 w-5" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {dragging ? "Drop to upload" : "Drag & drop or click to browse"}
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {ACCEPT_LABEL[runType]}
                </p>
              </div>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT[runType]}
            onChange={onFileChange}
            className="sr-only"
          />
        </div>

        {/* Feature selection */}
        <div className="p-6 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            Pipeline features
          </p>

          {featuresLoading ? (
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--brand)]" />
              Loading available features…
            </div>
          ) : features.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">
              No features are configured for your organisation.
            </p>
          ) : (
            <div className="space-y-2">
              {visibleFeatures.map((feature) => {
                const locked   = isLocked(feature.pipeline_key);
                const selected = selectedKeys.has(feature.pipeline_key);
                return (
                  <button
                    key={feature.pipeline_key}
                    type="button"
                    onClick={() => toggleFeature(feature.pipeline_key)}
                    disabled={locked}
                    className={`w-full flex items-start gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-colors ${
                      selected
                        ? "border-[var(--brand)] bg-[var(--brand-light)]"
                        : "border-[var(--border)] bg-[var(--surface-0)] hover:bg-[var(--surface-1)]"
                    } ${locked ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <span className={`mt-0.5 shrink-0 ${selected ? "text-[var(--brand)]" : "text-[var(--text-muted)]"}`}>
                      {selected
                        ? <CheckSquare className="h-4 w-4" />
                        : <Square className="h-4 w-4" />}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className={`block text-sm font-semibold ${selected ? "text-[var(--brand)]" : "text-[var(--text-primary)]"}`}>
                        {feature.name}
                        {locked && (
                          <span className="ml-2 text-[10px] font-normal uppercase tracking-wide text-[var(--text-muted)]">
                            required
                          </span>
                        )}
                      </span>
                      {feature.description && (
                        <span className="block mt-0.5 text-xs text-[var(--text-muted)]">
                          {feature.description}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Segmentation model — dual mode only */}
        {runType === "image" && selectedKeys.has("segmentation") && (
          <div className="px-6 pb-4">
            <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3">
              <span className="text-sm font-medium text-[var(--text-primary)]">Dual mode</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Two specialised models — best accuracy
              </span>
            </div>
          </div>
        )}

        {/* Footer / Run button */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-[var(--surface-1)]">
          {submitError ? (
            <p className="text-sm text-red-500">{submitError}</p>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={submitting}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isReady || submitting}
              className={`inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-brand)] transition-opacity ${
                isReady && !submitting ? "opacity-100 cursor-pointer" : "opacity-40 cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <FlaskConical className="h-4 w-4" />
              )}
              {submitting ? "Submitting…" : "Run analysis"}
            </button>
          </div>
        </div>
      </div>

      {/* Batch ZIP upload */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-0)] shadow-[var(--shadow-sm)] overflow-hidden divide-y divide-[var(--border)] lg:self-start">

        {/* Header */}
        <div className="p-6 space-y-1">
          <div className="flex items-center gap-2">
            <Archive className="h-4 w-4 text-[var(--brand)]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Batch ZIP upload</h2>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Upload a ZIP file (max {BATCH_MAX_MB} MB) containing images. Any image whose filename
            is a number (e.g. <span className="font-mono">1234.jpg</span>) is queued for
            segmentation — the number becomes the patient ID. Other files are skipped.
          </p>
        </div>

        {/* Drop zone */}
        <div className="p-6 space-y-3">
          {batchFile ? (
            <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-light)]">
                <Archive className="h-4 w-4 text-[var(--brand)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{batchFile.name}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {(batchFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setBatchFile(null); if (batchInputRef.current) batchInputRef.current.value = ""; }}
                className="shrink-0 rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setBatchDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setBatchDragging(false); }}
              onDrop={(e) => { e.preventDefault(); setBatchDragging(false); const f = e.dataTransfer.files[0]; if (f) handleBatchFile(f); }}
              onClick={() => batchInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 cursor-pointer transition-colors ${
                batchDragging
                  ? "border-[var(--brand)] bg-[var(--brand-light)]"
                  : "border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--brand)] hover:bg-[var(--brand-light)]"
              }`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                batchDragging ? "bg-[var(--brand)] text-white" : "bg-[var(--surface-2)] text-[var(--text-muted)]"
              }`}>
                <Archive className="h-5 w-5" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {batchDragging ? "Drop to upload" : "Drag & drop or click to browse"}
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">ZIP — max {BATCH_MAX_MB} MB</p>
              </div>
            </div>
          )}

          <input
            ref={batchInputRef}
            type="file"
            accept=".zip,application/zip"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleBatchFile(f); }}
            className="sr-only"
          />
        </div>

        {/* Batch segmentation model — dual mode only */}
        <div className="px-6 pb-4 pt-2 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3">
            <span className="text-sm font-medium text-[var(--text-primary)]">Dual mode</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Two specialised models — best accuracy
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-[var(--surface-1)]">
          <div>
            {batchError && <p className="text-sm text-red-500">{batchError}</p>}
          </div>
          <button
            type="button"
            onClick={handleBatchSubmit}
            disabled={!batchFile || batchSubmitting}
            className={`inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-brand)] transition-opacity ${
              batchFile && !batchSubmitting ? "opacity-100 cursor-pointer" : "opacity-40 cursor-not-allowed"
            }`}
          >
            {batchSubmitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Archive className="h-4 w-4" />
            )}
            {batchSubmitting ? "Uploading…" : "Queue batch"}
          </button>
        </div>
      </div>

      </div>{/* end grid */}
    </div>
  );
}
