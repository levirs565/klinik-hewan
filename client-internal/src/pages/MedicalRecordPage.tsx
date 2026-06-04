import { useMemo } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'

import { useServiceRequests } from '../context/ServiceRequestContext'
import type { MedicalReport } from '../types'
import { formatDate } from '../utils/serviceRequest'

export function MedicalRecordPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { requests, saveMedicalReport } = useServiceRequests()
  const request = useMemo(() => requests.find((item) => item.id === Number(id)), [id, requests])

  if (!request && requests.length > 0) {
    return <Navigate to="/" replace />
  }

  if (!request) {
    return <main className="app"><p className="empty">Memuat rekam medis...</p></main>
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const report: MedicalReport = {
      diagnosis: String(formData.get('diagnosis') ?? ''),
      treatment: String(formData.get('treatment') ?? ''),
      medication: String(formData.get('medication') ?? ''),
      reminders: [
        {
          id: 1,
          date: String(formData.get('reminder_date_1') ?? ''),
          note: String(formData.get('reminder_note_1') ?? ''),
        },
        {
          id: 2,
          date: String(formData.get('reminder_date_2') ?? ''),
          note: String(formData.get('reminder_note_2') ?? ''),
        },
      ].filter((reminder) => reminder.date || reminder.note),
    }

    saveMedicalReport(request.id, report)
    navigate(`/requests/${request.id}`)
  }

  return (
    <main className="app">
      <header className="top-bar">
        <div className="brand">
          <Link className="icon-button" to={`/requests/${request.id}`} aria-label="Kembali">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <p>Add Medical Report</p>
            <h1>{request.petName}</h1>
          </div>
        </div>
      </header>

      <section className="record-layout">
        <article className="column">
          <div className="service-hero compact">
            <img src={request.image} alt={request.petName} />
            <div>
              <span className="status confirmed">Medical Report</span>
              <h2>{request.petName}</h2>
              <p>{formatDate(request.date)} • {request.time} • {request.service}</p>
            </div>
          </div>

          <form className="record-form" onSubmit={handleSubmit}>
            <label>
              Diagnosis
              <textarea name="diagnosis" defaultValue={request.medicalReport?.diagnosis} placeholder="Contoh: Otitis externa ringan..." />
            </label>
            <label>
              Treatment
              <textarea name="treatment" defaultValue={request.medicalReport?.treatment} placeholder="Tindakan yang dilakukan..." />
            </label>
            <label>
              Medication
              <textarea name="medication" defaultValue={request.medicalReport?.medication} placeholder="Obat, dosis, dan instruksi..." />
            </label>

            <div className="section-title">
              <div>
                <p>Reminder</p>
                <h2>Follow-up Multi Reminder</h2>
              </div>
            </div>

            <div className="reminder-grid">
              <label>
                Tanggal Reminder 1
                <input name="reminder_date_1" type="date" defaultValue={request.medicalReport?.reminders[0]?.date} />
              </label>
              <label>
                Catatan Reminder 1
                <input name="reminder_note_1" defaultValue={request.medicalReport?.reminders[0]?.note} placeholder="Kontrol ulang" />
              </label>
              <label>
                Tanggal Reminder 2
                <input name="reminder_date_2" type="date" defaultValue={request.medicalReport?.reminders[1]?.date} />
              </label>
              <label>
                Catatan Reminder 2
                <input name="reminder_note_2" defaultValue={request.medicalReport?.reminders[1]?.note} placeholder="Vaksin lanjutan" />
              </label>
            </div>

            <button className="primary-button strong" type="submit">
              Simpan Rekam Medis
            </button>
          </form>
        </article>
      </section>
    </main>
  )
}
