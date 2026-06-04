import type { AuthResponse, LoginRequest, ServiceRequest, StaffMember, StaffUser } from '../types'

export const dummyStaffUsers: StaffUser[] = [
  {
    id: 1,
    name: 'Michael Tan',
    username: 'receptionist',
    role: 'receptionist',
    title: 'Front Desk Admin',
  },
  {
    id: 2,
    name: 'Dr. Sarah Wilson',
    username: 'doctor',
    role: 'doctor',
    title: 'Veterinarian',
  },
  {
    id: 3,
    name: 'Nadia Hartono',
    username: 'manager',
    role: 'manager',
    title: 'Clinic Manager',
  },
]

export const dummyStaffUser = dummyStaffUsers[0]

export const doctors = ['Dr. Sarah', 'Dr. James', 'Dr. Ahmad']

export const serviceRequests: ServiceRequest[] = [
  {
    id: 1,
    petName: 'Max',
    breed: 'Terrier',
    owner: 'Jane Smith',
    service: 'Dental Scaling',
    doctor: '-',
    date: '2026-05-26',
    time: '10:30',
    status: 'new',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCmTUA1EsAbxAGB7cmESedzf505oHLLT0nlipdf3anTs-kukmgiKJhbTKuDEUeSCT0dddpoXqt-kVlqQYr4dwU2jHfF1SBja36pQ74oeCwbw621_xcD2RkUQGHQ2cVpWKe7ahHqAlfbte_3N_u80RDIbuLU8g-5yawIyfuFiURvuNKvAyJm8oUuCTe6zAFKKNugXYs1gwHX3VeVnNw243Py9TVutVf50NeHR5pT8jUHUMzPTlgKJsnGynIvy8QpAaDjOXOri25M6bk',
    notes: 'Pasien baru, pemilik meminta jadwal pagi.',
    ownerPhone: '+62 812 3456 7890',
    age: '3 Years',
    duration: '45 Minutes',
    symptoms: 'Napas agak berat setelah bermain dan perlu pemeriksaan mulut sebelum dental scaling.',
  },
  {
    id: 2,
    petName: 'Cleo',
    breed: 'Siamese',
    owner: 'Robert Doe',
    service: 'Grooming',
    doctor: '-',
    date: '2026-05-26',
    time: '11:15',
    status: 'new',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC2SWfwGsqmB1E1hC5Q7JgNd1WCzeAnFHVs9YGlGy2T9E-Fh1KX4zWQ0JpQKwubFZ50DqGsFN38WVebJt-9k2173d5dEeetcq9jjPbmYK6JDa6zBZZQ_Z6b_EqHMS_9r64I_C_itm3thO6rNQcncclO7nbi0As3sdRx9aQcAYqWodi1VMi9gc7Z8_nWVTHxtDgv5Crf_Btwea5YG4uDMNoce8z_2Y-3gk79S4vlnvijQ2h2Mc5fDWKR3EymcQ-QqW3v0PdEjX5LbR8',
    notes: 'Kucing sensitif terhadap suara keras.',
    ownerPhone: '+62 813 9876 5544',
    age: '2 Years',
    duration: '60 Minutes',
    symptoms: 'Bulu menggumpal dan pemilik meminta grooming ringan tanpa parfum.',
  },
  {
    id: 3,
    petName: 'Bella',
    breed: 'Beagle',
    owner: 'Amanda Lee',
    service: 'Vaccination',
    doctor: 'Dr. Sarah',
    date: '2026-05-25',
    time: '09:00',
    status: 'doctor-pending',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCNpbwOKMCicXAmxR7WdPZpOEvE6eAfxrTuQDzwqRVd9vyUy5gf9Lo4m6KFzrZnLYhS27pkIys3tUgpwtSQO2BPdtZjO7umVPeUtKKPHgYL_vPs32R2KJlyvU63T3ko3Aw3s8F_O0sVdeFRKj-YAXr3YOKrYN3Ii0qhQOGJ5D7WRVT_UJpbPvyIhJrAqO35BzMq1u49wm0dTMapIQqkKYHm9f1FmBAQB3ImEA-vJZAA-puEJQrJZfSO8TBZhHJPxxxE1BEOP1Wuayg',
    notes: 'Menunggu dokter mengonfirmasi ketersediaan.',
    ownerPhone: '+62 811 1234 9000',
    age: '4 Years',
    duration: '30 Minutes',
    symptoms: 'Jadwal vaksin tahunan, tidak ada keluhan khusus.',
  },
  {
    id: 4,
    petName: 'Buddy',
    breed: 'Golden Retriever',
    owner: 'John Doe',
    service: 'Surgery Follow-up',
    doctor: 'Dr. Sarah',
    date: '2026-05-27',
    time: '14:00',
    status: 'confirmed',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAjtc6FEPw2K9-diBbCc-cQib_aRYva9LPKCGnxS0VDRAVTFRPZ-U4JEqlmhc_PeBNtjjZJUgMOxB9gNL-ak6M0EBPzsfq3aRCytsvCEowGuA85fq1tMg7iFxbM0Gen4am43G8cJqYwkI0EYFPUUNEDLPB5lkTbtkBK3padt-peTrzMzxZJE5gZqB6VnzA7ZqgI_HWSrVaOzpPEywHRAvaMefmzeG844pA5bkXJN9GAnIr7PrKDAUhy0vyuMVW6rU0QU3XFKw26mfA',
    notes: 'Kontrol pasca operasi, cek luka jahitan.',
    ownerPhone: '+62 812 2200 7788',
    age: '1 Year',
    duration: '30 Minutes',
    symptoms: 'Kontrol luka operasi, pemilik melaporkan nafsu makan sudah membaik.',
  },
]

