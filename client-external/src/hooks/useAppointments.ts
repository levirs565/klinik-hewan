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
  return useSWRMutation(
    "/appointments",
    async (
      url,
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
      const response = await client.post<Appointment>(url, arg);
      return response.data;
    },
  );
};
