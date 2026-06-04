import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation } from '../components';
import { apiClient } from '../services/api';
import type { Pet } from '../types';

export const BookingFormPage = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [serviceType, setServiceType] = useState<'vaksin' | 'checkup' | 'pengobatan'>('checkup');
  const [preferredDate, setPreferredDate] = useState('');
  const [notesForVet, setNotesForVet] = useState('');
  const [checkupPurpose, setCheckupPurpose] = useState('');
  const [focusArea, setFocusArea] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const serviceConfig = {
    vaksin: {
      label: 'Vaksin',
      description: 'Annual shots and boosters',
      icon: 'vaccines',
      fields: [],
    },
    checkup: {
      label: 'Checkup',
      description: 'General health assessment',
      icon: 'medical_services',
      fields: [
        { name: 'purpose', label: 'Purpose of Checkup', type: 'select', placeholder: 'e.g., Routine, Skin, Dental' },
        { name: 'focus', label: 'Focus Area', type: 'text', placeholder: 'e.g., Check right ear' },
      ],
    },
    pengobatan: {
      label: 'Pengobatan',
      description: 'Treatment for illness or injury',
      icon: 'healing',
      fields: [
        { name: 'symptoms', label: 'Symptoms/Concerns', type: 'text', placeholder: 'Describe the health issue' },
      ],
    },
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const petsData = await apiClient.getPets();
        if (mounted) {
          setPets(petsData);
          if (petsData.length > 0) {
            setSelectedPetId(petsData[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to load pets:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedPetId) newErrors.pet = 'Please select a pet';
    if (!preferredDate) newErrors.date = 'Please select a date';

    if (serviceType === 'checkup') {
      if (!checkupPurpose) newErrors.purpose = 'Please select purpose of checkup';
      if (!focusArea) newErrors.focus = 'Please enter focus area';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
      setErrors({});
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPetId || !preferredDate) {
      setErrors({ general: 'Missing required fields' });
      return;
    }

    try {
      const appointmentData = {
        pet_id: selectedPetId,
        service_type: serviceType,
        scheduled_date: new Date(preferredDate).toISOString(),
        notes: notesForVet,
      };
      
      // Simulated API call - adjust based on actual API
      console.log('Creating appointment:', appointmentData);
      
      // Redirect back to appointments list
      navigate('/appointments');
    } catch (error) {
      console.error('Failed to create appointment:', error);
      setErrors({ general: 'Failed to create appointment' });
    }
  };

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
          <button
            onClick={() => navigate('/appointments')}
            className="p-2 hover:bg-surface-variant rounded-full transition-colors">
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </button>
          <h1 className="text-headline-md text-on-surface font-600 flex-1 text-center">Book Appointment</h1>
          <button className="p-2 hover:bg-surface-variant rounded-full transition-colors">
            <span className="material-symbols-outlined text-on-surface">info</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            {/* Step 1 */}
            <div className="flex items-center gap-3 flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  step >= 1
                    ? 'bg-primary text-white'
                    : 'bg-surface-variant text-on-surface-variant'
                }`}>
                1
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">Step</p>
                <p className="text-body-sm font-semibold text-on-surface">Service</p>
              </div>
            </div>

            {/* Connector Line */}
            <div className="flex-1 mx-4 h-1 bg-surface-variant rounded-full"></div>

            {/* Step 2 */}
            <div className="flex items-center gap-3 flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  step >= 2
                    ? 'bg-primary text-white'
                    : 'bg-surface-variant text-on-surface-variant'
                }`}>
                2
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">Step</p>
                <p className="text-body-sm font-semibold text-on-surface">Confirm</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        {step === 1 ? (
          <form className="space-y-6">
            {/* Select Pet Section */}
            <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6">
              <h2 className="text-title-lg font-semibold text-on-surface mb-4">Select Pet *</h2>
              <div className="grid grid-cols-2 gap-4">
                {pets.map((pet) => (
                  <button
                    key={pet.id}
                    type="button"
                    onClick={() => {
                      setSelectedPetId(pet.id);
                      setErrors({ ...errors, pet: '' });
                    }}
                    className={`rounded-2xl border-2 p-4 text-left transition ${
                      selectedPetId === pet.id
                        ? 'border-primary bg-primary/5'
                        : 'border-surface-variant bg-surface hover:border-primary/50'
                    }`}>
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="w-16 h-16 rounded-xl bg-surface-variant flex items-center justify-center overflow-hidden">
                        {pet.avatar_url ? (
                          <img
                            src={pet.avatar_url}
                            alt={pet.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl">
                            {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface">{pet.name}</p>
                        <p className="text-xs text-on-surface-variant">{pet.breed || pet.species}</p>
                      </div>
                    </div>
                    {selectedPetId === pet.id && (
                      <div className="absolute top-2 right-2">
                        <span className="material-symbols-outlined text-primary">check_circle</span>
                      </div>
                    )}
                  </button>
                ))}

                {/* Add Pet Button */}
                <button
                  type="button"
                  onClick={() => navigate('/add-pet')}
                  className="rounded-2xl border-2 border-dashed border-surface-variant bg-surface hover:border-primary/50 p-4 text-center transition flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-surface-variant flex items-center justify-center text-2xl font-bold text-primary">
                    +
                  </div>
                  <p className="font-semibold text-on-surface text-sm">Add Pet</p>
                </button>
              </div>
              {errors.pet && <p className="text-error text-body-sm mt-2">{errors.pet}</p>}
            </div>

            {/* Service Type Section */}
            <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6">
              <h2 className="text-title-lg font-semibold text-on-surface mb-4">Service Type *</h2>
              <div className="space-y-3">
                {(['vaksin', 'checkup', 'pengobatan'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setServiceType(type);
                      setErrors({ ...errors, service: '' });
                    }}
                    className={`w-full rounded-2xl border-2 p-4 text-left transition flex items-center justify-between ${
                      serviceType === type
                        ? 'border-primary bg-primary/5'
                        : 'border-surface-variant bg-surface hover:border-primary/50'
                    }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        serviceType === type ? 'bg-primary/10 text-primary' : 'bg-surface-variant text-on-surface-variant'
                      }`}>
                        <span className="material-symbols-outlined">{serviceConfig[type].icon}</span>
                      </div>
                      <div>
                        <p className={`font-semibold ${
                          serviceType === type ? 'text-on-surface' : 'text-on-surface'
                        }`}>
                          {serviceConfig[type].label}
                        </p>
                        <p className="text-xs text-on-surface-variant">{serviceConfig[type].description}</p>
                      </div>
                    </div>
                    {serviceType === type && (
                      <span className="material-symbols-outlined text-primary fill-1">radio_button_checked</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional Fields Based on Service Type */}
            {serviceType === 'checkup' && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className="material-symbols-outlined text-blue-600 mt-1">info</span>
                  <div>
                    <p className="font-semibold text-blue-900 text-sm">Checkup Details</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Purpose Dropdown */}
                  <div>
                    <label className="block text-label-sm font-semibold text-on-surface mb-2">
                      Purpose of Checkup *
                    </label>
                    <select
                      value={checkupPurpose}
                      onChange={(e) => {
                        setCheckupPurpose(e.target.value);
                        setErrors({ ...errors, purpose: '' });
                      }}
                      className={`w-full rounded-xl border-2 px-4 py-3 bg-white text-on-surface transition ${
                        errors.purpose
                          ? 'border-error'
                          : checkupPurpose
                            ? 'border-primary'
                            : 'border-surface-variant'
                      }`}>
                      <option value="">Select purpose...</option>
                      <option value="routine">Routine</option>
                      <option value="skin">Skin</option>
                      <option value="dental">Dental</option>
                      <option value="behavioral">Behavioral</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.purpose && <p className="text-error text-body-sm mt-2">{errors.purpose}</p>}
                  </div>

                  {/* Focus Area Input */}
                  <div>
                    <label className="block text-label-sm font-semibold text-on-surface mb-2">
                      Focus Area *
                    </label>
                    <input
                      type="text"
                      value={focusArea}
                      onChange={(e) => {
                        setFocusArea(e.target.value);
                        setErrors({ ...errors, focus: '' });
                      }}
                      placeholder="e.g., Check right ear"
                      className={`w-full rounded-xl border-2 px-4 py-3 bg-white text-on-surface placeholder-on-surface-variant transition ${
                        errors.focus
                          ? 'border-error'
                          : focusArea
                            ? 'border-primary'
                            : 'border-surface-variant'
                      }`}
                    />
                    {errors.focus && <p className="text-error text-body-sm mt-2">{errors.focus}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Section */}
            <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6">
              <h2 className="text-title-lg font-semibold text-on-surface mb-4">Schedule</h2>

              {/* Preferred Date */}
              <div className="mb-4">
                <label className="block text-label-sm font-semibold text-on-surface mb-2">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => {
                    setPreferredDate(e.target.value);
                    setErrors({ ...errors, date: '' });
                  }}
                  className={`w-full rounded-xl border-2 px-4 py-3 bg-white text-on-surface transition ${
                    errors.date
                      ? 'border-error'
                      : preferredDate
                        ? 'border-primary'
                        : 'border-surface-variant'
                  }`}
                />
                {errors.date && <p className="text-error text-body-sm mt-2">{errors.date}</p>}
              </div>

              {/* Notes for Vet */}
              <div>
                <label className="block text-label-sm font-semibold text-on-surface mb-2">
                  Notes for the Vet
                </label>
                <textarea
                  value={notesForVet}
                  onChange={(e) => setNotesForVet(e.target.value)}
                  placeholder="Add any specific concerns or behaviors noticed recently..."
                  rows={4}
                  className="w-full rounded-xl border-2 border-surface-variant px-4 py-3 bg-white text-on-surface placeholder-on-surface-variant transition focus:border-primary"
                />
              </div>
            </div>

            {/* Error Message */}
            {errors.general && (
              <div className="bg-error-container border border-error rounded-2xl p-4 text-error-container">
                <p className="text-body-sm">{errors.general}</p>
              </div>
            )}

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNextStep}
              className="w-full bg-primary text-white font-semibold py-4 rounded-2xl hover:shadow-lg transition-all active:scale-95">
              Next
            </button>
          </form>
        ) : (
          // Step 2: Confirm
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Booking Review */}
            <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6">
              <h2 className="text-title-lg font-semibold text-on-surface mb-6">Review Your Booking</h2>

              {/* Pet Review */}
              <div className="mb-6 pb-6 border-b border-surface-variant">
                <p className="text-label-sm text-on-surface-variant mb-3">Selected Pet</p>
                {selectedPet && (
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-surface-variant flex items-center justify-center">
                      {selectedPet.avatar_url ? (
                        <img
                          src={selectedPet.avatar_url}
                          alt={selectedPet.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <span className="text-3xl">
                          {selectedPet.species === 'dog' ? '🐕' : selectedPet.species === 'cat' ? '🐈' : '🐾'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface text-lg">{selectedPet.name}</p>
                      <p className="text-body-sm text-on-surface-variant">{selectedPet.breed || selectedPet.species}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Service Review */}
              <div className="mb-6 pb-6 border-b border-surface-variant">
                <p className="text-label-sm text-on-surface-variant mb-3">Service Type</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-lg">
                      {serviceConfig[serviceType].icon}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">{serviceConfig[serviceType].label}</p>
                    <p className="text-body-sm text-on-surface-variant">{serviceConfig[serviceType].description}</p>
                  </div>
                </div>
              </div>

              {/* Date Review */}
              <div className="mb-6 pb-6 border-b border-surface-variant">
                <p className="text-label-sm text-on-surface-variant mb-3">Preferred Date</p>
                <p className="font-semibold text-on-surface text-lg">
                  {new Date(preferredDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              {/* Notes Review */}
              {notesForVet && (
                <div>
                  <p className="text-label-sm text-on-surface-variant mb-3">Notes for the Vet</p>
                  <p className="text-body-sm text-on-surface whitespace-pre-wrap">{notesForVet}</p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errors.general && (
              <div className="bg-error-container border border-error rounded-2xl p-4 text-error-container">
                <p className="text-body-sm">{errors.general}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 border-2 border-primary text-primary font-semibold py-4 rounded-2xl hover:bg-primary/5 transition-colors">
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-primary text-white font-semibold py-4 rounded-2xl hover:shadow-lg transition-all active:scale-95">
                Confirm Appointment
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
