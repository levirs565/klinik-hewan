import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { apiClient, client } from "../services/api";
import type { Appointment, CreateAppointmentRequest } from "../types";

export const useAppointments = (filter?: "upcoming" | "past") => {
  const url = filter ? `/appointments?filter=${filter}` : "/appointments";
  const { data, error, isLoading, mutate } = useSWR<Appointment[]>(
    url,
    apiClient,
  );

  return {
    appointments: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

export const useCreateAppointment = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    "/appointments",
    async (
      _,
      { arg }: { arg: CreateAppointmentRequest },
    ): Promise<{ id: string }> => {
      const response = await client.post<{ id: string }>("/appointments", arg);
      return response.data;
    },
  );

  return {
    trigger,
    isCreating: isMutating,
    error,
  };
};
