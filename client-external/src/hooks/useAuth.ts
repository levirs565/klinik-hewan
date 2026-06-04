import useSWRMutation from "swr/mutation";
import { client, setTokens, clearTokens } from "../services/api";
import type { LoginRequest, RegisterRequest, AuthResponse } from "../types";

export const useLogin = () => {
  return useSWRMutation(
    "/owner/login",
    async (url, { arg }: { arg: LoginRequest }): Promise<AuthResponse> => {
      const response = await client.post<AuthResponse>(url, arg);
      setTokens(response.data.access_token, response.data.refresh_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      return response.data;
    },
  );
};

export const useRegister = () => {
  return useSWRMutation(
    "/owner/register",
    async (url, { arg }: { arg: RegisterRequest }): Promise<AuthResponse> => {
      const response = await client.post<AuthResponse>(url, arg);
      setTokens(response.data.access_token, response.data.refresh_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      return response.data;
    },
  );
};

export const useLogout = () => {
  return useSWRMutation("/logout", async (url) => {
    try {
      await client.post(url);
    } finally {
      clearTokens();
    }
  });
};
