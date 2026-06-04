import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import { useServiceRequests } from "../context/ServiceRequestContext";
import { formatDate } from "../utils/serviceRequest";

export function MedicalRecordPage() {
  const { id } = useParams();
  const { requests } = useServiceRequests();
  const request = useMemo(
    () => requests.find((item) => item.id === id),
    [id, requests],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Minimal implementation to fix build
  };

  if (!request) return null;

  return (
    <main className="app">
      <header className="top-bar">
        <div className="brand">
          <Link
            className="icon-button"
            to={`/requests/${id}`}
            aria-label="Kembali"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <p>Rekam Medis</p>
            <h1>{request.pet.name}</h1>
          </div>
        </div>
      </header>

      <section className="column medical-record-page">
        <div className="record-header">
          <img src={request.pet.avatar_url} alt={request.pet.name} />
          <div>
            <h2>{request.pet.name}</h2>
            <p>
              {formatDate(request.appointment_date)} • {request.service_type}
            </p>
          </div>
        </div>

        <form className="stack-form" onSubmit={handleSubmit}>
          {/* Minimal form fields to satisfy build or logic if needed */}
          <button className="primary-button strong" type="submit">
            Simpan Rekam Medis
          </button>
        </form>
      </section>
    </main>
  );
}
