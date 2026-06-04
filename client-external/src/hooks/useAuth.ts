import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { client, setTokens, clearTokens, apiClient } from "../services/api";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from "../types";

export const useMe = () => {
  const { data, error, isLoading, mutate } = useSWR<User>("/me", apiClient, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
  });

  return {
    user: data,
    isLoading,
    isError: error,
    isAuthenticated: !!data,
    mutate,
  };
};

export const useLogin = () => {
  return useSWRMutation(
    "/me",
    async (_, { arg }: { arg: LoginRequest }): Promise<AuthResponse> => {
      const response = await client.post<AuthResponse>("/owner/login", arg);
      setTokens(response.data.access_token, response.data.refresh_token);
      return response.data;
    },
  );
};

export const useRegister = () => {
  return useSWRMutation(
    "/owner/register",
    async (url, { arg }: { arg: RegisterRequest }): Promise<AuthResponse> => {
      const response = await client.post<AuthResponse>(url, arg);
      return response.data;
    },
  );
};

export const useLogout = () => {
  return useSWRMutation(
    () => true,
    async () => {
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        await client.post("/logout", { refresh_token: refreshToken });
      } finally {
        clearTokens();
      }
    },
    {
      revalidate: false,
    },
  );
};
