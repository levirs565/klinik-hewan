import { useState } from "react";
import { Link, useParams, useNavigate, Navigate } from "react-router-dom";

import {
  useAppointmentDetail,
  useSaveMedicalRecord,
} from "../hooks/useServiceRequests";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/serviceRequest";

export function MedicalRecordPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { appointment, isLoading } = useAppointmentDetail(id);
  const { trigger: saveRecord, isMutating } = useSaveMedicalRecord(id);

  // Physical Examination State
  const [weight, setWeight] = useState("");
  const [temperature, setTemperature] = useState("");
  const [physicalCondition, setPhysicalCondition] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");

  // Vaccine Specific
  const [vaccineType, setVaccineType] = useState("");
  const [brand, setBrand] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [administrationDate, setAdministrationDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [preVaccineCondition, setPreVaccineCondition] = useState("");
  const [postVaccineReaction, setPostVaccineReaction] = useState("");

  // Checkup Specific
  const [palpation, setPalpation] = useState("");
  const [cleanlinessNotes, setCleanlinessNotes] = useState("");
  const [nutritionRecommendations, setNutritionRecommendations] = useState("");
  const [periodicCareRecommendations, setPeriodicCareRecommendations] =
    useState("");

  // Treatment Specific
  const [clinicalSymptoms, setClinicalSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [medicalActions, setMedicalActions] = useState("");
  const [prescriptions, setPrescriptions] = useState([
    { name: "", dosage: "", frequency: "" },
  ]);
  const [homeCareNotes, setHomeCareNotes] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");

  // Reminders
  const [reminders, setReminders] = useState<any[]>([]);

  const addPrescription = () =>
    setPrescriptions([
      ...prescriptions,
      { name: "", dosage: "", frequency: "" },
    ]);
  const removePrescription = (index: number) =>
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  const updatePrescription = (index: number, field: string, value: string) => {
    const next = [...prescriptions];
    (next[index] as any)[field] = value;
    setPrescriptions(next);
  };

  const addReminder = () =>
    setReminders([
      ...reminders,
      { service_type: "checkup", description: "", reminder_date: "" },
    ]);
  const removeReminder = (index: number) =>
    setReminders(reminders.filter((_, i) => i !== index));
  const updateReminder = (index: number, field: string, value: string) => {
    const next = [...reminders];
    next[index][field] = value;
    setReminders(next);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!appointment) return;

    const payload: any = {
      physical_examination: {
        weight: parseFloat(weight),
        temperature: parseFloat(temperature),
        physical_condition: physicalCondition,
        heart_rate: heartRate,
        respiratory_rate: respiratoryRate,
      },
      reminders: reminders.filter((r) => r.description && r.reminder_date),
    };

    if (appointment.service_type === "vaccine") {
      payload.vaccine = {
        vaccine_type: vaccineType,
        brand,
        batch_number: batchNumber,
        administration_date: administrationDate,
        pre_vaccine_condition: preVaccineCondition,
        post_vaccine_reaction: postVaccineReaction,
      };
    } else if (appointment.service_type === "checkup") {
      payload.checkup = {
        palpation,
        cleanliness_notes: cleanlinessNotes,
        nutrition_recommendations: nutritionRecommendations,
        periodic_care_recommendations: periodicCareRecommendations,
      };
    } else if (appointment.service_type === "treatment") {
      payload.treatment = {
        clinical_symptoms: clinicalSymptoms,
        diagnosis,
        medical_actions: medicalActions,
        prescriptions: prescriptions.filter((p) => p.name),
        home_care_notes: homeCareNotes,
        estimated_cost: parseFloat(estimatedCost),
      };
    }

    try {
      await saveRecord(payload);
      navigate(`/appointments/${id}`);
    } catch (error) {
      console.error("Failed to save medical record:", error);
      alert("Gagal menyimpan rekam medis. Periksa kembali data Anda.");
    }
  };

  if (isLoading) {
    return (
      <main className="app">
        <p className="empty">Memuat data...</p>
      </main>
    );
  }

  if (!appointment) return <Navigate to="/" replace />;

  if (
    user?.role !== "doctor" ||
    (appointment.doctor && appointment.doctor.id !== user.id)
  ) {
    return <Navigate to={`/appointments/${id}`} replace />;
  }

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
            <p>Rekam Medis</p>
            <h1>{appointment.pet.name}</h1>
          </div>
        </div>
      </header>

      <section className="column medical-record-page">
        <div className="record-header">
          <img
            src={
              appointment.pet.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(appointment.pet.name)}&background=random`
            }
            alt={appointment.pet.name}
          />
          <div>
            <h2>{appointment.pet.name}</h2>
            <div className="pet-meta">
              <span className="breed-tag">{appointment.pet.breed}</span>
              <span className="service-tag">{appointment.service_type}</span>
              <span className="date-info">
                {formatDate(appointment.appointment_date)}
              </span>
            </div>
          </div>
        </div>

        <form className="stack-form" onSubmit={handleSubmit}>
          <div className="section-title">
            <div>
              <p>Tahap 1</p>
              <h2>Pemeriksaan Fisik</h2>
            </div>
          </div>

          <div className="info-grid">
            <label>
              Berat Badan (kg)
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />
            </label>
            <label>
              Suhu Tubuh (°C)
              <input
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                required
              />
            </label>
            <label>
              Kondisi Fisik Umum
              <input
                value={physicalCondition}
                onChange={(e) => setPhysicalCondition(e.target.value)}
                required
                placeholder="Misal: Sehat, Lemas, dsb."
              />
            </label>
            <label>
              Detak Jantung
              <input
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                placeholder="Misal: 80 bpm"
              />
            </label>
            <label>
              Laju Pernapasan
              <input
                value={respiratoryRate}
                onChange={(e) => setRespiratoryRate(e.target.value)}
                placeholder="Misal: 20/min"
              />
            </label>
          </div>

          <div className="section-title detail-section-gap">
            <div>
              <p>Tahap 2</p>
              <h2>Detail Layanan {appointment.service_type}</h2>
            </div>
          </div>

          {appointment.service_type === "vaccine" && (
            <div className="service-fields">
              <label>
                Jenis Vaksin
                <input
                  value={vaccineType}
                  onChange={(e) => setVaccineType(e.target.value)}
                  required
                />
              </label>
              <label>
                Brand / Merk Vaksin
                <input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  required
                />
              </label>
              <label>
                Nomor Batch
                <input
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  required
                />
              </label>
              <label>
                Tanggal Administrasi
                <input
                  type="date"
                  value={administrationDate}
                  onChange={(e) => setAdministrationDate(e.target.value)}
                  required
                />
              </label>
              <label>
                Kondisi Pra-Vaksin
                <textarea
                  value={preVaccineCondition}
                  onChange={(e) => setPreVaccineCondition(e.target.value)}
                  required
                />
              </label>
              <label>
                Reaksi Pasca-Vaksin (Opsional)
                <textarea
                  value={postVaccineReaction}
                  onChange={(e) => setPostVaccineReaction(e.target.value)}
                />
              </label>
            </div>
          )}

          {appointment.service_type === "checkup" && (
            <div className="service-fields">
              <label>
                Hasil Palpasi
                <textarea
                  value={palpation}
                  onChange={(e) => setPalpation(e.target.value)}
                  required
                />
              </label>
              <label>
                Catatan Kebersihan (Grooming)
                <textarea
                  value={cleanlinessNotes}
                  onChange={(e) => setCleanlinessNotes(e.target.value)}
                  required
                />
              </label>
              <label>
                Rekomendasi Nutrisi
                <textarea
                  value={nutritionRecommendations}
                  onChange={(e) => setNutritionRecommendations(e.target.value)}
                />
              </label>
              <label>
                Rekomendasi Perawatan Berkala
                <textarea
                  value={periodicCareRecommendations}
                  onChange={(e) =>
                    setPeriodicCareRecommendations(e.target.value)
                  }
                />
              </label>
            </div>
          )}

          {appointment.service_type === "treatment" && (
            <div className="service-fields">
              <label>
                Gejala Klinis
                <textarea
                  value={clinicalSymptoms}
                  onChange={(e) => setClinicalSymptoms(e.target.value)}
                  required
                />
              </label>
              <label>
                Diagnosis
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required
                />
              </label>
              <label>
                Tindakan Medis
                <textarea
                  value={medicalActions}
                  onChange={(e) => setMedicalActions(e.target.value)}
                  required
                />
              </label>

              <div className="subsection">
                <div className="flex justify-between items-center mb-4">
                  <h3>Daftar Resep Obat</h3>
                  <button
                    type="button"
                    onClick={addPrescription}
                    className="text-button"
                  >
                    + Tambah Obat
                  </button>
                </div>
                {prescriptions.map((p, i) => (
                  <div key={i} className="prescription-row">
                    <input
                      placeholder="Nama Obat"
                      value={p.name}
                      onChange={(e) =>
                        updatePrescription(i, "name", e.target.value)
                      }
                      required
                    />
                    <input
                      placeholder="Dosis"
                      value={p.dosage}
                      onChange={(e) =>
                        updatePrescription(i, "dosage", e.target.value)
                      }
                      required
                    />
                    <input
                      placeholder="Frekuensi"
                      value={p.frequency}
                      onChange={(e) =>
                        updatePrescription(i, "frequency", e.target.value)
                      }
                      required
                    />
                    {prescriptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePrescription(i)}
                        className="icon-button danger"
                      >
                        <span className="material-symbols-outlined">
                          delete
                        </span>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <label>
                Catatan Perawatan di Rumah
                <textarea
                  value={homeCareNotes}
                  onChange={(e) => setHomeCareNotes(e.target.value)}
                />
              </label>
              <label>
                Estimasi Total Biaya (Rp)
                <input
                  type="number"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  required
                />
              </label>
            </div>
          )}

          <div className="section-title detail-section-gap">
            <div>
              <p>Tahap 3</p>
              <h2>Pengingat & Jadwal Lanjutan</h2>
            </div>
            <button type="button" onClick={addReminder} className="text-button">
              + Tambah Pengingat
            </button>
          </div>

          <div className="reminder-list">
            {reminders.map((r, i) => (
              <div key={i} className="reminder-card-form">
                <div className="flex justify-between items-center mb-2">
                  <strong>Pengingat #{i + 1}</strong>
                  <button
                    type="button"
                    onClick={() => removeReminder(i)}
                    className="icon-button danger"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="info-grid">
                  <label>
                    Jenis Layanan
                    <select
                      value={r.service_type}
                      onChange={(e) =>
                        updateReminder(i, "service_type", e.target.value)
                      }
                    >
                      <option value="checkup">Checkup</option>
                      <option value="vaccine">Vaksinasi</option>
                      <option value="treatment">Pengobatan</option>
                    </select>
                  </label>
                  <label>
                    Tanggal
                    <input
                      type="date"
                      value={r.reminder_date}
                      onChange={(e) =>
                        updateReminder(i, "reminder_date", e.target.value)
                      }
                      required
                    />
                  </label>
                  <label className="col-span-2">
                    Keterangan
                    <input
                      value={r.description}
                      onChange={(e) =>
                        updateReminder(i, "description", e.target.value)
                      }
                      placeholder="Misal: Kontrol jahitan, Booster Vaksin..."
                      required
                    />
                  </label>
                </div>
              </div>
            ))}
            {reminders.length === 0 && (
              <p className="empty text-sm">Tidak ada pengingat tambahan.</p>
            )}
          </div>

          <div className="button-row mt-12">
            <button
              className="primary-button strong w-full"
              type="submit"
              disabled={isMutating}
            >
              {isMutating
                ? "Menyimpan Rekam Medis..."
                : "Selesaikan & Simpan Rekam Medis"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
