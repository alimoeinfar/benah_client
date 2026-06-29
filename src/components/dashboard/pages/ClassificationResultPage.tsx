"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { classificationApi } from "@/lib/api/classification";
import { API_BASE_URL } from "@/config/api";
import type { ClassificationRun, ClassificationStatus } from "@/types/classification";

const POLL_INTERVAL = 3_000;

const STATUS_LABEL: Record<ClassificationStatus, string> = {
  pending:   "Pending",
  running:   "Processing…",
  completed: "Completed",
  failed:    "Failed",
  rejected:  "Rejected",
};

const STATUS_CX: Record<ClassificationStatus, string> = {
  completed: "bg-green-50 text-green-700 border-green-100",
  running:   "bg-blue-50 text-blue-700 border-blue-100",
  pending:   "bg-gray-50 text-gray-600 border-gray-200",
  failed:    "bg-red-50 text-red-600 border-red-100",
  rejected:  "bg-orange-50 text-orange-600 border-orange-100",
};

function imageUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const base = API_BASE_URL.replace(/\/api\/v1\/?$/, "");
  return `${base}/media/${path.replace(/^\/?(media\/)?/, "")}`;
}

interface Props {
  id: string;
}

export function ClassificationResultPage({ id }: Props) {
  const router = useRouter();
  const [run,     setRun]     = useState<ClassificationRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  async function fetchRun() {
    const res = await classificationApi.getRun(id);
    if (!res.ok) {
      setError(res.error ?? "Failed to load result");
      setLoading(false);
      stopPolling();
      return;
    }
    setRun(res.data);
    setLoading(false);

    const done = res.data.status === "completed" || res.data.status === "failed";
    if (done) stopPolling();
  }

  useEffect(() => {
    fetchRun();
    intervalRef.current = setInterval(fetchRun, POLL_INTERVAL);
    return stopPolling;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-2">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> ICP Module
      </button>

      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">
          Classification Result
        </h1>
        {run && (
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_CX[run.status]}`}
          >
            {STATUS_LABEL[run.status]}
          </span>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-[var(--text-muted)] text-sm">
          Loading…
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {run && (run.status === "pending" || run.status === "running") && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-0)] px-6 py-10 text-center shadow-[var(--shadow-sm)]">
          <p className="text-[var(--text-muted)] text-sm">
            Classification is running. This page will update automatically.
          </p>
        </div>
      )}

      {run?.status === "failed" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
          The classification run failed. Please try again.
        </div>
      )}

      {run?.status === "completed" && run.classification_result && (
        <div className="space-y-5">
          {/* Input image */}
          {run.classification_result.input_image && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-0)] shadow-[var(--shadow-sm)] overflow-hidden">
              <img
                src={imageUrl(run.classification_result.input_image)}
                alt="Uploaded fundus image"
                className="w-full object-contain max-h-96"
              />
            </div>
          )}

          {/* Probability score */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-0)] shadow-[var(--shadow-sm)] px-6 py-6 text-center">
            <p className="text-sm text-[var(--text-muted)] mb-2">Probability of Papilledema</p>
            <p className="text-5xl font-bold text-[var(--brand)]">
              {(run.classification_result.papilledema_probability * 100).toFixed(2)}
              <span className="text-2xl font-semibold">%</span>
            </p>
            {run.patient && (
              <p className="mt-3 text-xs text-[var(--text-muted)]">
                Patient #{run.patient.number}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
