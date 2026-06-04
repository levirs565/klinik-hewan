import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { addStaffMember } from '../services/staff'
import type { StaffMember } from '../types'

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=320&q=80'

export function AddStaffPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState<StaffMember['role']>('doctor')
  const [name, setName] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [schedule, setSchedule] = useState('')
  const [bio, setBio] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [education, setEducation] = useState('')
  const [experience, setExperience] = useState('')
  const [room, setRoom] = useState('')
  const [certifications, setCertifications] = useState('')
  const [services, setServices] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const newStaff: StaffMember = {
      id: Date.now(),
      name,
      role,
      specialization,
      phone,
      email,
      status: 'active',
      image: DEFAULT_IMAGE,
      bio,
      schedule,
      licenseNumber: role === 'doctor' ? licenseNumber : undefined,
      education: role === 'doctor' ? education : undefined,
      experience: role === 'doctor' ? experience : undefined,
      room: role === 'doctor' ? room : undefined,
      services: role === 'doctor' ? services.split(',').map((item) => item.trim()).filter(Boolean) : undefined,
      certifications: role === 'doctor' ? certifications.split(',').map((item) => item.trim()).filter(Boolean) : undefined,
    }

    await addStaffMember(newStaff)
    navigate('/staff')
  }

  return (
    <main className="app">
      <header className="top-bar">
        <div className="brand">
          <button className="icon-button" type="button" onClick={() => navigate('/staff')} aria-label="Kembali">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <p>Tambah Staff</p>
            <h1>Form Tambah Staff</h1>
          </div>
        </div>
      </header>

      <section className="column staff-form-page">
        <form className="stack-form" onSubmit={handleSubmit}>
          <div className="section-title">
            <div>
              <p>Role</p>
              <h2>Pilih Tipe Staff</h2>
            </div>
          </div>

          <label>
            Role
            <select value={role} onChange={(event) => setRole(event.target.value as StaffMember['role'])}>
              <option value="doctor">Dokter</option>
              <option value="receptionist">Resepsionis</option>
            </select>
          </label>

          <label>
            Nama
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label>
            Spesialisasi / Jabatan
            <input value={specialization} onChange={(event) => setSpecialization(event.target.value)} required />
          </label>
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            Telepon
            <input value={phone} onChange={(event) => setPhone(event.target.value)} required />
          </label>
          <label>
            Jadwal
            <input value={schedule} onChange={(event) => setSchedule(event.target.value)} placeholder="Contoh: Mon-Fri 08:00-17:00" required />
          </label>
          <label>
            Bio / Deskripsi Singkat
            <textarea value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Profil singkat staff" />
          </label>

          {role === 'doctor' ? (
            <>
              <div className="section-title detail-section-gap">
                <div>
                  <p>Detail Dokter</p>
                  <h2>Informasi yang sesuai dengan profil dokter</h2>
                </div>
              </div>
              <label>
                Nomor STR
                <input value={licenseNumber} onChange={(event) => setLicenseNumber(event.target.value)} required />
              </label>
              <label>
                Pendidikan
                <input value={education} onChange={(event) => setEducation(event.target.value)} required />
              </label>
              <label>
                Pengalaman
                <input value={experience} onChange={(event) => setExperience(event.target.value)} required />
              </label>
              <label>
                Ruang Praktik
                <input value={room} onChange={(event) => setRoom(event.target.value)} required />
              </label>
              <label>
                Layanan / Service
                <input value={services} onChange={(event) => setServices(event.target.value)} placeholder="Pisahkan dengan koma" />
              </label>
              <label>
                Sertifikasi
                <input value={certifications} onChange={(event) => setCertifications(event.target.value)} placeholder="Pisahkan dengan koma" />
              </label>
            </>
          ) : (
            <>
              <div className="section-title detail-section-gap">
                <div>
                  <p>Detail Resepsionis</p>
                  <h2>Informasi yang sesuai dengan profil staff resepsionis</h2>
                </div>
              </div>
              <label>
                Tugas Utama
                <input value={services} onChange={(event) => setServices(event.target.value)} placeholder="Contoh: Penjadwalan, administrasi" />
              </label>
            </>
          )}

          <div className="button-row">
            <button className="secondary-button" type="button" onClick={() => navigate('/staff')}>
              Batal
            </button>
            <button className="primary-button strong" type="submit">
              Simpan Staff
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
