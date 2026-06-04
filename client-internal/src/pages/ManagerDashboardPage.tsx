import { Link } from "react-router-dom";

import { Metric, StaffCard } from "../components";
import { useAuth } from "../context/AuthContext";
import { useServiceRequests } from "../context/ServiceRequestContext";
import { useStaffMembers } from "../hooks/useStaff";
import { getStatusClass } from "../utils/serviceRequest";

export function ManagerDashboardPage() {
  const { logout, user, isAuthenticated } = useAuth();
  const { requests } = useServiceRequests();
  const { staffMembers } = useStaffMembers(isAuthenticated);

  const doctors = staffMembers.filter((staff) => staff.role === "doctor");
  const receptionists = staffMembers.filter(
    (staff) => staff.role === "receptionist",
  );

  const confirmed = requests.filter(
    (request) =>
      request.status === "Diterima" ||
      request.status === "Dalam Penanganan" ||
      request.status === "Selesai" ||
      request.status === "Selesai Administrasi",
  );

  return (
    <main className="app">
      <header className="top-bar">
        <div className="brand">
          <div className="brand-logo">VC</div>
          <div>
            <p>VetConnect</p>
            <h1>Manager Portal</h1>
          </div>
        </div>

        <div className="profile">
          <Link className="text-button" to="/staff">
            Staf
          </Link>
          <div>
            <strong>{user?.full_name ?? "Manager"}</strong>
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

      <section className="hero-band manager-hero">
        <div>
          <p>Operational Overview</p>
          <h2>
            Pantau layanan, dokter, resepsionis, dan status janji temu klinik.
          </h2>
        </div>
        <div className="metric-grid">
          <Metric label="Dokter" value={doctors.length} icon="stethoscope" />
          <Metric
            label="Resepsionis"
            value={receptionists.length}
            icon="support_agent"
          />
          <Metric label="Berhasil" value={confirmed.length} icon="task_alt" />
        </div>
      </section>

      <section className="manager-grid">
        <article className="column">
          <div className="section-title">
            <div>
              <p>Staf</p>
              <h2>Directory Preview</h2>
            </div>
            <Link className="text-button" to="/staff">
              Lihat Semua
            </Link>
          </div>

          <div className="staff-grid compact">
            {staffMembers.map((staff) => (
              <StaffCard key={staff.id} staff={staff} />
            ))}
          </div>
        </article>

        <aside className="detail-panel">
          <div className="section-title compact">
            <div>
              <p>Permintaan</p>
              <h2>Status Layanan</h2>
            </div>
          </div>
          <div className="stack-list">
            {requests.map((request) => (
              <Link
                className="mini-row"
                to={`/requests/${request.id}`}
                key={request.id}
              >
                <img src={request.pet.avatar_url} alt={request.pet.name} />
                <div>
                  <strong>{request.pet.name}</strong>
                  <span>{request.service_type}</span>
                </div>
                <span className={`status ${getStatusClass(request.status)}`}>
                  {request.status}
                </span>
              </Link>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
