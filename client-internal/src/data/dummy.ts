import type {
  AuthResponse,
  LoginRequest,
  ServiceRequest,
  StaffMember,
  StaffUser,
} from "../types";

export const dummyStaffUsers: StaffUser[] = [
  {
    id: 1,
    full_name: "Michael Tan",
    username: "receptionist",
    role: "receptionist",
  },
  {
    id: 2,
    full_name: "Dr. Sarah Wilson",
    username: "doctor",
    role: "doctor",
  },
  {
    id: 3,
    full_name: "Nadia Hartono",
    username: "manager",
    role: "manager",
  },
];

export const dummyStaffUser = dummyStaffUsers[0];

export const doctors = ["Dr. Sarah", "Dr. James", "Dr. Ahmad"];

export const serviceRequests: ServiceRequest[] = [
  {
    id: "1",
    pet: {
      name: "Max",
      breed: "Terrier",
      avatar_url:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCmTUA1EsAbxAGB7cmESedzf505oHLLT0nlipdf3anTs-kukmgiKJhbTKuDEUeSCT0dddpoXqt-kVlqQYr4dwU2jHfF1SBja36pQ74oeCwbw621_xcD2RkUQGHQ2cVpWKe7ahHqAlfbte_3N_u80RDIbuLU8g-5yawIyfuFiURvuNKvAyJm8oUuCTe6zAFKKNugXYs1gwHX3VeVnNw243Py9TVutVf50NeHR5pT8jUHUMzPTlgKJsnGynIvy8QpAaDjOXOri25M6bk",
    },
    service_type: "checkup",
    appointment_date: "2026-05-26T10:30:00Z",
    status: "new",
  },
  {
    id: "2",
    pet: {
      name: "Cleo",
      breed: "Siamese",
      avatar_url:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC2SWfwGsqmB1E1hC5Q7JgNd1WCzeAnFHVs9YGlGy2T9E-Fh1KX4zWQ0JpQKwubFZ50DqGsFN38WVebJt-9k2173d5dEeetcq9jjPbmYK6JDa6zBZZQ_Z6b_EqHMS_9r64I_C_itm3thO6rNQcncclO7nbi0As3sdRx9aQcAYqWodi1VMi9gc7Z8_nWVTHxtDgv5Crf_Btwea5YG4uDMNoce8z_2Y-3gk79S4vlnvijQ2h2Mc5fDWKR3EymcQ-QqW3v0PdEjX5LbR8",
    },
    service_type: "treatment",
    appointment_date: "2026-05-26T11:15:00Z",
    status: "new",
  },
  {
    id: "3",
    pet: {
      name: "Bella",
      breed: "Beagle",
      avatar_url:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCNpbwOKMCicXAmxR7WdPZpOEvE6eAfxrTuQDzwqRVd9vyUy5gf9Lo4m6KFzrZnLYhS27pkIys3tUgpwtSQO2BPdtZjO7umVPeUtKKPHgYL_vPs32R2KJlyvU63T3ko3Aw3s8F_O0sVdeFRKj-YAXr3YOKrYN3Ii0qhQOGJ5D7WRVT_UJpbPvyIhJrAqO35BzMq1u49wm0dTMapIQqkKYHm9f1FmBAQB3ImEA-vJZAA-puEJQrJZfSO8TBZhHJPxxxE1BEOP1Wuayg",
    },
    service_type: "vaccine",
    appointment_date: "2026-05-25T09:00:00Z",
    status: "doctor-pending",
  },
];

export const staffMembers: StaffMember[] = [
  {
    id: 1,
    full_name: "Dr. Sarah Wilson",
    role: "doctor",
    avatar_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBN0pMIThZ70QQ0mAbEifwWWWgSun10xi3klDIW9NBo21jxekRfMV2VjKzWXD2M7H4hhTb8cG7MXE3vRGPZdK2MKknsPK4gmIxKVmrUYX6k3VUt-3IJwvR0ew_cQc06Pzod6Wx4b3oeRMzTv6q0MWmq1xcck0N0-PsyLuKcPoVB_KAo2MP_n-lLfY2rokjVXADp3VdTIeLe4K3KN-fO92fdlaRFPKYOunUrplVRVn0_6CVFEsHjkMhfyM7Zgan3gWlaBjZ9pWkfXVs",
  },
  {
    id: 2,
    full_name: "Dr. James Chen",
    role: "doctor",
    avatar_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAWNN4U_251sPiSA1OUncyYWgRo--pU1Ok3pmufBBHU1Iq3yXNqgEzQ2CLfv4_pnsLVgzP0xgWXNLgYfvPXQvYrZ5TlUA4IwEGazfX6ZQsTfXyeSSVLXSpy2XFvu_hHoGH6A0I_5t4iBfwjGEJP30hZDPMg30wyew8mi08dK6z3jS74vN_D5TupCP7fEOCDch65bLR-oTRTreHb3MAACU_MPxWuV_dkUZC9YX-3VvCMdk5QZH9icViaiIz5wgL6fvhMzf8l4oKL3nI",
  },
  {
    id: 3,
    full_name: "Michael Tan",
    role: "receptionist",
    avatar_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBJv28iCrqcKfng447KAE6eMLvNRNS8YylrW216Sl6PsA_rwfe-x0ISt8Y42JJzf0wxz5Cor-zfqn-CxqvnRfladclZ37OCR7Cp3yAy9HDsgPdnPMCKVoUg_X8kYKfEDIi3FuAF-y8lNfpPCRtNBwxI-JNF5-87wCsrfBlRAr8zPiUESyAFxL1yC-OKIwdTqSwoTbf8ucpjGQykfB9A4iNrTcOasOmnU2RWk0Uy9dfASLB4XaJ5cKYKC0OPVBpf23xe4osSGnc7x7Y",
  },
];

export async function loginDummy(data: LoginRequest): Promise<AuthResponse> {
  const user =
    dummyStaffUsers.find((staffUser) => staffUser.username === data.username) ??
    dummyStaffUser;

  return {
    access_token: "dummy-internal-access-token",
    refresh_token: "dummy-internal-refresh-token",
    user,
  };
}

export async function getMeDummy(): Promise<StaffUser> {
  return dummyStaffUser;
}

export async function getServiceRequestsDummy(): Promise<ServiceRequest[]> {
  return serviceRequests;
}

export async function getStaffMembersDummy(): Promise<StaffMember[]> {
  return staffMembers;
}
