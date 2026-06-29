import { apiClient } from "./client";
import type { ClassificationRun, CreateClassificationResponse } from "@/types/classification";

export interface PaginatedClassificationRuns {
  count:       number;
  total_pages: number;
  page:        number;
  results:     ClassificationRun[];
}

type ListParams = {
  page?: number;
};

function qs(params: Record<string, string | number | undefined>): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

export const classificationApi = {
  listRuns: (params?: ListParams) =>
    apiClient.get<PaginatedClassificationRuns>(`/pipeline/classification/${qs(params ?? {})}`),

  getRun: (id: number | string) =>
    apiClient.get<ClassificationRun>(`/pipeline/classification/${id}/`),

  createRun: (form: FormData) =>
    apiClient.postForm<CreateClassificationResponse>("/pipeline/classification/", form),

  triggerRun: (id: number, inputPath: string, outputDir: string) =>
    apiClient.post<{ detail: string; run_id: number }>(
      `/pipeline/classification/${id}/trigger/`,
      { input_path: inputPath, output_dir: outputDir }
    ),
};
