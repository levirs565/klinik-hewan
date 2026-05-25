import type { User, Pet, AuthResponse, CreatePetRequest, CreatePetResponse, Appointment, Reminder } from '../types';

const now = new Date().toISOString();

export const dummyUser: User = {
  id: 1,
  email: 'demo@vetconnect.test',
  full_name: 'Demo Owner',
  address: 'Jl. Mawar No.1, Jakarta',
  phone_number: '+62 812 3456 7890',
  role: 'owner',
  created_at: now,
  updated_at: now,
};

const pets: Pet[] = [
  {
    id: 1,
    owner_id: 1,
    name: 'Max',
    species: 'dog',
    breed: 'Labrador Retriever',
    color: 'Golden',
    gender: 'male',
    date_of_birth: '2019-04-12',
    avatar_url: '',
    created_at: now,
    updated_at: now,
  },
  {
    id: 2,
    owner_id: 1,
    name: 'Luna',
    species: 'cat',
    breed: 'Siamese',
    color: 'Cream',
    gender: 'female',
    date_of_birth: '2021-08-30',
    avatar_url: '',
    created_at: now,
    updated_at: now,
  },
  {
    id: 3,
    owner_id: 1,
    name: 'Bella',
    species: 'dog',
    breed: 'Beagle',
    color: 'Tri-color',
    gender: 'female',
    date_of_birth: '2020-06-15',
    avatar_url: '',
    created_at: now,
    updated_at: now,
  },
];

let nextPetId = 4;

const appointments: Appointment[] = [
  {
    id: 1,
    owner_id: 1,
    pet_id: 1,
    service_type: 'checkup',
    status: 'menunggu_konfirmasi',
    queue_number: 'Q-01',
    scheduled_date: new Date(Date.now() + 86400000).toISOString(),
    created_at: now,
    updated_at: now,
  },
  {
    id: 2,
    owner_id: 1,
    pet_id: 2,
    service_type: 'vaksin',
    status: 'diterima',
    queue_number: 'Q-02',
    scheduled_date: new Date(Date.now() + 2 * 86400000).toISOString(),
    created_at: now,
    updated_at: now,
  },
  {
    id: 3,
    owner_id: 1,
    pet_id: 3,
    service_type: 'pengobatan',
    status: 'menunggu_dokter',
    queue_number: 'Q-03',
    scheduled_date: new Date(Date.now() + 3 * 86400000).toISOString(),
    created_at: now,
    updated_at: now,
  },
];
let nextAppointmentId = 4;

const reminders: Reminder[] = [
  {
    id: 1,
    owner_id: 1,
    pet_id: 2, // Luna
    title: 'Annual Rabies Vaccine',
    description: 'Annual Rabies Vaccine',
    scheduled_date: '2023-10-24T09:00:00.000Z',
    status: 'pending',
    created_at: now,
  },
  {
    id: 2,
    owner_id: 1,
    pet_id: 1, // Buddy/Max equivalent
    title: 'DHPP Booster',
    description: 'DHPP Booster',
    scheduled_date: '2023-10-30T09:00:00.000Z',
    status: 'pending',
    created_at: now,
  },
  {
    id: 3,
    owner_id: 1,
    pet_id: 3, // Bella (not present in pets list, will display generically)
    title: 'Heartworm Pill - Monthly Prevention',
    description: 'Heartworm Pill Monthly Prevention',
    scheduled_date: '2023-10-25T00:00:00.000Z',
    status: 'pending',
    created_at: now,
  },
  {
    id: 4,
    owner_id: 1,
    pet_id: 1,
    title: 'Apoquel - Daily Allergy Med',
    description: 'Apoquel Daily Allergy Medication',
    scheduled_date: '2023-10-24T00:00:00.000Z',
    status: 'pending',
    created_at: now,
  },
];

// nextReminderId reserved for future reminder creation

export async function loginDummy(email: string) {
  return Promise.resolve({
    access_token: 'dummy-access-token',
    refresh_token: 'dummy-refresh-token',
    user: { ...dummyUser, email },
  } as AuthResponse);
}

export async function registerDummy(data: { email: string; password: string; full_name: string }) {
  return Promise.resolve({
    access_token: 'dummy-access-token',
    refresh_token: 'dummy-refresh-token',
    user: { ...dummyUser, email: data.email, full_name: data.full_name },
  } as AuthResponse);
}

export async function getMeDummy(): Promise<User> {
  return Promise.resolve(dummyUser);
}

export async function getPetsDummy(): Promise<Pet[]> {
  return Promise.resolve(pets.slice());
}

export async function createPetDummy(data: CreatePetRequest): Promise<CreatePetResponse> {
  const created = {
    id: nextPetId++,
    name: data.name,
    species: data.species,
    breed: data.breed,
    color: data.color,
    gender: data.gender,
    date_of_birth: data.date_of_birth,
    avatar_url: undefined,
    created_at: new Date().toISOString(),
  } as CreatePetResponse;
  pets.push({
    id: created.id,
    owner_id: dummyUser.id,
    name: created.name,
    species: created.species,
    breed: created.breed,
    color: created.color ?? '',
    gender: created.gender as string,
    date_of_birth: created.date_of_birth,
    avatar_url: created.avatar_url,
    created_at: created.created_at,
    updated_at: created.created_at,
  });
  return Promise.resolve(created);
}

export async function getPresignedUrlDummy(_contentType: string, _fileSize: number) {
  void _contentType;
  void _fileSize;
  return Promise.resolve({ url: 'https://example.com/dummy-upload-url', key: `dummy/${Date.now()}` });
}

export async function uploadFileDummy(_presignedUrl: string, _file: File) {
  void _presignedUrl;
  void _file;
  // no-op for dummy
  return Promise.resolve();
}

export async function getAppointmentsDummy(): Promise<Appointment[]> {
  return Promise.resolve(appointments.slice());
}

export async function createAppointmentDummy(data: { pet_id: number; service_type: Appointment['service_type']; scheduled_date: string; }) {
  const now = new Date().toISOString();
  const appointment: Appointment = {
    id: nextAppointmentId++,
    owner_id: dummyUser.id,
    pet_id: data.pet_id,
    service_type: data.service_type,
    status: 'menunggu_konfirmasi',
    queue_number: `Q-${String(appointments.length + 1).padStart(2, '0')}`,
    scheduled_date: data.scheduled_date,
    created_at: now,
    updated_at: now,
  };
  appointments.push(appointment);
  return Promise.resolve(appointment);
}

export async function getRemindersDummy(): Promise<Reminder[]> {
  return Promise.resolve(reminders.slice());
}
