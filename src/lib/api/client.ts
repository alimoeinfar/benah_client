import { API_BASE_URL } from "@/config/api";
import { tokenStorage } from "@/lib/auth";
import type { ApiResponse } from "@/types/api";

function extractError(data: unknown): string {
  if (!data || typeof data !== "object") return "An error occurred";
  const d = data as Record<string, unknown>;
  if (typeof d.detail === "string") return d.detail;
  for (const val of Object.values(d)) {
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string") return val[0];
    if (typeof val === "string") return val;
  }
  return "An error occurred";
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async refreshAccessToken(): Promise<string | null> {
    const refresh = tokenStorage.getRefresh();
    if (!refresh) return null;

    try {
      const res = await fetch(`${this.baseUrl}/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      tokenStorage.setAccess(data.access);
      return data.access as string;
    } catch {
      return null;
    }
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
    retry = true
  ): Promise<ApiResponse<T>> {
    const token = tokenStorage.getAccess();

    const isFormData = options.body instanceof FormData;
    const headers: HeadersInit = {
      // Let the browser set Content-Type (with boundary) for FormData requests.
      ...(!isFormData && { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const res = await fetch(`${this.baseUrl}${path}`, { ...options, headers });

    // Auto-refresh on 401 and retry once
    if (res.status === 401 && retry) {
      const newToken = await this.refreshAccessToken();
      if (newToken) return this.request<T>(path, options, false);
      tokenStorage.clearAll();
      return { ok: false, error: "Session expired. Please log in again." };
    }

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: extractError(data) };
    }

    return { ok: true, data };
  }

  get<T>(path: string) {
    return this.request<T>(path, { method: "GET" });
  }

  post<T>(path: string, body: unknown) {
    return this.request<T>(path, { method: "POST", body: JSON.stringify(body) });
  }

  postForm<T>(path: string, body: FormData) {
    return this.request<T>(path, { method: "POST", body });
  }

  patch<T>(path: string, body: unknown) {
    return this.request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
