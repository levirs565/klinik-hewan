import type {
  User,
  Pet,
  AuthResponse,
  CreatePetRequest,
  CreatePetResponse,
  Appointment,
  Reminder,
  PetAppointment,
  PetReminder,
} from "../types";

const now = new Date().toISOString();
const today = now.split("T")[0];

export const dummyUser: User = {
  id: 1,
  email: "demo@vetconnect.test",
  full_name: "Demo Owner",
  address: "Jl. Mawar No.1, Jakarta",
  phone_number: "+62 812 3456 7890",
  role: "owner",
  created_at: now,
  updated_at: now,
};

const pets: Pet[] = [
  {
    id: 1,
    owner_id: 1,
    name: "Max",
    species: "dog",
    breed: "Labrador Retriever",
    gender: "male",
    birth_date: "2019-04-12",
    avatar_url: "",
    created_at: now,
    updated_at: now,
  },
  {
    id: 2,
    owner_id: 1,
    name: "Luna",
    species: "cat",
    breed: "Siamese",
    gender: "female",
    birth_date: "2021-08-30",
    avatar_url: "",
    created_at: now,
    updated_at: now,
  },
  {
    id: 3,
    owner_id: 1,
    name: "Bella",
    species: "dog",
    breed: "Beagle",
    gender: "female",
    birth_date: "2020-06-15",
    avatar_url: "",
    created_at: now,
    updated_at: now,
  },
];

let nextPetId = 4;

const appointments: Appointment[] = [
  {
    id: "1",
    pet: {
      name: "Max",
      breed: "Labrador Retriever",
    },
    service_type: "checkup",
    status: "Menunggu Konfirmasi",
    appointment_date: today,
  },
  {
    id: "2",
    pet: {
      name: "Luna",
      breed: "Siamese",
    },
    service_type: "vaccine",
    status: "Diterima",
    appointment_date: today,
  },
];

const reminders: Reminder[] = [
  {
    id: "1",
    pet: {
      id: 2,
      name: "Luna",
    },
    service_type: "vaccine",
    description: "Annual Rabies Vaccine",
    date: today,
  },
];

export async function loginDummy(email: string) {
  return Promise.resolve({
    access_token: "dummy-access-token",
    refresh_token: "dummy-refresh-token",
    user: { ...dummyUser, email },
  } as AuthResponse);
}

export async function registerDummy(data: {
  email: string;
  password: string;
  full_name: string;
}) {
  return Promise.resolve({
    access_token: "dummy-access-token",
    refresh_token: "dummy-refresh-token",
    user: { ...dummyUser, email: data.email, full_name: data.full_name },
  } as AuthResponse);
}

export async function getMeDummy(): Promise<User> {
  return Promise.resolve(dummyUser);
}

export async function getPetsDummy(): Promise<Pet[]> {
  return Promise.resolve(pets.slice());
}

export async function createPetDummy(
  data: CreatePetRequest,
): Promise<CreatePetResponse> {
  const created = {
    id: nextPetId++,
    name: data.name,
    species: data.species,
    breed: data.breed,
    gender: data.gender,
    birth_date: data.birth_date,
    avatar_url: undefined,
    created_at: new Date().toISOString(),
  } as CreatePetResponse;

  pets.push({
    id: created.id,
    owner_id: dummyUser.id,
    name: created.name,
    species: created.species,
    breed: created.breed,
    gender: created.gender as string,
    birth_date: created.birth_date,
    avatar_url: created.avatar_url,
    created_at: created.created_at,
    updated_at: created.created_at,
  });
  return Promise.resolve(created);
}

export async function getAppointmentsDummy(): Promise<Appointment[]> {
  return Promise.resolve(appointments.slice());
}

export async function getRemindersDummy(): Promise<Reminder[]> {
  return Promise.resolve(reminders.slice());
}
