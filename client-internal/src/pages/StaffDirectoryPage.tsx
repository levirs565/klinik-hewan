import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { getStaffMembers, updateStaffMember } from '../services/staff'
import type { StaffMember } from '../types'

export function StaffDirectoryPage() {
  const navigate = useNavigate()
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [activeRole, setActiveRole] = useState<StaffMember['role']>('doctor')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getStaffMembers()
      .then((staff) => setStaffMembers(staff))
      .finally(() => setIsLoading(false))
  }, [])

  const filteredStaff = useMemo(
    () => staffMembers.filter((staff) => staff.role === activeRole),
    [activeRole, staffMembers],
  )

  const handleToggleStatus = async (id: number) => {
    const nextStaff = staffMembers.map((staff) =>
      staff.id === id
        ? { ...staff, status: staff.status === 'active' ? ('inactive' as const) : ('active' as const) }
        : staff,
    )
    setStaffMembers(nextStaff)
    const updated = nextStaff.find((staff) => staff.id === id)
    if (updated) {
      await updateStaffMember(updated)
    }
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
        <button className="primary-button toolbar-action" onClick={() => navigate('/staff/new')} type="button">
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

        {isLoading ? <p className="empty">Memuat staff...</p> : null}

        <div className="staff-grid">
          {filteredStaff.map((staff) => (
            <div className={staff.status === 'inactive' ? 'staff-card muted' : 'staff-card'} key={staff.id}>
              <div className="staff-card-main">
                <Link className="staff-card-link" to={`/staff/${staff.id}`}>
                  <img src={staff.image} alt={staff.name} />
                  <div>
                    <h2>{staff.name}</h2>
                    <p>{staff.specialization}</p>
                    <small>{staff.email}</small>
                  </div>
                  <span className={`status ${staff.status === 'active' ? 'confirmed' : 'rejected'}`}>{staff.status}</span>
                </Link>
                <button className="secondary-button" type="button" onClick={() => void handleToggleStatus(staff.id)}>
                  {staff.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
              </div>
            </div>
          ))}
          {!isLoading && filteredStaff.length === 0 ? <p className="empty">Tidak ada staff untuk peran ini.</p> : null}
        </div>
      </section>
    </main>
  )
}
