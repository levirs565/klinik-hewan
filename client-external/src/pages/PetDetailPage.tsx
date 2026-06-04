import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Avatar, BottomNavigation } from '../components';
import { apiClient } from '../services/api';
import type { Appointment, Doctor, Pet, Reminder } from '../types';

const serviceLabels: Record<Appointment['service_type'], string> = {
  vaksin: 'Vaccination',
  checkup: 'General Checkup',
  pengobatan: 'Treatment',
};

const serviceIcons: Record<Appointment['service_type'], string> = {
  vaksin: 'vaccines',
  checkup: 'stethoscope',
  pengobatan: 'medical_services',
};

export const PetDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const petId = Number(id);
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [petsRes, appointmentsRes, remindersRes, doctorsRes] = await Promise.all([
          apiClient.getPets(),
          apiClient.getAppointments(),
          apiClient.getReminders(),
          apiClient.getDoctors(),
        ]);
        if (!mounted) return;
        setPets(petsRes);
        setAppointments(appointmentsRes);
        setReminders(remindersRes);
        setDoctors(doctorsRes);
      } catch (error) {
        console.error('Failed to load pet detail:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const pet = useMemo(() => pets.find((item) => item.id === petId), [petId, pets]);
  const petAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => appointment.pet_id === petId)
        .sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime()),
    [appointments, petId],
  );
  const activeReminder = reminders
    .filter((reminder) => reminder.pet_id === petId && reminder.status === 'pending')
    .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())[0];
  const latestDoctor = doctors.find((doctor) => doctor.id === petAppointments[0]?.doctor_id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <span className="material-symbols-outlined text-4xl text-primary">hourglass_empty</span>
          </div>
          <p className="text-body-md text-on-surface">Loading pet profile...</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return <Navigate to="/pets" replace />;
  }

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors"
            onClick={() => navigate('/pets')}
            type="button">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            <span className="text-label-md font-semibold">Back to My Pets</span>
          </button>
          <h1 className="text-headline-sm text-primary font-bold">Pet Profile</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <article className="lg:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden grid sm:grid-cols-[minmax(220px,36%)_1fr]">
            <div className="min-h-64 bg-surface-variant flex items-center justify-center relative overflow-hidden">
              {pet.avatar_url ? (
                <img src={pet.avatar_url} alt={pet.name} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-8xl text-primary">pets</span>
              )}
              <div className="absolute top-4 left-4 bg-surface-container-lowest/95 px-3 py-1 rounded-full border border-outline-variant flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span className="text-label-sm text-on-surface font-medium">Active Patient</span>
              </div>
            </div>

            <div className="p-6 flex flex-col">
              <div className="flex justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-display-lg text-primary">{pet.name}</h2>
                  <p className="text-body-lg text-on-surface-variant capitalize">
                    {pet.species} - {pet.breed}
                  </p>
                </div>
                <button className="h-10 w-10 rounded-full hover:bg-surface-variant transition-colors" type="button" aria-label="Edit pet">
                  <span className="material-symbols-outlined text-secondary">edit</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-auto">
                <ProfileStat label="Age" value={formatAge(pet.date_of_birth)} />
                <ProfileStat label="Gender" value={capitalize(pet.gender)} />
                <ProfileStat label="Color" value={pet.color || '-'} />
                <ProfileStat label="Weight" value={pet.weight || '-'} />
              </div>
            </div>
          </article>

          <aside className="lg:col-span-4 flex flex-col gap-4">
            <h3 className="text-headline-sm text-on-surface">Action Required</h3>
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 relative overflow-hidden flex-1">
              <div className="absolute top-0 left-0 right-0 h-1 bg-secondary-container"></div>
              <div className="flex justify-between gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-secondary-container text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined">notifications_active</span>
                </div>
                <span className="bg-surface-container text-on-surface text-label-sm px-2 py-1 rounded-lg border border-outline-variant h-max">
                  {activeReminder ? 'Upcoming' : 'Clear'}
                </span>
              </div>
              <h4 className="text-headline-md text-on-surface mb-2">{activeReminder?.title ?? 'No Active Reminder'}</h4>
              <p className="text-body-sm text-on-surface-variant mb-6">
                {activeReminder?.description ?? `${pet.name} does not have pending reminders right now.`}
              </p>
              <div className="pt-4 border-t border-outline-variant flex items-center justify-between gap-3">
                <span className="text-label-md text-secondary">
                  {activeReminder ? `Due: ${formatDate(activeReminder.scheduled_date)}` : 'All caught up'}
                </span>
                <Link to="/appointments/new" className="bg-primary text-on-primary text-label-md px-4 py-2 rounded-full hover:bg-primary-container transition-colors">
                  Book
                </Link>
              </div>
            </div>
          </aside>

          {latestDoctor ? (
            <section className="lg:col-span-12 bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-headline-sm text-on-surface">Assigned Doctor</h3>
                <span className="text-label-sm text-secondary capitalize">{latestDoctor.status}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Avatar src={latestDoctor.image_url} alt={latestDoctor.name} size="lg" initials={latestDoctor.name.substring(0, 2).toUpperCase()} />
                <Link className="flex-1" to={`/doctors/${latestDoctor.id}`}>
                  <h4 className="text-headline-sm text-on-surface">{latestDoctor.name}</h4>
                  <p className="text-body-sm text-on-surface-variant">{latestDoctor.specialization}</p>
                </Link>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-body-sm">
                  <DoctorInfo icon="schedule" value={latestDoctor.schedule} />
                  <DoctorInfo icon="call" value={latestDoctor.phone} />
                </div>
              </div>
            </section>
          ) : null}

          <section className="lg:col-span-12">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="text-headline-sm text-on-surface">Clinical History</h3>
              <Link to="/appointments" className="text-primary text-label-md font-semibold hover:underline flex items-center gap-1">
                View Full Record
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
            </div>

            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
              {petAppointments.length === 0 ? (
                <p className="p-5 text-body-md text-on-surface-variant">No clinical history yet.</p>
              ) : (
                petAppointments.map((appointment, index) => (
                  <Link
                    className={`grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 p-4 hover:bg-surface-container-low transition-colors ${
                      index < petAppointments.length - 1 ? 'border-b border-outline-variant' : ''
                    }`}
                    key={appointment.id}
                    to={`/appointments/${appointment.id}`}>
                    <div className="sm:col-span-3">
                      <p className="text-body-md text-on-surface">{formatDate(appointment.scheduled_date)}</p>
                      <p className="text-body-sm text-secondary sm:hidden">{serviceLabels[appointment.service_type]}</p>
                    </div>
                    <div className="sm:col-span-3 hidden sm:flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-lg">{serviceIcons[appointment.service_type]}</span>
                      <span className="text-body-md">{serviceLabels[appointment.service_type]}</span>
                    </div>
                    <p className="sm:col-span-4 text-body-md text-on-surface-variant">
                      {historyDescription(appointment.service_type, pet.name)}
                    </p>
                    <div className="sm:col-span-2 sm:text-right">
                      <span className="bg-surface-container text-on-surface text-label-sm px-3 py-1 rounded-full border border-outline-variant">
                        {appointment.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
};

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-label-sm text-secondary mb-1">{label}</p>
      <p className="text-body-md text-on-surface font-medium">{value}</p>
    </div>
  );
}

function DoctorInfo({ icon, value }: { icon: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-on-surface-variant">
      <span className="material-symbols-outlined text-lg">{icon}</span>
      <span>{value}</span>
    </div>
  );
}

function formatAge(dateOfBirth: string) {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const years = today.getFullYear() - birthDate.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  const age = hasBirthdayPassed ? years : years - 1;
  return `${Math.max(age, 0)} Years`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function capitalize(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : '-';
}

function historyDescription(serviceType: Appointment['service_type'], petName: string) {
  if (serviceType === 'vaksin') return `Vaccination visit recorded for ${petName}.`;
  if (serviceType === 'pengobatan') return `Treatment consultation and medication follow-up for ${petName}.`;
  return `Wellness exam and routine physical check for ${petName}.`;
}
