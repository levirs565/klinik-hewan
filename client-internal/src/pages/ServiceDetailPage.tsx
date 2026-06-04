import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import { useServiceRequests } from "../context/ServiceRequestContext";
import {
  formatDate,
  statusLabel,
  getStatusClass,
} from "../utils/serviceRequest";

export function ServiceDetailPage() {
  const { id } = useParams();
  const { requests, confirmRequest, rejectRequest } = useServiceRequests();
  const request = useMemo(
    () => requests.find((item) => item.id === id),
    [id, requests],
  );

  if (!request) return null;

  return (
    <main className="app">
      <header className="top-bar">
        <div className="brand">
          <Link className="icon-button" to="/" aria-label="Kembali">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <p>Detail Permintaan</p>
            <h1>{request.pet.name}</h1>
          </div>
        </div>
      </header>

      <section className="column service-detail-page">
        <div className="service-hero">
          <img src={request.pet.avatar_url} alt={request.pet.name} />
          <div>
            <span className={`status ${getStatusClass(request.status)}`}>
              {statusLabel[request.status]}
            </span>
            <h2>{request.pet.name}</h2>
            <p>{request.pet.breed}</p>
          </div>
        </div>

        <div className="detail-card-grid">
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

        <div className="button-row mt-8">
          {request.status === "Menunggu Konfirmasi" && (
            <>
              <button
                className="secondary-button"
                onClick={() =>
                  rejectRequest(request.id, "Tidak dapat diproses")
                }
                type="button"
              >
                Tolak
              </button>
              <button
                className="primary-button strong"
                onClick={() => confirmRequest(request.id)}
                type="button"
              >
                Konfirmasi
              </button>
            </>
          )}
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
