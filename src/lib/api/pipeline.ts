import { apiClient } from "./client";
import type { DashboardStats, Feature, Job, PatientOutput, PatientSummary, RunDetail } from "@/types/pipeline";

export interface CreateJobResponse extends Job {
  input_path: string;
  output_dir: string;
}

export interface PaginatedResponse<T> {
  count:       number;
  total_pages: number;
  page:        number;
  results:     T[];
}

type RunParams = {
  page?:      number;
  search?:    string;
  status?:    string;
  type?:      string;
  date_from?: string;
  date_to?:   string;
};

type PatientParams = {
  page?:         number;
  search?:       string;
  runs_filter?:  string;
  date_from?:    string;
  date_to?:      string;
};

function qs(params: Record<string, string | number | undefined>): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

export const pipelineApi = {
  getDashboardStats: () => apiClient.get<DashboardStats>("/dashboard/stats/"),
  listOrgFeatures:   () => apiClient.get<Feature[]>("/pipeline/features/"),
  listJobs:          (params?: RunParams) =>
    apiClient.get<PaginatedResponse<Job>>(`/pipeline/jobs/${qs(params ?? {})}`),
  getJob:            (id: string) => apiClient.get<RunDetail>(`/pipeline/jobs/${id}/`),
  createJob:         (form: FormData) => apiClient.postForm<CreateJobResponse>("/pipeline/jobs/", form),
  triggerJob:        (id: number, inputPath: string, outputDir: string) =>
    apiClient.post<{ detail: string; run_id: number }>(`/pipeline/jobs/${id}/trigger/`, {
      input_path: inputPath,
      output_dir: outputDir,
    }),
  batchUpload:       (form: FormData) => apiClient.postForm<{ queued: number; run_ids: number[] }>("/pipeline/batch/", form),
  listPatients:      (params?: PatientParams) =>
    apiClient.get<PaginatedResponse<PatientSummary>>(`/pipeline/patients/${qs(params ?? {})}`),
  createPatient:     (data: { number: number; first_name?: string; last_name?: string; date_of_birth?: string }) =>
    apiClient.post<PatientSummary>("/pipeline/patients/", data),
  getPatientRuns:    (id: number) => apiClient.get<Job[]>(`/pipeline/patients/${id}/runs/`),
  getPatientOutputs: (id: number) =>
    apiClient.get<PatientOutput[]>(`/pipeline/patients/${id}/outputs/`),
};
