export interface Feature {
  id: number;
  name: string;
  description: string;
  pipeline_key: string;
}

export type JobStatus = "pending" | "running" | "completed" | "failed" | "rejected";

export interface Job {
  id: number;
  status: JobStatus;
  type: string;
  seg_mode: "dual" | "mtl";
  patient: { id: number; number: number } | null;
  features: { id: number; name: string }[];
  rejection_message: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_runs:  number;
  active_runs: number;
  total_files: number;
  credits:     string;
  recent_runs: Job[];
}

export interface PatientSummary {
  id: number;
  number: number;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  run_count: number;
  last_run_date: string | null;
}

export interface PatientOutput {
  id: number;
  name: string;
  type: string;
  created_at: string;
  run_id: number;
  file: string;
}

export interface RunOutput {
  id: number;
  type: string;
  name: string;
  file: string;
  artifact: { id: number; name: string; description: string; output_key: string; feature: number; cost: number } | null;
  created_at: string;
}

export interface RunDetail extends Job {
  outputs: RunOutput[];
}
