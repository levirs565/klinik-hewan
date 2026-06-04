import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'

import { doctors } from '../data/dummy'
import { useServiceRequests } from '../context/ServiceRequestContext'
import { formatDate, statusLabel } from '../utils/serviceRequest'

export function ServiceDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { assignDoctor, confirmRequest, rejectRequest, requests } = useServiceRequests()
  const request = useMemo(() => requests.find((item) => item.id === Number(id)), [id, requests])
  const [doctorSelection, setDoctorSelection] = useState(doctors[0])
  const [showRejectReason, setShowRejectReason] = useState(false)
  const [reason, setReason] = useState('')

  if (!request && requests.length > 0) {
    return <Navigate to="/" replace />
  }

  if (!request) {
    return <main className="app"><p className="empty">Memuat detail layanan...</p></main>
  }

  const handleReject = () => {
    rejectRequest(request.id, reason || 'Pemilik perlu memilih jadwal ulang.')
    navigate('/')
  }

  const handleConfirm = () => {
    confirmRequest(request.id)
    navigate(`/requests/${request.id}/medical-record`)
  }

  return (
    <main className="app">
      <header className="top-bar">
        <div className="brand">
          <Link className="icon-button" to="/" aria-label="Kembali">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <p>Appointment Details</p>
            <h1>{request.petName}</h1>
          </div>
        </div>
        <span className={`status ${request.status}`}>{statusLabel[request.status]}</span>
      </header>

      <section className="detail-layout">
        <article className="column">
          <div className="service-hero">
            <img src={request.image} alt={request.petName} />
            <div>
              <span className={`status ${request.status}`}>{statusLabel[request.status]}</span>
              <h2>{request.petName}</h2>
              <p>{request.breed} • {request.age}</p>
            </div>
          </div>

          <div className="info-grid">
            <Info label="Tanggal" value={`${formatDate(request.date)} • ${request.time}`} icon="calendar_today" />
            <Info label="Layanan" value={request.service} icon="medical_services" />
            <Info label="Durasi" value={request.duration} icon="timer" />
            <Info label="Dokter" value={request.doctor} icon="stethoscope" />
          </div>

          <section className="subsection">
            <h2>Pet Owner Info</h2>
            <div className="owner-card">
              <span className="material-symbols-outlined">account_circle</span>
              <div>
                <strong>{request.owner}</strong>
                <small>{request.ownerPhone}</small>
              </div>
              <button className="icon-button" type="button" aria-label="Call owner">
                <span className="material-symbols-outlined">call</span>
              </button>
            </div>
          </section>

          <section className="subsection">
            <h2>Initial Symptoms / Owner Notes</h2>
            <p className="notes">{request.symptoms}</p>
          </section>
        </article>

        <aside className="detail-panel">
          <div className="section-title compact">
            <div>
              <p>Proses</p>
              <h2>Konfirmasi Layanan</h2>
            </div>
          </div>

          <label className="field-label" htmlFor="doctor">
            Pilih Dokter
          </label>
          <select id="doctor" value={doctorSelection} onChange={(event) => setDoctorSelection(event.target.value)}>
            {doctors.map((doctor) => (
              <option key={doctor}>{doctor}</option>
            ))}
          </select>

          <div className="action-stack">
            <button className="primary-button" onClick={() => assignDoctor(request.id, doctorSelection)} type="button">
              Assign Dokter
            </button>
            <button className="primary-button strong" onClick={handleConfirm} type="button">
              Terima & Lanjut Rekam Medis
            </button>
            <button className="secondary-button" onClick={() => setShowRejectReason(true)} type="button">
              Tolak Permintaan
            </button>
          </div>

          {showRejectReason ? (
            <div className="modal-card">
              <h2>Alasan Penolakan</h2>
              <textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Tulis alasan untuk pemilik..." />
              <button className="secondary-button" onClick={handleReject} type="button">
                Simpan Penolakan
              </button>
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  )
}

function Info({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="info-tile">
      <span className="material-symbols-outlined">{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  )
}
