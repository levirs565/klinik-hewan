import type { ReactNode } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Avatar, BottomNavigation } from "../components";
import { useAppointmentDetail } from "../hooks/useAppointments";
import type { Appointment } from "../types";

const serviceConfig: Record<
  Appointment["service_type"],
  { icon: string; label: string; description: string }
> = {
  vaccine: {
    icon: "vaccines",
    label: "Vaccination",
    description: "Preventive vaccine appointment for long-term pet protection.",
  },
  checkup: {
    icon: "stethoscope",
    label: "General Checkup",
    description: "Routine physical examination and basic health assessment.",
  },
  treatment: {
    icon: "healing",
    label: "Treatment",
    description:
      "Consultation for symptoms, medication, and recovery planning.",
  },
};

export const AppointmentDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { appointment, isLoading } = useAppointmentDetail(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <span className="material-symbols-outlined text-4xl text-primary">
              hourglass_empty
            </span>
          </div>
          <p className="text-body-md text-on-surface">
            Loading booking detail...
          </p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return <Navigate to="/appointments" replace />;
  }

  const pet = appointment.pet;
  const doctor = appointment.doctor;
  const service = serviceConfig[appointment.service_type];
  const medicalRecord = appointment.medical_record;

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors"
            onClick={() => navigate("/appointments")}
            type="button"
          >
            <span className="material-symbols-outlined text-xl">
              arrow_back
            </span>
            <span className="text-label-md font-semibold">
              Back to Bookings
            </span>
          </button>
          <span className="bg-surface-container text-on-surface text-label-sm px-3 py-1 rounded-full border border-outline-variant">
            {appointment.status}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6 grid gap-6">
        {/* Booking Summary */}
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-primary-fixed text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl">
                {service.icon}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-label-md text-secondary mb-1">
                Booking Detail
              </p>
              <h1 className="text-headline-lg text-primary">{service.label}</h1>
              <p className="text-body-md text-on-surface-variant">
                {service.description}
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoPanel title="Pet Detail">
            <Link
              to={`/pets/${pet.id}`}
              className="flex items-center gap-4 hover:bg-surface-container-low -m-2 p-2 rounded-xl transition-colors"
            >
              <Avatar
                src={pet.avatar_url}
                alt={pet.name}
                size="lg"
                initials={pet.name.substring(0, 2).toUpperCase()}
              />
              <div>
                <h2 className="text-headline-sm text-on-surface">{pet.name}</h2>
                <p className="text-body-sm text-on-surface-variant capitalize">
                  {pet.breed}
                </p>
              </div>
            </Link>
          </InfoPanel>

          <InfoPanel title="Schedule">
            <div className="grid gap-3">
              <IconLine
                icon="calendar_today"
                label="Date"
                value={formatDate(appointment.appointment_date)}
              />
            </div>
          </InfoPanel>
        </section>

        {/* Doctor Assigned */}
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-label-md text-secondary mb-1">Doctor Detail</p>
              <h2 className="text-headline-md text-on-surface">
                Veterinarian Assigned
              </h2>
            </div>
            <span className="material-symbols-outlined text-primary">
              stethoscope
            </span>
          </div>

          {doctor ? (
            <div className="flex items-center gap-5">
              <Avatar
                src={undefined}
                alt={doctor.name}
                size="xl"
                initials={doctor.name.substring(0, 2).toUpperCase()}
              />
              <div>
                <h3 className="text-headline-sm text-on-surface">
                  {doctor.name}
                </h3>
                <p className="text-body-md text-on-surface-variant">
                  Veterinarian
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4">
              <p className="text-body-md text-on-surface">
                Doctor detail is not assigned yet for this appointment.
              </p>
            </div>
          )}
        </section>

        {/* Medical Record Section */}
        {medicalRecord && (
          <section className="grid gap-6">
            <div className="flex items-center gap-3 px-2">
              <span className="material-symbols-outlined text-primary">
                description
              </span>
              <h2 className="text-headline-md text-on-surface">
                Medical Record
              </h2>
            </div>

            {/* Physical Examination */}
            <InfoPanel title="Physical Examination">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ProfileStat
                  label="Weight"
                  value={`${medicalRecord.physical_examination.weight} kg`}
                />
                <ProfileStat
                  label="Temp"
                  value={`${medicalRecord.physical_examination.temperature} °C`}
                />
                <ProfileStat
                  label="Heart Rate"
                  value={medicalRecord.physical_examination.heart_rate || "-"}
                />
                <ProfileStat
                  label="Resp. Rate"
                  value={
                    medicalRecord.physical_examination.respiratory_rate || "-"
                  }
                />
              </div>
              <div className="mt-4 pt-4 border-t border-outline-variant">
                <p className="text-label-sm text-secondary mb-1">
                  Physical Condition
                </p>
                <p className="text-body-md text-on-surface">
                  {medicalRecord.physical_examination.physical_condition}
                </p>
              </div>
            </InfoPanel>

            {/* Service Specific Details */}
            {medicalRecord.vaccine && (
              <InfoPanel title="Vaccination Details">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <IconLine
                    icon="vaccines"
                    label="Vaccine Type"
                    value={medicalRecord.vaccine.vaccine_type}
                  />
                  <IconLine
                    icon="inventory_2"
                    label="Brand"
                    value={medicalRecord.vaccine.brand}
                  />
                  <IconLine
                    icon="tag"
                    label="Batch Number"
                    value={medicalRecord.vaccine.batch_number}
                  />
                  <IconLine
                    icon="event_available"
                    label="Administered On"
                    value={formatDate(
                      medicalRecord.vaccine.administration_date,
                    )}
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-outline-variant grid gap-4">
                  <div>
                    <p className="text-label-sm text-secondary mb-1">
                      Pre-vaccine Condition
                    </p>
                    <p className="text-body-md text-on-surface">
                      {medicalRecord.vaccine.pre_vaccine_condition}
                    </p>
                  </div>
                  {medicalRecord.vaccine.post_vaccine_reaction && (
                    <div>
                      <p className="text-label-sm text-secondary mb-1">
                        Post-vaccine Reaction
                      </p>
                      <p className="text-body-md text-on-surface">
                        {medicalRecord.vaccine.post_vaccine_reaction}
                      </p>
                    </div>
                  )}
                </div>
              </InfoPanel>
            )}

            {medicalRecord.checkup && (
              <InfoPanel title="Checkup Findings">
                <div className="grid gap-4">
                  <div>
                    <p className="text-label-sm text-secondary mb-1">
                      Palpation
                    </p>
                    <p className="text-body-md text-on-surface">
                      {medicalRecord.checkup.palpation}
                    </p>
                  </div>
                  <div>
                    <p className="text-label-sm text-secondary mb-1">
                      Cleanliness Notes
                    </p>
                    <p className="text-body-md text-on-surface">
                      {medicalRecord.checkup.cleanliness_notes}
                    </p>
                  </div>
                  {medicalRecord.checkup.nutrition_recommendations && (
                    <div>
                      <p className="text-label-sm text-secondary mb-1">
                        Nutrition Recommendations
                      </p>
                      <p className="text-body-md text-on-surface">
                        {medicalRecord.checkup.nutrition_recommendations}
                      </p>
                    </div>
                  )}
                  {medicalRecord.checkup.periodic_care_recommendations && (
                    <div>
                      <p className="text-label-sm text-secondary mb-1">
                        Periodic Care Recommendations
                      </p>
                      <p className="text-body-md text-on-surface">
                        {medicalRecord.checkup.periodic_care_recommendations}
                      </p>
                    </div>
                  )}
                </div>
              </InfoPanel>
            )}

            {medicalRecord.treatment && (
              <InfoPanel title="Treatment & Diagnosis">
                <div className="grid gap-4">
                  <div>
                    <p className="text-label-sm text-secondary mb-1">
                      Clinical Symptoms
                    </p>
                    <p className="text-body-md text-on-surface">
                      {medicalRecord.treatment.clinical_symptoms}
                    </p>
                  </div>
                  <div className="bg-primary-container/30 p-4 rounded-xl">
                    <p className="text-label-sm text-primary mb-1 font-bold uppercase tracking-wider">
                      Diagnosis
                    </p>
                    <p className="text-headline-sm text-on-primary-container font-bold">
                      {medicalRecord.treatment.diagnosis}
                    </p>
                  </div>
                  <div>
                    <p className="text-label-sm text-secondary mb-1">
                      Medical Actions
                    </p>
                    <p className="text-body-md text-on-surface">
                      {medicalRecord.treatment.medical_actions}
                    </p>
                  </div>

                  <div>
                    <p className="text-label-sm text-secondary mb-3">
                      Prescriptions
                    </p>
                    <div className="grid gap-2">
                      {medicalRecord.treatment.prescriptions.map((p, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant"
                        >
                          <div>
                            <p className="text-body-md font-bold text-on-surface">
                              {p.name}
                            </p>
                            <p className="text-label-sm text-on-surface-variant">
                              {p.frequency}
                            </p>
                          </div>
                          <span className="text-body-sm font-medium bg-secondary-container text-on-secondary-container px-2 py-1 rounded">
                            {p.dosage}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {medicalRecord.treatment.home_care_notes && (
                    <div>
                      <p className="text-label-sm text-secondary mb-1">
                        Home Care Notes
                      </p>
                      <p className="text-body-md text-on-surface italic">
                        {medicalRecord.treatment.home_care_notes}
                      </p>
                    </div>
                  )}
                </div>
              </InfoPanel>
            )}
          </section>
        )}

        {/* User Notes */}
        {(appointment.owner_notes || appointment.previous_medical_history) && (
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
            <h2 className="text-headline-sm text-on-surface mb-4">
              Owner Notes
            </h2>
            <div className="grid gap-4">
              {appointment.owner_notes && (
                <div>
                  <p className="text-label-sm text-secondary mb-1">
                    Note for Clinic
                  </p>
                  <p className="text-body-md text-on-surface">
                    {appointment.owner_notes}
                  </p>
                </div>
              )}
              {appointment.previous_medical_history && (
                <div>
                  <p className="text-label-sm text-secondary mb-1">
                    Previous History (Reported)
                  </p>
                  <p className="text-body-md text-on-surface">
                    {appointment.previous_medical_history}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

function InfoPanel({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
      <h2 className="text-headline-sm text-on-surface mb-4">{title}</h2>
      {children}
    </section>
  );
}

function IconLine({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="material-symbols-outlined text-primary text-xl mt-0.5">
        {icon}
      </span>
      <div>
        <p className="text-label-sm text-secondary">{label}</p>
        <p className="text-body-md text-on-surface">{value}</p>
      </div>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-label-sm text-secondary mb-1">{label}</p>
      <p className="text-body-md text-on-surface font-medium">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
