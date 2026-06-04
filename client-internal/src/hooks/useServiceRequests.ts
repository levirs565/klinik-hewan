import useSWR from "swr";
import { apiClient } from "../services/api";
import type { ServiceRequest } from "../types";

export interface ServiceRequestFilter {
  status?: string;
  date?: string;
  my_appointments?: boolean;
}

export const useServiceRequests = (
  filter: ServiceRequestFilter = {},
  enabled: boolean = true,
) => {
  const params = new URLSearchParams();
  if (filter.status) params.append("status", filter.status);
  if (filter.date) params.append("date", filter.date);
  if (filter.my_appointments) params.append("my_appointments", "true");

  const queryString = params.toString();
  const url = `/internal/appointments${queryString ? `?${queryString}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<ServiceRequest[]>(
    enabled ? url : null,
    apiClient,
  );

  return {
    requests: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};
