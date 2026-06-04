import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Metric } from "../components";
import { useAuth } from "../context/AuthContext";
import { useServiceRequests } from "../context/ServiceRequestContext";
import { formatDate, statusIcon, statusLabel } from "../utils/serviceRequest";

export function ReceptionistDashboardPage() {
  const { logout, user } = useAuth();
  const { requests } = useServiceRequests();
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [selectedDate] = useState(new Date().toISOString().split("T")[0]);

  const activeRequest = useMemo(
    () =>
      requests.find((request) => request.id === activeRequestId) ??
      requests.find((request) => request.status === "new") ??
      requests[0],
    [activeRequestId, requests],
  );

  const appointmentsToday = useMemo(
    () =>
      requests.filter((request) =>
        request.appointment_date.startsWith(selectedDate),
      ),
    [requests, selectedDate],
  );

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
            Staff
          </Link>
          <span className="material-symbols-outlined">notifications</span>
          <div>
            <strong>{user?.full_name ?? "Staff"}</strong>
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
          <p>Front Desk Operations</p>
          <h2>Manage daily appointments and incoming service requests.</h2>
        </div>
        <div className="metric-grid">
          <Metric
            label="New Requests"
            value={requests.filter((r) => r.status === "new").length}
            icon="fiber_new"
          />
          <Metric
            label="Today's Bookings"
            value={appointmentsToday.length}
            icon="calendar_today"
          />
          <Metric
            label="Confirmed"
            value={requests.filter((r) => r.status === "confirmed").length}
            icon="task_alt"
          />
        </div>
      </section>

      <section className="receptionist-grid">
        <article className="column">
          <div className="section-title">
            <div>
              <p>Request Queue</p>
              <h2>Incoming Submissions</h2>
            </div>
          </div>

          <div className="stack-list">
            {requests
              .filter(
                (r) => r.status === "new" || r.status === "doctor-pending",
              )
              .map((request) => (
                <button
                  className={
                    activeRequest?.id === request.id
                      ? "mini-row active"
                      : "mini-row"
                  }
                  key={request.id}
                  onClick={() => setActiveRequestId(request.id)}
                  type="button"
                >
                  <img src={request.pet.avatar_url} alt={request.pet.name} />
                  <div>
                    <strong>{request.pet.name}</strong>
                    <span>{request.service_type}</span>
                  </div>
                  <span className={`status ${request.status}`}>
                    {statusLabel[request.status]}
                  </span>
                </button>
              ))}
            {requests.length === 0 ? (
              <p className="empty">No active requests.</p>
            ) : null}
          </div>
        </article>

        <aside className="detail-panel">
          {activeRequest ? (
            <>
              <div className="section-title compact">
                <div>
                  <p>Details</p>
                  <h2>{activeRequest.pet.name}</h2>
                </div>
                <Link
                  className="text-button"
                  to={`/requests/${activeRequest.id}`}
                >
                  View Full Detail
                </Link>
              </div>

              <div className="active-request-card">
                <img
                  className="detail-image"
                  src={activeRequest.pet.avatar_url}
                  alt={activeRequest.pet.name}
                />
                <dl className="info-list">
                  <dt>Service</dt>
                  <dd>{activeRequest.service_type}</dd>
                  <dt>Scheduled For</dt>
                  <dd>{formatDate(activeRequest.appointment_date)}</dd>
                </dl>
                <Link
                  className="primary-button strong mt-4"
                  to={`/requests/${activeRequest.id}`}
                >
                  Process Request
                </Link>
              </div>
            </>
          ) : (
            <p className="empty">Select a request to see details.</p>
          )}
        </aside>
      </section>

      <section className="date-section">
        <div className="section-title">
          <div>
            <p>Calendar</p>
            <h2>All Appointments</h2>
          </div>
        </div>
        <div className="table">
          <div className="table-header">
            <span>Pet</span>
            <span>Service</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {requests.map((request) => (
            <div
              className="table-row"
              key={request.id}
              onClick={() => setActiveRequestId(request.id)}
            >
              <div className="pet-info">
                <img src={request.pet.avatar_url} alt={request.pet.name} />
                <div>
                  <strong>{request.pet.name}</strong>
                  <span>{request.pet.breed}</span>
                </div>
              </div>
              <span>{request.service_type}</span>
              <span className={`status ${request.status}`}>
                <span className="material-symbols-outlined">
                  {statusIcon[request.status]}
                </span>
                {statusLabel[request.status]}
              </span>
              <Link
                className="icon-button"
                to={`/requests/${request.id}`}
                aria-label="Open detail"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
