"use client";

import { useState, useCallback } from "react";
import type { ApiResponse } from "@/types/api";

interface UseApiState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(async (fn: () => Promise<ApiResponse<T>>) => {
    setState({ data: null, error: null, isLoading: true });
    const result = await fn();
    if (result.ok) {
      setState({ data: result.data, error: null, isLoading: false });
    } else {
      setState({ data: null, error: result.error, isLoading: false });
    }
    return result;
  }, []);

  return { ...state, execute };
}