export const staffMembers: StaffMember[] = [
  {
    id: 1,
    name: 'Dr. Sarah Wilson',
    role: 'doctor',
    specialization: 'General Practice & Surgery',
    phone: '+62 812 1000 2000',
    email: 'sarah@vetconnect.local',
    status: 'active',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBN0pMIThZ70QQ0mAbEifwWWWgSun10xi3klDIW9NBo21jxekRfMV2VjKzWXD2M7H4hhTb8cG7MXE3vRGPZdK2MKknsPK4gmIxKVmrUYX6k3VUt-3IJwvR0ew_cQc06Pzod6Wx4b3oeRMzTv6q0MWmq1xcck0N0-PsyLuKcPoVB_KAo2MP_n-lLfY2rokjVXADp3VdTIeLe4K3KN-fO92fdlaRFPKYOunUrplVRVn0_6CVFEsHjkMhfyM7Zgan3gWlaBjZ9pWkfXVs',
  },
  {
    id: 2,
    name: 'Dr. James Chen',
    role: 'doctor',
    specialization: 'Orthopedics',
    phone: '+62 812 3000 4000',
    email: 'james@vetconnect.local',
    status: 'active',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAWNN4U_251sPiSA1OUncyYWgRo--pU1Ok3pmufBBHU1Iq3yXNqgEzQ2CLfv4_pnsLVgzP0xgWXNLgYfvPXQvYrZ5TlUA4IwEGazfX6ZQsTfXyeSSVLXSpy2XFvu_hHoGH6A0I_5t4iBfwjGEJP30hZDPMg30wyew8mi08dK6z3jS74vN_D5TupCP7fEOCDch65bLR-oTRTreHb3MAACU_MPxWuV_dkUZC9YX-3VvCMdk5QZH9icViaiIz5wgL6fvhMzf8l4oKL3nI',
  },
  {
    id: 3,
    name: 'Michael Tan',
    role: 'receptionist',
    specialization: 'Front Desk Admin',
    phone: '+62 811 5555 0912',
    email: 'michael@vetconnect.local',
    status: 'active',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBJv28iCrqcKfng447KAE6eMLvNRNS8YylrW216Sl6PsA_rwfe-x0ISt8Y42JJzf0wxz5Cor-zfqn-CxqvnRfladclZ37OCR7Cp3yAy9HDsgPdnPMCKVoUg_X8kYKfEDIi3FuAF-y8lNfpPCRtNBwxI-JNF5-87wCsrfBlRAr8zPiUESyAFxL1yC-OKIwdTqSwoTbf8ucpjGQykfB9A4iNrTcOasOmnU2RWk0Uy9dfASLB4XaJ5cKYKC0OPVBpf23xe4osSGnc7x7Y',
  },
]

export async function loginDummy(data: LoginRequest): Promise<AuthResponse> {
  const user = dummyStaffUsers.find((staffUser) => staffUser.username === data.username) ?? dummyStaffUser

  return {
    access_token: 'dummy-internal-access-token',
    refresh_token: 'dummy-internal-refresh-token',
    user,
  }
}

export async function getMeDummy(): Promise<StaffUser> {
  return dummyStaffUser
}

export async function getServiceRequestsDummy(): Promise<ServiceRequest[]> {
  return serviceRequests
}

export async function getStaffMembersDummy(): Promise<StaffMember[]> {
  return staffMembers
}
