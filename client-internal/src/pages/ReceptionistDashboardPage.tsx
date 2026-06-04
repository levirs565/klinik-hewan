import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Metric, RequestCard } from '../components'
import { useAuth } from '../context/AuthContext'
import { DEFAULT_SERVICE_DATE } from '../config'
import { useServiceRequests } from '../context/ServiceRequestContext'
import { formatDate, isPendingStatus, statusIcon, statusLabel } from '../utils/serviceRequest'

export function ReceptionistDashboardPage() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { isLoading, requests } = useServiceRequests()
  const [selectedDate, setSelectedDate] = useState(DEFAULT_SERVICE_DATE)
  const [activeRequestId, setActiveRequestId] = useState<number | null>(null)

  const activeRequest = requests.find((request) => request.id === activeRequestId) ?? requests[0] ?? null

  const pendingRequests = useMemo(
    () => requests.filter((request) => isPendingStatus(request.status)),
    [requests],
  )

  const dateRequests = useMemo(
    () => requests.filter((request) => request.date === selectedDate),
    [requests, selectedDate],
  )

  return (
    <main className="app">
      <header className="top-bar">
        <div className="brand">
          <div className="brand-logo">VC</div>
          <div>
            <p>VetConnect</p>
            <h1>Internal Staff Portal</h1>
          </div>
        </div>

        <div className="profile">
          <Link className="text-button" to="/staff">
            Staff
          </Link>
          <span className="material-symbols-outlined">notifications</span>
          <div>
            <strong>{user?.name ?? 'Staff'}</strong>
            <small>{user?.title ?? 'Internal Staff'}</small>
          </div>
          <button className="icon-button" onClick={() => void logout()} type="button" aria-label="Logout">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      <section className="hero-band">
        <div>
          <p>Ringkasan Hari Ini</p>
          <h2>Kelola permintaan layanan klinik dari satu tampilan fullscreen.</h2>
        </div>
        <div className="metric-grid">
          <Metric label="Permintaan" value={pendingRequests.length} icon="assignment" />
          <Metric label="Tanggal Ini" value={dateRequests.length} icon="calendar_month" />
          <Metric
            label="Terkonfirmasi"
            value={requests.filter((request) => request.status === 'confirmed').length}
            icon="task_alt"
          />
        </div>
      </section>

      <section className="workspace">
        <div className="column wide">
          <div className="section-title">
            <div>
              <p>Permintaan</p>
              <h2>Menunggu Diproses</h2>
            </div>
            <span className="pill warm">{pendingRequests.length} Aktif</span>
          </div>

          <div className="request-grid">
            {isLoading ? <p className="empty">Memuat permintaan...</p> : null}
            {pendingRequests.map((request) => (
              <RequestCard
                isActive={request.id === activeRequest?.id}
                key={request.id}
                request={request}
                onClick={() => setActiveRequestId(request.id)}
              />
            ))}
            {!isLoading && pendingRequests.length === 0 ? <p className="empty">Tidak ada permintaan aktif.</p> : null}
          </div>
        </div>

        {activeRequest ? (
          <aside className="detail-panel">
            <div className="section-title compact">
              <div>
                <p>Detail Layanan</p>
                <h2>{activeRequest.petName}</h2>
              </div>
              <span className={`status ${activeRequest.status}`}>{statusLabel[activeRequest.status]}</span>
            </div>

            <img className="detail-image" src={activeRequest.image} alt={activeRequest.petName} />

            <dl className="info-list">
              <div>
                <dt>Hewan</dt>
                <dd>
                  {activeRequest.petName} <span>{activeRequest.breed}</span>
                </dd>
              </div>
              <div>
                <dt>Pemilik</dt>
                <dd>{activeRequest.owner}</dd>
              </div>
              <div>
                <dt>Layanan</dt>
                <dd>{activeRequest.service}</dd>
              </div>
              <div>
                <dt>Jadwal</dt>
                <dd>
                  {formatDate(activeRequest.date)} pukul {activeRequest.time}
                </dd>
              </div>
            </dl>

            <p className="notes">{activeRequest.notes}</p>

            <div className="action-row">
              <button className="secondary-button" onClick={() => navigate(`/requests/${activeRequest.id}`)} type="button">
                Detail
              </button>
              <button className="primary-button" onClick={() => navigate(`/requests/${activeRequest.id}`)} type="button">
                Proses
              </button>
              <button className="primary-button strong" onClick={() => navigate(`/requests/${activeRequest.id}/medical-record`)} type="button">
                Rekam Medis
              </button>
            </div>
          </aside>
        ) : null}
      </section>

      <section className="date-section">
        <div className="section-title">
          <div>
            <p>Tanggal</p>
            <h2>Layanan Berdasarkan Tanggal</h2>
          </div>
          <label className="date-picker">
            <span className="material-symbols-outlined">calendar_today</span>
            <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
          </label>
        </div>

        <div className="table">
          {dateRequests.map((request) => (
            <button className="table-row" key={request.id} onClick={() => setActiveRequestId(request.id)} type="button">
              <img src={request.image} alt={request.petName} />
              <div>
                <strong>{request.petName}</strong>
                <span>
                  {request.breed} • {request.owner}
                </span>
              </div>
              <span>{request.service}</span>
              <span>{request.time}</span>
              <span className={`status ${request.status}`}>
                <span className="material-symbols-outlined">{statusIcon[request.status]}</span>
                {statusLabel[request.status]}
              </span>
            </button>
          ))}
          {dateRequests.length === 0 ? <p className="empty">Tidak ada layanan pada tanggal ini.</p> : null}
        </div>
      </section>
    </main>
  )
}
