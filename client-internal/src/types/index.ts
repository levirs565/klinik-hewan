export type StaffRole = 'manager' | 'receptionist' | 'doctor'

export type StaffUser = {
  id: number
  name: string
  username: string
  role: StaffRole
  title: string
}

export type LoginRequest = {
  username: string
  password: string
}

export type AuthResponse = {
  access_token: string
  refresh_token: string
  user: StaffUser
}

export type RequestStatus = 'new' | 'doctor-pending' | 'confirmed' | 'rejected'

export type ServiceRequest = {
  id: number
  petName: string
  breed: string
  owner: string
  service: string
  doctor: string
  date: string
  time: string
  status: RequestStatus
  image: string
  notes: string
  ownerPhone: string
  age: string
  duration: string
  symptoms: string
  rejectionReason?: string
  medicalReport?: MedicalReport
}

export type Reminder = {
  id: number
  date: string
  note: string
}

export type MedicalReport = {
  diagnosis: string
  treatment: string
  medication: string
  reminders: Reminder[]
}

export type StaffStatus = 'active' | 'inactive'

export type StaffMember = {
  id: number
  name: string
  role: 'doctor' | 'receptionist'
  specialization: string
  phone: string
  email: string
  status: StaffStatus
  image: string
}
