import { createContext, useContext } from "react";
import type { ReactNode } from "react";

import { useServiceRequests as useServiceRequestsSWR } from "../hooks/useServiceRequests";
import type { ServiceRequest } from "../types";
import { useAuth } from "./AuthContext";
import { client } from "../services/api";

type ServiceRequestContextValue = {
  isLoading: boolean;
  requests: ServiceRequest[];
  assignDoctor: (id: string, doctorID: number) => Promise<void>;
  confirmRequest: (id: string) => Promise<void>;
  rejectRequest: (id: string, reason: string) => Promise<void>;
  mutate: () => void;
};

const ServiceRequestContext = createContext<
  ServiceRequestContextValue | undefined
>(undefined);

export function ServiceRequestProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { requests, isLoading, mutate } = useServiceRequestsSWR(
    {},
    isAuthenticated,
  );

  const assignDoctor = async (id: string, doctorID: number) => {
    try {
      await client.post(`/internal/appointments/${id}/select-doctor`, {
        doctor_id: doctorID,
      });
      await mutate();
    } catch (error) {
      console.error("Failed to assign doctor:", error);
      throw error;
    }
  };

  const confirmRequest = async (id: string) => {
    try {
      await client.post(`/internal/appointments/${id}/approve`);
      await mutate();
    } catch (error) {
      console.error("Failed to confirm request:", error);
      throw error;
    }
  };

  const rejectRequest = async (id: string, reason: string) => {
    try {
      await client.post(`/internal/appointments/${id}/reject`, {
        reason,
      });
      await mutate();
    } catch (error) {
      console.error("Failed to reject request:", error);
      throw error;
    }
  };

  return (
    <ServiceRequestContext.Provider
      value={{
        assignDoctor,
        confirmRequest,
        isLoading,
        rejectRequest,
        requests,
        mutate,
      }}
    >
      {children}
    </ServiceRequestContext.Provider>
  );
}

export function useServiceRequests() {
  const context = useContext(ServiceRequestContext);
  if (!context) {
    throw new Error(
      "useServiceRequests must be used inside ServiceRequestProvider",
    );
  }
  return context;
}
