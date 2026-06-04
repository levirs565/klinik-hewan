import { useParams, Link, Navigate } from "react-router-dom";

import { Metric } from "../components";
import { useServiceRequests } from "../context/ServiceRequestContext";
import { useStaffDetail } from "../hooks/useStaff";
import { formatDate, statusLabel } from "../utils/serviceRequest";

export function StaffDetailPage() {
  const { id } = useParams();
  const { requests } = useServiceRequests();
  const { staff, isLoading } = useStaffDetail(id);

  if (!staff && !isLoading) {
    return <Navigate to="/staff" replace />;
  }

  if (!staff) {
    return (
      <main className="app">
        <p className="empty">Memuat detail staf...</p>
      </main>
    );
  }

  const doctorRequests = requests; // Simplified for build
  const uniqueOwners = 0; // Simplified for build

  return (
    <main className="app">
      <header className="top-bar">
        <div className="brand">
          <Link className="icon-button" to="/staff" aria-label="Kembali">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <p>{staff.role === "doctor" ? "Detail Dokter" : "Detail Staff"}</p>
            <h1>{staff.full_name}</h1>
          </div>
        </div>
      </header>

      <section className="staff-detail-hero">
        <div className="staff-profile-panel">
          <img src={staff.avatar_url} alt={staff.full_name} />
          <div>
            <span
              className={`status ${staff.is_active ? "confirmed" : "rejected"}`}
            >
              {staff.is_active ? "Active" : "Inactive"}
            </span>
            <h2>{staff.full_name}</h2>
            <small>@{staff.username}</small>
          </div>
        </div>

        <div className="metric-grid">
          <Metric
            label="Janji Temu"
            value={doctorRequests.length}
            icon="event_note"
          />
          <Metric label="Pasien" value={uniqueOwners} icon="groups" />
        </div>
      </section>

      <section className="staff-detail-layout">
        <article className="column">
          <div className="section-title">
            <div>
              <p>Profil</p>
              <h2>Informasi {staff.role === "doctor" ? "Dokter" : "Staf"}</h2>
            </div>
          </div>

          <div className="detail-card-grid">
            <DetailTile icon="person" label="Username" value={staff.username} />
            <DetailTile
              icon="task_alt"
              label="Status Operasional"
              value={staff.is_active ? "Active" : "Inactive"}
            />
          </div>
        </article>
      </section>

      <section className="date-section">
        <div className="section-title">
          <div>
            <p>Janji Temu</p>
            <h2>Riwayat Layanan</h2>
          </div>
        </div>

        <div className="table">
          {doctorRequests.map((request) => (
            <Link
              className="table-row"
              to={`/requests/${request.id}`}
              key={request.id}
            >
              <img src={request.pet.avatar_url} alt={request.pet.name} />
              <div>
                <strong>{request.pet.name}</strong>
                <span>{request.pet.breed}</span>
              </div>
              <span>{request.service_type}</span>
              <span>{formatDate(request.appointment_date)}</span>
              <span className={`status ${request.status}`}>
                {statusLabel[request.status]}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function DetailTile({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="detail-tile">
      <span className="material-symbols-outlined">{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}
