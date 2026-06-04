import { useParams, Link, Navigate } from "react-router-dom";

import { Metric } from "../components";
import { useDoctorDetail, useDoctorAppointments } from "../hooks/useStaff";
import { formatDate, statusLabel } from "../utils/serviceRequest";

export function DoctorDetailPage() {
  const { id } = useParams();
  const { doctor, isLoading: isLoadingDoctor } = useDoctorDetail(id);
  const { appointments, isLoading: isLoadingAppointments } =
    useDoctorAppointments(id);

  if (!doctor && !isLoadingDoctor) {
    return <Navigate to="/staff" replace />;
  }

  if (!doctor) {
    return (
      <main className="app">
        <p className="empty">Memuat detail dokter...</p>
      </main>
    );
  }

  const doctorRequests = appointments;
  const uniqueOwners = new Set(doctorRequests.map((r) => r.pet.name)).size;

  const avatarUrl =
    doctor.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      doctor.full_name,
    )}&background=random`;

  return (
    <main className="app">
      <header className="top-bar">
        <div className="brand">
          <Link className="icon-button" to="/staff" aria-label="Kembali">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <p>Detail Dokter</p>
            <h1>{doctor.full_name}</h1>
          </div>
        </div>
        <Link
          className="primary-button toolbar-action"
          to={`/staff/doctor/${id}/edit`}
        >
          Edit Dokter
        </Link>
      </header>

      <section className="staff-detail-hero">
        <div className="staff-profile-panel">
          <img src={avatarUrl} alt={doctor.full_name} />
          <div>
            <span
              className={`status ${doctor.is_active ? "confirmed" : "rejected"}`}
            >
              {doctor.is_active ? "Active" : "Inactive"}
            </span>
            <h2>{doctor.full_name}</h2>
            <small>@{doctor.username}</small>
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
              <p>Profil Profesional</p>
              <h2>Informasi Dokter</h2>
            </div>
          </div>

          <div className="detail-card-grid">
            <DetailTile
              icon="person"
              label="Username"
              value={doctor.username}
            />
            <DetailTile
              icon="task_alt"
              label="Status Akun"
              value={doctor.is_active ? "Active" : "Inactive"}
            />
            {doctor.birth_date && (
              <DetailTile
                icon="calendar_today"
                label="Tanggal Lahir"
                value={formatDate(doctor.birth_date)}
              />
            )}
            {doctor.education_history && (
              <DetailTile
                icon="school"
                label="Pendidikan"
                value={doctor.education_history}
              />
            )}
            {doctor.practice_start_date && (
              <DetailTile
                icon="work_history"
                label="Mulai Praktik"
                value={formatDate(doctor.practice_start_date)}
              />
            )}
            {doctor.join_date && (
              <DetailTile
                icon="event_available"
                label="Tanggal Bergabung Klinik"
                value={formatDate(doctor.join_date)}
              />
            )}
            {doctor.practice_location_history && (
              <DetailTile
                icon="location_on"
                label="Riwayat Lokasi Praktik"
                value={doctor.practice_location_history}
              />
            )}
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

        {isLoadingAppointments ? (
          <p className="empty">Memuat riwayat layanan...</p>
        ) : (
          <div className="table">
            {doctorRequests.map((request) => (
              <Link
                className="table-row"
                to={`/appointments/${request.id}`}
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
                  {statusLabel[request.status as keyof typeof statusLabel]}
                </span>
              </Link>
            ))}
            {doctorRequests.length === 0 && (
              <p className="empty">Belum ada riwayat layanan.</p>
            )}
          </div>
        )}
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
