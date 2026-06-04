import useSWR, { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";

import { client, setTokens, clearTokens, apiClient } from "../services/api";
import type { LoginRequest, AuthResponse, StaffUser } from "../types";

export const useMe = () => {
  const { data, error, isLoading, mutate } = useSWR<StaffUser>(
    "/me",
    apiClient,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    },
  );

  return {
    user: data,
    isLoading,
    isError: error,
    isAuthenticated: !!data && !error && !isLoading,
    mutate,
  };
};

export const useLogin = () => {
  return useSWRMutation(
    "/me",
    async (_, { arg }: { arg: LoginRequest }): Promise<AuthResponse> => {
      const response = await client.post<AuthResponse>("/internal/login", arg);
      setTokens(response.data.access_token, response.data.refresh_token);
      localStorage.setItem("internal_user", JSON.stringify(response.data.user));
      return response.data;
    },
  );
};

export const useLogout = () => {
  const { mutate } = useSWRConfig();
  return useSWRMutation("/me", async () => {
    try {
      const refreshToken = localStorage.getItem("internal_refresh_token");
      if (refreshToken) {
        await client.post("/logout", { refresh_token: refreshToken });
      }
    } finally {
      clearTokens();
      await mutate((key) => key !== "/me", undefined, { revalidate: false });
    }
  });
};
