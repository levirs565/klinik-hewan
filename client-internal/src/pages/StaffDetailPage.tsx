import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { Metric } from '../components'
import { useServiceRequests } from '../context/ServiceRequestContext'
import { getStaffMembers } from '../services/staff'
import type { ServiceRequest, StaffMember } from '../types'
import { formatDate, statusLabel } from '../utils/serviceRequest'

export function StaffDetailPage() {
  const { id } = useParams()
  const { requests } = useServiceRequests()
  const [staff, setStaff] = useState<StaffMember | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getStaffMembers()
      .then((staffList) => setStaff(staffList.find((item) => item.id === Number(id)) ?? null))
      .finally(() => setIsLoading(false))
  }, [id])

  if (!staff && !isLoading) {
    return <Navigate to="/staff" replace />
  }

  if (!staff) {
    return <main className="app"><p className="empty">Memuat detail staf...</p></main>
  }

  const doctorRequests = requests.filter((request) => isAssignedToDoctor(request, staff))
  const upcomingAppointments = doctorRequests.filter((request) => request.status !== 'rejected')
  const completedReports = doctorRequests.filter((request) => request.medicalReport)
  const uniqueOwners = new Set(doctorRequests.map((request) => request.owner)).size
  const services = staff.services?.length ? staff.services : deriveServices(doctorRequests, staff)
  const nextAppointment = upcomingAppointments
    .slice()
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))[0]

  return (
    <main className="app">
      <header className="top-bar">
        <div className="brand">
          <Link className="icon-button" to="/staff" aria-label="Kembali">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <p>{staff.role === 'doctor' ? 'Detail Dokter' : 'Detail Staff'}</p>
            <h1>{staff.name}</h1>
          </div>
        </div>
        <Link className="text-button" to="/">
          Manager Portal
        </Link>
      </header>

      <section className="staff-detail-hero">
        <div className="staff-profile-panel">
          <img src={staff.image} alt={staff.name} />
          <div>
            <span className={`status ${staff.status === 'active' ? 'confirmed' : 'rejected'}`}>{staff.status}</span>
            <h2>{staff.name}</h2>
            <p>{staff.specialization}</p>
            <small>{staff.bio ?? 'Profil staff belum dilengkapi.'}</small>
          </div>
        </div>

        <div className="metric-grid">
          <Metric label="Janji Temu" value={doctorRequests.length} icon="event_note" />
          <Metric label="Pasien" value={uniqueOwners} icon="groups" />
          <Metric label="Rekam Medis" value={completedReports.length} icon="clinical_notes" />
        </div>
      </section>

      <section className="staff-detail-layout">
        <article className="column">
          <div className="section-title">
            <div>
              <p>Profil</p>
              <h2>Informasi Dokter</h2>
            </div>
          </div>

          <div className="detail-card-grid">
            <DetailTile icon="badge" label="Nomor STR" value={staff.licenseNumber ?? '-'} />
            <DetailTile icon="school" label="Pendidikan" value={staff.education ?? '-'} />
            <DetailTile icon="workspace_premium" label="Pengalaman" value={staff.experience ?? '-'} />
            <DetailTile icon="meeting_room" label="Ruang Praktik" value={staff.room ?? '-'} />
            <DetailTile icon="schedule" label="Jadwal" value={staff.schedule ?? '-'} />
            <DetailTile icon="mail" label="Email" value={staff.email} />
            <DetailTile icon="call" label="Telepon" value={staff.phone} />
            <DetailTile icon="task_alt" label="Status Operasional" value={staff.status} />
          </div>

          <div className="section-title detail-section-gap">
            <div>
              <p>Layanan</p>
              <h2>Detail Layanan yang Ditangani</h2>
            </div>
          </div>

          <div className="service-detail-grid">
            {services.map((service) => {
              const relatedRequests = doctorRequests.filter((request) => request.service === service)
              return (
                <article className="service-detail-card" key={service}>
                  <div className="service-detail-icon">
                    <span className="material-symbols-outlined">{serviceIcon(service)}</span>
                  </div>
                  <div>
                    <h3>{service}</h3>
                    <p>{serviceDescription(service)}</p>
                    <small>{relatedRequests.length} janji temu terkait</small>
                  </div>
                </article>
              )
            })}
          </div>

          {staff.certifications?.length ? (
            <>
              <div className="section-title detail-section-gap">
                <div>
                  <p>Kualifikasi</p>
                  <h2>Sertifikasi</h2>
                </div>
              </div>
              <div className="chip-list">
                {staff.certifications.map((certification) => (
                  <span className="chip" key={certification}>{certification}</span>
                ))}
              </div>
            </>
          ) : null}
        </article>

        <aside className="detail-panel">
          <div className="section-title compact">
            <div>
              <p>Berikutnya</p>
              <h2>Janji Temu Terdekat</h2>
            </div>
          </div>

          {nextAppointment ? (
            <div className="next-appointment-card">
              <img src={nextAppointment.image} alt={nextAppointment.petName} />
              <div>
                <span className={`status ${nextAppointment.status}`}>{statusLabel[nextAppointment.status]}</span>
                <h3>{nextAppointment.petName}</h3>
                <p>{nextAppointment.service}</p>
                <small>{formatDate(nextAppointment.date)} - {nextAppointment.time}</small>
              </div>
              <Link className="primary-button strong" to={`/requests/${nextAppointment.id}`}>
                Buka Detail
              </Link>
            </div>
          ) : (
            <p className="empty">Belum ada janji temu aktif untuk staff ini.</p>
          )}

          <div className="section-title compact detail-section-gap">
            <div>
              <p>Kontak</p>
              <h2>Komunikasi</h2>
            </div>
          </div>
          <div className="contact-stack">
            <ContactRow icon="mail" label="Email" value={staff.email} />
            <ContactRow icon="call" label="Telepon" value={staff.phone} />
            <ContactRow icon="event_available" label="Jadwal" value={staff.schedule ?? '-'} />
          </div>
        </aside>
      </section>

      <section className="date-section">
        <div className="section-title">
          <div>
            <p>Janji Temu</p>
            <h2>Riwayat dan Pipeline Layanan</h2>
          </div>
        </div>

        {doctorRequests.length === 0 ? (
          <p className="empty">Belum ada layanan yang ditugaskan ke staff ini.</p>
        ) : (
          <div className="appointment-detail-table">
            {doctorRequests.map((request) => (
              <Link className="appointment-detail-row" to={`/requests/${request.id}`} key={request.id}>
                <img src={request.image} alt={request.petName} />
                <div>
                  <strong>{request.petName}</strong>
                  <span>{request.breed} - {request.age}</span>
                </div>
                <div>
                  <strong>{request.service}</strong>
                  <span>{request.duration}</span>
                </div>
                <div>
                  <strong>{formatDate(request.date)}</strong>
                  <span>{request.time}</span>
                </div>
                <div>
                  <strong>{request.owner}</strong>
                  <span>{request.ownerPhone}</span>
                </div>
                <span className={`status ${request.status}`}>{statusLabel[request.status]}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

function DetailTile({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="detail-tile">
      <span className="material-symbols-outlined">{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  )
}

function ContactRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="contact-row">
      <span className="material-symbols-outlined">{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  )
}

function isAssignedToDoctor(request: ServiceRequest, staff: StaffMember) {
  if (staff.role !== 'doctor') return false
  const firstName = staff.name.replace(/^Dr\.\s*/i, '').split(' ')[0]
  return request.doctor === staff.name || request.doctor === `Dr. ${firstName}`
}

function deriveServices(requests: ServiceRequest[], staff: StaffMember) {
  const requestServices = Array.from(new Set(requests.map((request) => request.service)))
  if (requestServices.length) return requestServices
  if (staff.role === 'doctor') return [staff.specialization]
  return ['Koordinasi Jadwal', 'Administrasi Pasien']
}

function serviceIcon(service: string) {
  const normalized = service.toLowerCase()
  if (normalized.includes('vaccine') || normalized.includes('vaccination')) return 'vaccines'
  if (normalized.includes('dental')) return 'dentistry'
  if (normalized.includes('surgery')) return 'surgical'
  if (normalized.includes('ortho')) return 'orthopedics'
  return 'medical_services'
}

function serviceDescription(service: string) {
  const normalized = service.toLowerCase()
  if (normalized.includes('vaccine') || normalized.includes('vaccination')) {
    return 'Pencegahan penyakit, pengecekan kesiapan vaksin, dan rekomendasi pengingat lanjutan.'
  }
  if (normalized.includes('dental')) {
    return 'Pemeriksaan mulut, scaling, edukasi perawatan gigi, dan evaluasi pasca tindakan.'
  }
  if (normalized.includes('surgery')) {
    return 'Kontrol luka, evaluasi pemulihan, dan penyesuaian instruksi perawatan rumah.'
  }
  if (normalized.includes('ortho')) {
    return 'Evaluasi mobilitas, nyeri sendi, dan rencana tindak lanjut ortopedi.'
  }
  return 'Pemeriksaan klinis, diagnosis awal, tindakan, obat, dan rencana follow-up pasien.'
}
