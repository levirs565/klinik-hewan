import { useState } from "react";
import { Link } from "react-router-dom";

import { Metric } from "../components";
import { useAuth } from "../context/AuthContext";
import { useServiceRequests } from "../hooks/useServiceRequests";
import {
  formatDate,
  getStatusClass,
  statusIcon,
  statusLabel,
} from "../utils/serviceRequest";

export function DoctorDashboardPage() {
  const { logout, user, isAuthenticated } = useAuth();

  // Use specific queries with my_appointments=true
  const { requests: pendingRequests, isLoading: isLoadingPending } =
    useServiceRequests(
      { status: "Menunggu Dokter", my_appointments: true },
      isAuthenticated,
    );

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const { requests: calendarRequests, isLoading: isLoadingCalendar } =
    useServiceRequests(
      { date: selectedDate, my_appointments: true },
      isAuthenticated,
    );

  const { requests: allMyRequests } = useServiceRequests(
    { my_appointments: true },
    isAuthenticated,
  );

  if (isLoadingPending && isLoadingCalendar) {
    return (
      <main className="app">
        <p className="empty">Memuat data dashboard...</p>
      </main>
    );
  }

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
            <strong>{user?.full_name ?? "Dokter"}</strong>
          </div>
          <button
            className="icon-button"
            onClick={() => void logout()}
            type="button"
            aria-label="Logout"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      <section className="hero-band doctor-hero">
        <div>
          <p>Selamat Pagi, drh. {user?.full_name.split(" ")[0]}</p>
          <h2>Kelola pasien dan riwayat penanganan medis Anda hari ini.</h2>
        </div>
        <div className="metric-grid">
          <Metric
            label="Perlu Konfirmasi"
            value={pendingRequests.length}
            icon="hourglass_empty"
          />
          <Metric
            label="Jadwal Hari Ini"
            value={calendarRequests.length}
            icon="calendar_today"
          />
          <Metric
            label="Total Ditangani"
            value={
              allMyRequests.filter(
                (r) =>
                  r.status === "Dalam Penanganan" || r.status === "Selesai",
              ).length
            }
            icon="medical_services"
          />
        </div>
      </section>

      <section className="column">
        <div className="section-title">
          <div>
            <p>Perlu Tindakan</p>
            <h2>Menunggu Konfirmasi Anda</h2>
          </div>
        </div>

        <div className="stack-list">
          {pendingRequests.map((request) => (
            <Link
              className="mini-row"
              key={request.id}
              to={`/appointments/${request.id}`}
            >
              <img
                src={
                  request.pet.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    request.pet.name,
                  )}&background=random`
                }
                alt={request.pet.name}
              />
              <div className="flex-grow">
                <div className="row-title">
                  <strong>{request.pet.name}</strong>
                  <span className="breed-tag">{request.pet.breed}</span>
                </div>
                <div className="row-meta">
                  <span className="service-type">{request.service_type}</span>
                  <span className="meta-separator">•</span>
                  <span className="appointment-date">
                    {formatDate(request.appointment_date)}
                  </span>
                </div>
              </div>
              <div className="row-status">
                <span className={`status ${getStatusClass(request.status)}`}>
                  {statusLabel[request.status]}
                </span>
                <span className="material-symbols-outlined">chevron_right</span>
              </div>
            </Link>
          ))}
          {pendingRequests.length === 0 && !isLoadingPending ? (
            <p className="empty">
              Tidak ada janji temu yang menunggu konfirmasi Anda.
            </p>
          ) : null}
        </div>
      </section>

      <section className="date-section">
        <div className="section-title">
          <div>
            <p>Jadwal Layanan</p>
            <h2>Janji Temu Tanggal {formatDate(selectedDate)}</h2>
          </div>
          <div className="date-picker">
            <span className="material-symbols-outlined">calendar_month</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        <div className="stack-list">
          {calendarRequests.map((request) => (
            <Link
              className="mini-row"
              key={request.id}
              to={`/appointments/${request.id}`}
            >
              <img
                src={
                  request.pet.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    request.pet.name,
                  )}&background=random`
                }
                alt={request.pet.name}
              />
              <div className="flex-grow">
                <div className="row-title">
                  <strong>{request.pet.name}</strong>
                  <span className="breed-tag">{request.pet.breed}</span>
                </div>
                <div className="row-meta">
                  <span className="service-type">{request.service_type}</span>
                </div>
              </div>
              <div className="row-status">
                <span className={`status ${getStatusClass(request.status)}`}>
                  <span className="material-symbols-outlined">
                    {statusIcon[request.status]}
                  </span>
                  {statusLabel[request.status]}
                </span>
                <span className="material-symbols-outlined">chevron_right</span>
              </div>
            </Link>
          ))}
          {calendarRequests.length === 0 && !isLoadingCalendar ? (
            <p className="empty">Tidak ada janji temu Anda pada tanggal ini.</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
