import { apiClient } from "./client";
import type { LoginPayload, RegisterPayload, AuthTokens } from "@/types/auth";

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthTokens>("/auth/login/", payload),

  register: (payload: RegisterPayload) =>
    apiClient.post<AuthTokens>("/auth/register/", payload),

  refresh: (refreshToken: string) =>
    apiClient.post<{ access: string }>("/auth/token/refresh/", { refresh: refreshToken }),
};
