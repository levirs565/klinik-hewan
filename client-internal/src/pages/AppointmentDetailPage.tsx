import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import {
  useAppointmentDetail,
  useApproveAppointment,
  useRejectAppointment,
} from "../hooks/useServiceRequests";
import { useAuth } from "../context/AuthContext";
import {
  formatDate,
  statusLabel,
  getStatusClass,
} from "../utils/serviceRequest";
import { RejectionDialog } from "../components";
import type { RequestStatus } from "../types";

export function AppointmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { appointment, isLoading } = useAppointmentDetail(id);
  const { trigger: approveTrigger, isMutating: isApproving } =
    useApproveAppointment(id);
  const { trigger: rejectTrigger, isMutating: isRejecting } =
    useRejectAppointment(id);

  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);

  const confirmRequest = async () => {
    try {
      await approveTrigger();
    } catch (error) {
      console.error("Failed to confirm request:", error);
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await rejectTrigger({ reason });
      setIsRejectionDialogOpen(false);
    } catch (error) {
      console.error("Failed to reject request:", error);
    }
  };

  if (isLoading) {
    return (
      <main className="app">
        <p className="empty">Memuat detail janji temu...</p>
      </main>
    );
  }

  if (!appointment) {
    return (
      <main className="app">
        <p className="empty">Janji temu tidak ditemukan.</p>
        <Link to="/" className="text-button">
          Kembali ke Dashboard
        </Link>
      </main>
    );
  }

  const isProcessing = isApproving || isRejecting;

  return (
    <main className="app">
      <header className="top-bar">
        <div className="brand">
          <Link className="icon-button" to="/" aria-label="Kembali">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <p>Detail Janji Temu</p>
            <h1>{appointment.pet.name}</h1>
          </div>
        </div>
      </header>

      <div className="workspace">
        <section className="column">
          <div className="service-hero">
            <img
              src={
                appointment.pet.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  appointment.pet.name,
                )}&background=random`
              }
              alt={appointment.pet.name}
            />
            <div>
              <span className={`status ${getStatusClass(appointment.status)}`}>
                {statusLabel[appointment.status as RequestStatus]}
              </span>
              <h2>{appointment.pet.name}</h2>
              <p>{appointment.pet.breed}</p>
            </div>
          </div>

          <div className="section-title">
            <div>
              <p>Informasi Layanan</p>
              <h2>Detail Reservasi</h2>
            </div>
          </div>

          <div className="info-grid">
            <Info
              label="Jenis Layanan"
              value={appointment.service_type}
              icon="medical_services"
            />
            <Info
              label="Tanggal Janji"
              value={formatDate(appointment.appointment_date)}
              icon="calendar_today"
            />
            {appointment.doctor && (
              <Info
                label="Dokter Penanggung Jawab"
                value={appointment.doctor.name}
                icon="stethoscope"
              />
            )}
          </div>

          {appointment.owner_notes && (
            <div className="subsection">
              <h2>Catatan Pemilik</h2>
              <div className="notes">{appointment.owner_notes}</div>
            </div>
          )}

          {appointment.previous_medical_history && (
            <div className="subsection">
              <h2>Riwayat Medis Sebelumnya</h2>
              <div className="notes">
                {appointment.previous_medical_history}
              </div>
            </div>
          )}

          <div className="button-row mt-8">
            {appointment.status === "Menunggu Konfirmasi" &&
              user?.role === "receptionist" && (
                <>
                  <button
                    className="secondary-button"
                    onClick={() => setIsRejectionDialogOpen(true)}
                    disabled={isProcessing}
                    type="button"
                  >
                    Tolak
                  </button>
                  <button
                    className="primary-button strong"
                    onClick={confirmRequest}
                    disabled={isProcessing}
                    type="button"
                  >
                    {isApproving ? "Mengonfirmasi..." : "Konfirmasi"}
                  </button>
                </>
              )}
            {(appointment.status === "Diterima" ||
              appointment.status === "Dalam Penanganan") && (
              <button
                className="primary-button strong"
                onClick={() =>
                  navigate(`/appointments/${appointment.id}/medical-record`)
                }
                disabled={isProcessing}
                type="button"
              >
                Isi Rekam Medis
              </button>
            )}
          </div>
        </section>

        <aside className="detail-panel">
          <div className="section-title compact">
            <div>
              <p>Pemilik</p>
              <h2>Informasi Kontak</h2>
            </div>
          </div>

          <div className="owner-card">
            <img
              src={
                appointment.owner.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  appointment.owner.name,
                )}&background=random`
              }
              alt={appointment.owner.name}
              className="mini-avatar"
            />
            <div>
              <strong>{appointment.owner.name}</strong>
              <small>ID Pemilik: #{appointment.owner.id}</small>
            </div>
          </div>

          <div className="action-stack mt-4">
            <button
              className="text-button w-full justify-start"
              onClick={() => navigate(`/appointments/${appointment.id}/pet`)}
            >
              <span className="material-symbols-outlined">pets</span>
              Lihat Detail Hewan
            </button>
          </div>
        </aside>
      </div>

      <RejectionDialog
        isOpen={isRejectionDialogOpen}
        onClose={() => setIsRejectionDialogOpen(false)}
        onConfirm={handleReject}
        isSubmitting={isRejecting}
      />
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
