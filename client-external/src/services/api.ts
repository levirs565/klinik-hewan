import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  User,
  Pet,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  CreatePetRequest,
  CreatePetResponse,
  Appointment,
  Reminder,
  Doctor,
  MedicalRecord,
} from '../types';
import { DUMMY_MODE } from '../config';
import * as dummy from '../data/dummy';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:1323/api';

class APIClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load token from localStorage on initialization
    this.accessToken = localStorage.getItem('access_token');

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        // add Authorization header when token exists
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (config as any).headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Handle 401 responses (token expired)
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && this.accessToken) {
          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await this.refreshAccessToken(refreshToken);
              this.setTokens(response.access_token, response.refresh_token);
              // Retry the original request
              return this.client(error.config);
            }
          } catch {
            this.clearTokens();
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  // Auth endpoints
  async registerOwner(data: RegisterRequest): Promise<AuthResponse> {
    if (DUMMY_MODE) {
      const res = await dummy.registerDummy({ email: data.email, password: data.password, full_name: data.full_name });
      this.setTokens(res.access_token, res.refresh_token);
      localStorage.setItem('user', JSON.stringify(res.user));
      return res;
    }

    const response = await this.client.post<AuthResponse>('/owner/register', data);
    this.setTokens(response.data.access_token, response.data.refresh_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  }

  async loginOwner(data: LoginRequest): Promise<AuthResponse> {
    if (DUMMY_MODE) {
      const res = await dummy.loginDummy(data.email);
      this.setTokens(res.access_token, res.refresh_token);
      localStorage.setItem('user', JSON.stringify(res.user));
      return res;
    }

    const response = await this.client.post<AuthResponse>('/owner/login', data);
    this.setTokens(response.data.access_token, response.data.refresh_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
    if (DUMMY_MODE) {
      // return a fresh dummy response
      return Promise.resolve({ access_token: 'dummy-access-token', refresh_token: 'dummy-refresh-token', user: dummy.dummyUser });
    }

    const response = await this.client.post<AuthResponse>('/token/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  }

  async logout(): Promise<void> {
    if (DUMMY_MODE) {
      this.clearTokens();
      return Promise.resolve();
    }

    try {
      await this.client.post('/logout');
    } finally {
      this.clearTokens();
    }
  }

  async getMe(): Promise<User> {
    if (DUMMY_MODE) return dummy.getMeDummy();
    const response = await this.client.get<User>('/me');
    return response.data;
  }

  // Pet endpoints
  async getPets(): Promise<Pet[]> {
    if (DUMMY_MODE) return dummy.getPetsDummy();
    const response = await this.client.get<Pet[]>('/pets');
    return response.data;
  }

  async createPet(data: CreatePetRequest): Promise<CreatePetResponse> {
    if (DUMMY_MODE) return dummy.createPetDummy(data);
    const response = await this.client.post<CreatePetResponse>('/pets', data);
    return response.data;
  }

  // Appointment endpoints
  async getAppointments(): Promise<Appointment[]> {
    if (DUMMY_MODE) return dummy.getAppointmentsDummy();
    const response = await this.client.get<Appointment[]>('/appointments');
    return response.data;
  }

  async getDoctors(): Promise<Doctor[]> {
    if (DUMMY_MODE) return dummy.getDoctorsDummy();
    const response = await this.client.get<Doctor[]>('/doctors');
    return response.data;
  }

  async getMedicalRecords(): Promise<MedicalRecord[]> {
    if (DUMMY_MODE) return dummy.getMedicalRecordsDummy();
    const response = await this.client.get<MedicalRecord[]>('/medical-records');
    return response.data;
  }

  async createAppointment(data: { pet_id: number; service_type: Appointment['service_type']; scheduled_date: string; }): Promise<Appointment> {
    if (DUMMY_MODE) return dummy.createAppointmentDummy(data);
    const response = await this.client.post<Appointment>('/appointments', data);
    return response.data;
  }

  async getReminders(): Promise<Reminder[]> {
    if (DUMMY_MODE) return dummy.getRemindersDummy();
    const response = await this.client.get<Reminder[]>('/reminders');
    return response.data;
  }

  async getPresignedUrl(contentType: string, fileSize: number): Promise<{ url: string; key: string }> {
    if (DUMMY_MODE) return dummy.getPresignedUrlDummy(contentType, fileSize);
    const response = await this.client.post<{ url: string; key: string }>(
      '/pets/avatar/presigned-url',
      { content_type: contentType, file_size: fileSize }
    );
    return response.data;
  }

  async uploadFile(presignedUrl: string, file: File): Promise<void> {
    if (DUMMY_MODE) return dummy.uploadFileDummy(presignedUrl, file);
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });
  }
}

export const apiClient = new APIClient();
