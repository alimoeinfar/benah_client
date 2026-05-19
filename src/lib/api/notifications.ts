import { apiClient } from "./client";
import type { Notification } from "@/types/notification";

export const notificationsApi = {
  list:     () => apiClient.get<Notification[]>("/pipeline/notifications/"),
  markRead: () => apiClient.post<{ marked_read: number }>("/pipeline/notifications/read/", {}),
};
