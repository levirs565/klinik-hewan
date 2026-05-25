import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation } from '../components';
import { apiClient } from '../services/api';
import type { Pet, Appointment } from '../types';

export const AppointmentsPage = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [petsRes, apptRes] = await Promise.all([
          apiClient.getPets(),
          apiClient.getAppointments(),
        ]);
        if (!mounted) return;
        setPets(petsRes);
        setAppointments(apptRes);
      } catch (error) {
        console.error('Failed to load appointments data', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const getPetInfo = (petId: number) => pets.find((p) => p.id === petId);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; bgColor: string; textColor: string }> = {
      diterima: { label: 'DITERIMA', bgColor: 'bg-green-100', textColor: 'text-green-700' },
      menunggu_konfirmasi: { label: 'MENUNGGU KONFIRMASI', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
      ditolak: { label: 'DITOLAK', bgColor: 'bg-red-100', textColor: 'text-red-700' },
      check_in: { label: 'CHECK-IN', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
      alokasi_dokter: { label: 'ALOKASI DOKTER', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
      menunggu_dokter: { label: 'MENUNGGU DOKTER', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
      dalam_penanganan: { label: 'DALAM PENANGANAN', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
      selesai: { label: 'SELESAI', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
      selesai_administrasi: { label: 'SELESAI ADMINISTRASI', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
    };

    const config = statusConfig[status] || {
      label: status.replace(/_/g, ' ').toUpperCase(),
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
    };

    return (
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.textColor}`}>
        {config.label}
      </span>
    );
  };

  const now = new Date();
  const filteredAppointments = appointments.filter((appt) => {
    const apptDate = new Date(appt.scheduled_date);
    return activeTab === 'upcoming' ? apptDate >= now : apptDate < now;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <span className="material-symbols-outlined text-4xl text-primary">hourglass_empty</span>
          </div>
          <p className="text-body-md text-on-surface">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Header */}
      <header className="bg-surface-container-lowest border-b border-surface-variant sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-headline-md text-on-surface font-600">Bookings</h1>
          <button
            className="p-2 hover:bg-surface-variant rounded-full transition-colors"
            title="Notifications">
            <span className="material-symbols-outlined text-on-surface">notifications</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-8 border-b border-surface-variant mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-3 font-medium text-sm transition-colors relative ${
              activeTab === 'upcoming'
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}>
            Upcoming
            {activeTab === 'upcoming' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`pb-3 font-medium text-sm transition-colors relative ${
              activeTab === 'past'
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}>
            Past
            {activeTab === 'past' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></div>
            )}
          </button>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-surface-variant mb-4 inline-block">
                calendar_month
              </span>
              <p className="text-body-md text-on-surface-variant">
                {activeTab === 'upcoming'
                  ? 'No upcoming appointments'
                  : 'No past appointments'}
              </p>
            </div>
          ) : (
            filteredAppointments.map((appointment) => {
              const pet = getPetInfo(appointment.pet_id);
              const apptDate = new Date(appointment.scheduled_date);
              const dateStr = apptDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const timeStr = apptDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });

              return (
                <div
                  key={appointment.id}
                  className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    {/* Pet Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-xl bg-surface-variant flex items-center justify-center overflow-hidden">
                        {pet?.avatar_url ? (
                          <img
                            src={pet.avatar_url}
                            alt={pet.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">
                            {pet?.species === 'dog' ? '🐕' : pet?.species === 'cat' ? '🐈' : '🐾'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pet Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-body-lg font-semibold text-on-surface">
                            {pet?.name || 'Unknown Pet'}
                          </h3>
                          <p className="text-body-sm text-on-surface-variant">
                            {pet?.breed || pet?.species}
                          </p>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>

                      <div className="flex items-center gap-4 text-body-sm text-on-surface-variant mb-3">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">
                            {appointment.service_type === 'vaksin'
                              ? 'vaccines'
                              : appointment.service_type === 'checkup'
                                ? 'medical_services'
                                : 'healing'}
                          </span>
                          <span className="capitalize">
                            {appointment.service_type === 'pengobatan' ? 'Treatment' : appointment.service_type}
                          </span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">calendar_today</span>
                          <span>{dateStr}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">schedule</span>
                          <span>{timeStr}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/appointments/${appointment.id}`)}
                        className="w-full py-2 border border-primary text-primary rounded-lg text-body-sm font-medium hover:bg-primary/5 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate('/appointments/new')}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center active:scale-95">
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
