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

export function ReceptionistDashboardPage() {
  const { logout, user, isAuthenticated } = useAuth();

  // Use specific queries as requested
  const { requests: pendingRequests, isLoading: isLoadingPending } =
    useServiceRequests({ status: "Menunggu Konfirmasi" }, isAuthenticated);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const { requests: calendarRequests, isLoading: isLoadingCalendar } =
    useServiceRequests({ date: selectedDate }, isAuthenticated);

  const { requests: allRequests } = useServiceRequests({}, isAuthenticated);

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
            <h1>Receptionist Portal</h1>
          </div>
        </div>

        <div className="profile">
          <Link className="text-button" to="/staff">
            Staf
          </Link>
          <span className="material-symbols-outlined">notifications</span>
          <div>
            <strong>{user?.full_name ?? "Staf"}</strong>
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

      <section className="hero-band receptionist-hero">
        <div>
          <p>Operasional Resepsionis</p>
          <h2>Kelola janji temu harian dan permintaan layanan masuk.</h2>
        </div>
        <div className="metric-grid">
          <Metric
            label="Permintaan Baru"
            value={pendingRequests.length}
            icon="fiber_new"
          />
          <Metric
            label="Booking Hari Ini"
            value={calendarRequests.length}
            icon="calendar_today"
          />
          <Metric
            label="Total Diterima"
            value={
              allRequests.filter(
                (r) =>
                  r.status === "Diterima" ||
                  r.status === "Dalam Penanganan" ||
                  r.status === "Selesai",
              ).length
            }
            icon="task_alt"
          />
        </div>
      </section>

      <section className="column">
        <div className="section-title">
          <div>
            <p>Antrean Permintaan</p>
            <h2>Menunggu Konfirmasi</h2>
          </div>
        </div>

        <div className="stack-list">
          {pendingRequests.map((request) => (
            <Link
              className="mini-row"
              key={request.id}
              to={`/requests/${request.id}`}
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
            <p className="empty">Tidak ada permintaan menunggu konfirmasi.</p>
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
              to={`/requests/${request.id}`}
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
            <p className="empty">Tidak ada janji temu pada tanggal ini.</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
