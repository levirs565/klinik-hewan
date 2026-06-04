import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { internalApiClient } from '../services/api'
import type { StaffMember } from '../types'

export function StaffDirectoryPage() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [activeRole, setActiveRole] = useState<StaffMember['role']>('doctor')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    internalApiClient.getStaffMembers().then(setStaffMembers)
  }, [])

  const filteredStaff = useMemo(
    () => staffMembers.filter((staff) => staff.role === activeRole),
    [activeRole, staffMembers],
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const nextStaff: StaffMember = {
      id: Date.now(),
      name: String(formData.get('name') ?? ''),
      role: activeRole,
      specialization: String(formData.get('specialization') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      email: String(formData.get('email') ?? ''),
      status: 'active',
      image:
        'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=320&q=80',
    }

    setStaffMembers((currentStaff) => [nextStaff, ...currentStaff])
    setShowForm(false)
  }

  return (
    <main className="app">
      <header className="top-bar">
        <div className="brand">
          <Link className="icon-button" to="/" aria-label="Kembali">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <p>Pengelolaan Staf</p>
            <h1>Staff Directory</h1>
          </div>
        </div>
        <button className="primary-button toolbar-action" onClick={() => setShowForm(true)} type="button">
          Tambah Staff
        </button>
      </header>

      <section className="column staff-page">
        <div className="tabs">
          <button className={activeRole === 'doctor' ? 'active' : ''} onClick={() => setActiveRole('doctor')} type="button">
            Dokter
          </button>
          <button className={activeRole === 'receptionist' ? 'active' : ''} onClick={() => setActiveRole('receptionist')} type="button">
            Resepsionis
          </button>
        </div>

        <div className="staff-grid">
          {filteredStaff.map((staff) => (
            <article className={staff.status === 'inactive' ? 'staff-card muted' : 'staff-card'} key={staff.id}>
              <img src={staff.image} alt={staff.name} />
              <div>
                <h2>{staff.name}</h2>
                <p>{staff.specialization}</p>
                <small>{staff.email}</small>
              </div>
              <span className={`status ${staff.status === 'active' ? 'confirmed' : 'rejected'}`}>{staff.status}</span>
            </article>
          ))}
        </div>
      </section>

      {showForm ? (
        <div className="overlay">
          <form className="modal-card staff-form" onSubmit={handleSubmit}>
            <div className="section-title">
              <div>
                <p>Tambah</p>
                <h2>{activeRole === 'doctor' ? 'Dokter' : 'Resepsionis'}</h2>
              </div>
              <button className="icon-button" onClick={() => setShowForm(false)} type="button" aria-label="Tutup">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <label>
              Nama
              <input name="name" required />
            </label>
            <label>
              Spesialisasi / Jabatan
              <input name="specialization" required />
            </label>
            <label>
              Telepon
              <input name="phone" required />
            </label>
            <label>
              Email
              <input name="email" type="email" required />
            </label>
            <button className="primary-button strong" type="submit">
              Simpan Staff
            </button>
          </form>
        </div>
      ) : null}
    </main>
  )
}
