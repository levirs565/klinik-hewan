import { Link } from 'react-router-dom'

import { Metric } from '../components'
import { useAuth } from '../context/AuthContext'
import { useServiceRequests } from '../context/ServiceRequestContext'
import { staffMembers } from '../data/dummy'
import { statusLabel } from '../utils/serviceRequest'

export function ManagerDashboardPage() {
  const { logout, user } = useAuth()
  const { requests } = useServiceRequests()

  const doctors = staffMembers.filter((staff) => staff.role === 'doctor')
  const receptionists = staffMembers.filter((staff) => staff.role === 'receptionist')
  const rejected = requests.filter((request) => request.status === 'rejected')
  const confirmed = requests.filter((request) => request.status === 'confirmed')

  return (
    <main className="app">
      <header className="top-bar">
        <div className="brand">
          <div className="brand-logo">VC</div>
          <div>
            <p>VetConnect</p>
            <h1>Manager Portal</h1>
          </div>
        </div>

        <div className="profile">
          <Link className="text-button" to="/staff">
            Pengelolaan Staf
          </Link>
          <div>
            <strong>{user?.name ?? 'Manager'}</strong>
            <small>{user?.title ?? 'Clinic Manager'}</small>
          </div>
          <button className="icon-button" onClick={() => void logout()} type="button" aria-label="Logout">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      <section className="hero-band manager-hero">
        <div>
          <p>Operational Overview</p>
          <h2>Pantau layanan, dokter, resepsionis, dan keputusan permintaan klinik.</h2>
        </div>
        <div className="metric-grid">
          <Metric label="Dokter" value={doctors.length} icon="stethoscope" />
          <Metric label="Resepsionis" value={receptionists.length} icon="support_agent" />
          <Metric label="Confirmed" value={confirmed.length} icon="task_alt" />
        </div>
      </section>

      <section className="manager-grid">
        <article className="column">
          <div className="section-title">
            <div>
              <p>Staff</p>
              <h2>Directory Preview</h2>
            </div>
            <Link className="text-button" to="/staff">Lihat Semua</Link>
          </div>

          <div className="staff-grid compact">
            {staffMembers.map((staff) => (
              <Link className="staff-card staff-card-link" to={`/staff/${staff.id}`} key={staff.id}>
                <img src={staff.image} alt={staff.name} />
                <div>
                  <h2>{staff.name}</h2>
                  <p>{staff.specialization}</p>
                  <small>{staff.role}</small>
                </div>
                <span className="status confirmed">{staff.status}</span>
              </Link>
            ))}
          </div>
        </article>

        <aside className="detail-panel">
          <div className="section-title compact">
            <div>
              <p>Permintaan</p>
              <h2>Status Layanan</h2>
            </div>
          </div>
          <div className="stack-list">
            {requests.map((request) => (
              <Link className="mini-row" to={`/requests/${request.id}`} key={request.id}>
                <img src={request.image} alt={request.petName} />
                <div>
                  <strong>{request.petName}</strong>
                  <span>{request.service}</span>
                </div>
                <span className={`status ${request.status}`}>{statusLabel[request.status]}</span>
              </Link>
            ))}
          </div>
        </aside>
      </section>

      {rejected.length > 0 ? (
        <section className="date-section">
          <div className="section-title">
            <div>
              <p>Audit</p>
              <h2>Permintaan Ditolak</h2>
            </div>
          </div>
          <div className="table">
            {rejected.map((request) => (
              <div className="table-row static" key={request.id}>
                <img src={request.image} alt={request.petName} />
                <div>
                  <strong>{request.petName}</strong>
                  <span>{request.owner}</span>
                </div>
                <span>{request.service}</span>
                <span>{request.time}</span>
                <span>{request.rejectionReason ?? 'Tidak ada alasan.'}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}
