export interface Notification {
  id:         number;
  run:        number | null;
  type:       "run_completed" | "run_failed";
  message:    string;
  is_read:    boolean;
  created_at: string;
}
