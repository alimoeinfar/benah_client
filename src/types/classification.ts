export type ClassificationStatus = "pending" | "running" | "completed" | "failed" | "rejected";

export interface ClassificationResult {
  papilledema_probability: number;
  input_image: string;
  created_at: string;
}

export interface ClassificationRun {
  id: number;
  status: ClassificationStatus;
  patient: { id: number; number: number } | null;
  classification_result: ClassificationResult | null;
  rejection_message: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClassificationResponse extends ClassificationRun {
  input_path: string;
  output_dir: string;
}
