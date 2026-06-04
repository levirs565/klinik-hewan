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

export const useStaffDetail = (id?: string | number) => {
  const { data, error, isLoading, mutate } = useSWR<StaffDetail>(
    id ? `/staff/doctor/${id}` : null, // Note: Server has /doctor/:id and /receptionist/:id
    apiClient,
  );

  return {
    staff: data,
    isLoading,
    isError: error,
    mutate,
  };
};
