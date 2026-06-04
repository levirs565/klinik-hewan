import type { RequestStatus } from '../types'

export const statusLabel: Record<RequestStatus, string> = {
  new: 'Permintaan Baru',
  'doctor-pending': 'Menunggu Dokter',
  confirmed: 'Terkonfirmasi',
  rejected: 'Ditolak',
}

export const statusIcon: Record<RequestStatus, string> = {
  new: 'assignment',
  'doctor-pending': 'hourglass_empty',
  confirmed: 'check_circle',
  rejected: 'cancel',
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
  }).format(new Date(`${value}T00:00:00`))
}

export function isPendingStatus(status: RequestStatus) {
  return status === 'new' || status === 'doctor-pending'
}
