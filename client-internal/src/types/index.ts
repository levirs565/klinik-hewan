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
  | "Selesai Administrasi"
  | "Selesai"; // server/models/appointment.go has StateFinished = "Selesai"

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

export type PhysicalExamination = {
  weight: number;
  temperature: number;
  physical_condition: string;
  heart_rate?: string;
  respiratory_rate?: string;
};

export type Prescription = {
  name: string;
  dosage: string;
  frequency: string;
};

export type VaccineMedicalData = {
  vaccine_type: string;
  brand: string;
  batch_number: string;
  administration_date: string;
  pre_vaccine_condition: string;
  post_vaccine_reaction?: string;
};

export type CheckupMedicalData = {
  palpation: string;
  cleanliness_notes: string;
  nutrition_recommendations?: string;
  periodic_care_recommendations?: string;
};

export type TreatmentMedicalData = {
  clinical_symptoms: string;
  diagnosis: string;
  medical_actions: string;
  prescriptions: Prescription[];
  home_care_notes?: string;
  estimated_cost: number;
};

export type MedicalRecord = {
  physical_examination: PhysicalExamination;
  type: string;
  vaccine?: VaccineMedicalData;
  checkup?: CheckupMedicalData;
  treatment?: TreatmentMedicalData;
};

export type AppointmentDetail = {
  id: string;
  pet: {
    id: number;
    name: string;
    breed: string;
    birth_date: string;
    avatar_url?: string;
  };
  doctor?: {
    id: number;
    name: string;
  };
  owner: {
    id: number;
    name: string;
    avatar_url?: string;
  };
  status: RequestStatus;
  service_type: string;
  appointment_date: string;
  owner_notes?: string;
  previous_medical_history?: string;
  medical_record?: MedicalRecord;
};
