import { Link, useNavigate } from 'react-router-dom'

import { Metric, RequestCard } from '../components'
import { useAuth } from '../context/AuthContext'
import { useServiceRequests } from '../context/ServiceRequestContext'
import { formatDate, statusIcon, statusLabel } from '../utils/serviceRequest'

export function DoctorDashboardPage() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { confirmRequest, rejectRequest, requests } = useServiceRequests()

  const assignedRequests = requests.filter((request) => request.doctor === 'Dr. Sarah' || request.doctor === user?.name)
  const waitingConfirmation = assignedRequests.filter((request) => request.status === 'doctor-pending')
  const confirmedRequests = assignedRequests.filter((request) => request.status === 'confirmed')
  const reportQueue = confirmedRequests.filter((request) => !request.medicalReport)

  return (
    <main className="app">
      <header className="top-bar">
        <div className="brand">
          <div className="brand-logo">VC</div>
          <div>
            <p>VetConnect</p>
            <h1>Doctor Portal</h1>
          </div>
        </div>

        <div className="profile">
          <span className="material-symbols-outlined">notifications</span>
          <div>
            <strong>{user?.name ?? 'Doctor'}</strong>
            <small>{user?.title ?? 'Veterinarian'}</small>
          </div>
          <button className="icon-button" onClick={() => void logout()} type="button" aria-label="Logout">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      <section className="hero-band doctor-hero">
        <div>
          <p>Good Morning</p>
          <h2>Total appointments today: {assignedRequests.length} scheduled.</h2>
        </div>
        <div className="metric-grid">
          <Metric label="Pending" value={waitingConfirmation.length} icon="hourglass_empty" />
          <Metric label="Confirmed" value={confirmedRequests.length} icon="event_available" />
          <Metric label="Need Report" value={reportQueue.length} icon="note_add" />
        </div>
      </section>

      <section className="workspace">
        <div className="column wide">
          <div className="section-title">
            <div>
              <p>Layanan</p>
              <h2>Menunggu Konfirmasi Dokter</h2>
            </div>
            <span className="pill warm">{waitingConfirmation.length} Pending</span>
          </div>

          <div className="request-grid">
            {waitingConfirmation.map((request) => (
              <article className="process-card" key={request.id}>
                <RequestCard isActive={false} request={request} onClick={() => navigate(`/requests/${request.id}`)} />
                <div className="inline-actions">
                  <button className="secondary-button" onClick={() => rejectRequest(request.id, 'Dokter tidak tersedia pada jadwal ini.')} type="button">
                    Tolak
                  </button>
                  <button className="primary-button strong" onClick={() => confirmRequest(request.id)} type="button">
                    Terima
                  </button>
                </div>
              </article>
            ))}
            {waitingConfirmation.length === 0 ? <p className="empty">Tidak ada permintaan konfirmasi dokter.</p> : null}
          </div>
        </div>

        <aside className="detail-panel">
          <div className="section-title compact">
            <div>
              <p>Rekam Medis</p>
              <h2>Perlu Laporan</h2>
            </div>
          </div>
          <div className="stack-list">
            {reportQueue.map((request) => (
              <Link className="mini-row" key={request.id} to={`/requests/${request.id}/medical-record`}>
                <img src={request.image} alt={request.petName} />
                <div>
                  <strong>{request.petName}</strong>
                  <span>{request.service} • {formatDate(request.date)}</span>
                </div>
                <span className="material-symbols-outlined">chevron_right</span>
              </Link>
            ))}
            {reportQueue.length === 0 ? <p className="empty">Semua laporan sudah lengkap.</p> : null}
          </div>
        </aside>
      </section>

      <section className="date-section">
        <div className="section-title">
          <div>
            <p>Schedule</p>
            <h2>Layanan Berdasarkan Tanggal</h2>
          </div>
        </div>
        <div className="table">
          {assignedRequests.map((request) => (
            <button className="table-row" key={request.id} onClick={() => navigate(`/requests/${request.id}`)} type="button">
              <img src={request.image} alt={request.petName} />
              <div>
                <strong>{request.petName}</strong>
                <span>{request.breed} • {request.owner}</span>
              </div>
              <span>{request.service}</span>
              <span>{request.time}</span>
              <span className={`status ${request.status}`}>
                <span className="material-symbols-outlined">{statusIcon[request.status]}</span>
                {statusLabel[request.status]}
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}
