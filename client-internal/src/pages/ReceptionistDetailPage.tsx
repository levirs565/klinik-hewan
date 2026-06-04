import { useParams, Link, Navigate } from "react-router-dom";

import { useReceptionistDetail } from "../hooks/useStaff";

export function ReceptionistDetailPage() {
  const { id } = useParams();
  const { receptionist, isLoading } = useReceptionistDetail(id);

  if (!receptionist && !isLoading) {
    return <Navigate to="/staff" replace />;
  }

  if (!receptionist) {
    return (
      <main className="app">
        <p className="empty">Memuat detail resepsionis...</p>
      </main>
    );
  }

  const avatarUrl =
    receptionist.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      receptionist.full_name,
    )}&background=random`;

  return (
    <main className="app">
      <header className="top-bar">
        <div className="brand">
          <Link className="icon-button" to="/staff" aria-label="Kembali">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <p>Detail Resepsionis</p>
            <h1>{receptionist.full_name}</h1>
          </div>
        </div>
        <Link
          className="primary-button toolbar-action"
          to={`/staff/receptionist/${id}/edit`}
        >
          Edit Resepsionis
        </Link>
      </header>

      <section className="staff-detail-hero">
        <div className="staff-profile-panel">
          <img src={avatarUrl} alt={receptionist.full_name} />
          <div>
            <span
              className={`status ${receptionist.is_active ? "confirmed" : "rejected"}`}
            >
              {receptionist.is_active ? "Active" : "Inactive"}
            </span>
            <h2>{receptionist.full_name}</h2>
            <small>@{receptionist.username}</small>
          </div>
        </div>
      </section>

      <section className="staff-detail-layout">
        <article className="column">
          <div className="section-title">
            <div>
              <p>Profil</p>
              <h2>Informasi Resepsionis</h2>
            </div>
          </div>

          <div className="detail-card-grid">
            <DetailTile
              icon="person"
              label="Username"
              value={receptionist.username}
            />
            <DetailTile icon="badge" label="Role" value="Receptionist" />
            <DetailTile
              icon="task_alt"
              label="Status Akun"
              value={receptionist.is_active ? "Active" : "Inactive"}
            />
          </div>
        </article>
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
