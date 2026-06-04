import { useMemo } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'

import { useServiceRequests } from '../context/ServiceRequestContext'
import { formatDate, statusLabel } from '../utils/serviceRequest'

export function PetDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { requests } = useServiceRequests()
  const request = useMemo(() => requests.find((item) => item.id === Number(id)), [id, requests])

  if (!request && requests.length > 0) {
    return <Navigate to="/" replace />
  }

  if (!request) {
    return (
      <main className="app">
        <p className="empty">Memuat detail hewan...</p>
      </main>
    )
  }

  return (
    <main className="app">
      <header className="top-bar">
        <div className="brand">
          <Link className="icon-button" to={`/requests/${request.id}`} aria-label="Kembali">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <p>Pet Detail</p>
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
            <Info label="Nama Hewan" value={request.petName} icon="pets" />
            <Info label="Ras" value={request.breed} icon="pets" />
            <Info label="Usia" value={request.age} icon="schedule" />
            <Info label="Pemilik" value={request.owner} icon="person" />
            <Info label="Kontak" value={request.ownerPhone} icon="phone" />
            <Info label="Layanan" value={request.service} icon="medical_services" />
            <Info label="Jadwal" value={`${formatDate(request.date)} • ${request.time}`} icon="calendar_today" />
            <Info label="Status" value={statusLabel[request.status]} icon="info" />
          </div>

          <section className="subsection">
            <h2>Catatan Pemilik</h2>
            <p className="notes">{request.symptoms}</p>
          </section>

          {request.medicalReport ? (
            <section className="subsection">
              <h2>Rekam Medis</h2>
              <div className="detail-card-grid">
                <Info label="Diagnosis" value={request.medicalReport.diagnosis} icon="medical_information" />
                <Info label="Pengobatan" value={request.medicalReport.treatment} icon="healing" />
                <Info label="Obat" value={request.medicalReport.medication} icon="local_pharmacy" />
              </div>
            </section>
          ) : null}
        </article>
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
