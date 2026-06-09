import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useMe, useLogin, useLogout } from "../hooks/useAuth";
import type { LoginRequest, StaffUser } from "../types";
import { onRegistered, register, unregister } from "firebase/messaging";
import { messaging, vapidKey } from "../firebase";
import { client } from "../services/api";

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: StaffUser | null;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
};

const saveFCMToken = async (token: string) => {
  try {
    await client.post("/fcm/token", { token, device_type: "web" });
  } catch (error) {
    console.error("Failed to save FCM token", error);
  }
};

const deleteFCMToken = async (token: string) => {
  try {
    await client.delete("/fcm/token", { data: { token } });
  } catch (error) {
    console.error("Failed to delete FCM token", error);
  }
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated, mutate } = useMe();
  const { trigger: loginTrigger } = useLogin();
  const { trigger: logoutTrigger } = useLogout();
  const [oldToken, setOldToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onRegistered(messaging, async (token) => {
      if (oldToken !== token && oldToken) {
        await deleteFCMToken(oldToken);
      }

      await saveFCMToken(token);
      setOldToken(token);
    });

    return () => {
      unsubscribe();
    };
  }, [oldToken]);

  useEffect(() => {
    if (isAuthenticated) {
      register(messaging, {
        vapidKey: vapidKey,
      });
    }
  }, [isAuthenticated]);

  const login = async (data: LoginRequest) => {
    if (oldToken) {
      await deleteFCMToken(oldToken);
      setOldToken(null);
    }
    await loginTrigger(data);
    await mutate();
  };

  const logout = async () => {
    if (oldToken) {
      await deleteFCMToken(oldToken);
      setOldToken(null);
    }
    await unregister(messaging);
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
