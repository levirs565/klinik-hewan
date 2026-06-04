import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import axios from "axios";
import { apiClient, client } from "../services/api";
import type {
  Pet,
  MyPet,
  CreatePetRequest,
  CreatePetResponse,
  PetReminder,
  PetAppointment,
} from "../types";

export const usePets = () => {
  const { data, error, isLoading, mutate } = useSWR<MyPet[]>(
    "/pets",
    apiClient,
  );

  return {
    pets: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

export const usePetDetail = (id?: string) => {
  const { data, error, isLoading, mutate } = useSWR<Pet>(
    id ? `/pets/${id}` : null,
    apiClient,
  );

  return {
    pet: data,
    isLoading,
    isError: error,
    mutate,
  };
};

export const usePetReminders = (id?: string) => {
  const { data, error, isLoading, mutate } = useSWR<PetReminder[]>(
    id ? `/pets/${id}/reminders` : null,
    apiClient,
  );

  return {
    reminders: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

export const usePetAppointments = (id?: string) => {
  const { data, error, isLoading, mutate } = useSWR<PetAppointment[]>(
    id ? `/pets/${id}/appointments` : null,
    apiClient,
  );

  return {
    appointments: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

export const useCreatePet = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    "/pets",
    async (
      _,
      { arg }: { arg: { data: CreatePetRequest; file?: File } },
    ): Promise<CreatePetResponse> => {
      let avatarUploadId = arg.data.avatar_upload_id;

      if (arg.file) {
        const presignedRes = await client.post<{
          url: string;
          upload_id: string;
          headers: Record<string, string>;
        }>("/pets/avatar/presigned-url", {
          content_type: arg.file.type,
          file_size: arg.file.size,
        });
        await axios.put(presignedRes.data.url, arg.file, {
          headers: presignedRes.data.headers,
        });
        avatarUploadId = presignedRes.data.upload_id;
      }

      const response = await client.post<CreatePetResponse>("/pets", {
        ...arg.data,
        avatar_upload_id: avatarUploadId,
      });

      return response.data;
    },
  );

  return {
    trigger,
    isCreating: isMutating,
    error,
  };
};
