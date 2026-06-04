import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Avatar, BottomNavigation } from '../components';
import { apiClient } from '../services/api';
import type { Appointment, Doctor, MedicalRecord, Pet } from '../types';

const serviceTitle: Record<Appointment['service_type'], string> = {
  vaksin: 'Vaccine Medical Record',
  checkup: 'Checkup Medical Record',
  pengobatan: 'Treatment Medical Record',
};

export const MedicalRecordPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const appointmentId = Number(id);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [appointmentRes, recordRes, petRes, doctorRes] = await Promise.all([
          apiClient.getAppointments(),
          apiClient.getMedicalRecords(),
          apiClient.getPets(),
          apiClient.getDoctors(),
        ]);
        if (!mounted) return;
        setAppointments(appointmentRes);
        setRecords(recordRes);
        setPets(petRes);
        setDoctors(doctorRes);
      } catch (error) {
        console.error('Failed to load medical record:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const appointment = useMemo(
    () => appointments.find((item) => item.id === appointmentId),
    [appointmentId, appointments],
  );
  const record = records.find((item) => item.appointment_id === appointmentId);
  const pet = pets.find((item) => item.id === appointment?.pet_id);
  const doctor = doctors.find((item) => item.id === appointment?.doctor_id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-body-md text-on-surface">Loading medical record...</p>
      </div>
    );
  }

  if (!appointment) {
    return <Navigate to="/appointments" replace />;
  }

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <button className="p-2 -ml-2 rounded-full hover:bg-surface-container-low" onClick={() => navigate(-1)} type="button" aria-label="Go Back">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <h1 className="text-headline-sm text-primary">{serviceTitle[appointment.service_type]}</h1>
          <span className="w-10" />
        </div>
      </header>

      <main className="px-6 py-6 space-y-6">
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
          <div className="flex items-center gap-4">
            <Avatar src={pet?.avatar_url} alt={pet?.name} size="lg" initials={pet?.name.substring(0, 2).toUpperCase()} />
            <div>
              <p className="text-label-sm text-secondary">{record?.record_number ?? 'Record Pending'}</p>
              <h2 className="text-headline-sm text-on-surface">{pet?.name ?? 'Unknown Pet'}</h2>
              <p className="text-body-sm text-on-surface-variant">
                {doctor?.name ?? 'Doctor not assigned'} - {formatDate(appointment.scheduled_date)}
              </p>
            </div>
          </div>
        </section>

        {record ? (
          <>
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 space-y-3">
              <h3 className="text-headline-sm text-primary">Ringkasan</h3>
              <InfoBlock label="Diagnosis" value={record.diagnosis ?? '-'} />
              <InfoBlock label="Catatan Dokter" value={record.summary} />
            </section>

            {appointment.service_type === 'checkup' && record.checkup ? (
              <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
                <h3 className="text-headline-sm text-primary mb-4">Data Checkup</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Metric label="BB" value={record.checkup.body_weight} />
                  <Metric label="Suhu" value={record.checkup.temperature} />
                  <Metric label="HR" value={record.checkup.heart_rate} />
                  <Metric label="RR" value={record.checkup.respiratory_rate} />
                  <Metric label="BCS" value={record.checkup.bcs} />
                  <Metric label="Hidrasi" value={record.checkup.hydration} />
                </div>
                <InfoBlock label="Pemeriksaan Fisik" value={record.checkup.physical_exam} className="mt-4" />
              </section>
            ) : null}

            {appointment.service_type === 'vaksin' && record.vaccine ? (
              <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 space-y-3">
                <h3 className="text-headline-sm text-primary">Detail Vaksin</h3>
                <InfoBlock label="Nama Vaksin" value={record.vaccine.vaccine_name} />
                <InfoBlock label="Nomor Batch" value={record.vaccine.batch_number} />
                <InfoBlock label="Jadwal Berikutnya" value={formatDate(record.vaccine.next_due_date)} />
                <InfoBlock label="Catatan" value={record.vaccine.notes} />
              </section>
            ) : null}

            {appointment.service_type === 'pengobatan' && record.treatment ? (
              <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 space-y-3">
                <h3 className="text-headline-sm text-primary">Detail Pengobatan</h3>
                <InfoBlock label="Gejala" value={record.treatment.symptoms} />
                <InfoBlock label="Tindakan" value={record.treatment.procedures} />
                <div>
                  <p className="text-label-sm text-secondary mb-2">Obat</p>
                  <div className="space-y-2">
                    {record.treatment.medications.map((medication) => (
                      <div className="flex items-center gap-2 bg-surface-container-low rounded-lg px-3 py-2" key={medication}>
                        <span className="material-symbols-outlined text-primary text-lg">medication</span>
                        <span className="text-body-sm text-on-surface">{medication}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <InfoBlock label="Estimasi Biaya" value={record.treatment.estimated_cost} />
              </section>
            ) : null}

            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
              <h3 className="text-headline-sm text-primary mb-4">Reminder</h3>
              {record.reminders.length === 0 ? (
                <p className="text-body-md text-on-surface-variant">Tidak ada reminder aktif.</p>
              ) : (
                <div className="space-y-3">
                  {record.reminders.map((reminder) => (
                    <div className="border border-outline-variant rounded-lg p-3" key={reminder.id}>
                      <p className="text-body-md text-on-surface font-semibold">{reminder.title}</p>
                      <p className="text-body-sm text-on-surface-variant">{reminder.description}</p>
                      <p className="text-label-sm text-secondary mt-2">{formatDate(reminder.scheduled_date)}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
            <p className="text-body-md text-on-surface">Medical record is not available yet.</p>
            <p className="text-body-sm text-on-surface-variant mt-1">Records will appear after the clinic completes this service.</p>
          </section>
        )}

        <Link to={`/appointments/${appointment.id}`} className="block text-center bg-primary text-on-primary rounded-full py-3 font-semibold">
          Back to Appointment
        </Link>
      </main>

      <BottomNavigation />
    </div>
  );
};

function InfoBlock({ className = '', label, value }: { className?: string; label: string; value: string }) {
  return (
    <div className={className}>
      <p className="text-label-sm text-secondary mb-1">{label}</p>
      <p className="text-body-md text-on-surface">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-container-low rounded-lg p-3">
      <p className="text-label-sm text-secondary mb-1">{label}</p>
      <p className="text-body-md text-on-surface font-semibold">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}
