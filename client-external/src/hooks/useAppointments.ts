import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { apiClient, client } from "../services/api";
import type { Appointment } from "../types";

export const useAppointments = () => {
  const { data, error, isLoading, mutate } = useSWR<Appointment[]>(
    "/appointments",
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
      {
        arg,
      }: {
        arg: {
          pet_id: number;
          service_type: Appointment["service_type"];
          scheduled_date: string;
          notes?: string;
        };
      },
    ): Promise<Appointment> => {
      const response = await client.post<Appointment>("/appointments", arg);
      return response.data;
    },
  );

  return {
    trigger,
    isCreating: isMutating,
    error,
  };
};
