import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useMe, useLogin, useLogout } from "../hooks/useAuth";
import type { LoginRequest, StaffUser } from "../types";

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: StaffUser | null;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated, mutate } = useMe();
  const { trigger: loginTrigger } = useLogin();
  const { trigger: logoutTrigger } = useLogout();

  const login = async (data: LoginRequest) => {
    await loginTrigger(data);
    await mutate();
  };

  const logout = async () => {
    await logoutTrigger();
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user: user || null, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
