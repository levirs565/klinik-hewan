import { Link, useNavigate } from "react-router-dom";

import { Metric, RequestCard } from "../components";
import { useAuth } from "../context/AuthContext";
import { useServiceRequests } from "../context/ServiceRequestContext";
import { formatDate, statusIcon, statusLabel } from "../utils/serviceRequest";

export function DoctorDashboardPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { confirmRequest, requests } = useServiceRequests();

  // Since list doesn't have doctor info, we show all for now or filter if we have detail logic
  const assignedRequests = requests;
  const waitingConfirmation = assignedRequests.filter(
    (request) => request.status === "doctor-pending",
  );
  const confirmedRequests = assignedRequests.filter(
    (request) => request.status === "confirmed",
  );

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
          <p>Good Morning</p>
          <h2>
            Total appointments today: {assignedRequests.length} scheduled.
          </h2>
        </div>
        <div className="metric-grid">
          <Metric
            label="Pending"
            value={waitingConfirmation.length}
            icon="hourglass_empty"
          />
          <Metric
            label="Confirmed"
            value={confirmedRequests.length}
            icon="check_circle"
          />
          <Metric
            label="Total"
            value={assignedRequests.length}
            icon="calendar_month"
          />
        </div>
      </section>

      <section className="doctor-dashboard-layout">
        <article className="column">
          <div className="section-title">
            <div>
              <p>Action Required</p>
              <h2>Waiting for Confirmation</h2>
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
                    Confirm
                  </button>
                </div>
              </div>
            ))}
            {waitingConfirmation.length === 0 ? (
              <p className="empty">No pending confirmations.</p>
            ) : null}
          </div>

          <div className="section-title detail-section-gap">
            <div>
              <p>Janji Temu</p>
              <h2>Schedule Today</h2>
            </div>
          </div>
          <div className="request-grid">
            {assignedRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
            {assignedRequests.length === 0 ? (
              <p className="empty">No appointments scheduled today.</p>
            ) : null}
          </div>
        </article>

        <aside className="detail-panel">
          <div className="section-title compact">
            <div>
              <p>Status</p>
              <h2>Recent Updates</h2>
            </div>
          </div>
          <div className="stack-list">
            {assignedRequests.slice(0, 5).map((request) => (
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
                  <span className={`status ${request.status}`}>
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
