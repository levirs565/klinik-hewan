import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

import { useServiceRequests as useServiceRequestsSWR } from "../hooks/useServiceRequests";
import type { ServiceRequest } from "../types";
import { useAuth } from "./AuthContext";

type ServiceRequestContextValue = {
  isLoading: boolean;
  requests: ServiceRequest[];
  assignDoctor: (id: string, doctorID: number) => void;
  confirmRequest: (id: string) => void;
  rejectRequest: (id: string, reason: string) => void;
  mutate: () => void;
};

const ServiceRequestContext = createContext<
  ServiceRequestContextValue | undefined
>(undefined);

export function ServiceRequestProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const {
    requests: swrRequests,
    isLoading,
    mutate,
  } = useServiceRequestsSWR(isAuthenticated);
  const [updatedRequests, setUpdatedRequests] = useState<
    Record<string, Partial<ServiceRequest>>
  >({});
  const { user } = useAuth();

  // Compute merged requests: SWR data + local updates
  const requests = swrRequests.map((req) => ({
    ...req,
    ...(updatedRequests[req.id] || {}),
  }));

  const updateRequestLocal = (id: string, update: Partial<ServiceRequest>) => {
    setUpdatedRequests((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...update },
    }));
  };

  const assignDoctor = (id: string, _doctorID: number) => {
    if (user?.role === "doctor") return;
    updateRequestLocal(id, { status: "doctor-pending" });
  };

  const confirmRequest = (id: string) =>
    updateRequestLocal(id, { status: "confirmed" });

  const rejectRequest = (id: string, _reason: string) =>
    updateRequestLocal(id, { status: "rejected" });

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
