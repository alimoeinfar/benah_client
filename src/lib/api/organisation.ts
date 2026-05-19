import { apiClient } from "./client";
import type { Member, Organisation } from "@/types/organisation";
import type { User } from "@/types/auth";

export const organisationApi = {
  getOrganisation: () => apiClient.get<Organisation>("/auth/organisation/"),
  getMe: () => apiClient.get<User>("/auth/me/"),
  updateMe: (data: Partial<Pick<User, "name" | "email">>) =>
    apiClient.patch<User>("/auth/me/", data),
  updateOrganisation: (data: Partial<Pick<Organisation, "name" | "contact_email">>) =>
    apiClient.patch<Organisation>("/auth/organisation/", data),
  addMember: (data: { name: string; email: string; password: string; role: string }) =>
    apiClient.post<Member>("/auth/members/", data),
  updateMember: (id: number, data: { name?: string; email?: string; role?: string; password?: string; is_active?: boolean }) =>
    apiClient.patch<Member>(`/auth/members/${id}/`, data),
};
