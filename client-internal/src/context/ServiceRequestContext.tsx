import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { internalApiClient } from '../services/api'
import type { MedicalReport, RequestStatus, ServiceRequest } from '../types'

type ServiceRequestContextValue = {
  isLoading: boolean
  requests: ServiceRequest[]
  assignDoctor: (id: number, doctor: string) => void
  confirmRequest: (id: number) => void
  rejectRequest: (id: number, reason: string) => void
  saveMedicalReport: (id: number, report: MedicalReport) => void
}

const ServiceRequestContext = createContext<ServiceRequestContextValue | undefined>(undefined)

export function ServiceRequestProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    internalApiClient
      .getServiceRequests()
      .then(setRequests)
      .finally(() => setIsLoading(false))
  }, [])

  const updateRequest = (id: number, updater: (request: ServiceRequest) => ServiceRequest) => {
    setRequests((currentRequests) =>
      currentRequests.map((request) => (request.id === id ? updater(request) : request)),
    )
  }

  const updateStatus = (id: number, status: RequestStatus, doctor?: string, rejectionReason?: string) => {
    updateRequest(id, (request) => ({
      ...request,
      doctor: doctor ?? request.doctor,
      rejectionReason,
      status,
    }))
  }

  const assignDoctor = (id: number, doctor: string) => updateStatus(id, 'doctor-pending', doctor)
  const confirmRequest = (id: number) => updateStatus(id, 'confirmed')
  const rejectRequest = (id: number, reason: string) => updateStatus(id, 'rejected', undefined, reason)
  const saveMedicalReport = (id: number, report: MedicalReport) => {
    updateRequest(id, (request) => ({
      ...request,
      medicalReport: report,
    }))
  }

  return (
    <ServiceRequestContext.Provider
      value={{ assignDoctor, confirmRequest, isLoading, rejectRequest, requests, saveMedicalReport }}
    >
      {children}
    </ServiceRequestContext.Provider>
  )
}

export function useServiceRequests() {
  const context = useContext(ServiceRequestContext)
  if (!context) {
    throw new Error('useServiceRequests must be used inside ServiceRequestProvider')
  }
  return context
}
