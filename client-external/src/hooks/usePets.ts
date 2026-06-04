import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import axios from "axios";
import { apiClient, client } from "../services/api";
import type { Pet, CreatePetRequest, CreatePetResponse } from "../types";

export const usePets = () => {
  const { data, error, isLoading, mutate } = useSWR<Pet[]>("/pets", apiClient);

  return {
    pets: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

export const useCreatePet = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    "/pets",
    async (
      url,
      { arg }: { arg: { data: CreatePetRequest; file?: File } },
    ): Promise<CreatePetResponse> => {
      let avatarId = arg.data.avatar_id;

      if (arg.file) {
        const presignedRes = await client.post<{ url: string; key: string }>(
          "/pets/avatar/presigned-url",
          { content_type: arg.file.type, file_size: arg.file.size },
        );
        await axios.put(presignedRes.data.url, arg.file, {
          headers: { "Content-Type": arg.file.type },
        });
        avatarId = presignedRes.data.key;
      }

      const response = await client.post<CreatePetResponse>(url, {
        ...arg.data,
        avatar_id: avatarId,
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
