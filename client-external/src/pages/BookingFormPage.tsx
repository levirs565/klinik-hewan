import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BottomNavigation } from "../components";
import { usePets } from "../hooks/usePets";
import { useCreateAppointment } from "../hooks/useAppointments";
import type { CreateAppointmentRequest } from "../types";

export const BookingFormPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { pets, isLoading } = usePets();
  const { trigger: createAppointmentTrigger, isCreating } =
    useCreateAppointment();

  const queryPetId = searchParams.get("pet_id");
  const queryServiceType = searchParams.get("service_type");
  const queryReminderId = searchParams.get("reminder_id");

  const [selectedPetId, setSelectedPetId] = useState<number | null>(
    queryPetId ? parseInt(queryPetId) : null,
  );

  // Use the first pet as default if none selected
  const effectivePetId = selectedPetId || (pets.length > 0 ? pets[0].id : null);

  const [serviceType, setServiceType] = useState<
    "vaccine" | "checkup" | "treatment"
  >((queryServiceType as "vaccine" | "checkup" | "treatment") || "checkup");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (queryPetId) setSelectedPetId(parseInt(queryPetId));
    if (queryServiceType)
      setServiceType(queryServiceType as "vaccine" | "checkup" | "treatment");
  }, [queryPetId, queryServiceType]);
  const [preferredDate, setPreferredDate] = useState("");
  const [notesForVet, setNotesForVet] = useState("");
  const [previousMedicalHistory, setPreviousMedicalHistory] = useState("");
  const [checkupPurpose, setCheckupPurpose] = useState("");
  const [focusArea, setFocusArea] = useState("");
  const [vaccineType, setVaccineType] = useState("");
  const [observedSymptoms, setObservedSymptoms] = useState("");
  const [symptomDuration, setSymptomDuration] = useState("");
  const [homeCareReceived, setHomeCareReceived] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const serviceConfig = {
    vaccine: {
      label: "Vaccine",
      description: "Annual shots and boosters",
      icon: "vaccines",
    },
    checkup: {
      label: "Checkup",
      description: "General health assessment",
      icon: "medical_services",
    },
    treatment: {
      label: "Treatment",
      description: "Treatment for illness or injury",
      icon: "healing",
    },
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!effectivePetId) newErrors.pet = "Please select a pet";
    if (!preferredDate) newErrors.date = "Please select a date";

    if (serviceType === "checkup") {
      if (!checkupPurpose)
        newErrors.purpose = "Please select purpose of checkup";
      if (!focusArea) newErrors.focus = "Please enter focus area";
    }

    if (serviceType === "vaccine") {
      if (!vaccineType) newErrors.vaccine_type = "Please enter vaccine type";
    }

    if (serviceType === "treatment") {
      if (!observedSymptoms) newErrors.symptoms = "Please describe symptoms";
      if (!symptomDuration) newErrors.duration = "Please enter duration";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload: CreateAppointmentRequest = {
        pet_id: effectivePetId!,
        service_type: serviceType,
        appointment_date: preferredDate,
        owner_notes: notesForVet,
        previous_medical_history: previousMedicalHistory,
        reminder_id: queryReminderId || undefined,
      };

      if (serviceType === "checkup") {
        payload.checkup = {
          purpose: checkupPurpose,
          focus_area: focusArea,
        };
      } else if (serviceType === "vaccine") {
        payload.vaccine = {
          vaccine_type: vaccineType,
        };
      } else if (serviceType === "treatment") {
        payload.treatment = {
          observed_symptoms: observedSymptoms.split(",").map((s) => s.trim()),
          symptom_duration: symptomDuration,
          home_care_received: homeCareReceived,
        };
      }

      const res = await createAppointmentTrigger(payload);

      // Redirect to appointment detail
      if (res?.id) {
        navigate(`/appointments/${res.id}`);
      } else {
        navigate("/appointments");
      }
    } catch (error) {
      console.error("Failed to create appointment:", error);
      setErrors({ general: "Failed to create appointment" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <span className="material-symbols-outlined text-4xl text-primary">
              hourglass_empty
            </span>
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
            onClick={() => navigate("/appointments")}
            className="p-2 hover:bg-surface-variant rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface">
              arrow_back
            </span>
          </button>
          <h1 className="text-headline-md text-on-surface font-600 flex-1 text-center">
            Book Appointment
          </h1>
          <button className="p-2 hover:bg-surface-variant rounded-full transition-colors">
            <span className="material-symbols-outlined text-on-surface">
              info
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Pet Section */}
          <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6">
            <h2 className="text-title-lg font-semibold text-on-surface mb-4">
              Select Pet *
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  type="button"
                  disabled={!!queryPetId}
                  onClick={() => {
                    setSelectedPetId(pet.id);
                    setErrors({ ...errors, pet: "" });
                  }}
                  className={`rounded-2xl border-2 p-4 text-left transition ${
                    effectivePetId === pet.id
                      ? "border-primary bg-primary/5"
                      : "border-surface-variant bg-surface hover:border-primary/50"
                  } ${queryPetId ? "opacity-80 cursor-not-allowed" : ""}`}
                >
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
                          {pet.species === "dog"
                            ? "🐕"
                            : pet.species === "cat"
                              ? "🐈"
                              : "🐾"}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface">
                        {pet.name}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {pet.species}
                      </p>
                    </div>
                  </div>
                  {effectivePetId === pet.id && (
                    <div className="absolute top-2 right-2">
                      <span className="material-symbols-outlined text-primary">
                        check_circle
                      </span>
                    </div>
                  )}
                </button>
              ))}

              {/* Add Pet Button */}
              <button
                type="button"
                onClick={() => navigate("/add-pet")}
                className="rounded-2xl border-2 border-dashed border-surface-variant bg-surface hover:border-primary/50 p-4 text-center transition flex flex-col items-center justify-center gap-3"
              >
                <div className="w-16 h-16 rounded-xl bg-surface-variant flex items-center justify-center text-2xl font-bold text-primary">
                  +
                </div>
                <p className="font-semibold text-on-surface text-sm">Add Pet</p>
              </button>
            </div>
            {errors.pet && (
              <p className="text-error text-body-sm mt-2">{errors.pet}</p>
            )}
          </div>

          {/* Service Type Section */}
          <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6">
            <h2 className="text-title-lg font-semibold text-on-surface mb-4">
              Service Type *
            </h2>
            <div className="space-y-3">
              {(["vaccine", "checkup", "treatment"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  disabled={!!queryServiceType}
                  onClick={() => {
                    setServiceType(type);
                    setErrors({ ...errors, service: "" });
                  }}
                  className={`w-full rounded-2xl border-2 p-4 text-left transition flex items-center justify-between ${
                    serviceType === type
                      ? "border-primary bg-primary/5"
                      : "border-surface-variant bg-surface hover:border-primary/50"
                  } ${queryServiceType ? "opacity-80 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        serviceType === type
                          ? "bg-primary/10 text-primary"
                          : "bg-surface-variant text-on-surface-variant"
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        {serviceConfig[type].icon}
                      </span>
                    </div>
                    <div>
                      <p
                        className={`font-semibold ${
                          serviceType === type
                            ? "text-on-surface"
                            : "text-on-surface"
                        }`}
                      >
                        {serviceConfig[type].label}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {serviceConfig[type].description}
                      </p>
                    </div>
                  </div>
                  {serviceType === type && (
                    <span className="material-symbols-outlined text-primary fill-1">
                      radio_button_checked
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Fields Based on Service Type */}
          {serviceType === "checkup" && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="material-symbols-outlined text-blue-600 mt-1">
                  info
                </span>
                <div>
                  <p className="font-semibold text-blue-900 text-sm">
                    Checkup Details
                  </p>
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
                      setErrors({ ...errors, purpose: "" });
                    }}
                    className={`w-full rounded-xl border-2 px-4 py-3 bg-white text-on-surface transition ${
                      errors.purpose
                        ? "border-error"
                        : checkupPurpose
                          ? "border-primary"
                          : "border-surface-variant"
                    }`}
                  >
                    <option value="">Select purpose...</option>
                    <option value="routine">Routine</option>
                    <option value="skin">Skin</option>
                    <option value="dental">Dental</option>
                    <option value="behavioral">Behavioral</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.purpose && (
                    <p className="text-error text-body-sm mt-2">
                      {errors.purpose}
                    </p>
                  )}
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
                      setErrors({ ...errors, focus: "" });
                    }}
                    placeholder="e.g., Check right ear"
                    className={`w-full rounded-xl border-2 px-4 py-3 bg-white text-on-surface placeholder-on-surface-variant transition ${
                      errors.focus
                        ? "border-error"
                        : focusArea
                          ? "border-primary"
                          : "border-surface-variant"
                    }`}
                  />
                  {errors.focus && (
                    <p className="text-error text-body-sm mt-2">
                      {errors.focus}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {serviceType === "vaccine" && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="material-symbols-outlined text-blue-600 mt-1">
                  vaccines
                </span>
                <div>
                  <p className="font-semibold text-blue-900 text-sm">
                    Vaccine Details
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-label-sm font-semibold text-on-surface mb-2">
                    Vaccine Type *
                  </label>
                  <input
                    type="text"
                    value={vaccineType}
                    onChange={(e) => {
                      setVaccineType(e.target.value);
                      setErrors({ ...errors, vaccine_type: "" });
                    }}
                    placeholder="e.g., Rabies, DHPP"
                    className={`w-full rounded-xl border-2 px-4 py-3 bg-white text-on-surface placeholder-on-surface-variant transition ${
                      errors.vaccine_type
                        ? "border-error"
                        : vaccineType
                          ? "border-primary"
                          : "border-surface-variant"
                    }`}
                  />
                  {errors.vaccine_type && (
                    <p className="text-error text-body-sm mt-2">
                      {errors.vaccine_type}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {serviceType === "treatment" && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="material-symbols-outlined text-blue-600 mt-1">
                  healing
                </span>
                <div>
                  <p className="font-semibold text-blue-900 text-sm">
                    Treatment Details
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-label-sm font-semibold text-on-surface mb-2">
                    Symptoms *
                  </label>
                  <textarea
                    value={observedSymptoms}
                    onChange={(e) => {
                      setObservedSymptoms(e.target.value);
                      setErrors({ ...errors, symptoms: "" });
                    }}
                    placeholder="List symptoms, separate by comma (e.g. Cough, Fever)"
                    rows={3}
                    className={`w-full rounded-xl border-2 px-4 py-3 bg-white text-on-surface placeholder-on-surface-variant transition ${
                      errors.symptoms
                        ? "border-error"
                        : observedSymptoms
                          ? "border-primary"
                          : "border-surface-variant"
                    }`}
                  />
                  {errors.symptoms && (
                    <p className="text-error text-body-sm mt-2">
                      {errors.symptoms}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-label-sm font-semibold text-on-surface mb-2">
                    Symptom Duration *
                  </label>
                  <input
                    type="text"
                    value={symptomDuration}
                    onChange={(e) => {
                      setSymptomDuration(e.target.value);
                      setErrors({ ...errors, duration: "" });
                    }}
                    placeholder="e.g. 2 days"
                    className={`w-full rounded-xl border-2 px-4 py-3 bg-white text-on-surface placeholder-on-surface-variant transition ${
                      errors.duration
                        ? "border-error"
                        : symptomDuration
                          ? "border-primary"
                          : "border-surface-variant"
                    }`}
                  />
                  {errors.duration && (
                    <p className="text-error text-body-sm mt-2">
                      {errors.duration}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="homeCareReceived"
                    checked={homeCareReceived}
                    onChange={(e) => setHomeCareReceived(e.target.checked)}
                    className="w-5 h-5 rounded border-surface-variant text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="homeCareReceived"
                    className="text-body-sm text-on-surface"
                  >
                    Has received home care or first aid?
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Medical Context Section */}
          <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6">
            <h2 className="text-title-lg font-semibold text-on-surface mb-4">
              Medical Context
            </h2>
            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-2">
                Previous Medical History (Optional)
              </label>
              <textarea
                value={previousMedicalHistory}
                onChange={(e) => setPreviousMedicalHistory(e.target.value)}
                placeholder="Summarize any relevant past conditions, surgeries, or chronic issues..."
                rows={4}
                className="w-full rounded-xl border-2 border-surface-variant px-4 py-3 bg-white text-on-surface placeholder-on-surface-variant transition focus:border-primary"
              />
            </div>
          </div>

          {/* Schedule Section */}
          <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6">
            <h2 className="text-title-lg font-semibold text-on-surface mb-4">
              Schedule
            </h2>

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
                  setErrors({ ...errors, date: "" });
                }}
                className={`w-full rounded-xl border-2 px-4 py-3 bg-white text-on-surface transition ${
                  errors.date
                    ? "border-error"
                    : preferredDate
                      ? "border-primary"
                      : "border-surface-variant"
                }`}
              />
              {errors.date && (
                <p className="text-error text-body-sm mt-2">{errors.date}</p>
              )}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isCreating}
            className="w-full bg-primary text-white font-semibold py-4 rounded-2xl hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {isCreating ? "Booking..." : "Confirm Appointment"}
          </button>
        </form>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
