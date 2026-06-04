import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import {
  useAppointmentDetail,
  useApproveAppointment,
  useRejectAppointment,
  useAssignDoctor,
  useDoctorApproveAppointment,
  useDoctorRejectAppointment,
} from "../hooks/useServiceRequests";
import { useAuth } from "../context/AuthContext";
import {
  formatDate,
  getStatusClass,
  statusIcon,
  statusLabel,
} from "../utils/serviceRequest";
import { RejectionDialog, SelectDoctorDialog } from "../components";

export function AppointmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { appointment, isLoading } = useAppointmentDetail(id);

  // Receptionist actions
  const { trigger: approveTrigger, isMutating: isApproving } =
    useApproveAppointment(id);
  const { trigger: rejectTrigger, isMutating: isRejecting } =
    useRejectAppointment(id);
  const { trigger: assignTrigger, isMutating: isAssigning } =
    useAssignDoctor(id);

  // Doctor actions
  const { trigger: doctorApproveTrigger, isMutating: isDoctorApproving } =
    useDoctorApproveAppointment(id);
  const { trigger: doctorRejectTrigger, isMutating: isDoctorRejecting } =
    useDoctorRejectAppointment(id);

  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [isDoctorDialogOpen, setIsDoctorDialogOpen] = useState(false);

  const confirmRequest = async () => {
    try {
      await approveTrigger();
    } catch (error) {
      console.error("Failed to confirm request:", error);
    }
  };

  const handleReject = async (reason: string) => {
    try {
      if (user?.role === "doctor") {
        await doctorRejectTrigger({ reason });
      } else {
        await rejectTrigger({ reason });
      }
      setIsRejectionDialogOpen(false);
    } catch (error) {
      console.error("Failed to reject request:", error);
    }
  };

  const handleAssignDoctor = async (doctorId: number) => {
    try {
      await assignTrigger({ doctor_id: doctorId });
      setIsDoctorDialogOpen(false);
    } catch (error) {
      console.error("Failed to assign doctor:", error);
    }
  };

  const handleDoctorApprove = async () => {
    try {
      await doctorApproveTrigger();
    } catch (error) {
      console.error("Failed to doctor approve:", error);
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

  const isProcessing =
    isApproving ||
    isRejecting ||
    isAssigning ||
    isDoctorApproving ||
    isDoctorRejecting;

  const isAssignedDoctor =
    appointment.doctor && appointment.doctor.id === user?.id;

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
                <span className="material-symbols-outlined">
                  {statusIcon[appointment.status]}
                </span>
                {statusLabel[appointment.status]}
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

          {appointment.medical_record && (
            <div className="medical-record-section">
              <div className="section-title detail-section-gap">
                <div>
                  <p>Rekam Medis</p>
                  <h2>Hasil Pemeriksaan Medis</h2>
                </div>
              </div>

              <div className="record-details-card">
                <div className="subsection">
                  <h3>Pemeriksaan Fisik</h3>
                  <div className="detail-card-grid">
                    <Info
                      label="Berat Badan"
                      value={`${appointment.medical_record.physical_examination.weight} kg`}
                      icon="weight"
                    />
                    <Info
                      label="Suhu Tubuh"
                      value={`${appointment.medical_record.physical_examination.temperature} °C`}
                      icon="thermostat"
                    />
                    <Info
                      label="Kondisi Fisik"
                      value={
                        appointment.medical_record.physical_examination
                          .physical_condition
                      }
                      icon="health_and_safety"
                    />
                    {appointment.medical_record.physical_examination
                      .heart_rate && (
                      <Info
                        label="Detak Jantung"
                        value={
                          appointment.medical_record.physical_examination
                            .heart_rate
                        }
                        icon="favorite"
                      />
                    )}
                    {appointment.medical_record.physical_examination
                      .respiratory_rate && (
                      <Info
                        label="Pernapasan"
                        value={
                          appointment.medical_record.physical_examination
                            .respiratory_rate
                        }
                        icon="air"
                      />
                    )}
                  </div>
                </div>

                {appointment.medical_record.vaccine && (
                  <div className="subsection mt-6">
                    <h3>Detail Vaksinasi</h3>
                    <div className="info-list-vertical">
                      <p>
                        <strong>Jenis Vaksin:</strong>{" "}
                        {appointment.medical_record.vaccine.vaccine_type}
                      </p>
                      <p>
                        <strong>Brand:</strong>{" "}
                        {appointment.medical_record.vaccine.brand}
                      </p>
                      <p>
                        <strong>Batch:</strong>{" "}
                        {appointment.medical_record.vaccine.batch_number}
                      </p>
                      <p>
                        <strong>Tanggal Administrasi:</strong>{" "}
                        {formatDate(
                          appointment.medical_record.vaccine
                            .administration_date,
                        )}
                      </p>
                      <p>
                        <strong>Kondisi Pra-Vaksin:</strong>{" "}
                        {
                          appointment.medical_record.vaccine
                            .pre_vaccine_condition
                        }
                      </p>
                      {appointment.medical_record.vaccine
                        .post_vaccine_reaction && (
                        <p>
                          <strong>Reaksi Pasca-Vaksin:</strong>{" "}
                          {
                            appointment.medical_record.vaccine
                              .post_vaccine_reaction
                          }
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {appointment.medical_record.checkup && (
                  <div className="subsection mt-6">
                    <h3>Hasil Checkup</h3>
                    <div className="info-list-vertical">
                      <p>
                        <strong>Palpasi:</strong>{" "}
                        {appointment.medical_record.checkup.palpation}
                      </p>
                      <p>
                        <strong>Kebersihan:</strong>{" "}
                        {appointment.medical_record.checkup.cleanliness_notes}
                      </p>
                      {appointment.medical_record.checkup
                        .nutrition_recommendations && (
                        <p>
                          <strong>Rekomendasi Nutrisi:</strong>{" "}
                          {
                            appointment.medical_record.checkup
                              .nutrition_recommendations
                          }
                        </p>
                      )}
                      {appointment.medical_record.checkup
                        .periodic_care_recommendations && (
                        <p>
                          <strong>Rekomendasi Perawatan Berkala:</strong>{" "}
                          {
                            appointment.medical_record.checkup
                              .periodic_care_recommendations
                          }
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {appointment.medical_record.treatment && (
                  <div className="subsection mt-6">
                    <h3>Penanganan Medis</h3>
                    <div className="info-list-vertical">
                      <p>
                        <strong>Gejala Klinis:</strong>{" "}
                        {appointment.medical_record.treatment.clinical_symptoms}
                      </p>
                      <p>
                        <strong>Diagnosis:</strong>{" "}
                        {appointment.medical_record.treatment.diagnosis}
                      </p>
                      <p>
                        <strong>Tindakan:</strong>{" "}
                        {appointment.medical_record.treatment.medical_actions}
                      </p>
                      {appointment.medical_record.treatment.home_care_notes && (
                        <p>
                          <strong>Catatan Perawatan Rumah:</strong>{" "}
                          {appointment.medical_record.treatment.home_care_notes}
                        </p>
                      )}
                      <p>
                        <strong>Estimasi Biaya:</strong> Rp{" "}
                        {appointment.medical_record.treatment.estimated_cost.toLocaleString(
                          "id-ID",
                        )}
                      </p>
                      {appointment.medical_record.treatment.prescriptions
                        .length > 0 && (
                        <div className="mt-4">
                          <strong>Resep Obat:</strong>
                          <ul className="pill-list mt-2">
                            {appointment.medical_record.treatment.prescriptions.map(
                              (p, i) => (
                                <li key={i}>
                                  {p.name} ({p.dosage} - {p.frequency})
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="button-row mt-8">
            {/* Receptionist: Initial Approval */}
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

            {/* Receptionist: Assign Doctor */}
            {appointment.status === "Diterima" &&
              user?.role === "receptionist" && (
                <button
                  className="primary-button strong"
                  onClick={() => setIsDoctorDialogOpen(true)}
                  disabled={isProcessing}
                  type="button"
                >
                  {isAssigning ? "Menugaskan..." : "Pilih Dokter"}
                </button>
              )}

            {/* Doctor: Approve/Reject assignment */}
            {appointment.status === "Menunggu Dokter" &&
              user?.role === "doctor" &&
              isAssignedDoctor && (
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
                    onClick={handleDoctorApprove}
                    disabled={isProcessing}
                    type="button"
                  >
                    {isDoctorApproving ? "Menerima..." : "Terima"}
                  </button>
                </>
              )}

            {/* Doctor: Medical Record Entry */}
            {appointment.status === "Dalam Penanganan" &&
              user?.role === "doctor" &&
              isAssignedDoctor && (
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
        isSubmitting={isRejecting || isDoctorRejecting}
      />

      <SelectDoctorDialog
        isOpen={isDoctorDialogOpen}
        onClose={() => setIsDoctorDialogOpen(false)}
        onConfirm={handleAssignDoctor}
        isSubmitting={isAssigning}
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
