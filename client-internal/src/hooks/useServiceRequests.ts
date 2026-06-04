import useSWR from "swr";
import { apiClient } from "../services/api";
import type { ServiceRequest } from "../types";

export const useServiceRequests = (enabled: boolean = true) => {
  const { data, error, isLoading, mutate } = useSWR<ServiceRequest[]>(
    enabled ? "/internal/appointments" : null,
    apiClient,
  );

  return {
    requests: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};
