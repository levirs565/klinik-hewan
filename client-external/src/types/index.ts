export interface MyPet {
  id: number;
  name: string;
  avatar_url?: string;
  species: string;
  birth_date: string;
}

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

export interface CreateAppointmentRequest {
  pet_id: number;
  reminder_id?: string;
  service_type: "vaccine" | "checkup" | "treatment";
  appointment_date: string;
  owner_notes?: string;
  previous_medical_history?: string;
  checkup?: {
    purpose: string;
    focus_area: string;
  };
  treatment?: {
    observed_symptoms: string[];
    symptom_duration: string;
    home_care_received?: boolean;
  };
  vaccine?: {
    vaccine_type: string;
  };
}

export interface Appointment {
  id: string;
  pet: {
    name: string;
    breed: string;
    avatar_url?: string;
  };
  service_type: "vaccine" | "checkup" | "treatment";
  status: string;
  appointment_date: string;
}

export interface AppointmentDetail extends Appointment {
  owner_notes?: string;
  previous_medical_history?: string;
}

export interface Reminder {
  id: string;
  service_type: "vaccine" | "checkup" | "treatment";
  date: string;
  description: string;
  pet: {
    id: number;
    name: string;
    avatar_url?: string;
  };
}
