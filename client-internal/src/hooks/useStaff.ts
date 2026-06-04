import useSWR from "swr";
import { apiClient } from "../services/api";
import type { StaffMember, StaffDetail } from "../types";

export const useStaffMembers = (enabled: boolean = true) => {
  const { data, error, isLoading, mutate } = useSWR<StaffMember[]>(
    enabled ? "/staff" : null,
    apiClient,
  );

  return {
    staffMembers: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

export const useDoctors = (enabled: boolean = true) => {
  const { data, error, isLoading, mutate } = useSWR<StaffMember[]>(
    enabled ? "/staff/doctors" : null,
    apiClient,
  );

  return {
    doctors: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

export const useDoctorDetail = (id?: string | number) => {
  const { data, error, isLoading, mutate } = useSWR<StaffDetail>(
    id ? `/staff/doctor/${id}` : null,
    apiClient,
  );

  return {
    doctor: data,
    isLoading,
    isError: error,
    mutate,
  };
};

export const useReceptionistDetail = (id?: string | number) => {
  const { data, error, isLoading, mutate } = useSWR<StaffDetail>(
    id ? `/staff/receptionist/${id}` : null,
    apiClient,
  );

  return {
    receptionist: data,
    isLoading,
    isError: error,
    mutate,
  };
};

export const useDoctorAppointments = (doctorId?: string | number) => {
  const { data, error, isLoading, mutate } = useSWR<any[]>(
    doctorId ? `/internal/appointments?doctor_id=${doctorId}` : null,
    apiClient,
  );

  return {
    appointments: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};
