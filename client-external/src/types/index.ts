export interface Pet {
  id: number;
  owner_id: number;
  name: string;
  species: string;
  breed: string;
  gender: string;
  birth_date: string;
  initial_medical_history?: string;
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
  role: "owner" | "receptionist" | "doctor" | "manager";
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
  gender: "male" | "female";
  birth_date: string;
  initial_medical_history?: string;
  avatar_upload_id?: string;
}

export interface CreatePetResponse {
  id: number;
  name: string;
  species: string;
  breed: string;
  gender: string;
  birth_date: string;
  initial_medical_history?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Appointment {
  id: number;
  owner_id: number;
  pet_id: number;
  service_type: "vaksin" | "checkup" | "pengobatan";
  status:
    | "menunggu_konfirmasi"
    | "diterima"
    | "ditolak"
    | "check_in"
    | "alokasi_dokter"
    | "menunggu_dokter"
    | "dalam_penanganan"
    | "selesai"
    | "selesai_administrasi";
  queue_number?: string;
  scheduled_date: string;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: number;
  owner_id: number;
  pet_id: number;
  title: string;
  description: string;
  scheduled_date: string;
  status: "pending" | "completed";
  created_at: string;
}
