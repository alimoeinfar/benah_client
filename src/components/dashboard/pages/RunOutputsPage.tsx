"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Download, FileText, ImageIcon, FlaskConical,
  LayoutList, LayoutGrid, Video as VideoIcon,
  X, ChevronLeft, ChevronRight,
} from "lucide-react";
import { pipelineApi } from "@/lib/api/pipeline";
import type { RunDetail, RunOutput, JobStatus } from "@/types/pipeline";

// ─── Analysis results types ────────────────────────────────────────────────────

interface AvgMetricsFlags {
  insufficient_arteries: boolean;
  insufficient_veins:    boolean;
  arteries_found:        number;
  veins_found:           number;
}

interface AvmMetrics {
  CRAE_um:       number | null;
  CRVE_um:       number | null;
  AVR:           number | null;
  metrics_flags: AvgMetricsFlags;
}

interface RegionData {
  fractal_dimension: number | null;
  caliber?: Record<string, number | null>;
  avr_metrics?: AvmMetrics;
}

type AnalysisResults = Record<string, RegionData>;

interface Props { runId: number }

type ViewMode = "list" | "media";

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

const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "webp", "tiff", "tif", "gif", "bmp"]);
const VIDEO_EXTS = new Set(["mp4", "mov", "avi", "mkv", "webm"]);

function ext(o: RunOutput) {
  // Prefer the actual file URL/path for extension detection; fall back to name.
  const src = o.file || o.name;
  return src.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
}

function isImage(o: RunOutput) { return IMAGE_EXTS.has(ext(o)); }
function isVideo(o: RunOutput) { return VIDEO_EXTS.has(ext(o)); }

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Analysis results table ────────────────────────────────────────────────────

const REGION_ORDER = ["Global", "Optic Disc", "Inner Ring", "Outer Ring"];

function fmt(v: number | null | undefined, decimals = 2): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return v.toFixed(decimals);
}

function fmtInt(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return Math.round(v).toString();
}

