export type StaffRole = "manager" | "receptionist" | "doctor";

export type StaffUser = {
  id: number;
  full_name: string;
  username: string;
  role: StaffRole;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  user: StaffUser;
};

export type RequestStatus =
  | "new"
  | "doctor-pending"
  | "confirmed"
  | "rejected"
  | "doctor_rejected"
  | "completed"
  | "Menunggu Konfirmasi"
  | "Diterima"
  | "Ditolak"
  | "Menunggu Dokter"
  | "Dalam Penanganan"
  | "Selesai"
  | "Selesai Administrasi";

export type ServiceRequest = {
  id: string;
  pet: {
    name: string;
    breed: string;
    avatar_url?: string;
  };
  status: RequestStatus;
  service_type: string;
  appointment_date: string;
};

export type StaffMember = {
  id: number;
  full_name: string;
  role: "doctor" | "receptionist";
  avatar_url?: string;
};

export type StaffDetail = StaffMember & {
  username: string;
  is_active: boolean;
  birth_date?: string;
  education_history?: string;
  practice_start_date?: string;
  join_date?: string;
  practice_location_history?: string;
};

export type CheckupData = {
  bodyWeight: string;
  temperature: string;
  heartRate: string;
  respiratoryRate: string;
  capillaryRefillTime: string;
  mucousMembrane: string;
  bodyConditionScore: string;
  hydration: string;
  physicalExamNotes: string;
};

export type MedicalReport = {
  checkup: CheckupData;
  diagnosis: string;
  treatment: string;
  medication: string;
};
