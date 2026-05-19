"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User, AuthTokens } from "@/types/auth";
import { tokenStorage, userStorage } from "@/lib/auth";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (tokens: AuthTokens) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]           = useState<User | null>(null);
  const [token, setToken]         = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = tokenStorage.getAccess();
    const storedUser  = userStorage.get();
    if (storedToken) setToken(storedToken);
    if (storedUser)  setUser(storedUser);
    setIsLoading(false);
  }, []);

  const setAuth = (tokens: AuthTokens) => {
    setUser(tokens.user);
    setToken(tokens.access);
    tokenStorage.setTokens(tokens.access, tokens.refresh);
    userStorage.set(tokens.user);
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    tokenStorage.clearAll();
    userStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
