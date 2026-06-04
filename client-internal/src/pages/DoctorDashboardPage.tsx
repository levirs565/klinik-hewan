import { Link, useNavigate } from "react-router-dom";

import { Metric, RequestCard } from "../components";
import { useAuth } from "../context/AuthContext";
import { useServiceRequests } from "../hooks/useServiceRequests";
import {
  formatDate,
  getStatusClass,
  statusIcon,
  statusLabel,
} from "../utils/serviceRequest";
import { client } from "../services/api";

export function DoctorDashboardPage() {
  const navigate = useNavigate();
  const { logout, user, isAuthenticated } = useAuth();
  const { requests, mutate, isLoading } = useServiceRequests(
    { my_appointments: true },
    isAuthenticated,
  );

  const waitingConfirmation = requests.filter(
    (request) => request.status === "Menunggu Dokter",
  );
  const confirmedRequests = requests.filter(
    (request) =>
      request.status === "Diterima" ||
      request.status === "Dalam Penanganan" ||
      request.status === "Selesai",
  );

  const confirmRequest = async (id: string) => {
    try {
      await client.post(`/internal/appointments/${id}/doctor-approve`);
      await mutate();
    } catch (error) {
      console.error("Failed to approve appointment:", error);
      alert("Gagal mengonfirmasi janji temu");
    }
  };

  if (isLoading) {
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
            <strong>{user?.full_name ?? "Doctor"}</strong>
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
          <p>Selamat Pagi</p>
          <h2>Ada {requests.length} janji temu yang dijadwalkan hari ini.</h2>
        </div>
        <div className="metric-grid">
          <Metric
            label="Menunggu"
            value={waitingConfirmation.length}
            icon="hourglass_empty"
          />
          <Metric
            label="Diterima"
            value={confirmedRequests.length}
            icon="check_circle"
          />
          <Metric label="Total" value={requests.length} icon="calendar_month" />
        </div>
      </section>

      <section className="doctor-dashboard-layout">
        <article className="column">
          <div className="section-title">
            <div>
              <p>Perlu Tindakan</p>
              <h2>Menunggu Konfirmasi Anda</h2>
            </div>
          </div>

          <div className="request-list">
            {waitingConfirmation.map((request) => (
              <div className="request-action-card" key={request.id}>
                <div className="request-card-info">
                  <img src={request.pet.avatar_url} alt={request.pet.name} />
                  <div>
                    <strong>{request.pet.name}</strong>
                    <p>
                      {request.service_type} •{" "}
                      {formatDate(request.appointment_date)}
                    </p>
                  </div>
                </div>
                <div className="button-row">
                  <button
                    className="secondary-button"
                    onClick={() => navigate(`/requests/${request.id}`)}
                    type="button"
                  >
                    Detail
                  </button>
                  <button
                    className="primary-button strong"
                    onClick={() => confirmRequest(request.id)}
                    type="button"
                  >
                    Konfirmasi
                  </button>
                </div>
              </div>
            ))}
            {waitingConfirmation.length === 0 ? (
              <p className="empty">Tidak ada konfirmasi tertunda.</p>
            ) : null}
          </div>

          <div className="section-title detail-section-gap">
            <div>
              <p>Janji Temu</p>
              <h2>Jadwal Hari Ini</h2>
            </div>
          </div>
          <div className="request-grid">
            {requests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
            {requests.length === 0 ? (
              <p className="empty">Tidak ada janji temu hari ini.</p>
            ) : null}
          </div>
        </article>

        <aside className="detail-panel">
          <div className="section-title compact">
            <div>
              <p>Status</p>
              <h2>Pembaruan Terkini</h2>
            </div>
          </div>
          <div className="stack-list">
            {requests.slice(0, 5).map((request) => (
              <Link
                className="mini-row"
                to={`/requests/${request.id}`}
                key={request.id}
              >
                <img src={request.pet.avatar_url} alt={request.pet.name} />
                <div>
                  <strong>{request.pet.name}</strong>
                  <p>{request.pet.breed}</p>
                </div>
                <div className="status-indicator">
                  <span className={`status ${getStatusClass(request.status)}`}>
                    <span className="material-symbols-outlined">
                      {statusIcon[request.status]}
                    </span>
                    {statusLabel[request.status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
