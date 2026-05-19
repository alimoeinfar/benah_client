import type { User } from "@/types/auth";

const ACCESS_KEY  = "benah_access";
const REFRESH_KEY = "benah_refresh";
const USER_KEY    = "benah_user";

const safe = (fn: () => void) => {
  if (typeof window !== "undefined") fn();
};

export const tokenStorage = {
  getAccess: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem(ACCESS_KEY) : null,

  getRefresh: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null,

  setTokens: (access: string, refresh: string): void =>
    safe(() => {
      localStorage.setItem(ACCESS_KEY, access);
      localStorage.setItem(REFRESH_KEY, refresh);
    }),

  setAccess: (access: string): void =>
    safe(() => localStorage.setItem(ACCESS_KEY, access)),

  clearAll: (): void =>
    safe(() => {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(USER_KEY);
    }),

  // kept for backwards compat with any existing call sites
  get: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem(ACCESS_KEY) : null,
};

export const userStorage = {
  get: (): User | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  },

  set: (user: User): void =>
    safe(() => localStorage.setItem(USER_KEY, JSON.stringify(user))),

  clear: (): void =>
    safe(() => localStorage.removeItem(USER_KEY)),
};
