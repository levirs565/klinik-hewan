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
  const appointmentDate = new Date(appointment.appointment_date);

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
              <IconLine
                icon="schedule"
                label="Time"
                value={formatTime(appointmentDate)}
              />
            </div>
          </InfoPanel>
        </section>

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

        <section className="grid gap-3">
          {appointment.medical_record && (
            <Link
              to={`/appointments/${appointment.id}/medical-record`}
              className="flex items-center justify-center gap-2 bg-primary text-on-primary rounded-full py-3 font-semibold"
            >
              <span className="material-symbols-outlined">description</span>
              View Medical Record
            </Link>
          )}
          {doctor ? (
            <Link
              to={`/doctors/${doctor.id}`}
              className="flex items-center justify-center gap-2 border border-primary text-primary rounded-full py-3 font-semibold"
            >
              <span className="material-symbols-outlined">stethoscope</span>
              View Doctor Profile
            </Link>
          ) : null}
        </section>
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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value: Date) {
  return value.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
