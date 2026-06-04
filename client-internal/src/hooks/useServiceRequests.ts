import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { apiClient, client } from "../services/api";
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

export const useAppointmentDetail = (id?: string) => {
  const { data, error, isLoading, mutate } = useSWR<any>(
    id ? `/internal/appointments/${id}` : null,
    apiClient,
  );

  return {
    appointment: data,
    isLoading,
    isError: error,
    mutate,
  };
};

export const useApproveAppointment = (id?: string) => {
  return useSWRMutation(
    id ? `/internal/appointments/${id}` : null,
    async (url) => {
      const response = await client.post(`${url}/approve`);
      return response.data;
    },
  );
};

export const useRejectAppointment = (id?: string) => {
  return useSWRMutation(
    id ? `/internal/appointments/${id}` : null,
    async (url, { arg }: { arg: { reason: string } }) => {
      const response = await client.post(`${url}/reject`, arg);
      return response.data;
    },
  );
};

export const useAssignDoctor = (id?: string) => {
  return useSWRMutation(
    id ? `/internal/appointments/${id}` : null,
    async (url, { arg }: { arg: { doctor_id: number } }) => {
      const response = await client.post(`${url}/select-doctor`, arg);
      return response.data;
    },
  );
};

export const useDoctorApproveAppointment = (id?: string) => {
  return useSWRMutation(
    id ? `/internal/appointments/${id}` : null,
    async (url) => {
      const response = await client.post(`${url}/doctor-approve`);
      return response.data;
    },
  );
};

export const useDoctorRejectAppointment = (id?: string) => {
  return useSWRMutation(
    id ? `/internal/appointments/${id}` : null,
    async (url, { arg }: { arg: { reason: string } }) => {
      const response = await client.post(`${url}/doctor-reject`, arg);
      return response.data;
    },
  );
};