function AnalysisResultsCard({ fileUrl }: { fileUrl: string }) {
  const [data,    setData]    = useState<AnalysisResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    fetch(fileUrl)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((json: AnalysisResults) => { setData(json); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [fileUrl]);

  if (loading) return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-0)] shadow-[var(--shadow-sm)]">
      <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-1)]">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Analysis Results</p>
      </div>
      <div className="flex items-center justify-center h-24 text-sm text-[var(--text-muted)]">
        Loading…
      </div>
    </div>
  );

  if (error || !data) return null;

  const rows = REGION_ORDER.filter((r) => r in data);

  const COLS = [
    { label: "Region",              key: "region"   },
    { label: "Fractal Dimension",   key: "fd"       },
    { label: "CRAE (micrometre)",   key: "crae"     },
    { label: "CRVE (micrometre)",   key: "crve"     },
    { label: "AVR",                 key: "avr"      },
    { label: "Arteries found",      key: "art"      },
    { label: "Veins found",         key: "vein"     },
  ];

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-0)] shadow-[var(--shadow-sm)] overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-1)]">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Analysis Results</p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Vessel metrics per retinal region</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--surface-2)]">
              {COLS.map((c) => (
                <th
                  key={c.key}
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] whitespace-nowrap"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {rows.map((region) => {
              const d   = data[region];
              const avm = d.avr_metrics;
              const isGlobal = region === "Global";
              return (
                <tr key={region} className="hover:bg-[var(--surface-1)] transition-colors">
                  <td className="px-5 py-3 font-medium text-[var(--text-primary)] whitespace-nowrap">
                    {region}
                  </td>
                  <td className="px-5 py-3 text-[var(--text-secondary)] tabular-nums">
                    {fmt(d.fractal_dimension, 4)}
                  </td>
                  <td className="px-5 py-3 text-[var(--text-secondary)] tabular-nums">
                    {isGlobal ? "—" : fmtInt(avm?.CRAE_um)}
                  </td>
                  <td className="px-5 py-3 text-[var(--text-secondary)] tabular-nums">
                    {isGlobal ? "—" : fmtInt(avm?.CRVE_um)}
                  </td>
                  <td className="px-5 py-3 text-[var(--text-secondary)] tabular-nums">
                    {isGlobal ? "—" : fmt(avm?.AVR)}
                  </td>
                  <td className="px-5 py-3 text-[var(--text-secondary)] tabular-nums">
                    {isGlobal ? "—" : (avm?.metrics_flags.arteries_found ?? "—")}
                  </td>
                  <td className="px-5 py-3 text-[var(--text-secondary)] tabular-nums">
                    {isGlobal ? "—" : (avm?.metrics_flags.veins_found ?? "—")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Sub-views ────────────────────────────────────────────────────────────────

function ListView({ outputs }: { outputs: RunOutput[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--surface-1)]">
            {["Name", "Artifact", "Type", "Generated", ""].map((h) => (
              <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {outputs.map((o) => {
            const isPdf = ext(o) === "pdf";
            const img   = isImage(o);
            return (
              <tr key={o.id} className="hover:bg-[var(--surface-1)] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      isPdf ? "bg-red-50 text-red-600"
                      : img  ? "bg-violet-50 text-violet-600"
                             : "bg-gray-50 text-gray-500"
                    }`}>
                      {isPdf ? <FileText className="h-4 w-4" />
                       : img  ? <ImageIcon className="h-4 w-4" />
                              : <FileText className="h-4 w-4" />}
                    </div>
                    <span className="font-medium text-[var(--text-primary)]">{o.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[var(--text-secondary)]">{o.artifact?.name ?? "—"}</td>
                <td className="px-6 py-4 text-xs text-[var(--text-secondary)]">{o.type}</td>
                <td className="px-6 py-4 text-xs text-[var(--text-muted)]">{formatDate(o.created_at)}</td>
                <td className="px-6 py-4 text-right">
                  <a href={o.file} download className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand)] hover:text-[var(--brand-dark)] transition-colors">
                    <Download className="h-3.5 w-3.5" /> Download
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Lightbox ──────────────────────────────────────────────────────────────────

interface LightboxProps {
  images: RunOutput[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function Lightbox({ images, index, onClose, onPrev, onNext }: LightboxProps) {
  const o = images[index];

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape")     onClose();
    if (e.key === "ArrowLeft")  onPrev();
    if (e.key === "ArrowRight") onNext();
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={o.file}
        alt={o.name}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
      />

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Caption + download */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-full bg-black/50 backdrop-blur-sm px-4 py-2">
        <span className="text-sm font-medium text-white">{o.name}</span>
        {images.length > 1 && (
          <span className="text-xs text-white/50">{index + 1} / {images.length}</span>
        )}
        <a
          href={o.file}
          download
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-xs font-semibold text-white/70 hover:text-white transition-colors"
        >
          <Download className="h-3.5 w-3.5" /> Download
        </a>
      </div>
    </div>
  );
}

// ─── Media view ────────────────────────────────────────────────────────────────

function MediaView({ outputs }: { outputs: RunOutput[] }) {
  const images = outputs.filter(isImage);
  const videos = outputs.filter(isVideo);
  const others = outputs.filter((o) => !isImage(o) && !isVideo(o));

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevImage     = useCallback(() => setLightboxIndex((i) => i === null ? null : (i - 1 + images.length) % images.length), [images.length]);
  const nextImage     = useCallback(() => setLightboxIndex((i) => i === null ? null : (i + 1) % images.length), [images.length]);

  return (
    <>
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}

    <div className="p-6 space-y-8">

      {/* Images */}
      {images.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-[var(--text-muted)]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Images · {images.length}
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((o, idx) => (
              <div
                key={o.id}
                onClick={() => setLightboxIndex(idx)}
                className="group relative rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface-1)] aspect-square cursor-zoom-in"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={o.file}
                  alt={o.name}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3">
                  <p className="text-xs font-medium text-white truncate">{o.name}</p>
                  <a
                    href={o.file}
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1.5 inline-flex w-fit items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-white/30 transition-colors"
                  >
                    <Download className="h-3 w-3" /> Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <VideoIcon className="h-4 w-4 text-[var(--text-muted)]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Videos · {videos.length}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {videos.map((o) => (
              <div key={o.id} className="space-y-2">
                <video
                  src={o.file}
                  controls
                  className="w-full rounded-xl border border-[var(--border)] bg-black"
                />
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs font-medium text-[var(--text-primary)] truncate">{o.name}</p>
                  <a
                    href={o.file}
                    download
                    className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand)] hover:text-[var(--brand-dark)] transition-colors"
                  >
                    <Download className="h-3 w-3" /> Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Other files */}
      {others.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[var(--text-muted)]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Other files · {others.length}
            </h3>
          </div>
          <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] overflow-hidden">
            {others.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-4 px-4 py-3 bg-[var(--surface-0)] hover:bg-[var(--surface-1)] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{o.name}</p>
                    {o.artifact?.name && (
                      <p className="text-xs text-[var(--text-muted)]">{o.artifact.name}</p>
                    )}
                  </div>
                </div>
                <a
                  href={o.file}
                  download
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-0)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
    </>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export function RunOutputsPage({ runId }: Props) {
  const router = useRouter();
  const [run, setRun]         = useState<RunDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("media");

  useEffect(() => {
    pipelineApi.getJob(String(runId)).then((res) => {
      setLoading(false);
      if (res.ok) setRun(res.data);
      else setError(res.error);
    });
  }, [runId]);

  return (
    <div className="space-y-6">

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Run summary card */}
      {run && (
        <div className="flex flex-wrap items-center gap-6 rounded-xl border border-[var(--border)] bg-[var(--surface-0)] px-6 py-4 shadow-[var(--shadow-sm)]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Run</p>
            <p className="text-sm font-mono font-semibold text-[var(--text-primary)]">#{run.id}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Patient</p>
            <p className="text-sm font-semibold text-[var(--text-primary)]">{run.patient ? `#${run.patient.number}` : "—"}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Type</p>
            <p className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
              <FlaskConical className="h-3.5 w-3.5" /> {run.type}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Status</p>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_CX[run.status]}`}>
              {run.status === "running" && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />}
              {STATUS_LABEL[run.status]}
            </span>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Started</p>
            <p className="text-sm text-[var(--text-muted)]">{formatDate(run.created_at)}</p>
          </div>
          {run.features.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Features</p>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {run.features.map((f) => (
                  <span key={f.id} className="rounded-full bg-[var(--brand-subtle)] px-2 py-0.5 text-xs font-medium text-[var(--brand)]">
                    {f.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {run.features.some((f) => f.name.toLowerCase() === "segmentation") && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Seg. model</p>
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-secondary)]">
                {run.seg_mode === "mtl" ? "MTL" : "Dual"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Analysis results table — shown when the run has an analysis_results.json */}
      {run && run.status === "completed" && (() => {
        const analysisOutput = run.outputs.find(
          (o) => o.artifact?.output_key?.endsWith("analysis_results.json")
        );
        return analysisOutput ? <AnalysisResultsCard fileUrl={analysisOutput.file} /> : null;
      })()}

      {/* Outputs card */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-0)] shadow-[var(--shadow-sm)] overflow-hidden">

        {/* Card header with view toggle */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-1)]">
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">Outputs</p>
            {!loading && !error && run && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {run.outputs.length} file{run.outputs.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* View toggle */}
          {!loading && !error && run && run.outputs.length > 0 && (
            <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-0)] p-1">
              <button
                onClick={() => setViewMode("media")}
                title="Media view"
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === "media"
                    ? "bg-[var(--brand)] text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Media
              </button>
              <button
                onClick={() => setViewMode("list")}
                title="List view"
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-[var(--brand)] text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <LayoutList className="h-3.5 w-3.5" /> List
              </button>
            </div>
          )}
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center h-40 text-sm text-[var(--text-muted)]">
            Loading outputs…
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-40 text-sm text-red-500">
            {error}
          </div>
        ) : !run || run.outputs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 h-40 text-[var(--text-muted)]">
            <FileText className="h-8 w-8 opacity-30" />
            <p className="text-sm">No outputs yet for this run.</p>
          </div>
        ) : viewMode === "list" ? (
          <ListView outputs={run.outputs} />
        ) : (
          <MediaView outputs={run.outputs} />
        )}
      </div>
    </div>
  );
}
