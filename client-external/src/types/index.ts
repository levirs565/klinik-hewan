export interface Pet {
  id: number;
  owner_id: number;
  name: string;
  species: string;
  breed: string;
  color: string;
  gender: string;
  date_of_birth: string;
  weight?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  address?: string;
  phone_number?: string;
  role: 'owner' | 'receptionist' | 'doctor' | 'manager';
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  address?: string;
}

export interface CreatePetRequest {
  name: string;
  species: string;
  breed: string;
  color?: string;
  gender: 'male' | 'female';
  date_of_birth: string;
  avatar_id?: string;
}

export interface CreatePetResponse {
  id: number;
  name: string;
  species: string;
  breed: string;
  color?: string;
  gender: string;
  date_of_birth: string;
  avatar_url?: string;
  created_at: string;
}

export interface Appointment {
  id: number;
  owner_id: number;
  pet_id: number;
  doctor_id?: number;
  service_type: 'vaksin' | 'checkup' | 'pengobatan';
  status: 'menunggu_konfirmasi' | 'diterima' | 'ditolak' | 'check_in' | 'alokasi_dokter' | 'menunggu_dokter' | 'dalam_penanganan' | 'selesai' | 'selesai_administrasi';
  queue_number?: string;
  scheduled_date: string;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  status: 'available' | 'busy' | 'offline';
  schedule: string;
  education?: string;
  practice_start?: string;
  joined_at?: string;
  practice_history?: string[];
  image_url?: string;
}

export interface MedicalRecord {
  id: number;
  appointment_id: number;
  pet_id: number;
  doctor_id?: number;
  service_type: Appointment['service_type'];
  record_number: string;
  created_at: string;
  diagnosis?: string;
  summary: string;
  checkup?: {
    body_weight: string;
    temperature: string;
    heart_rate: string;
    respiratory_rate: string;
    bcs: string;
    hydration: string;
    physical_exam: string;
  };
  vaccine?: {
    vaccine_name: string;
    batch_number: string;
    next_due_date: string;
    notes: string;
  };
  treatment?: {
    symptoms: string;
    procedures: string;
    medications: string[];
    estimated_cost: string;
  };
  reminders: Reminder[];
}

export interface Reminder {
  id: number;
  owner_id: number;
  pet_id: number;
  title: string;
  description: string;
  scheduled_date: string;
  status: 'pending' | 'completed';
  created_at: string;
}
