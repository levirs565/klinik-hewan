import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import { useServiceRequests } from "../context/ServiceRequestContext";
import { formatDate, statusLabel } from "../utils/serviceRequest";

export function PetDetailPage() {
  const { id } = useParams();
  const { requests } = useServiceRequests();
  const request = useMemo(
    () => requests.find((item) => item.id === id),
    [id, requests],
  );

  if (!request) return null;

  return (
    <main className="app">
      <header className="top-bar">
        <div className="brand">
          <Link
            className="icon-button"
            to={`/appointments/${id}`}
            aria-label="Kembali"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <p>Detail Hewan</p>
            <h1>{request.pet.name}</h1>
          </div>
        </div>
      </header>

      <section className="column pet-detail-page">
        <div className="pet-hero">
          <img src={request.pet.avatar_url} alt={request.pet.name} />
          <div>
            <span className={`status ${request.status}`}>
              {statusLabel[request.status]}
            </span>
            <h2>{request.pet.name}</h2>
            <p>{request.pet.breed}</p>
          </div>
        </div>

        <div className="detail-card-grid">
          <Info label="Nama Hewan" value={request.pet.name} icon="pets" />
          <Info label="Ras" value={request.pet.breed} icon="pets" />
          <Info
            label="Layanan"
            value={request.service_type}
            icon="medical_services"
          />
          <Info
            label="Tanggal"
            value={formatDate(request.appointment_date)}
            icon="calendar_today"
          />
        </div>
      </section>
    </main>
  );
}

function Info({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="detail-tile">
      <span className="material-symbols-outlined">{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}
